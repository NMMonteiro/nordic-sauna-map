import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { LanguageCode } from '../types';

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
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('blog-media')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('blog-media')
                .getPublicUrl(filePath);

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
                author_id: post?.author_id || user.id,
                title,
                category,
                content,
                media_urls: mediaUrls,
                status: 'pending_approval',
                updated_at: new Date().toISOString()
            };

            if (post?.id) {
                const { error } = await supabase
                    .from('blog_posts')
                    .update(postData)
                    .eq('id', post.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('blog_posts')
                    .insert(postData);
                if (error) throw error;
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
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-5xl h-full rounded-[3rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between px-10 py-6 border-b border-sky/10">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase">{post ? 'Edit Your Story' : 'Share Your Story'}</h2>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Admin approval required before publishing</p>
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
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Title of your story</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="A quiet morning at the smoke sauna..."
                                className="w-full bg-slate-50 border-none rounded-3xl p-6 text-2xl font-black placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-slate-50 border-none rounded-3xl p-6 text-lg font-black appearance-none focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer"
                            >
                                <option value="Sauna Stories">Sauna Stories</option>
                                <option value="Tradition">Tradition</option>
                                <option value="Wellness">Wellness</option>
                                <option value="Events">Events</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2 flex-1 flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Description / Content</label>
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
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Media & Images</label>
                            <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">
                                {lang === 'sv' ? 'Max 5MB • JPG, PNG, WEBP • Flera bilder stöds' : 'Max 5MB • JPG, PNG, WEBP • Multiple images supported'}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                            {mediaUrls.map((url, i) => {
                                const resolveUrl = (u: string) => {
                                    if (!u || typeof u !== 'string') return '';
                                    if (u.startsWith('http')) return u;
                                    if (u.startsWith('blob:')) return u; // Handle local previews
                                    return `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/blog-media/${u.startsWith('/') ? u.slice(1) : u}`;
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
                                        <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                                        <span className="text-[10px] font-black uppercase tracking-tighter">Add Media</span>
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
                            className="px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || uploading}
                            className="bg-nordic-lake text-white px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : uploading ? 'Uploading image...' : (post ? 'Update Post' : 'Submit Post for Review')}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};
