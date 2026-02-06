import React, { useState } from 'react';
import { Sauna, LanguageCode } from '../types';
import { AudioPlayer } from './AudioPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Info,
  Image as ImageIcon,
  Mic2,
  Video as VideoIcon,
  ExternalLink,
  ArrowRight,
  Navigation,
  ShieldCheck,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SaunaModalProps {
  sauna: Sauna;
  lang: LanguageCode;
  onClose: () => void;
}

type TabType = 'info' | 'pictures' | 'audio' | 'video';

export const SaunaModal: React.FC<SaunaModalProps> = ({ sauna, lang, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const STORAGE_URL = "https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/";

  const resolveUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
    return `${STORAGE_URL}${cleanUrl}`;
  };

  const m = (typeof sauna.media === 'string' ? JSON.parse(sauna.media) : sauna.media) || {};

  const rawImages = Array.isArray(m.images) ? m.images :
    (typeof m.image === 'string' ? [m.image] : []);
  const images = rawImages.map(resolveUrl);
  const featuredImage = resolveUrl(m.featured_image || (typeof m.image === 'string' ? m.image : images[0]));

  const rawAudio = Array.isArray(m.audio_interviews) ? m.audio_interviews :
    (Array.isArray(m.audio) ? m.audio :
      (typeof m.audio === 'string' ? [{ title: 'Archive Recording', url: m.audio }] : []));
  const audio_interviews = rawAudio.map((a: any) => {
    const track = typeof a === 'string' ? { title: 'Archive Recording', url: a } : a;
    return { ...track, url: resolveUrl(track.url) };
  });

  const rawVideo = Array.isArray(m.video_clips) ? m.video_clips :
    (Array.isArray(m.video) ? m.video :
      (Array.isArray(m.videos) ? m.videos :
        (typeof m.video === 'string' ? [{ title: 'Video Clip', url: m.video }] : [])));
  const video_clips = rawVideo.map((v: any) => {
    const clip = typeof v === 'string' ? { title: 'Video Clip', url: v } : v;
    return { ...clip, url: resolveUrl(clip.url) };
  });

  const content = (typeof sauna.content === 'string' ? JSON.parse(sauna.content) : sauna.content)?.[lang] || { name: 'Unknown Sauna', description: '', etiquette: '' };

  const tabConfigs = [
    { id: 'info', icon: <Info className="size-4" />, label: { sv: 'Info', fi: 'Tiedot', en: 'Info' } },
    { id: 'pictures', icon: <ImageIcon className="size-4" />, label: { sv: 'Bilder', fi: 'Kuvat', en: 'Gallery' } },
    { id: 'audio', icon: <Mic2 className="size-4" />, label: { sv: 'Ljud', fi: 'Ääni', en: 'Audio' } },
    { id: 'video', icon: <VideoIcon className="size-4" />, label: { sv: 'Video', fi: 'Video', en: 'Video' } }
  ];

  const labels = {
    about: { sv: 'Berättelsen bakom', fi: 'Tarina takana', en: 'The Legend' },
    etiquette: { sv: 'Kultur & Tradition', fi: 'Kulttuuri & Perinne', en: 'Heritage & Etiquette' },
    contact: { sv: 'Anslutningar', fi: 'Yhteydet', en: 'Connections' },
    directions: { sv: 'Hitta hit', fi: 'Reittiohjeet', en: 'Get Directions' },
    website: { sv: 'Besök webbplats', fi: 'Vieraile sivustolla', en: 'Visit Website' }
  };

  const handleGetDirections = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${sauna.coordinates.lat},${sauna.coordinates.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/92"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-7xl bg-white rounded-[3.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] flex flex-col h-[90vh] overflow-hidden border border-white/10"
      >
        {/* Top Navigation Bar */}
        <header className="px-10 py-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 shrink-0 relative bg-white z-10">
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="size-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20"
            >
              <ShieldCheck className="size-8" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1 leading-none">{content.name}</h2>
              <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><MapPin className="size-3" /> {sauna.metadata.region}</span>
                <span className="size-1 bg-slate-200 rounded-full" />
                <span>{sauna.metadata.type}</span>
              </div>
            </div>
          </div>

          <nav className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            {tabConfigs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-2.5 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab.id
                    ? "bg-white text-slate-950 shadow-xl shadow-slate-200/50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                )}
              >
                {tab.icon}
                {tab.label[lang]}
              </button>
            ))}
          </nav>

          <button
            onClick={onClose}
            className="hidden md:flex size-14 items-center justify-center rounded-[1.5rem] bg-slate-50 text-slate-400 hover:text-slate-900 hover:scale-105 transition-all active:scale-95 border border-slate-100 shadow-sm"
          >
            <X className="size-6" />
          </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white relative">
          <AnimatePresence mode="wait">
            {activeTab === 'info' && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-12 h-full"
              >
                {/* Visual Side */}
                <div className="lg:col-span-5 relative overflow-hidden bg-slate-50 min-h-[400px]">
                  <img
                    src={featuredImage}
                    alt={content.name}
                    className="w-full h-full object-cover"
                    onError={(e: any) => e.target.src = 'https://placehold.co/1200x800/f1f5f9/94a3b8?text=Image+Not+Found'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                  <div className="absolute bottom-10 left-10 p-6 bg-white/90 rounded-3xl text-slate-900 font-bold text-xs uppercase tracking-widest">
                    Archive Entry 0{sauna.sauna_id}
                  </div>
                </div>

                {/* Text Side */}
                <div className="lg:col-span-7 p-12 lg:p-20 space-y-16">
                  <section>
                    <div className="flex items-center gap-3 mb-8">
                      <div className="size-1 bg-primary rounded-full" />
                      <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{labels.about[lang]}</h3>
                    </div>
                    <p className="text-3xl md:text-4xl font-display font-medium text-slate-900 leading-[1.2] tracking-tight">
                      {content.description}
                    </p>
                  </section>

                  <section className="bg-slate-50/80 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                      <ShieldCheck className="size-40" />
                    </div>
                    <div className="relative z-10">
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                        <ShieldCheck className="size-4 text-emerald-500" />
                        {labels.etiquette[lang]}
                      </h3>
                      <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                        {content.etiquette}
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">{labels.contact[lang]}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sauna.contact.website && (
                        <a href={sauna.contact.website} target="_blank" className="flex items-center justify-between p-6 rounded-2xl bg-white border border-slate-100 hover:border-primary/30 hover:shadow-2xl transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="size-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                              <ExternalLink className="size-5" />
                            </div>
                            <span className="text-sm font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px]">{labels.website[lang]}</span>
                          </div>
                          <ChevronRight className="size-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                        </a>
                      )}
                      <button
                        onClick={handleGetDirections}
                        className="flex items-center justify-between p-6 rounded-2xl bg-slate-900 text-white shadow-2xl shadow-slate-900/10 hover:scale-105 active:scale-95 transition-all group"
                      >
                        <div className="flex items-center gap-4 text-left">
                          <Navigation className="size-5" />
                          <span className="text-sm font-black uppercase tracking-tighter">{labels.directions[lang]}</span>
                        </div>
                        <ArrowRight className="size-4 text-white/40" />
                      </button>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === 'pictures' && (
              <motion.div
                key="pictures"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 lg:p-20"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {images.map((img, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className="group relative aspect-[4/5] rounded-[2rem] overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-slate-200 transition-all border border-slate-100"
                      onClick={() => setSelectedImage(img)}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="size-14 bg-white/90 text-slate-900 rounded-full flex items-center justify-center shadow-2xl">
                          <Maximize2 className="size-6" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'audio' && (
              <motion.div
                key="audio"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 lg:p-32 flex flex-col items-center"
              >
                <div className="w-full max-w-3xl">
                  <div className="text-center mb-16 space-y-6">
                    <div className="size-24 rounded-[2rem] bg-indigo-50 flex items-center justify-center text-indigo-500 mx-auto shadow-inner">
                      <Mic2 className="size-10" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Oral Traditions</h3>
                    <p className="text-slate-400 font-medium">Recorded stories and ambient sounds from the heritage site.</p>
                  </div>
                  <div className="space-y-4">
                    {audio_interviews.length > 0 ? (
                      audio_interviews.map((track, idx) => (
                        <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                          <AudioPlayer track={{
                            title: track.title || `Recording #${idx + 1}`,
                            speaker: track.speaker || 'Archival Voice',
                            url: track.url,
                            duration: track.duration
                          }} />
                        </div>
                      ))
                    ) : (
                      <div className="py-24 text-center border-3 border-dashed border-slate-100 rounded-[3rem]">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">No audio assets available</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'video' && (
              <motion.div
                key="video"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-10 lg:p-20"
              >
                {video_clips.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {video_clips.map((clip, idx) => (
                      <div key={idx} className="space-y-6">
                        <div className="aspect-video bg-slate-950 rounded-[2.5rem] overflow-hidden shadow-3xl relative group border border-white/5">
                          <video controls className="w-full h-full object-cover">
                            <source src={clip.url} type="video/mp4" />
                          </video>
                        </div>
                        <div className="px-6 flex items-center justify-between">
                          <div>
                            <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight">{clip.title}</h4>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-1 flex items-center gap-2">
                              <Calendar className="size-3" /> Archive Footage
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-40 flex flex-col items-center justify-center text-center">
                    <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 mb-8">
                      <VideoIcon className="size-10" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Archive film missing</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Bar */}
        <footer className="px-12 py-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Nordic Heritage Registry • ID: {sauna.sauna_id}</span>
          </div>
          <div className="flex gap-6">
            <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Report Discovery</button>
            <button className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">Share Insight</button>
          </div>
        </footer>
      </motion.div>

      {/* Media Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20002] bg-slate-950/98 flex items-center justify-center p-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-12 right-12 size-16 bg-white/90 text-slate-900 rounded-full flex items-center justify-center z-10"
            >
              <X className="size-8" />
            </motion.button>
            <motion.img
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              src={selectedImage}
              className="max-w-full max-h-full rounded-2xl shadow-[0_0_100px_rgba(37,99,235,0.2)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
