import React, { useState } from 'react';
import { db, storage } from '../lib/firebase';
import { 
    collection, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp 
} from 'firebase/firestore';
import { 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'firebase/storage';
import { resolveMediaUrl } from '../lib/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';

interface EducationManagerProps {
    materials: any[];
    t: any;
    onRefresh: () => void;
    profile: any;
}

export const EducationManager: React.FC<EducationManagerProps> = ({ materials, t, onRefresh, profile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterLanguage, setFilterLanguage] = useState('all');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'pdf',
        url: '',
        file_path: '',
        thumbnail: '',
        language: 'en',
        audio_language: '',
        subtitles_languages: [] as string[]
    });

    const canManage = (material: any) => {
        if (!profile) return false;
        if (profile.role === 'admin') return true;
        return material.created_by === profile.id;
    };

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handlePasteThumbnail = async () => {
        try {
            const clipboardItems = await navigator.clipboard.read();
            for (const clipboardItem of clipboardItems) {
                const imageTypes = clipboardItem.types.filter(type => type.startsWith('image/'));
                if (imageTypes.length > 0) {
                    setUploading(true);
                    const blob = await clipboardItem.getType(imageTypes[0]);
                    const ext = imageTypes[0].split('/')[1] || 'png';
                    const file = new File([blob], `pasted-${Date.now()}.${ext}`, { type: imageTypes[0] });
                    
                    const path = `education/thumbnails/${Date.now()}-${file.name}`;
                    const storageRef = ref(storage, path);
                    
                    await uploadBytes(storageRef, file);
                    const downloadURL = await getDownloadURL(storageRef);
                    setFormData(prev => ({ ...prev, thumbnail: downloadURL }));
                    setUploading(false);
                    return;
                }
            }
            alert('No image found in clipboard. Please copy an image first.');
        } catch (error) {
            console.error('Paste error:', error);
            alert('Failed to read from clipboard. Please ensure you have granted clipboard permissions.');
            setUploading(false);
        }
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        setUploading(true);
        const file = e.target.files[0];
        const path = `education/thumbnails/${Date.now()}-${file.name}`;
        const storageRef = ref(storage, path);
        
        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setFormData({ ...formData, thumbnail: downloadURL });
        } catch (error) {
            console.error('Thumbnail upload error:', error);
            alert('Image upload failed. Please try again.');
        }
        setUploading(false);
    };

    const handleGenerateThumbnail = async () => {
        if (!formData.description) {
            alert('Please enter a description first to use as a prompt for the AI.');
            return;
        }

        setUploading(true);
        try {
            const prompt = `A professional, creative and visually stunning photograph representing the concept: "${formData.description}". ` +
                           `Instead of simple generic scenes of people, capture the essence of the topic with artistic composition, beautiful textures (such as aged wood, hot sauna stones, steam, or birch leaves), and atmospheric lighting (like warm soft interior lights, natural sunlight filtering through steam, or scenic Nordic outdoor landscapes with lakes and forests). ` +
                           `Focus on details, architecture, or objects where appropriate. No text, high quality, realistic and clean modern aesthetic.`;
            
            console.log('Requesting thumbnail generation from Vertex AI Imagen 3 Fast...');
            const functions = getFunctions();
            const generateAIThumbnailFn = httpsCallable(functions, 'generateAIThumbnail');
            
            const res = await generateAIThumbnailFn({ prompt });
            const base64Data = (res.data as any).imageBase64;
            
            // Convert base64 to Blob
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'image/png' });

            const file = new File([blob], `imagen-thumb-${Date.now()}.png`, { type: 'image/png' });
            const path = `education/thumbnails/${Date.now()}-${file.name}`;
            const storageRef = ref(storage, path);

            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            setFormData(prev => ({ ...prev, thumbnail: downloadURL }));
            alert('AI Thumbnail generated using Google Vertex AI Imagen 3 Fast and saved successfully!');
        } catch (vertexError: any) {
            console.warn('Vertex AI generation failed, attempting Pollinations AI fallback...', vertexError);
            try {
                const prompt = `Educational illustration, graphic design, clean modern style, high quality, vector feel, for educational article: ${formData.description}`;
                const url = `https://image.pollinations.ai/p/${encodeURIComponent(prompt)}?width=800&height=450&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to generate image from fallback AI service');

                const blob = await response.blob();
                const file = new File([blob], `ai-thumb-${Date.now()}.png`, { type: 'image/png' });

                const path = `education/thumbnails/${Date.now()}-${file.name}`;
                const storageRef = ref(storage, path);

                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);
                setFormData(prev => ({ ...prev, thumbnail: downloadURL }));
                alert('AI Thumbnail generated using Pollinations AI (fallback) and saved successfully!');
            } catch (fallbackError: any) {
                console.error('AI generation fallback error:', fallbackError);
                alert(`Failed to generate thumbnail: ${fallbackError.message || 'Unknown error'}`);
            }
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        setUploading(true);
        const file = e.target.files[0];

        console.log('Attempting to upload resource:', file.name, file.size, file.type);

        const path = `education/resources/${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const storageRef = ref(storage, path);

        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            console.log('Upload successful:', downloadURL);
            setFormData(prev => ({ 
                ...prev, 
                file_path: path,
                url: downloadURL 
            }));
            alert('File uploaded! You can now save the resource.');
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`Upload failed: ${error.message}`);
        }
        setUploading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let finalData: any = { 
            ...formData,
            updated_at: serverTimestamp()
        };

        if (formData.type === 'video' && formData.url && !formData.thumbnail) {
            const ytId = getYouTubeId(formData.url);
            if (ytId) {
                finalData.thumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
            }
        }

        try {
            if (editingId) {
                const docRef = doc(db, 'learning_materials', editingId);
                await updateDoc(docRef, finalData);
                setShowForm(false);
                setEditingId(null);
                onRefresh();
                setFormData({ title: '', description: '', type: 'pdf', url: '', file_path: '', thumbnail: '', language: 'en', audio_language: '', subtitles_languages: [] });
                alert('Resource updated!');
            } else {
                finalData.created_at = serverTimestamp();
                finalData.created_by = profile?.id || profile?.uid || 'admin';
                await addDoc(collection(db, 'learning_materials'), finalData);
                setShowForm(false);
                onRefresh();
                setFormData({ title: '', description: '', type: 'pdf', url: '', file_path: '', thumbnail: '', language: 'en', audio_language: '', subtitles_languages: [] });
                alert('Resource added!');
            }
        } catch (error: any) {
            console.error('Submit error:', error);
            alert(`Something went wrong: ${error.message}`);
        }
    };

    const startEdit = (material: any) => {
        setFormData({
            title: material.title,
            description: material.description,
            type: material.type,
            url: material.url || '',
            file_path: material.file_path || '',
            thumbnail: material.thumbnail || '',
            language: material.language || 'en',
            audio_language: material.audio_language || '',
            subtitles_languages: material.subtitles_languages || (material.subtitles_language ? [material.subtitles_language] : [])
        });
        setEditingId(material.id);
        setShowForm(true);
    };

    const deleteMaterial = async (id: string) => {
        if (!confirm('Delete this resource?')) return;
        try {
            await deleteDoc(doc(db, 'learning_materials', id));
            onRefresh();
        } catch (error: any) {
            alert(`Delete failed: ${error.message}`);
        }
    };

    const filteredMaterials = materials.filter((m: any) => {
        const matchesSearch = (m.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                              (m.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || m.type === filterType;
        const matchesLang = filterLanguage === 'all' || m.language === filterLanguage;
        return matchesSearch && matchesType && matchesLang;
    });

    if (showForm) {
        return (
            <div className="fixed top-0 right-0 bottom-0 left-0 lg:left-56 z-[1200] bg-slate-50 overflow-y-auto animate-in fade-in duration-200">
                <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setShowForm(false)}
                            className="size-10 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </button>
                        <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">
                            {editingId ? 'Edit Resource' : 'Add New Resource'}
                        </h2>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowForm(false)} 
                            className="px-6 py-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={(e) => {
                                const form = document.getElementById('lesson-plan-form') as HTMLFormElement;
                                if (form) form.requestSubmit();
                            }}
                            disabled={uploading} 
                            className={`bg-nordic-lake text-white px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
                        >
                            {uploading ? 'Uploading...' : (editingId ? 'Update' : 'Save')}
                        </button>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto p-6 md:p-12">
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                        <form id="lesson-plan-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex flex-col items-center justify-center mb-4 gap-4">
                            <div className="relative group cursor-pointer">
                                <input type="file" onChange={handleThumbnailUpload} className="hidden" id="admin-thumb-upload" accept="image/*" />
                                <label htmlFor="admin-thumb-upload" className="block size-48 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden group-hover:border-primary/30 transition-all cursor-pointer">
                                    {formData.thumbnail ? (
                                        <img src={resolveMediaUrl(formData.thumbnail, 'education')} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                            <span className="material-symbols-outlined text-4xl mb-2">add_photo_alternate</span>
                                            <span className="text-[9px] font-black uppercase">Click to add Thumbnail</span>
                                        </div>
                                    )}
                                </label>
                                {formData.thumbnail && (
                                    <button onClick={(e) => { e.preventDefault(); setFormData({ ...formData, thumbnail: '' }); }} className="absolute -top-2 -right-2 bg-red-500 text-white size-8 rounded-full flex items-center justify-center shadow-xl">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center">
                                <button
                                    type="button"
                                    onClick={handlePasteThumbnail}
                                    disabled={uploading}
                                    className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">content_paste</span>
                                    Paste from Clipboard
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGenerateThumbnail}
                                    disabled={uploading}
                                    className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                                    Generate with AI
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-2">Title</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-2">Type</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm">
                                <option value="pdf">PDF Download</option>
                                <option value="presentation">Presentation</option>
                                <option value="video">YouTube Video</option>
                                <option value="twee">Interactive Exercise</option>
                                <option value="lesson_plan">Resource</option>
                                <option value="article">Article / External Link</option>
                                <option value="worksheet">Worksheet</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-2">Language</label>
                            <select value={formData.language} onChange={e => setFormData({ ...formData, language: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm">
                                <option value="en">English</option>
                                <option value="fi">Finnish</option>
                                <option value="sv">Swedish</option>
                            </select>
                        </div>
                        {formData.type === 'video' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Audio Language</label>
                                    <select value={formData.audio_language || ''} onChange={e => setFormData({ ...formData, audio_language: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm">
                                        <option value="">None</option>
                                        <option value="en">English</option>
                                        <option value="fi">Finnish</option>
                                        <option value="sv">Swedish</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 px-2">Subtitles Languages (Multi-select)</label>
                                    <div className="flex flex-wrap gap-2 px-2">
                                        {[
                                            { code: 'en', label: 'English' },
                                            { code: 'fi', label: 'Finnish' },
                                            { code: 'sv', label: 'Swedish' }
                                        ].map(lang => {
                                            const current = formData.subtitles_languages || [];
                                            const isSelected = current.includes(lang.code);
                                            return (
                                                <button
                                                    key={lang.code}
                                                    type="button"
                                                    onClick={() => {
                                                        const next = isSelected 
                                                            ? current.filter(l => l !== lang.code)
                                                            : [...current, lang.code];
                                                        setFormData({ ...formData, subtitles_languages: next });
                                                    }}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                        isSelected 
                                                            ? 'bg-primary text-white shadow-md' 
                                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                                >
                                                    {lang.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 px-2">Description</label>
                            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm h-24" />
                        </div>
                        {formData.type === 'video' || formData.type === 'twee' || formData.type === 'article' ? (
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-2">URL (Link to Video, Exercise, or Article)</label>
                                <input type="url" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm" />
                            </div>
                        ) : (
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 px-2">File Upload (PDF/Word/PPTX)</label>
                                <div className="flex gap-4 items-center">
                                    <input type="file" onChange={handleFileUpload} className="hidden" id="admin-file-upload" accept=".pdf,.pptx,.ppt,.docx,.doc" />
                                    <label htmlFor="admin-file-upload" className={`px-6 py-4 rounded-2xl font-bold text-sm cursor-pointer transition-all flex-1 flex justify-between items-center ${formData.file_path ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-100' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                        <span className="truncate">{uploading ? 'Uploading...' : formData.file_path ? formData.file_path.split('/').pop() : 'Choose File (PDF/Word/PPTX)'}</span>
                                        {formData.file_path && <span className="material-symbols-outlined text-emerald-500">check_circle</span>}
                                    </label>
                                </div>
                            </div>
                        )}
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black uppercase text-slate-900 tracking-tight">
                    Resources
                </h2>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', description: '', type: 'pdf', url: '', file_path: '', thumbnail: '', language: 'en', audio_language: '', subtitles_languages: [] });
                        setShowForm(true);
                    }}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    Add New Resource
                </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input 
                            type="text" 
                            placeholder="Search resources..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-5 py-4 font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm min-w-[160px] outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        <option value="all">All Types</option>
                        <option value="pdf">PDF</option>
                        <option value="presentation">Presentation</option>
                        <option value="video">Video</option>
                        <option value="twee">Interactive</option>
                        <option value="lesson_plan">Resource</option>
                        <option value="article">Article</option>
                        <option value="worksheet">Worksheet</option>
                    </select>
                    <select 
                        value={filterLanguage} 
                        onChange={(e) => setFilterLanguage(e.target.value)}
                        className="bg-slate-50 border-none rounded-2xl px-5 py-4 font-bold text-sm min-w-[140px] outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                    >
                        <option value="all">All Languages</option>
                        <option value="en">English</option>
                        <option value="fi">Finnish</option>
                        <option value="sv">Swedish</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredMaterials.map((m: any) => (
                    <div key={m.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group flex flex-col hover:shadow-xl transition-all duration-300">
                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                            <img 
                                src={m.thumbnail ? resolveMediaUrl(m.thumbnail, 'education') : (
                                    {
                                        pdf: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&q=80&w=800',
                                        presentation: 'https://images.unsplash.com/photo-1517245385169-d2089c6d6d4a?auto=format&fit=crop&q=80&w=800',
                                        video: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800',
                                        twee: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
                                        lesson_plan: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
                                        article: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
                                        worksheet: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
                                    }[m.type as string] || 'https://images.unsplash.com/photo-1531234799389-dcb7651eb0a2?auto=format&fit=crop&q=80&w=800'
                                )} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                alt={m.title} 
                            />
                            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase flex items-center gap-1.5 shadow-lg">
                                <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                                {m.language === 'sv' ? 'SV' : m.language === 'fi' ? 'FI' : 'EN'}
                            </div>
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                            <h4 className="font-black text-sm text-slate-900 leading-tight mb-2 line-clamp-2">{m.title}</h4>
                            <div className="flex items-center gap-1.5 text-slate-400 mb-4 mt-auto">
                                <span className="material-symbols-outlined text-[14px]">
                                    {m.type === 'video' ? 'play_circle' : m.type === 'twee' ? 'interactive_space' : m.type === 'article' ? 'article' : m.type === 'lesson_plan' ? 'menu_book' : m.type === 'worksheet' ? 'edit_note' : 'description'}
                                </span>
                                <p className="text-[10px] font-black uppercase tracking-widest">{m.type === 'twee' ? 'interactive' : m.type.replace('_', ' ')}</p>
                            </div>
                            
                            {canManage(m) && (
                                <div className="flex gap-2 pt-4 border-t border-slate-100">
                                    <button onClick={() => startEdit(m)} className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteMaterial(m.id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
