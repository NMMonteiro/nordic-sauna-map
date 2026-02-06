import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
    Send,
    Users,
    Mail,
    FileText,
    Eye,
    ChevronRight,
    Layout as LayoutIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Undo2,
    Image as ImageIcon,
    Trash2,
    History,
    Download,
    Search,
    ChevronDown,
    ChevronUp,
    Smartphone,
    Monitor,
    MousePointer2,
    Zap,
    Filter,
    BarChart3,
    ArrowLeft,
    Upload
} from 'lucide-react';

interface NewsletterManagerProps {
    t: any;
    lang: 'sv' | 'fi' | 'en';
}

type AudienceType = 'subscribers' | 'members' | 'all';
type TemplateId = 'classic' | 'modern' | 'minimal';
type ViewMode = 'composer' | 'history';
type DeviceMode = 'desktop' | 'mobile';

export const NewsletterManager: React.FC<NewsletterManagerProps> = ({ t, lang }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('composer');
    const [step, setStep] = useState(1);
    const [audience, setAudience] = useState<AudienceType>('subscribers');
    const [templateId, setTemplateId] = useState<TemplateId>('classic');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        count: number;
        successCount?: number;
        failureCount?: number;
        errors?: any[];
        newsletterId?: string;
    } | null>(null);
    const [counts, setCounts] = useState({ subscribers: 0, members: 0 });
    const [testSending, setTestSending] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [showFullLog, setShowFullLog] = useState(false);
    const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        const { count: sCount } = await supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('status', 'active');
        const { count: mCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        setCounts({ subscribers: sCount || 0, members: mCount || 0 });
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const { data, error } = await supabase
                .from('broadcasts')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            setHistory(data || []);
        } catch (err: any) {
            console.error('History fetch error:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSend = async () => {
        setSending(true);
        setShowFullLog(false);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const clientConfig = (supabase as any);
            const baseUrl = clientConfig.supabaseUrl;
            const anonKey = clientConfig.supabaseKey;

            if (!session?.access_token) {
                throw new Error('AUTH ERROR: No active session. Please Log Out and Log In again.');
            }

            const response = await fetch(`${baseUrl}/functions/v1/send-broadcast?apikey=${anonKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': anonKey
                },
                body: JSON.stringify({
                    audience,
                    templateId,
                    subject,
                    content,
                    imageUrl,
                    lang
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.message || 'Failed to send newsletter');

            setResult({
                success: true,
                newsletterId: data.newsletterId,
                count: data.count,
                successCount: data.successCount,
                failureCount: data.failureCount,
                errors: data.errors
            });
            setStep(4);
        } catch (err: any) {
            console.error('Newsletter send error:', err);
            setResult({
                success: false,
                count: 0,
                errors: [{ error: err.message }]
            });
            setStep(4);
        } finally {
            setSending(false);
        }
    };

    const handleSendTest = async () => {
        const testEmail = prompt("Enter email for test dispatch:", "nuno@tropicalastral.com");
        if (!testEmail) return;

        setTestSending(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const clientConfig = (supabase as any);
            const baseUrl = clientConfig.supabaseUrl;
            const anonKey = clientConfig.supabaseKey;

            if (!session?.access_token) {
                throw new Error('AUTH ERROR: Session expired. Please Log Out and Log In again.');
            }

            const response = await fetch(`${baseUrl}/functions/v1/send-broadcast?apikey=${anonKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'apikey': anonKey
                },
                body: JSON.stringify({
                    audience: 'test',
                    testEmail: testEmail,
                    templateId,
                    subject: `[TEST] ${subject}`,
                    content,
                    imageUrl,
                    lang
                })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || data.message || 'Test dispatch failed');

            alert('Test email initiated! Please check your inbox.');
        } catch (err: any) {
            console.error('Test send error:', err);
            alert('Test dispatch failed: ' + err.message);
        } finally {
            setTestSending(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `newsletter/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('blog-media')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('blog-media')
                .getPublicUrl(filePath);

            setImageUrl(publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const exportToCSV = async (newsletterId: string) => {
        try {
            const { data: recipients, error } = await supabase
                .from('broadcast_recipients')
                .select('email, status, error_message, created_at')
                .eq('broadcast_id', newsletterId);

            if (error) throw error;
            if (!recipients) return;

            const headers = ['Email', 'Status', 'Error', 'Timestamp'];
            const csvContent = [
                headers.join(','),
                ...recipients.map(r => [
                    r.email,
                    r.status,
                    `"${(r.error_message || '').replace(/"/g, '""')}"`,
                    r.created_at
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `newsletter-report-${newsletterId}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            alert('Export failed: ' + err.message);
        }
    };

    const templates = {
        classic: {
            name: "Heritage Classic",
            description: "High-contrast, serif-led design for formal heritage updates.",
            preview: "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=1200"
        },
        modern: {
            name: "Nordic Minimal",
            description: "Clean typography and spacious layout for a premium feel.",
            preview: "https://images.unsplash.com/photo-1516528387618-afa90b13e000?auto=format&fit=crop&q=80&w=1200"
        }
    };

    const stepInfo = [
        { id: 1, name: 'Logistics', icon: <Filter className="size-4" /> },
        { id: 2, name: 'Creative', icon: <Zap className="size-4" /> },
        { id: 3, name: 'Confirm', icon: <CheckCircle2 className="size-4" /> }
    ];

    return (
        <div className="bg-[#fcfdfe] rounded-none lg:rounded-[2.5rem] border-0 lg:border border-[#e2e8f0] overflow-hidden shadow-none lg:shadow-2xl lg:shadow-slate-200/50 h-screen lg:h-[calc(100vh-140px)] min-h-[600px] flex flex-col font-display">
            {/* Ultra-Premium Navigation Bar */}
            <div className="flex bg-white border-b border-slate-100 z-50 sticky top-0">
                <div className="flex px-4 py-2 w-full">
                    <button
                        onClick={() => setViewMode('composer')}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === 'composer' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[0.98]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        <Zap className={`size-4 ${viewMode === 'composer' ? 'animate-pulse' : ''}`} />
                        Composer
                    </button>
                    <button
                        onClick={() => { setViewMode('history'); fetchHistory(); }}
                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${viewMode === 'history' ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-[0.98]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                    >
                        <History className="size-4" />
                        History
                    </button>
                </div>
            </div>

            {viewMode === 'composer' ? (
                <>
                    {/* Stepper with Fluid Motion */}
                    <div className="px-6 lg:px-12 py-8 lg:py-10 flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-slate-100 bg-white/40 gap-6">
                        <div className="flex items-center gap-4 lg:gap-8 overflow-x-auto custom-scrollbar pb-2 lg:pb-0 w-full lg:w-auto no-scrollbar">
                            <LayoutGroup>
                                {stepInfo.map((s, idx) => (
                                    <React.Fragment key={s.id}>
                                        <div className="flex items-center gap-3 relative cursor-pointer shrink-0" onClick={() => step > s.id && setStep(s.id)}>
                                            <div className={`size-10 rounded-full flex items-center justify-center transition-all duration-700 relative z-10 ${step >= s.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-slate-100 text-slate-400'}`}>
                                                {step > s.id ? <CheckCircle2 className="size-5" /> : s.icon}
                                                {step === s.id && (
                                                    <motion.div layoutId="step-highlight" className="absolute -inset-2 bg-primary/10 rounded-full -z-10" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s.id ? 'text-primary' : 'text-slate-300'}`}>Step 0{s.id}</span>
                                                <span className={`text-[11px] font-black uppercase tracking-tighter ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>{s.name}</span>
                                            </div>
                                        </div>
                                        {idx < stepInfo.length - 1 && (
                                            <div className="w-16 h-px bg-slate-100 relative overflow-hidden">
                                                <motion.div
                                                    initial={{ x: '-100%' }}
                                                    animate={{ x: step > idx + 1 ? '0%' : '-100%' }}
                                                    transition={{ duration: 0.8 }}
                                                    className="absolute inset-0 bg-primary"
                                                />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </LayoutGroup>
                        </div>
                        <div className="hidden lg:flex items-center gap-4 py-2 px-4 bg-slate-900/5 rounded-full border border-slate-900/5">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Users className="size-3" /> Audience: <span className="text-slate-900">{audience === 'all' ? '2,450+' : audience === 'members' ? counts.members : counts.subscribers}</span>
                            </span>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                        <div className="flex-1 p-8 lg:p-14 overflow-y-auto custom-scrollbar relative">
                            {/* Decorative background blur */}
                            <div className="absolute top-20 right-20 size-64 bg-primary/5 -z-10 rounded-full" />
                            <div className="absolute bottom-20 left-20 size-64 bg-blue-400/5 -z-10 rounded-full" />

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.5, ease: "circOut" }}
                                        key="step1"
                                        className="space-y-12 max-w-4xl"
                                    >
                                        <header>
                                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Newsletter Targeting</h2>
                                            <p className="text-slate-400 font-medium">Select who should receive this transmission across the Nordic network.</p>
                                        </header>

                                        <section>
                                            <label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] block mb-6">Dispatch Range</label>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <AudienceCard
                                                    active={audience === 'subscribers'}
                                                    onClick={() => setAudience('subscribers')}
                                                    title="Active Subscribers"
                                                    count={counts.subscribers}
                                                    description="Those who opted-in via newsletter forms."
                                                    icon={<Mail />}
                                                />
                                                <AudienceCard
                                                    active={audience === 'members'}
                                                    onClick={() => setAudience('members')}
                                                    title="Platform Members"
                                                    count={counts.members}
                                                    description="Every registered user on nordic-sauna-map."
                                                    icon={<Users />}
                                                />
                                                <AudienceCard
                                                    active={audience === 'all'}
                                                    onClick={() => setAudience('all')}
                                                    title="Network Total"
                                                    count={counts.subscribers + counts.members}
                                                    description="Unified newsletter to every stored lead."
                                                    icon={<Zap />}
                                                />
                                            </div>
                                        </section>

                                        <section>
                                            <label className="text-[10px] font-black uppercase text-slate-300 tracking-[0.3em] block mb-6">Visual aesthetic</label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {(Object.keys(templates) as TemplateId[]).map(tid => (
                                                    <TemplateCard
                                                        key={tid}
                                                        active={templateId === tid}
                                                        onClick={() => setTemplateId(tid)}
                                                        template={templates[tid]}
                                                    />
                                                ))}
                                            </div>
                                        </section>

                                        <div className="pt-10">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => setStep(2)}
                                                className="group bg-slate-900 text-white px-12 py-6 rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center gap-4 hover:shadow-2xl hover:shadow-slate-900/20 transition-all border border-slate-800"
                                            >
                                                Initialize Creative <ChevronRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.5 }}
                                        key="step2"
                                        className="space-y-10 max-w-4xl"
                                    >
                                        <header>
                                            <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Content Orchestration</h2>
                                            <p className="text-slate-400 font-medium">Craft your message with precision. Use high-quality visuals for impact.</p>
                                        </header>

                                        <div className="space-y-8">
                                            <div className="group">
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${focusedField === 'subject' ? 'text-primary' : 'text-slate-400'}`}>Message Subject</label>
                                                    <span className={`text-[9px] font-black tracking-widest ${subject.length > 50 ? 'text-amber-500' : 'text-slate-300'}`}>{subject.length}/60 RECOMMENDED</span>
                                                </div>
                                                <div className={`relative rounded-3xl transition-all duration-500 border-2 ${focusedField === 'subject' ? 'border-primary bg-white shadow-xl shadow-primary/5' : 'border-slate-100 bg-slate-50'}`}>
                                                    <input
                                                        onFocus={() => setFocusedField('subject')}
                                                        onBlur={() => setFocusedField(null)}
                                                        type="text"
                                                        maxLength={100}
                                                        placeholder="Share the heat..."
                                                        className="w-full bg-transparent border-none px-8 py-6 text-xl font-bold outline-none placeholder:text-slate-300"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                    />
                                                    <MousePointer2 className={`absolute right-6 top-1/2 -translate-y-1/2 size-4 transition-all duration-500 ${focusedField === 'subject' ? 'text-primary opacity-100 rotate-12' : 'text-slate-200 opacity-50'}`} />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Primary visual</label>
                                                <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                                                    {imageUrl ? (
                                                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden group border-4 border-white shadow-2xl">
                                                            <img src={imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                            <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-4 transition-all duration-500">
                                                                <button onClick={() => setImageUrl(null)} className="px-8 py-3 bg-white text-red-500 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-all">
                                                                    <Trash2 className="size-4" /> Remove Media
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <label className="flex flex-col items-center justify-center aspect-[21/9] border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden relative">
                                                            {uploading ? (
                                                                <div className="flex flex-col items-center gap-4">
                                                                    <Loader2 className="size-10 text-primary animate-spin" />
                                                                    <p className="text-[10px] font-black uppercase text-primary animate-pulse tracking-widest">Processing Media...</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <div className="size-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 mb-6 shadow-sm"><Upload className="size-8" /></div>
                                                                    <p className="text-sm font-bold text-slate-900">Upload Newsletter Visual</p>
                                                                    <p className="text-[10px] font-black uppercase text-slate-400 mt-2 tracking-widest">Supports JPQ, PNG, WEBP (Max 5MB)</p>
                                                                </>
                                                            )}
                                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                                        </label>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex justify-between items-center mb-3">
                                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${focusedField === 'content' ? 'text-primary' : 'text-slate-400'}`}>Narrative Content</label>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Read Time: {Math.ceil(content.split(' ').length / 200)} Min</span>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Words: {content.split(/\s+/).filter(Boolean).length}</span>
                                                    </div>
                                                </div>
                                                <div className={`transition-all duration-500 border-2 rounded-[2.5rem] ${focusedField === 'content' ? 'border-primary bg-white shadow-2xl shadow-primary/5' : 'border-slate-100 bg-slate-50'}`}>
                                                    <textarea
                                                        onFocus={() => setFocusedField('content')}
                                                        onBlur={() => setFocusedField(null)}
                                                        rows={10}
                                                        placeholder="Every great sauna has a story..."
                                                        className="w-full bg-transparent border-none px-10 py-10 text-slate-700 leading-relaxed font-medium outline-none resize-none placeholder:text-slate-300 scrollbar-hide"
                                                        value={content}
                                                        onChange={(e) => setContent(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 pt-5">
                                            <button onClick={() => setStep(1)} className="px-10 py-5 border-2 border-slate-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-slate-900 transition-all text-slate-400 hover:text-slate-900">Return to Targeting</button>
                                            <div className="flex-1 flex gap-4">
                                                <button disabled={!subject || !content || testSending} onClick={handleSendTest} className="px-8 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
                                                    {testSending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Test Dispatch
                                                </button>
                                                <button disabled={!subject || !content} onClick={() => setStep(3)} className="flex-1 bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale">Visualize Result</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key="step3"
                                        className="space-y-12 py-10"
                                    >
                                        <div className="text-center space-y-4">
                                            <div className="size-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle2 className="size-10" />
                                            </div>
                                            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Final Approval</h2>
                                            <p className="text-slate-400 font-medium max-w-xl mx-auto">Your newsletter is cached and ready. Once initiated, this action is irreversible across the network.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center shadow-xl shadow-slate-200/50">
                                                <div className="size-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4"><Users className="size-6" /></div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Reach</h4>
                                                <p className="text-3xl font-black text-slate-900">{audience === 'all' ? counts.subscribers + counts.members : audience === 'members' ? counts.members : counts.subscribers}</p>
                                            </div>
                                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center shadow-xl shadow-slate-200/50">
                                                <div className="size-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4"><Zap className="size-6" /></div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Efficiency</h4>
                                                <p className="text-3xl font-black text-slate-900">99.8%</p>
                                            </div>
                                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 text-center shadow-xl shadow-slate-200/50">
                                                <div className="size-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4"><Mail className="size-6" /></div>
                                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</h4>
                                                <p className="text-3xl font-black text-primary uppercase italic">Ready</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row gap-6 justify-center pt-8">
                                            <button disabled={sending} onClick={() => setStep(2)} className="px-14 py-6 bg-slate-100 text-slate-400 rounded-3xl font-black uppercase text-[11px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">Adjust Creative</button>
                                            <button
                                                disabled={sending}
                                                onClick={handleSend}
                                                className="px-16 py-6 bg-primary text-white rounded-3xl font-black uppercase text-[11px] tracking-widest shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 border border-blue-400/20"
                                            >
                                                {sending ? <Loader2 className="size-5 animate-spin" /> : <Zap className="size-5 fill-white" />}
                                                {sending ? 'Sending...' : 'Initiate Dispatch'}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && result && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        key="result"
                                        className="py-12"
                                    >
                                        <div className="text-center mb-16 space-y-6">
                                            <div className={`size-28 rounded-full flex items-center justify-center mx-auto relative ${result.success && (result.failureCount === 0) ? 'bg-green-50 text-green-500 shadow-2xl shadow-green-100' : 'bg-amber-50 text-amber-500 shadow-2xl shadow-amber-100'}`}>
                                                {result.success && (result.failureCount === 0) ? <CheckCircle2 className="size-14" /> : <AlertCircle className="size-14" />}
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1.5, opacity: 0 }} transition={{ repeat: Infinity, duration: 2 }} className={`absolute inset-0 border-4 rounded-full ${result.success ? 'border-green-400' : 'border-amber-400'}`} />
                                            </div>
                                            <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">
                                                {result.failureCount === 0 ? 'Flawless Victory' : 'Transmission Complete'}
                                            </h3>
                                            <p className="text-slate-400 text-xl font-medium">Data packets delivered to {result.successCount} of {result.count} nodes.</p>
                                        </div>

                                        <div className="max-w-4xl mx-auto space-y-8">
                                            <div className="bg-white border-2 border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50">
                                                <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-white relative">
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                                    <div>
                                                        <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Neural Dispatch Report</h4>
                                                        <p className="text-sm font-bold text-slate-900 mt-2 flex items-center gap-2">
                                                            <BarChart3 className="size-4 text-primary" />
                                                            Newsletter Reference: <code className="bg-slate-50 px-3 py-1 rounded-lg text-primary">{result.newsletterId?.slice(0, 8) || 'SESSION'}</code>
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => setShowFullLog(!showFullLog)}
                                                            className="px-6 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all text-slate-500"
                                                        >
                                                            {showFullLog ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                                                            {showFullLog ? 'Hide Logistics' : 'View Logistics'}
                                                        </button>
                                                        {result.newsletterId && (
                                                            <button
                                                                onClick={() => exportToCSV(result.newsletterId!)}
                                                                className="px-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 shadow-xl shadow-slate-900/20 hover:scale-105 active:scale-95 transition-all"
                                                            >
                                                                <Download className="size-4" /> Export Report
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {showFullLog && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden bg-[#fafbfc]"
                                                        >
                                                            <div className="p-10 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                                                                {result.errors?.map((err, idx) => (
                                                                    <motion.div
                                                                        initial={{ x: -20, opacity: 0 }}
                                                                        animate={{ x: 0, opacity: 1 }}
                                                                        transition={{ delay: idx * 0.05 }}
                                                                        key={idx}
                                                                        className="flex items-center gap-5 p-6 bg-white rounded-3xl border border-red-50 shadow-sm"
                                                                    >
                                                                        <div className="size-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0"><AlertCircle className="size-6" /></div>
                                                                        <div className="flex-1">
                                                                            <p className="text-sm font-black text-slate-900">{err.email}</p>
                                                                            <p className="text-[11px] text-red-400 font-bold uppercase mt-1 tracking-wider">{err.error}</p>
                                                                        </div>
                                                                        <div className="px-4 py-2 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-xl tracking-widest border border-red-100">Failed</div>
                                                                    </motion.div>
                                                                ))}
                                                                {result.successCount! > 0 && result.errors?.length === 0 && (
                                                                    <div className="py-20 text-center">
                                                                        <Zap className="size-20 text-slate-100 mx-auto mb-6" />
                                                                        <p className="text-lg font-black text-slate-300 uppercase tracking-widest">Network integrity maintained. Zero failures.</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            <button
                                                onClick={() => { setStep(1); setResult(null); setSubject(''); setContent(''); setImageUrl(null); }}
                                                className="px-14 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 mx-auto border border-slate-800"
                                            >
                                                <Undo2 className="size-4" /> Start New Newsletter
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Ultra-Premium Preview System */}
                        {step < 4 && (
                            <div className="hidden lg:flex w-[550px] bg-white border-l border-slate-100 flex-col p-8 overflow-hidden">
                                <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] flex items-center gap-2"><Eye className="size-4" /> Holographic Preview</h3>
                                    <div className="flex bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                        <button onClick={() => setDeviceMode('desktop')} className={`px-4 py-2 rounded-xl transition-all duration-500 ${deviceMode === 'desktop' ? 'bg-white text-primary shadow-lg shadow-slate-200/50' : 'text-slate-300 hover:text-slate-500'}`}>
                                            <Monitor className="size-4" />
                                        </button>
                                        <button onClick={() => setDeviceMode('mobile')} className={`px-4 py-2 rounded-xl transition-all duration-500 ${deviceMode === 'mobile' ? 'bg-white text-primary shadow-lg shadow-slate-200/50' : 'text-slate-300 hover:text-slate-500'}`}>
                                            <Smartphone className="size-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 flex items-start justify-center overflow-y-auto custom-scrollbar p-10 bg-[#f8fafc] rounded-[3rem] border border-slate-100">
                                    <motion.div
                                        animate={{ width: deviceMode === 'mobile' ? 320 : '100%' }}
                                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                                        className={`bg-white shadow-[0_40px_100px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-700 ${deviceMode === 'mobile' ? 'rounded-[3rem] border-[12px] border-slate-900 min-h-[580px]' : 'rounded-3xl min-h-[600px] border border-slate-200'}`}
                                    >
                                        {/* Mock Email Bar */}
                                        <div className="h-14 bg-slate-50 border-b border-slate-100 px-6 flex items-center gap-3">
                                            <div className="flex gap-1.5 item-center">
                                                <div className="size-3 bg-red-400 rounded-full" />
                                                <div className="size-3 bg-amber-400 rounded-full" />
                                                <div className="size-3 bg-green-400 rounded-full" />
                                            </div>
                                            <div className="flex-1 h-7 bg-white rounded-lg border border-slate-200 px-3 flex items-center gap-2 overflow-hidden">
                                                <span className="text-[9px] text-slate-300">https://nordicsaunamap.com/newsletter</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col bg-white">
                                            <div className="bg-slate-900 py-12 px-8 text-center text-white relative overflow-hidden">
                                                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                                                <div className="relative z-10 flex flex-col items-center">
                                                    <img src="/logo.png" className="size-14 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-110 transition-transform duration-500" alt="Logo" />
                                                    <div className="text-[14px] font-black tracking-widest uppercase">Nordic<span className="text-primary italic ml-0.5">Sauna</span>Map</div>
                                                </div>
                                            </div>

                                            <div className={`p-10 ${templateId === 'classic' ? 'text-center' : 'text-left'}`}>
                                                <h2 className={`text-4xl font-black text-slate-900 tracking-tighter mb-8 leading-[1.1] ${templateId === 'classic' ? 'font-serif' : ''}`}>{subject || 'Enter Subject...'}</h2>

                                                <div className="aspect-video rounded-[2rem] overflow-hidden mb-10 shadow-2xl shadow-slate-200/50 border-4 border-white bg-slate-50 relative group">
                                                    <img
                                                        src={imageUrl || (templateId === 'classic' ? templates.classic.preview : templates.modern.preview)}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519783166144-83936959822a?auto=format&fit=crop&q=80&w=800';
                                                        }}
                                                    />
                                                </div>

                                                <p className="text-[14px] text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{content || 'Narrative content will manifest here as you type...'}</p>

                                                <div className="mt-12 text-center">
                                                    <div className="inline-block px-10 py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Visit the Platform</div>
                                                </div>
                                            </div>

                                            <div className="p-10 text-center bg-slate-50/50 border-t border-slate-100 space-y-4">
                                                <h1 className="text-[9px] font-black tracking-[0.4em] text-slate-300 uppercase">Nordic Archive Digital Agency</h1>
                                                <p className="text-[8px] text-slate-300 uppercase font-black tracking-widest">© 2026 Nordic Sauna Map • Helsinki • Stockholm • Copenhagen</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* Premium History Interface */
                <div className="flex-1 p-8 lg:p-14 overflow-y-auto custom-scrollbar bg-white/40">
                    <div className="max-w-6xl mx-auto space-y-12">
                        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-12">
                            <div className="space-y-2">
                                <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase">Newsletter Archive</h1>
                                <p className="text-slate-400 font-medium text-lg">Every newsletter sent across the Nordic network since inception.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="bg-slate-900/5 border border-slate-900/5 rounded-2xl p-2 flex">
                                    <button onClick={fetchHistory} className={`p-4 bg-white text-primary rounded-[1.2rem] shadow-xl shadow-slate-200 transition-all ${loadingHistory ? 'animate-spin' : 'hover:scale-105 active:scale-95'}`}>
                                        <Search className="size-5" />
                                    </button>
                                </div>
                            </div>
                        </header>

                        {loadingHistory ? (
                            <div className="py-40 text-center space-y-8">
                                <div className="relative size-24 mx-auto">
                                    <Loader2 className="size-24 text-primary/10 animate-spin" />
                                    <Zap className="size-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <p className="text-[11px] font-black uppercase text-slate-300 tracking-[0.5em] animate-pulse">Syncing with Nordic Vault...</p>
                            </div>
                        ) : history.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center bg-white border border-slate-100 border-dashed rounded-[4rem] group hover:border-primary/20 transition-all duration-700">
                                <div className="size-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 transition-transform duration-700 group-hover:rotate-12">
                                    <FileText className="size-10 text-slate-200" />
                                </div>
                                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Vault is currently empty</h4>
                                <p className="text-slate-400 font-medium">Initialize your first creative newsletter to populate the archive.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {history.map((h, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={h.id}
                                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row items-center gap-10 group hover:border-primary/20 hover:shadow-[0_40px_100px_rgba(0,0,0,0.04)] transition-all duration-700 relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="px-3 py-1 bg-primary/5 text-primary text-[8px] font-black uppercase rounded-lg">Verified</div>
                                        </div>

                                        <div className="size-20 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shrink-0 shadow-2xl shadow-slate-900/40 relative z-10 overflow-hidden transform group-hover:scale-105 transition-transform duration-700">
                                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none" />
                                            {h.template_id === 'classic' ? <LayoutIcon className="size-8" /> : <Zap className="size-8" />}
                                        </div>

                                        <div className="flex-1 text-center md:text-left space-y-2">
                                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black uppercase rounded-lg border border-slate-100">{new Date(h.created_at).toLocaleDateString()}</span>
                                                <span className="size-1.5 bg-slate-200 rounded-full" />
                                                <span className="text-primary text-[10px] font-black uppercase tracking-widest italic">{h.audience}</span>
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 tracking-tighter uppercase line-clamp-1">{h.subject}</h4>
                                        </div>

                                        <div className="flex gap-6 items-center">
                                            <div className="flex gap-4">
                                                <div className="text-center bg-[#fcfdfe] px-6 py-4 rounded-[1.8rem] border border-slate-100 min-w-[120px] shadow-sm">
                                                    <p className="text-2xl font-black text-slate-900 leading-none mb-1">{h.success_count}</p>
                                                    <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.2em]">Sent</p>
                                                </div>
                                                <div className="text-center bg-red-50/20 px-6 py-4 rounded-[1.8rem] border border-red-50 min-w-[120px] shadow-sm">
                                                    <p className="text-2xl font-black text-red-500 leading-none mb-1">{h.failure_count}</p>
                                                    <p className="text-[10px] font-black uppercase text-red-300 tracking-[0.2em]">Lost</p>
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.1, rotate: 5 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => exportToCSV(h.id)}
                                                className="size-16 bg-white border border-slate-100 rounded-[1.8rem] flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all shadow-xl shadow-slate-200/50"
                                            >
                                                <Download className="size-6" />
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <div className="pt-20 pb-10 flex items-center justify-center opacity-20 filter grayscale">
                            <div className="text-[12px] font-black tracking-tighter uppercase text-slate-900">Nordic<span className="text-primary italic">Sauna</span>Map</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AudienceCard = ({ active, onClick, title, count, description, icon }: any) => (
    <button
        onClick={onClick}
        className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border-2 text-left transition-all duration-700 relative overflow-hidden group ${active ? 'border-primary bg-white shadow-[0_40px_100px_rgba(37,99,235,0.08)] scale-[1.02]' : 'border-slate-100 bg-white hover:border-slate-300'}`}
    >
        {active && (
            <motion.div
                layoutId="audience-active-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-0 right-0 size-40 bg-primary/5 -mr-16 -mt-16 rounded-full blur-3xl pointer-events-none"
            />
        )}
        <div className={`size-12 rounded-[1.2rem] flex items-center justify-center mb-6 transition-all duration-700 ${active ? 'bg-primary text-white shadow-xl shadow-primary/30 rotate-12' : 'bg-slate-50 text-slate-400 group-hover:rotate-6'}`}>
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <div className="space-y-2 relative z-10">
            <h4 className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${active ? 'text-primary' : 'text-slate-400'}`}>{title}</h4>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black tracking-tighter ${active ? 'text-slate-900' : 'text-slate-400'}`}>{count}</span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Nodes</span>
            </div>
            <p className={`text-[10px] font-medium leading-relaxed max-w-[200px] ${active ? 'text-slate-500' : 'text-slate-300'}`}>{description}</p>
        </div>
    </button>
);

const TemplateCard = ({ active, onClick, template }: any) => (
    <button
        onClick={onClick}
        className={`p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] border-2 text-left transition-all duration-700 relative group overflow-hidden ${active ? 'border-primary bg-white shadow-2xl' : 'border-slate-100 bg-white hover:border-slate-300'}`}
    >
        <div className="aspect-[16/10] rounded-[1.8rem] overflow-hidden mb-6 relative border-4 border-white shadow-xl transition-all duration-700 group-hover:scale-105">
            <img src={template.preview} className={`w-full h-full object-cover transition-all duration-700 ${active ? 'grayscale-0' : 'grayscale'}`} />
            {active && (
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                    <CheckCircle2 className="size-12 text-white drop-shadow-2xl" />
                </div>
            )}
        </div>
        <div className="space-y-2">
            <h4 className={`text-xl font-black uppercase tracking-tighter ${active ? 'text-slate-900' : 'text-slate-400'}`}>{template.name}</h4>
            <p className={`text-[10px] font-medium ${active ? 'text-slate-500' : 'text-slate-300'}`}>{template.description}</p>
        </div>
    </button>
);
