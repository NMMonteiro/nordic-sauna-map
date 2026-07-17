import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { collection, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, orderBy, getCountFromServer } from 'firebase/firestore';
import { Profile, Sauna } from '../types';
import { resolveMediaUrl } from '../lib/storage';
import { EditArchiveModal } from './EditArchiveModal';
import { EducationManager } from './EducationManager';
import { BlogManager } from './BlogManager';
import { NewsletterManager } from './NewsletterManager';
import { SheetImporter } from './SheetImporter';
import { User, sendPasswordResetEmail } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminPanelProps {
    onClose: () => void;
    lang: 'sv' | 'fi' | 'en';
    onUpdate?: () => void;
    profile?: Profile | null;
    user?: User | null;
}

type AdminTab = 'dashboard' | 'users' | 'moderation' | 'archives' | 'education' | 'blog_moderation' | 'user_detail' | 'newsletter';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, lang, onUpdate, profile, user }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [saunas, setSaunas] = useState<Sauna[]>([]);
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [userSaunas, setUserSaunas] = useState<Sauna[]>([]);
    const [editingSauna, setEditingSauna] = useState<Sauna | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [stats, setStats] = useState({
        totalUsers: 0,
        pendingUsers: 0,
        totalSaunas: 0,
        pendingSaunas: 0,
        approvedSaunas: 0,
        totalViews: 0,
        totalMaterials: 0,
        pendingPosts: 0
    });
    const [materials, setMaterials] = useState<any[]>([]);
    const [pendingPosts, setPendingPosts] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending_approval' | 'rejected'>('all');
    const [searchTermAdmin, setSearchTermAdmin] = useState('');
    const [showImporter, setShowImporter] = useState(false);
    const [editingMember, setEditingMember] = useState<Profile | null>(null);
    const [memberSaveLoading, setMemberSaveLoading] = useState(false);
    const [memberSaveError, setMemberSaveError] = useState<string | null>(null);

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    const t = {
        en: {
            dashboard: 'Dashboard',
            users: 'Members',
            moderation: 'Sauna Submissions',
            archives: 'Sauna Map',
            exit: 'Exit',
            sync: 'Loading...',
            total_users: 'Total Members',
            waiting: 'Pending Review',
            arch_count: 'Total Entries',
            views: 'Content Views',
            distribution: 'Map Overview',
            logs: 'Recent Activity',
            back: 'Back to Members',
            user_profile: 'Member Profile',
            approve: 'Approve',
            ban: 'Ban',
            delete: 'Delete',
            joined: 'Joined',
            status: 'Status',
            role: 'Role',
            details: 'Details',
            no_pending: 'No Pending Submissions',
            all: 'All',
            approved: 'Approved',
            pending: 'Pending',
            submissions: 'Submissions',
            education: 'Resources',
            blog: 'Blog Posts',
            newsletter: 'Newsletter'
        },
        sv: {
            dashboard: 'Översikt',
            users: 'Medlemmar',
            moderation: 'Bastuinlämningar',
            archives: 'Bastukarta',
            exit: 'Avsluta',
            sync: 'Laddar...',
            total_users: 'Totalt Antal Medlemmar',
            waiting: 'Väntar på granskning',
            arch_count: 'Totalt antal',
            views: 'Visningar',
            distribution: 'Kartöversikt',
            logs: 'Senaste aktivitet',
            back: 'Tillbaka till Medlemmar',
            user_profile: 'Medlemsprofil',
            approve: 'Godkänn',
            ban: 'Bannlys',
            delete: 'Radera',
            joined: 'Gick med',
            status: 'Status',
            role: 'Roll',
            details: 'Detaljer',
            no_pending: 'Inga väntande inlämningar',
            all: 'Alla',
            approved: 'Godkända',
            pending: 'Väntande',
            rejected: 'Nekade',
            education: 'Resurser',
            blog: 'Blog Posts',
            newsletter: 'Nyhetsbrev'
        },
        fi: {
            dashboard: 'Hallintapaneeli',
            users: 'Jäsenet',
            moderation: 'Saunahakemukset',
            archives: 'Saunakartta',
            exit: 'Poistu',
            sync: 'Ladataan...',
            total_users: 'Jäseniä yhteensä',
            waiting: 'Odottaa tarkistusta',
            arch_count: 'Merkintöjä yhteensä',
            views: 'Katselukerrat',
            distribution: 'Karttanäkymä',
            logs: 'Viimeinen toiminta',
            back: 'Takaisin jäseniin',
            user_profile: 'Jäsenprofiili',
            approve: 'Hyväksy',
            ban: 'Estä',
            delete: 'Poista',
            joined: 'Liittynyt',
            status: 'Tila',
            role: 'Rooli',
            details: 'Tiedot',
            no_pending: 'Ei odottavia hakemuksia',
            all: 'Kaikki',
            approved: 'Hyväksytyt',
            pending: 'Odottaa',
            rejected: 'Hylätyt',
            education: 'Resurssit',
            blog: 'Tarinat',
            newsletter: 'Uutiskirje'
        }
    }[lang];

    useEffect(() => {
        if (activeTab !== 'user_detail') fetchData();
    }, [activeTab, statusFilter]);


    const fetchData = async () => {
        setLoading(true);
        try {
            // Stats fetching using getCountFromServer for efficiency
            const profilesCol = collection(db, 'profiles');
            const saunasCol = collection(db, 'saunas');
            const materialsCol = collection(db, 'learning_materials');
            const postsCol = collection(db, 'blog_posts');

            const [
                uCount,
                puCount,
                sCount,
                psCount,
                asCount,
                mCount,
                ppCount,
                vSnapshot
            ] = await Promise.all([
                getCountFromServer(profilesCol),
                getCountFromServer(query(profilesCol, where('status', '==', 'pending'))),
                getCountFromServer(saunasCol),
                getCountFromServer(query(saunasCol, where('status', '==', 'pending_approval'))),
                getCountFromServer(query(saunasCol, where('status', '==', 'approved'))),
                getCountFromServer(materialsCol),
                getCountFromServer(query(postsCol, where('status', '==', 'pending_approval'))),
                getDocs(saunasCol)
            ]);

            const totalViews = vSnapshot.docs.reduce((acc, curr) => acc + (curr.data().views || 0), 0);

            setStats({
                totalUsers: uCount.data().count || 0,
                pendingUsers: puCount.data().count || 0,
                totalSaunas: sCount.data().count || 0,
                pendingSaunas: psCount.data().count || 0,
                approvedSaunas: asCount.data().count || 0,
                totalViews,
                totalMaterials: mCount.data().count || 0,
                pendingPosts: ppCount.data().count || 0
            });

            if (activeTab === 'users') {
                const q = query(profilesCol, orderBy('created_at', 'desc'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProfiles(data as Profile[]);
            } else if (activeTab === 'moderation') {
                const q = query(saunasCol, where('status', '==', 'pending_approval'), orderBy('created_at', 'desc'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => {
                    const s = doc.data();
                    const metadata = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : (s.metadata || {});
                    const coordinates = typeof s.coordinates === 'string' ? JSON.parse(s.coordinates) : (s.coordinates || {});
                    const content = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {});
                    const contactRaw = typeof s.contact === 'string' ? JSON.parse(s.contact) : (s.contact || {});
                    const contact = { ...contactRaw, website: contactRaw.website || s.website || '' };

                    let rawCountry = metadata?.country || s.country || 'Finland';
                    if (typeof rawCountry === 'string' && rawCountry) {
                        rawCountry = rawCountry.charAt(0).toUpperCase() + rawCountry.slice(1).toLowerCase();
                    } else {
                        rawCountry = 'Finland';
                    }

                    return {
                        id: doc.id,
                        ...s,
                        metadata,
                        coordinates,
                        content,
                        contact,
                        country: rawCountry
                    };
                });
                setSaunas(data as Sauna[]);
            } else if (activeTab === 'archives') {
                let q = query(saunasCol, orderBy('created_at', 'desc'));
                if (statusFilter !== 'all') {
                    q = query(saunasCol, where('status', '==', statusFilter), orderBy('created_at', 'desc'));
                }
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => {
                    const s = doc.data();
                    const metadata = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : (s.metadata || {});
                    const coordinates = typeof s.coordinates === 'string' ? JSON.parse(s.coordinates) : (s.coordinates || {});
                    const content = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {});
                    const contactRaw = typeof s.contact === 'string' ? JSON.parse(s.contact) : (s.contact || {});
                    const contact = { ...contactRaw, website: contactRaw.website || s.website || '' };

                    let rawCountry = metadata?.country || s.country || 'Finland';
                    if (typeof rawCountry === 'string' && rawCountry) {
                        rawCountry = rawCountry.charAt(0).toUpperCase() + rawCountry.slice(1).toLowerCase();
                    } else {
                        rawCountry = 'Finland';
                    }

                    return {
                        id: doc.id,
                        ...s,
                        metadata,
                        coordinates,
                        content,
                        contact,
                        country: rawCountry
                    };
                });
                setSaunas(data as Sauna[]);
            } else if (activeTab === 'education') {
                const q = query(materialsCol, orderBy('created_at', 'desc'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setMaterials(data);
            } else if (activeTab === 'blog_moderation') {
                const q = query(postsCol, orderBy('created_at', 'desc'));
                const snapshot = await getDocs(q);
                const data = await Promise.all(snapshot.docs.map(async (d) => {
                    const postData = d.data();
                    // In Firestore, we don't have automatic relations like Supabase
                    // We need to fetch the author profile separately or it should be embedded
                    let authorName = 'Unknown';
                    if (postData.author_id) {
                        const profileDoc = await getDoc(doc(db, 'profiles', postData.author_id));
                        if (profileDoc.exists()) {
                            authorName = profileDoc.data().full_name || 'Anonymous';
                        }
                    }
                    return { id: d.id, ...postData, profiles: { full_name: authorName } };
                }));
                setPendingPosts(data);
            }
        } catch (err) {
            console.error('Fetch Admin Data Error:', err);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (activeTab === 'archives') fetchData();
    }, [statusFilter]);

    const fetchUserSaunas = async (user: Profile) => {
        setLoading(true);
        setSelectedUser(user);
        setActiveTab('user_detail');
        try {
            const q = query(collection(db, 'saunas'), where('created_by', '==', user.id), orderBy('created_at', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUserSaunas(data as Sauna[]);
        } catch (err) {
            console.error('Fetch User Saunas Error:', err);
        }
        setLoading(false);
    };

    const updateUserStatus = async (userId: string, status: 'approved' | 'banned') => {
        try {
            await updateDoc(doc(db, 'profiles', userId), { status });
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await deleteDoc(doc(db, 'profiles', userId));
            fetchData();
        } catch (err: any) {
            alert(err.message);
        }
    };

    const updateUserRole = async (userId: string, newRole: 'admin' | 'member' | 'user') => {
        try {
            await updateDoc(doc(db, 'profiles', userId), { role: newRole });
            fetchData();
        } catch (err: any) {
            alert('Failed to update role: ' + err.message);
        }
    };

    const updateMemberProfile = async (userId: string, data: { full_name: string; email: string; role: string }) => {
        setMemberSaveLoading(true);
        setMemberSaveError(null);
        try {
            await updateDoc(doc(db, 'profiles', userId), {
                full_name: data.full_name,
                email: data.email,
                role: data.role,
            });
            setEditingMember(null);
            fetchData();
        } catch (err: any) {
            setMemberSaveError(err.message);
        } finally {
            setMemberSaveLoading(false);
        }
    };

    const handleSaunaStatus = async (saunaId: string, status: 'approved' | 'rejected') => {
        // Optimistic UI Update
        if (activeTab === 'moderation') {
            setSaunas(prev => prev.filter(s => s.id !== saunaId));
        } else {
            setSaunas(prev => prev.map(s => s.id === saunaId ? { ...s, status } : s));
        }

        try {
            await updateDoc(doc(db, 'saunas', saunaId), { status });
            if (onUpdate) onUpdate();
            if (activeTab === 'user_detail' && selectedUser) {
                fetchUserSaunas(selectedUser);
            }
        } catch (err) {
            console.error('Handle Sauna Status Error:', err);
            fetchData(); // Revert on error
        }
    };

    const handlePostStatus = async (postId: string, status: 'approved' | 'rejected') => {
        // Optimistic UI Update
        setPendingPosts(prev => prev.filter(p => p.id !== postId));

        try {
            await updateDoc(doc(db, 'blog_posts', postId), { status });
            if (onUpdate) onUpdate();
        } catch (err) {
            console.error('Handle Post Status Error:', err);
            fetchData(); // Revert on error
        }
    };

    const deleteSauna = async (saunaId: string) => {
        if (!confirm('Are you sure you want to permanently delete this archive entry? This action cannot be undone.')) return;

        try {
            await deleteDoc(doc(db, 'saunas', saunaId));
            if (onUpdate) onUpdate();
            if (activeTab === 'user_detail' && selectedUser) fetchUserSaunas(selectedUser);
            else fetchData();
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const saveSaunaEdit = async (sauna: Sauna) => {
        const { id, ...updateData } = sauna;
        try {
            await updateDoc(doc(db, 'saunas', id), updateData as any);
            setEditingSauna(null);
            if (onUpdate) onUpdate();
            if (selectedUser) fetchUserSaunas(selectedUser);
            else fetchData();
        } catch (err) {
            console.error('Save Sauna Edit Error:', err);
        }
    };

    const logoUrl = "/logo.png";

    return (
        <div className="fixed inset-0 z-[20000] flex bg-slate-50 animate-in fade-in duration-300 font-display">

            {/* Mobile top bar */}
            <div className="lg:hidden absolute top-0 left-0 right-0 h-14 bg-slate-900 flex items-center justify-between px-5 z-[1210]">
                <div className="flex items-center gap-2.5">
                    <img src={logoUrl} className="size-7 object-contain" alt="Logo" />
                    <span className="text-white font-black uppercase text-[11px] tracking-wider">Admin</span>
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-400 hover:text-white transition-colors p-1">
                    <span className="material-symbols-outlined text-xl">{isSidebarOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Compact Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-56 bg-slate-900 flex flex-col py-7 text-white transition-transform duration-300 z-[1205] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Logo */}
                <div className="hidden lg:flex items-center gap-3 px-5 mb-8">
                    <img src={logoUrl} className="size-8 object-contain rounded-lg shadow-lg shadow-white/10" alt="Logo" />
                    <div>
                        <h2 className="text-[12px] font-black tracking-tight uppercase leading-none">Nordic Sauna</h2>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.15em] mt-0.5">Admin Console</p>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2.5 overflow-y-auto lg:mt-0 mt-6 space-y-0.5">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 pb-2 pt-1">Platform</p>
                    <NavItem icon="dashboard" label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} />
                    <NavItem icon="group" label={lang === 'sv' ? 'Medlemmar' : lang === 'fi' ? 'Jäsenet' : 'Members'} active={activeTab === 'users' || activeTab === 'user_detail'} onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} />
                    <NavItem icon="outgoing_mail" label={t.newsletter} active={activeTab === 'newsletter'} onClick={() => { setActiveTab('newsletter'); setSidebarOpen(false); }} />

                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 pb-2 pt-5 flex items-center justify-between">
                        Moderation
                        {(stats.pendingSaunas + stats.pendingPosts) > 0 && (
                            <span className="size-1.5 bg-red-400 rounded-full animate-pulse" />
                        )}
                    </p>
                    <NavItem icon="verified_user" label={t.moderation} active={activeTab === 'moderation'} badge={stats.pendingSaunas > 0 ? stats.pendingSaunas : undefined} onClick={() => { setActiveTab('moderation'); setSidebarOpen(false); }} />
                    <NavItem icon="history_edu" label={t.blog} active={activeTab === 'blog_moderation'} badge={stats.pendingPosts > 0 ? stats.pendingPosts : undefined} onClick={() => { setActiveTab('blog_moderation'); setSidebarOpen(false); }} />

                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 pb-2 pt-5">Content</p>
                    <NavItem icon="inventory_2" label={t.archives} active={activeTab === 'archives'} onClick={() => { setActiveTab('archives'); setSidebarOpen(false); }} />
                    <NavItem icon="school" label={t.education} active={activeTab === 'education'} onClick={() => { setActiveTab('education'); setSidebarOpen(false); }} />
                </nav>

                {/* Exit */}
                <div className="px-2.5 pt-5 mt-4 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-slate-500 font-bold text-[11px] hover:bg-white/5 hover:text-slate-300 transition-all"
                    >
                        <span className="material-symbols-outlined text-base">logout</span>
                        {t.exit}
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col overflow-hidden lg:pt-0 pt-14">

                {/* Slim content header */}
                <header className="h-14 bg-white border-b border-slate-100 hidden lg:flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-3">
                        {activeTab === 'user_detail' && (
                            <button onClick={() => setActiveTab('users')} className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-700 transition-all">
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                            </button>
                        )}
                        <div>
                            <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-none">
                                {activeTab === 'user_detail' ? (selectedUser?.full_name || t.user_profile) : t[activeTab]}
                            </h1>
                            {activeTab === 'user_detail' && (
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Member Profile</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-300 tracking-widest">
                        <span className="size-1.5 bg-green-400 rounded-full" />
                        Live
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                            <div className="size-10 border-[3px] border-slate-200 border-t-primary rounded-full animate-spin" />
                            <p className="text-[9px] font-black uppercase tracking-[0.25em]">{t.sync}</p>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto p-5 lg:p-8 space-y-6">
                            {activeTab === 'dashboard' && <DashboardView stats={stats} t={t} />}
                            {activeTab === 'users' && (
                                <UserListView
                                    profiles={profiles} t={t}
                                    onUpdateUser={updateUserStatus}
                                    onDeleteUser={deleteUser}
                                    onSelectUser={fetchUserSaunas}
                                    onEditMember={setEditingMember}
                                    onUpdateRole={updateUserRole}
                                    currentUserId={user?.uid}
                                />
                            )}
                            {activeTab === 'moderation' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <h2 className="text-xl font-black text-slate-900 uppercase">{t.moderation}</h2>
                                        <div className="relative flex-1 max-w-md">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                            <input
                                                type="text"
                                                placeholder="Search submissions..."
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                value={searchTermAdmin}
                                                onChange={(e) => setSearchTermAdmin(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <ModerationView
                                        saunas={saunas.filter(s => {
                                            const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: '' };
                                            return content.name.toLowerCase().includes(searchTermAdmin.toLowerCase());
                                        })}
                                        lang={lang} t={t} onApprove={handleSaunaStatus} onReject={handleSaunaStatus} onDelete={deleteSauna}
                                    />
                                </div>
                            )}
                            {activeTab === 'archives' && (
                                <div className="space-y-6">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-center gap-4">
                                            <h2 className="text-xl font-black text-slate-900 uppercase">{t.archives}</h2>
                                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                                {(['all', 'approved', 'pending_approval', 'rejected'] as const).map(f => (
                                                    <button
                                                        key={f}
                                                        onClick={() => setStatusFilter(f)}
                                                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all ${statusFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                                                    >
                                                        {t[f === 'pending_approval' ? 'pending' : f]}
                                                    </button>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => setShowImporter(true)}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-[11px] font-black hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 ml-auto"
                                            >
                                                <span className="material-symbols-outlined text-base">upload</span>
                                                Import
                                            </button>
                                        </div>
                                        <div className="relative flex-1 max-w-md">
                                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
                                            <input
                                                type="text"
                                                placeholder="Search map entries..."
                                                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
                                                value={searchTermAdmin}
                                                onChange={(e) => setSearchTermAdmin(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <ArchiveListView
                                        saunas={saunas.filter(s => {
                                            const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: '' };
                                            const matchesSearch = content.name.toLowerCase().includes(searchTermAdmin.toLowerCase());
                                            const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
                                            return matchesSearch && matchesStatus;
                                        })}
                                        lang={lang} t={t} onEdit={setEditingSauna} onDelete={deleteSauna} onApprove={handleSaunaStatus} onReject={handleSaunaStatus}
                                    />
                                </div>
                            )}
                            {activeTab === 'education' && (
                                <EducationManager materials={materials} t={t} onRefresh={fetchData} profile={profile} />
                            )}
                            {activeTab === 'blog_moderation' && user && (
                                <BlogManager posts={pendingPosts} t={t} onRefresh={fetchData} profile={profile} user={user} lang={lang} />
                            )}
                            {activeTab === 'newsletter' && (
                                <NewsletterManager t={t} lang={lang} />
                            )}
                            {activeTab === 'user_detail' && selectedUser && (
                                <UserDetailView user={selectedUser} saunas={userSaunas} lang={lang} t={t} onBack={() => setActiveTab('users')} onApprove={handleSaunaStatus} onReject={handleSaunaStatus} onEdit={setEditingSauna} onDelete={deleteSauna} />
                            )}
                        </div>
                    )}
                </div>
            </main>

            {editingSauna && (
                <EditArchiveModal
                    sauna={editingSauna}
                    lang={lang}
                    onClose={() => setEditingSauna(null)}
                    onSave={saveSaunaEdit}
                />
            )}
            {showImporter && (
                <SheetImporter
                    onClose={() => setShowImporter(false)}
                    onSuccess={(count) => { setShowImporter(false); fetchData(); }}
                />
            )}
            <AnimatePresence>
                {editingMember && (
                    <EditMemberModal
                        member={editingMember}
                        currentUser={user ?? null}
                        onClose={() => { setEditingMember(null); setMemberSaveError(null); }}
                        onSave={updateMemberProfile}
                        loading={memberSaveLoading}
                        error={memberSaveError}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick, badge }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all text-left ${active ? 'bg-white/10 text-white' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}
    >
        <div className="flex items-center gap-2.5">
            <span className={`material-symbols-outlined text-[18px] ${active ? 'text-white' : 'text-slate-500'}`}>{icon}</span>
            <span className="text-[12px] font-bold">{label}</span>
        </div>
        {badge && <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>}
    </button>
);

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    admin:  { label: 'Admin',  color: 'text-purple-700', bg: 'bg-purple-100' },
    member: { label: 'Member', color: 'text-blue-700',   bg: 'bg-blue-100'   },
    user:   { label: 'User',   color: 'text-slate-600',  bg: 'bg-slate-100'  },
};

const UserListView = ({ profiles, onUpdateUser, onDeleteUser, onSelectUser, onEditMember, onUpdateRole, currentUserId, t }: any) => (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[700px]">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{t.details}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{t.status}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{t.role}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">Joined</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {profiles.map((p: Profile) => {
                    const roleCfg = ROLE_CONFIG[p.role] || ROLE_CONFIG.user;
                    const isSelf = p.id === currentUserId;
                    const isAdmin = p.role === 'admin';
                    return (
                        <tr key={p.id} className="hover:bg-slate-50/60 transition-all group">
                            <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectUser(p)}>
                                <p className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{p.full_name || 'Anonymous'}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{p.email}</p>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                    p.status === 'approved' ? 'bg-green-100 text-green-700' :
                                    p.status === 'banned'   ? 'bg-red-100 text-red-600' :
                                    'bg-amber-100 text-amber-600'
                                }`}>{p.status}</span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${roleCfg.bg} ${roleCfg.color}`}>{roleCfg.label}</span>
                            </td>
                            <td className="px-6 py-4 text-[11px] font-medium text-slate-500">
                                {p.created_at?.toDate ? p.created_at.toDate().toLocaleDateString() : (p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Unknown')}
                            </td>
                            <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center justify-end gap-1">
                                    {/* Approve / Ban toggle */}
                                    {p.status !== 'approved' ? (
                                        <button
                                            title="Approve member"
                                            onClick={() => onUpdateUser(p.id, 'approved')}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-all text-[9px] font-black uppercase"
                                        >
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Approve
                                        </button>
                                    ) : (
                                        !isSelf && (
                                            <button
                                                title="Ban member"
                                                onClick={() => onUpdateUser(p.id, 'banned')}
                                                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-symbols-outlined text-sm">block</span>
                                            </button>
                                        )
                                    )}

                                    {/* Role toggle — promote / demote */}
                                    {!isSelf && (
                                        isAdmin ? (
                                            <button
                                                title="Demote to Member"
                                                onClick={() => onUpdateRole(p.id, 'member')}
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-all text-[9px] font-black uppercase opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-symbols-outlined text-sm">arrow_downward</span>
                                                Demote
                                            </button>
                                        ) : (
                                            <button
                                                title="Promote to Admin"
                                                onClick={() => onUpdateRole(p.id, 'admin')}
                                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 text-slate-500 hover:bg-purple-50 hover:text-purple-600 transition-all text-[9px] font-black uppercase opacity-0 group-hover:opacity-100"
                                            >
                                                <span className="material-symbols-outlined text-sm">arrow_upward</span>
                                                Promote
                                            </button>
                                        )
                                    )}

                                    {/* Edit */}
                                    <button
                                        title="Edit member"
                                        onClick={() => onEditMember(p)}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-sm">edit</span>
                                    </button>

                                    {/* Delete */}
                                    {!isSelf && (
                                        <button
                                            title="Delete member"
                                            onClick={() => onDeleteUser(p.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

// ─── Edit Member Modal ───────────────────────────────────────────────────────
const FUNCTIONS_BASE = 'https://us-central1-nordic-saunas.cloudfunctions.net';

const EditMemberModal = ({ member, currentUser, onClose, onSave, loading, error }: {
    member: Profile;
    currentUser: User | null;
    onClose: () => void;
    onSave: (id: string, data: { full_name: string; email: string; role: string }) => void;
    loading: boolean;
    error: string | null;
}) => {
    const [fullName, setFullName] = useState(member.full_name || '');
    const [email, setEmail] = useState(member.email || '');
    const [role, setRole] = useState(member.role || 'member');

    // Password section state
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [pwStatus, setPwStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [resetLoading, setResetLoading] = useState(false);
    const [resetStatus, setResetStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(member.id!, { full_name: fullName, email, role });
    };

    const handleSendResetEmail = async () => {
        if (!member.email) return;
        setResetLoading(true);
        setResetStatus(null);
        try {
            await sendPasswordResetEmail(auth, member.email);
            setResetStatus({ type: 'success', message: `Reset email sent to ${member.email}` });
        } catch (err: any) {
            setResetStatus({ type: 'error', message: err.message });
        } finally {
            setResetLoading(false);
        }
    };

    const handleSetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            setPwStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }
        if (!member.id) {
            setPwStatus({ type: 'error', message: 'Member ID not found' });
            return;
        }
        if (!currentUser) {
            setPwStatus({ type: 'error', message: 'You must be logged in' });
            return;
        }
        setPwLoading(true);
        setPwStatus(null);
        try {
            const token = await currentUser.getIdToken();
            const response = await fetch(`${FUNCTIONS_BASE}/setUserPassword`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ targetUid: member.id, newPassword }),
            });
            const data = await response.json();
            if (data.success) {
                setPwStatus({ type: 'success', message: 'Password updated successfully' });
                setNewPassword('');
            } else {
                setPwStatus({ type: 'error', message: data.error || 'Failed to update password' });
            }
        } catch (err: any) {
            setPwStatus({ type: 'error', message: err.message });
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[25000] flex items-center justify-center p-4"
        >
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
                {/* Header */}
                <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Edit Member</p>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">{member.full_name || 'Anonymous'}</h2>
                    </div>
                    <button onClick={onClose} className="size-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors">
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <form onSubmit={handleSubmit} className="p-8 space-y-5">
                        {/* Full Name */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">Full Name</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">person</span>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary/30 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all"
                                    placeholder="Full name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">Email Address</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">mail</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary/30 focus:bg-white rounded-xl pl-11 pr-4 py-3 text-sm font-semibold text-slate-900 outline-none transition-all"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <p className="text-[9px] text-amber-500 font-bold mt-1.5 ml-1">⚠ Updates Firestore profile only — Firebase Auth email is separate.</p>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-2">Role & Permissions</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['member', 'user', 'admin'] as const).map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={`py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-wide transition-all ${
                                            role === r
                                                ? r === 'admin' ? 'border-purple-400 bg-purple-50 text-purple-700'
                                                  : r === 'member' ? 'border-blue-400 bg-blue-50 text-blue-700'
                                                  : 'border-slate-400 bg-slate-100 text-slate-700'
                                                : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        {r === 'admin' && <span className="material-symbols-outlined text-sm block mx-auto mb-1">shield</span>}
                                        {r === 'member' && <span className="material-symbols-outlined text-sm block mx-auto mb-1">person</span>}
                                        {r === 'user' && <span className="material-symbols-outlined text-sm block mx-auto mb-1">manage_accounts</span>}
                                        {r}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-2 text-[9px] text-slate-400 font-bold space-y-0.5">
                                <p><span className="text-purple-600">Admin</span> — full platform access &amp; moderation</p>
                                <p><span className="text-blue-600">Member</span> — can contribute saunas and write posts</p>
                                <p><span className="text-slate-500">User</span> — read-only access</p>
                            </div>
                        </div>

                        {/* Profile error */}
                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-[11px] font-bold p-4 rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Save profile actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 rounded-xl border-2 border-slate-100 text-slate-500 font-black text-[11px] uppercase tracking-wide hover:bg-slate-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3.5 rounded-xl bg-slate-900 text-white font-black text-[11px] uppercase tracking-wide hover:bg-primary transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <><span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-sm">save</span> Save Changes</>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* ─── Password Management Section ─────────────────────── */}
                    <div className="px-8 pb-8 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-slate-100" />
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Password</p>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        {/* Send reset email */}
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-700">Send Reset Email</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Sends a password reset link to <span className="font-bold text-slate-600">{member.email}</span></p>
                            </div>
                            {resetStatus && (
                                <div className={`text-[10px] font-bold p-2.5 rounded-lg ${
                                    resetStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                                }`}>
                                    {resetStatus.message}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handleSendResetEmail}
                                disabled={resetLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border-2 border-slate-200 hover:border-primary/40 hover:text-primary text-slate-600 font-black text-[10px] uppercase tracking-wide transition-all disabled:opacity-50"
                            >
                                {resetLoading ? (
                                    <><span className="size-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> Sending...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-sm">forward_to_inbox</span> Send Reset Link</>   
                                )}
                            </button>
                        </div>

                        {/* Set password directly via Cloud Function */}
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-700">Set New Password</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">Immediately sets a new password — requires Functions deployment</p>
                            </div>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">lock</span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={e => { setNewPassword(e.target.value); setPwStatus(null); }}
                                    placeholder="Min. 6 characters"
                                    className="w-full bg-white border-2 border-slate-200 focus:border-primary/30 rounded-xl pl-10 pr-12 py-3 text-sm font-semibold text-slate-900 outline-none transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                            {pwStatus && (
                                <div className={`text-[10px] font-bold p-2.5 rounded-lg ${
                                    pwStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                                }`}>
                                    {pwStatus.message}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={handleSetPassword}
                                disabled={pwLoading || !newPassword}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-wide hover:bg-primary transition-all disabled:opacity-40"
                            >
                                {pwLoading ? (
                                    <><span className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Setting...</>
                                ) : (
                                    <><span className="material-symbols-outlined text-sm">key</span> Set Password</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

const UserDetailView = ({ user, saunas, lang, t, onBack, onApprove, onReject, onEdit, onDelete }: any) => (
    <div className="space-y-6">
        <div className="bg-white p-6 lg:p-10 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
                <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-4 transition-colors">
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.back}</span>
                </button>
                <h2 className="text-2xl font-black text-slate-900">{user.full_name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-xs text-slate-500">{user.email}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${user.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{user.status}</span>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="bg-slate-50 px-6 py-4 rounded-2xl text-center min-w-[100px]">
                    <p className="text-xl font-black text-slate-900">{saunas.length}</p>
                    <p className="text-[9px] font-black uppercase text-slate-400">Entries</p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saunas.map((s: Sauna) => {
                const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
                const images = Array.isArray(m.images) ? m.images : [];
                const resolveUrl = (url: string) => resolveMediaUrl(url, 'sauna-media');
                let displayImgRaw = m.featured_image || images[0] || '';
                if (displayImgRaw === '[URL]') displayImgRaw = '';
                let displayImg = resolveUrl(displayImgRaw);
                if (!displayImg && s.contact?.website && s.contact.website !== '[URL]') {
                    displayImg = `https://v1.screenshot.11ty.dev/${encodeURIComponent(s.contact.website)}/opengraph/`;
                }
                if (!displayImg) {
                    displayImg = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Media';
                }
                const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

                return (
                    <div key={s.id} className="bg-white p-4 rounded-3xl border border-slate-200 group">
                        <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                            <img src={displayImg} className="w-full h-full object-cover" onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Image+Not+Found'; }} />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all">
                                <button onClick={() => onEdit(s)} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100">Edit</button>
                                <button onClick={() => onDelete(s.id)} className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-50">Delete</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <h4 className="font-black text-slate-900 uppercase text-sm">{content.name}</h4>
                            {s.status === 'pending_approval' && (
                                <div className="flex gap-2">
                                    <button onClick={() => onApprove(s.id, 'approved')} className="text-[9px] font-black uppercase bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-all">{t.approve}</button>
                                    <button onClick={() => onReject(s.id, 'rejected')} className="text-[9px] font-black uppercase bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all">{t.reject}</button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const DashboardView = ({ stats, t }: any) => (
    <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon="group" label={t.total_users} value={stats.totalUsers} color="bg-blue-600" />
            <StatCard icon="verified" label={t.approved} value={stats.approvedSaunas} color="bg-emerald-600" />
            <StatCard icon="pending_actions" label={t.waiting} value={stats.pendingSaunas} color="bg-amber-500" />
            <StatCard icon="database" label={t.arch_count} value={stats.totalSaunas} color="bg-slate-700" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 lg:p-10 rounded-3xl border border-slate-200">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">{t.distribution}</h3>
                <div className="h-48 border-2 border-dashed border-slate-100 rounded-2xl flex items-center justify-center bg-slate-50">
                    <span className="material-symbols-outlined text-slate-200 text-4xl">public</span>
                </div>
            </div>
            <div className="bg-white p-6 lg:p-10 rounded-3xl border border-slate-200">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6">{t.logs}</h3>
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <span className="material-symbols-outlined text-slate-300 text-sm">check_circle</span>
                            <span className="text-[11px] text-slate-600 font-bold">No recent events</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

const StatCard = ({ icon, label, value, color }: any) => (
    <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className={`size-10 ${color} rounded-xl flex items-center justify-center text-white mb-4 relative z-10`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div className="relative z-10">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{label}</p>
            <p className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
    </div>
);

const ModerationView = ({ saunas, lang, t, onApprove, onReject }: any) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {saunas.length > 0 ? saunas.map((s: Sauna) => {
            const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
            const images = Array.isArray(m.images) ? m.images : [];
            const resolveUrl = (url: string) => resolveMediaUrl(url, 'sauna-media');
            let displayImgRaw = m.featured_image || images[0] || '';
            if (displayImgRaw === '[URL]') displayImgRaw = '';
            let displayImg = resolveUrl(displayImgRaw);
            if (!displayImg && s.contact?.website && s.contact.website !== '[URL]') {
                displayImg = `https://v1.screenshot.11ty.dev/${encodeURIComponent(s.contact.website)}/opengraph/`;
            }
            if (!displayImg) {
                displayImg = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Preview';
            }
            const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

            return (
                <div key={s.id} className="bg-white p-4 rounded-3xl border border-slate-200">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                        <img src={displayImg} className="w-full h-full object-cover" onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Preview'; }} />
                    </div>
                    <h4 className="font-black text-slate-900 text-lg uppercase">{content.name}</h4>
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => onApprove(s.id, 'approved')} className="flex-1 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase">{t.approve}</button>
                        <button onClick={() => onReject(s.id, 'rejected')} className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase hover:text-red-500">Reject</button>
                    </div>
                </div>
            );
        }) : <div className="col-span-full py-20 text-center text-slate-200 font-black uppercase tracking-widest">{t.no_pending}</div>}
    </div>
);

const ArchiveListView = ({ saunas, lang, t, onEdit, onDelete, onApprove, onReject }: any) => (
    <div className="space-y-4">
        {saunas.map((s: Sauna) => {
            const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
            const images = Array.isArray(m.images) ? m.images : [];
            const resolveUrl = (url: string) => resolveMediaUrl(url, 'sauna-media');
            let displayImgRaw = m.featured_image || images[0] || '';
            if (displayImgRaw === '[URL]') displayImgRaw = '';
            let displayImg = resolveUrl(displayImgRaw);
            if (!displayImg && s.contact?.website && s.contact.website !== '[URL]') {
                displayImg = `https://v1.screenshot.11ty.dev/${encodeURIComponent(s.contact.website)}/opengraph/`;
            }
            if (!displayImg) {
                displayImg = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=?';
            }
            const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

            return (
                <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-xl overflow-hidden bg-slate-50">
                            <img src={displayImg} className="w-full h-full object-cover" onError={(e: any) => { e.target.onerror = null; e.target.src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=?'; }} />
                        </div>
                        <div>
                            <h4 className="font-black text-sm text-slate-900 uppercase">{content.name}</h4>
                            <p className="text-[9px] font-black text-slate-400 uppercase">{s.metadata.region}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => onEdit(s)} className="p-2 text-slate-400 hover:text-slate-900"><span className="material-symbols-outlined text-sm">edit</span></button>
                        <button onClick={() => onDelete(s.id)} className="p-2 text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                    </div>
                </div>
            );
        })}
    </div>
);

const BlogModerationView = ({ posts, onApprove, onReject }: any) => (
    <div className="space-y-6">
        {posts.length === 0 ? (
            <div className="py-20 text-center text-slate-200 font-black uppercase tracking-[0.2em]">No posts waiting review</div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {posts.map((p: any) => (
                    <div key={p.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col md:flex-row">
                        {(() => {
                            let mediaUrls = [];
                            try {
                                if (Array.isArray(p.media_urls)) mediaUrls = p.media_urls;
                                else if (typeof p.media_urls === 'string') mediaUrls = JSON.parse(p.media_urls);
                            } catch (e) { }

                            return mediaUrls?.[0] ? (
                                <div className="md:w-64 h-48 md:h-auto">
                                    <img src={mediaUrls[0]} className="w-full h-full object-cover" alt="Post" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                </div>
                            ) : null;
                        })()}
                        <div className="p-8 flex-1">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 uppercase mb-1">{p.title}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        By {(Array.isArray(p.profiles) ? p.profiles[0] : p.profiles)?.full_name || 'Unknown'} • {p.created_at?.toDate ? p.created_at.toDate().toLocaleDateString() : (p.created_at ? new Date(p.created_at).toLocaleDateString() : 'Unknown')}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onApprove(p.id, 'approved')} className="bg-green-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-600 transition-all">Approve</button>
                                    <button onClick={() => onReject(p.id, 'rejected')} className="bg-slate-100 text-slate-400 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Reject</button>
                                </div>
                            </div>
                            <div className="text-sm text-slate-500 font-light line-clamp-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: p.content }} />
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);
