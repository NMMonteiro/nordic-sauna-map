import React, { useState } from 'react';
import { Sauna, LanguageCode } from '../types';
import { AudioPlayer } from './AudioPlayer';

interface SaunaModalProps {
  sauna: Sauna;
  lang: LanguageCode;
  onClose: () => void;
}

type TabType = 'info' | 'pictures' | 'audio' | 'video';

export const SaunaModal: React.FC<SaunaModalProps> = ({ sauna, lang, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  // Ultra-robust data normalization and URL resolution
  const STORAGE_URL = "https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/";

  const resolveUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // Handle potential double folder or leading slashes
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${STORAGE_URL}${cleanUrl}`;
  };

  const m = (typeof sauna.media === 'string' ? JSON.parse(sauna.media) : sauna.media) || {};

  // Normalize Images
  const rawImages = Array.isArray(m.images) ? m.images :
    (typeof m.image === 'string' ? [m.image] : []);
  const images = rawImages.map(resolveUrl);
  const featuredImage = resolveUrl(m.featured_image || (typeof m.image === 'string' ? m.image : images[0]));

  // Normalize Audio
  const rawAudio = Array.isArray(m.audio_interviews) ? m.audio_interviews :
    (Array.isArray(m.audio) ? m.audio :
      (typeof m.audio === 'string' ? [{ title: 'Archive Recording', url: m.audio }] : []));
  const audio_interviews = rawAudio.map((a: any) => {
    const track = typeof a === 'string' ? { title: 'Archive Recording', url: a } : a;
    return { ...track, url: resolveUrl(track.url) };
  });

  // Normalize Video
  const rawVideo = Array.isArray(m.video_clips) ? m.video_clips :
    (Array.isArray(m.video) ? m.video :
      (Array.isArray(m.videos) ? m.videos :
        (typeof m.video === 'string' ? [{ title: 'Video Clip', url: m.video }] : [])));
  const video_clips = rawVideo.map((v: any) => {
    const clip = typeof v === 'string' ? { title: 'Video Clip', url: v } : v;
    return { ...clip, url: resolveUrl(clip.url) };
  });

  const content = (typeof sauna.content === 'string' ? JSON.parse(sauna.content) : sauna.content)?.[lang] || { name: 'Unknown Sauna', description: '', etiquette: '' };

  // Labels for the tabs
  const tabLabels = {
    info: { sv: 'Allmänt', fi: 'Yleistä', en: 'General' },
    pictures: { sv: 'Bilder', fi: 'Kuvat', en: 'Pictures' },
    audio: { sv: 'Ljud', fi: 'Ääni', en: 'Audio' },
    video: { sv: 'Video', fi: 'Video', en: 'Video' }
  };

  const labels = {
    about: { sv: 'Om denna bastu', fi: 'Tietoa tästä saunasta', en: 'About this Sauna' },
    etiquette: { sv: 'Etikett & Tradition', fi: 'Etiketti & Perinne', en: 'Etiquette & Tradition' },
    contact: { sv: 'Kontakt', fi: 'Yhteystiedot', en: 'Contact' },
    directions: { sv: 'Hitta hit', fi: 'Reitti', en: 'Get Directions' },
    close: { sv: 'Stäng', fi: 'Sulje', en: 'Close' }
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${sauna.coordinates.lat},${sauna.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-6 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" onClick={onClose}></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col h-[95vh] md:h-[800px] border border-sky/10 animate-in zoom-in-95 duration-300">

        {/* Header with Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between border-b border-sky/10 px-8 py-6 gap-6 shrink-0 bg-white rounded-t-[2.5rem] z-10">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-nordic-lake flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-2xl">hot_tub</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-none mb-1">{content.name}</h2>
              <p className="text-xs font-bold text-sky uppercase tracking-widest">{sauna.metadata.type} • {sauna.metadata.region}</p>
            </div>
          </div>

          <nav className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            {(['info', 'pictures', 'audio', 'video'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider transition-all ${activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tabLabels[tab][lang]}
              </button>
            ))}
          </nav>

          <button onClick={onClose} className="hidden md:flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 hover:text-primary transition-all active:scale-95">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">

          {/* INFO TAB */}
          {activeTab === 'info' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Featured Image */}
                <div className="aspect-[4/3] lg:aspect-auto h-full min-h-[400px] relative overflow-hidden bg-slate-100 flex items-center justify-center">
                  <img
                    src={featuredImage}
                    alt={content.name}
                    className="w-full h-full object-cover"
                    onError={(e: any) => e.target.src = 'https://placehold.co/1200x800/f1f5f9/94a3b8?text=Image+Not+Found'}
                  />
                </div>

                {/* Text Content */}
                <div className="p-8 md:p-12 lg:p-16 space-y-12 bg-white">
                  <section>
                    <h3 className="text-xs font-black text-sky uppercase tracking-[0.3em] mb-6">{labels.about[lang]}</h3>
                    <p className="text-2xl font-serif italic text-slate-700 leading-relaxed">
                      "{content.description}"
                    </p>
                  </section>

                  <section className="bg-sky/5 p-8 rounded-[2rem] border border-sky/10">
                    <h3 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                      <span className="material-symbols-outlined text-lg">verified</span>
                      {labels.etiquette[lang]}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                      {content.etiquette}
                    </p>
                  </section>

                  <section>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-6">{labels.contact[lang]}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sauna.contact.website && (
                        <a href={sauna.contact.website} target="_blank" className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all group">
                          <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">public</span>
                          <span className="text-sm font-bold text-slate-900 truncate">{sauna.contact.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                      <button
                        onClick={handleGetDirections}
                        className="flex items-center gap-4 p-5 rounded-2xl border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-xl transition-all group"
                      >
                        <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">near_me</span>
                        <span className="text-sm font-bold text-slate-900">{labels.directions[lang]}</span>
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          )}

          {/* PICTURES TAB */}
          {activeTab === 'pictures' && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-square rounded-3xl overflow-hidden cursor-zoom-in hover:scale-[1.02] transition-transform duration-500 shadow-lg"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img}
                      alt={`${content.name} ${idx}`}
                      className="w-full h-full object-cover"
                      onError={(e: any) => e.target.src = 'https://placehold.co/600x600/f1f5f9/94a3b8?text=Broken+Link'}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="p-8 md:p-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-full max-w-2xl text-center space-y-12">
                <div className="size-20 rounded-full bg-nordic-lake/10 flex items-center justify-center text-primary mx-auto">
                  <span className="material-symbols-outlined text-4xl">graphic_eq</span>
                </div>
                <h3 className="text-3xl font-black text-slate-900">Audio Archives</h3>
                <div className="space-y-4 w-full">
                  {audio_interviews.length > 0 ? (
                    audio_interviews.map((track, idx) => (
                      <div key={idx} className="bg-slate-50 p-6 rounded-[2rem] border border-sky/10 text-left">
                        <AudioPlayer track={{
                          title: track.title || `Archive Recording #${idx + 1}`,
                          speaker: track.speaker || 'Local History',
                          url: track.url,
                          duration: track.duration
                        }} />
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center border-2 border-dashed border-sky/10 rounded-[3rem]">
                      <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">No recordings available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            <div className="p-8 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {video_clips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {video_clips.map((clip, idx) => (
                    <div key={idx} className="space-y-4">
                      <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                        <video controls className="w-full h-full">
                          <source src={clip.url} type="video/mp4" />
                        </video>
                      </div>
                      <div className="px-6">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">{clip.title}</h4>
                        {clip.description && <p className="text-xs text-slate-500 mt-1">{clip.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center">
                  <div className="size-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-6">
                    <span className="material-symbols-outlined text-4xl">videocam_off</span>
                  </div>
                  <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">No video content</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info/attribution */}
        <div className="px-12 py-6 bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] rounded-b-[2.5rem] border-t border-sky/5 flex justify-between shrink-0">
          <span>{sauna.sauna_id} • Archive Entry</span>
          <span>Nordic Cultural Heritage</span>
        </div>
      </div>

      {/* Fullscreen Image Overlay */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 flex items-center justify-center p-8 transition-all animate-in fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-8 right-8 text-white text-4xl">&times;</button>
          <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-full rounded-2xl" />
        </div>
      )}
    </div>
  );
};