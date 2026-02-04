import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Profile, LanguageCode } from '../types';
import { supabase } from '../supabaseClient';

interface HeaderProps {
    lang: LanguageCode;
    setLang: (lang: LanguageCode) => void;
    user: User | null;
    profile: Profile | null;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    setShowAuthModal: (show: boolean) => void;
    setShowAdminPanel: (show: boolean) => void;
    setShowUserPanel: (show: boolean) => void;
}

export const Header = ({
    lang,
    setLang,
    user,
    profile,
    isMenuOpen,
    setIsMenuOpen,
    setShowAuthModal,
    setShowAdminPanel,
    setShowUserPanel
}: HeaderProps) => {
    const location = useLocation();
    const isHome = location.pathname === '/';

    const translations = {
        en: {
            saunas: "The Sauna Map",
            education: "Education",
            about: "About",
            signIn: "Sign In",
            news: "News",
            blog: "Blog",
            ourProject: "Our Project",
            partners: "Partners",
            lessonPlans: "Lesson Plans"
        },
        sv: {
            saunas: "Bastukartan",
            education: "Utbildning",
            about: "Om oss",
            signIn: "Logga in",
            news: "Nyheter",
            blog: "Blogg",
            ourProject: "Vårt projekt",
            partners: "Partnerinformation",
            lessonPlans: "Lektionsplaner"
        },
        fi: {
            saunas: "Saunakartta",
            education: "Koulutus",
            about: "Tietoa",
            signIn: "Kirjaudu",
            news: "Uutiset",
            blog: "Blogi",
            ourProject: "Projektimme",
            partners: "Partneritiedot",
            lessonPlans: "Oppituntisuunnitelmat"
        }
    };

    const t = translations[lang];

    const NavLink = ({ to, children, className = "" }: { to: string, children: ReactNode, className?: string }) => (
        <Link
            to={to}
            className={`text-sm font-medium hover:text-primary transition-colors cursor-pointer ${className}`}
            onClick={() => setIsMenuOpen(false)}
        >
            {children}
        </Link>
    );

    return (
        <header className={`sticky top-0 z-[10000] w-full border-b transition-colors duration-300 ${isMenuOpen ? 'bg-white border-slate-200' : 'bg-white/80 backdrop-blur-md border-sky/20'}`}>
            <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-6 lg:gap-10">
                    <Link className="flex items-center gap-3" to="/" onClick={() => setIsMenuOpen(false)}>
                        <img src="/logo.png" className="size-8 object-contain" alt="Logo" />
                        <h2 className="text-lg lg:text-xl font-black tracking-tight uppercase text-primary">Nordic Sauna Map</h2>
                    </Link>
                    <nav className="hidden md:flex items-center gap-8">
                        <NavLink to="/">{t.saunas}</NavLink>

                        {/* Discovery Dropdown */}
                        <div className="relative group py-2">
                            <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                                Discovery <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                                <div className="bg-white border border-sky/10 shadow-2xl rounded-2xl p-2 min-w-[200px]">
                                    <NavLink to="/news" className="block px-4 py-3 hover:bg-sky/5 rounded-xl transition-colors">{t.news}</NavLink>
                                    <NavLink to="/blog" className="block px-4 py-3 hover:bg-sky/5 rounded-xl transition-colors">{t.blog}</NavLink>
                                </div>
                            </div>
                        </div>

                        <NavLink to="/education">{t.lessonPlans}</NavLink>

                        {/* About Dropdown */}
                        <div className="relative group py-2">
                            <button className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors">
                                {t.about} <span className="material-symbols-outlined text-sm">expand_more</span>
                            </button>
                            <div className="absolute top-full left-0 pt-2 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-200">
                                <div className="bg-white border border-sky/10 shadow-2xl rounded-2xl p-2 min-w-[200px]">
                                    <NavLink to="/about" className="block px-4 py-3 hover:bg-sky/5 rounded-xl transition-colors">{t.ourProject}</NavLink>
                                    <NavLink to="/partners" className="block px-4 py-3 hover:bg-sky/5 rounded-xl transition-colors">{t.partners}</NavLink>
                                </div>
                            </div>
                        </div>

                        <div className="h-4 w-px bg-sky/20"></div>
                        <div className="flex gap-3 text-xs font-bold tracking-widest text-slate-500">
                            {['sv', 'fi', 'en'].map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l as any)}
                                    className={`hover:text-primary transition-colors uppercase ${lang === l ? 'text-primary underline underline-offset-4 decoration-sky' : 'text-slate-400'}`}
                                >{l}</button>
                            ))}
                        </div>
                    </nav>
                </div>

                <div className="flex items-center gap-2 lg:gap-4">
                    <div className="hidden sm:flex items-center gap-4">
                        {profile?.role === 'admin' && (
                            <button
                                onClick={() => setShowAdminPanel(true)}
                                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all font-display"
                            >
                                <span className="material-symbols-outlined text-sm">settings</span>
                                Admin
                            </button>
                        )}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowUserPanel(true)}
                                    className="text-right cursor-pointer group hidden sm:block"
                                >
                                    <div className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1 group-hover:text-primary transition-colors">Authenticated</div>
                                    <div className="text-xs font-bold text-slate-800 leading-none group-hover:text-primary transition-colors">{profile?.full_name || user.email}</div>
                                </button>
                                <button
                                    onClick={() => supabase.auth.signOut()}
                                    className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">logout</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="px-6 py-2.5 bg-nordic-lake text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                            >
                                {t.signIn}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden size-10 flex items-center justify-center text-slate-600 rounded-xl hover:bg-slate-50"
                    >
                        <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 top-[73px] z-[9999] bg-white w-full h-[calc(100vh-73px)] overflow-y-auto animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col p-8 space-y-8">
                        <nav className="flex flex-col space-y-6">
                            <NavLink to="/" className="text-2xl font-black uppercase tracking-tight text-slate-900">{t.saunas}</NavLink>
                            <NavLink to="/education" className="text-2xl font-black uppercase tracking-tight text-slate-900">{t.education}</NavLink>
                            <NavLink to="/news" className="text-2xl font-black uppercase tracking-tight text-slate-900">{t.news}</NavLink>
                            <NavLink to="/blog" className="text-2xl font-black uppercase tracking-tight text-slate-900">{t.blog}</NavLink>
                            <NavLink to="/about" className="text-2xl font-black uppercase tracking-tight text-slate-900">{t.about}</NavLink>
                        </nav>

                        <div className="h-px bg-slate-100" />

                        <div className="space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Language / Språk / Kieli</p>
                            <div className="flex gap-4">
                                {['sv', 'fi', 'en'].map((l) => (
                                    <button
                                        key={l}
                                        onClick={() => { setLang(l as any); setIsMenuOpen(false); }}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${lang === l ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            {!user ? (
                                <button
                                    onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20"
                                >
                                    {t.signIn}
                                </button>
                            ) : (
                                <button
                                    onClick={() => { setShowUserPanel(true); setIsMenuOpen(false); }}
                                    className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl"
                                >
                                    <div className="text-left">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Profile</p>
                                        <p className="font-bold text-slate-900">{profile?.full_name || user.email}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};
