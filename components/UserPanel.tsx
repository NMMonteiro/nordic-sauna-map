import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Sauna } from '../types';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { EditArchiveModal } from './EditArchiveModal';
import { EducationManager } from './EducationManager';
import { BlogManager } from './BlogManager';
import { cn } from '../lib/utils';
import {
    LayoutDashboard,
    Inbox,
    GraduationCap,
    BookOpen,
    Settings,
    LogOut,
    PlusCircle,
    ChevronRight,
    Search,
    Filter,
    ArrowLeft,
    CheckCircle2,
    Clock,
    Eye,
    Trash2,
    Edit3,
    Menu,
    X,
    ShieldCheck
} from 'lucide-react';

interface UserPanelProps {
    onClose: () => void;
    lang: 'sv' | 'fi' | 'en';
    user: User;
    profile: Profile | null;
    onAddSauna: () => void;
    onUpdate?: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    setLang: (lang: 'sv' | 'fi' | 'en') => void;
}

type UserTab = 'overview' | 'submissions' | 'education' | 'blog' | 'settings';

export const UserPanel: React.FC<UserPanelProps> = ({
    onClose,
    lang,
    user,
    profile,
    onAddSauna,
    onUpdate,
    theme,
    setTheme,
    setLang
}) => {
    const [activeTab, setActiveTab] = useState<UserTab>('overview');
    const [mySaunas, setMySaunas] = useState<Sauna[]>([]);
    const [editingSauna, setEditingSauna] = useState<Sauna | null>(null);
    const [materials, setMaterials] = useState<any[]>([]);
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const t = {
        en: {
            overview: 'Overview',
            submissions: 'Sauna Submissions',
            settings: 'Profile & Security',
            submit: 'Add Sauna',
            back: 'Back to Map',
            acc_status: 'Account Status',
            verified: 'Verified Contributor',
            pending: 'Review Pending',
            submitted: 'Total Sent',
            approved: 'Live Heritage',
            views: 'Global Reach',
            profile_settings: 'Personal Information',
            name: 'Display Name',
            email: 'Primary Email',
            locked: 'Contact support to change core identity details.',
            no_contrib: 'Your archive is empty.',
            edit: 'Manage',
            member: 'Heritage Member',
            contributor: 'Active Contributor',
            education: 'Educational Assets',
            blog: 'Cultural Stories'
        },
        sv: {
            overview: 'Översikt',
            submissions: 'Mina bastubidrag',
            settings: 'Inställningar',
            submit: 'Lägg till bastu',
            back: 'Tillbaka till kartan',
            acc_status: 'Kontostatus',
            verified: 'Verifierad bidragsgivare',
            pending: 'Väntar på granskning',
            submitted: 'Inskickade',
            approved: 'Live-arkiv',
            views: 'Global kännedom',
            profile_settings: 'Profiluppgifter',
            name: 'Visa namn',
            email: 'E-postadress',
            locked: 'Kontakta ylläpito för att ändra identitetsuppgifter.',
            no_contrib: 'Inga bidrag ännu',
            edit: 'Hantera',
            member: 'Medlem',
            contributor: 'Bidragsgivare',
            education: 'Pedagogiska resurser',
            blog: 'Mina berättelser'
        },
        fi: {
            overview: 'Yleiskatsaus',
            submissions: 'Saunalähetykset',
            settings: 'Asetukset',
            submit: 'Lisää sauna',
            back: 'Takaisin kartalle',
            acc_status: 'Tilin tila',
            verified: 'Vahvistettu avustaja',
            pending: 'Odottaa tarkistusta',
            submitted: 'Lähetetty',
            approved: 'Live-kulttuuriperintö',
            views: 'Maailmanlaajuinen tavoittavuus',
            profile_settings: 'Henkilökohtaiset tiedot',
            name: 'Näyttönimi',
            email: 'Ensisijainen sähköposti',
            locked: 'Ota yhteyttä tukeen muuttaaksesi tunnistetietoja.',
            no_contrib: 'Arkistosi on tyhjä.',
            edit: 'Hallinnoi',
            member: 'Kulttuuriperinnön jäsen',
            contributor: 'Aktiivinen avustaja',
            education: 'Opetusvarat',
            blog: 'Kulttuuritarinat'
        }
    }[lang];

    const [stats, setStats] = useState({
        totalSubmissions: 0,
        approvedSubmissions: 0,
        totalViews: 0
    });

    const logoUrl = "https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/images/Favicon.png";

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('saunas')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                const subData = data as Sauna[];
                setMySaunas(subData);
                setStats({
                    totalSubmissions: subData.length,
                    approvedSubmissions: subData.filter(s => s.status === 'approved').length,
                    totalViews: subData.reduce((acc, curr) => acc + (curr.views || 0), 0)
                });
            }

            const { data: matData } = await supabase
                .from('learning_materials')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (matData) setMaterials(matData);

            const { data: postData } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('author_id', user.id)
                .order('created_at', { ascending: false });

            if (postData) setMyPosts(postData);

        } catch (err) {
            console.error('Fetch User Data Error:', err);
        }
        setLoading(false);
    };

    const deleteSauna = async (saunaId: string) => {
        if (!confirm('Are you sure you want to permanently delete this contribution?')) return;
        try {
            const { error } = await supabase.from('saunas').delete().eq('id', saunaId);
            if (error) throw error;
            if (onUpdate) onUpdate();
            fetchUserData();
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const saveSaunaEdit = async (sauna: Sauna) => {
        const { id, ...updateData } = sauna;
        const { error } = await supabase
            .from('saunas')
            .update({
                ...updateData,
                status: 'pending_approval',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            alert(error.message);
        } else {
            setEditingSauna(null);
            if (onUpdate) onUpdate();
            fetchUserData();
        }
    };

    const updatePreferences = async (updates: { theme?: 'light' | 'dark', language?: 'sv' | 'fi' | 'en' }) => {
        try {
            const currentPrefs = profile?.metadata?.preferences || {};
            const nextPrefs = { ...currentPrefs, ...updates };

            const { error } = await supabase
                .from('profiles')
                .update({
                    metadata: {
                        ...profile?.metadata,
                        preferences: nextPrefs
                    }
                })
                .eq('id', user.id);

            if (error) throw error;

            if (updates.theme) setTheme(updates.theme);
            if (updates.language) setLang(updates.language);
            if (onUpdate) onUpdate();
        } catch (err: any) {
            console.error('Update Preferences Error:', err);
            alert('Failed to save preferences: ' + err.message);
        }
    };

    const sidebarVariants = {
        open: { x: 0 },
        closed: { x: "-100%" }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[20000] flex bg-white font-display"
        >
            {/* Sidebar toggle for mobile */}
            <button
                onClick={() => setSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed top-6 left-6 z-[20002] size-12 bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center rounded-2xl border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white"
            >
                {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            {/* Sidebar */}
            <motion.aside
                variants={sidebarVariants}
                animate={isSidebarOpen || window.innerWidth >= 1024 ? "open" : "closed"}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed lg:relative inset-y-0 left-0 w-80 bg-slate-50 border-r border-slate-200/60 p-10 flex flex-col z-[20001] lg:z-auto"
            >
                <div className="flex items-center gap-4 mb-20">
                    <div className="relative group cursor-pointer" onClick={() => window.location.href = '/'}>
                        <img src={logoUrl} className="size-12 object-contain rounded-2xl shadow-2xl group-hover:rotate-12 transition-transform" alt="Logo" />
                        <div className="absolute -inset-2 bg-primary/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">Dashboard</h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">{t.member}</span>
                    </div>
                </div>

                <nav className="flex-1 space-y-3">
                    <UserNavItem
                        icon={<LayoutDashboard className="size-5" />}
                        label={t.overview}
                        active={activeTab === 'overview'}
                        onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon={<Inbox className="size-5" />}
                        label={t.submissions}
                        active={activeTab === 'submissions'}
                        badge={mySaunas.length}
                        onClick={() => { setActiveTab('submissions'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon={<GraduationCap className="size-5" />}
                        label={t.education}
                        active={activeTab === 'education'}
                        badge={materials.length}
                        onClick={() => { setActiveTab('education'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon={<BookOpen className="size-5" />}
                        label={t.blog}
                        active={activeTab === 'blog'}
                        badge={myPosts.length}
                        onClick={() => { setActiveTab('blog'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon={<Settings className="size-5" />}
                        label={t.settings}
                        active={activeTab === 'settings'}
                        onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                    />
                </nav>

                <div className="pt-10 space-y-4">
                    <button
                        onClick={onAddSauna}
                        className="w-full group flex items-center justify-center gap-3 px-6 py-5 rounded-[1.5rem] bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 shadow-2xl shadow-slate-900/10 transition-all overflow-hidden relative"
                    >
                        <PlusCircle className="size-5 group-hover:rotate-90 transition-transform duration-500" />
                        <span className="relative z-10">{t.submit}</span>
                        <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity" />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-[1.5rem] bg-white text-slate-500 font-bold text-sm hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200/50"
                    >
                        <ArrowLeft className="size-4" />
                        {t.back}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col bg-white">
                <header className="h-28 border-b border-slate-100 hidden lg:flex items-center justify-between px-12">
                    <motion.h1
                        key={activeTab}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-2xl font-black text-slate-900 uppercase tracking-tight"
                    >
                        {t[activeTab]}
                    </motion.h1>

                    <div className="flex items-center gap-4 py-2 px-4 rounded-full hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="text-right">
                            <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{profile?.full_name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profile?.role}</p>
                        </div>
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black border border-primary/20 group-hover:scale-110 transition-transform">
                            {profile?.full_name?.[0] || 'U'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 lg:p-12 custom-scrollbar relative">
                    {/* Decorative Blobs - removed blur */}
                    <div className="absolute top-[-100px] right-[-100px] size-64 bg-primary/5 opacity-[0.05] rounded-full" />
                    <div className="absolute bottom-[-100px] left-[-100px] size-64 bg-sky-400/5 opacity-[0.05] rounded-full" />

                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full flex flex-col items-center justify-center text-slate-300 gap-6"
                            >
                                <div className="size-12 border-[3px] border-slate-100 border-t-primary rounded-full animate-spin" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Syncing Archive...</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="max-w-6xl mx-auto pb-20"
                            >
                                {activeTab === 'overview' && (
                                    <UserOverview stats={stats} profile={profile} t={t} />
                                )}
                                {activeTab === 'submissions' && (
                                    <UserSubmissionsList saunas={mySaunas} lang={lang} t={t} onEdit={setEditingSauna} deleteSauna={deleteSauna} />
                                )}
                                {activeTab === 'education' && (
                                    <EducationManager materials={materials} t={t} onRefresh={fetchUserData} profile={profile} />
                                )}
                                {activeTab === 'blog' && (
                                    <BlogManager posts={myPosts} t={t} onRefresh={fetchUserData} profile={profile} user={user} lang={lang} />
                                )}
                                {activeTab === 'settings' && (
                                    <UserSettingsView
                                        profile={profile}
                                        t={t}
                                        user={user}
                                        theme={theme}
                                        lang={lang}
                                        updatePreferences={updatePreferences}
                                    />
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <AnimatePresence>
                {editingSauna && (
                    <EditArchiveModal
                        sauna={editingSauna}
                        lang={lang}
                        onClose={() => setEditingSauna(null)}
                        onSave={saveSaunaEdit}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const UserNavItem = ({ icon, label, active, onClick, badge }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "w-full group flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-300 active:scale-95",
            active
                ? "bg-white text-slate-950 shadow-2xl shadow-slate-200/50 border border-slate-200/40"
                : "text-slate-400 hover:text-slate-900 hover:bg-white/50"
        )}
    >
        <div className="flex items-center gap-4">
            <span className={cn(
                "transition-colors duration-300",
                active ? "text-primary" : "text-slate-400 group-hover:text-slate-900"
            )}>{icon}</span>
            <span className="text-sm font-black tracking-tight uppercase group-hover:translate-x-1 transition-transform">{label}</span>
        </div>
        {badge !== undefined && (
            <span className={cn(
                "text-[10px] font-black px-2.5 py-1 rounded-full border transition-all",
                active ? "bg-primary/10 border-primary/20 text-primary" : "bg-white border-slate-100 text-slate-400"
            )}>{badge}</span>
        )}
    </button>
);

const UserOverview = ({ stats, profile, t }: any) => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="relative p-12 lg:p-16 rounded-[4rem] bg-slate-900 text-white overflow-hidden shadow-3xl">
            <div className="absolute top-0 right-0 p-20 opacity-[0.15] rotate-12 pointer-events-none">
                <ShieldCheck className="size-64" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                <div className="size-32 rounded-[2.5rem] bg-primary/20 border border-white/10 flex items-center justify-center">
                    <CheckCircle2 className="size-16 text-primary" />
                </div>
                <div>
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                        <CheckCircle2 className="size-3" />
                        {profile?.status === 'approved' ? t.verified : t.pending}
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-4 leading-tight">
                        {profile?.status === 'approved'
                            ? "Welcome to the verified inner circle."
                            : "Your journey to the archive begins."}
                    </h2>
                    <p className="max-w-2xl text-lg text-white/50 font-medium leading-relaxed">
                        {profile?.status === 'approved'
                            ? "As a verified member, you have full access to heritage management and live analytics."
                            : "Our archival team is reviewing your profile to ensure data quality and heritage accuracy."}
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <UserStatCard
                icon={<Inbox className="size-6" />}
                label={t.submitted}
                value={stats.totalSubmissions}
                color="text-blue-600"
                bg="bg-blue-50"
            />
            <UserStatCard
                icon={<CheckCircle2 className="size-6" />}
                label={t.approved}
                value={stats.approvedSubmissions}
                color="text-emerald-600"
                bg="bg-emerald-50"
            />
            <UserStatCard
                icon={<Eye className="size-6" />}
                label={t.views}
                value={stats.totalViews}
                color="text-amber-600"
                bg="bg-amber-50"
            />
        </div>
    </div>
);

const UserStatCard = ({ icon, label, value, color, bg }: any) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex flex-col items-start"
    >
        <div className={cn("size-14 rounded-2xl flex items-center justify-center mb-8 border border-white transition-transform group-hover:scale-110", bg, color)}>
            {icon}
        </div>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{label}</p>
        <p className="text-5xl font-black text-slate-900 tracking-tighter">{value}</p>
    </motion.div>
);

const UserSubmissionsList = ({ saunas, lang, t, onEdit, deleteSauna }: any) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-slate-900 uppercase">My Heritage Contributions</h3>
            <div className="flex gap-2">
                <button className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                    <Filter className="size-4" />
                </button>
                <button className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                    <Search className="size-4" />
                </button>
            </div>
        </div>

        {saunas.length === 0 ? (
            <div className="py-24 text-center rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                    <Inbox className="size-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.no_contrib}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {saunas.map((s: Sauna, index: number) => {
                    const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
                    const images = Array.isArray(m.images) ? m.images : [];
                    const displayImg = m.featured_image || images[0] || '';
                    const resolveUrl = (url: string) => url?.startsWith('http') ? url : `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/${url?.startsWith('/') ? url.slice(1) : url}`;
                    const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

                    return (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={s.id}
                            className="bg-white p-6 lg:p-8 rounded-[3rem] border border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8 group hover:shadow-2xl hover:shadow-slate-200/50 transition-all"
                        >
                            <div className="flex items-center gap-8 flex-1 min-w-0">
                                <div className="size-24 lg:size-28 rounded-3xl overflow-hidden bg-slate-100 border border-slate-100 shadow-xl group-hover:scale-105 transition-transform duration-500">
                                    <img
                                        src={resolveUrl(displayImg)}
                                        className="w-full h-full object-cover"
                                        onError={(e: any) => e.target.src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=?'}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-4 mb-3">
                                        <h4 className="font-black text-xl text-slate-900 uppercase truncate tracking-tight">{content.name}</h4>
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                            s.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/10 animate-pulse"
                                        )}>
                                            {s.status === 'approved' ? <CheckCircle2 className="size-2.5" /> : <Clock className="size-2.5" />}
                                            {s.status}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span className="flex items-center gap-1.5"><Clock className="size-3" /> {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Draft'}</span>
                                        <span className="flex items-center gap-1.5 text-primary/60"><Eye className="size-3" /> {s.views || 0} Views</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => onEdit(s)}
                                    className="flex-1 sm:flex-none flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:translate-y-[-2px] active:scale-95 transition-all"
                                >
                                    <Edit3 className="size-3" />
                                    {t.edit}
                                </button>
                                <button
                                    onClick={() => deleteSauna(s.id)}
                                    className="size-12 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl border border-slate-50 transition-all active:scale-90"
                                >
                                    <Trash2 className="size-5" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        )}
    </div>
);

const UserSettingsView = ({ profile, t, user, theme, lang, updatePreferences }: any) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-slate-900/50 p-12 lg:p-16 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/30 dark:shadow-none">
            <div className="flex items-center gap-4 mb-12">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Settings className="size-5" />
                </div>
                <h3 className="text-xl font-black uppercase text-slate-900 dark:text-white tracking-tight">{t.profile_settings}</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t.name}</label>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 rounded-3xl font-bold text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 shadow-inner">
                            {profile?.full_name || 'Not set'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">{t.email}</label>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 rounded-3xl font-bold text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 shadow-inner">
                            {user?.email}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 mb-6 block">Interface Preferences</label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">Theme</span>
                                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => updatePreferences({ theme: 'light' })}
                                        className={cn(
                                            "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            theme === 'light' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        Light
                                    </button>
                                    <button
                                        onClick={() => updatePreferences({ theme: 'dark' })}
                                        className={cn(
                                            "flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                            theme === 'dark' ? "bg-slate-950 text-white shadow-xl" : "text-slate-400 hover:text-slate-300"
                                        )}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest ml-1">Language</span>
                                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    {(['en', 'sv', 'fi'] as const).map(l => (
                                        <button
                                            key={l}
                                            onClick={() => updatePreferences({ language: l })}
                                            className={cn(
                                                "flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all rounded-xl",
                                                lang === l ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-lg" : "text-slate-400 hover:text-slate-600"
                                            )}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000">
                        <ShieldCheck className="size-48" />
                    </div>
                    <div className="size-32 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center text-primary font-black text-4xl mb-8 border border-white dark:border-slate-700">
                        {profile?.full_name?.[0]}
                    </div>
                    <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">{profile?.full_name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-10">{profile?.role}</p>

                    <div className="flex flex-col gap-4 w-full px-6">
                        <div className="px-6 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center gap-2">
                            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Active Profile
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <Clock className="size-5 text-slate-300 shrink-0" />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed italic">{t.locked}</p>
        </div>
    </div>
);
