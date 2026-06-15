import React, { useState, useMemo } from 'react';
import { 
    Zap, 
    ChevronRight, 
    Mail, 
    Users, 
    Layout as LayoutIcon, 
    Upload, 
    Loader2, 
    Trash2, 
    Send, 
    CheckCircle2, 
    Eye, 
    Monitor, 
    Smartphone,
    AlertCircle,
    Undo2,
    BarChart3,
    Download,
    ArrowLeft,
    X,
    Maximize2,
    XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateEmailHtml } from '../../lib/newsletter-utils';

interface NewsletterComposerProps {
    counts: { subscribers: number, members: number };
    lang: string;
    onSend: (data: any) => Promise<any>;
    onSendTest: (email: string, data: any) => Promise<void>;
    onImageUpload: (file: File) => Promise<string>;
    onExport: (id: string) => void;
}

type Step = 1 | 2 | 3 | 4;
type AudienceType = 'subscribers' | 'members' | 'new' | 'all';
type TemplateId = 'classic' | 'minimal' | 'magazine' | 'elegant';
type DeviceMode = 'desktop' | 'mobile';

export const NewsletterComposer: React.FC<NewsletterComposerProps> = ({ 
    counts, 
    lang, 
    onSend, 
    onSendTest, 
    onImageUpload,
    onExport
}) => {
    const [step, setStep] = useState<Step>(1);
    const [audience, setAudience] = useState<AudienceType>('subscribers');
    const [templateId, setTemplateId] = useState<TemplateId>('classic');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [testSending, setTestSending] = useState(false);
    const [showFullPreview, setShowFullPreview] = useState(false);
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [result, setResult] = useState<any>(null);

    const handleNext = () => setStep((s) => (s + 1) as Step);
    const handleBack = () => setStep((s) => (s - 1) as Step);

    const previewHtml = useMemo(() => {
        return generateEmailHtml(templateId, subject, content, imageUrl, lang);
    }, [templateId, subject, content, imageUrl, lang]);

    const onSubmit = async () => {
        setSending(true);
        try {
            const res = await onSend({ audience, templateId, subject, content, imageUrl });
            setResult(res);
            setStep(4);
        } catch (err: any) {
            setResult({ success: false, errors: [{ error: err.message }], count: 0 });
            setStep(4);
        } finally {
            setSending(false);
        }
    };

    const handleTest = async () => {
        const testEmail = prompt("Enter email for test:", "info@nordicsaunamap.com");
        if (!testEmail) return;
        setTestSending(true);
        try {
            await onSendTest(testEmail, { audience: 'test', templateId, subject, content, imageUrl });
            alert("Test email sent successfully!");
        } catch (err: any) {
            alert("Test failed: " + err.message);
        } finally {
            setTestSending(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const url = await onImageUpload(file);
            setImageUrl(url);
        } catch (err: any) {
            alert("Upload failed: " + err.message);
        } finally {
            setUploading(false);
        }
    };

    const templates = {
        classic: {
            name: "Classic",
            description: "Traditional serif design",
            preview: "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=1200"
        },
        minimal: {
            name: "Clean",
            description: "Simple sans-serif design",
            preview: "https://images.unsplash.com/photo-1516528387618-afa90b13e000?auto=format&fit=crop&q=80&w=1200"
        },
        magazine: {
            name: "Dark",
            description: "Modern bold layout",
            preview: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1200"
        },
        elegant: {
            name: "Elegant",
            description: "Sophisticated serif style",
            preview: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=1200"
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/30">
            {/* Minimal Progress Bar */}
            <div className="h-1 bg-slate-100 w-full overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    className="h-full bg-primary"
                />
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto w-full px-6 py-12 flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div 
                                key="step1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-12"
                            >
                                <div className="text-center">
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase mb-2">Step 1: Who & How</h2>
                                    <p className="text-slate-400 text-sm font-medium">Select your audience and visual style.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Audience</label>
                                        <div className="grid gap-3">
                                            <AudienceItem 
                                                active={audience === 'subscribers'}
                                                onClick={() => setAudience('subscribers')}
                                                title="Newsletter Subscribers"
                                                count={counts.subscribers}
                                                icon={<Mail className="size-4" />}
                                            />
                                            <AudienceItem 
                                                active={audience === 'members'}
                                                onClick={() => setAudience('members')}
                                                title="Members"
                                                count={counts.members}
                                                icon={<Users className="size-4" />}
                                            />
                                            <AudienceItem 
                                                active={audience === 'new'}
                                                onClick={() => setAudience('new')}
                                                title="New Signups"
                                                count={Math.ceil(counts.subscribers * 0.1)}
                                                icon={<Zap className="size-4" />}
                                            />
                                            <AudienceItem 
                                                active={audience === 'all'}
                                                onClick={() => setAudience('all')}
                                                title="Everyone"
                                                count={counts.subscribers + counts.members}
                                                icon={<BarChart3 className="size-4" />}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] px-2">Template</label>
                                        <div className="grid gap-3">
                                            {(Object.keys(templates) as TemplateId[]).map(tid => (
                                                <TemplateItem 
                                                    key={tid}
                                                    active={templateId === tid}
                                                    onClick={() => setTemplateId(tid)}
                                                    name={templates[tid].name}
                                                    desc={templates[tid].description}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center pt-8">
                                    <button 
                                        onClick={handleNext}
                                        className="bg-slate-900 text-white px-12 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-primary transition-all active:scale-95 shadow-lg shadow-slate-200"
                                    >
                                        Next Step <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div 
                                key="step2"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8 max-w-2xl mx-auto w-full"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <button onClick={handleBack} className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                        <ArrowLeft className="size-5" />
                                    </button>
                                    <div className="text-center">
                                        <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">Step 2: Content</h2>
                                        <p className="text-slate-400 text-xs font-medium">Write your message and add an image.</p>
                                    </div>
                                    <div className="w-10" />
                                </div>

                                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Subject Line</label>
                                        <input 
                                            type="text" 
                                            placeholder="Catch their attention..."
                                            className="w-full bg-slate-50 border-none rounded-xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Hero Image</label>
                                        <div className="relative group rounded-2xl overflow-hidden bg-slate-50 border border-dashed border-slate-200 aspect-video flex flex-col items-center justify-center transition-all hover:bg-slate-100/50">
                                            {imageUrl ? (
                                                <>
                                                    <img src={imageUrl} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                        <button onClick={() => setImageUrl(null)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-red-500 transition-colors">
                                                            <Trash2 className="size-4" />
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <label className="cursor-pointer flex flex-col items-center gap-2">
                                                    {uploading ? <Loader2 className="size-6 text-primary animate-spin" /> : <Upload className="size-6 text-slate-300" />}
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Upload Media</span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest ml-2">Email Content</label>
                                        <textarea 
                                            rows={8}
                                            placeholder="Write your narrative here..."
                                            className="w-full bg-slate-50 border-none rounded-[1.5rem] px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none resize-none"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => setShowFullPreview(true)}
                                        className="flex-1 bg-white border border-slate-200 text-slate-600 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
                                    >
                                        <Eye className="size-4" /> Visual Preview
                                    </button>
                                    <button 
                                        disabled={!subject || !content}
                                        onClick={handleNext}
                                        className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-all active:scale-95 shadow-lg"
                                    >
                                        Review & Send <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div 
                                key="step3"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                className="max-w-xl mx-auto w-full space-y-12"
                            >
                                <div className="text-center space-y-3">
                                    <div className="size-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle2 className="size-6" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Step 3: Ready?</h2>
                                    <p className="text-slate-400 text-xs font-medium">One last look before sending.</p>
                                </div>

                                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden divide-y divide-slate-50">
                                    <div className="p-6 flex items-center justify-between">
                                        <div>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Target Audience</p>
                                            <p className="text-sm font-bold text-slate-900 uppercase">{audience}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Total Recipients</p>
                                            <p className="text-sm font-bold text-slate-900">{audience === 'all' ? counts.subscribers + counts.members : audience === 'members' ? counts.members : counts.subscribers} People</p>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3">Preview Clip</p>
                                        <div className="bg-slate-50 p-4 rounded-xl">
                                            <p className="text-xs font-bold text-slate-700 line-clamp-1 mb-2">{subject}</p>
                                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{content}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50/50 flex items-center justify-center">
                                        <button 
                                            onClick={() => setShowFullPreview(true)}
                                            className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-2 hover:gap-3 transition-all"
                                        >
                                            Open Full Interactive Preview <Maximize2 className="size-3" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        disabled={sending}
                                        onClick={onSubmit}
                                        className="w-full bg-primary text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all active:scale-[0.98] shadow-2xl shadow-primary/20"
                                    >
                                        {sending ? <Loader2 className="size-4 animate-spin" /> : <Zap className="size-4" />}
                                        {sending ? 'Sending...' : 'Send Now'}
                                    </button>
                                    <button 
                                        disabled={sending}
                                        onClick={handleTest}
                                        className="w-full bg-slate-100 text-slate-500 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                        Send Sandbox Test
                                    </button>
                                    <button 
                                        disabled={sending}
                                        onClick={handleBack}
                                        className="text-slate-400 text-[9px] font-black uppercase tracking-widest py-2 hover:text-slate-900 transition-all"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && result && (
                            <motion.div 
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-md mx-auto w-full text-center space-y-8 py-8"
                            >
                                <div className={`size-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                                    result.success 
                                        ? (result.failureCount > 0 ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500') 
                                        : 'bg-red-50 text-red-500'
                                }`}>
                                    {result.success 
                                        ? (result.failureCount > 0 ? <AlertCircle className="size-10" /> : <CheckCircle2 className="size-10" />) 
                                        : <XCircle className="size-10" />
                                    }
                                </div>

                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">
                                        {result.success 
                                            ? (result.failureCount > 0 ? 'Sent with some errors' : 'Sent Successfully!') 
                                            : 'Error'
                                        }
                                    </h2>
                                    <p className="text-slate-400 text-sm font-medium">
                                        {result.success 
                                            ? `Sent to ${result.successCount || 0} subscribers.`
                                            : `Sending failed: ${result.errors?.[0]?.error || 'Unknown Error'}`
                                        }
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Delivered</p>
                                        <p className="text-2xl font-black text-green-500">{result.successCount || 0}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Failed</p>
                                        <p className="text-2xl font-black text-red-500">{result.failureCount || 0}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-4">
                                    {result.newsletterId && (
                                        <button 
                                            onClick={() => onExport(result.newsletterId)}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                        >
                                            <Download className="size-4" /> Download Report
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => window.location.reload()}
                                        className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                                    >
                                        <Undo2 className="size-4" /> Write Another Email
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Premium Full-Screen Preview Modal */}
            <AnimatePresence>
                {showFullPreview && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowFullPreview(false)}
                            className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl h-full flex flex-col bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                        <Eye className="size-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tight text-slate-900">Email Architecture Preview</h3>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Rendering Instance</p>
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
                                        onClick={() => setShowFullPreview(false)}
                                        className="size-10 flex items-center justify-center bg-slate-50 text-slate-400 rounded-full hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Iframe Rendering Area */}
                            <div className="flex-1 bg-slate-100/50 p-6 flex items-center justify-center overflow-hidden">
                                <motion.div 
                                    animate={{ width: deviceMode === 'mobile' ? 375 : '100%', height: deviceMode === 'mobile' ? 667 : '100%' }}
                                    className={`bg-white shadow-2xl overflow-hidden transition-all duration-500 ${deviceMode === 'mobile' ? 'rounded-[3rem] border-[12px] border-slate-900' : 'rounded-2xl border border-slate-200 h-full w-full'}`}
                                >
                                    <iframe 
                                        srcDoc={previewHtml}
                                        className="w-full h-full border-none"
                                        title="Newsletter Preview"
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

const AudienceItem = ({ active, onClick, title, count, icon }: any) => (
    <button 
        onClick={onClick}
        className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${active ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-all ${active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>{icon}</div>
            <span className={`text-xs font-bold ${active ? 'text-slate-900' : 'text-slate-500'}`}>{title}</span>
        </div>
        <span className={`text-[10px] font-black tracking-widest ${active ? 'text-primary' : 'text-slate-300'}`}>{count}</span>
    </button>
);

const TemplateItem = ({ active, onClick, name, desc }: any) => (
    <button 
        onClick={onClick}
        className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${active ? 'border-primary bg-primary/5' : 'border-slate-100 bg-white hover:border-slate-200'}`}
    >
        <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg transition-all ${active ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'}`}>
                <LayoutIcon className="size-4" />
            </div>
            <div>
                <span className={`text-xs font-bold block ${active ? 'text-slate-900' : 'text-slate-500'}`}>{name}</span>
                <span className="text-[9px] font-medium text-slate-400">{desc}</span>
            </div>
        </div>
        {active && <div className="size-2 bg-primary rounded-full" />}
    </button>
);
