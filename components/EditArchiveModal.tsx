import React, { useState } from 'react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ContentItem, AudioTrack, VideoClip, LanguageCode } from '../types';

import { cn } from '../lib/utils';

interface EditArchiveModalProps {
    item: ContentItem;
    lang: LanguageCode;
    onClose: () => void;
    onSave: (updatedItem: ContentItem) => Promise<void>;
}

type EditTab = 'details' | 'multimedia';


export const EditArchiveModal: React.FC<EditArchiveModalProps> = ({ item, lang, onClose, onSave }) => {

    const [activeTab, setActiveTab] = useState<EditTab>('details');
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [editedData, setEditedData] = useState<ContentItem>(() => {
        const m = item.media || ({} as any);
        const images = Array.isArray(m.images) ? m.images : [];
        const audio = Array.isArray(m.audio_interviews) ? m.audio_interviews : [];
        const video = Array.isArray(m.video_clips) ? m.video_clips : [];

        const sanitizedAudio = audio.map((a: any) => typeof a === 'string' ? { title: 'Untitled Recording', url: a } : a);
        const sanitizedVideo = video.map((v: any) => typeof v === 'string' ? { title: 'Untitled Clip', url: v } : v);

        return {
            ...item,
            category: item.category || 'General',
            content: {
                sv: { name: '', description: '', etiquette: '', ...item.content?.sv },
                fi: { name: '', description: '', etiquette: '', ...item.content?.fi },
                en: { name: '', description: '', etiquette: '', ...item.content?.en },
                ar: { name: '', description: '', etiquette: '', ...item.content?.ar },
                uk: { name: '', description: '', etiquette: '', ...item.content?.uk }
            },
            metadata: { region: '', type: 'general', ...item.metadata },
            media: {
                images: images,
                audio_interviews: sanitizedAudio,
                video_clips: sanitizedVideo,
                featured_image: m.featured_image || images[0] || ''
            }
        };
    });


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio' | 'video', idx?: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const folder = type === 'video' ? 'Videos' : type + 's';
        const filePath = `${folder}/${fileName}`;

        try {
            const storageRef = ref(storage, `material-media/${filePath}`);
            await uploadBytes(storageRef, file);
            const publicUrl = await getDownloadURL(storageRef);

            const newMedia = { ...editedData.media };
            if (type === 'image' && typeof idx === 'number') {
                newMedia.images[idx] = publicUrl;
                if (idx === 0) newMedia.featured_image = publicUrl;
            } else if (type === 'audio' && typeof idx === 'number') {
                newMedia.audio_interviews[idx].url = publicUrl;
            } else if (type === 'video' && typeof idx === 'number') {
                newMedia.video_clips[idx].url = publicUrl;
            }
            setEditedData({ ...editedData, media: newMedia });
        } catch (err: any) {
            alert('File upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        await onSave(editedData);
        setSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-[30000] flex items-center justify-center p-4 md:p-10">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={onClose}></div>

            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white/90 backdrop-blur-2xl border border-white/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 font-display">
                {/* Header */}
                <div className="px-10 py-8 bg-transparent border-b border-slate-200/50 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900 uppercase tracking-tight">Modify Archive Entry</h2>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-wide mt-1">Ref: {item.id}</p>
                    </div>

                    <button onClick={onClose} className="size-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Tabs Nav */}
                <div className="flex overflow-x-auto gap-4 px-10 py-6 bg-white border-b border-slate-100 no-scrollbar">
                    <TabButton active={activeTab === 'details'} onClick={() => setActiveTab('details')} label="General Info" icon="description" />
                    <TabButton active={activeTab === 'multimedia'} onClick={() => setActiveTab('multimedia')} label="Multimedia" icon="perm_media" />
                </div>


                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar max-h-[60vh]">
                    {activeTab === 'details' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label={`Entry Name (${lang.toUpperCase()})`}
                                    value={editedData.content[lang].name}
                                    onChange={(val: string) => {
                                        const next = { ...editedData.content };
                                        next[lang].name = val;
                                        setEditedData({ ...editedData, content: next });
                                    }}
                                />
                                <InputField
                                    label="Region / Category"
                                    value={editedData.metadata.region}
                                    onChange={(val: string) => setEditedData({ ...editedData, metadata: { ...editedData.metadata, region: val } })}
                                />

                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <InputField
                                    label="Category"
                                    value={editedData.category}
                                    onChange={(val: string) => setEditedData({ ...editedData, category: val })}
                                />
                            </div>


                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-slate-400 ml-2">Description / History ({lang.toUpperCase()})</label>
                                <textarea
                                    rows={5}
                                    className="w-full bg-slate-50 border-none rounded-3xl px-6 py-4 font-medium text-slate-700 focus:ring-2 focus:ring-primary leading-relaxed resize-none"
                                    value={editedData.content[lang].description}
                                    onChange={(e) => {
                                        const next = { ...editedData.content };
                                        next[lang].description = e.target.value;
                                        setEditedData({ ...editedData, content: next });
                                    }}
                                />
                            </div>
                        </div>
                    )}



                    {activeTab === 'multimedia' && (
                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2">
                            {/* Images Section */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase text-slate-900 tracking-wide pl-2">Photographic Archive</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(editedData.media.images || []).map((img, idx) => (
                                        <div key={idx} className={cn(
                                            "bg-slate-50 p-4 rounded-3xl border transition-all",
                                            editedData.media.featured_image === img ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20" : "border-slate-100"
                                        )}>
                                            <div className="aspect-video bg-white rounded-2xl overflow-hidden border border-slate-200 relative group">
                                                <img src={img} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Invalid+Image+URL'} />
                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                                    <div className="flex gap-2">
                                                        <label className="bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide cursor-pointer shadow-xl hover:scale-105 transition-all">
                                                            Replace
                                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image', idx)} />
                                                        </label>
                                                        <button
                                                            onClick={() => {
                                                                const next = editedData.media.images.filter((_, i) => i !== idx);
                                                                setEditedData({ ...editedData, media: { ...editedData.media, images: next } });
                                                            }}
                                                            className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide shadow-xl hover:scale-105 transition-all"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => setEditedData({ ...editedData, media: { ...editedData.media, featured_image: img } })}
                                                        className={cn(
                                                            "px-6 py-2 rounded-xl text-xs font-semibold uppercase tracking-wide shadow-xl hover:scale-105 transition-all",
                                                            editedData.media.featured_image === img
                                                                ? "bg-primary text-white"
                                                                : "bg-white text-slate-900"
                                                        )}
                                                    >
                                                        {editedData.media.featured_image === img ? '★ Featured' : 'Set Featured'}
                                                    </button>
                                                </div>
                                                {editedData.media.featured_image === img && (
                                                    <div className="absolute top-3 left-3 bg-primary text-white px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-[0.2em] shadow-lg">
                                                        Featured
                                                    </div>
                                                )}
                                            </div>
                                            <input
                                                className="w-full bg-white border-none rounded-xl px-4 py-2 text-xs font-medium text-slate-500 shadow-sm mt-3"
                                                value={img}
                                                onChange={(e) => {
                                                    const nextImages = [...editedData.media.images];
                                                    nextImages[idx] = e.target.value;
                                                    const nextMedia = { ...editedData.media, images: nextImages };
                                                    // If we're editing the URL of the image that was featured, update the featured_image URL too
                                                    if (editedData.media.featured_image === img) {
                                                        nextMedia.featured_image = e.target.value;
                                                    }
                                                    setEditedData({ ...editedData, media: nextMedia });
                                                }}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setEditedData({ ...editedData, media: { ...editedData.media, images: [...editedData.media.images, ''] } })}
                                        className="aspect-video border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 hover:text-primary hover:border-primary transition-all bg-white"
                                    >
                                        <span className="material-symbols-outlined text-xl mb-1">add_a_photo</span>
                                        <span className="text-xs font-semibold uppercase tracking-wide">Add Frame</span>
                                    </button>
                                </div>
                            </div>

                            {/* Audio Section */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase text-slate-900 tracking-wide pl-2">Oral Histories (Audio)</h3>
                                <div className="space-y-4">
                                    {(editedData.media.audio_interviews || []).map((audio, idx) => (
                                        <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-6 items-start">
                                            <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                                <span className="material-symbols-outlined">mic</span>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <input
                                                        placeholder="Track Title"
                                                        className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-medium text-slate-900 shadow-sm"
                                                        value={audio.title}
                                                        onChange={(e) => {
                                                            const next = [...editedData.media.audio_interviews];
                                                            next[idx].title = e.target.value;
                                                            setEditedData({ ...editedData, media: { ...editedData.media, audio_interviews: next } });
                                                        }}
                                                    />
                                                    <div className="relative">
                                                        <input
                                                            placeholder="Speaker Name"
                                                            className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-medium text-slate-900 shadow-sm"
                                                            value={audio.speaker || ''}
                                                            onChange={(e) => {
                                                                const next = [...editedData.media.audio_interviews];
                                                                next[idx].speaker = e.target.value;
                                                                setEditedData({ ...editedData, media: { ...editedData.media, audio_interviews: next } });
                                                            }}
                                                        />
                                                        <button
                                                            onClick={() => {
                                                                const next = editedData.media.audio_interviews.filter((_, i) => i !== idx);
                                                                setEditedData({ ...editedData, media: { ...editedData.media, audio_interviews: next } });
                                                            }}
                                                            className="absolute -top-2 -right-2 size-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-[14px]">close</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        placeholder="Audio URL"
                                                        className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-xs font-mono text-slate-500 shadow-sm"
                                                        value={audio.url}
                                                        onChange={(e) => {
                                                            const next = [...editedData.media.audio_interviews];
                                                            next[idx].url = e.target.value;
                                                            setEditedData({ ...editedData, media: { ...editedData.media, audio_interviews: next } });
                                                        }}
                                                    />
                                                    <label className="h-10 px-4 bg-primary text-white rounded-xl flex items-center justify-center cursor-pointer font-semibold text-xs uppercase tracking-wide shadow-lg shadow-primary/20">
                                                        Upload
                                                        <input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio', idx)} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setEditedData({ ...editedData, media: { ...editedData.media, audio_interviews: [...editedData.media.audio_interviews, { title: '', url: '' }] } })}
                                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-semibold text-xs uppercase tracking-wide hover:bg-slate-50 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Add Audio Recording
                                    </button>
                                </div>
                            </div>

                            {/* Video Section */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-semibold uppercase text-slate-900 tracking-wide pl-2">Cinema & Clips (Video)</h3>
                                <div className="space-y-4">
                                    {(editedData.media.video_clips || []).map((video, idx) => (
                                        <div key={idx} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-6 items-start">
                                            <div className="size-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm border border-slate-100">
                                                <span className="material-symbols-outlined">videocam</span>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div className="relative">
                                                    <input
                                                        placeholder="Video Title"
                                                        className="w-full bg-white border-none rounded-xl px-4 py-3 text-xs font-medium text-slate-900 shadow-sm"
                                                        value={video.title}
                                                        onChange={(e) => {
                                                            const next = [...editedData.media.video_clips];
                                                            next[idx].title = e.target.value;
                                                            setEditedData({ ...editedData, media: { ...editedData.media, video_clips: next } });
                                                        }}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            const next = editedData.media.video_clips.filter((_, i) => i !== idx);
                                                            setEditedData({ ...editedData, media: { ...editedData.media, video_clips: next } });
                                                        }}
                                                        className="absolute -top-2 -right-2 size-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
                                                    >
                                                        <span className="material-symbols-outlined text-[18px]">close</span>
                                                    </button>
                                                </div>
                                                <div className="flex gap-2">
                                                    <input
                                                        placeholder="Video URL or Embed ID"
                                                        className="flex-1 bg-white border-none rounded-xl px-4 py-3 text-xs font-mono text-slate-500 shadow-sm"
                                                        value={video.url}
                                                        onChange={(e) => {
                                                            const next = [...editedData.media.video_clips];
                                                            next[idx].url = e.target.value;
                                                            setEditedData({ ...editedData, media: { ...editedData.media, video_clips: next } });
                                                        }}
                                                    />
                                                    <label className="h-10 px-4 bg-cedar text-white rounded-xl flex items-center justify-center cursor-pointer font-semibold text-xs uppercase tracking-wide shadow-lg shadow-cedar/20">
                                                        Upload
                                                        <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video', idx)} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setEditedData({ ...editedData, media: { ...editedData.media, video_clips: [...editedData.media.video_clips, { title: '', url: '' }] } })}
                                        className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-semibold text-xs uppercase tracking-wide hover:bg-slate-50 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        Add Video Clip
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="px-6 md:px-10 py-8 bg-slate-50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    {uploading && (
                        <div className="flex items-center gap-2 px-6 py-4 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wide rounded-2xl animate-pulse">
                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                            Uploading to Storage...
                        </div>
                    )}
                    <div className="flex-1"></div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <button
                            onClick={onClose}
                            className="flex-1 md:flex-none px-10 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-slate-600 transition-all shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={submitting || uploading}
                            className="flex-1 md:flex-none px-12 py-4 bg-slate-900 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide shadow-xl shadow-slate-900/20 hover:scale-[1.05] transition-all disabled:opacity-50"
                        >
                            {submitting ? 'Preserving...' : 'Save Archive Changes'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const TabButton = ({ active, onClick, label, icon }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-6 py-4 rounded-2xl text-xs font-semibold uppercase tracking-wide transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
    >
        <span className={`material-symbols-outlined text-lg ${active ? 'text-white' : 'text-slate-300'}`}>{icon}</span>
        {label}
    </button>
);

const InputField = ({ label, value, onChange }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-semibold uppercase text-slate-400 ml-2">{label}</label>
        <input
            className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-medium text-slate-900 focus:ring-2 focus:ring-primary shadow-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);
