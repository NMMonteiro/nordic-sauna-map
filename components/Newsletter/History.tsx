import React, { useState, useMemo } from 'react';
import { 
    History, 
    Download, 
    Mail, 
    CheckCircle2, 
    AlertCircle, 
    Calendar,
    Users,
    ArrowUpRight,
    Loader2,
    Eye,
    X,
    Monitor,
    Smartphone,
    Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateEmailHtml } from '../../lib/newsletter-utils';

interface Broadcast {
    id: string;
    subject: string;
    audience: string;
    count: number;
    successCount?: number;
    failureCount?: number;
    created_at: string;
    templateId?: string;
    content?: string;
    imageUrl?: string;
}

interface NewsletterHistoryProps {
    history: Broadcast[];
    loading: boolean;
    onExport: (id: string) => void;
    lang: string;
}

export const NewsletterHistory: React.FC<NewsletterHistoryProps> = ({ history, loading, onExport, lang }) => {
    const [previewItem, setPreviewItem] = useState<Broadcast | null>(null);
    const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');

    const previewHtml = useMemo(() => {
        if (!previewItem) return '';
        return generateEmailHtml(
            (previewItem.templateId || 'classic') as any, 
            previewItem.subject, 
            previewItem.content || '', 
            previewItem.imageUrl || null, 
            lang
        );
    }, [previewItem, lang]);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 opacity-50">
                <Loader2 className="size-12 text-primary animate-spin mb-6" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading history...</p>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                    <History className="size-10" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No History Yet</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 font-medium">You haven't sent any emails yet.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20">
            {/* Header */}
            <div className="px-10 py-10 border-b border-slate-100 bg-white shadow-sm">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">Send History</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <History className="size-3 text-primary" /> Track your sent emails and reports
                </p>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
                <div className="grid grid-cols-1 gap-6 max-w-5xl mx-auto">
                    {history.map((item, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={item.id}
                            className="group bg-white rounded-[2.5rem] border border-slate-100 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50 transition-all overflow-hidden flex flex-col md:flex-row shadow-lg shadow-slate-200/20"
                        >
                            <div className="p-8 flex-1">
                                <div className="flex items-start justify-between mb-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="px-3 py-1 bg-slate-900 text-white text-[8px] font-black uppercase rounded-lg tracking-widest leading-none">
                                                REF: {item.id.slice(0, 8)}
                                            </div>
                                            {(item.failureCount || 0) === 0 ? (
                                                <div className="px-3 py-1 bg-green-50 text-green-600 text-[8px] font-black uppercase rounded-lg tracking-widest leading-none border border-green-100 flex items-center gap-1.5">
                                                    <CheckCircle2 className="size-2.5" /> Success
                                                </div>
                                            ) : (
                                                <div className="px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase rounded-lg tracking-widest leading-none border border-amber-100 flex items-center gap-1.5">
                                                    <AlertCircle className="size-2.5" /> With Errors
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors tracking-tight line-clamp-1">{item.subject}</h3>
                                        <div className="flex items-center gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors">
                                                <Calendar className="size-3" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{new Date(item.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors">
                                                <Users className="size-3" />
                                                <span className="text-[10px] font-black uppercase tracking-wider">{item.audience}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setPreviewItem(item)}
                                            className="size-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm group-hover:rotate-6"
                                            title="Preview Email"
                                        >
                                            <Eye className="size-5" />
                                        </button>
                                        <button 
                                            onClick={() => onExport(item.id)}
                                            className="size-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm group-hover:-rotate-6"
                                            title="Download Report"
                                        >
                                            <Download className="size-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-50">
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sent</p>
                                        <p className="text-2xl font-black text-slate-900">{item.count}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-green-300 uppercase tracking-widest">Delivered</p>
                                        <p className="text-2xl font-black text-green-500">{item.successCount || 0}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-red-300 uppercase tracking-widest">Failed</p>
                                        <p className="text-2xl font-black text-red-500">{item.failureCount || 0}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 px-8 py-8 flex flex-col items-center justify-center border-l border-slate-100 min-w-[140px] group-hover:bg-primary/5 transition-colors">
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-6 vertical-text">Report</div>
                                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                                    <div className="size-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-all"><ArrowUpRight className="size-5 text-slate-400 group-hover:text-primary" /></div>
                                    <div className="size-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-all"><Mail className="size-5 text-slate-400 group-hover:text-primary" /></div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Visual Recap Modal */}
            <AnimatePresence>
                {previewItem && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setPreviewItem(null)}
                            className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <Eye className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Email Preview</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Subject: {previewItem.subject}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex bg-slate-100 p-1 rounded-xl">
                                        <button onClick={() => setDeviceMode('desktop')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${deviceMode === 'desktop' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>
                                            <Monitor className="size-3" /> Desktop
                                        </button>
                                        <button onClick={() => setDeviceMode('mobile')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${deviceMode === 'mobile' ? 'bg-white shadow-sm text-primary' : 'text-slate-400'}`}>
                                            <Smartphone className="size-3" /> Mobile
                                        </button>
                                    </div>
                                    <button 
                                        onClick={() => setPreviewItem(null)}
                                        className="size-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 bg-slate-100/50 p-6 flex items-center justify-center overflow-hidden">
                                <motion.div 
                                    animate={{ width: deviceMode === 'mobile' ? 375 : '100%', height: deviceMode === 'mobile' ? 667 : '100%' }}
                                    className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 ${deviceMode === 'mobile' ? 'rounded-[3rem] border-[12px] border-slate-900' : 'rounded-2xl border border-slate-200 h-full w-full'}`}
                                >
                                    <iframe 
                                        srcDoc={previewHtml}
                                        className="w-full h-full border-none"
                                        title="Broadcast History Preview"
                                    />
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
