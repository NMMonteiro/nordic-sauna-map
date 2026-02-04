import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Sauna } from '../types';
import { User } from '@supabase/supabase-js';
import { EditArchiveModal } from './EditArchiveModal';
import { EducationManager } from './EducationManager';
import { BlogManager } from './BlogManager';

interface UserPanelProps {
    onClose: () => void;
    lang: 'sv' | 'fi' | 'en';
    user: User;
    profile: Profile | null;
    onAddSauna: () => void;
    onUpdate?: () => void;
}

type UserTab = 'overview' | 'submissions' | 'education' | 'blog' | 'settings';

export const UserPanel: React.FC<UserPanelProps> = ({ onClose, lang, user, profile, onAddSauna, onUpdate }) => {
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
            submissions: 'My Submissions',
            settings: 'Settings',
            submit: 'Submit New Archive',
            back: 'Back to Map',
            acc_status: 'Account Status',
            verified: 'Your account is verified. You can contribute to the global archive and see your live analytics.',
            pending: 'Your account is under review by our archival team. Some features may be restricted until approval.',
            submitted: 'Submitted',
            approved: 'Approved',
            views: 'Archive Views',
            profile_settings: 'Profile Settings',
            name: 'Full Name',
            email: 'Email Address',
            locked: 'Profile editing is temporarily locked. Contact an administrator to update your details.',
            no_contrib: 'No contributions yet',
            edit: 'Edit',
            member: 'Member',
            contributor: 'Contributor',
            education: 'My Educational Resources',
            blog: 'My Stories'
        },
        sv: {
            overview: 'Översikt',
            submissions: 'Mina bidrag',
            settings: 'Inställningar',
            submit: 'Skicka nytt arkiv',
            back: 'Tillbaka till kartan',
            acc_status: 'Kontostatus',
            verified: 'Ditt konto är verifierat. Du kan bidra till det globala arkivet och se din statistik live.',
            pending: 'Ditt konto granskas av vårt team. Vissa funktioner kan vara begränsade fram till godkännande.',
            submitted: 'Inskickade',
            approved: 'Godkända',
            views: 'Visningar',
            profile_settings: 'Profilinställningar',
            name: 'Fullständigt namn',
            email: 'E-postadress',
            locked: 'Profilredigering är tillfälligt låst. Kontakta en administratör för att uppdatera dina uppgifter.',
            no_contrib: 'Inga bidrag ännu',
            edit: 'Redigera',
            member: 'Medlem',
            contributor: 'Bidragsgivare',
            education: 'Mina pedagogiska resurser',
            blog: 'Mina berättelser'
        },
        fi: {
            overview: 'Yleiskatsaus',
            submissions: 'Omat lähetykset',
            settings: 'Asetukset',
            submit: 'Lähetä uusi arkisto',
            back: 'Takaisin kartalle',
            acc_status: 'Tilin tila',
            verified: 'Tilisi on vahvistettu. Voit osallistua maailmanlaajuiseen arkistoon ja seurata tilastojasi livenä.',
            pending: 'Arkistointitiimimme tarkastaa tiliäsi. Jotkut toiminnot voivat olla rajoitettuja hyväksymiseen asti.',
            submitted: 'Lähetetty',
            approved: 'Hyväksytty',
            views: 'Katselukerrat',
            profile_settings: 'Profiilin asetukset',
            name: 'Koko nimi',
            email: 'Sähköpostiosoite',
            locked: 'Profiilin muokkaus on tilapäisesti lukittu. Ota yhteyttä ylläpitäjään tietojen päivittämiseksi.',
            no_contrib: 'Ei vielä lähetyksiä',
            edit: 'Muokkaa',
            member: 'Jäsen',
            contributor: 'Avustaja',
            education: 'Omat opetusmateriaalit',
            blog: 'Omat tarinat'
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

            // Fetch user's educational materials
            const { data: matData } = await supabase
                .from('learning_materials')
                .select('*')
                .eq('created_by', user.id)
                .order('created_at', { ascending: false });

            if (matData) setMaterials(matData);

            // Fetch user's blog posts
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
        if (!confirm('Are you sure you want to permanently delete this contribution? This action cannot be undone.')) return;

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

    return (
        <div className="fixed inset-0 z-[20000] flex bg-slate-50 animate-in fade-in duration-300 font-display">
            {/* Mobile Header */}
            <div className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-[1210]">
                <div className="flex items-center gap-3">
                    <img src={logoUrl} className="size-8 object-contain" alt="Logo" />
                    <span className="text-slate-900 font-black uppercase text-xs tracking-tighter">{t.member}</span>
                </div>
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-slate-900">
                    <span className="material-symbols-outlined">{isSidebarOpen ? 'close' : 'menu'}</span>
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-80 bg-white border-r border-slate-200 flex flex-col p-8 shadow-sm transition-transform duration-300 z-[1205] lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="hidden lg:flex items-center gap-4 mb-20">
                    <img src={logoUrl} className="size-10 object-contain rounded-lg shadow-sm" alt="Logo" />
                    <div>
                        <h2 className="text-lg font-black tracking-tighter uppercase leading-none text-slate-900">{t.member}</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{t.contributor}</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2 lg:mt-0 mt-8">
                    <UserNavItem
                        icon="dashboard"
                        label={t.overview}
                        active={activeTab === 'overview'}
                        onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon="inventory_2"
                        label={t.submissions}
                        active={activeTab === 'submissions'}
                        badge={mySaunas.length}
                        onClick={() => { setActiveTab('submissions'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon="school"
                        label={t.education}
                        active={activeTab === 'education'}
                        badge={materials.length}
                        onClick={() => { setActiveTab('education'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon="auto_stories"
                        label={t.blog}
                        active={activeTab === 'blog'}
                        badge={myPosts.length}
                        onClick={() => { setActiveTab('blog'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon="settings"
                        label={t.settings}
                        active={activeTab === 'settings'}
                        onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                    />
                </nav>

                <div className="pt-8 mt-8 border-t border-slate-100 flex flex-col gap-4">
                    <button
                        onClick={onAddSauna}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:scale-105 shadow-xl shadow-slate-900/10 transition-all"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        {t.submit}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 text-slate-400 font-bold text-sm hover:bg-slate-100 hover:text-slate-900 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">logout</span>
                        {t.back}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden lg:pt-0 pt-16">
                <header className="h-24 bg-white border-b border-slate-200 hidden lg:flex items-center justify-between px-10">
                    <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t[activeTab]}</h1>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">{profile?.full_name}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{profile?.role}</p>
                        </div>
                        <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                            {profile?.full_name?.[0] || 'U'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scrollbar">
                    {loading ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-4">
                            <div className="size-10 border-2 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="max-w-5xl mx-auto space-y-6 lg:space-y-10">
                            {activeTab === 'overview' && (
                                <UserOverview stats={stats} profile={profile} t={t} />
                            )}
                            {activeTab === 'submissions' && (
                                <UserSubmissionsList saunas={mySaunas} lang={lang} t={t} onEdit={setEditingSauna} onDelete={deleteSauna} />
                            )}
                            {activeTab === 'education' && (
                                <EducationManager materials={materials} t={t} onRefresh={fetchUserData} profile={profile} />
                            )}
                            {activeTab === 'blog' && (
                                <BlogManager posts={myPosts} t={t} onRefresh={fetchUserData} profile={profile} user={user} lang={lang} />
                            )}
                            {activeTab === 'settings' && (
                                <UserSettingsView profile={profile} t={t} />
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

const UserNavItem = ({ icon, label, active, onClick, badge }: any) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all ${active ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
    >
        <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-xl">{icon}</span>
            <span className="text-sm font-bold">{label}</span>
        </div>
        {badge !== undefined && (
            <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span>
        )}
    </button>
);

const UserOverview = ({ stats, profile, t }: any) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
        <div className="bg-white p-8 lg:p-12 rounded-[2rem] lg:rounded-[3rem] border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <span className="material-symbols-outlined text-[12rem]">verified_user</span>
            </div>
            <div className="relative z-10">
                <h3 className="text-xs lg:text-sm font-black uppercase text-slate-400 tracking-widest mb-4">{t.acc_status}</h3>
                <div className="flex items-start gap-4 mb-4">
                    <span className={`material-symbols-outlined ${profile?.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'} text-3xl`}>
                        {profile?.status === 'approved' ? 'verified' : 'pending_actions'}
                    </span>
                    <p className="max-w-xl text-slate-600 font-medium leading-relaxed">
                        {profile?.status === 'approved' ? t.verified : t.pending}
                    </p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            <UserStatCard icon="file_upload" label={t.submitted} value={stats.totalSubmissions} color="bg-blue-500" />
            <UserStatCard icon="verified" label={t.approved} value={stats.approvedSubmissions} color="bg-emerald-500" />
            <UserStatCard icon="visibility" label={t.views} value={stats.totalViews} color="bg-slate-800" />
        </div>
    </div>
);

const UserStatCard = ({ icon, label, value, color }: any) => (
    <div className="bg-white p-6 lg:p-10 rounded-[2rem] lg:rounded-[3rem] border border-slate-200 shadow-sm">
        <div className={`size-10 lg:size-12 ${color} rounded-2xl flex items-center justify-center text-white mb-6`}>
            <span className="material-symbols-outlined text-xl lg:text-2xl">{icon}</span>
        </div>
        <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-1 lg:mb-2">{label}</p>
            <p className="text-2xl lg:text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
        </div>
    </div>
);

const UserSubmissionsList = ({ saunas, lang, t, onEdit, onDelete }: any) => (
    <div className="grid grid-cols-1 gap-4">
        {saunas.length === 0 ? (
            <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest">{t.no_contrib}</div>
        ) : saunas.map((s: Sauna) => {
            const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
            const images = Array.isArray(m.images) ? m.images : [];
            const displayImg = m.featured_image || images[0] || '';
            const resolveUrl = (url: string) => url?.startsWith('http') ? url : `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/${url?.startsWith('/') ? url.slice(1) : url}`;
            const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

            return (
                <div key={s.id} className="bg-white p-4 lg:p-6 rounded-[2rem] border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all">
                    <div className="flex items-center gap-6 w-full">
                        <div className="size-20 lg:size-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0">
                            <img src={resolveUrl(displayImg)} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=?'} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h4 className="font-black text-sm lg:text-base text-slate-900 uppercase truncate">{content.name}</h4>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${s.status === 'approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                    {s.status}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.created_at ? new Date(s.created_at).toLocaleDateString() : 'Pending'}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => onEdit(s)}
                            className="flex-1 sm:flex-none px-6 py-3 bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all"
                        >
                            {t.edit}
                        </button>
                        <button
                            onClick={() => onDelete(s.id)}
                            className="flex-shrink-0 size-11 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                    </div>
                </div>
            );
        })}
    </div>
);

const UserSettingsView = ({ profile, t }: any) => (
    <div className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] border border-slate-200 shadow-sm">
        <h3 className="text-xs lg:text-sm font-black uppercase text-slate-400 tracking-widest mb-10">{t.profile_settings}</h3>
        <div className="space-y-6 max-w-md">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t.name}</label>
                <div className="bg-slate-50 px-6 py-4 rounded-2xl font-bold text-slate-900 border border-slate-100">
                    {profile?.full_name || 'Not set'}
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{t.email}</label>
                <div className="bg-slate-50 px-6 py-4 rounded-2xl font-bold text-slate-500 border border-slate-100">
                    {profile?.email}
                </div>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-4">{t.locked}</p>
        </div>
    </div>
);
