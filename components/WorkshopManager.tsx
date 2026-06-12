import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { ConfirmModal } from './ui/ConfirmModal';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Workshop, LanguageCode } from '../types';

interface WorkshopManagerProps {
    t: any;
    lang: LanguageCode;
    profile: any;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const PRESET_IMAGES = [
    { name: 'Group Discussion', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Classroom / Students', url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop' },
    { name: 'Coffee / Meeting', url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop' },
    { name: 'Workshop Post-its', url: 'https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?q=80&w=2074&auto=format&fit=crop' },
    { name: 'Cooperation / Hands', url: 'https://images.unsplash.com/photo-1531206714896-5dd57836c4b2?q=80&w=2070&auto=format&fit=crop' },
];

const LANGS = [
    { code: 'en', flag: '🇬🇧', label: 'English', dir: 'ltr' as const },
    { code: 'fi', flag: '🇫🇮', label: 'Finnish', dir: 'ltr' as const },
    { code: 'sv', flag: '🇸🇪', label: 'Swedish', dir: 'ltr' as const },
    { code: 'ar', flag: '🇸🇦', label: 'Arabic', dir: 'rtl' as const },
    { code: 'uk', flag: '🇺🇦', label: 'Ukrainian', dir: 'ltr' as const },
];

type LangCode = 'en' | 'fi' | 'sv' | 'ar' | 'uk';

interface FormData {
    titles: Record<LangCode, string>;
    descriptions: Record<LangCode, string>;
    aiGenerated: Record<LangCode, boolean>; // tracks which were AI-filled (show badge)
    date: string;
    label: string;
    image: string;
    linkUrl: string;
    imageMode: 'preset' | 'url' | 'upload';
}

const emptyForm = (): FormData => ({
    titles: { en: '', fi: '', sv: '', ar: '', uk: '' },
    descriptions: { en: '', fi: '', sv: '', ar: '', uk: '' },
    aiGenerated: { en: false, fi: false, sv: false, ar: false, uk: false },
    date: '',
    label: 'WORKSHOP',
    image: PRESET_IMAGES[0].url,
    linkUrl: '',
    imageMode: 'preset',
});

export const WorkshopManager: React.FC<WorkshopManagerProps> = ({ t, lang, profile }) => {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<LangCode>('en');
    const [translating, setTranslating] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<FormData>(emptyForm());

    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean; title: string; message: string;
        onConfirm: () => void; isDestructive: boolean; confirmText: string;
    }>({ isOpen: false, title: '', message: '', onConfirm: () => { }, isDestructive: true, confirmText: 'Delete' });

    useEffect(() => { fetchWorkshops(); }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 4000);
    };

    const fetchWorkshops = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'workshops'), orderBy('created_at', 'desc'));
            const snap = await getDocs(q);
            setWorkshops(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workshop)));
        } catch (err) {
            console.error('Error fetching workshops:', err);
            showToast('Failed to fetch workshops', 'error');
        }
        setLoading(false);
    };

    const handleOpenAdd = () => {
        setFormData(emptyForm());
        setEditingId(null);
        setActiveTab('en');
        setShowForm(true);
    };

    const handleOpenEdit = (w: Workshop) => {
        setFormData({
            titles: {
                en: w.title.en || '',
                fi: w.title.fi || '',
                sv: w.title.sv || '',
                ar: w.title.ar || '',
                uk: w.title.uk || '',
            },
            descriptions: {
                en: w.description?.en || '',
                fi: w.description?.fi || '',
                sv: w.description?.sv || '',
                ar: w.description?.ar || '',
                uk: w.description?.uk || '',
            },
            aiGenerated: { en: false, fi: false, sv: false, ar: false, uk: false },
            date: w.date || '',
            label: w.label || 'WORKSHOP',
            image: w.image || PRESET_IMAGES[0].url,
            linkUrl: w.linkUrl || '',
            imageMode: 'url',
        });
        setEditingId(w.id || null);
        setActiveTab('en');
        setShowForm(true);
    };

    // --- AI Translation ---
    const handleAutoTranslate = async (targetLang?: LangCode) => {
        if (!formData.titles.en.trim()) {
            showToast('Please enter an English title first.', 'error');
            return;
        }
        if (!GEMINI_API_KEY) {
            showToast('Gemini API key not set in .env.local (VITE_GEMINI_API_KEY)', 'error');
            return;
        }

        setTranslating(true);
        try {
            const langs = targetLang
                ? [targetLang]
                : (['fi', 'sv', 'ar', 'uk'] as LangCode[]);

            const langNames: Record<LangCode, string> = {
                en: 'English', fi: 'Finnish', sv: 'Swedish', ar: 'Arabic', uk: 'Ukrainian'
            };

            const prompt = `You are a professional translator. Translate the following workshop title and description from English into: ${langs.map(l => langNames[l]).join(', ')}.
Return ONLY valid JSON with no markdown, no explanation. Keys: ${langs.map(l => `"${l}_title", "${l}_desc"`).join(', ')}.
English title: "${formData.titles.en}"
English description: "${formData.descriptions.en || '(no description)'}"`;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.2 }
                    })
                }
            );

            if (!res.ok) {
                const errBody = await res.json();
                throw new Error(errBody.error?.message || `HTTP ${res.status}`);
            }

            const data = await res.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
            // Strip markdown code fences if present
            const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            const newTitles = { ...formData.titles };
            const newDescs = { ...formData.descriptions };
            const newAi = { ...formData.aiGenerated };

            for (const l of langs) {
                if (parsed[`${l}_title`]) { newTitles[l] = parsed[`${l}_title`]; newAi[l] = true; }
                if (parsed[`${l}_desc`]) { newDescs[l] = parsed[`${l}_desc`]; }
            }

            setFormData(prev => ({ ...prev, titles: newTitles, descriptions: newDescs, aiGenerated: newAi }));
            showToast(targetLang ? `${langNames[targetLang]} translation done!` : 'All languages translated!');
        } catch (err: any) {
            console.error('Translation error:', err);
            showToast(`Translation failed: ${err.message}`, 'error');
        }
        setTranslating(false);
    };

    // --- Image Upload ---
    const handleFileUpload = (file: File) => {
        if (!file.type.startsWith('image/')) {
            showToast('Please select an image file.', 'error');
            return;
        }
        const storageRef = ref(storage, `workshops/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        setUploadProgress(0);
        uploadTask.on('state_changed',
            (snapshot) => {
                setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100));
            },
            (err) => {
                showToast(`Upload failed: ${err.message}`, 'error');
                setUploadProgress(null);
            },
            async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                setFormData(prev => ({ ...prev, image: url }));
                setUploadProgress(null);
                showToast('Image uploaded!');
            }
        );
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileUpload(file);
    };

    // --- Save ---
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.titles.en.trim() || !formData.date.trim() || !formData.image.trim()) {
            showToast('Please fill in English title, date, and image.', 'error');
            return;
        }
        setSaving(true);

        const workshopData: Partial<Workshop> = {
            title: {
                en: formData.titles.en.trim(),
                fi: formData.titles.fi.trim() || formData.titles.en.trim(),
                sv: formData.titles.sv.trim() || formData.titles.en.trim(),
                ar: formData.titles.ar.trim() || "",
                uk: formData.titles.uk.trim() || "",
            },
            description: {
                en: formData.descriptions.en.trim(),
                fi: formData.descriptions.fi.trim(),
                sv: formData.descriptions.sv.trim(),
                ar: formData.descriptions.ar.trim(),
                uk: formData.descriptions.uk.trim(),
            },
            date: formData.date.trim().toUpperCase(),
            label: formData.label.trim().toUpperCase(),
            image: formData.image.trim(),
            linkUrl: formData.linkUrl.trim() || "",
        };

        try {
            if (editingId) {
                await updateDoc(doc(db, 'workshops', editingId), { ...workshopData, updated_at: serverTimestamp() });
                showToast('Workshop updated successfully!');
            } else {
                await addDoc(collection(db, 'workshops'), { ...workshopData, created_at: serverTimestamp() });
                showToast('Workshop created successfully!');
            }
            setShowForm(false);
            fetchWorkshops();
        } catch (err: any) {
            console.error('Error saving workshop:', err);
            showToast(`Save failed: ${err.message}`, 'error');
        }
        setSaving(false);
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Workshop',
            message: 'Are you sure you want to permanently delete this workshop?',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'workshops', id));
                    showToast('Workshop deleted successfully!');
                    fetchWorkshops();
                } catch (err: any) {
                    showToast(`Delete failed: ${err.message}`, 'error');
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const setField = (field: 'titles' | 'descriptions', lc: LangCode, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: { ...prev[field], [lc]: value },
            // clear AI badge when user manually edits
            aiGenerated: field === 'titles' ? { ...prev.aiGenerated, [lc]: false } : prev.aiGenerated
        }));
    };

    const canTranslate = !!formData.titles.en.trim() && !!GEMINI_API_KEY;

    return (
        <div className="space-y-6 relative">
            {/* Toast */}
            {notification && (
                <div className={`fixed top-6 right-6 z-[21000] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border transition-all ${notification.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                        : 'bg-red-50 text-red-800 border-red-100'
                    }`}>
                    <span className="material-symbols-outlined text-xl">
                        {notification.type === 'success' ? 'check_circle' : 'error'}
                    </span>
                    <span className="text-sm font-semibold">{notification.message}</span>
                </div>
            )}

            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-900 uppercase">
                    {lang === 'sv' ? 'Hantera Workshops' : lang === 'fi' ? 'Hallitse Työpajoja' : 'Manage Workshops'}
                </h2>
                {!showForm && (
                    <button
                        onClick={handleOpenAdd}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide shadow-lg shadow-primary/20 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Create Workshop
                    </button>
                )}
            </div>

            {showForm ? (
                <form onSubmit={handleSubmit} className="bg-white p-6 lg:p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-900 uppercase tracking-tight">
                            {editingId ? 'Edit Workshop' : 'Create New Workshop'}
                        </h3>
                        {/* Auto-translate all button */}
                        <button
                            type="button"
                            disabled={!canTranslate || translating}
                            onClick={() => handleAutoTranslate()}
                            title={!GEMINI_API_KEY ? 'Add VITE_GEMINI_API_KEY to .env.local to enable' : ''}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all ${canTranslate
                                    ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {translating ? (
                                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                            )}
                            {translating ? 'Translating...' : 'Auto-translate All'}
                        </button>
                    </div>

                    {/* ── Language Tabs ── */}
                    <div className="space-y-4">
                        {/* Tab bar */}
                        <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit">
                            {LANGS.map(l => (
                                <button
                                    key={l.code}
                                    type="button"
                                    onClick={() => setActiveTab(l.code as LangCode)}
                                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all ${activeTab === l.code
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <span>{l.flag}</span>
                                    <span className="hidden sm:block">{l.code.toUpperCase()}</span>
                                    {/* AI badge dot */}
                                    {formData.aiGenerated[l.code as LangCode] && (
                                        <span className="absolute -top-0.5 -right-0.5 size-2 bg-violet-500 rounded-full" title="AI generated — review suggested" />
                                    )}
                                    {/* filled indicator */}
                                    {l.code !== 'en' && formData.titles[l.code as LangCode] && !formData.aiGenerated[l.code as LangCode] && (
                                        <span className="absolute -top-0.5 -right-0.5 size-2 bg-emerald-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab legend */}
                        <div className="flex items-center gap-4 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet-500 inline-block" /> AI generated — review</span>
                            <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-emerald-500 inline-block" /> Manually edited</span>
                        </div>

                        {/* Active tab content */}
                        {LANGS.map(l => {
                            const lc = l.code as LangCode;
                            const isActive = activeTab === lc;
                            if (!isActive) return null;
                            return (
                                <div key={lc} className="space-y-4 animate-in fade-in duration-200">
                                    {/* AI badge for non-English AI-filled tabs */}
                                    {lc !== 'en' && formData.aiGenerated[lc] && (
                                        <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 border border-violet-100 rounded-xl text-xs font-semibold text-violet-700">
                                            <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                            AI translated — please review and correct if needed
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                            Title {lc === 'en' ? '*' : ''}
                                            {lc === 'en' && <span className="text-slate-400 font-normal ml-2">(required — other languages fall back to this)</span>}
                                        </label>
                                        <input
                                            type="text"
                                            required={lc === 'en'}
                                            dir={l.dir}
                                            value={formData.titles[lc]}
                                            onChange={e => setField('titles', lc, e.target.value)}
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                            placeholder={lc === 'en' ? 'Enter workshop title in English...' : `Title in ${l.label} (auto-translated)`}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                                            {lc !== 'en' && canTranslate && (
                                                <button
                                                    type="button"
                                                    disabled={translating}
                                                    onClick={() => handleAutoTranslate(lc)}
                                                    className="flex items-center gap-1 text-[10px] font-semibold text-violet-600 uppercase tracking-wide hover:text-violet-800 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-xs">refresh</span>
                                                    Re-translate this tab
                                                </button>
                                            )}
                                        </div>
                                        <textarea
                                            rows={4}
                                            dir={l.dir}
                                            value={formData.descriptions[lc]}
                                            onChange={e => setFormData(prev => ({ ...prev, descriptions: { ...prev.descriptions, [lc]: e.target.value } }))}
                                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium resize-none"
                                            placeholder={lc === 'en' ? 'Short description of this workshop session...' : `Description in ${l.label} (auto-translated)`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ── Meta Fields ── */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Label *</label>
                            <input
                                type="text"
                                required
                                value={formData.label}
                                onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                placeholder="e.g. WORKSHOP, EVENT"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date *</label>
                            <input
                                type="text"
                                required
                                value={formData.date}
                                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                placeholder="e.g. MAY 2026"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Registration Link</label>
                            <input
                                type="url"
                                value={formData.linkUrl}
                                onChange={e => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                placeholder="https://..."
                            />
                        </div>
                    </div>

                    {/* ── Image Section ── */}
                    <div className="space-y-4 border-t border-slate-100 pt-6">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Featured Image *</label>
                            {/* Mode toggle */}
                            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
                                {([
                                    { mode: 'preset', icon: 'photo_library', label: 'Presets' },
                                    { mode: 'url', icon: 'link', label: 'URL' },
                                    { mode: 'upload', icon: 'upload', label: 'Upload' },
                                ] as const).map(m => (
                                    <button
                                        key={m.mode}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, imageMode: m.mode }))}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide transition-all ${formData.imageMode === m.mode
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-xs">{m.icon}</span>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Image preview */}
                        {formData.image && (
                            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-w-xs">
                                <img src={formData.image} className="w-full h-full object-cover" alt="Preview" onError={(e: any) => e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Image+Not+Found'} />
                                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <span className="text-white text-xs font-semibold uppercase tracking-wide bg-black/50 px-3 py-1.5 rounded-full">Current Image</span>
                                </div>
                            </div>
                        )}

                        {/* Preset mode */}
                        {formData.imageMode === 'preset' && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                {PRESET_IMAGES.map(img => (
                                    <div
                                        key={img.name}
                                        onClick={() => setFormData(prev => ({ ...prev, image: img.url }))}
                                        className={`relative aspect-video rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 ${formData.image === img.url ? 'border-primary shadow-lg ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img.url} className="w-full h-full object-cover" alt={img.name} />
                                        <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1 text-center">
                                            <span className="text-[8px] font-bold text-white uppercase">{img.name}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* URL mode */}
                        {formData.imageMode === 'url' && (
                            <input
                                type="text"
                                required
                                value={formData.image}
                                onChange={e => setFormData(prev => ({ ...prev, image: e.target.value }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all font-medium"
                                placeholder="Paste image URL..."
                            />
                        )}

                        {/* Upload mode */}
                        {formData.imageMode === 'upload' && (
                            <div className="space-y-3">
                                <div
                                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative flex flex-col items-center justify-center gap-3 p-10 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className={`material-symbols-outlined text-4xl ${isDragging ? 'text-primary' : 'text-slate-300'}`}>cloud_upload</span>
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-slate-700">Drop image here or click to browse</p>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP, GIF — uploaded to Firebase Storage</p>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={e => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
                                    />
                                </div>
                                {/* Upload progress */}
                                {uploadProgress !== null && (
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold uppercase hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || uploadProgress !== null}
                            className="bg-primary text-white px-8 py-3 rounded-xl text-xs font-semibold uppercase tracking-wide hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Workshop'}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full py-20 text-center text-slate-300">
                            <div className="size-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                            <span className="text-xs font-semibold uppercase tracking-widest">Loading workshops...</span>
                        </div>
                    ) : workshops.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-slate-300 font-semibold uppercase tracking-wide">
                            No workshops found. Create one to get started!
                        </div>
                    ) : (
                        workshops.map(w => {
                            const title = w.title[lang] || w.title.en || '';
                            const desc = w.description?.[lang] || w.description?.en || '';
                            return (
                                <div key={w.id} className="relative bg-white p-5 rounded-[2rem] border border-slate-200 flex flex-col gap-4 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                                    <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 relative">
                                        <img src={w.image} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Image+Not+Found'} alt={title} />
                                        <div className="absolute top-4 left-4 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg shadow-primary/20">
                                            {w.label || 'WORKSHOP'}
                                        </div>
                                    </div>
                                    <div className="flex-grow flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 text-base leading-tight mb-1">{title}</h4>
                                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">{w.date}</p>
                                            {desc && <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{desc}</p>}
                                            {w.linkUrl && (
                                                <a href={w.linkUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-blue-600 hover:underline mt-2 inline-flex items-center gap-1">
                                                    Info Link
                                                    <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex gap-2 mt-4 border-t border-slate-100 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenEdit(w)} className="flex-1 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold uppercase hover:bg-slate-100 transition-all">Edit</button>
                                            <button onClick={() => handleDelete(w.id!)} className="py-2 px-3 border border-red-100 text-red-500 rounded-xl text-xs font-semibold uppercase hover:bg-red-50 transition-all">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                isDestructive={confirmModal.isDestructive}
            />
        </div>
    );
};
