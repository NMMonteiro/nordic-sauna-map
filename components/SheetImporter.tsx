import React, { useState, useCallback, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';

// ─── Column Mapping Configuration ──────────────────────────────────────────
// Each key is our internal field name.
// The array contains possible header names found in the spreadsheet.
const FIELD_DEFINITIONS = [
    { key: 'sheet_id', signals: ['id', 'sheet_id', 'no.', 'number'] },
    { key: 'name', signals: ['sauna_name', 'sauna name', 'name', 'title'] },
    { key: 'sauna_type', signals: ['sauna_type', 'sauna type', 'type', 'category'] },
    { key: 'country', signals: ['country', 'land'] },
    { key: 'region', signals: ['region', 'city', 'area', 'location'] },
    { key: 'latitude', signals: ['latitude', 'lat'] },
    { key: 'longitude', signals: ['longitude', 'lng', 'long'] },
    { key: 'coordinates_raw', signals: ['coordinates', 'coords', 'google maps', 'maps format'] },
    { key: 'description_short', signals: ['description_short', 'short_description', 'short description', 'summary'] },
    { key: 'text_en', signals: ['text_eng', 'text_en', 'english description', 'english'] },
    { key: 'text_sv', signals: ['text_swe', 'text_sv', 'swedish description', 'swedish'] },
    { key: 'text_fi', signals: ['text_fin', 'text_fi', 'finnish description', 'finnish'] },
    { key: 'website', signals: ['website', 'link', 'web', 'website_link'] },
    { key: 'featured_image', signals: ['featured image', 'image_url', 'featured image_url', 'main image', 'photo'] },
    { key: 'gallery_raw', signals: ['gallery', 'extra images', 'extra images_url_gallery', 'images'] },
    { key: 'video_url', signals: ['video', 'youtube', 'video_url'] },
    { key: 'audio_url', signals: ['audio', 'podcast', 'audio_clip_link'] },
    { key: 'verified', signals: ['verified', 'status'] },
];

type ParsedRow = Record<string, string>;

// ─── CSV Parser ──────────────────────────────────────────────────────────────
function parseCSV(text: string): { rows: ParsedRow[], headers: string[], mapping: Record<string, string> } {
    const rows: string[][] = [];
    let currentVal = '';
    let inQuotes = false;
    let currentRow: string[] = [];

    // Clean up carriage returns
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < cleanText.length; i++) {
        const ch = cleanText[i];
        
        if (ch === '"') {
            // Check for escaped double quotes inside quotes
            if (inQuotes && cleanText[i + 1] === '"') {
                currentVal += '"';
                i++; // skip next quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (ch === ',' && !inQuotes) {
            currentRow.push(currentVal.trim());
            currentVal = '';
        } else if (ch === '\n' && !inQuotes) {
            currentRow.push(currentVal.trim());
            rows.push(currentRow);
            currentRow = [];
            currentVal = '';
        } else {
            currentVal += ch;
        }
    }
    // Push last cell/row if any
    if (currentVal || currentRow.length > 0) {
        currentRow.push(currentVal.trim());
        rows.push(currentRow);
    }

    // Find the header row by checking which row contains the most keyword matches
    let bestHeaderIdx = -1;
    let maxSignals = 0;
    let detectedHeaders: string[] = [];

    for (let i = 0; i < Math.min(rows.length, 50); i++) {
        const cols = rows[i].map(c => c.toLowerCase().trim());
        let signalsFound = 0;
        cols.forEach(col => {
            if (!col) return;
            const matches = FIELD_DEFINITIONS.some(def => 
                def.signals.some(sig => col === sig || col.includes(sig))
            );
            if (matches) signalsFound++;
        });

        if (signalsFound > maxSignals) {
            maxSignals = signalsFound;
            bestHeaderIdx = i;
            detectedHeaders = cols;
        }
    }

    if (bestHeaderIdx === -1) return { rows: [], headers: [], mapping: {} };

    // Build header index mapping
    const mapping: Record<string, string> = {};
    const reverseMapping: Record<string, string> = {};

    detectedHeaders.forEach((h, idx) => {
        if (!h) return;
        
        // 1. Try exact matches first to prevent substring collision
        let matchedKey = FIELD_DEFINITIONS.find(def => 
            def.signals.some(sig => h === sig)
        )?.key;

        // 2. Fallback to substring matching if no exact match is found
        if (!matchedKey) {
            matchedKey = FIELD_DEFINITIONS.find(def => 
                def.signals.some(sig => h.includes(sig))
            )?.key;
        }

        if (matchedKey) {
            mapping[idx] = matchedKey;
            reverseMapping[matchedKey] = rows[bestHeaderIdx][idx];
        }
    });

    const parsedRows: ParsedRow[] = [];
    const nameIdx = detectedHeaders.findIndex(h => mapping[detectedHeaders.indexOf(h)] === 'name');

    for (let i = bestHeaderIdx + 1; i < rows.length; i++) {
        const cols = rows[i];
        if (cols.length === 0 || !cols.join('').trim() || (nameIdx >= 0 && !cols[nameIdx]?.trim())) continue;
        
        const row: ParsedRow = {};
        cols.forEach((val, idx) => {
            const key = mapping[idx] || `extra_${idx}`;
            row[key] = val.trim();
        });
        parsedRows.push(row);
    }

    return { rows: parsedRows, headers: rows[bestHeaderIdx], mapping: reverseMapping };
}

// ─── Google Drive URL Resolver ───────────────────────────────────────────────
function resolveGoogleDriveUrl(url: string): string {
    if (!url) return '';
    const driveFileMatch = url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)([a-zA-Z0-9_-]{25,})/);
    if (driveFileMatch && driveFileMatch[1]) {
        const id = driveFileMatch[1];
        return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return url;
}

// ─── Firestore Shape Builder ─────────────────────────────────────────────────
function toFirestoreDoc(r: ParsedRow) {
    let lat = 0, lng = 0;

    // Priority 1: Separate Lat/Lng columns
    if (r['latitude'] && r['longitude']) {
        lat = parseFloat(r['latitude'].replace(',', '.')) || 0;
        lng = parseFloat(r['longitude'].replace(',', '.')) || 0;
    } 
    // Priority 2: Combined coordinates string
    else if (r['coordinates_raw']) {
        const coordStr = r['coordinates_raw'].replace(/\s/g, '').replace(';', ',');
        const parts = coordStr.split(',');
        if (parts.length >= 2) {
            lat = parseFloat(parts[0].replace(',', '.')) || 0;
            lng = parseFloat(parts[1].replace(',', '.')) || 0;
        }
    }

    const cleanUrl = (u: string) => {
        if (!u || u === '[URL]') return '';
        let url = u.trim();
        // If it looks like a web URL but lacks http, prepend https
        if (!url.startsWith('http') && (url.startsWith('www.') || url.includes('.'))) {
            url = `https://${url}`;
        }
        if (url.startsWith('http')) {
            return resolveGoogleDriveUrl(url);
        }
        return '';
    };
    
    const galleryUrls = (r['gallery_raw'] || '')
        .split(/[,;\n\r]/)
        .map(u => u.trim())
        .filter(u => u && u !== '[URL]')
        .map(cleanUrl)
        .filter(u => u.startsWith('http'));

    const name = r['name'] || 'Unnamed Sauna';

    return {
        sauna_id: r['sheet_id'] ? `sheet_${r['sheet_id']}` : `imp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        status: 'approved',
        country: r['country'] || 'Sweden',
        coordinates: { lat, lng },
        metadata: {
            country: r['country'] || 'Sweden',
            region: r['region'] || '',
            type: r['sauna_type'] || '',
            verified: (r['verified'] || '').toLowerCase() === 'true',
        },
        content: {
            en: {
                name,
                short_description: r['description_short'] || '',
                description: r['text_en'] || r['description_short'] || '',
                etiquette: '',
            },
            sv: {
                name,
                short_description: r['description_short'] || '',
                description: r['text_sv'] || r['description_short'] || '',
                etiquette: '',
            },
            fi: {
                name,
                short_description: r['description_short'] || '',
                description: r['text_fi'] || r['description_short'] || '',
                etiquette: '',
            },
        },
        media: {
            featured_image: cleanUrl(r['featured_image']),
            images: galleryUrls,
            audio_interviews: r['audio_url'] && cleanUrl(r['audio_url'])
                ? [{ title: 'Audio', url: cleanUrl(r['audio_url']) }]
                : [],
            video_clips: r['video_url'] && cleanUrl(r['video_url'])
                ? [{ title: 'Video', url: cleanUrl(r['video_url']) }]
                : [],
        },
        contact: {
            website: cleanUrl(r['website']),
        },
        created_at: serverTimestamp(),
        source: 'sheet_import',
    };
}

// ─── Main Component ──────────────────────────────────────────────────────────
interface Props {
    onClose: () => void;
    onSuccess: (count: number) => void;
}

type Step = 'upload' | 'preview' | 'importing' | 'done';

export const SheetImporter: React.FC<Props> = ({ onClose, onSuccess }) => {
    const [step, setStep] = useState<Step>('upload');
    const [data, setData] = useState<{ rows: ParsedRow[], mapping: Record<string, string> }>({ rows: [], mapping: {} });
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);
    const [importedCount, setImportedCount] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const [sheetUrl, setSheetUrl] = useState('');
    const [fetchingUrl, setFetchingUrl] = useState(false);
    const [deleteExisting, setDeleteExisting] = useState(false);

    const handleUrlImport = async (url: string) => {
        if (!url) return;
        setFetchingUrl(true);
        try {
            const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            if (!match) {
                alert('Invalid Google Sheet URL format. Please make sure the URL contains "/d/[SpreadsheetID]".');
                setFetchingUrl(false);
                return;
            }
            const id = match[1];
            let exportUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`;
            const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
            if (gidMatch) {
                exportUrl += `&gid=${gidMatch[1]}`;
            }

            const res = await fetch(exportUrl);
            if (!res.ok) {
                throw new Error(`Failed to fetch spreadsheet. Status: ${res.status}`);
            }
            const text = await res.text();
            const result = parseCSV(text);
            if (result.rows.length === 0) {
                alert('No data rows detected. Please check if your Google Sheet is shared as public (Anyone with the link can view) and has the correct headers.');
                setFetchingUrl(false);
                return;
            }
            setData({ rows: result.rows, mapping: result.mapping });
            setStep('preview');
        } catch (err: any) {
            alert('Error fetching Google Sheet: ' + err.message + '\n\nPlease ensure your Google Sheet has sharing set to "Anyone with the link can view".');
        } finally {
            setFetchingUrl(false);
        }
    };

    const handleFile = (file: File) => {
        const reader = new FileReader();
        reader.onload = e => {
            const result = parseCSV(e.target?.result as string);
            if (result.rows.length === 0) {
                alert('No data rows detected. Please check if your CSV has the correct headers.');
                return;
            }
            setData({ rows: result.rows, mapping: result.mapping });
            setStep('preview');
        };
        reader.readAsText(file, 'utf-8');
    };

    const handleImport = async () => {
        setStep('importing');
        setProgress(0);
        let count = 0;
        const errs: string[] = [];

        try {
            // Clean Import is permanently disabled to prevent data loss.
            // Data will only be updated or appended.
        } catch (err: any) {
            errs.push(`Error cleaning existing saunas: ${err.message}`);
        }

        for (let i = 0; i < data.rows.length; i++) {
            const row = data.rows[i];
            try {
                const docData = toFirestoreDoc(row);
                
                // If we are not doing a clean import, we look for existing sauna_id to update
                if (!deleteExisting && row['sheet_id']) {
                    const q = query(collection(db, 'saunas'), where('sauna_id', '==', `sheet_${row['sheet_id']}`));
                    const snap = await getDocs(q);
                    if (!snap.empty) {
                        const existingDoc = snap.docs[0].data();
                        const docRef = snap.docs[0].ref;
                        
                        // Preserve existing media if the CSV doesn't provide new media
                        const newMedia = docData.media as any;
                        const oldMedia = existingDoc.media || {};
                        
                        if (!newMedia.featured_image && oldMedia.featured_image) {
                            newMedia.featured_image = oldMedia.featured_image;
                        }
                        if ((!newMedia.images || newMedia.images.length === 0) && oldMedia.images?.length > 0) {
                            newMedia.images = oldMedia.images;
                        }
                        if ((!newMedia.video_clips || newMedia.video_clips.length === 0) && oldMedia.video_clips?.length > 0) {
                            newMedia.video_clips = oldMedia.video_clips;
                        }
                        if ((!newMedia.audio_interviews || newMedia.audio_interviews.length === 0) && oldMedia.audio_interviews?.length > 0) {
                            newMedia.audio_interviews = oldMedia.audio_interviews;
                        }
                        
                        docData.media = newMedia;

                        await updateDoc(docRef, docData as any);
                        count++;
                        continue;
                    }
                }

                await addDoc(collection(db, 'saunas'), docData);
                count++;
            } catch (err: any) {
                errs.push(`Row ${row['sheet_id'] || i}: ${err.message}`);
            }
            setProgress(Math.round(((i + 1) / data.rows.length) * 100));
            if ((i + 1) % 5 === 0) await new Promise(r => setTimeout(r, 105));
        }

        setImportedCount(count);
        setErrors(errs);
        setStep('done');
        if (count > 0) onSuccess(count);
    };

    return (
        <div className="fixed inset-0 z-[30000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 shrink-0 bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">database</span>
                            Data Ingestion Engine
                        </h2>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            {step === 'upload' && 'Upload CSV exported from Google Sheets (Table1)'}
                            {step === 'preview' && `${data.rows.length} records detected — Validation Ready`}
                            {step === 'importing' && `Ingesting records… ${progress}%`}
                            {step === 'done' && `Ingestion Complete — ${importedCount} records added`}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-8 py-8">
                    {step === 'upload' && (
                        <div className="space-y-8 max-w-lg mx-auto py-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-black text-slate-800">Ready to sync?</h3>
                                <p className="text-sm text-slate-500 font-medium">Import your master sauna data directly using one of the methods below.</p>
                            </div>

                            {/* Option 1: Google Sheets URL Direct Ingest */}
                            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-6 space-y-4 shadow-sm">
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-primary">link</span>
                                    Method A: Paste Google Sheet Link
                                </h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="https://docs.google.com/spreadsheets/d/..."
                                        value={sheetUrl}
                                        onChange={e => setSheetUrl(e.target.value)}
                                        className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                    />
                                    <button
                                        onClick={() => handleUrlImport(sheetUrl)}
                                        disabled={fetchingUrl || !sheetUrl.trim()}
                                        className="bg-primary text-white font-black text-xs px-6 py-3 rounded-2xl hover:bg-primary/95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary/10 flex items-center gap-1.5 whitespace-nowrap"
                                    >
                                        {fetchingUrl ? (
                                            <>
                                                <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                Fetching...
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Fetch Data
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                    Note: Make sure your sheet is set to **"Anyone with the link can view"** so the platform can read it.
                                </p>
                            </div>

                            <div className="relative flex py-2 items-center text-xs text-slate-300 font-bold uppercase tracking-widest justify-center">
                                <span className="absolute left-0 right-0 h-px bg-slate-200" />
                                <span className="relative bg-white px-4">OR</span>
                            </div>

                            {/* Option 2: Drag and Drop CSV */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider px-1 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm text-primary">upload_file</span>
                                    Method B: Drag & Drop CSV File
                                </h4>
                                <div
                                    onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
                                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                                    onDragLeave={() => setDragOver(false)}
                                    onClick={() => document.getElementById('csv-file')?.click()}
                                    className={`border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group ${dragOver ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50'}`}
                                >
                                    <div className="size-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-3xl text-primary">upload_file</span>
                                    </div>
                                    <p className="text-xs font-black text-slate-700">Click or drag CSV file</p>
                                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium uppercase tracking-widest">UTF-8 Encoded</p>
                                    <input id="csv-file" type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-6">
                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Records', val: data.rows.length, color: 'blue' },
                                    { label: 'Valid Coords', val: data.rows.filter(r => (r.latitude && r.longitude) || r.coordinates_raw).length, color: 'green' },
                                    { label: 'Missing Coords', val: data.rows.filter(r => !r.latitude && !r.longitude && !r.coordinates_raw).length, color: 'amber' },
                                    { label: 'Websites Found', val: data.rows.filter(r => r.website).length, color: 'purple' },
                                ].map(s => (
                                    <div key={s.label} className={`bg-${s.color}-50 border border-${s.color}-100 rounded-2xl p-4`}>
                                        <p className={`text-[10px] font-black text-${s.color}-600 uppercase tracking-widest`}>{s.label}</p>
                                        <p className={`text-2xl font-black text-${s.color}-900 mt-1`}>{s.val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Ingestion Mode Selector */}
                            <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 flex items-center justify-between shadow-sm">
                                <div className="space-y-1">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-sm text-primary">settings_applications</span>
                                        Ingestion Mode Settings
                                    </h4>
                                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                        Choose whether to clear previously imported sheet data, or update existing records.
                                    </p>
                                </div>
                            </div>

                            {/* Mapping Check */}
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">link</span>
                                    Column Mapping Verification
                                </h4>
                                <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                                    {FIELD_DEFINITIONS.map(def => {
                                        const mappedTo = data.mapping[def.key];
                                        return (
                                            <div key={def.key} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-200/50">
                                                <span className="text-slate-500 font-bold uppercase tracking-tighter">{def.key}</span>
                                                <span className={mappedTo ? 'text-primary font-black' : 'text-slate-300 italic'}>
                                                    {mappedTo || 'Not mapped'}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Preview Table */}
                            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-[11px]" style={{ minWidth: '1000px' }}>
                                        <thead className="bg-slate-50 border-b border-slate-100">
                                            <tr>
                                                <th className="px-4 py-4 font-black text-slate-400 uppercase tracking-widest">ID</th>
                                                <th className="px-4 py-4 font-black text-slate-400 uppercase tracking-widest">Sauna Name</th>
                                                <th className="px-4 py-4 font-black text-slate-400 uppercase tracking-widest">Location</th>
                                                <th className="px-4 py-4 font-black text-slate-400 uppercase tracking-widest">Coords</th>
                                                <th className="px-4 py-4 font-black text-slate-400 uppercase tracking-widest">EN Content</th>
                                                <th className="px-4 py-4 font-black text-slate-400 uppercase tracking-widest">SV Content</th>
                                                <th className="px-4 py-4 font-black text-slate-400 uppercase tracking-widest">FI Content</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {data.rows.slice(0, 50).map((r, i) => (
                                                <tr key={i} className="hover:bg-slate-50/50 group">
                                                    <td className="px-4 py-3 text-slate-400 font-mono">{r.sheet_id || '-'}</td>
                                                    <td className="px-4 py-3 font-black text-slate-900 group-hover:text-primary transition-colors">{r.name}</td>
                                                    <td className="px-4 py-3 text-slate-500">{r.country}, {r.region}</td>
                                                    <td className="px-4 py-3">
                                                        {((r.latitude && r.longitude) || r.coordinates_raw) ? (
                                                            <span className="text-green-500 font-black">VALID</span>
                                                        ) : (
                                                            <span className="text-amber-500 font-black">MISSING</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">{r.text_en ? <span className="text-green-500">✓</span> : '-'}</td>
                                                    <td className="px-4 py-3">{r.text_sv ? <span className="text-green-500">✓</span> : '-'}</td>
                                                    <td className="px-4 py-3">{r.text_fi ? <span className="text-green-500">✓</span> : '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {data.rows.length > 50 && (
                                    <div className="bg-slate-50 px-4 py-3 text-[10px] text-slate-400 font-bold text-center uppercase tracking-widest border-t border-slate-100">
                                        Showing first 50 of {data.rows.length} records
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="py-20 flex flex-col items-center justify-center space-y-8">
                            <div className="relative size-32 flex items-center justify-center">
                                <svg className="absolute inset-0 size-full -rotate-90">
                                    <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-100" />
                                    <circle cx="64" cy="64" r="60" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray="377" strokeDashoffset={377 - (377 * progress) / 100} className="text-primary transition-all duration-300" />
                                </svg>
                                <span className="text-2xl font-black text-slate-900">{progress}%</span>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Syncing with Firestore</p>
                                <p className="text-[11px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Processing batch queue...</p>
                            </div>
                        </div>
                    )}

                    {step === 'done' && (
                        <div className="py-10 space-y-8">
                            <div className="text-center space-y-4">
                                <div className="size-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto">
                                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-slate-900">Success!</h3>
                                    <p className="text-sm text-slate-500">Successfully imported {importedCount} new sauna records.</p>
                                </div>
                            </div>

                            {errors.length > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
                                    <h4 className="text-[11px] font-black text-red-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">warning</span>
                                        {errors.length} Anomalies Detected
                                    </h4>
                                    <div className="max-h-40 overflow-y-auto space-y-2 pr-4">
                                        {errors.map((e, i) => (
                                            <p key={i} className="text-[10px] text-red-600 font-medium font-mono leading-relaxed">{e}</p>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                    <button onClick={onClose} className="text-[11px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors">
                        {step === 'done' ? 'Close Portal' : 'Cancel Operation'}
                    </button>
                    <div className="flex items-center gap-4">
                        {step === 'preview' && (
                            <>
                                <button onClick={() => setStep('upload')} className="px-6 py-3 rounded-2xl border border-slate-200 text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-all">
                                    Back
                                </button>
                                <button onClick={handleImport} className="px-8 py-3 rounded-2xl bg-primary text-white text-[12px] font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
                                    Commit Ingestion →
                                </button>
                            </>
                        )}
                        {step === 'done' && (
                            <button onClick={onClose} className="px-8 py-3 rounded-2xl bg-slate-900 text-white text-[12px] font-black hover:bg-black transition-all shadow-xl shadow-black/10">
                                Finish Process
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
