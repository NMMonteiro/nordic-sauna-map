import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Workshop, LanguageCode } from '../types';
import { ArrowRight, Calendar, Users } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface WorkshopsPageProps {
    lang: LanguageCode;
}

export const WorkshopsPage: React.FC<WorkshopsPageProps> = ({ lang }) => {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);
    const [loading, setLoading] = useState(true);

    const { t } = useTranslation();

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const q = query(collection(db, 'workshops'), orderBy('created_at', 'desc'));
                const snap = await getDocs(q);
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Workshop));
                setWorkshops(data);
            } catch (err) {
                console.error("Error fetching workshops:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkshops();
    }, []);

    return (
        <div className="pt-32 pb-24 min-h-screen bg-bg-surface">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                
                {/* Header Section */}
                <div className="max-w-3xl mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-6 block font-body"
                    >
                        Suomiportaat
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-display text-4xl md:text-6xl lg:text-8xl font-semibold text-text-main mb-8 tracking-tight uppercase"
                    >
                        {t.workshopsTitle}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-text-muted font-medium leading-relaxed font-body"
                    >
                        {t.workshopsSubtitle}. {t.workshopsDesc}
                    </motion.p>
                </div>

                {/* Workshops Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-text-muted font-body">
                        {t.loadingWorkshops}
                    </div>
                ) : workshops.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-bg-card rounded-[3rem] border border-border-main text-center px-6">
                        <Calendar className="size-16 text-primary mb-6 opacity-50" />
                        <h3 className="font-display text-2xl font-semibold text-text-main mb-4">{t.noWorkshops}</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {workshops.map((w, i) => (
                            <motion.div
                                key={w.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="group cursor-pointer"
                                whileHover={{ y: -10 }}
                            >
                                <div className="aspect-[4/5] bg-bg-card mb-8 overflow-hidden rounded-[3rem] border border-border-main shadow-lg relative">
                                    <img 
                                        src={w.image || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070'} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.2] group-hover:grayscale-0" 
                                        alt={w.title[lang] || w.title.en} 
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                                    <div className="absolute top-6 left-6">
                                        <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white uppercase tracking-wide border border-white/20">
                                            {w.label || 'WORKSHOP'}
                                        </span>
                                    </div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <h3 className="font-display text-xl md:text-2xl font-semibold text-white leading-tight">
                                            {w.title[lang] || w.title.en}
                                        </h3>
                                    </div>
                                </div>
                                <div className="px-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary font-body">{w.date}</span>
                                        <div className="w-12 h-px bg-border-main group-hover:bg-primary transition-colors" />
                                    </div>
                                    <p className="text-text-muted text-sm font-body line-clamp-3 mb-6">
                                        {w.description?.[lang] || w.description?.en || ''}
                                    </p>
                                    
                                    {w.linkUrl ? (
                                        <a href={w.linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-main group-hover:text-primary transition-colors font-body">
                                            <span>{t.registerInfo}</span>
                                            <ArrowRight className="size-4" />
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-main group-hover:text-primary transition-colors font-body">
                                            <span>{t.viewDetails}</span>
                                            <ArrowRight className="size-4" />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
