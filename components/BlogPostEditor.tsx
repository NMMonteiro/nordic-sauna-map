import React, { useState } from 'react';
import { db, auth, storage } from '../lib/firebase';
import { User } from 'firebase/auth';
import { collection, addDoc, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { LanguageCode } from '../types';
import { resolveMediaUrl } from '../lib/storage';
import { RichTextEditor } from './RichTextEditor';

interface BlogPostEditorProps {
    lang: LanguageCode;
    user: User;
    onClose: () => void;
    onSuccess: () => void;
    post?: any; // Optional post for editing
}

export const BlogPostEditor = ({ lang, user, onClose, onSuccess, post }: BlogPostEditorProps) => {
    const [title, setTitle] = useState(post?.title || '');
    const [category, setCategory] = useState(post?.category || 'Sauna Stories');
    const [content, setContent] = useState(post?.content || '');
    
    // Translations state
    const [translations, setTranslations] = useState({
        en: { title: post?.title_en || '', content: post?.content_en || '' },
        sv: { title: post?.title_sv || '', content: post?.content_sv || '' },
        fi: { title: post?.title_fi || '', content: post?.content_fi || '' }
    });
    
    const translationTabs = (['en', 'sv', 'fi'] as LanguageCode[]).filter(l => l !== lang);
    const [activeTab, setActiveTab] = useState<'main' | LanguageCode>('main');
    const [translating, setTranslating] = useState(false);

    const [mediaUrls, setMediaUrls] = useState<string[]>(() => {
        const raw = post?.media_urls || post?.media;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw;
        try {
            if (typeof raw === 'string' && raw.startsWith('[')) {
                return JSON.parse(raw);
            }
            if (typeof raw === 'string') return [raw];
            return [];
        } catch (e) {
            console.error('Error parsing media_urls:', e);
            return [];
        }
    });
    const [uploading, setUploading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `blog-media/${user.uid}/${fileName}`;

        try {
            const storageRef = ref(storage, filePath);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            setMediaUrls(prev => [...prev, downloadURL]);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'pending_approval' = 'pending_approval') => {
        e.preventDefault();
        if (uploading) {
            alert('Please wait for the image to finish uploading...');
            return;
        }
        if (!title || !content) {
            alert('Please fill in both title and content for the main language.');
            return;
        }

        setSubmitting(true);
        try {
            const postData = {
                author_id: post?.author_id || user.uid,
                title,
                category,
                content,
                title_en: translations.en.title,
                content_en: translations.en.content,
                title_sv: translations.sv.title,
                content_sv: translations.sv.content,
                title_fi: translations.fi.title,
                content_fi: translations.fi.content,
                media_urls: mediaUrls,
                status: status,
                updated_at: Timestamp.now(),
                created_at: post?.created_at || Timestamp.now()
            };

            // Remove empty translations so we don't clutter DB if not set yet
            if (!postData.title_en) delete (postData as any).title_en;
            if (!postData.content_en) delete (postData as any).content_en;
            if (!postData.title_sv) delete (postData as any).title_sv;
            if (!postData.content_sv) delete (postData as any).content_sv;
            if (!postData.title_fi) delete (postData as any).title_fi;
            if (!postData.content_fi) delete (postData as any).content_fi;

            if (post?.id) {
                const postRef = doc(db, 'blog_posts', post.id);
                await updateDoc(postRef, postData);
            } else {
                await addDoc(collection(db, 'blog_posts'), postData);
            }

            alert(status === 'draft' ? 'Draft saved!' : (post?.id ? 'Your post has been updated and sent for review!' : 'Your post has been submitted for review!'));
            onSuccess();
        } catch (error: any) {
            console.error('Error submitting post:', error);
            alert(`Failed to submit post: ${error.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
        }
    };

    const currentTitle = activeTab === 'main' ? title : translations[activeTab as LanguageCode].title;
    const currentContent = activeTab === 'main' ? content : translations[activeTab as LanguageCode].content;

    const handleTitleChange = (val: string) => {
        if (activeTab === 'main') setTitle(val);
        else setTranslations(prev => ({ ...prev, [activeTab]: { ...prev[activeTab as LanguageCode], title: val } }));
    };

    const handleContentChange = (val: string) => {
        if (activeTab === 'main') setContent(val);
        else setTranslations(prev => ({ ...prev, [activeTab]: { ...prev[activeTab as LanguageCode], content: val } }));
    };

    const handleAutoTranslate = async () => {
        if (!title && !content) {
            alert('Please enter a title or content in the original language first.');
            return;
        }
        setTranslating(true);
        const functions = getFunctions();
        const translateFn = httpsCallable(functions, 'translateText');
        
        try {
            if (title && !currentTitle) {
                const res = await translateFn({ text: title, targetLang: activeTab, isHtml: false });
                handleTitleChange((res.data as any).translatedText);
            }
            
            const isContentEmpty = !currentContent || currentContent.replace(/<[^>]*>?/gm, '').trim() === '';
            if (content && isContentEmpty) {
                const res = await translateFn({ text: content, targetLang: activeTab, isHtml: true });
                handleContentChange((res.data as any).translatedText);
            }
        } catch (error) {
            console.error(error);
            alert('Auto-translation failed. The system will still translate automatically upon save.');
        } finally {
            setTranslating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[25000] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl h-full md:h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-8 py-5 border-b border-sky/10">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 uppercase">{post ? 'Edit Blog Post' : 'Write a Blog Post'}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Admin approval required before publishing</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>

                {/* Language Tabs */}
                <div className="px-8 pt-4 flex gap-4 border-b border-sky/5 bg-slate-50">
                    <button
                        type="button"
                        onClick={() => setActiveTab('main')}
                        className={`pb-3 px-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'main' ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                    >
                        Original ({lang.toUpperCase()})
                    </button>
                    {translationTabs.map(tLang => (
                        <button
                            key={tLang}
                            type="button"
                            onClick={() => setActiveTab(tLang)}
                            className={`pb-3 px-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tLang ? 'border-primary text-primary' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                        >
                            Translate to {tLang.toUpperCase()}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                    {activeTab === 'main' ? 'Title of your post' : `Translated Title (${activeTab.toUpperCase()})`}
                                </label>
                                {activeTab !== 'main' && (
                                    <button
                                        type="button"
                                        onClick={handleAutoTranslate}
                                        disabled={translating}
                                        className="text-[9px] font-bold text-primary uppercase flex items-center gap-1 hover:underline disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-[10px]">translate</span>
                                        {translating ? 'Translating...' : 'Auto-Translate'}
                                    </button>
                                )}
                            </div>
                            <input
                                type="text"
                                value={currentTitle}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder={activeTab === 'main' ? "A quiet morning at the smoke sauna..." : `Enter ${activeTab.toUpperCase()} translation...`}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                required={activeTab === 'main'}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium appearance-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer outline-none"
                            >
                                <option value="Sauna Stories">Sauna Stories</option>
                                <option value="Tradition">Tradition</option>
                                <option value="Wellness">Wellness</option>
                                <option value="Events">Events</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
                        <div className="flex justify-between items-center px-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {activeTab === 'main' ? 'Description / Content' : `Translated Content (${activeTab.toUpperCase()})`}
                            </label>
                            {activeTab !== 'main' && (
                                <p className="text-[9px] font-bold text-slate-400">
                                    Leave blank to auto-translate on save.
                                </p>
                            )}
                        </div>
                        <RichTextEditor content={currentContent} onChange={handleContentChange} />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Media & Images</label>
                            <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                                {lang === 'sv' ? 'Max 5MB • JPG, PNG, WEBP' : 'Max 5MB • JPG, PNG, WEBP'}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {mediaUrls.map((url, i) => (
                                <div key={i} className="aspect-square rounded-xl overflow-hidden border border-sky/10 relative group">
                                    <img src={resolveMediaUrl(url, 'sauna-media')} className="w-full h-full object-cover" alt="Uploaded" />
                                    <button
                                        type="button"
                                        onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                                        className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ))}
                            <label className="aspect-square rounded-xl border-2 border-dashed border-sky-100 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-primary/30 hover:bg-sky/5 cursor-pointer transition-all">
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                                        <span className="text-[9px] font-bold uppercase tracking-tighter">Add Media</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={(e) => handleSubmit(e, 'draft')}
                            disabled={submitting || uploading}
                            className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-200 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Saving...' : 'Save Draft'}
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="bg-nordic-lake text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : uploading ? 'Uploading image...' : (post && post.status !== 'draft' ? 'Update Post' : 'Submit Review')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};
