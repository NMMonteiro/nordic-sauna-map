import React, { useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface NewsPageProps {
    lang: LanguageCode;
}

interface Post {
    id: string;
    network_name: string;
    text: string;
    image?: string;
    url: string;
    user_full_name: string;
    user_screen_name: string;
    user_image?: string;
    source_created_at: number;
}

export const NewsPage = ({ lang }: NewsPageProps) => {
    const [activeFilter, setActiveFilter] = useState<string>('all');
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(12);

    useEffect(() => {
        // Fetch posts from Curator.io API
        fetch('https://api.curator.io/v1/feeds/ab71ac99-a3cf-4bad-bc38-06fe24743d5d/posts?limit=100')
            .then(res => res.json())
            .then(data => {
                if (data.posts) {
                    setPosts(data.posts);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching posts:', err);
                setLoading(false);
            });
    }, []);

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
        setVisibleCount(12); // Reset visible count when filtering
    };

    const filteredPosts = activeFilter === 'all'
        ? posts
        : posts.filter(post => post.network_name?.toLowerCase() === activeFilter.toLowerCase());

    const visiblePosts = filteredPosts.slice(0, visibleCount);

    const getNetworkIcon = (network: string) => {
        switch (network?.toLowerCase()) {
            case 'instagram': return 'fa-instagram';
            case 'facebook': return 'fa-facebook-f';
            case 'youtube': return 'fa-youtube';
            case 'twitter': case 'x': return 'fa-x-twitter';
            default: return 'fa-share-alt';
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const t = {
        en: {
            title: "Social Hub",
            subtitle: "Stay updated with our latest workshops and community activities through our social media updates.",
            loading: "Filtering the latest pulses...",
            followUs: "Social Updates",
            loadMore: "Discover More Updates",
            allUpdates: "Everything"
        },
        sv: {
            title: "Social Hubb",
            subtitle: "Håll dig uppdaterad om våra senaste workshops och aktiviteter via våra sociala medier.",
            loading: "Hämtar senaste uppdateringarna...",
            followUs: "Sociala Uppdateringar",
            loadMore: "Se fler inlägg",
            allUpdates: "Alla uppdateringar"
        },
        fi: {
            title: "Sosiaalinen Hubi",
            subtitle: "Pysy ajan tasalla työpajoistamme ja yhteisön toiminnoista sosiaalisen median päivitystemme kautta.",
            loading: "Ladataan päivityksiä...",
            followUs: "Sosiaalinen Media",
            loadMore: "Lataa lisää viestejä",
            allUpdates: "Kaikki viestit"
        },
        ar: {
            title: "المركز الاجتماعي",
            subtitle: "ابق على اطلاع بأحدث ورش العمل والأنشطة المجتمعية من خلال تحديثات وسائل التواصل الاجتماعي الخاصة بنا.",
            loading: "تصفية أحدث النبضات...",
            followUs: "تحديثات اجتماعية",
            loadMore: "اكتشف المزيد",
            allUpdates: "كل شيء"
        },
        uk: {
            title: "Соціальний Хаб",
            subtitle: "Будьте в курсі наших останніх воркшопів та громадських заходів через наші оновлення в соціальних мережах.",
            loading: "Завантаження оновлень...",
            followUs: "Соціальні Оновлення",
            loadMore: "Завантажити ще",
            allUpdates: "Все"
        }
    }[lang] || {
        title: "Social Hub",
        subtitle: "Follow our journey across the Nordic region through our social media updates.",
        loading: "Loading updates...",
        followUs: "Social Updates",
        loadMore: "Load More",
        allUpdates: "All"
    };

    return (
        <div className="min-h-screen bg-bg-surface text-text-main transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-40">
                <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-indigo-50/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 mb-8 rounded-full bg-bg-card border border-border-main text-text-muted text-xs font-semibold tracking-[0.4em] uppercase"
                    >
                        {t.followUs}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-8xl font-semibold text-text-main mb-8 tracking-tight uppercase leading-[0.85] font-display"
                    >
                        {t.title.split(' ')[0]} <br />
                        <span className="text-primary italic">{t.title.split(' ')[1]}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto font-light leading-relaxed mb-12 font-body"
                    >
                        {t.subtitle}
                    </motion.p>

                    {/* Platform Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {['all', 'instagram', 'facebook'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => handleFilterClick(filter)}
                                className={cn(
                                    "px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all whitespace-nowrap active:scale-95 font-body cursor-pointer flex items-center gap-3",
                                    activeFilter === filter
                                        ? "bg-text-main text-bg-surface border-text-main shadow-2xl shadow-black/10"
                                        : "bg-bg-card border-border-main text-text-muted hover:border-primary/40 hover:text-primary"
                                )}
                            >
                                {filter !== 'all' && <i className={cn("fa-brands", getNetworkIcon(filter), "text-sm")}></i>}
                                {filter === 'all' ? t.allUpdates : filter}
                            </button>
                        ))}
                    </motion.div>
                </div>

                {/* Posts Content */}
                <div className="min-h-[800px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-40">
                            <div className="relative size-20 mb-10">
                                <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-text-muted opacity-50 animate-pulse">{t.loading}</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-4 justify-start">
                                {visiblePosts.map((post) => (
                                    <a
                                        key={post.id}
                                        href={post.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-[280px] bg-bg-card border border-border-main rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group"
                                    >
                                        {/* Post Image */}
                                        {post.image && (
                                            <div className="w-full h-[200px] bg-bg-surface overflow-hidden">
                                                <img
                                                    src={post.image}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                />
                                            </div>
                                        )}

                                        {/* Post Content */}
                                        <div className="p-4">
                                            {/* Network Icon & User */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className={`size-8 rounded-lg flex items-center justify-center text-white ${post.network_name?.toLowerCase() === 'instagram' ? 'bg-gradient-to-tr from-purple-500 to-pink-500' :
                                                    post.network_name?.toLowerCase() === 'facebook' ? 'bg-[#1877F2]' :
                                                        post.network_name?.toLowerCase() === 'youtube' ? 'bg-red-600' :
                                                            'bg-slate-400'
                                                    }`}>
                                                    <i className={`fa-brands ${getNetworkIcon(post.network_name)} text-sm`}></i>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium text-text-main truncate font-display">{post.user_full_name || post.user_screen_name}</p>
                                                    <p className="text-xs text-text-muted font-body">{formatDate(post.source_created_at)}</p>
                                                </div>
                                            </div>

                                            {/* Post Text */}
                                            <p className="text-sm text-text-muted line-clamp-3 leading-relaxed font-body">
                                                {post.text}
                                            </p>
                                        </div>
                                    </a>
                                ))}
                            </div>

                            {/* Load More Button */}
                            {visibleCount < filteredPosts.length && (
                                <div className="mt-12 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 12)}
                                        className="px-12 py-4 bg-primary text-white rounded-[2rem] font-semibold uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3 font-body"
                                    >
                                        <span className="material-symbols-outlined">expand_more</span>
                                        {t.loadMore}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
