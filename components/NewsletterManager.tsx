import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    doc,
    getDoc,
    getCountFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send,
    Users,
    Mail,
    FileText,
    Eye,
    Layout as LayoutIcon,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Trash2,
    History,
    Download,
    Search,
    ChevronDown,
    ChevronUp,
    Zap,
    Filter,
    BarChart3,
    Upload,
    Globe
} from 'lucide-react';

import { BrandingPreferences, LanguageCode } from '../types';

interface NewsletterManagerProps {
    t: any;
    lang: LanguageCode;
    preferences?: BrandingPreferences;
}

type AudienceType = 'subscribers' | 'users' | 'all' | 'custom';
type TemplateId = 'classic' | 'modern' | 'minimal' | 'event';
type ViewMode = 'composer' | 'history' | 'audience';

// Templates Definition
const templates = {
    classic: {
        name: "Simple Announcement",
        description: "High-contrast, serif-led design for formal updates.",
        preview: "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&q=80&w=600"
    },
    modern: {
        name: "Monthly Digest",
        description: "Clean typography and spacious layout for a premium feel.",
        preview: "https://images.unsplash.com/photo-1516528387618-afa90b13e000?auto=format&fit=crop&q=80&w=600"
    },
    event: {
        name: "Event Invitation",
        description: "Bold imagery and clear call-to-actions for events.",
        preview: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600"
    }
};

export const NewsletterManager: React.FC<NewsletterManagerProps> = ({ t, lang, preferences }) => {

    const [viewMode, setViewMode] = useState<ViewMode>('composer');
    const [audience, setAudience] = useState<AudienceType>('subscribers');
    const [templateId, setTemplateId] = useState<TemplateId>('modern');
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [counts, setCounts] = useState({ subscribers: 0, users: 0 });
    const [testSending, setTestSending] = useState(false);
    
    // History
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [historySortOrder, setHistorySortOrder] = useState<'desc'|'asc'>('desc');
    const [historyDateFrom, setHistoryDateFrom] = useState('');
    const [historyDateTo, setHistoryDateTo] = useState('');
    
    // Audience Tab
    const [subscribers, setSubscribers] = useState<any[]>([]);
    const [loadingSubs, setLoadingSubs] = useState(false);
    const [filterLang, setFilterLang] = useState<string>('all');
    const [searchSub, setSearchSub] = useState('');
    const [filterSource, setFilterSource] = useState<string>('all');
    const [filterDateFrom, setFilterDateFrom] = useState<string>('');
    const [filterDateTo, setFilterDateTo] = useState<string>('');
    const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserEmail(user.email || null);
                fetchUserStatus(user.uid);
            } else {
                setUserEmail(null);
                setUserRole(null);
            }
        });
        fetchCounts();
        return () => unsubscribe();
    }, []);

    const fetchUserStatus = async (uid: string) => {
        try {
            const profileSnap = await getDoc(doc(db, 'profiles', uid));
            if (profileSnap.exists()) {
                setUserRole(profileSnap.data().role || 'user');
            }
        } catch (err) {
            console.error('Error fetching user status:', err);
        }
    };

    const fetchCounts = async () => {
        try {
            const subQuery = query(collection(db, 'newsletter_subscribers'), where('status', '==', 'active'));
            const subSnapshot = await getCountFromServer(subQuery);

            const userSnapshot = await getCountFromServer(collection(db, 'profiles'));

            setCounts({
                subscribers: subSnapshot.data().count,
                users: userSnapshot.data().count
            });
        } catch (err) {
            console.error('Error fetching counts:', err);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const historyQuery = query(collection(db, 'broadcasts'), orderBy('created_at', 'desc'));
            const historySnap = await getDocs(historyQuery);
            const data = historySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setHistory(data);
        } catch (err: any) {
            console.error('[CRITICAL] Newsletter History fetch error:', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchAudience = async () => {
        setLoadingSubs(true);
        try {
            const q = query(collection(db, 'newsletter_subscribers'), orderBy('created_at', 'desc'));
            const snap = await getDocs(q);
            const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSubscribers(data);
        } catch (err) {
            console.error('Error fetching subscribers:', err);
        } finally {
            setLoadingSubs(false);
        }
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
        if (mode === 'history') fetchHistory();
        if (mode === 'audience') fetchAudience();
    };

    const handleSend = async () => {
        if (!confirm("Are you sure you want to send this broadcast? This action cannot be undone.")) return;
        setSending(true);
        try {
            const idToken = await auth.currentUser?.getIdToken();
            if (!idToken) throw new Error('AUTH ERROR: No active session. Please Log Out and Log In again.');

            const cloudFunctionUrl = import.meta.env.VITE_BROADCAST_FUNCTION_URL || 'https://sendbroadcast-suomiportaat-website.a.run.app';

            const response = await fetch(cloudFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    audience: audience === 'users' ? 'members' : audience,
                    customRecipients: audience === 'custom' ? Array.from(selectedSubs) : [],
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
        } catch (err: any) {
            console.error('Newsletter send error:', err);
            setResult({
                success: false,
                count: 0,
                errors: [{ error: err.message }]
            });
        } finally {
            setSending(false);
        }
    };

    const handleSendTest = async () => {
        const testEmail = prompt("Enter email for test dispatch:", "nuno@tropicalastral.com");
        if (!testEmail) return;

        setTestSending(true);
        try {
            const idToken = await auth.currentUser?.getIdToken();
            if (!idToken) throw new Error('AUTH ERROR: Session expired.');

            const cloudFunctionUrl = import.meta.env.VITE_BROADCAST_FUNCTION_URL || 'https://sendbroadcast-suomiportaat-website.a.run.app';

            const response = await fetch(cloudFunctionUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
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

            alert(`Test dispatch successful!\nCheck your inbox at: ${testEmail}`);
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
            const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
            const filePath = `newsletter/${fileName}`;
            const storageRef = ref(storage, filePath);

            await uploadBytes(storageRef, file);
            const publicUrl = await getDownloadURL(storageRef);

            setImageUrl(publicUrl);
        } catch (err: any) {
            console.error('Upload error:', err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const filteredSubscribers = subscribers.filter(sub => {
        if (filterLang !== 'all' && sub.language !== filterLang) return false;
        if (filterSource !== 'all' && sub.source !== filterSource) return false;
        if (searchSub && !sub.email?.toLowerCase().includes(searchSub.toLowerCase())) return false;
        
        if (filterDateFrom || filterDateTo) {
            const joinDate = sub.created_at?.toDate ? sub.created_at.toDate() : new Date(0);
            if (filterDateFrom && joinDate < new Date(filterDateFrom)) return false;
            if (filterDateTo && joinDate > new Date(filterDateTo)) return false;
        }
        return true;
    });

    const handleSelectSub = (email: string) => {
        setSelectedSubs(prev => {
            const next = new Set(prev);
            if (next.has(email)) next.delete(email);
            else next.add(email);
            return next;
        });
    };

    const handleSelectAllFiltered = () => {
        if (selectedSubs.size === filteredSubscribers.length) {
            setSelectedSubs(new Set());
        } else {
            setSelectedSubs(new Set(filteredSubscribers.map(s => s.email)));
        }
    };

    const handleCreateCustomAudience = () => {
        setAudience('custom');
        setViewMode('composer');
    };

    const filteredHistory = history.filter(item => {
        if (historySearch && !item.subject?.toLowerCase().includes(historySearch.toLowerCase())) return false;
        if (historyDateFrom || historyDateTo) {
            const sendDate = item.created_at?.toDate ? item.created_at.toDate() : new Date(0);
            if (historyDateFrom && sendDate < new Date(historyDateFrom)) return false;
            if (historyDateTo && sendDate > new Date(historyDateTo)) return false;
        }
        return true;
    }).sort((a, b) => {
        const dateA = a.created_at?.toDate ? a.created_at.toDate().getTime() : 0;
        const dateB = b.created_at?.toDate ? b.created_at.toDate().getTime() : 0;
        return historySortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    return (
        <div className="bg-[#f3f4f6] min-h-[calc(100vh-100px)] rounded-3xl overflow-hidden font-display flex flex-col">
            {/* Top Navigation */}
            <div className="bg-white px-8 py-6 border-b border-slate-200 flex items-center justify-between sticky top-0 z-50">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-3">
                        <Mail className="size-6 text-primary" /> Newsletter Studio
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">Design, target, and broadcast to your audience</p>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button
                        onClick={() => handleViewModeChange('composer')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'composer' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Composer
                    </button>
                    <button
                        onClick={() => handleViewModeChange('audience')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'audience' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        Audience
                    </button>
                    <button
                        onClick={() => handleViewModeChange('history')}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {viewMode === 'composer' && !result && (
                        <motion.div
                            key="composer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-[1600px] mx-auto"
                        >
                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
                                
                                {/* Left Column: Creative (8 cols) */}
                                <div className="col-span-1 xl:col-span-8 space-y-6 md:space-y-8">
                                    
                                    {/* Content Orchestration Bento */}
                                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="size-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                                                <FileText className="size-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">Creative Content</h2>
                                                <p className="text-slate-500 text-sm font-medium">Compose the subject, imagery, and text of your broadcast.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Subject Line</label>
                                                <input
                                                    type="text"
                                                    placeholder="A catchy subject line..."
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-lg font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-slate-900 placeholder:text-slate-300"
                                                    value={subject}
                                                    onChange={(e) => setSubject(e.target.value)}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Primary Visual</label>
                                                {imageUrl ? (
                                                    <div className="relative aspect-[21/9] rounded-[1.5rem] overflow-hidden group border-2 border-slate-100">
                                                        <img src={imageUrl} className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                            <button onClick={() => setImageUrl(null)} className="px-6 py-3 bg-white text-red-500 rounded-xl text-xs font-bold uppercase flex items-center gap-2 hover:scale-105 transition-all">
                                                                <Trash2 className="size-4" /> Remove Media
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <label className="flex flex-col items-center justify-center aspect-[21/9] border-2 border-dashed border-slate-300 rounded-[1.5rem] cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group overflow-hidden bg-slate-50">
                                                        {uploading ? (
                                                            <Loader2 className="size-8 text-primary animate-spin" />
                                                        ) : (
                                                            <>
                                                                <div className="size-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-primary shadow-sm mb-4 transition-colors"><Upload className="size-6" /></div>
                                                                <p className="text-sm font-bold text-slate-600">Upload Header Image</p>
                                                                <p className="text-xs font-medium text-slate-400 mt-1">JPG, PNG, WEBP (Max 5MB)</p>
                                                            </>
                                                        )}
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                                    </label>
                                                )}
                                            </div>

                                            <div>
                                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">Message Body</label>
                                                <textarea
                                                    rows={12}
                                                    placeholder="Write your newsletter content here... HTML is supported by templates."
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-6 text-slate-900 leading-relaxed font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all resize-none placeholder:text-slate-300"
                                                    value={content}
                                                    onChange={(e) => setContent(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Templates Bento */}
                                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="size-12 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center">
                                                <LayoutIcon className="size-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">Visual Templates</h2>
                                                <p className="text-slate-500 text-sm font-medium">Select a structural design for your message.</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {(Object.keys(templates) as TemplateId[]).map(tid => (
                                                <div 
                                                    key={tid}
                                                    onClick={() => setTemplateId(tid)}
                                                    className={`cursor-pointer rounded-2xl overflow-hidden border-2 transition-all ${templateId === tid ? 'border-primary ring-4 ring-primary/20 bg-primary/5' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                                >
                                                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                                        <img src={templates[tid].preview} className="w-full h-full object-cover" />
                                                        {templateId === tid && (
                                                            <div className="absolute top-3 right-3 size-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg">
                                                                <CheckCircle2 className="size-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        <h4 className="font-bold text-slate-900 uppercase tracking-tight text-sm">{templates[tid].name}</h4>
                                                        <p className="text-xs text-slate-500 mt-1 font-medium">{templates[tid].description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>

                                {/* Right Column: Audience & Action (4 cols) */}
                                <div className="col-span-1 xl:col-span-4 space-y-6 md:space-y-8">
                                    
                                    {/* Audience Bento */}
                                    <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="size-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                                <Users className="size-6" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">Target Audience</h2>
                                                <p className="text-slate-500 text-sm font-medium">Who will receive this broadcast?</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <button 
                                                onClick={() => setAudience('subscribers')}
                                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${audience === 'subscribers' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}
                                            >
                                                <div>
                                                    <h4 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Newsletter Subscribers</h4>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">Opted-in via form</p>
                                                </div>
                                                <span className="bg-white px-3 py-1 rounded-lg font-bold text-slate-900 text-sm shadow-sm">{counts.subscribers}</span>
                                            </button>

                                            <button 
                                                onClick={() => setAudience('users')}
                                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${audience === 'users' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}
                                            >
                                                <div>
                                                    <h4 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Registered Users</h4>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">All platform accounts</p>
                                                </div>
                                                <span className="bg-white px-3 py-1 rounded-lg font-bold text-slate-900 text-sm shadow-sm">{counts.users}</span>
                                            </button>

                                            <button 
                                                onClick={() => setAudience('all')}
                                                className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center justify-between ${audience === 'all' ? 'border-amber-500 bg-amber-50' : 'border-slate-100 hover:border-slate-300'}`}
                                            >
                                                <div>
                                                    <h4 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Entire Network</h4>
                                                    <p className="text-xs text-slate-500 mt-1 font-medium">Subscribers & Users</p>
                                                </div>
                                                <span className="bg-white px-3 py-1 rounded-lg font-bold text-slate-900 text-sm shadow-sm">{counts.subscribers + counts.users}</span>
                                            </button>

                                            {audience === 'custom' && (
                                                <button 
                                                    className="w-full text-left p-5 rounded-2xl border-2 border-amber-500 bg-amber-50 transition-all flex items-center justify-between"
                                                >
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Custom Selection</h4>
                                                        <p className="text-xs text-slate-500 mt-1 font-medium">Selected via Audience Manager</p>
                                                    </div>
                                                    <span className="bg-white px-3 py-1 rounded-lg font-bold text-slate-900 text-sm shadow-sm">{selectedSubs.size}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Bento */}
                                    <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl shadow-slate-900/20 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 size-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                        
                                        <h2 className="text-2xl font-bold uppercase tracking-tight mb-2 relative z-10">Ready for Launch</h2>
                                        <p className="text-slate-400 text-sm font-medium mb-8 relative z-10">Review your settings before sending across the network.</p>
                                        
                                        <div className="space-y-4 relative z-10">
                                            <button 
                                                disabled={!subject || !content || testSending} 
                                                onClick={handleSendTest} 
                                                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {testSending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />} Send Test Email
                                            </button>

                                            <button 
                                                disabled={!subject || !content || sending} 
                                                onClick={handleSend} 
                                                className="w-full py-5 bg-primary text-white rounded-2xl font-bold uppercase text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                                            >
                                                {sending ? <Loader2 className="size-5 animate-spin" /> : <Zap className="size-5" />} Initiate Dispatch
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Result Screen */}
                    {viewMode === 'composer' && result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl mx-auto mt-20"
                        >
                            <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl shadow-slate-200/50 text-center">
                                <div className={`size-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 ${result.success ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                    {result.success ? <CheckCircle2 className="size-12" /> : <AlertCircle className="size-12" />}
                                </div>
                                <h2 className="text-3xl font-bold uppercase tracking-tight text-slate-900 mb-4">{result.success ? 'Dispatch Successful' : 'Dispatch Failed'}</h2>
                                <p className="text-slate-500 font-medium mb-10">
                                    {result.success 
                                        ? `Successfully delivered to ${result.successCount} of ${result.count} recipients.` 
                                        : 'There was a critical error during transmission.'}
                                </p>
                                
                                <button 
                                    onClick={() => setResult(null)} 
                                    className="px-10 py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-2xl font-bold uppercase text-xs tracking-widest transition-all"
                                >
                                    Compose New Message
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Audience Manager View */}
                    {viewMode === 'audience' && (
                        <motion.div
                            key="audience"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-[1600px] mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[600px]"
                        >
                            <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-50/50">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                                        <Users className="size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">Audience Directory</h2>
                                        <p className="text-slate-500 text-sm font-medium">Manage your {subscribers.length} newsletter subscribers.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64 min-w-[200px]">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search emails..." 
                                            value={searchSub}
                                            onChange={(e) => setSearchSub(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    <select 
                                        value={filterLang}
                                        onChange={(e) => setFilterLang(e.target.value)}
                                        className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all text-slate-600 appearance-none pr-10 relative cursor-pointer"
                                    >
                                        <option value="all">All Languages</option>
                                        <option value="en">English</option>
                                        <option value="sv">Swedish</option>
                                        <option value="fi">Finnish</option>
                                    </select>
                                    <select 
                                        value={filterSource}
                                        onChange={(e) => setFilterSource(e.target.value)}
                                        className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all text-slate-600 appearance-none pr-10 relative cursor-pointer"
                                    >
                                        <option value="all">All Sources</option>
                                        <option value="website">Website Popup</option>
                                        <option value="footer">Footer Form</option>
                                        <option value="event">Event Registration</option>
                                        <option value="manual">Manual Entry</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="date" 
                                            value={filterDateFrom}
                                            onChange={(e) => setFilterDateFrom(e.target.value)}
                                            className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all text-slate-600"
                                        />
                                        <span className="text-slate-400 font-bold uppercase text-xs">To</span>
                                        <input 
                                            type="date" 
                                            value={filterDateTo}
                                            onChange={(e) => setFilterDateTo(e.target.value)}
                                            className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all text-slate-600"
                                        />
                                    </div>
                                    {selectedSubs.size > 0 && (
                                        <button 
                                            onClick={handleCreateCustomAudience}
                                            className="py-3 px-6 bg-amber-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30"
                                        >
                                            Use Selected ({selectedSubs.size})
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                                {loadingSubs ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                                        <Loader2 className="size-8 animate-spin mb-4" />
                                        <p className="text-sm font-bold uppercase tracking-widest">Loading Directory...</p>
                                    </div>
                                ) : (
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="pb-4 border-b border-slate-100 text-left">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={selectedSubs.size === filteredSubscribers.length && filteredSubscribers.length > 0}
                                                        onChange={handleSelectAllFiltered}
                                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                    />
                                                </th>
                                                <th className="pb-4 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</th>
                                                <th className="pb-4 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">Source</th>
                                                <th className="pb-4 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">Language</th>
                                                <th className="pb-4 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                                                <th className="pb-4 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400 text-right">Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubscribers.map(sub => (
                                                <tr key={sub.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                    <td className="py-5 text-left w-12">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={selectedSubs.has(sub.email)}
                                                            onChange={() => handleSelectSub(sub.email)}
                                                            className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
                                                        />
                                                    </td>
                                                    <td className="py-5 text-sm font-semibold text-slate-900">{sub.email}</td>
                                                    <td className="py-5 text-sm font-medium text-slate-500 capitalize">{sub.source || 'Website'}</td>
                                                    <td className="py-5">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold uppercase">
                                                            <Globe className="size-3" /> {sub.language || 'EN'}
                                                        </span>
                                                    </td>
                                                    <td className="py-5">
                                                        <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {sub.status || 'active'}
                                                        </span>
                                                    </td>
                                                    <td className="py-5 text-sm font-medium text-slate-500 text-right">
                                                        {sub.created_at?.toDate ? sub.created_at.toDate().toLocaleDateString() : 'Unknown'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredSubscribers.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">No subscribers match your filters.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* History View */}
                    {viewMode === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-[1600px] mx-auto bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8"
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                                        <History className="size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">Broadcast History</h2>
                                        <p className="text-slate-500 text-sm font-medium">Past newsletters and their performance metrics.</p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                                    <div className="relative flex-1 md:w-64 min-w-[200px]">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search subjects..." 
                                            value={historySearch}
                                            onChange={(e) => setHistorySearch(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    <select 
                                        value={historySortOrder}
                                        onChange={(e) => setHistorySortOrder(e.target.value as 'desc'|'asc')}
                                        className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all text-slate-600 appearance-none pr-10 relative cursor-pointer"
                                    >
                                        <option value="desc">Newest First</option>
                                        <option value="asc">Oldest First</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="date" 
                                            value={historyDateFrom}
                                            onChange={(e) => setHistoryDateFrom(e.target.value)}
                                            className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all text-slate-600"
                                        />
                                        <span className="text-slate-400 font-bold uppercase text-xs">To</span>
                                        <input 
                                            type="date" 
                                            value={historyDateTo}
                                            onChange={(e) => setHistoryDateTo(e.target.value)}
                                            className="py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-primary transition-all text-slate-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            {loadingHistory ? (
                                <div className="flex justify-center py-20"><Loader2 className="size-8 text-primary animate-spin" /></div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredHistory.map(item => (
                                        <div key={item.id} className="border border-slate-100 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-slate-300 transition-all">
                                            <div>
                                                <h4 className="text-lg font-bold text-slate-900">{item.subject}</h4>
                                                <div className="flex gap-4 mt-2 text-sm font-medium text-slate-500">
                                                    <span>{item.created_at?.toDate ? item.created_at.toDate().toLocaleDateString() : 'Unknown'}</span>
                                                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs font-bold uppercase">{item.audience}</span>
                                                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs font-bold uppercase">{item.success_count || 0} Delivered</span>
                                                </div>
                                            </div>
                                            {/* Action to view details could go here */}
                                        </div>
                                    ))}
                                    {filteredHistory.length === 0 && (
                                        <div className="text-center py-12 text-slate-500 font-medium">No history found.</div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
