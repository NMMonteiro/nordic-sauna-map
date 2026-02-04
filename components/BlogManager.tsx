import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { BlogPostEditor } from './BlogPostEditor';

interface BlogManagerProps {
    posts: any[];
    t: any;
    onRefresh: () => void;
    profile: any;
    user: any;
    lang: any;
}

export const BlogManager: React.FC<BlogManagerProps> = ({ posts, t, onRefresh, profile, user, lang }) => {
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<any | null>(null);

    const canManage = (post: any) => {
        if (!profile) return false;
        if (profile.role === 'admin') return true;
        return post.author_id === profile.id;
    };

    const deletePost = async (id: string) => {
        if (!confirm('Are you sure you want to delete this story?')) return;
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) {
            alert(`Delete failed: ${error.message}`);
        } else {
            onRefresh();
        }
    };

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase
            .from('blog_posts')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            alert(`Moderation failed: ${error.message}`);
        } else {
            onRefresh();
        }
    };

    const startEdit = (post: any) => {
        setEditingPost(post);
        setShowEditor(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-900 uppercase">
                    {t.blog || 'Sauna Stories'}
                </h2>
                <button
                    onClick={() => {
                        setEditingPost(null);
                        setShowEditor(true);
                    }}
                    className="bg-primary text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    Share New Story
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {posts.length === 0 ? (
                    <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">No stories yet</div>
                ) : posts.map((p: any) => (
                    <div key={p.id} className="bg-white p-4 lg:p-6 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                        <div className="flex items-center gap-6 w-full">
                            <div className="size-20 lg:size-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                                {(() => {
                                    let urls = [];
                                    try {
                                        const raw = p.media_urls || p.media;
                                        if (Array.isArray(raw)) urls = raw;
                                        else if (typeof raw === 'string' && raw.startsWith('[')) urls = JSON.parse(raw);
                                        else if (typeof raw === 'string') urls = [raw];
                                    } catch (e) { }

                                    const firstImg = urls?.[0];
                                    const resolveUrl = (url: string) => {
                                        if (!url || typeof url !== 'string') return '';
                                        if (url.startsWith('http')) return url;
                                        return `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/blog-media/${url.startsWith('/') ? url.slice(1) : url}`;
                                    };

                                    return firstImg ? (
                                        <img src={resolveUrl(firstImg)} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=?'} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <span className="material-symbols-outlined text-3xl">auto_stories</span>
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-black text-sm lg:text-base text-slate-900 uppercase truncate">{p.title}</h4>
                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {p.status}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.category} • {new Date(p.created_at).toLocaleDateString()}</p>
                                    {p.profiles?.full_name && (
                                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter self-start">by {p.profiles.full_name}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            {profile?.role === 'admin' && p.status === 'pending_approval' && (
                                <>
                                    <button
                                        onClick={() => updateStatus(p.id, 'approved')}
                                        className="flex-1 sm:flex-none px-4 py-3 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => updateStatus(p.id, 'rejected')}
                                        className="flex-1 sm:flex-none px-4 py-3 bg-white border border-amber-200 text-amber-600 rounded-xl text-[10px] font-black uppercase hover:bg-amber-50 transition-all"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {canManage(p) && (
                                <>
                                    <button
                                        onClick={() => startEdit(p)}
                                        className="flex-1 sm:flex-none px-6 py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all"
                                    >
                                        {t.edit || 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => deletePost(p.id)}
                                        className="flex-shrink-0 size-11 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showEditor && (
                <BlogPostEditor
                    lang={lang}
                    user={user}
                    post={editingPost}
                    onClose={() => setShowEditor(false)}
                    onSuccess={() => {
                        setShowEditor(false);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
};
