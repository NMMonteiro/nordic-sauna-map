import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { BlogPost, LanguageCode, Profile } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export const BlogPage = ({
    lang,
    user,
    profile,
    onWritePost
}: {
    lang: LanguageCode,
    user: FirebaseUser | null,
    profile: Profile | null,
    onWritePost: () => void
}) => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [categories, setCategories] = useState<string[]>(['All']);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { getDoc } = await import('firebase/firestore');
                const docRef = doc(db, 'configs', 'education_categories');
                const snap = await getDoc(docRef);
                if (snap.exists() && snap.data().items) {
                    setCategories(['All', ...snap.data().items]);
                }
            } catch (err) {
                console.error('Failed to fetch categories:', err);
            }
        };
        fetchCategories();
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'blog_posts'),
                where('status', '==', 'approved'),
                orderBy('created_at', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];

            const formattedPosts = data.map(p => ({
                ...p,
                media_urls: Array.isArray(p.media_urls) ? p.media_urls : [],
                author_name: p.author_name || 'Anonymous'
            }));
            setPosts(formattedPosts);
        } catch (err) {
            console.error('Error fetching posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPost = async (post: BlogPost) => {
        setSelectedPost(post);
        try {
            const postRef = doc(db, 'blog_posts', post.id);
            await updateDoc(postRef, {
                views: increment(1)
            });
        } catch (err) {
            console.error('Error incrementing views:', err);
        }
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
        <div className="bg-bg-surface text-text-main transition-colors duration-300 min-h-screen pt-28 md:pt-40 pb-16 md:pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[70%] h-[70%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-50/10 rounded-full blur-3xl" />
            </div>

            {/* Minimal Header */}
            <header className="px-6 max-w-[1440px] mx-auto text-center mb-12 md:mb-24 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-block px-4 py-1.5 mb-6 md:mb-8 rounded-full bg-bg-card border border-border-main text-text-muted text-[10px] md:text-xs font-semibold tracking-[0.4em] uppercase"
                >
                    Cultural Integration
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl md:text-9xl font-semibold text-text-main mb-8 tracking-tight uppercase leading-[0.85] font-display"
                >
                    {
                        {
                            sv: <>Workshop <br /><span className="text-primary italic">Berättelser</span></>,
                            fi: <>Työpaja <br /><span className="text-primary italic">Tarinoita</span></>,
                            en: <>Workshop <br /><span className="text-primary italic">Stories</span></>,
                            ar: <>قصص <br /><span className="text-primary italic">ورش العمل</span></>,
                            uk: <>Історії <br /><span className="text-primary italic">Воркшопів</span></>
                        }[lang] || <>Workshop <br /><span className="text-primary italic">Stories</span></>
                    }
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg md:text-xl text-text-muted font-light max-w-2xl mx-auto leading-relaxed font-body"
                >
                    {
                        {
                            sv: 'En samling berättelser från våra finska språkinlärningsworkshops och integrationsresor.',
                            fi: 'Kokoelma tarinoita suomen kielen työpajoistamme ja integraatiomatkoistamme.',
                            en: 'A collection of stories from our Finnish language workshops and integration journeys.',
                            ar: 'مجموعة من القصص من ورش عمل اللغة الفنلندية ورحلات الاندماج الخاصة بنا.',
                            uk: 'Колекція історій з наших воркшопів фінської мови та шляхів інтеграції.'
                        }[lang] || 'A collection of stories from our Finnish language workshops and integration journeys.'
                    }
                </motion.p>
            </header>

            {/* Filter Bar */}
            <div className="sticky top-[60px] md:top-16 z-50 bg-bg-surface/90 backdrop-blur-md border-y border-border-main/50 mb-10 md:mb-20 transition-colors">
                <div className="max-w-[1440px] mx-auto px-4 md:px-12 h-20 md:h-24 flex items-center justify-between gap-4 md:gap-8">
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all whitespace-nowrap active:scale-95 font-body cursor-pointer",
                                    activeCategory === cat
                                        ? "bg-text-main text-bg-surface shadow-2xl shadow-black/10"
                                        : "text-text-muted hover:text-text-main"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-6 flex-1 max-w-sm">
                        <div className="relative w-full">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted/40 text-lg">search</span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={
                                    {
                                        sv: 'Sök i arkivet...',
                                        fi: 'Hae arkistosta...',
                                        en: 'Search the archive...',
                                        ar: 'ابحث في الأرشيف...',
                                        uk: 'Шукати в архіві...'
                                    }[lang] || 'Search the archive...'
                                }
                                className="w-full bg-bg-card border-none rounded-2xl pl-12 pr-6 py-4 text-xs font-semibold uppercase tracking-wide placeholder:text-text-muted/30 text-text-main focus:ring-4 focus:ring-primary/5 transition-all outline-none font-body"
                            />
                        </div>
                        {user && (
                            <button
                                onClick={onWritePost}
                                className="bg-primary text-white size-14 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                            >
                                <span className="material-symbols-outlined font-semibold">add</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                        <div className="relative size-16">
                            <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-text-muted opacity-50 animate-pulse">Loading Stories...</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="bg-bg-card rounded-[2rem] md:rounded-[3rem] p-12 md:p-24 text-center border border-border-main transition-colors mx-4 md:mx-0">
                        <span className="material-symbols-outlined text-4xl md:text-2xl text-text-muted/20 mb-4 md:mb-6">explore_off</span>
                        <h3 className="text-xl md:text-2xl font-semibold text-text-main uppercase font-display">No Matches Found</h3>
                        <p className="text-text-muted text-sm md:text-base font-light mt-2 font-body">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div className="space-y-12 md:space-y-24">
                        {/* FEATURED HERO */}
                        {featuredPost && activeCategory === 'All' && !searchQuery && (
                            <article
                                onClick={() => handleSelectPost(featuredPost)}
                                className="relative h-[650px] rounded-[3.5rem] overflow-hidden group cursor-pointer shadow-2xl"
                            >
                                {featuredPost.media_urls?.[0] ? (
                                    <img src={featuredPost.media_urls[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]" alt={featuredPost.title} />
                                ) : (
                                    <div className="w-full h-full bg-text-main" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-12 md:p-20">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="bg-primary text-white px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wide shadow-lg">Featured Story</span>
                                        <span className="text-white/60 text-xs font-medium uppercase tracking-wide font-body">{calculateReadTime(featuredPost.content)} min read</span>
                                    </div>
                                    <h2 className="text-2xl md:text-7xl font-semibold text-white uppercase mb-8 leading-[0.9] tracking-tight max-w-3xl font-display">
                                        {featuredPost.title}
                                    </h2>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 bg-white/10 rounded-full flex items-center justify-center text-white text-sm font-semibold border border-white/20">{featuredPost.author_name?.charAt(0)}</div>
                                            <div className="text-white font-medium uppercase text-xs tracking-wide font-body">{featuredPost.author_name}</div>
                                        </div>
                                        <div className="h-4 w-px bg-white/20" />
                                        <div className="text-white/60 font-medium uppercase text-xs tracking-wide font-body">{new Date(featuredPost.created_at).toLocaleDateString()}</div>
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
                                            <div className="w-full h-full bg-bg-card flex items-center justify-center text-text-muted/20">
                                                <span className="material-symbols-outlined text-2xl">image</span>
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                                            <span className="bg-bg-card/95 text-text-main px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide self-start shadow-xl border border-border-main">{post.category || 'Workshop Story'}</span>
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-bg-surface text-text-main size-16 rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-2xl">
                                                <span className="material-symbols-outlined">menu_book</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-4 text-xs font-semibold text-text-muted uppercase tracking-wide font-body">
                                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                        <span className="size-1 rounded-full bg-border-main" />
                                        <span>{calculateReadTime(post.content)} min read</span>
                                    </div>
                                    <h3 className="text-2xl font-semibold text-text-main uppercase leading-none mb-4 group-hover:text-primary transition-colors line-clamp-2 font-display">{post.title}</h3>
                                    <div className="text-text-muted font-light text-sm line-clamp-3 leading-relaxed mb-6 font-body" dangerouslySetInnerHTML={{ __html: post.content }} />
                                    <div className="mt-auto flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 bg-bg-card rounded-full flex items-center justify-center text-xs font-semibold text-text-muted border border-border-main">{post.author_name?.charAt(0)}</div>
                                            <span className="text-xs font-semibold text-text-main uppercase tracking-tight font-body">{post.author_name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs font-semibold text-text-muted/40 uppercase font-body">
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
            <AnimatePresence>
                {selectedPost && (
                    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/95 backdrop-blur-md"
                            onClick={() => setSelectedPost(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-bg-card w-full max-w-5xl h-full rounded-[4rem] overflow-hidden shadow-2xl flex flex-col border border-border-main"
                        >
                            <div className="absolute top-8 right-8 z-10 flex gap-4">
                                <button className="size-14 bg-white/10 border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-primary transition-all shadow-2xl">
                                    <span className="material-symbols-outlined">share</span>
                                </button>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="size-14 bg-bg-surface shadow-2xl rounded-full flex items-center justify-center text-text-main hover:scale-110 transition-all border border-border-main"
                                >
                                    <span className="material-symbols-outlined font-semibold">close</span>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                {selectedPost.media_urls && selectedPost.media_urls.length > 0 && (
                                    <div className="w-full h-[60vh] relative">
                                        <img src={selectedPost.media_urls[0]} className="w-full h-full object-cover" alt={selectedPost.title} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent"></div>
                                    </div>
                                )}

                                <div className={`px-8 md:px-24 py-16 relative z-1 bg-bg-card rounded-t-[5rem] ${selectedPost.media_urls?.length ? '-mt-32' : ''}`}>
                                    <div className="flex flex-wrap items-center gap-6 mb-12">
                                        <span className="bg-text-main text-bg-surface px-6 py-2 rounded-full text-xs font-semibold uppercase tracking-wide font-body">{selectedPost.category || 'Workshop Story'}</span>
                                        <div className="flex items-center gap-3">
                                            <div className="size-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-lg">
                                                {selectedPost.author_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted font-body">Created By</p>
                                                <p className="font-medium text-text-main text-sm font-display">{selectedPost.author_name}</p>
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-border-main" />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted font-body">Published</p>
                                            <p className="font-medium text-text-main text-sm font-display">{new Date(selectedPost.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="h-8 w-px bg-border-main" />
                                        <div className="flex items-center gap-4 text-text-muted/40 font-body">
                                            <div className="flex items-center gap-1 text-xs font-semibold"><span className="material-symbols-outlined text-sm">schedule</span> {calculateReadTime(selectedPost.content)} MIN</div>
                                            <div className="flex items-center gap-1 text-xs font-semibold"><span className="material-symbols-outlined text-sm">visibility</span> {(selectedPost.views || 0) + 1} VIEWS</div>
                                        </div>
                                    </div>

                                    <h1 className="text-xl md:text-7xl font-semibold text-text-main mb-12 leading-[0.9] tracking-tight uppercase font-display">{selectedPost.title}</h1>

                                    <div
                                        className="prose dark:prose-invert prose-slate prose-xl max-w-none font-light text-text-muted leading-relaxed mb-20 first-letter:text-7xl first-letter:font-semibold first-letter:text-primary first-letter:mr-3 first-letter:float-left font-body"
                                        dangerouslySetInnerHTML={{ __html: selectedPost.content }}
                                    />

                                    {selectedPost.media_urls && selectedPost.media_urls.length > 1 && (
                                        <div className="space-y-8">
                                            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted/40 text-center mb-8 font-body">Story Gallery</h4>
                                            <div className="columns-1 md:columns-2 gap-8 space-y-8">
                                                {selectedPost.media_urls.slice(1).map((url, i) => (
                                                    <img key={i} src={url} className="rounded-[2.5rem] w-full shadow-xl hover:scale-105 transition-transform duration-700" alt={`Gallery ${i}`} />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-24 pt-12 border-t border-border-main flex flex-col items-center gap-6">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted/40 font-body">Share this story</p>
                                        <div className="flex gap-4">
                                            {['facebook', 'twitter', 'link'].map(icon => (
                                                <button key={icon} className="size-16 rounded-full border border-border-main flex items-center justify-center text-text-muted/40 hover:bg-text-main hover:text-bg-surface hover:border-text-main transition-all">
                                                    <span className="material-symbols-outlined">{icon === 'link' ? 'content_copy' : icon}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

