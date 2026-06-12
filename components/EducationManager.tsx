import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { ConfirmModal } from './ui/ConfirmModal';
import { generatePdfThumbnail } from '../lib/pdfThumbnail';
import {
    doc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    getDoc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL,
    uploadString
} from 'firebase/storage';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

interface EducationManagerProps {
    materials: any[];
    t: any;
    onRefresh: () => void;
    profile: any;
}

const DEFAULT_CATEGORIES = ['Verbs', 'Pronouns', 'Nouns', 'Flashcards', 'Basic phrases'];

type LangCode = 'en' | 'fi' | 'sv' | 'ar' | 'uk';

const LANGS = [
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'fi', flag: '🇫🇮', label: 'Finnish' },
    { code: 'sv', flag: '🇸🇪', label: 'Swedish' },
    { code: 'ar', flag: '🇸🇦', label: 'Arabic' },
    { code: 'uk', flag: '🇺🇦', label: 'Ukrainian' },
];

export const EducationManager: React.FC<EducationManagerProps> = ({ materials, t, onRefresh, profile }) => {
    const [showForm, setShowForm] = useState(false);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [translating, setTranslating] = useState(false);
    
    const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
    const [newCategory, setNewCategory] = useState('');
    const [activeFilter, setActiveFilter] = useState<string>('All');
    const [tweeMethod, setTweeMethod] = useState<'link' | 'iframe'>('link');
    const [activeLangTab, setActiveLangTab] = useState<LangCode>('en');

    const [formData, setFormData] = useState({
        titles: { en: '', fi: '', sv: '', ar: '', uk: '' } as Record<LangCode, string>,
        descriptions: { en: '', fi: '', sv: '', ar: '', uk: '' } as Record<LangCode, string>,
        type: 'pdf',
        category: '',
        file_path: '',
        url: '',
        thumbnail: '',
        embed_code: ''
    });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        isDestructive: boolean;
        confirmText: string;
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        isDestructive: true,
        confirmText: 'Confirm'
    });

    const [alertModal, setAlertModal] = useState({ isOpen: false, title: '', message: '', isError: false });

    const showAlert = (title: string, message: string, isError = false) => {
        setAlertModal({ isOpen: true, title, message, isError });
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const docRef = doc(db, 'configs', 'education_categories');
            const snap = await getDoc(docRef);
            if (snap.exists() && snap.data().items) {
                setCategories(snap.data().items);
            } else {
                // Initialize default
                await setDoc(docRef, { items: DEFAULT_CATEGORIES });
                setCategories(DEFAULT_CATEGORIES);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const catName = newCategory.trim();
        if (!catName || categories.includes(catName)) return;
        
        setTranslating(true);
        try {
            let translations: Record<string, string> = { en: catName, fi: catName, sv: catName, ar: catName, uk: catName };
            
            if (GEMINI_API_KEY) {
                const langs = ['fi', 'sv', 'ar', 'uk'];
                const langNames: Record<string, string> = { fi: 'Finnish', sv: 'Swedish', ar: 'Arabic', uk: 'Ukrainian' };
                const prompt = `Translate the category name from English into: ${langs.map(l => langNames[l]).join(', ')}.\nReturn ONLY valid JSON with keys "fi", "sv", "ar", "uk".\nCategory: "${catName}"`;

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
                
                if (res.ok) {
                    const data = await res.json();
                    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
                    try {
                        const parsed = JSON.parse(text);
                        translations = { en: catName, ...parsed };
                    } catch (e) {
                        console.error("JSON parse error:", e);
                    }
                }
            }

            // Save translations
            const transRef = doc(db, 'configs', 'category_translations');
            await setDoc(transRef, { [catName]: translations }, { merge: true });

            // Save category
            const updated = [...categories, catName];
            await updateDoc(doc(db, 'configs', 'education_categories'), { items: updated });
            
            setCategories(updated);
            setNewCategory('');
        } catch (err) {
            console.error('Error adding category:', err);
            showAlert('Error', 'Failed to add category', true);
        } finally {
            setTranslating(false);
        }
    };

    const handleDeleteCategory = async (cat: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Category',
            message: `Are you sure you want to delete "${cat}"? Materials in this category will become uncategorized.`,
            confirmText: 'Delete Category',
            isDestructive: true,
            onConfirm: async () => {
                const newCats = categories.filter(c => c !== cat);
                setCategories(newCats);
                try {
                    await setDoc(doc(db, 'configs', 'education_categories'), { items: newCats });
                    if (formData.category === cat) setFormData({ ...formData, category: newCats[0] || '' });
                } catch (err) {
                    console.error('Error deleting category:', err);
                    showAlert('Error', 'Failed to delete category', true);
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const canManage = (material: any) => {
        if (!profile) return false;
        if (profile.role === 'admin') return true;
        return material.created_by === profile.id;
    };

    const handleAutoTranslate = async () => {
        if (!formData.titles.en.trim()) {
            showAlert('Error', 'Please enter an English title first.', true);
            return;
        }
        if (!GEMINI_API_KEY) {
            showAlert('Error', 'Gemini API key not set in .env.local (VITE_GEMINI_API_KEY)', true);
            return;
        }

        setTranslating(true);
        try {
            const langs = ['fi', 'sv', 'ar', 'uk'] as LangCode[];
            const langNames: Record<LangCode, string> = {
                en: 'English', fi: 'Finnish', sv: 'Swedish', ar: 'Arabic', uk: 'Ukrainian'
            };

            const prompt = `You are a professional translator. Translate the following learning material title and description from English into: ${langs.map(l => langNames[l]).join(', ')}.
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
            const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
            const parsed = JSON.parse(cleaned);

            const newTitles = { ...formData.titles };
            const newDescs = { ...formData.descriptions };

            for (const l of langs) {
                if (parsed[`${l}_title`]) { newTitles[l] = parsed[`${l}_title`]; }
                if (parsed[`${l}_desc`]) { newDescs[l] = parsed[`${l}_desc`]; }
            }

            setFormData(prev => ({ ...prev, titles: newTitles, descriptions: newDescs }));
            showAlert('Success', 'Auto-translation complete!');
        } catch (err: any) {
            console.error('Translation error:', err);
            showAlert('Error', `Translation failed: ${err.message}`, true);
        }
        setTranslating(false);
    };

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setUploading(true);
        const file = e.target.files[0];
        const path = `education/thumbnails/${Date.now()}-${file.name}`;

        try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setFormData({ ...formData, thumbnail: url });
        } catch (err: any) {
            console.error('Thumbnail upload error:', err);
            showAlert('Upload Failed', 'Thumbnail upload failed: ' + err.message, true);
        }
        setUploading(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];

        const path = `education/resources/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;

        try {
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            
            let thumbUrl = formData.thumbnail;
            if (file.type === 'application/pdf') {
                try {
                    const dataUrl = await generatePdfThumbnail(file);
                    const thumbPath = `education/thumbnails/${Date.now()}-pdf-thumb.jpg`;
                    const thumbRef = ref(storage, thumbPath);
                    await uploadString(thumbRef, dataUrl, 'data_url');
                    thumbUrl = await getDownloadURL(thumbRef);
                } catch (pdfErr) {
                    console.error("Failed to generate PDF thumbnail:", pdfErr);
                }
            }

            setFormData(prev => ({ ...prev, url: url, file_path: path, thumbnail: thumbUrl || prev.thumbnail }));
            showAlert('Success', 'File uploaded successfully!');
        } catch (err: any) {
            console.error('File upload error:', err);
            showAlert('Upload Failed', 'File upload failed: ' + err.message, true);
        }
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalData: any = {
            ...formData,
            title: formData.titles,
            description: formData.descriptions,
            updated_at: serverTimestamp()
        };
        delete finalData.titles;
        delete finalData.descriptions;

        if (formData.type === 'video' && formData.url && !formData.thumbnail) {
            const ytId = getYouTubeId(formData.url);
            if (ytId) {
                finalData.thumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
            }
        }

        try {
            if (editingId) {
                await updateDoc(doc(db, 'materials', editingId), finalData);
            } else {
                finalData.created_by = profile?.id || profile?.uid || 'admin';
                finalData.created_at = serverTimestamp();
                await addDoc(collection(db, 'materials'), finalData);
            }
            setShowForm(false);
            setEditingId(null);
            onRefresh();
            setFormData({ titles: { en: '', fi: '', sv: '', ar: '', uk: '' }, descriptions: { en: '', fi: '', sv: '', ar: '', uk: '' }, type: 'pdf', category: categories[0] || '', url: '', file_path: '', thumbnail: '', embed_code: '' });
            setTweeMethod('link');
            setActiveLangTab('en');
        } catch (err: any) {
            showAlert('Error', err.message, true);
        }
    };

    const startEdit = (material: any) => {
        setFormData({
            titles: typeof material.title === 'string' ? { en: material.title, fi: '', sv: '', ar: '', uk: '' } : { en: '', fi: '', sv: '', ar: '', uk: '', ...(material.title || {}) },
            descriptions: typeof material.description === 'string' ? { en: material.description, fi: '', sv: '', ar: '', uk: '' } : { en: '', fi: '', sv: '', ar: '', uk: '', ...(material.description || {}) },
            type: material.type,
            category: material.category || categories[0] || '',
            url: material.url || '',
            file_path: material.file_path || '',
            thumbnail: material.thumbnail || '',
            embed_code: material.embed_code || ''
        });
        setTweeMethod(material.embed_code ? 'iframe' : 'link');
        setActiveLangTab('en');
        setEditingId(material.id);
        setShowForm(true);
    };

    const deleteMaterial = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Resource',
            message: 'Are you sure you want to permanently delete this resource? This action cannot be undone.',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'materials', id));
                    onRefresh();
                } catch (err: any) {
                    console.error('Error deleting material:', err);
                    showAlert('Error', 'Failed to delete material', true);
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const filteredMaterials = activeFilter === 'All' ? materials : materials.filter(m => m.category === activeFilter);

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Educational Resources</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage categories and upload learning materials.</p>
                </div>
                {!showForm && (
                    <div className="flex items-center gap-3">
                        {profile?.role === 'admin' && (
                            <button
                                onClick={() => setShowCategoryManager(!showCategoryManager)}
                                className="flex items-center gap-2 bg-slate-100 text-slate-600 hover:text-slate-900 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-slate-200"
                            >
                                <span className="material-symbols-outlined text-sm">folder_managed</span>
                                Categories
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setEditingId(null);
                                setFormData({ titles: { en: '', fi: '', sv: '', ar: '', uk: '' }, descriptions: { en: '', fi: '', sv: '', ar: '', uk: '' }, type: 'pdf', category: categories[0] || '', url: '', file_path: '', thumbnail: '', embed_code: '' });
                                setTweeMethod('link');
                                setShowForm(true);
                            }}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                            Add Resource
                        </button>
                    </div>
                )}
            </div>

            {/* Category Manager Modal */}
            {showCategoryManager && (
                <div className="fixed inset-0 z-[40000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => setShowCategoryManager(false)}></div>
                    <div className="relative bg-white/90 backdrop-blur-2xl border border-white/40 p-8 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">category</span>
                                Manage Categories
                            </h3>
                            <button onClick={() => setShowCategoryManager(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-8 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2">
                            {categories.map(cat => (
                                <div key={cat} className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-sm font-medium text-slate-700 shadow-sm">
                                    {cat}
                                    <button onClick={() => handleDeleteCategory(cat)} className="text-slate-400 hover:text-red-500 transition-colors flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[16px]">close</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddCategory} className="flex items-center gap-3">
                            <input
                                type="text"
                                value={newCategory}
                                onChange={e => setNewCategory(e.target.value)}
                                placeholder="New category name..."
                                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                            />
                            <button type="submit" disabled={!newCategory.trim()} className="bg-primary text-white px-5 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/25">
                                Add
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Main Form UI */}
            {showForm && (
                <div className="bg-white p-8 lg:p-10 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 animate-in zoom-in-95 duration-300 mb-8 relative overflow-hidden">
                    {/* Decorative subtle background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">
                                {editingId ? 'Edit Resource' : 'Create New Resource'}
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Fill in the details below to publish.</p>
                        </div>
                        <button onClick={() => setShowForm(false)} className="size-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 relative z-10">
                        {/* Thumbnail Upload Area */}
                        <div className="md:col-span-2 flex justify-center mb-4">
                            <div className="relative group cursor-pointer">
                                <input type="file" onChange={handleThumbnailUpload} className="hidden" id="admin-thumb-upload" accept="image/*" />
                                <label htmlFor="admin-thumb-upload" className="block w-64 h-48 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group-hover:border-primary/40 group-hover:bg-primary/5 transition-all cursor-pointer relative shadow-sm">
                                    {formData.thumbnail ? (
                                        <img src={formData.thumbnail} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-3xl mb-2">add_photo_alternate</span>
                                            <span className="text-xs font-semibold uppercase tracking-wide">Click to add Thumbnail</span>
                                        </div>
                                    )}
                                </label>
                                {formData.thumbnail && (
                                    <button onClick={(e) => { e.preventDefault(); setFormData({ ...formData, thumbnail: '' }); }} className="absolute -top-3 -right-3 bg-white text-red-500 size-8 rounded-full border border-slate-200 flex items-center justify-center shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Language Tabs */}
                        <div className="md:col-span-2 border-b border-slate-100 flex items-center justify-between gap-1 pb-1 overflow-x-auto hide-scrollbar">
                            <div className="flex gap-1">
                                {LANGS.map(l => (
                                    <button
                                        key={l.code}
                                        type="button"
                                        onClick={() => setActiveLangTab(l.code as LangCode)}
                                        className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl transition-all ${activeLangTab === l.code ? 'bg-primary/5 text-primary border-b-2 border-primary' : 'text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        <span>{l.flag}</span>
                                        <span>{l.label}</span>
                                    </button>
                                ))}
                            </div>
                            <button
                                type="button"
                                disabled={translating || !formData.titles.en.trim()}
                                onClick={() => handleAutoTranslate()}
                                title={!GEMINI_API_KEY ? 'Add VITE_GEMINI_API_KEY to .env.local to enable' : 'Auto-translate missing languages'}
                                className={`flex items-center gap-2 px-4 py-2 mb-1 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all ${formData.titles.en.trim()
                                        ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                {translating ? (
                                    <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                                )}
                                {translating ? 'Translating...' : 'Auto-Translate'}
                            </button>
                        </div>

                        {/* Title Input */}
                        <div className="space-y-2">
                            <div className="flex items-center h-6 ml-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Title ({LANGS.find(l => l.code === activeLangTab)?.label})</label>
                            </div>
                            <input 
                                type="text" 
                                value={formData.titles[activeLangTab]} 
                                onChange={e => setFormData({ ...formData, titles: { ...formData.titles, [activeLangTab]: e.target.value } })} 
                                placeholder={activeLangTab === 'en' ? "Enter English title (required)" : `Enter ${LANGS.find(l => l.code === activeLangTab)?.label} title (optional)`} 
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" 
                                required={activeLangTab === 'en'} 
                                dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>

                        {/* Type & Category Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center h-6 ml-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</label>
                                </div>
                                <div className="relative">
                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm">
                                        <option value="pdf">PDF Download</option>
                                        <option value="presentation">Presentation</option>
                                        <option value="video">YouTube Video</option>
                                        <option value="twee">Interactive Exercise</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between h-6 ml-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowCategoryManager(true)}
                                        className="text-[10px] font-bold text-primary uppercase tracking-wider hover:text-primary/80 flex items-center gap-1 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-md transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">add</span> New
                                    </button>
                                </div>
                                <div className="relative">
                                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm">
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Description Input */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Description ({LANGS.find(l => l.code === activeLangTab)?.label})</label>
                            <textarea 
                                value={formData.descriptions[activeLangTab]} 
                                onChange={e => setFormData({ ...formData, descriptions: { ...formData.descriptions, [activeLangTab]: e.target.value } })} 
                                placeholder={`Write a short description in ${LANGS.find(l => l.code === activeLangTab)?.label}...`} 
                                className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm resize-none h-28" 
                                dir={activeLangTab === 'ar' ? 'rtl' : 'ltr'}
                            />
                        </div>

                        {/* Conditional Upload / URL Field */}
                        {formData.type === 'twee' ? (
                            <div className="md:col-span-2 space-y-4">
                                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                                    <button type="button" onClick={() => setTweeMethod('link')} className={`text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-lg transition-colors ${tweeMethod === 'link' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Link URL</button>
                                    <button type="button" onClick={() => setTweeMethod('iframe')} className={`text-xs font-semibold uppercase tracking-wide px-4 py-2 rounded-lg transition-colors ${tweeMethod === 'iframe' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>Embed Code (Iframe)</button>
                                </div>
                                {tweeMethod === 'link' ? (
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">URL (Interactive Link)</label>
                                        <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value, embed_code: '' })} placeholder="https://..." className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">Iframe Embed Code</label>
                                        <textarea value={formData.embed_code || ''} onChange={e => setFormData({ ...formData, embed_code: e.target.value, url: '' })} placeholder="<iframe src='...' ></iframe>" className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm resize-none h-32 font-mono" />
                                    </div>
                                )}
                            </div>
                        ) : formData.type === 'video' ? (
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">YouTube URL</label>
                                <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} placeholder="https://youtube.com/..." className="w-full bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm" />
                            </div>
                        ) : (
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide ml-1">File Upload (PDF/PPTX)</label>
                                <div className="flex gap-4 items-center">
                                    <input type="file" onChange={handleFileUpload} className="hidden" id="admin-file-upload" accept=".pdf,.pptx,.ppt,.docx" />
                                    {!formData.file_path && (
                                        <label htmlFor="admin-file-upload" className="w-full px-6 py-4 rounded-2xl text-sm cursor-pointer transition-all flex justify-between items-center shadow-sm border bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:border-slate-300">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <span className="material-symbols-outlined text-xl">upload_file</span>
                                                <span className="truncate font-medium">{uploading ? 'Uploading...' : 'Choose File to Upload'}</span>
                                            </div>
                                            {!uploading && (
                                                <span className="bg-white px-3 py-1 rounded-lg text-xs font-semibold shadow-sm border border-slate-200 text-slate-600">Browse</span>
                                            )}
                                        </label>
                                    )}
                                </div>
                                
                                {/* Uploaded File Details Box */}
                                {formData.file_path && (
                                    <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="size-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                                                <span className="material-symbols-outlined">description</span>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-semibold text-emerald-900 truncate">{formData.file_path.split('/').pop()}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded-md">Uploaded Successfully</span>
                                                    <a href={formData.url} target="_blank" rel="noreferrer" className="text-xs text-emerald-700 hover:text-emerald-800 underline decoration-emerald-300 underline-offset-2 flex items-center gap-1">
                                                        View File <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="admin-file-upload" className="p-2 bg-white/60 hover:bg-white text-emerald-700 rounded-xl transition-colors cursor-pointer" title="Replace File">
                                                <span className="material-symbols-outlined text-[18px]">autorenew</span>
                                            </label>
                                            <button type="button" onClick={() => setFormData({...formData, file_path: '', url: ''})} className="p-2 bg-white/60 hover:bg-white text-red-500 rounded-xl transition-colors" title="Remove File">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="md:col-span-2 flex items-center justify-end gap-4 mt-6 pt-6 border-t border-slate-100">
                            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 transition-colors">
                                Cancel
                            </button>
                            <button type="submit" disabled={uploading} className={`bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 transition-all flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-primary/40 hover:-translate-y-0.5'}`}>
                                {uploading ? (
                                    <><span className="material-symbols-outlined animate-spin text-sm">progress_activity</span> Processing...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-sm">save</span> {editingId ? 'Update Resource' : 'Publish Resource'}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Content Filters */}
            {!showForm && (
                <div className="flex overflow-x-auto custom-scrollbar pb-2 gap-2">
                    <button 
                        onClick={() => setActiveFilter('All')} 
                        className={`px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border ${activeFilter === 'All' ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                    >
                        All Materials
                    </button>
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveFilter(cat)} 
                            className={`px-5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border flex items-center gap-2 ${activeFilter === cat ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <span className="material-symbols-outlined text-[16px] opacity-70">folder</span>
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMaterials.map((m: any) => (
                    <div key={m.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col group relative overflow-hidden">
                        <div className="flex items-start gap-4">
                            <div className="size-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0 border border-primary/10">
                                <span className="material-symbols-outlined text-2xl">{m.type === 'video' ? 'play_circle' : m.type === 'twee' ? 'interactive_space' : 'description'}</span>
                            </div>
                            <div className="flex-1 min-w-0 pr-24">
                                <h4 className="font-semibold text-slate-900 text-base truncate">{typeof m.title === 'string' ? m.title : (m.title?.en || 'Untitled')}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs font-medium text-slate-500 capitalize">{m.type === 'twee' ? 'Interactive' : m.type}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded-md truncate">{m.category || 'Uncategorized'}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="absolute top-4 right-4 flex flex-row gap-2 opacity-100 transition-opacity">
                            <button onClick={() => startEdit(m)} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-primary hover:border-primary/20 shadow-sm transition-all">
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button onClick={() => deleteMaterial(m.id)} className="p-2 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all">
                                <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {filteredMaterials.length === 0 && (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center mt-6">
                    <div className="size-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                        <span className="material-symbols-outlined text-3xl text-slate-300">inventory_2</span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">No materials found</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">There are no materials in this category yet. Click 'Add Resource' to upload your first material.</p>
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

            <ConfirmModal 
                isOpen={alertModal.isOpen}
                onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                title={alertModal.title}
                message={alertModal.message}
                confirmText="OK"
                isDestructive={alertModal.isError}
                isAlert={true}
            />
        </div>
    );
};
