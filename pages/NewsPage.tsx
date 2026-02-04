import React, { useEffect, useState } from 'react';
import { LanguageCode } from '../types';

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
        fetch('https://api.curator.io/v1/feeds/39fd0fd7-ebb9-432d-af60-d95b6d6512e8/posts?limit=100')
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
            subtitle: "Follow our journey across the Nordic region through our social media updates.",
            loading: "Loading the latest updates...",
            followUs: "Follow us on Social Media",
            loadMore: "Load More Posts",
            allUpdates: "All updates"
        },
        sv: {
            title: "Social Hubb",
            subtitle: "Följ vår resa genom Norden via våra sociala medier.",
            loading: "Laddar senaste uppdateringarna...",
            followUs: "Följ oss på sociala medier",
            loadMore: "Ladda fler inlägg",
            allUpdates: "Alla uppdateringar"
        },
        fi: {
            title: "Sosiaalinen Hubi",
            subtitle: "Seuraa matkaamme Pohjoismaissa sosiaalisen median päivitystemme kautta.",
            loading: "Ladataan viimeisimmät päivitykset...",
            followUs: "Seuraa meitä somessa",
            loadMore: "Lataa lisää viestejä",
            allUpdates: "Kaikki päivitykset"
        }
    }[lang];

    return (
        <div className="min-h-screen bg-snow pt-32 pb-24">
            <div className="max-w-[1200px] mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase bg-primary/5">
                        {t.followUs}
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight uppercase">
                        {t.title}
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
                        {t.subtitle}
                    </p>

                    {/* Platform Filters */}
                    <div className="mt-12 flex flex-wrap justify-center gap-3">
                        <button
                            onClick={() => handleFilterClick('all')}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${activeFilter === 'all'
                                ? 'bg-primary text-white shadow-primary/20'
                                : 'bg-white text-slate-500 border border-slate-100 hover:border-primary/20 hover:text-primary'
                                }`}
                        >
                            {t.allUpdates}
                        </button>
                        <button
                            onClick={() => handleFilterClick('instagram')}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'instagram'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white text-slate-500 border border-slate-100 hover:border-primary/20 hover:text-primary'
                                }`}
                        >
                            <i className="fa-brands fa-instagram"></i> Instagram
                        </button>
                        <button
                            onClick={() => handleFilterClick('facebook')}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'facebook'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white text-slate-500 border border-slate-100 hover:border-primary/20 hover:text-primary'
                                }`}
                        >
                            <i className="fa-brands fa-facebook-f"></i> Facebook
                        </button>
                        <button
                            onClick={() => handleFilterClick('youtube')}
                            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeFilter === 'youtube'
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'bg-white text-slate-500 border border-slate-100 hover:border-primary/20 hover:text-primary'
                                }`}
                        >
                            <i className="fa-brands fa-youtube"></i> YouTube
                        </button>
                    </div>
                </div>

                {/* Posts Grid */}
                <div className="bg-white rounded-[3rem] p-4 md:p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 min-h-[800px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="size-20 border-4 border-slate-50 border-t-primary rounded-full animate-spin mb-6"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{t.loading}</p>
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
                                        className="w-[280px] bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group"
                                    >
                                        {/* Post Image */}
                                        {post.image && (
                                            <div className="w-full h-[200px] bg-slate-100 overflow-hidden">
                                                <img
                                                    src={post.image}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
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
                                                    <p className="text-xs font-bold text-slate-900 truncate">{post.user_full_name || post.user_screen_name}</p>
                                                    <p className="text-[10px] text-slate-400">{formatDate(post.source_created_at)}</p>
                                                </div>
                                            </div>

                                            {/* Post Text */}
                                            <p className="text-sm text-slate-700 line-clamp-3 leading-relaxed">
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
                                        className="px-12 py-4 bg-primary text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-3"
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
