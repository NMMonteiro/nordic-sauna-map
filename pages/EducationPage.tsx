import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LearningMaterial, MaterialType, LanguageCode } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const EducationPage = ({ lang }: { lang: LanguageCode }) => {
    const [materials, setMaterials] = useState<LearningMaterial[]>([]);
    const [filter, setFilter] = useState<MaterialType | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('learning_materials')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching materials:', error);
        } else {
            setMaterials(data || []);
        }
        setLoading(false);
    };

    const filteredMaterials = filter === 'all'
        ? materials
        : materials.filter(m => m.type === filter);

    const getIcon = (type: MaterialType) => {
        switch (type) {
            case 'pdf': return 'description';
            case 'presentation': return 'present_to_all';
            case 'video': return 'play_circle';
            case 'twee': return 'interactive_space';
            default: return 'help';
        }
    };

    const handleDownload = async (material: LearningMaterial) => {
        if (!material.file_path) {
            const url = material.url;
            if (url) window.open(url, '_blank');
            return;
        }

        try {
            const { data, error } = await supabase.storage.from('education').download(material.file_path);
            if (error) throw error;

            const blobUrl = window.URL.createObjectURL(data);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', material.file_path.split('/').pop() || 'resource');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div className="bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 min-h-screen pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-40">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/50 rounded-full" />
                <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-sky-100/30 rounded-full" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                <header className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6"
                    >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Resource Hub</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 uppercase tracking-tighter"
                    >
                        {lang === 'sv' ? 'Pedagogiskt Arkiv' : lang === 'fi' ? 'Pedagoginen arkisto' : 'Pedagogical Archive'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        {lang === 'sv'
                            ? 'Upptäck resurser designade för att föra det nordiska arvet in i klassrummet.'
                            : 'Discover premium resources designed to bring Nordic heritage into the classroom.'}
                    </motion.p>
                </header>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-3 mb-16"
                >
                    {['all', 'pdf', 'presentation', 'video', 'twee'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t as any)}
                            className={cn(
                                "px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 border shadow-sm active:scale-95",
                                filter === t
                                    ? "bg-slate-900 dark:bg-primary border-slate-900 dark:border-primary text-white shadow-xl shadow-slate-900/20"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary/40 hover:text-primary dark:hover:text-white"
                            )}
                        >
                            {t === 'all' ? (lang === 'sv' ? 'Alla' : lang === 'fi' ? 'Kaikki' : 'All') : (t === 'twee' ? 'interactive exercises' : t)}
                        </button>
                    ))}
                </motion.div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-96 gap-6">
                        <div className="relative size-16">
                            <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Archive...</p>
                    </div>
                ) : (
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.1 }
                            }
                        }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredMaterials.map((material) => (
                            <motion.div
                                key={material.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="group relative bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer flex flex-col"
                                onClick={() => setSelectedMaterial(material)}
                            >
                                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                                    <img
                                        src={material.thumbnail || {
                                            pdf: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
                                            presentation: 'https://images.unsplash.com/photo-1517245385169-d2089c6d6d4a?auto=format&fit=crop&q=80&w=800',
                                            video: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800',
                                            twee: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
                                        }[material.type] || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={material.title}
                                    />
                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        <div className="size-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <span className="material-symbols-outlined text-white text-3xl">open_in_full</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-6 right-6 bg-white/95 dark:bg-slate-900/95 px-4 py-2 rounded-full flex items-center gap-2 text-slate-900 dark:text-white shadow-xl border border-white/20 dark:border-white/10">
                                        <span className="material-symbols-outlined text-sm text-primary">{getIcon(material.type)}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest">{material.type === 'twee' ? 'interactive exercises' : material.type}</span>
                                    </div>
                                </div>
                                <div className="p-10 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 group-hover:text-primary transition-colors duration-300 leading-tight">
                                        {material.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-light leading-relaxed mb-8 line-clamp-3">
                                        {material.description}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ready to use</span>
                                        </div>
                                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:gap-4 transition-all duration-300">
                                            Explore <span className="material-symbols-outlined text-sm">east</span>
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>

            {/* Content Viewer Modal */}
            {selectedMaterial && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-slate-900/90 dark:bg-slate-950/95" onClick={() => setSelectedMaterial(null)}></div>
                    <div className="relative bg-white dark:bg-slate-900 w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-sky/10 dark:border-slate-800">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1">{selectedMaterial.title}</h2>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                    {selectedMaterial.type === 'twee' ? 'interactive exercises' : selectedMaterial.type}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                {(selectedMaterial.type === 'pdf' || selectedMaterial.type === 'presentation') && (
                                    <button
                                        onClick={() => handleDownload(selectedMaterial)}
                                        className="hidden md:flex items-center gap-2 bg-slate-900 dark:bg-primary text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download Resource
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedMaterial(null)}
                                    className="size-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all"
                                >
                                    <span className="material-symbols-outlined font-black">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-frost relative overflow-hidden">
                            {selectedMaterial.type === 'video' ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedMaterial.url || '')}`}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                ></iframe>
                            ) : selectedMaterial.type === 'twee' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                                        <span className="material-symbols-outlined text-[120px] text-primary relative z-1">interactive_space</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Interactive Exercise</h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 text-lg font-light leading-relaxed">
                                        This interactive exercise is designed to be completed in a focused, full-screen environment.
                                    </p>
                                    <a
                                        href={selectedMaterial.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                                    >
                                        Launch Exercise
                                        <span className="material-symbols-outlined">open_in_new</span>
                                    </a>
                                </div>
                            ) : selectedMaterial.type === 'pdf' ? (
                                <iframe
                                    src={selectedMaterial.url || (selectedMaterial.file_path ? `${supabase.storage.from('education').getPublicUrl(selectedMaterial.file_path).data.publicUrl}#toolbar=0` : '')}
                                    className="w-full h-full border-none"
                                ></iframe>
                            ) : selectedMaterial.type === 'presentation' ? (
                                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                                    <div className="relative mb-8">
                                        <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                                        <span className="material-symbols-outlined text-[120px] text-primary relative z-1">present_to_all</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">PowerPoint Presentation</h3>
                                    <p className="text-slate-500 max-w-md mb-10 text-lg font-light leading-relaxed">
                                        For the best viewing experience, download this presentation to view it in PowerPoint or your preferred presentation software.
                                    </p>
                                    <button
                                        onClick={() => handleDownload(selectedMaterial)}
                                        className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                        Download Presentation
                                    </button>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8">
                                        {selectedMaterial.file_path?.split('/').pop()}
                                    </p>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                                    <span className="material-symbols-outlined text-8xl text-primary/20 mb-6">{getIcon(selectedMaterial.type)}</span>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Resource Available</h3>
                                    <p className="text-slate-500 max-w-md mb-8">This {selectedMaterial.type} resource is available for download or viewing.</p>
                                    <a
                                        href={selectedMaterial.url || (selectedMaterial.file_path ? supabase.storage.from('education').getPublicUrl(selectedMaterial.file_path).data.publicUrl : '#')}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                    >
                                        Open Full Resource
                                    </a>
                                </div>
                            )}
                        </div>
                    </div >
                </div >
            )}
        </div >
    );
};

const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};
