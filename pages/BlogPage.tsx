import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { BlogPost, LanguageCode, Profile } from '../types';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const BlogPage = ({
    lang,
    user,
    profile,
    onWritePost
}: {
    lang: LanguageCode,
    user: User | null,
    profile: Profile | null,
    onWritePost: () => void
}) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Sauna Stories', 'Tradition', 'Wellness', 'Events'];

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('blog_posts')
            .select('*, profiles(full_name)')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching posts:', error);
        } else {
            const formattedPosts = (data || []).map(p => {
                const profileObj = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;

                let mediaUrls = [];
                try {
                    if (Array.isArray(p.media_urls)) mediaUrls = p.media_urls;
                    else if (typeof p.media_urls === 'string') mediaUrls = JSON.parse(p.media_urls);
                } catch (e) { }

                return {
                    ...p,
                    media_urls: Array.isArray(mediaUrls) ? mediaUrls : [],
                    author_name: profileObj?.full_name || 'Anonymous'
                };
            });
            setPosts(formattedPosts);
        }
        setLoading(false);
    };

    const handleSelectPost = async (post: BlogPost) => {
        setSelectedPost(post);
        // Increment view count via RPC
        await supabase.rpc('increment_blog_view', { post_id: post.id });
    };

    const calculateReadTime = (text: string) => {
        const wordsPerMinute = 200;
        const words = text.trim().split(/\s+/).length;
        return Math.ceil(words / wordsPerMinute);
    };

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                post.content.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [posts, searchQuery, activeCategory]);

    const featuredPost = filteredPosts[0];
    const restPosts = filteredPosts.slice(1);

    return (
        <div className="bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 min-h-screen pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-blue-50/50 rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-50/40 rounded-full" />
            </div>

            {/* Minimal Header */}
            <header className="px-6 max-w-[1440px] mx-auto text-center mb-24 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block px-4 py-1.5 mb-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-black tracking-[0.4em] uppercase"
                >
                    Cultural Heritage
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase leading-[0.85]"
                >
                    Nordic <br />
                    <span className="text-primary italic">Archive</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed"
                >
                    {lang === 'sv'
                        ? 'En digital samling av nordisk bastukultur, berättad av människorna som lever den.'
                        : 'A premium digital gathering of Nordic sauna culture, told by the people who live it.'}
                </motion.p>
            </header>

            {/* Filter Bar */}
            <div className="sticky top-16 z-50 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-800 mb-20 transition-colors">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-24 flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95",
                                    activeCategory === cat
                                        ? "bg-slate-900 dark:bg-primary text-white shadow-2xl shadow-slate-900/20"
                                        : "text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-6 flex-1 max-w-sm">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-lg">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search the archive..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest placeholder:text-slate-300 dark:placeholder:text-slate-600 dark:text-white focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                            />
                        </div>
                        {user && (
                            <button
                                onClick={onWritePost}
                                className="bg-primary text-white size-14 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                            >
                                <span className="material-symbols-outlined font-black">add</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                        <div className="relative size-16">
                            <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 animate-pulse">Loading Stories...</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-24 text-center border border-slate-100 dark:border-slate-800 transition-colors">
                        <span className="material-symbols-outlined text-6xl text-slate-100 dark:text-slate-800 mb-6">explore_off</span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">No Matches Found</h3>
                        <p className="text-slate-400 font-light mt-2">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="space-y-24">
                        {/* FEATURED HERO */}
                        {featuredPost && activeCategory === 'All' && !searchQuery && (
                            <article
                                onClick={() => handleSelectPost(featuredPost)}
                                className="relative h-[650px] rounded-[3.5rem] overflow-hidden group cursor-pointer shadow-2xl"
                            >
                                {featuredPost.media_urls?.[0] ? (
                                    <img src={featuredPost.media_urls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt={featuredPost.title} />
                                ) : (
                                    <div className="w-full h-full bg-slate-900" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-12 md:p-20">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="bg-primary text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">Featured Story</span>
                                        <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{calculateReadTime(featuredPost.content)} min read</span>
                                    </div>
                                    <h2 className="text-4xl md:text-7xl font-black text-white uppercase mb-8 leading-[0.9] tracking-tighter max-w-3xl">
                                        {featuredPost.title}
                                    </h2>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-black border border-white/20">{featuredPost.author_name?.charAt(0)}</div>
                                            <div className="text-white font-bold uppercase text-[10px] tracking-widest">{featuredPost.author_name}</div>
                                        </div>
                                        <div className="h-4 w-px bg-white/20" />
                                        <div className="text-white/60 font-bold uppercase text-[10px] tracking-widest">{new Date(featuredPost.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </article>
                        )}

                        {/* MAGAZINE GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {(activeCategory === 'All' && !searchQuery ? restPosts : filteredPosts).map((post, i) => (
                                <article
                                    key={post.id}
                                    onClick={() => handleSelectPost(post)}
                                    className="group cursor-pointer flex flex-col"
                                >
                                    <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden mb-8 shadow-xl">
                                        {post.media_urls?.[0] ? (
                                            <img src={post.media_urls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={post.title} />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600">
                                                <span className="material-symbols-outlined text-4xl">image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <span className="bg-white/95 text-slate-900 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest self-start">{post.category || 'Sauna Story'}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-white text-slate-900 size-16 rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl">
                                                <span className="material-symbols-outlined">menu_book</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        <span className="size-1 rounded-full bg-slate-200" />
                                        <span>{calculateReadTime(post.content)} min read</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase leading-none mb-4 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h3>
                                    <div className="text-slate-500 dark:text-slate-400 font-light text-sm line-clamp-3 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: post.content }} />
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black text-slate-400">{post.author_name?.charAt(0)}</div>
                                            <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{post.author_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[10px] font-black text-slate-300 uppercase">
                                            <span className="material-symbols-outlined text-xs">visibility</span>
                                            {post.views || 0}
                                        </div>
                                    </div>
                                </article>
                            ))}


                        </div>
                    </div>
                )}
            </div>

            {/* Post Modal */}
            {selectedPost && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-slate-900/95 dark:bg-slate-950/95" onClick={() => setSelectedPost(null)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full max-w-5xl h-full rounded-[4rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-500">
                        <div className="absolute top-8 right-8 z-10 flex gap-4">
                            <button className="size-14 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-2xl">
                                <span className="material-symbols-outlined">share</span>
                            </button>
                            <button
                                onClick={() => setSelectedPost(null)}
                                className="size-14 bg-white shadow-2xl rounded-full flex items-center justify-center text-slate-900 hover:scale-110 transition-all"
                            >
                                <span className="material-symbols-outlined font-black">close</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {selectedPost.media_urls && selectedPost.media_urls.length > 0 && (
                                <div className="w-full h-[60vh] relative">
                                    <img src={selectedPost.media_urls[0]} className="w-full h-full object-cover" alt={selectedPost.title} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                                </div>
                            )}

                            <div className={`px-8 md:px-24 py-16 relative z-1 bg-white dark:bg-slate-900 rounded-t-[5rem] ${selectedPost.media_urls?.length ? '-mt-32' : ''}`}>
                                <div className="flex flex-wrap items-center gap-6 mb-12">
                                    <span className="bg-slate-900 dark:bg-primary text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPost.category || 'Sauna Story'}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black text-lg">
                                            {selectedPost.author_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Created By</p>
                                            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{selectedPost.author_name}</p>
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Published</p>
                                        <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{new Date(selectedPost.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="h-8 w-px bg-slate-100 dark:bg-slate-800" />
                                    <div className="flex items-center gap-4 text-slate-300">
                                        <div className="flex items-center gap-1 text-[10px] font-black"><span className="material-symbols-outlined text-sm">schedule</span> {calculateReadTime(selectedPost.content)} MIN</div>
                                        <div className="flex items-center gap-1 text-[10px] font-black"><span className="material-symbols-outlined text-sm">visibility</span> {(selectedPost.views || 0) + 1} VIEWS</div>
                                    </div>
                                </div>

                                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-12 leading-[0.9] tracking-tighter uppercase">{selectedPost.title}</h1>

                                <div
                                    className="prose dark:prose-invert prose-slate prose-xl max-w-none font-light text-slate-600 dark:text-slate-400 leading-relaxed mb-20 first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left"
                                    dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                                />

                                {selectedPost.media_urls && selectedPost.media_urls.length > 1 && (
                                    <div className="space-y-8">
                                        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 text-center mb-8">Story Gallery</h4>
                                        <div className="columns-1 md:columns-2 gap-8 space-y-8">
                                            {selectedPost.media_urls.slice(1).map((url, i) => (
                                                <img key={i} src={url} className="rounded-[2.5rem] w-full shadow-xl hover:scale-105 transition-transform duration-700" alt={`Gallery ${i}`} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-24 pt-12 border-t border-slate-100 flex flex-col items-center gap-6">
                                    <p className="text-xs font-black uppercase tracking-widest text-slate-300">Share this story</p>
                                    <div className="flex gap-4">
                                        {['facebook', 'twitter', 'link'].map(icon => (
                                            <button key={icon} className="size-16 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all">
                                                <span className="material-symbols-outlined">{icon === 'link' ? 'content_copy' : icon}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
