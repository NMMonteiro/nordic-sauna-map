import React, { useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { LearningMaterial, MaterialType, LanguageCode } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const EducationPage = ({ lang }: { lang: LanguageCode }) => {
    const [materials, setMaterials] = useState<LearningMaterial[]>([]);
    const [filter, setFilter] = useState<MaterialType | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string | 'all'>('all');
    const [loading, setLoading] = useState(true);
    const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
    const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, Record<LanguageCode, string>>>({});

    const categoryTranslations: Record<string, Record<LanguageCode, string>> = {
        'Dialogue': { en: 'Dialogue', fi: 'Vuoropuhelu', sv: 'Dialog', ar: 'حوار', uk: 'Діалог' },
        'Pronouns': { en: 'Pronouns', fi: 'Pronominit', sv: 'Pronomen', ar: 'الضمائر', uk: 'Займенники' },
        'Flashcards': { en: 'Flashcards', fi: 'Muistikortit', sv: 'Flashkort', ar: 'بطاقات تعليمية', uk: 'Флешкартки' },
        'Nouns': { en: 'Nouns', fi: 'Substantiivit', sv: 'Substantiv', ar: 'الأسماء', uk: 'Іменники' },
        'Verbs': { en: 'Verbs', fi: 'Verbit', sv: 'Verb', ar: 'الأفعال', uk: 'Дієслова' },
        'Video': { en: 'Video', fi: 'Video', sv: 'Video', ar: 'فيديو', uk: 'Відео' },
        'Basic phrases': { en: 'Basic phrases', fi: 'Perusfraasit', sv: 'Grundläggande fraser', ar: 'عبارات أساسية', uk: 'Основні фрази' }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const transRef = doc(db, 'configs', 'category_translations');
            const transSnap = await getDoc(transRef);
            if (transSnap.exists()) {
                setDynamicTranslations(transSnap.data() as Record<string, Record<LanguageCode, string>>);
            }

            const q = query(collection(db, 'materials'), orderBy('created_at', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LearningMaterial[];
            setMaterials(data);
        } catch (err) {
            console.error('Error fetching materials:', err);
        } finally {
            setLoading(false);
        }
    };

    // Reset category filter when type filter changes
    useEffect(() => {
        setCategoryFilter('all');
    }, [filter]);

    const typeFilteredMaterials = filter === 'all'
        ? materials
        : materials.filter(m => m.type === filter);
        
    const categories = Array.from(new Set(typeFilteredMaterials.map(m => m.category).filter(Boolean)));
    
    const filteredMaterials = categoryFilter === 'all'
        ? typeFilteredMaterials
        : typeFilteredMaterials.filter(m => m.category === categoryFilter);

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
        try {
            let downloadUrl = material.url;
            
            if (!downloadUrl && material.file_path) {
                const storageRef = ref(storage, material.file_path);
                downloadUrl = await getDownloadURL(storageRef);
            }
            
            if (!downloadUrl) return;

            // Fetch the file as a blob to force a direct download instead of opening in a new tab
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = blobUrl;
            
            // Generate a clean filename based on the title
            let extension = '.pdf';
            if (material.type === 'presentation') extension = '.pptx';
            else if (material.type === 'video') extension = '.mp4';
            
            const rawTitle = typeof material.title === 'string' ? material.title : (material.title.en || 'Untitled');
            const fileName = `${rawTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}${extension}`;
            
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(blobUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed, falling back to new tab:', error);
            // Fallback: If CORS blocks the fetch or it fails, just open it in a new tab
            const fallbackUrl = material.url || (material.file_path ? await getDownloadURL(ref(storage, material.file_path)) : '');
            if (fallbackUrl) window.open(fallbackUrl, '_blank');
        }
    };

    return (
        <div className="bg-bg-surface text-text-main transition-colors duration-300 min-h-screen pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-40">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] left-[-10%] w-[50%] h-[50%] bg-indigo-50/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                <header className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-bg-card border border-border-main mb-6"
                    >
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Resource Hub</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl md:text-7xl font-semibold text-text-main mb-8 uppercase tracking-tight font-display"
                    >
                        {
                            {
                                sv: 'Finskt Lärcenter',
                                fi: 'Suomen kielen oppimiskeskus',
                                en: 'Finnish Learning Hub',
                                ar: 'مركز تعلم اللغة الفنلندية',
                                uk: 'Центр вивчення фінської мови'
                            }[lang] || 'Finnish Learning Hub'
                        }
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto font-light leading-relaxed font-body"
                    >
                        {
                            {
                                sv: 'Upptäck resurser designade för att stödja din finska språkinlärning och kulturella integration.',
                                fi: 'Tutustu resursseihin, jotka on suunniteltu tukemaan suomen kielen oppimista ja kulttuurista integraatiota.',
                                en: 'Discover resources designed to support your Finnish language learning and cultural integration.',
                                ar: 'اكتشف الموارد المصممة لدعم تعلم اللغة الفنلندية والاندماج الثقافي.',
                                uk: 'Відкрийте для себе ресурси, розроблені для підтримки вашого вивчення фінської мови та культурної інтеграції.'
                            }[lang] || 'Discover resources designed to support your Finnish language learning and cultural integration.'
                        }
                    </motion.p>
                </header>

                {/* Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col items-center gap-6 mb-16"
                >
                    <div className="flex flex-wrap justify-center gap-3">
                        {['all', 'pdf', 'presentation', 'video', 'twee'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t as any)}
                                className={cn(
                                    "px-8 py-3.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all duration-300 border shadow-sm active:scale-95 font-body",
                                    filter === t
                                        ? "bg-text-main text-bg-surface border-text-main shadow-xl shadow-black/10"
                                        : "bg-bg-card border-border-main text-text-muted hover:border-primary/40 hover:text-primary"
                                )}
                            >
                                {t === 'all' ? (
                                    {
                                        sv: 'Alla',
                                        fi: 'Kaikki',
                                        en: 'All',
                                        ar: 'الكل',
                                        uk: 'Всі'
                                    }[lang] || 'All'
                                ) : (
                                    t === 'twee' ? (
                                        {
                                            sv: 'interaktiva övningar',
                                            fi: 'interaktiiviset harjoitukset',
                                            en: 'interactive exercises',
                                            ar: 'تمارين تفاعلية',
                                            uk: 'інтерактивні вправи'
                                        }[lang] || 'interactive exercises'
                                    ) : t
                                )}
                            </button>
                        ))}
                    </div>
                    
                    {categories.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="flex flex-wrap justify-center gap-2 pt-4 border-t border-border-main/50 w-full max-w-3xl"
                        >
                            <button
                                onClick={() => setCategoryFilter('all')}
                                className={cn(
                                    "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                    categoryFilter === 'all'
                                        ? "bg-primary text-white shadow-md shadow-primary/20"
                                        : "bg-bg-surface border border-border-main text-text-muted hover:border-primary/30 hover:text-primary"
                                )}
                            >
                                {
                                    {
                                        sv: 'Alla kategorier',
                                        fi: 'Kaikki kategoriat',
                                        en: 'All Categories',
                                        ar: 'جميع الفئات',
                                        uk: 'Всі категорії'
                                    }[lang] || 'All Categories'
                                }
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={cn(
                                        "px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                                        categoryFilter === cat
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "bg-bg-surface border border-border-main text-text-muted hover:border-primary/30 hover:text-primary"
                                    )}
                                >
                                    {(dynamicTranslations[cat]?.[lang]) || (categoryTranslations[cat]?.[lang]) || cat}
                                </button>
                            ))}
                        </motion.div>
                    )}
                </motion.div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-96 gap-6">
                        <div className="relative size-16">
                            <div className="absolute inset-0 border-4 border-primary/10 rounded-full" />
                            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                            {
                                {
                                    sv: 'Laddar arkiv...',
                                    fi: 'Ladataan arkistoa...',
                                    en: 'Loading Archive...',
                                    ar: 'جاري تحميل الأرشيف...',
                                    uk: 'Завантаження архіву...'
                                }[lang] || 'Loading Archive...'
                            }
                        </p>
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
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                        {filteredMaterials.map((material) => (
                            <motion.div
                                key={material.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0 }
                                }}
                                className="group relative bg-bg-card border-2 border-border-main/60 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/40 transition-all duration-500 cursor-pointer flex flex-col rounded-[2rem]"
                                onClick={() => setSelectedMaterial(material)}
                            >
                                <div className="aspect-[4/3] bg-bg-surface relative overflow-hidden">
                                    <img
                                        src={material.thumbnail || {
                                            pdf: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
                                            presentation: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?auto=format&fit=crop&q=80&w=800',
                                            video: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=800',
                                            twee: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=800'
                                        }[material.type] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800'}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={typeof material.title === 'string' ? material.title : (material.title[lang as keyof typeof material.title] || material.title.en || 'Untitled')}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                                        <div className="size-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                            <span className="material-symbols-outlined text-white text-xl">open_in_full</span>
                                        </div>
                                    </div>
                                    <div className="absolute top-6 right-6 bg-bg-card/95 px-4 py-2 rounded-full flex items-center gap-2 text-text-main shadow-xl border border-border-main">
                                        <span className="material-symbols-outlined text-sm text-primary">{getIcon(material.type)}</span>
                                        <span className="text-xs font-semibold uppercase tracking-wide">{material.type === 'twee' ? 'interactive exercises' : material.type}</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-lg font-semibold text-text-main mb-3 group-hover:text-primary transition-colors duration-300 leading-tight font-display">
                                        {typeof material.title === 'string' ? material.title : (material.title[lang as keyof typeof material.title] || material.title.en || 'Untitled')}
                                    </h3>
                                    <p className="text-text-muted text-xs font-light leading-relaxed mb-6 line-clamp-3 font-body">
                                        {typeof material.description === 'string' ? material.description : (material.description[lang as keyof typeof material.description] || material.description.en || 'No description')}
                                    </p>
                                    <div className="mt-auto pt-6 border-t border-border-main flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="size-2 rounded-full bg-primary animate-pulse" />
                                            <span className="text-xs font-semibold uppercase tracking-wide text-text-muted opacity-60">Ready to use</span>
                                        </div>
                                        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary group-hover:gap-4 transition-all duration-300">
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
            <AnimatePresence>
                {selectedMaterial && (
                    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-10">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                            onClick={() => setSelectedMaterial(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-bg-card w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col border border-border-main"
                        >
                            <div className="flex items-center justify-between px-8 py-6 border-b border-border-main/50">
                                <div>
                                    <h2 className="text-xl font-semibold text-text-main leading-tight mb-1 font-display">
                                        {typeof selectedMaterial.title === 'string' ? selectedMaterial.title : (selectedMaterial.title[lang as keyof typeof selectedMaterial.title] || selectedMaterial.title.en || 'Untitled')}
                                    </h2>
                                    <p className="text-xs font-semibold text-text-muted uppercase tracking-[0.2em] font-body">
                                        {selectedMaterial.type === 'twee' ? 'interactive exercises' : selectedMaterial.type}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {(selectedMaterial.type === 'pdf' || selectedMaterial.type === 'presentation') && (
                                        <button
                                            onClick={() => handleDownload(selectedMaterial)}
                                            className="hidden md:flex items-center gap-2 bg-text-main text-bg-surface px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wide hover:scale-105 transition-all shadow-xl shadow-black/10"
                                        >
                                            <span className="material-symbols-outlined text-sm">download</span>
                                            Download Resource
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setSelectedMaterial(null)}
                                        className="size-12 bg-bg-surface rounded-full flex items-center justify-center text-text-muted hover:bg-red-50 hover:text-red-500 transition-all border border-border-main"
                                    >
                                        <span className="material-symbols-outlined font-semibold">close</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 min-h-0 bg-bg-surface relative overflow-hidden">
                                {selectedMaterial.type === 'video' ? (
                                    <iframe
                                        src={`https://www.youtube.com/embed/${getYouTubeId(selectedMaterial.url || '')}`}
                                        className="w-full h-full border-none"
                                        allowFullScreen
                                    ></iframe>
                                ) : selectedMaterial.type === 'twee' ? (
                                    selectedMaterial.embed_code ? (
                                        <div 
                                            className="absolute inset-0 w-full h-full [&_iframe]:!w-full [&_iframe]:!h-full [&_iframe]:!border-none bg-white overflow-hidden rounded-b-[2.5rem]"
                                            dangerouslySetInnerHTML={{ __html: selectedMaterial.embed_code }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-bg-surface">
                                            <div className="relative mb-8">
                                                <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-2xl"></div>
                                                <span className="material-symbols-outlined text-[120px] text-primary relative z-1">interactive_space</span>
                                            </div>
                                            <h3 className="text-xl font-semibold text-text-main mb-4 uppercase tracking-tight font-display">Interactive Exercise</h3>
                                            <p className="text-text-muted max-w-md mb-10 text-lg font-light leading-relaxed font-body">
                                                This interactive exercise is designed to be completed in a focused, full-screen environment.
                                            </p>
                                            <a
                                                href={selectedMaterial.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="bg-primary text-white px-12 py-5 rounded-[2rem] font-semibold uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 font-body"
                                            >
                                                Launch Exercise
                                                <span className="material-symbols-outlined">open_in_new</span>
                                            </a>
                                        </div>
                                    )
                                ) : selectedMaterial.type === 'pdf' ? (
                                    <iframe
                                        src={selectedMaterial.url}
                                        className="w-full h-full border-none"
                                    ></iframe>
                                ) : selectedMaterial.type === 'presentation' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-bg-surface">
                                        <div className="relative mb-8">
                                            <div className="absolute inset-0 bg-primary/10 rounded-full scale-150 blur-2xl"></div>
                                            <span className="material-symbols-outlined text-[120px] text-primary relative z-1">present_to_all</span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-text-main mb-4 uppercase tracking-tight font-display">PowerPoint Presentation</h3>
                                        <p className="text-text-muted max-w-md mb-10 text-lg font-light leading-relaxed font-body">
                                            For the best viewing experience, download this presentation to view it in PowerPoint or your preferred presentation software.
                                        </p>
                                        <button
                                            onClick={() => handleDownload(selectedMaterial)}
                                            className="bg-primary text-white px-12 py-5 rounded-[2rem] font-semibold uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 font-body"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            Download Presentation
                                        </button>
                                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mt-8 font-body">
                                            {selectedMaterial.file_path?.split('/').pop()}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                                        <span className="material-symbols-outlined text-8xl text-primary/20 mb-6">{getIcon(selectedMaterial.type)}</span>
                                        <h3 className="text-2xl font-semibold text-text-main mb-4 uppercase font-display">Resource Available</h3>
                                        <p className="text-text-muted max-w-md mb-8 font-body">This {selectedMaterial.type} resource is available for download or viewing.</p>
                                        <a
                                            href={selectedMaterial.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-primary text-white px-10 py-4 rounded-2xl font-semibold uppercase tracking-wide shadow-xl shadow-primary/20 hover:scale-105 transition-transform font-body"
                                        >
                                            Open Full Resource
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div >
                    </div >
                )}
            </AnimatePresence>
        </div >
    );
};


const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};
