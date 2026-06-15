import React, { useState, useEffect } from 'react';
import { db, auth, storage } from '../lib/firebase';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    getCountFromServer 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap,
    Users,
    History as HistoryIcon,
    Loader2,
    ShieldCheck
} from 'lucide-react';

// Sub-components
import { NewsletterComposer } from './Newsletter/Composer';
import { SubscriberList } from './Newsletter/SubscriberList';
import { NewsletterHistory } from './Newsletter/History';

interface NewsletterManagerProps {
    t: any;
    lang: 'sv' | 'fi' | 'en';
}

type TabMode = 'composer' | 'subscribers' | 'history';

export const NewsletterManager: React.FC<NewsletterManagerProps> = ({ t, lang }) => {
    const [activeTab, setActiveTab] = useState<TabMode>('composer');
    const [counts, setCounts] = useState({ subscribers: 0, members: 0 });
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchCounts();
    }, []);

    const fetchCounts = async () => {
        try {
            const subscribersSnapshot = await getCountFromServer(
                query(collection(db, 'newsletter_subscribers'), where('status', '==', 'active'))
            );
            const membersSnapshot = await getCountFromServer(collection(db, 'profiles'));
            setCounts({ 
                subscribers: subscribersSnapshot.data().count || 0, 
                members: membersSnapshot.data().count || 0 
            });
        } catch (err) {
            console.error("Error fetching counts:", err);
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const q = query(collection(db, 'broadcasts'), orderBy('created_at', 'desc'));
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                created_at: doc.data().created_at?.toDate?.()?.toISOString() || new Date().toISOString()
            }));
            setHistory(data);
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSend = async (payload: any) => {
        const idToken = await auth.currentUser?.getIdToken(true);
        if (!idToken) throw new Error('Please sign in to continue.');

        const functionUrl = 'https://sendbroadcast-xe3y4doeha-uc.a.run.app';
        const sanitizedToken = idToken.trim().replace(/[^\x21-\x7E]/g, "");

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sanitizedToken}`
            },
            body: JSON.stringify({ ...payload, lang })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || data.message || 'Failed to send');
        
        return data;
    };

    const handleSendTest = async (testEmail: string, payload: any) => {
        const idToken = await auth.currentUser?.getIdToken(true);
        if (!idToken) throw new Error('Please sign in to continue.');

        const functionUrl = 'https://sendbroadcast-xe3y4doeha-uc.a.run.app';
        const sanitizedToken = idToken.trim().replace(/[^\x21-\x7E]/g, "");

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sanitizedToken}`
            },
            body: JSON.stringify({ ...payload, testEmail, lang })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || data.message || 'Test failed');
        }
    };

    const handleImageUpload = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `newsletter/${fileName}`;
        const storageRef = ref(storage, filePath);

        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    const exportToCSV = async (newsletterId: string) => {
        try {
            const recipientsQuery = query(
                collection(db, 'broadcast_recipients'),
                where('broadcast_id', '==', newsletterId)
            );
            const recipientsSnapshot = await getDocs(recipientsQuery);
            const recipients = recipientsSnapshot.docs.map(doc => doc.data());

            if (recipients.length === 0) {
                alert('No report data found for this email.');
                return;
            }

            const headers = ['Email', 'Status', 'Error', 'Timestamp'];
            const csvContent = [
                headers.join(','),
                ...recipients.map(r => [
                    r.email,
                    r.status,
                    `"${(r.error_message || '').replace(/"/g, '""')}"`,
                    r.created_at?.toDate?.()?.toISOString() || ''
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `newsletter-report-${newsletterId}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err: any) {
            alert('Download failed: ' + err.message);
        }
    };

    return (
        <div className="bg-white rounded-none lg:rounded-[3rem] border-0 lg:border border-slate-100 overflow-hidden shadow-none lg:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] h-screen lg:h-[calc(100vh-160px)] min-h-[750px] flex flex-col font-display selection:bg-primary selection:text-white">
            {/* Ultra-Modern Top Navigation */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-50 px-8 py-3 flex items-center justify-between z-50">
                <div className="flex gap-2 bg-slate-50/50 p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                    <TabButton 
                        active={activeTab === 'composer'} 
                        onClick={() => setActiveTab('composer')}
                        icon={<Zap className="size-3.5" />}
                        label="Create"
                    />
                    <TabButton 
                        active={activeTab === 'subscribers'} 
                        onClick={() => setActiveTab('subscribers')}
                        icon={<Users className="size-3.5" />}
                        label="Subscribers"
                    />
                    <TabButton 
                        active={activeTab === 'history'} 
                        onClick={() => { setActiveTab('history'); fetchHistory(); }}
                        icon={<HistoryIcon className="size-3.5" />}
                        label="History"
                    />
                </div>

                <div className="hidden md:flex items-center gap-6 pr-2">
                    <div className="h-10 w-px bg-slate-100 mx-2" />
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-1">System Status</span>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-slate-900 uppercase">{counts.subscribers + counts.members} Total Subscribers</span>
                            <div className="size-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Core */}
            <div className="flex-1 flex flex-col min-h-0 relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'composer' && (
                        <motion.div 
                            key="composer" 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 10 }}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            <NewsletterComposer 
                                counts={counts}
                                lang={lang}
                                onSend={handleSend}
                                onSendTest={handleSendTest}
                                onImageUpload={handleImageUpload}
                                onExport={exportToCSV}
                            />
                        </motion.div>
                    )}
                    {activeTab === 'subscribers' && (
                        <motion.div 
                            key="subscribers" 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 10 }}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            <SubscriberList t={t} lang={lang} />
                        </motion.div>
                    )}
                    {activeTab === 'history' && (
                        <motion.div 
                            key="history" 
                            initial={{ opacity: 0, x: -10 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, x: 10 }}
                            className="flex-1 flex flex-col min-h-0"
                        >
                            <NewsletterHistory 
                                history={history} 
                                loading={loadingHistory} 
                                onExport={exportToCSV} 
                                lang={lang}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button 
        onClick={onClick}
        className={`px-5 py-2 rounded-2xl flex items-center gap-2.5 transition-all duration-500 relative group ${active ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
    >
        <span className={`transition-transform duration-500 ${active ? 'scale-110 text-primary' : 'group-hover:scale-110'}`}>{icon}</span>
        <span className="text-[10px] font-black uppercase tracking-[0.15em]">{label}</span>
        {active && (
            <motion.div 
                layoutId="tab-active"
                className="absolute inset-0 bg-white rounded-2xl -z-10 shadow-sm"
            />
        )}
    </button>
);
