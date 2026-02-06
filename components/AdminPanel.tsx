import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Sauna } from '../types';
import { EditArchiveModal } from './EditArchiveModal';
import { EducationManager } from './EducationManager';
import { BlogManager } from './BlogManager';
import { NewsletterManager } from './NewsletterManager';
import { User } from '@supabase/supabase-js';

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

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

    const t = {
        en: {
            dashboard: 'Dashboard',
            users: 'Members',
            moderation: 'Sauna Submissions',
            archives: 'Sauna Map',
            exit: 'Exit Console',
            sync: 'Synchronizing Archive...',
            total_users: 'Total Members',
            waiting: 'Pending Review',
            arch_count: 'Archive Count',
            views: 'Content Views',
            distribution: 'Archive Distribution',
            logs: 'Recent Activity Logs',
            back: 'Back to Users',
            user_profile: 'User Profile',
            approve: 'Approve',
            ban: 'Ban',
            delete: 'Delete',
            joined: 'Joined',
            status: 'Status',
            role: 'Role',
            details: 'Details',
            no_pending: 'No Pending Archives',
            all: 'All',
            approved: 'Approved',
            pending: 'Pending',
            rejected: 'Rejected',
            education: 'Pedagogical',
            blog: 'Story Entries',
            newsletter: 'Newsletter'
        },
        sv: {
            dashboard: 'Översikt',
            users: 'Medlemmar',
            moderation: 'Bastuinlämningar',
            archives: 'Bastukarta',
            exit: 'Avsluta Konsol',
            sync: 'Synkroniserar Arkiv...',
            total_users: 'Totalt Antal Medlemmar',
            waiting: 'Väntar på granskning',
            arch_count: 'Antal Arkiv',
            views: 'Visningar',
            distribution: 'Arkivfördelning',
            logs: 'Senaste Loggar',
            back: 'Tillbaka till Användare',
            user_profile: 'Användarprofil',
            approve: 'Godkänn',
            ban: 'Bannlys',
            delete: 'Radera',
            joined: 'Gick med',
            status: 'Status',
            role: 'Roll',
            details: 'Detaljer',
            no_pending: 'Inga väntande arkiv',
            all: 'Alla',
            approved: 'Godkända',
            pending: 'Väntande',
            rejected: 'Nekade',
            education: 'Pedagogiskt',
            blog: 'Stories-moderering',
            newsletter: 'Nyhetsbrev'
        },
        fi: {
            dashboard: 'Hallintapaneeli',
            users: 'Jäsenet',
            moderation: 'Saunahakemukset',
            archives: 'Saunakartta',
            exit: 'Poistu hallinnasta',
            sync: 'Synkronoidaan arkistoa...',
            total_users: 'Jäseniä yhteensä',
            waiting: 'Odottaa tarkistusta',
            arch_count: 'Arkistojen määrä',
            views: 'Katselukerrat',
            distribution: 'Arkistojen jakautuminen',
            logs: 'Viimeisimmät tapahtumat',
            back: 'Takaisin käyttäjiin',
            user_profile: 'Käyttäjäprofiili',
            approve: 'Hyväksy',
            ban: 'Estä',
            delete: 'Poista',
            joined: 'Liittynyt',
            status: 'Tila',
            role: 'Rooli',
            details: 'Tiedot',
            no_pending: 'Ei odottavia arkistoja',
            all: 'Kaikki',
            approved: 'Hyväksytyt',
            pending: 'Odottaa',
            rejected: 'Hylätyt',
            education: 'Pedagoginen',
            blog: 'Tarinoiden moderointi',
            newsletter: 'Uutiskirje'
        }
    }[lang];

    useEffect(() => {
        if (activeTab !== 'user_detail') fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { count: uCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
            const { count: puCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending');
            const { count: sCount } = await supabase.from('saunas').select('*', { count: 'exact', head: true });
            const { count: psCount } = await supabase.from('saunas').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval');
            const { count: asCount } = await supabase.from('saunas').select('*', { count: 'exact', head: true }).eq('status', 'approved');
            const { count: mCount } = await supabase.from('learning_materials').select('*', { count: 'exact', head: true });
            const { count: ppCount } = await supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval');
            const { data: vData, error: vError } = await supabase.from('saunas').select('views');
            if (vError) console.warn('Note: Sauna views column not yet available in database.');

            const totalViews = (!vError && vData) ? vData.reduce((acc, curr) => acc + (curr.views || 0), 0) : 0;

            setStats({
                totalUsers: uCount || 0,
                pendingUsers: puCount || 0,
                totalSaunas: sCount || 0,
                pendingSaunas: psCount || 0,
                approvedSaunas: asCount || 0,
                totalViews,
                totalMaterials: mCount || 0,
                pendingPosts: ppCount || 0
            });

            if (activeTab === 'users') {
                const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
                if (data) setProfiles(data as Profile[]);
            } else if (activeTab === 'moderation') {
                const { data } = await supabase.from('saunas').select('*').eq('status', 'pending_approval').order('created_at', { ascending: false });
                if (data) {
                    const normalized = data.map(s => {
                        const metadata = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : (s.metadata || {});
                        const coordinates = typeof s.coordinates === 'string' ? JSON.parse(s.coordinates) : (s.coordinates || {});
                        const content = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {});

                        let rawCountry = metadata?.country || s.country || 'Finland';
                        if (typeof rawCountry === 'string' && rawCountry) {
                            rawCountry = rawCountry.charAt(0).toUpperCase() + rawCountry.slice(1).toLowerCase();
                        } else {
                            rawCountry = 'Finland';
                        }

                        return {
                            ...s,
                            metadata,
                            coordinates,
                            content,
                            country: rawCountry
                        };
                    });
                    setSaunas(normalized as Sauna[]);
                }
            } else if (activeTab === 'archives') {
                let query = supabase.from('saunas').select('*').order('created_at', { ascending: false });
                if (statusFilter !== 'all') {
                    query = query.eq('status', statusFilter);
                }
                const { data } = await query;
                if (data) {
                    const normalized = data.map(s => {
                        const metadata = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : (s.metadata || {});
                        const coordinates = typeof s.coordinates === 'string' ? JSON.parse(s.coordinates) : (s.coordinates || {});
                        const content = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {});

                        let rawCountry = metadata?.country || s.country || 'Finland';
                        if (typeof rawCountry === 'string' && rawCountry) {
                            rawCountry = rawCountry.charAt(0).toUpperCase() + rawCountry.slice(1).toLowerCase();
                        } else {
                            rawCountry = 'Finland';
                        }

                        return {
                            ...s,
                            metadata,
                            coordinates,
                            content,
                            country: rawCountry
                        };
                    });
                    setSaunas(normalized as Sauna[]);
                }
            } else if (activeTab === 'education') {
                const { data } = await supabase.from('learning_materials').select('*').order('created_at', { ascending: false });
                if (data) setMaterials(data);
            } else if (activeTab === 'blog_moderation') {
                const { data } = await supabase.from('blog_posts').select('*, profiles(full_name)').order('created_at', { ascending: false });
                if (data) setPendingPosts(data);
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
        const { data, error } = await supabase.from('saunas').select('*').eq('created_by', user.id).order('created_at', { ascending: false });
        if (!error && data) setUserSaunas(data as Sauna[]);
        setLoading(false);
    };

    const updateUserStatus = async (userId: string, status: 'approved' | 'banned') => {
        const { error } = await supabase.from('profiles').update({ status }).eq('id', userId);
        if (error) alert(error.message);
        else fetchData();
    };

    const deleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        const { error } = await supabase.from('profiles').delete().eq('id', userId);
        if (error) alert(error.message);
        else fetchData();
    };

    const handleSaunaStatus = async (saunaId: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase.from('saunas').update({ status }).eq('id', saunaId);
        if (!error) {
            if (onUpdate) onUpdate();
            if (activeTab === 'user_detail' && selectedUser) fetchUserSaunas(selectedUser);
            else fetchData();
        }
    };

    const handlePostStatus = async (postId: string, status: 'approved' | 'rejected') => {
        const { error } = await supabase.from('blog_posts').update({ status }).eq('id', postId);
        if (!error) fetchData();
        else alert(error.message);
    };

    const deleteSauna = async (saunaId: string) => {
        if (!confirm('Are you sure you want to permanently delete this archive entry? This action cannot be undone.')) return;

        try {
            const { error } = await supabase.from('saunas').delete().eq('id', saunaId);
            if (error) throw error;

            if (onUpdate) onUpdate();
            if (activeTab === 'user_detail' && selectedUser) fetchUserSaunas(selectedUser);
            else fetchData();
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const saveSaunaEdit = async (sauna: Sauna) => {
        const { id, ...updateData } = sauna;
        const { error } = await supabase.from('saunas').update(updateData).eq('id', id);
        if (!error) {
            setEditingSauna(null);
            if (onUpdate) onUpdate();
            if (selectedUser) fetchUserSaunas(selectedUser);
            else fetchData();
        }
    };

    const logoUrl = "https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/images/Favicon.png";

    return (
        <div className="fixed inset-0 z-[20000] flex bg-slate-50 animate-in fade-in duration-300 font-display">
            {/* Mobile Header / Sidebar Toggle */}
            <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-slate-900 flex items-center justify-between px-6 z-[1210]">
                <div className="flex items-center gap-3">
                    <img src={logoUrl} className="size-8 object-contain" alt="Logo" />
                    <span className="text-white font-black uppercase text-xs tracking-tighter">Admin Console</span>
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-white">
                    <span className="material-symbols-outlined">{isSidebarOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 w-80 bg-slate-900 flex flex-col p-8 text-white transition-transform duration-300 z-[1205] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="hidden lg:flex items-center gap-4 mb-20">
                    <img src={logoUrl} className="size-10 object-contain rounded-lg shadow-lg shadow-white/10" alt="Logo" />
                    <div>
                        <h2 className="text-lg font-black tracking-tighter uppercase leading-none">Admin</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Heritage Console</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-6 lg:mt-0 mt-8">
                    <div>
                        <div className="px-6 mb-3">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Platform</p>
                        </div>
                        <div className="space-y-1">
                            <NavItem
                                icon="dashboard" label={t.dashboard}
                                active={activeTab === 'dashboard'}
                                onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
                            />
                            <NavItem
                                icon="group" label={lang === 'sv' ? 'Medlemmar' : lang === 'fi' ? 'Jäsenet' : 'Members'}
                                active={activeTab === 'users' || activeTab === 'user_detail'}
                                onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
                            />
                            <NavItem
                                icon="outgoing_mail" label={t.newsletter}
                                active={activeTab === 'newsletter'}
                                onClick={() => { setActiveTab('newsletter'); setSidebarOpen(false); }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="px-6 mb-3 flex items-center justify-between">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Moderation</p>
                            {(stats.pendingSaunas + stats.pendingPosts) > 0 && (
                                <span className="size-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                        </div>
                        <div className="space-y-1">
                            <NavItem
                                icon="verified_user" label={t.moderation}
                                active={activeTab === 'moderation'}
                                badge={stats.pendingSaunas > 0 ? stats.pendingSaunas : undefined}
                                onClick={() => { setActiveTab('moderation'); setSidebarOpen(false); }}
                            />
                            <NavItem
                                icon="history_edu" label={t.blog}
                                active={activeTab === 'blog_moderation'}
                                badge={stats.pendingPosts > 0 ? stats.pendingPosts : undefined}
                                onClick={() => { setActiveTab('blog_moderation'); setSidebarOpen(false); }}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="px-6 mb-3">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Database</p>
                        </div>
                        <div className="space-y-1">
                            <NavItem
                                icon="inventory_2" label={t.archives}
                                active={activeTab === 'archives'}
                                onClick={() => { setActiveTab('archives'); setSidebarOpen(false); }}
                            />
                            <NavItem
                                icon="school" label={t.education}
                                active={activeTab === 'education'}
                                onClick={() => { setActiveTab('education'); setSidebarOpen(false); }}
                            />
                        </div>
                    </div>
                </nav>

                <div className="pt-8 mt-8 border-t border-white/10">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold text-sm hover:bg-white/10 hover:text-white transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        {t.exit}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden lg:pt-0 pt-16">
                <header className="h-24 bg-white border-b border-slate-200 hidden lg:flex items-center justify-between px-10">
                    <div className="flex items-center gap-4">
                        {activeTab === 'user_detail' && (
                            <button onClick={() => setActiveTab('users')} className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-all">
                                <span className="material-symbols-outlined">arrow_back</span>
                            </button>
                        )}
                        <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {activeTab === 'user_detail' ? `${t.user_profile}: ${selectedUser?.full_name}` : t[activeTab]}
                        </h1>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                            <div className="size-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">{t.sync}</p>
                        </div>
                    ) : (
                        <div className="max-w-6xl mx-auto space-y-6 lg:space-y-10">
                            {activeTab === 'dashboard' && <DashboardView stats={stats} t={t} />}
                            {activeTab === 'users' && (
                                <UserListView
                                    profiles={profiles} t={t}
                                    onUpdateUser={updateUserStatus}
                                    onDeleteUser={deleteUser}
                                    onSelectUser={fetchUserSaunas}
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
                                        <div className="flex items-center gap-6">
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
                                            return content.name.toLowerCase().includes(searchTermAdmin.toLowerCase());
                                        })}
                                        lang={lang} t={t} onEdit={setEditingSauna} onDelete={deleteSauna}
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
                                <UserDetailView user={selectedUser} saunas={userSaunas} lang={lang} t={t} onBack={() => setActiveTab('users')} onApprove={handleSaunaStatus} onEdit={setEditingSauna} onDelete={deleteSauna} />
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
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick, badge }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
    >
        <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <span className="text-sm font-bold">{label}</span>
        </div>
        {badge && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>}
    </button>
);

const UserListView = ({ profiles, onUpdateUser, onDeleteUser, onSelectUser, t }: any) => (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-x-auto shadow-sm">
        <table className="w-full text-left min-w-[600px]">
            <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{t.details}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{t.status}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400">{t.role}</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 text-right">{t.approve}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {profiles.map((p: Profile) => (
                    <tr key={p.id} onClick={() => onSelectUser(p)} className="hover:bg-slate-50 transition-all group cursor-pointer">
                        <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900">{p.full_name || 'Anonymous'}</p>
                            <p className="text-[11px] text-slate-500">{p.email}</p>
                        </td>
                        <td className="px-6 py-4">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${p.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{p.status}</span>
                        </td>
                        <td className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">{p.role}</td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                                {p.status !== 'approved' && <button onClick={() => onUpdateUser(p.id, 'approved')} className="text-[9px] font-black uppercase text-green-600 hover:underline">{t.approve}</button>}
                                <button onClick={() => onDeleteUser(p.id)} className="text-[9px] font-black uppercase text-red-400 hover:text-red-600">
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const UserDetailView = ({ user, saunas, lang, t, onBack, onApprove, onEdit, onDelete }: any) => (
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
                    <p className="text-[9px] font-black uppercase text-slate-400">Archives</p>
                </div>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {saunas.map((s: Sauna) => {
                const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
                const images = Array.isArray(m.images) ? m.images : [];
                const displayImg = m.featured_image || images[0] || 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Media';
                const resolveUrl = (url: string) => url?.startsWith('http') ? url : `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/${url?.startsWith('/') ? url.slice(1) : url}`;
                const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

                return (
                    <div key={s.id} className="bg-white p-4 rounded-3xl border border-slate-200 group">
                        <div className="aspect-video rounded-2xl overflow-hidden mb-4 relative">
                            <img src={resolveUrl(displayImg)} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=Image+Not+Found'} />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-all">
                                <button onClick={() => onEdit(s)} className="bg-white text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100">Edit</button>
                                <button onClick={() => onDelete(s.id)} className="bg-white text-red-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-50">Delete</button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <h4 className="font-black text-slate-900 uppercase text-sm">{content.name}</h4>
                            {s.status === 'pending_approval' && <button onClick={() => onApprove(s.id, 'approved')} className="text-[9px] font-black uppercase bg-primary text-white px-3 py-1.5 rounded-lg">{t.approve}</button>}
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
                            <span className="material-symbols-outlined text-slate-300 text-sm">history</span>
                            <span className="text-[11px] text-slate-600 font-bold">Log entry heartbeat #{i}</span>
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
            const displayImg = m.featured_image || images[0] || '';
            const resolveUrl = (url: string) => url?.startsWith('http') ? url : `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/${url?.startsWith('/') ? url.slice(1) : url}`;
            const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

            return (
                <div key={s.id} className="bg-white p-4 rounded-3xl border border-slate-200">
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                        <img src={resolveUrl(displayImg)} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/600x400/f1f5f9/94a3b8?text=No+Preview'} />
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

const ArchiveListView = ({ saunas, lang, t, onEdit, onDelete }: any) => (
    <div className="space-y-4">
        {saunas.map((s: Sauna) => {
            const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
            const images = Array.isArray(m.images) ? m.images : [];
            const displayImg = m.featured_image || images[0] || '';
            const resolveUrl = (url: string) => url?.startsWith('http') ? url : `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/${url?.startsWith('/') ? url.slice(1) : url}`;
            const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

            return (
                <div key={s.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                        <div className="size-16 rounded-xl overflow-hidden bg-slate-50">
                            <img src={resolveUrl(displayImg)} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=?'} />
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
            <div className="py-20 text-center text-slate-200 font-black uppercase tracking-[0.2em]">No stories waiting review</div>
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
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        By {(Array.isArray(p.profiles) ? p.profiles[0] : p.profiles)?.full_name || 'Unknown'} • {new Date(p.created_at).toLocaleDateString()}
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
