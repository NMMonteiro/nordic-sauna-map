import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { LearningMaterial, MaterialType, LanguageCode } from '../types';
import { cn } from '../lib/utils';
import { resolveMediaUrl } from '../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';

export const EducationPage = ({ lang }: { lang: LanguageCode }) => {
    const [materials, setMaterials] = useState<LearningMaterial[]>([]);
    const [filter, setFilter] = useState<MaterialType | 'all'>('all');
    const [languageFilter, setLanguageFilter] = useState<LanguageCode | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
    const archiveTopRef = useRef<HTMLDivElement>(null);
    const isIOS = typeof navigator !== 'undefined' && (
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
    const [viewerMode, setViewerMode] = useState<'google' | 'direct'>(isIOS ? 'direct' : 'google');

    useEffect(() => {
        setViewerMode(isIOS ? 'direct' : 'google');
    }, [selectedMaterial?.id, isIOS]);

    const scrollToResults = () => {
        if (typeof window !== 'undefined' && archiveTopRef.current) {
            const yOffset = -90; // Clearance for fixed navbar
            const element = archiveTopRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
        }
    };

    const handleFilterChange = (newFilter: MaterialType | 'all') => {
        setFilter(newFilter);
        scrollToResults();
    };

    const handleLanguageFilterChange = (newLang: LanguageCode | 'all') => {
        setLanguageFilter(newLang);
        scrollToResults();
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'learning_materials'), orderBy('created_at', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LearningMaterial[];
            setMaterials(data || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMaterials = materials.filter(m => {
        const typeMatch = filter === 'all' || m.type === filter;
        const langMatch = languageFilter === 'all' || m.language === languageFilter || (!m.language && languageFilter === 'en');
        return typeMatch && langMatch;
    });

    const getIcon = (type: MaterialType) => {
        switch (type) {
            case 'pdf': return 'description';
            case 'presentation': return 'present_to_all';
            case 'video': return 'play_circle';
            case 'twee': return 'interactive_space';
            case 'lesson_plan': return 'menu_book';
            case 'article': return 'article';
            case 'worksheet': return 'edit_note';
            default: return 'description';
        }
    };

    const getCategoryLabel = (type: string) => {
        if (lang === 'fi') {
            switch (type) {
                case 'all': return 'Kaikki';
                case 'pdf': return 'PDF-tiedostot';
                case 'presentation': return 'Esitykset';
                case 'twee': return 'Interaktiiviset tehtävät';
                case 'video': return 'Videot';
                case 'lesson_plan': return 'Resurssit';
                case 'article': return 'Artikkelit';
                case 'worksheet': return 'Tehtävämonisteet';
                default: return type;
            }
        } else if (lang === 'sv') {
            switch (type) {
                case 'all': return 'Alla';
                case 'pdf': return 'PDF-filer';
                case 'presentation': return 'Presentationer';
                case 'twee': return 'Interaktiva övningar';
                case 'video': return 'Videor';
                case 'lesson_plan': return 'Resurser';
                case 'article': return 'Artiklar';
                case 'worksheet': return 'Arbetsblad';
                default: return type;
            }
        } else {
            switch (type) {
                case 'all': return 'All';
                case 'pdf': return 'PDFs';
                case 'presentation': return 'Presentations';
                case 'twee': return 'Interactive exercises';
                case 'video': return 'Videos';
                case 'lesson_plan': return 'Resources';
                case 'article': return 'Articles';
                case 'worksheet': return 'Worksheets';
                default: return type;
            }
        }
    };

    const getResolvedResourceUrl = (material: LearningMaterial | null): string => {
        if (!material) return '';
        if (material.url && material.url.startsWith('http')) {
            return material.url;
        }
        if (material.file_path && material.file_path.startsWith('http')) {
            return material.file_path;
        }
        if (material.file_path) {
            return resolveMediaUrl(material.file_path, 'education');
        }
        if (material.url) {
            return resolveMediaUrl(material.url, 'education');
        }
        return '';
    };

    const isPdfResource = (material: LearningMaterial | null): boolean => {
        if (!material) return false;
        if (material.type === 'pdf') return true;
        const url = (material.url || '').toLowerCase();
        const filePath = (material.file_path || '').toLowerCase();
        return url.includes('.pdf') || filePath.includes('.pdf');
    };

    const handleDownload = (material: LearningMaterial) => {
        try {
            const downloadUrl = getResolvedResourceUrl(material);
            if (!downloadUrl) {
                alert(lang === 'sv' ? 'Resurslänken är inte tillgänglig.' : lang === 'fi' ? 'Resurssilinkki ei ole saatavilla.' : 'Resource link is not available.');
                return;
            }

            const fileName = material.file_path?.split('/').pop() || 
                material.url?.split('/').pop()?.split('?')[0] || 
                `${material.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            alert(lang === 'sv' ? 'Kunde inte ladda ner resursen.' : lang === 'fi' ? 'Resurssin lataaminen epäonnistui.' : 'Failed to download resource.');
        }
    };

    const handleOpenNative = (material: LearningMaterial) => {
        const downloadUrl = getResolvedResourceUrl(material);
        if (downloadUrl) {
            window.open(downloadUrl, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 min-h-screen pt-32 pb-16 relative overflow-hidden">
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
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{lang === 'sv' ? 'Resurser' : lang === 'fi' ? 'Materiaalit' : 'Resource Hub'}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter"
                    >
                        {lang === 'sv' ? 'Resursarkiv' : lang === 'fi' ? 'Resurssiarkisto' : 'Resource Archive'}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-light leading-relaxed"
                    >
                        {lang === 'sv'
                            ? 'Utforska en växande samling av artiklar, videor, lektionsmaterial, presentationer och interaktiva resurser om nordisk bastukultur. Arkivet är utformat för utbildare, inlärare och alla som är intresserade av att upptäcka mer om bastutraditioner, historia, välbefinnande och vardagsliv.'
                            : lang === 'fi'
                                ? 'Tutustu kasvavaan kokoelmaan artikkeleita, videoita, oppimateriaaleja, esityksiä ja interaktiivisia resursseja pohjoismaisesta saunakulttuurista. Arkisto on suunniteltu kouluttajille, oppijoille ja kaikille saunaperinteistä, historiasta, hyvinvoinnista ja arjesta kiinnostuneille.'
                                : 'Explore a growing collection of articles, videos, lesson materials, presentations and interactive resources about Nordic sauna culture. The archive is designed for educators, learners and anyone interested in discovering more about sauna traditions, history, wellbeing and everyday life.'}
                    </motion.p>
                </header>

                {/* Target anchor for viewport repositioning */}
                <div ref={archiveTopRef} className="scroll-mt-28" />

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap justify-center gap-3 mb-6"
                >
                    {['all', 'pdf', 'presentation', 'video', 'twee', 'lesson_plan', 'article', 'worksheet'].map((t) => (
                        <button
                            key={t}
                            onClick={() => handleFilterChange(t as any)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm active:scale-95",
                                filter === t
                                    ? "bg-slate-900 dark:bg-primary border-slate-900 dark:border-primary text-white shadow-xl shadow-slate-900/20"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary/40 hover:text-primary dark:hover:text-white"
                            )}
                        >
                            {getCategoryLabel(t)}
                        </button>
                    ))}
                </motion.div>

                {/* Language Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap justify-center gap-2 mb-10"
                >
                    {['all', 'en', 'fi', 'sv'].map((l) => (
                        <button
                            key={l}
                            onClick={() => handleLanguageFilterChange(l as any)}
                            className={cn(
                                "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all duration-300 border shadow-sm active:scale-95",
                                languageFilter === l
                                    ? "bg-slate-900 dark:bg-primary border-slate-900 dark:border-primary text-white shadow-xl shadow-slate-900/20"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-primary/40 hover:text-primary dark:hover:text-white"
                            )}
                        >
                            {l === 'all' ? (lang === 'sv' ? 'Alla Språk' : lang === 'fi' ? 'Kaikki Kielet' : 'All Languages') : (l === 'en' ? 'English' : l === 'fi' ? 'Suomi' : 'Svenska')}
                        </button>
                    ))}
                </motion.div>

                {/* Results count & reset toolbar */}
                {!loading && (
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200/60 dark:border-slate-800 text-xs text-slate-500">
                        <span className="font-bold text-slate-700 dark:text-slate-300 tracking-wide">
                            {filteredMaterials.length}{' '}
                            {filteredMaterials.length === 1
                                ? (lang === 'sv' ? 'resurs tillgänglig' : lang === 'fi' ? 'resurssi saatavilla' : 'resource available')
                                : (lang === 'sv' ? 'resurser tillgängliga' : lang === 'fi' ? 'resurssia saatavilla' : 'resources available')}
                        </span>
                        {(filter !== 'all' || languageFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setFilter('all');
                                    setLanguageFilter('all');
                                    scrollToResults();
                                }}
                                className="text-primary hover:underline font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                            >
                                <span className="material-symbols-outlined text-sm">restart_alt</span>
                                <span>{lang === 'sv' ? 'Återställ filter' : lang === 'fi' ? 'Nollaa suodattimet' : 'Reset filters'}</span>
                            </button>
                        )}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-96 gap-6">
                        <div className="relative size-16">
                            <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Loading Archive...</p>
                    </div>
                ) : (
                    <div className="min-h-[550px] flex flex-col">
                        {filteredMaterials.length === 0 ? (
                            <div className="flex-1 py-16 px-6 text-center flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 my-8">
                                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                                    <span className="material-symbols-outlined text-3xl">inventory_2</span>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
                                    {lang === 'sv' ? 'Inga resurser matchar filtret' : lang === 'fi' ? 'Ei resursseja valitulle suodattimelle' : 'No Resources Found'}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6 font-light">
                                    {lang === 'sv'
                                        ? 'Det finns inga filer i denna kategori för det valda språket. Prova en annan kategori eller välj Alla Språk.'
                                        : lang === 'fi'
                                            ? 'Tässä kategoriassa ei ole tiedostoja valitulla kielellä. Kokeile toista kategoriaa tai valitse Kaikki Kielet.'
                                            : 'There are no files in this category for the selected language. Try another category or choose All Languages.'}
                                </p>
                                <button
                                    onClick={() => {
                                        setFilter('all');
                                        setLanguageFilter('all');
                                        scrollToResults();
                                    }}
                                    className="px-6 py-2.5 rounded-full bg-primary text-white text-xs font-black uppercase tracking-wider hover:bg-primary-hover active:scale-95 transition-all shadow-md shadow-primary/20"
                                >
                                    {lang === 'sv' ? 'Visa alla resurser' : lang === 'fi' ? 'Näytä kaikki' : 'Show All Resources'}
                                </button>
                            </div>
                        ) : (
                            <motion.div
                                key={`${filter}-${languageFilter}`}
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.08 }
                                    }
                                }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                                        src={resolveMediaUrl(material.thumbnail, 'education') || {
                                            pdf: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
                                            presentation: 'https://images.unsplash.com/photo-1517245385169-d2089c6d6d4a?auto=format&fit=crop&q=80&w=800',
                                            video: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800',
                                            twee: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800',
                                            lesson_plan: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800',
                                            article: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
                                            worksheet: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=800'
                                        }[material.type] || 'https://images.unsplash.com/photo-1531234799389-dcb7651eb0a2?auto=format&fit=crop&q=80&w=800'}
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
                                        <span className="text-[10px] font-black uppercase tracking-widest">{getCategoryLabel(material.type)}</span>
                                    </div>
                                    {material.language && (
                                        <div className="absolute top-6 left-6 bg-slate-900/90 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-xl border border-white/10">
                                            <span className="material-symbols-outlined text-[10px] text-primary">language</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{material.language === 'sv' ? 'SV' : material.language === 'fi' ? 'FI' : 'EN'}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-primary transition-colors duration-300 leading-tight">
                                        {material.title}
                                    </h3>
                                    <div className="mb-8">
                                        <p className="text-slate-500 dark:text-slate-400 text-[13px] font-light leading-relaxed line-clamp-3">
                                            {material.description}
                                        </p>
                                        {material.type === 'video' && (material.audio_language || material.subtitles_language || (material.subtitles_languages && material.subtitles_languages.length > 0)) && (
                                            <div className="flex flex-wrap gap-2 mt-4">
                                                {material.audio_language && (
                                                    <span className="text-[9px] font-black uppercase bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 px-2 py-1 rounded">
                                                        Audio: {material.audio_language}
                                                    </span>
                                                )}
                                                {material.subtitles_language && (
                                                    <span className="text-[9px] font-black uppercase bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                                                        Sub: {material.subtitles_language}
                                                    </span>
                                                )}
                                                {material.subtitles_languages?.map(lang => (
                                                    <span key={lang} className="text-[9px] font-black uppercase bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded">
                                                        Sub: {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
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
                )}
            </div>

            {/* Content Viewer Modal */}
            {selectedMaterial && (() => {
                const resolvedUrl = getResolvedResourceUrl(selectedMaterial);
                const resourceFileName = selectedMaterial.file_path?.split('/').pop() || 
                    selectedMaterial.url?.split('/').pop()?.split('?')[0] || 
                    `${selectedMaterial.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${selectedMaterial.type === 'presentation' ? 'pptx' : 'pdf'}`;

                return (
                    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-3 sm:p-4 md:p-8">
                        <div className="absolute inset-0 bg-slate-900/90 dark:bg-slate-950/95" onClick={() => setSelectedMaterial(null)}></div>
                        <div className="relative bg-white dark:bg-slate-900 w-full h-full max-h-[94vh] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                            <div className="flex items-center justify-between px-5 sm:px-8 py-4 sm:py-5 border-b border-sky/10 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900 z-10">
                                <div className="min-w-0 pr-3">
                                    <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-tight mb-1 truncate max-w-[200px] sm:max-w-md md:max-w-xl">
                                        {selectedMaterial.title}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                                        {getCategoryLabel(selectedMaterial.type)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                                    {(selectedMaterial.type === 'pdf' || selectedMaterial.type === 'presentation' || selectedMaterial.type === 'lesson_plan' || selectedMaterial.type === 'worksheet') && (
                                        <>
                                            <a
                                                href={resolvedUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md shadow-primary/20"
                                                title={lang === 'sv' ? 'Öppna i ny flik' : lang === 'fi' ? 'Avaa uuteen välilehteen' : 'Open in New Tab'}
                                            >
                                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                                <span className="hidden sm:inline">{lang === 'sv' ? 'Öppna' : lang === 'fi' ? 'Avaa' : 'Open'}</span>
                                            </a>
                                            <a
                                                href={resolvedUrl}
                                                download={resourceFileName}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md"
                                                title={lang === 'sv' ? 'Ladda ner resurs' : lang === 'fi' ? 'Lataa resurssi' : 'Download Resource'}
                                            >
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                <span className="hidden sm:inline">{lang === 'sv' ? 'Ladda ner' : lang === 'fi' ? 'Lataa' : 'Download'}</span>
                                            </a>
                                        </>
                                    )}
                                    <button
                                        onClick={() => setSelectedMaterial(null)}
                                        className="size-10 sm:size-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-all shrink-0"
                                        aria-label="Close"
                                    >
                                        <span className="material-symbols-outlined font-black text-lg">close</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-frost relative overflow-hidden">
                                {selectedMaterial.type === 'video' ? (
                                    getYouTubeId(selectedMaterial.url || '') ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getYouTubeId(selectedMaterial.url || '')}?rel=0&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                                            className="w-full h-full border-none"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        ></iframe>
                                    ) : selectedMaterial.url?.match(/\.(mp4|webm|ogg)$/i) ? (
                                        <video controls className="w-full h-full object-contain bg-black">
                                            <source src={selectedMaterial.url} />
                                        </video>
                                    ) : (
                                        <iframe
                                            src={selectedMaterial.url}
                                            className="w-full h-full border-none bg-white"
                                            allowFullScreen
                                        ></iframe>
                                    )
                                ) : selectedMaterial.type === 'twee' || selectedMaterial.type === 'article' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50">
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                                            <span className="material-symbols-outlined text-[120px] text-primary relative z-1">{selectedMaterial.type === 'article' ? 'article' : 'interactive_space'}</span>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">{selectedMaterial.type === 'article' ? 'External Article' : 'Interactive Exercise'}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 text-lg font-light leading-relaxed">
                                            {selectedMaterial.type === 'article' ? 'This link will take you to an external article or post.' : 'This interactive exercise is designed to be completed in a focused, full-screen environment.'}
                                        </p>
                                        <a
                                            href={selectedMaterial.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                                        >
                                            {selectedMaterial.type === 'article' ? 'Read Article' : 'Launch Exercise'}
                                            <span className="material-symbols-outlined">open_in_new</span>
                                        </a>
                                    </div>
                                ) : isPdfResource(selectedMaterial) ? (
                                    <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-100 dark:bg-slate-950">
                                        {/* Responsive PDF Viewer Top Bar */}
                                        <div className="px-4 py-2.5 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs shrink-0">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="material-symbols-outlined text-primary text-base shrink-0">picture_as_pdf</span>
                                                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px] sm:max-w-md">
                                                    {resourceFileName}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => setViewerMode(m => m === 'google' ? 'direct' : 'google')}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-primary transition-colors"
                                                    title="Switch preview engine"
                                                >
                                                    <span className="material-symbols-outlined text-xs">tune</span>
                                                    <span>{viewerMode === 'google' ? 'Google Docs' : 'Direct PDF'}</span>
                                                </button>
                                                <a
                                                    href={resolvedUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-primary text-white hover:bg-primary-hover shadow-sm transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-xs">fullscreen</span>
                                                    <span>{lang === 'sv' ? 'Helskärm' : lang === 'fi' ? 'Koko näyttö' : 'Fullscreen'}</span>
                                                </a>
                                            </div>
                                        </div>

                                        {/* Mobile Notice Bar */}
                                        <div className="sm:hidden px-4 py-2 bg-primary/10 text-primary border-b border-primary/20 flex items-center justify-between gap-2 text-[10px] font-bold shrink-0">
                                            <span className="truncate">
                                                {isIOS
                                                    ? (lang === 'sv' ? 'iPhone: Öppna i Safari för flersidig läsning & zoom' : lang === 'fi' ? 'iPhone: Avaa Safarissa monisivuista lukua varten' : 'iPhone: Tap Open to view all pages & pinch-zoom')
                                                    : (lang === 'sv' ? 'Mobiltips: Tryck på Öppna för helskärm och zoom' : lang === 'fi' ? 'Mobiilivinkki: Avaa koko ruudulla zoomausta varten' : 'Mobile tip: Tap Open for fullscreen & pinch-zoom')}
                                            </span>
                                            <a
                                                href={resolvedUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-black shrink-0 uppercase tracking-wider bg-primary text-white px-2.5 py-1 rounded-md text-[10px]"
                                            >
                                                {lang === 'sv' ? 'Öppna' : lang === 'fi' ? 'Avaa' : 'Open'}
                                            </a>
                                        </div>

                                        {/* PDF Frame */}
                                        <div className="flex-1 w-full h-full relative bg-slate-50 dark:bg-slate-900 overflow-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
                                            <iframe
                                                key={`${selectedMaterial.id}-${viewerMode}`}
                                                src={
                                                    viewerMode === 'google' && resolvedUrl.startsWith('http')
                                                        ? `https://docs.google.com/viewer?url=${encodeURIComponent(resolvedUrl)}&embedded=true`
                                                        : resolvedUrl
                                                }
                                                className="w-full h-full border-none bg-white min-h-[400px]"
                                                title={selectedMaterial.title}
                                                allowFullScreen
                                            />
                                        </div>
                                    </div>
                                ) : selectedMaterial.type === 'worksheet' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-50 dark:bg-slate-900/50">
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
                                            <span className="material-symbols-outlined text-[120px] text-primary relative z-1">edit_note</span>
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tight">Worksheet Document</h3>
                                        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-10 text-lg font-light leading-relaxed">
                                            {lang === 'sv' 
                                                ? 'Ladda ner detta arbetsblad för att skriva ut eller använda i undervisningen.' 
                                                : lang === 'fi' 
                                                    ? 'Lataa tämä tehtävämoniste tulostettavaksi tai käytettäväksi opetuksessa.' 
                                                    : 'Download this worksheet to print or use for class activities.'}
                                        </p>
                                        <a
                                            href={resolvedUrl}
                                            download={resourceFileName}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-primary hover:bg-primary-hover text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            {lang === 'sv' ? 'Ladda ner arbetsblad' : lang === 'fi' ? 'Lataa tehtävämoniste' : 'Download Worksheet'}
                                        </a>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8 truncate max-w-xs">
                                            {resourceFileName}
                                        </p>
                                    </div>
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
                                        <a
                                            href={resolvedUrl}
                                            download={resourceFileName}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-primary hover:bg-primary-hover text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            Download Presentation
                                        </a>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-8">
                                            {resourceFileName}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                                        <span className="material-symbols-outlined text-8xl text-primary/20 mb-6">{getIcon(selectedMaterial.type)}</span>
                                        <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase">Resource Available</h3>
                                        <p className="text-slate-500 max-w-md mb-8">This {selectedMaterial.type} resource is available for download or viewing.</p>
                                        <a
                                            href={selectedMaterial.url || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                                        >
                                            Open Full Resource
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div >
    );
};

const getYouTubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) return match[2];
    if (url.length === 11) return url;
    return null;
};
