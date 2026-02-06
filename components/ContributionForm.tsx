import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { LocationPicker } from './LocationPicker';
import { cn } from '../lib/utils';

interface ContributionFormProps {
    onClose: () => void;
    lang: 'sv' | 'fi' | 'en';
    currentUser: User | null;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({ onClose, lang, currentUser }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        country: lang === 'fi' ? 'Finland' : (lang === 'sv' ? 'Sweden' : ''),
        type: '',
        story: '',
        email: '',
        lat: 64.0,
        lng: 26.0,
        images: [''],
        featuredImageIndex: 0,
        audio: [{ title: '', url: '', speaker: '' }],
        video: [{ title: '', url: '' }]
    });

    const translations = {
        title: { sv: 'Skicka in ditt bastuarv', fi: 'Lähetä saunaperintösi', en: 'Submit Your Sauna Heritage' },
        name: { sv: 'Bastuns namn', fi: 'Saunan nimi', en: 'Sauna Name' },
        location: { sv: 'Plats / Stad', fi: 'Sijainti / Kaupunki', en: 'Location / City' },
        type: { sv: 'Bastutyp', fi: 'Saunatyyppi', en: 'Sauna Type' },
        story: { sv: 'Berätta din historia', fi: 'Kerro tarinasi', en: 'Tell Your Story' },
        submit: { sv: 'Skicka bidrag', fi: 'Lähetä', en: 'Submit Contribution' },
        next: { sv: 'Nästa', fi: 'Seuraava', en: 'Next' },
        back: { sv: 'Tillbaka', fi: 'Takaisin', en: 'Back' },
        success: { sv: 'Tack för ditt bidrag!', fi: 'Kiitos osallistumisestasi!', en: 'Thank you for your contribution!' }
    };

    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio' | 'video', idx?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const folder = type === 'video' ? 'Videos' : type + 's';
        const filePath = `${folder}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('sauna-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('sauna-media')
                .getPublicUrl(filePath);

            if (type === 'image' && typeof idx === 'number') {
                updateImageField(idx, publicUrl);
            } else if (type === 'audio' && typeof idx === 'number') {
                const newAudio = [...formData.audio];
                newAudio[idx].url = publicUrl;
                setFormData({ ...formData, audio: newAudio });
            } else if (type === 'video' && typeof idx === 'number') {
                const newVideo = [...formData.video];
                newVideo[idx].url = publicUrl;
                setFormData({ ...formData, video: newVideo });
            }
        } catch (err: any) {
            alert('File upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) return;
        setSubmitting(true);
        setError(null);

        const newSauna = {
            sauna_id: `ugc_${Date.now()}`,
            coordinates: { lat: formData.lat, lng: formData.lng },
            metadata: {
                country: formData.country || (lang === 'fi' ? 'Finland' : 'Sweden'),
                region: formData.location,
                type: formData.type || 'Standard',
                submission_lang: lang
            },
            content: {
                sv: { name: formData.name, description: formData.story, etiquette: '' },
                fi: { name: formData.name, description: formData.story, etiquette: '' },
                en: { name: formData.name, description: formData.story, etiquette: '' }
            },
            media: {
                featured_image: formData.images[formData.featuredImageIndex] || formData.images[0],
                images: formData.images.filter(i => i && i.trim() !== ''),
                audio_interviews: formData.audio.filter(a => a.url && a.url.trim() !== '').map(a => ({
                    ...a,
                    title: a.title || 'Archive Recording'
                })),
                video_clips: formData.video.filter(v => v.url && v.url.trim() !== '').map(v => ({
                    ...v,
                    title: v.title || 'Video Clip'
                }))
            },
            contact: { website: '', phone: '', address: formData.location, email: formData.email },
            created_by: currentUser.id,
            status: 'pending_approval'
        };

        try {
            const { error: insertError } = await supabase
                .from('saunas')
                .insert([newSauna]);

            if (insertError) throw insertError;
            setStep(5);
        } catch (err: any) {
            console.error('Submission error:', err);
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const addImageField = () => setFormData({ ...formData, images: [...formData.images, ''] });
    const updateImageField = (idx: number, val: string) => {
        const newImages = [...formData.images];
        newImages[idx] = val;
        setFormData({ ...formData, images: newImages });
    };

    return (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/75" onClick={onClose}></div>

            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="p-6 md:p-10">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-black tracking-tight">{translations.title[lang]}</h2>
                        <button onClick={onClose} className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {step === 1 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{translations.name[lang]}</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="e.g. Sommarstugans bastu"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Country</label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                            value={formData.country}
                                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        >
                                            <option value="">Select Country...</option>
                                            <option value="Finland">Finland</option>
                                            <option value="Sweden">Sweden</option>
                                            <option value="Norway">Norway</option>
                                            <option value="Denmark">Denmark</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{translations.location[lang]}</label>
                                        <input
                                            type="text"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none"
                                            value={formData.location}
                                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                            placeholder="City / Region"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{translations.type[lang]}</label>
                                    <select
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer font-bold"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="">Select Type...</option>
                                        <option value="smoke">Smoke Sauna</option>
                                        <option value="wood">Wood-fired</option>
                                        <option value="electric">Electric</option>
                                        <option value="apartment">Apartment Sauna</option>
                                        <option value="cottage">Summer Cottage</option>
                                        <option value="tent">Tent Sauna</option>
                                        <option value="public">Public / Urban</option>
                                        <option value="iceswimming">Ice Swimming Spot</option>
                                        <option value="corporate">Corporate / Private Club</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                className="w-full bg-primary text-white font-black py-5 rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest text-xs mt-4"
                            >
                                {translations.next[lang]}
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Pinpoint Location</label>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black uppercase text-primary/60 ml-1">Quick Paste (from Google Maps)</label>
                                    <input
                                        type="text"
                                        placeholder="Paste e.g. 37.1568, -8.5262"
                                        className="w-full bg-slate-50 border-2 border-dashed border-primary/20 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary outline-none text-sm font-mono"
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const coords = val.split(',').map(v => v.trim());
                                            if (coords.length === 2) {
                                                const lat = parseFloat(coords[0]);
                                                const lng = parseFloat(coords[1]);
                                                if (!isNaN(lat) && !isNaN(lng)) {
                                                    setFormData({ ...formData, lat, lng });
                                                }
                                            }
                                        }}
                                    />
                                    <p className="text-[9px] text-slate-400 px-2 italic">Tip: Right-click a place on Google Maps to copy coordinates.</p>
                                </div>

                                <LocationPicker
                                    initialLocation={[formData.lat, formData.lng]}
                                    onLocationSelect={(lat, lng) => setFormData({ ...formData, lat, lng })}
                                />
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                                    <div className="text-[10px] font-mono font-bold text-slate-500">LAT: {formData.lat.toFixed(4)}</div>
                                    <div className="text-[10px] font-mono font-bold text-slate-500">LNG: {formData.lng.toFixed(4)}</div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(1)} className="flex-1 py-4 bg-slate-100 rounded-xl font-bold">Back</button>
                                <button onClick={() => setStep(3)} className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold">Set Coordinates</button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">{translations.story[lang]}</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none resize-none"
                                    placeholder="Describe the atmosphere, rituals or history..."
                                    value={formData.story}
                                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setStep(2)} className="flex-1 py-4 bg-slate-100 rounded-xl font-bold">Back</button>
                                <button onClick={() => setStep(4)} className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold">Next</button>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-right-4 duration-300 overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Archive Media (Upload or Link)</label>
                                    <div className="space-y-4">
                                        {formData.images.map((img, idx) => (
                                            <div key={idx} className={cn(
                                                "p-4 rounded-2xl border transition-all",
                                                formData.featuredImageIndex === idx ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-white border-slate-100"
                                            )}>
                                                <div className="flex gap-2 mb-3">
                                                    <input
                                                        className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary font-bold"
                                                        placeholder="Image URL..."
                                                        value={img}
                                                        onChange={(e) => updateImageField(idx, e.target.value)}
                                                    />
                                                    <label className="size-12 bg-white border border-slate-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors shadow-sm">
                                                        <span className="material-symbols-outlined text-slate-400">upload_file</span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', idx)} />
                                                    </label>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    {img ? (
                                                        <div className="size-20 rounded-xl overflow-hidden border border-slate-200">
                                                            <img src={img} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : <div className="size-20 bg-slate-50 rounded-xl border border-dashed border-slate-200" />}

                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData({ ...formData, featuredImageIndex: idx })}
                                                        className={cn(
                                                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                            formData.featuredImageIndex === idx
                                                                ? "bg-primary text-white shadow-lg shadow-primary/30"
                                                                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                        )}
                                                    >
                                                        {formData.featuredImageIndex === idx ? '★ Featured Image' : 'Set as Featured'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button type="button" onClick={addImageField} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all">+ Add more images</button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Audio Recording</label>
                                    {formData.audio.map((a, idx) => (
                                        <div key={idx} className="space-y-2 mb-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <input
                                                className="w-full bg-white rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary shadow-sm"
                                                placeholder="Track Title"
                                                value={a.title}
                                                onChange={(e) => {
                                                    const newAudio = [...formData.audio];
                                                    newAudio[idx].title = e.target.value;
                                                    setFormData({ ...formData, audio: newAudio });
                                                }}
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 bg-white rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary shadow-sm"
                                                    placeholder="Audio Link..."
                                                    value={a.url}
                                                    onChange={(e) => {
                                                        const newAudio = [...formData.audio];
                                                        newAudio[idx].url = e.target.value;
                                                        setFormData({ ...formData, audio: newAudio });
                                                    }}
                                                />
                                                <label className="size-12 bg-primary rounded-xl flex items-center justify-center cursor-pointer hover:bg-primary/90 shadow-lg shadow-primary/20">
                                                    <span className="material-symbols-outlined text-white">mic</span>
                                                    <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio', idx)} />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">Video Clips</label>
                                    {formData.video.map((v, idx) => (
                                        <div key={idx} className="space-y-2 mb-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                                            <input
                                                className="w-full bg-white rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary shadow-sm"
                                                placeholder="Video Title"
                                                value={v.title}
                                                onChange={(e) => {
                                                    const newVideo = [...formData.video];
                                                    newVideo[idx].title = e.target.value;
                                                    setFormData({ ...formData, video: newVideo });
                                                }}
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 bg-white rounded-xl px-4 py-3 text-sm border-none focus:ring-2 focus:ring-primary shadow-sm"
                                                    placeholder="Embed ID or URL..."
                                                    value={v.url}
                                                    onChange={(e) => {
                                                        const newVideo = [...formData.video];
                                                        newVideo[idx].url = e.target.value;
                                                        setFormData({ ...formData, video: newVideo });
                                                    }}
                                                />
                                                <label className="size-12 bg-cedar rounded-xl flex items-center justify-center cursor-pointer hover:bg-cedar/90 shadow-lg shadow-cedar/20">
                                                    <span className="material-symbols-outlined text-white">videocam</span>
                                                    <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video', idx)} />
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {uploading && (
                                <div className="flex items-center justify-center gap-3 py-4 bg-primary/5 rounded-2xl border border-primary/20 text-primary text-xs font-bold animate-pulse">
                                    <span className="material-symbols-outlined animate-spin">sync</span>
                                    Uploading files to archive...
                                </div>
                            )}

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    className="flex-1 bg-white dark:bg-slate-800 text-slate-600 border border-slate-200 dark:border-slate-700 font-bold py-4 rounded-xl"
                                >
                                    {translations.back[lang]}
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || uploading}
                                    className="flex-[2] bg-cedar text-white font-bold py-4 rounded-xl shadow-lg shadow-cedar/20 hover:bg-cedar/90 transition-all disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : translations.submit[lang]}
                                </button>
                            </div>
                            {error && <p className="text-red-500 text-xs font-bold mt-2 text-center">{error}</p>}
                        </form>
                    )}

                    {step === 5 && (
                        <div className="text-center py-10 animate-in zoom-in duration-500">
                            <div className="size-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl">check_circle</span>
                            </div>
                            <h3 className="text-2xl font-black mb-2">{translations.success[lang]}</h3>
                            <p className="text-slate-500 mb-8">Our archivists will review your submission for the digital collection shortly.</p>
                            <button
                                onClick={onClose}
                                className="bg-primary text-white font-bold px-12 py-4 rounded-2xl shadow-xl shadow-primary/20"
                            >
                                Close Portal
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
