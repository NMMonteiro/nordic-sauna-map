import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { LearningMaterial, MaterialType, LanguageCode } from '../types';

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

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getResourceUrl = (material: LearningMaterial) => {
        if (material.url && material.url.trim() !== '') return material.url;
        if (material.file_path && material.file_path.trim() !== '') {
            const { data } = supabase.storage.from('education').getPublicUrl(material.file_path);
            return data.publicUrl;
        }
        return null;
    };

    const handleDownload = async (material: LearningMaterial) => {
        if (!material.file_path) {
            const url = getResourceUrl(material);
            if (url) window.open(url, '_blank');
            return;
        }

        try {
            const { data, error } = await supabase.storage.from('education').download(material.file_path);
            if (error) throw error;

            // Create a blob URL and trigger download
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
            // Fallback to opening in new tab
            const url = getResourceUrl(material);
            if (url) window.open(url, '_blank');
        }
    };

    return (
        <div className="bg-snow min-h-screen py-24">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 uppercase tracking-tight">
                        {lang === 'sv' ? 'Pedagogiskt Arkiv' : lang === 'fi' ? 'Pedagoginen arkisto' : 'Pedagogical Archive'}
                    </h1>
                    <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
                        {lang === 'sv'
                            ? 'Upptäck resurser designade för att föra det nordiska arvet in i klassrummet.'
                            : 'Discover resources designed to bring Nordic heritage into the classroom.'}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {['all', 'pdf', 'presentation', 'video', 'twee'].map((t) => (
                        <button
                            key={t}
                            onClick={() => setFilter(t as any)}
                            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${filter === t
                                ? 'bg-nordic-lake border-transparent text-white shadow-lg shadow-primary/20'
                                : 'bg-white border-sky/10 text-slate-500 hover:border-primary/30'
                                }`}
                        >
                            {t.charAt(0) ? t.toUpperCase() : t}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredMaterials.map((material) => (
                            <div
                                key={material.id}
                                className="bg-white rounded-[2rem] border border-sky/10 overflow-hidden group hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer"
                                onClick={() => setSelectedMaterial(material)}
                            >
                                <div className="aspect-video bg-frost relative overflow-hidden">
                                    {(material.thumbnail || material.type) ? (
                                        <img
                                            src={material.thumbnail || {
                                                pdf: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800',
                                                presentation: 'https://images.unsplash.com/photo-1517245385169-d2089c6d6d4a?auto=format&fit=crop&q=80&w=800',
                                                video: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&q=80&w=800',
                                                twee: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
                                            }[material.type] || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            alt={material.title}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-primary/20">
                                            <span className="material-symbols-outlined text-6xl">{getIcon(material.type)}</span>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md size-10 rounded-full flex items-center justify-center text-primary shadow-lg">
                                        <span className="material-symbols-outlined text-xl">{getIcon(material.type)}</span>
                                    </div>
                                </div>
                                <div className="p-8">
                                    <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors">{material.title}</h3>
                                    <p className="text-slate-500 text-sm font-light line-clamp-2 mb-6">{material.description}</p>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>{material.type}</span>
                                        <span className="text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                            View Resource <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Viewer Modal */}
            {selectedMaterial && (
                <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl" onClick={() => setSelectedMaterial(null)}></div>
                    <div className="relative bg-white w-full h-full rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between px-8 py-6 border-b border-sky/10">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 leading-tight mb-1">{selectedMaterial.title}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{selectedMaterial.type}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {(selectedMaterial.type === 'pdf' || selectedMaterial.type === 'presentation') && (
                                    <button
                                        onClick={() => handleDownload(selectedMaterial)}
                                        className="hidden md:flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        <span className="material-symbols-outlined text-sm">download</span>
                                        Download Resource
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedMaterial(null)}
                                    className="size-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
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
                                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
                                        <span className="material-symbols-outlined text-[120px] text-primary relative z-1">interactive_space</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Interactive Exercise</h3>
                                    <p className="text-slate-500 max-w-md mb-10 text-lg font-light leading-relaxed">
                                        This Twee exercise is designed to be completed in a focused, full-screen environment.
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
                                        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
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
