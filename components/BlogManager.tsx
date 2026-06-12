import React, { useState } from 'react';
import { db } from '../lib/firebase';
import {
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { BlogPostEditor } from './BlogPostEditor';
import { ConfirmModal } from './ui/ConfirmModal';

import { BlogPost, LanguageCode } from '../types';
import { User as FirebaseUser } from 'firebase/auth'; // Assuming User is needed or used as 'any' currently

interface BlogManagerProps {
    posts: any[];
    t: any;
    onRefresh: () => void;
    profile: any;
    user: any;
    lang: LanguageCode;
}

export const BlogManager: React.FC<BlogManagerProps> = ({ posts, t, onRefresh, profile, user, lang }) => {
    const [showEditor, setShowEditor] = useState(false);
    const [editingPost, setEditingPost] = useState<any | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [categories, setCategories] = useState<string[]>(['Sauna Stories', 'Tradition', 'Wellness', 'Events']);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { getDoc } = await import('firebase/firestore');
                const docRef = doc(db, 'configs', 'education_categories');
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().items) {
                    setCategories(snap.data().items);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
    }, []);
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
        confirmText: 'Delete'
    });

    const canManage = (post: any) => {
        if (!profile) return false;
        if (profile.role === 'admin') return true;
        return post.author_id === profile.id;
    };

    const deletePost = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Post',
            message: 'Are you sure you want to permanently delete this post? This action cannot be undone.',
            confirmText: 'Delete',
            isDestructive: true,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'blog_posts', id));
                    onRefresh();
                } catch (err: any) {
                    console.error('Error deleting post:', err);
                    alert(`Delete failed: ${err.message}`);
                }
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
        try {
            await updateDoc(doc(db, 'blog_posts', id), {
                status,
                updated_at: serverTimestamp()
            });
            onRefresh();
        } catch (err: any) {
            alert(`Moderation failed: ${err.message}`);
        }
    };

    const startEdit = (post: any) => {
        setEditingPost(post);
        setShowEditor(true);
    };

    const filteredPosts = posts.filter(p => {
        const matchSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) || p.content?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchCategory = categoryFilter === 'All' || p.category === categoryFilter;
        return matchSearch && matchStatus && matchCategory;
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                <div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Blog Manager</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage blog posts and review community submissions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setEditingPost(null);
                            setShowEditor(true);
                        }}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Create New Post
                    </button>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search posts by title or content..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                
                <div className="flex gap-4">
                    <div className="relative min-w-[160px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">category</span>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="All">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>

                    <div className="relative min-w-[160px]">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">filter_list</span>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="All">All Statuses</option>
                            <option value="approved">Published</option>
                            <option value="pending_approval">Pending Review</option>
                            <option value="rejected">Rejected</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredPosts.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-slate-300 font-semibold tracking-wide">No posts found.</div>
                ) : filteredPosts.map((p: any) => (
                    <div key={p.id} className="relative bg-white p-5 rounded-[2rem] border border-slate-200 flex flex-col gap-4 group hover:shadow-md hover:shadow-slate-200/50 transition-all overflow-hidden">
                        
                        <div className="flex items-start gap-4">
                            <div className="size-16 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0 border border-slate-100 flex items-center justify-center">
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
                                        return url;
                                    };

                                    return firstImg ? (
                                        <img src={resolveUrl(firstImg)} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=?'} />
                                    ) : (
                                        <span className="material-symbols-outlined text-2xl text-slate-300">auto_stories</span>
                                    );
                                })()}
                            </div>
                            <div className="flex-1 min-w-0 pr-12">
                                <h4 className="font-semibold text-slate-900 text-base truncate">{p.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${p.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : p.status === 'pending_approval' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                        {p.status === 'approved' ? 'Published' : p.status === 'pending_approval' ? 'Pending' : 'Rejected'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-wider truncate">{p.category}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-auto bg-slate-50 p-3 rounded-xl">
                            <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                                {new Date(p.created_at).toLocaleDateString()}
                            </p>
                            {p.profiles?.full_name && (
                                <p className="text-xs font-medium text-slate-500 flex items-center gap-1 truncate">
                                    <span className="material-symbols-outlined text-[14px]">person</span>
                                    By {p.profiles.full_name}
                                </p>
                            )}
                        </div>

                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManage(p) && (
                                <button onClick={() => startEdit(p)} className="size-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 shadow-sm transition-all" title="Edit Post">
                                    <span className="material-symbols-outlined text-[16px]">edit</span>
                                </button>
                            )}
                            {profile?.role === 'admin' && p.status === 'pending_approval' && (
                                <>
                                    <button onClick={() => updateStatus(p.id, 'approved')} className="size-8 bg-white border border-emerald-100 rounded-full flex items-center justify-center text-emerald-500 hover:bg-emerald-50 shadow-sm transition-all" title="Approve">
                                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                    </button>
                                    <button onClick={() => updateStatus(p.id, 'rejected')} className="size-8 bg-white border border-red-100 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-sm transition-all" title="Reject">
                                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                                    </button>
                                </>
                            )}
                            {(canManage(p) || profile?.role === 'admin') && (
                                <button onClick={() => deletePost(p.id)} className="size-8 bg-white border border-red-100 rounded-full flex items-center justify-center text-red-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all" title="Delete">
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                </button>
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
                    onClose={() => {
                        setShowEditor(false);
                        setEditingPost(null);
                    }}
                    onSuccess={() => {
                        setShowEditor(false);
                        setEditingPost(null);
                        onRefresh();
                    }}
                />
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
