import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteTranslations } from '../types';
import { DEFAULT_TRANSLATIONS } from '../contexts/TranslationContext';
import { Save, Sparkles, AlertCircle, Loader2, Database, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const TranslationManager = () => {
    const [translations, setTranslations] = useState<SiteTranslations | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeLang, setActiveLang] = useState<'en' | 'fi' | 'sv' | 'ar' | 'uk'>('en');

    useEffect(() => {
        fetchTranslations();
    }, []);

    const fetchTranslations = async () => {
        try {
            const docRef = doc(db, 'configs', 'translations');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setTranslations({ ...DEFAULT_TRANSLATIONS, ...docSnap.data() as SiteTranslations });
            } else {
                // Seed local state with defaults so the admin can review and save
                setTranslations(DEFAULT_TRANSLATIONS);
                setSuccess('Loaded built-in defaults. Click "Save Changes" to push to database, or use Auto-Translate first.');
            }
        } catch (err) {
            setError('Failed to fetch translations.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!translations) return;
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            await setDoc(doc(db, 'configs', 'translations'), translations);
            setSuccess("Translations saved successfully! Refresh the page to see changes.");
        } catch (err) {
            setError("Failed to save translations.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleAutoTranslate = async () => {
        if (!translations?.en) {
            setError("English base translations are required to auto-translate.");
            return;
        }

        if (!confirm("This will overwrite existing translations for missing languages. Proceed?")) return;

        setTranslating(true);
        setError('');
        setSuccess('');

        try {
            const targetLangs = [
                { code: 'fi', name: 'Finnish' },
                { code: 'sv', name: 'Swedish' },
                { code: 'ar', name: 'Arabic' },
                { code: 'uk', name: 'Ukrainian' }
            ];

            const enJson = JSON.stringify(translations.en, null, 2);
            const prompt = `Translate the following UI text JSON into Finnish, Swedish, Arabic, and Ukrainian. 
Respond ONLY with a valid, raw JSON object containing exactly the language codes ("fi", "sv", "ar", "uk") as top-level keys, and the translated key-value pairs inside them.
Do not include markdown blocks like \`\`\`json. Just the raw JSON.
Ensure Arabic translations are culturally appropriate and Ukrainian uses standard syntax.

English Base:
${enJson}`;

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.1 }
                    })
                }
            );

            const data = await res.json();
            if (!res.ok) throw new Error(data.error?.message || 'Translation failed');

            let rawText = data.candidates[0].content.parts[0].text.trim();
            // Clean up any markdown blocks if the AI still returned them
            rawText = rawText.replace(/^```json/m, '').replace(/^```/m, '').trim();

            const newTranslations = JSON.parse(rawText);

            setTranslations(prev => ({
                ...prev!,
                fi: { ...prev!.fi, ...newTranslations.fi },
                sv: { ...prev!.sv, ...newTranslations.sv },
                ar: { ...prev!.ar, ...newTranslations.ar },
                uk: { ...prev!.uk, ...newTranslations.uk },
            }));

            setSuccess("Auto-translation complete! Please review and click Save.");
        } catch (err: any) {
            setError(`Auto-translation error: ${err.message}`);
            console.error(err);
        } finally {
            setTranslating(false);
        }
    };

    const handleResetDefaults = async () => {
        if (!confirm("Are you sure? This will permanently delete all custom translations and restore the built-in defaults.")) return;
        setSaving(true);
        try {
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(doc(db, 'configs', 'translations'));
            setTranslations(DEFAULT_TRANSLATIONS);
            setSuccess("Reset to built-in defaults successfully. The database has been wiped.");
        } catch (err) {
            setError("Failed to reset to defaults.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleFieldChange = (key: string, value: string) => {
        if (!translations) return;
        setTranslations({
            ...translations,
            [activeLang]: {
                ...translations[activeLang],
                [key]: value
            }
        });
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    const currentData = translations ? translations[activeLang] : {};
    // Get all keys from English base to ensure consistent fields
    const allKeys = translations?.en ? Object.keys(translations.en) : [];

    return (
        <div className="bg-bg-card border border-border-main rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-border-main flex justify-between items-center bg-bg-surface/50">
                <div>
                    <h3 className="text-lg font-bold text-text-main mb-1">Site Translations</h3>
                    <p className="text-sm text-text-muted">Manage global UI text across all languages.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleAutoTranslate}
                        disabled={translating || !translations?.en}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors disabled:opacity-50"
                    >
                        {translating ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                        Auto-Translate Missing
                    </button>
                    <button
                        onClick={handleResetDefaults}
                        disabled={saving || translating}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition-colors disabled:opacity-50"
                        title="Delete database translations and start over"
                    >
                        <RotateCcw className="size-4" />
                        Reset Defaults
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || !translations}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors disabled:opacity-50 shadow-sm shadow-primary/20"
                    >
                        {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                        Save Changes
                    </button>
                </div>
            </div>

            {(error || success) && (
                <div className={`p-4 border-b flex items-start gap-3 text-sm font-medium ${error ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                    <AlertCircle className="size-5 shrink-0" />
                    <p>{error || success}</p>
                </div>
            )}

            <div className="border-b border-border-main bg-bg-surface/30">
                <div className="flex px-4 pt-2 overflow-x-auto hide-scrollbar">
                    {([
                        { code: 'en', label: 'English (Base)' },
                        { code: 'fi', label: 'Suomi' },
                        { code: 'sv', label: 'Svenska' },
                        { code: 'ar', label: 'العربية' },
                        { code: 'uk', label: 'Українська' }
                    ] as const).map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => setActiveLang(lang.code)}
                            className={`px-6 py-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
                                activeLang === lang.code 
                                    ? 'border-primary text-primary' 
                                    : 'border-transparent text-text-muted hover:text-text-main'
                            }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[600px] space-y-4 bg-bg-surface/10">
                {!translations?.en && (
                    <div className="text-center py-12 text-text-muted text-sm">
                        No base translations found. You may need to seed the database first.
                    </div>
                )}
                
                {allKeys.map(key => (
                    <div key={key} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start p-4 bg-white border border-border-main rounded-xl">
                        <div className="md:col-span-1">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">
                                {key}
                            </label>
                            {activeLang !== 'en' && translations?.en?.[key] && (
                                <p className="text-xs text-text-muted/70 truncate" title={translations.en[key]}>
                                    EN: {translations.en[key]}
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-3">
                            <textarea
                                value={currentData?.[key] || ''}
                                onChange={(e) => handleFieldChange(key, e.target.value)}
                                className="w-full px-3 py-2 text-sm text-text-main bg-bg-surface border border-border-main rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y min-h-[40px]"
                                dir={activeLang === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
