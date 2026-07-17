import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { 
    collection, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    doc, 
    updateDoc, 
    deleteDoc, 
    addDoc,
    serverTimestamp,
    limit,
    startAfter,
    getCountFromServer
} from 'firebase/firestore';
import { 
    Search, 
    UserPlus, 
    Users,
    Trash2, 
    Edit2, 
    Mail, 
    CheckCircle2, 
    XCircle, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    Download, 
    RefreshCw,
    X,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Subscriber {
    id: string;
    email: string;
    status: 'active' | 'unsubscribed';
    created_at: any;
    source?: string;
    lang?: string;
}

interface SubscriberListProps {
    t: any;
    lang: string;
}

export const SubscriberList: React.FC<SubscriberListProps> = ({ t, lang }) => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'unsubscribed'>('all');
    const [showModal, setShowModal] = useState<'add' | 'edit' | null>(null);
    const [editingSub, setEditingSub] = useState<Subscriber | null>(null);
    const [formData, setFormData] = useState({ email: '', status: 'active' as 'active' | 'unsubscribed' });
    const [processing, setProcessing] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [lastDoc, setLastDoc] = useState<any>(null);
    const [page, setPage] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        fetchSubscribers();
        fetchTotalCount();
    }, [statusFilter, page]);

    const fetchTotalCount = async () => {
        try {
            // Count query must match the filter
            const baseCol = collection(db, 'newsletter_subscribers');
            const countQuery = statusFilter !== 'all'
                ? query(baseCol, where('status', '==', statusFilter))
                : query(baseCol);
            const snapshot = await getCountFromServer(countQuery);
            setTotalCount(snapshot.data().count);
        } catch (err) {
            console.error("Error fetching count:", err);
        }
    };

    const buildQuery = (afterDoc?: any) => {
        const baseCol = collection(db, 'newsletter_subscribers');
        if (statusFilter !== 'all') {
            // where() must come before orderBy() and limit()
            return afterDoc
                ? query(baseCol, where('status', '==', statusFilter), orderBy('created_at', 'desc'), startAfter(afterDoc), limit(pageSize))
                : query(baseCol, where('status', '==', statusFilter), orderBy('created_at', 'desc'), limit(pageSize));
        } else {
            return afterDoc
                ? query(baseCol, orderBy('created_at', 'desc'), startAfter(afterDoc), limit(pageSize))
                : query(baseCol, orderBy('created_at', 'desc'), limit(pageSize));
        }
    };

    const fetchSubscribers = async (isSearch = false) => {
        setLoading(true);
        try {
            const q = (page > 1 && lastDoc && !isSearch)
                ? buildQuery(lastDoc)
                : buildQuery();

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            })) as Subscriber[];

            setSubscribers(data);
            setLastDoc(snapshot.docs[snapshot.docs.length - 1] ?? null);
        } catch (err) {
            console.error("Error fetching subscribers:", err);
            setSubscribers([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            fetchSubscribers(true);
            return;
        }
        setLoading(true);
        try {
            const q = query(
                collection(db, 'newsletter_subscribers'),
                where('email', '>=', searchTerm.toLowerCase()),
                where('email', '<=', searchTerm.toLowerCase() + '\uf8ff'),
                limit(50)
            );
            const snapshot = await getDocs(q);
            setSubscribers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })) as Subscriber[]);
        } catch (err) {
            console.error("Search error:", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteSubscriber = async (id: string) => {
        if (!confirm("Remove this subscriber?")) return;
        try {
            await deleteDoc(doc(db, 'newsletter_subscribers', id));
            setSubscribers(prev => prev.filter(s => s.id !== id));
            setTotalCount(prev => prev - 1);
        } catch (err) {
            alert("Failed to remove subscriber.");
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email.trim()) return;
        setProcessing(true);
        try {
            if (showModal === 'add') {
                await addDoc(collection(db, 'newsletter_subscribers'), {
                    email: formData.email.toLowerCase().trim(),
                    status: formData.status,
                    created_at: serverTimestamp(),
                    source: 'admin_panel',
                    lang
                });
            } else if (editingSub) {
                await updateDoc(doc(db, 'newsletter_subscribers', editingSub.id), {
                    email: formData.email.toLowerCase().trim(),
                    status: formData.status,
                    updated_at: serverTimestamp()
                });
            }
            setShowModal(null);
            setFormData({ email: '', status: 'active' });
            fetchSubscribers(true);
            fetchTotalCount();
        } catch (err: any) {
            alert("Error saving: " + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const openEdit = (sub: Subscriber) => {
        setEditingSub(sub);
        setFormData({ email: sub.email, status: sub.status });
        setShowModal('edit');
    };

    const exportToCSV = () => {
        const headers = ["Email", "Status", "Joined", "Source"];
        const rows = subscribers.map(s => [
            s.email,
            s.status,
            s.created_at?.toDate ? s.created_at.toDate().toISOString() : (s.created_at ? new Date(s.created_at).toISOString() : 'N/A'),
            s.source || 'WEB'
        ]);
        const csv = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(r => r.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csv));
        link.setAttribute("download", "nordic_sauna_subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFilterChange = (f: 'all' | 'active' | 'unsubscribed') => {
        setStatusFilter(f);
        setPage(1);
        setLastDoc(null);
    };

    return (
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/20">
            {/* Header */}
            <div className="px-10 py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-1">Subscribers</h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                        <Users className="size-3 text-primary" />
                        {totalCount} {statusFilter === 'all' ? 'Total' : statusFilter === 'active' ? 'Active' : 'Unsubscribed'}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={exportToCSV} className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                        <Download className="size-4" /> Export
                    </button>
                    <button
                        onClick={() => { setFormData({ email: '', status: 'active' }); setShowModal('add'); }}
                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary transition-all active:scale-95 shadow-xl shadow-slate-200"
                    >
                        <UserPlus className="size-4" /> Add New
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="px-10 mb-8 flex flex-col lg:flex-row items-center gap-4">
                <form onSubmit={handleSearch} className="relative flex-1 group w-full lg:max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by email..."
                        className="w-full bg-white border border-slate-200 rounded-[1.25rem] pl-11 pr-4 py-3 text-sm font-bold placeholder:text-slate-300 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-[1.25rem] border border-slate-200 shadow-sm">
                    {(['all', 'active', 'unsubscribed'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => handleFilterChange(status)}
                            className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="flex-1 lg:flex justify-end hidden">
                    <button
                        className="p-3 bg-white border border-slate-200 text-slate-400 rounded-xl hover:text-primary hover:border-primary transition-all"
                        onClick={() => { setPage(1); setLastDoc(null); fetchSubscribers(true); }}
                    >
                        <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar">
                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                        <Loader2 className="size-12 text-primary animate-spin mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Loading subscribers...</p>
                    </div>
                ) : subscribers.length > 0 ? (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Date Added</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Source</th>
                                    <th className="px-8 py-5 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {subscribers.map(sub => (
                                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all group-hover:rotate-6">
                                                    <Mail className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{sub.email}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 capitalize">{sub.source || 'web'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${sub.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                                {sub.status === 'active' ? <CheckCircle2 className="size-3" /> : <XCircle className="size-3" />}
                                                {sub.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-xs font-bold text-slate-400">
                                                {sub.created_at?.toDate ? sub.created_at.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : (sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                                                {sub.source || 'web'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <button onClick={() => openEdit(sub)} className="p-2.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all">
                                                    <Edit2 className="size-4" />
                                                </button>
                                                <button onClick={() => deleteSubscriber(sub.id)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                Showing {subscribers.length} of {totalCount} subscribers
                            </span>
                            <div className="flex items-center gap-3">
                                <button disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:border-primary transition-all shadow-sm">
                                    <ChevronLeft className="size-4" />
                                </button>
                                <div className="size-8 bg-slate-900 text-white rounded-xl flex items-center justify-center text-[10px] font-black shadow-lg shadow-slate-200">{page}</div>
                                <button disabled={page * pageSize >= totalCount} onClick={() => setPage(p => p + 1)} className="p-2 bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:border-primary transition-all shadow-sm">
                                    <ChevronRight className="size-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center shadow-xl shadow-slate-200/50">
                        <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                            <Filter className="size-10" />
                        </div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Subscribers Found</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto mt-2 font-medium leading-relaxed">
                            {statusFilter !== 'all'
                                ? `No ${statusFilter} subscribers. Try switching to "All".`
                                : 'No subscribers yet. Add one to get started.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowModal(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                        {showModal === 'add' ? 'Add Subscriber' : 'Edit Subscriber'}
                                    </h3>
                                    <button onClick={() => setShowModal(null)} className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-all">
                                        <X className="size-5" />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 size-5 text-slate-300" />
                                            <input
                                                autoFocus
                                                type="email"
                                                required
                                                placeholder="email@example.com"
                                                className="w-full bg-slate-50 border-none rounded-2xl pl-14 pr-4 py-4 text-sm font-bold outline-none focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Status</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(['active', 'unsubscribed'] as const).map(s => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status: s })}
                                                    className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${formData.status === s ? 'border-primary bg-primary/5 text-slate-900' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        disabled={processing}
                                        type="submit"
                                        className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 hover:bg-primary transition-all active:scale-[0.98]"
                                    >
                                        {processing ? <Loader2 className="size-5 animate-spin" /> : showModal === 'add' ? <UserPlus className="size-5" /> : <RefreshCw className="size-5" />}
                                        {showModal === 'add' ? 'Add Subscriber' : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
