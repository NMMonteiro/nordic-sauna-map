import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Sauna } from '../types';
import { User } from '@supabase/supabase-js';
import { EditArchiveModal } from './EditArchiveModal';

interface UserPanelProps {
    onClose: () => void;
    lang: 'sv' | 'fi' | 'en';
    user: User;
    profile: Profile | null;
    onAddSauna: () => void;
    onUpdate?: () => void;
}

type UserTab = 'overview' | 'submissions' | 'settings';

export const UserPanel: React.FC<UserPanelProps> = ({ onClose, lang, user, profile, onAddSauna, onUpdate }) => {
    const [activeTab, setActiveTab] = useState<UserTab>('overview');
    const [mySaunas, setMySaunas] = useState<Sauna[]>([]);
    const [editingSauna, setEditingSauna] = useState<Sauna | null>(null);
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
            contributor: 'Contributor'
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
            contributor: 'Bidragsgivare'
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
            contributor: 'Avustaja'
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
                        icon="home"
                        label={t.overview}
                        active={activeTab === 'overview'}
                        onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon="history"
                        label={t.submissions}
                        active={activeTab === 'submissions'}
                        badge={mySaunas.length}
                        onClick={() => { setActiveTab('submissions'); setSidebarOpen(false); }}
                    />
                    <UserNavItem
                        icon="settings"
                        label={t.settings}
                        active={activeTab === 'settings'}
                        onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
                    />
                </nav>

                <div className="pt-8 mt-8 border-t border-slate-100">
                    <button
                        onClick={onClose}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl bg-slate-50 text-slate-400 font-bold text-sm hover:bg-slate-100 hover:text-slate-900 transition-all"
                    >
                        <span className="material-symbols-outlined text-xl">map</span>
                        {t.back}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden lg:pt-0 pt-16">
                <header className="h-24 bg-white border-b border-slate-200 hidden lg:flex items-center justify-between px-10">
                    <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                        {t[activeTab]}
                    </h1>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => { onClose(); onAddSauna(); }}
                            className="bg-primary text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                            {t.submit}
                        </button>
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
    <div className="space-y-6 lg:space-y-10">
        <div className="bg-white p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between overflow-hidden relative shadow-sm gap-6">
            <div className="relative z-10">
                <h2 className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] mb-4">{t.acc_status}</h2>
                <div className="flex items-center gap-4">
                    <div className={`text-3xl lg:text-4xl font-black uppercase tracking-tighter ${profile?.status === 'approved' ? 'text-green-600' : 'text-amber-500'}`}>
                        {profile?.status || 'Pending'}
                    </div>
                    {profile?.status === 'approved' && (
                        <span className="material-symbols-outlined text-green-600 text-3xl lg:text-4xl">verified</span>
                    )}
                </div>
                <p className="text-sm text-slate-500 mt-4 max-w-md">
                    {profile?.status === 'approved' ? t.verified : t.pending}
                </p>
            </div>
            <div className={`size-24 lg:size-32 rounded-full border-8 border-slate-50 flex items-center justify-center ${profile?.status === 'approved' ? 'bg-green-50' : 'bg-amber-50'}`}>
                <span className={`material-symbols-outlined text-4xl lg:text-5xl ${profile?.status === 'approved' ? 'text-green-500' : 'text-amber-400'}`}>
                    {profile?.status === 'approved' ? 'how_to_reg' : 'history'}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            <UserStatCard icon="inventory_2" label={t.submitted} value={stats.totalSubmissions} />
            <UserStatCard icon="task_alt" label={t.approved} value={stats.approvedSubmissions} />
            <UserStatCard icon="visibility" label={t.views} value={stats.totalViews} />
        </div>
    </div>
);

const UserStatCard = ({ icon, label, value }: any) => (
    <div className="bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <span className="material-symbols-outlined text-slate-400 mb-4 lg:mb-6">{icon}</span>
        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">{label}</p>
        <p className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
    </div>
);

const UserSubmissionsList = ({ saunas, lang, t, onEdit, onDelete }: any) => (
    <div className="space-y-4">
        {saunas.length > 0 ? saunas.map((s: Sauna) => {
            const m = (typeof s.media === 'string' ? JSON.parse(s.media) : s.media) || {};
            const images = Array.isArray(m.images) ? m.images : [];
            const displayImg = m.featured_image || images[0] || '';
            const resolveUrl = (url: string) => url?.startsWith('http') ? url : `https://hgpcpontdxjsbqsjiech.supabase.co/storage/v1/object/public/sauna-media/${url?.startsWith('/') ? url.slice(1) : url}`;
            const content = (typeof s.content === 'string' ? JSON.parse(s.content) : s.content)?.[lang] || { name: 'Archive Entry' };

            return (
                <div key={s.id} className="bg-white p-4 lg:p-6 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between group hover:border-primary/20 transition-all gap-4">
                    <div className="flex items-center gap-4 lg:gap-6">
                        <div className="size-16 lg:size-20 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                            <img src={resolveUrl(displayImg)} className="w-full h-full object-cover" onError={(e: any) => e.target.src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=?'} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm lg:text-base">{content.name}</h4>
                            <div className="flex items-center gap-4 mt-1 lg:mt-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${s.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>{s.status.replace('_', ' ')}</span>
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    {s.views || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 lg:gap-6">
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Archive ID</p>
                            <p className="text-[10px] font-mono font-bold text-slate-500 uppercase">{s.sauna_id}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                            <button
                                onClick={() => onEdit(s)}
                                className="flex-1 sm:flex-none h-10 lg:h-12 px-6 bg-slate-50 text-slate-900 rounded-xl lg:rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all border border-slate-100"
                            >
                                {t.edit}
                            </button>
                            <button
                                onClick={() => onDelete(s.id)}
                                className="h-10 lg:h-12 w-10 lg:w-12 flex items-center justify-center bg-rose-50 text-rose-500 rounded-xl lg:rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
                                title="Delete Archive"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            );
        }) : (
            <div className="py-20 text-center bg-slate-50 border border-dashed border-slate-200 rounded-3xl text-slate-300">
                <p className="text-xs font-black uppercase tracking-[0.2em]">{t.no_contrib}</p>
            </div>
        )}
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
