import React, { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    doc,
    updateDoc,
    deleteDoc,
    getDoc,
    limit,
    getCountFromServer
} from 'firebase/firestore';
import { Profile, ContentItem, LanguageCode } from '../types';
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
    lang: LanguageCode;
    user: FirebaseUser;
    profile: Profile | null;
    onUpdate?: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    setLang: (lang: LanguageCode) => void;
}


type UserTab = 'overview' | 'submissions' | 'education' | 'blog' | 'settings';

export const UserPanel: React.FC<UserPanelProps> = ({
    onClose,
    lang,
    user,
    profile,
    onUpdate,
    theme,
    setTheme,
    setLang
}) => {
    const [activeTab, setActiveTab] = useState<UserTab>('overview');
    const [myItems, setMyItems] = useState<any[]>([]);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

    const [materials, setMaterials] = useState<any[]>([]);
    const [myPosts, setMyPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const translations = {
        en: {
            overview: 'Overview',
            submissions: 'My Contributions',
            settings: 'Profile & Security',
            submit: 'Add Entry',
            back: 'Back to Site',
            acc_status: 'Account Status',
            verified: 'Verified Member',
            pending: 'Review Pending',
            submitted: 'Total Sent',
            approved: 'Live Content',
            views: 'Total Views',
            profile_settings: 'Personal Information',
            name: 'Display Name',
            email: 'Primary Email',
            locked: 'Contact support to change core identity details.',
            no_contrib: 'Your contribution list is empty.',
            edit: 'Manage',
            member: 'Project Member',
            contributor: 'Active Contributor',
            education: 'Learning Hub',
            blog: 'Workshop Blog'
        },
        sv: {
            overview: 'Översikt',
            submissions: 'Mina bidrag',
            settings: 'Inställningar',
            submit: 'Lägg till bidrag',
            back: 'Tillbaka till sidan',
            acc_status: 'Kontostatus',
            verified: 'Verifierad medlem',
            pending: 'Väntar på granskning',
            submitted: 'Inskickade',
            approved: 'Live-innehåll',
            views: 'Totala visningar',
            profile_settings: 'Profiluppgifter',
            name: 'Visa namn',
            email: 'E-postadress',
            locked: 'Kontakta support för att ändra identitetsuppgifter.',
            no_contrib: 'Inga bidrag ännu',
            edit: 'Hantera',
            member: 'Projektmedlem',
            contributor: 'Bidragsgivare',
            education: 'Lärcenter',
            blog: 'Workshop-blogg'
        },
        fi: {
            overview: 'Yleiskatsaus',
            submissions: 'Omat osallistumiset',
            settings: 'Asetukset',
            submit: 'Lisää sisältöä',
            back: 'Takaisin sivustolle',
            acc_status: 'Tilin tila',
            verified: 'Vahvistettu jäsen',
            pending: 'Odottaa tarkistusta',
            submitted: 'Lähetetty',
            approved: 'Julkaistu sisältö',
            views: 'Katselukerrat',
            profile_settings: 'Henkilökohtaiset tiedot',
            name: 'Näyttönimi',
            email: 'Ensisijainen sähköposti',
            locked: 'Ota yhteyttä tukeen muuttaaksesi tunnistetietoja.',
            no_contrib: 'Luettelosi on tyhjä.',
            edit: 'Hallinnoi',
            member: 'Projektin jäsen',
            contributor: 'Aktiivinen avustaja',
            education: 'Oppimiskeskus',
            blog: 'Työpajablogi'
        },
        ar: {
            overview: 'نظرة عامة',
            submissions: 'مساهماتي',
            settings: 'الإعدادات',
            submit: 'إضافة مدخلة',
            back: 'العودة للموقع',
            acc_status: 'حالة الحساب',
            verified: 'عضو موثوق',
            pending: 'قيد المراجعة',
            submitted: 'تم الإرسال',
            approved: 'متاح للجمهور',
            views: 'إجمالي المشاهدات',
            profile_settings: 'البيانات الشخصية',
            name: 'اسم العرض',
            email: 'البريد الإلكتروني',
            locked: 'تحرير الهوية مقيد.',
            no_contrib: 'قائمة المساهمات فارغة.',
            edit: 'إدارة',
            member: 'عضو المشروع',
            contributor: 'مساهم نشط',
            education: 'مركز التعلم',
            blog: 'مدونة ورش العمل'
        },
        uk: {
            overview: 'Огляд',
            submissions: 'Мої внески',
            settings: 'Налаштування',
            submit: 'Додати запис',
            back: 'На сайт',
            acc_status: 'Статус акаунту',
            verified: 'Перевірений учасник',
            pending: 'Очікує перевірки',
            submitted: 'Надіслано',
            approved: 'Опубліковано',
            views: 'Перегляди',
            profile_settings: 'Персональні дані',
            name: 'Ім\'я користувача',
            email: 'Електронна пошта',
            locked: 'Редагування обмежено.',
            no_contrib: 'Внесків немає.',
            edit: 'Керувати',
            member: 'Учасник проекту',
            contributor: 'Активний дописувач',
            education: 'Навчальний центр',
            blog: 'Блог воркшопів'
        }
    };
    const t = translations[lang] || translations.en;

    const [stats, setStats] = useState({
        totalSubmissions: 0,
        approvedSubmissions: 0,
        totalViews: 0
    });

    const logoUrl = "https://placehold.co/200x200/4FC3F7/0F172A?text=PORTAL";

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            // Archives (previously saunas)
            const archivesQuery = query(
                collection(db, 'archives'),
                where('created_by', '==', user.uid),
                orderBy('created_at', 'desc')
            );
            const archivesSnap = await getDocs(archivesQuery);
            const archivesData = archivesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            setMyItems(archivesData);
            setStats({
                totalSubmissions: archivesData.length,
                approvedSubmissions: archivesData.filter((s: any) => s.status === 'approved').length,
                totalViews: archivesData.reduce((acc, curr: any) => acc + (curr.views || 0), 0)
            });

            // Materials
            const materialsQuery = query(
                collection(db, 'materials'),
                where('created_by', '==', user.uid),
                orderBy('created_at', 'desc')
            );
            const materialsSnap = await getDocs(materialsQuery);
            setMaterials(materialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Blog Posts
            const postsQuery = query(
                collection(db, 'blog_posts'),
                where('author_id', '==', user.uid),
                orderBy('created_at', 'desc')
            );
            const postsSnap = await getDocs(postsQuery);
            setMyPosts(postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        } catch (err) {
            console.error('Fetch User Data Error:', err);
        }
        setLoading(false);
    };

    const deleteSauna = async (saunaId: string) => {
        if (!confirm('Are you sure you want to permanently delete this contribution?')) return;
        try {
            await deleteDoc(doc(db, 'archives', saunaId));
            if (onUpdate) onUpdate();
            fetchUserData();
        } catch (err: any) {
            alert('Delete failed: ' + err.message);
        }
    };

    const saveItemEdit = async (item: ContentItem) => {
        const { id, ...updateData } = item;
        if (!id) return;

        try {
            await updateDoc(doc(db, 'archives', id), {
                ...updateData,
                status: 'pending_approval',
                updated_at: new Date().toISOString()
            });
            setEditingItem(null);
            if (onUpdate) onUpdate();
            fetchUserData();
        } catch (err: any) {
            alert('Update failed: ' + err.message);
        }
    };

    const updatePreferences = async (updates: { theme?: 'light' | 'dark', language?: 'sv' | 'fi' | 'en' }) => {
        try {
            const currentPrefs = profile?.preferences || {};
            const nextPrefs = { ...currentPrefs, ...updates };

            await updateDoc(doc(db, 'profiles', user.uid), {
                preferences: nextPrefs
            });

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
                        <h2 className="text-xl font-semibold tracking-tight text-slate-900 uppercase">Dashboard</h2>
                        <span className="text-xs font-semibold uppercase text-slate-400 tracking-[0.2em]">{t.member}</span>
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
                        badge={myItems.length}
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
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-[1.5rem] bg-white text-slate-500 font-medium text-sm hover:text-slate-900 hover:bg-slate-100 transition-all border border-slate-200/50"
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
                        className="text-2xl font-semibold text-slate-900 uppercase tracking-tight"
                    >
                        {t[activeTab]}
                    </motion.h1>

                    <div className="flex items-center gap-4 py-2 px-4 rounded-full hover:bg-slate-50 transition-colors cursor-pointer group">
                        <div className="text-right">
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">{profile?.full_name}</p>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{profile?.role}</p>
                        </div>
                        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold border border-primary/20 group-hover:scale-110 transition-transform">
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
                                <span className="text-xs font-semibold uppercase tracking-[0.3em]">Syncing Archive...</span>
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
                                    <UserSubmissionsList items={myItems} lang={lang} t={t} onEdit={setEditingItem} deleteItem={deleteSauna} />
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
                {editingItem && (
                    <EditArchiveModal
                        item={editingItem}
                        lang={lang}
                        onClose={() => setEditingItem(null)}
                        onSave={saveItemEdit}
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
            <span className="text-sm font-semibold tracking-tight uppercase group-hover:translate-x-1 transition-transform">{label}</span>
        </div>
        {badge !== undefined && (
            <span className={cn(
                "text-xs font-semibold px-2.5 py-1 rounded-full border transition-all",
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
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-semibold uppercase tracking-wide mb-6">
                        <CheckCircle2 className="size-3" />
                        {profile?.status === 'approved' ? t.verified : t.pending}
                    </div>
                    <h2 className="text-2xl lg:text-xl font-semibold tracking-tight mb-4 leading-tight">
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
        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wide mb-2">{label}</p>
        <p className="text-xl font-semibold text-slate-900 tracking-tight">{value}</p>
    </motion.div>
);

const UserSubmissionsList = ({ items, lang, t, onEdit, deleteItem }: any) => (

    <div className="space-y-6">
        <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-semibold text-slate-900 uppercase">My Contributions</h3>

            <div className="flex gap-2">
                <button className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                    <Filter className="size-4" />
                </button>
                <button className="size-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                    <Search className="size-4" />
                </button>
            </div>
        </div>

        {items.length === 0 ? (

            <div className="py-24 text-center rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                    <Inbox className="size-10" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">{t.no_contrib}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-6">
                {items.map((s: ContentItem, index: number) => {

                    const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
                    const images = Array.isArray(m.images) ? m.images : [];
                    const displayImg = m.featured_image || images[0] || '';
                    const resolveUrl = (url: string) => url?.startsWith('http') ? url : `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/material-media/${url?.startsWith('/') ? url.slice(1) : url}`;
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
                                        <h4 className="font-semibold text-xl text-slate-900 uppercase truncate tracking-tight">{content.name}</h4>
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border",
                                            s.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100 shadow-sm shadow-amber-500/10 animate-pulse"
                                        )}>
                                            {s.status === 'approved' ? <CheckCircle2 className="size-2.5" /> : <Clock className="size-2.5" />}
                                            {s.status}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                        <span className="flex items-center gap-1.5"><Clock className="size-3" /> {s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Draft'}</span>
                                        <span className="flex items-center gap-1.5 text-primary/60"><Eye className="size-3" /> {s.views || 0} Views</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => onEdit(s)}
                                    className="flex-1 sm:flex-none flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-semibold uppercase tracking-wide shadow-xl shadow-slate-900/10 hover:translate-y-[-2px] active:scale-95 transition-all"
                                >
                                    <Edit3 className="size-3" />
                                    {t.edit}
                                </button>
                                <button
                                    onClick={() => deleteItem(s.id!)}
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
                <h3 className="text-xl font-semibold uppercase text-slate-900 dark:text-white tracking-tight">{t.profile_settings}</h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                <div className="space-y-10">
                    <div className="space-y-4">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide ml-1">{t.name}</label>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 rounded-3xl font-medium text-slate-900 dark:text-white border border-slate-100 dark:border-slate-800 shadow-inner">
                            {profile?.full_name || 'Not set'}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide ml-1">{t.email}</label>
                        <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-5 rounded-3xl font-medium text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 shadow-inner">
                            {user?.email}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                        <label className="text-xs font-semibold uppercase text-slate-400 tracking-wide ml-1 mb-6 block">Interface Preferences</label>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <span className="text-xs font-semibold uppercase text-slate-300 tracking-wide ml-1">Theme</span>
                                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <button
                                        onClick={() => updatePreferences({ theme: 'light' })}
                                        className={cn(
                                            "flex-1 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all",
                                            theme === 'light' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600"
                                        )}
                                    >
                                        Light
                                    </button>
                                    <button
                                        onClick={() => updatePreferences({ theme: 'dark' })}
                                        className={cn(
                                            "flex-1 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wide transition-all",
                                            theme === 'dark' ? "bg-slate-950 text-white shadow-xl" : "text-slate-400 hover:text-slate-300"
                                        )}
                                    >
                                        Dark
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <span className="text-xs font-semibold uppercase text-slate-300 tracking-wide ml-1">Language</span>
                                <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    {(['en', 'sv', 'fi'] as const).map(l => (
                                        <button
                                            key={l}
                                            onClick={() => updatePreferences({ language: l })}
                                            className={cn(
                                                "flex-1 py-3 text-xs font-semibold uppercase tracking-wide transition-all rounded-xl",
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
                    <div className="size-32 rounded-[2.5rem] bg-white dark:bg-slate-800 shadow-2xl flex items-center justify-center text-primary font-semibold text-2xl mb-8 border border-white dark:border-slate-700">
                        {profile?.full_name?.[0]}
                    </div>
                    <h4 className="text-xl font-semibold text-slate-900 dark:text-white uppercase tracking-tight mb-3">{profile?.full_name}</h4>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-10">{profile?.role}</p>

                    <div className="flex flex-col gap-4 w-full px-6">
                        <div className="px-6 py-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wide border border-emerald-100 dark:border-emerald-500/20 flex items-center justify-center gap-2">
                            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            Active Profile
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex items-start gap-4">
            <Clock className="size-5 text-slate-300 shrink-0" />
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed italic">{t.locked}</p>
        </div>
    </div>
);
