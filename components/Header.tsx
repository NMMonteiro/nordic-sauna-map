import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile, LanguageCode } from '../types';
import { supabase } from '../supabaseClient';
import { cn } from '../lib/utils';
import {
    User as UserIcon,
    Settings,
    LogOut,
    ChevronDown,
    Globe,
    ShieldCheck,
    Menu,
    X,
    LayoutDashboard,
    PlusCircle
} from 'lucide-react';

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
    const [scrolled, setScrolled] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
            lessonPlans: "Lesson Plans",
            dashboard: "Dashboard",
            settings: "Settings",
            signOut: "Sign Out",
            admin: "Admin Console"
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
            lessonPlans: "Lektionsplaner",
            dashboard: "Dashboard",
            settings: "Inställningar",
            signOut: "Logga ut",
            admin: "Adminpanel"
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
            lessonPlans: "Oppituntisuunnitelmat",
            dashboard: "Hallintapaneeli",
            settings: "Asetukset",
            signOut: "Kirjaudu ulos",
            admin: "Admin-paneeli"
        }
    };

    const t = translations[lang];

    const NavLink = ({ to, children, className = "" }: { to: string, children: ReactNode, className?: string }) => (
        <Link
            to={to}
            className={cn(
                "relative text-sm font-semibold text-slate-600 transition-all duration-300 hover:text-primary group py-2",
                location.pathname === to && "text-primary",
                className
            )}
            onClick={() => setIsMenuOpen(false)}
        >
            {children}
            <span className={cn(
                "absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full",
                location.pathname === to && "w-full"
            )} />
        </Link>
    );

    const isHomePage = location.pathname === '/';
    const forceLightHeader = !isHomePage;
    const isHeaderActive = scrolled || isMenuOpen || forceLightHeader;

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-[10000] transition-all duration-500",
                isHeaderActive
                    ? "bg-white dark:bg-slate-950 border-b border-slate-200/50 dark:border-slate-800/50 py-3 shadow-sm"
                    : "bg-transparent py-6"
            )}
        >
            <div className="max-w-[1440px] mx-auto grid grid-cols-2 lg:grid-cols-3 items-center px-6 md:px-12">
                {/* Left: Logo */}
                <div className="flex justify-start items-center gap-10">
                    <Link
                        className="flex items-center gap-3 group"
                        to="/"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        <div className="relative">
                            <img src="/logo.png" className="size-9 object-contain transition-transform duration-500 group-hover:rotate-[360deg]" alt="Logo" />
                        </div>
                        <h2 className={cn(
                            "text-lg md:text-xl font-black tracking-tight uppercase transition-colors duration-500 flex flex-col sm:flex-row sm:items-center h-9 sm:h-auto justify-between sm:justify-start sm:gap-1 leading-none sm:leading-tight",
                            isHeaderActive ? "text-slate-900 dark:text-white" : "text-white"
                        )}>
                            <span>Nordic</span>
                            <span className="text-primary italic">Sauna</span>
                        </h2>
                    </Link>
                </div>

                {/* Center: Nav (Desktop only) */}
                <nav className="hidden lg:flex items-center justify-center gap-8">
                    {/* Discovery Dropdown */}
                    <div className="relative group py-2">
                        <button className={cn(
                            "flex items-center gap-1 text-sm font-semibold transition-all duration-300 group-hover:text-primary",
                            isHeaderActive ? "text-slate-600 dark:text-slate-300" : "text-white/80"
                        )}>
                            Discovery <ChevronDown className="size-4 group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-2xl p-2 min-w-[220px] overflow-hidden">
                                <Link to="/news" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium text-slate-700 dark:text-slate-200">
                                    <div className="size-8 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                        <Globe className="size-4" />
                                    </div>
                                    {t.news}
                                </Link>
                                <Link to="/blog" className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium text-slate-700 dark:text-slate-200">
                                    <div className="size-8 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center">
                                        <LayoutDashboard className="size-4" />
                                    </div>
                                    {t.blog}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <NavLink to="/education" className={isHeaderActive ? "" : "text-white/80"}>{t.lessonPlans}</NavLink>

                    {/* About Dropdown */}
                    <div className="relative group py-2">
                        <button className={cn(
                            "flex items-center gap-1 text-sm font-semibold transition-all duration-300 group-hover:text-primary",
                            isHeaderActive ? "text-slate-600 dark:text-slate-300" : "text-white/80"
                        )}>
                            {t.about} <ChevronDown className="size-4 group-hover:rotate-180 transition-transform duration-300" />
                        </button>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 ease-out">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-2xl p-2 min-w-[220px] overflow-hidden">
                                <Link to="/about" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 block">{t.ourProject}</Link>
                                <Link to="/partners" className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm font-medium text-slate-700 dark:text-slate-200 block">{t.partners}</Link>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center justify-end gap-4">
                    {/* Language Switcher (Desktop only) */}
                    <div className="hidden lg:flex items-center bg-slate-100/50 dark:bg-slate-800/50 rounded-full border border-slate-200/20 dark:border-slate-700/50 p-1">
                        {['sv', 'fi', 'en'].map(l => (
                            <button
                                key={l}
                                onClick={() => setLang(l as any)}
                                className={cn(
                                    "px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider transition-all",
                                    lang === l
                                        ? "bg-white text-primary shadow-sm"
                                        : isHeaderActive ? "text-slate-500 hover:text-slate-900" : "text-white/60 hover:text-white"
                                )}
                            >
                                {l}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <div className="relative">
                                <button
                                    onMouseEnter={() => setUserDropdownOpen(true)}
                                    onClick={() => setShowUserPanel(true)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300 group",
                                        isHeaderActive
                                            ? "bg-slate-50 border-slate-200 hover:border-primary/30"
                                            : "bg-white/10 border-white/20 hover:bg-white/20"
                                    )}
                                >
                                    <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
                                        {(profile as any)?.avatar_url ? (
                                            <img src={(profile as any).avatar_url} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <UserIcon className="size-4" />
                                        )}
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className={cn(
                                            "text-[10px] font-bold uppercase tracking-widest leading-none mb-0.5",
                                            isHeaderActive ? "text-slate-400" : "text-white/50"
                                        )}>Member</p>
                                        <p className={cn(
                                            "text-[11px] font-bold truncate max-w-[100px]",
                                            isHeaderActive ? "text-slate-900" : "text-white"
                                        )}>{profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}</p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "size-3 transition-transform duration-300 group-hover:rotate-180",
                                        isHeaderActive ? "text-slate-400" : "text-white/50"
                                    )} />
                                </button>

                                {/* User Quick Action Dropdown */}
                                <AnimatePresence>
                                    {userDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            onMouseLeave={() => setUserDropdownOpen(false)}
                                            className="absolute top-full right-0 pt-3 w-[260px] pointer-events-auto"
                                        >
                                            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-2xl rounded-2xl p-3 overflow-hidden">
                                                <div className="px-3 py-2 mb-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{profile?.full_name || user.email}</p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 tracking-tight">{user.email}</p>
                                                </div>

                                                <button
                                                    onClick={() => { setShowUserPanel(true); setUserDropdownOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5 dark:hover:bg-primary/10 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all group"
                                                >
                                                    <LayoutDashboard className="size-4 text-slate-400 group-hover:text-primary transition-colors" />
                                                    {t.dashboard}
                                                </button>

                                                {profile?.role === 'admin' && (
                                                    <button
                                                        onClick={() => { setShowAdminPanel(true); setUserDropdownOpen(false); }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-950 dark:hover:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:text-white rounded-xl text-sm font-semibold transition-all group"
                                                    >
                                                        <ShieldCheck className="size-4 text-slate-400 group-hover:text-white transition-colors" />
                                                        {t.admin}
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => { setShowUserPanel(true); setUserDropdownOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all group"
                                                >
                                                    <Settings className="size-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                                                    {t.settings}
                                                </button>

                                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                                    <button
                                                        onClick={() => supabase.auth.signOut()}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 rounded-xl text-sm font-bold transition-all group"
                                                    >
                                                        <LogOut className="size-4" />
                                                        {t.signOut}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className={cn(
                                    "relative overflow-hidden px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-300 group shadow-lg active:scale-95",
                                    isHeaderActive
                                        ? "bg-primary text-white shadow-primary/20"
                                        : "bg-white text-slate-900 shadow-white/10"
                                )}
                            >
                                <span className="relative z-10">{t.signIn}</span>
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </button>
                        )}

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={cn(
                                "lg:hidden size-11 flex items-center justify-center rounded-full transition-all duration-300",
                                isHeaderActive ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white"
                            )}
                        >
                            {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white dark:bg-slate-950 w-full border-t border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="flex flex-col p-8 space-y-8 max-h-[80vh] overflow-y-auto">
                            <nav className="flex flex-col space-y-4">
                                <NavLink to="/" className="text-3xl font-black uppercase text-slate-900 dark:text-white">{t.saunas}</NavLink>
                                <NavLink to="/education" className="text-3xl font-black uppercase text-slate-900 dark:text-white">{t.education}</NavLink>
                                <NavLink to="/news" className="text-3xl font-black uppercase text-slate-900 dark:text-white">{t.news}</NavLink>
                                <NavLink to="/blog" className="text-3xl font-black uppercase text-slate-900 dark:text-white">{t.blog}</NavLink>
                                <NavLink to="/about" className="text-3xl font-black uppercase text-slate-900 dark:text-white">{t.about}</NavLink>
                            </nav>

                            <div className="h-px bg-slate-100" />

                            <div className="pt-4 space-y-4">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">Select Language</label>
                                    <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5 flex-wrap">
                                        {['sv', 'fi', 'en'].map(l => (
                                            <button
                                                key={l}
                                                onClick={() => setLang(l as any)}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl text-xs font-bold uppercase transition-all",
                                                    lang === l
                                                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                                                )}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-slate-100 dark:bg-slate-800" />

                                {!user ? (
                                    <button
                                        onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform"
                                    >
                                        {t.signIn}
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => { setShowUserPanel(true); setIsMenuOpen(false); }}
                                            className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl"
                                        >
                                            <LayoutDashboard className="size-6 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{t.dashboard}</span>
                                        </button>
                                        <button
                                            onClick={() => supabase.auth.signOut()}
                                            className="flex flex-col items-center gap-2 p-4 bg-red-50 rounded-2xl"
                                        >
                                            <LogOut className="size-6 text-red-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">{t.signOut}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
