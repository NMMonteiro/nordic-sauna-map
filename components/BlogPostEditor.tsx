import React, { useState } from 'react';
import { db, storage } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import {
    doc,
    updateDoc,
    collection,
    addDoc,
    getDoc,
    serverTimestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { LanguageCode } from '../types';

interface BlogPostEditorProps {
    lang: LanguageCode;
    user: FirebaseUser;
    onClose: () => void;
    onSuccess: () => void;
    post?: any; // Optional post for editing
}

export const BlogPostEditor = ({ lang, user, onClose, onSuccess, post }: BlogPostEditorProps) => {
    const [title, setTitle] = useState(post?.title || '');
    const [category, setCategory] = useState(post?.category || 'Sauna Stories');
    const [content, setContent] = useState(post?.content || '');
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
    const [categories, setCategories] = useState<string[]>(['Sauna Stories', 'Tradition', 'Wellness', 'Events']);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const docRef = doc(db, 'configs', 'education_categories');
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().items) {
                    setCategories(snap.data().items);
                    if (!post?.category) setCategory(snap.data().items[0] || 'Sauna Stories');
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, [post]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
        const filePath = `blog-media/${user.uid}/${fileName}`;

        try {
            const storageRef = ref(storage, filePath);
            await uploadBytes(storageRef, file);
            const publicUrl = await getDownloadURL(storageRef);

            setMediaUrls(prev => [...prev, publicUrl]);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploading) {
            alert('Please wait for the image to finish uploading...');
            return;
        }
        if (!title || !content) {
            alert('Please fill in both title and content');
            return;
        }

        setSubmitting(true);
        try {
            const postData = {
                author_id: post?.author_id || user.uid,
                title,
                category,
                content,
                media_urls: mediaUrls,
                status: 'pending_approval',
                updated_at: serverTimestamp()
            };

            if (post?.id) {
                await updateDoc(doc(db, 'blog_posts', post.id), postData);
            } else {
                await addDoc(collection(db, 'blog_posts'), {
                    ...postData,
                    created_at: serverTimestamp()
                });
            }

            alert(post?.id ? 'Your story has been updated and sent for review!' : 'Your story has been submitted for review!');
            onSuccess();
        } catch (error: any) {
            console.error('Error submitting post:', error);
            alert(`Failed to submit post: ${error.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[25000] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white/90 backdrop-blur-2xl border border-white/40 w-full max-w-5xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-10 py-6 border-b border-slate-200/50">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 uppercase">{post ? 'Edit Your Story' : 'Share Your Story'}</h2>
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Admin approval required before publishing</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-10 flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 px-2">Title of your story</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="A quiet morning at the smoke sauna..."
                                className="w-full bg-slate-50 border-none rounded-3xl p-6 text-2xl font-semibold placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 px-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-3xl p-6 text-lg font-semibold appearance-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 px-2">Description / Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share the atmosphere, the heat, and the tradition..."
                            className="w-full bg-slate-50 border-none rounded-[2rem] p-8 text-lg font-light flex-1 min-h-[300px] resize-none placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all leading-relaxed"
                            required
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end px-2">
                            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Media & Images</label>
                            <span className="text-xs font-medium text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                                {lang === 'sv' ? 'Max 5MB • JPG, PNG, WEBP • Flera bilder stöds' : 'Max 5MB • JPG, PNG, WEBP • Multiple images supported'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {mediaUrls.map((url, i) => {
                                const resolveUrl = (u: string) => {
                                    if (!u || typeof u !== 'string') return '';
                                    if (u.startsWith('http')) return u;
                                    if (u.startsWith('blob:')) return u; // Handle local previews
                                    return u;
                                };
                                return (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-sky/10 relative group">
                                        <img src={resolveUrl(url)} className="w-full h-full object-cover" alt="Uploaded" />
                                        <button
                                            type="button"
                                            onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                                            className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                );
                            })}
                            <label className="aspect-square rounded-2xl border-2 border-dashed border-sky-100 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-primary/30 hover:bg-sky/5 cursor-pointer transition-all">
                                {uploading ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
                                        <span className="text-xs font-semibold uppercase tracking-tight">Add Media</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl text-sm font-semibold uppercase tracking-wide text-slate-500 bg-white hover:bg-slate-50 border border-slate-200 transition-all shadow-sm hover:shadow"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="bg-primary text-white px-10 py-4 rounded-2xl text-sm font-semibold uppercase tracking-[0.2em] shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : uploading ? 'Uploading image...' : (post ? 'Update Post' : 'Submit Post for Review')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};
