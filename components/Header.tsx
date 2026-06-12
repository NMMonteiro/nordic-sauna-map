import React, { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Profile, LanguageCode, BrandingPreferences } from '../types';
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
    ArrowUpRight
} from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface HeaderProps {
    lang: LanguageCode;
    setLang: (lang: LanguageCode) => void;
    user: FirebaseUser | null;
    profile: Profile | null;
    branding?: BrandingPreferences;
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
    setShowUserPanel,
    branding
}: HeaderProps) => {
    const handleLogout = async () => {
        try {
            await auth.signOut();
            window.location.reload();
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const location = useLocation();
    const [isWindowScrolled, setIsWindowScrolled] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsWindowScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Force "scrolled" look (solid bg, dark text) on all pages except home
    const scrolled = isWindowScrolled || location.pathname !== '/';

    const { t } = useTranslation();

    return (
        <header
            className={cn(
                "fixed left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[1400px] transition-all duration-700 z-[1030]",
                scrolled
                    ? "top-4 bg-bg-surface/80 backdrop-blur-2xl py-3 rounded-full border border-border-main/50 shadow-2xl"
                    : "top-6 bg-black/10 backdrop-blur-md py-5 rounded-[2rem] border border-white/5"
            )}
        >
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center relative">
                {/* Logo Section */}
                <Link
                    className="flex items-center gap-3 group relative z-50 mr-8"
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                >
                    <div className="relative">
                        {branding?.logoUrl ? (
                            <img
                                src={branding.logoUrl}
                                className="object-contain transition-all duration-300"
                                style={{ height: branding.logoSize ? `${branding.logoSize}px` : '40px', width: 'auto' }}
                                alt="Logo"
                            />
                        ) : (
                            <img src="/logo.png" className="object-contain" style={{ height: branding?.logoSize ? `${branding.logoSize}px` : '40px', width: 'auto' }} alt="Logo" />
                        )}
                    </div>
                    <div>
                        <span className={cn(
                            "font-display font-semibold tracking-tight uppercase text-xl leading-none transition-colors duration-500 block",
                            scrolled ? "text-text-main" : "text-white"
                        )}>
                            {branding?.siteName || "Suomiportaat"}
                        </span>
                        {branding?.siteTagline && (
                            <span className={cn(
                                "font-medium text-xs tracking-wide uppercase block mt-1 transition-colors duration-500",
                                scrolled ? "text-text-muted" : "text-white/60"
                            )}>
                                {branding.siteTagline}
                            </span>
                        )}
                    </div>
                </Link>

                {/* Desktop Navigation - Centered */}
                <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
                    {[
                        { path: '/', label: t.home },
                        { path: '/education', label: t.education },
                        { path: '/workshops', label: t.workshops },
                        { path: '/news', label: t.news },
                        { path: '/blog', label: t.blog },
                        { path: '/about', label: t.about },
                        { path: '/partners', label: t.partners }
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "text-[13px] font-semibold uppercase tracking-wide transition-colors duration-500 hover:text-primary relative group",
                                scrolled ? "text-text-main" : "text-white"
                            )}
                        >
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-6">
                    <div className="hidden lg:flex items-center gap-6">
                        <Link to="/contact" className={cn("text-xs font-medium uppercase tracking-wide hover:text-primary transition-colors", scrolled ? "text-text-muted" : "text-white/80")}>{t.contact}</Link>

                        <div className={cn("h-4 w-px opacity-20", scrolled ? "bg-text-main" : "bg-white")} />

                        <div className="relative z-50">
                            <button
                                onClick={() => setIsLangOpen(!isLangOpen)}
                                className={cn("flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide hover:text-primary transition-colors", scrolled ? "text-text-muted" : "text-white/80")}
                            >
                                <Globe className="size-5" /> {t.languages}
                            </button>
                            <AnimatePresence>
                                {isLangOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full right-0 pt-4"
                                    >
                                        <div className="bg-bg-card rounded-xl shadow-2xl p-2 min-w-[140px] flex flex-col gap-1 border border-border-main ring-1 ring-black/5">
                                            {[
                                                { code: 'en', label: 'English' },
                                                { code: 'sv', label: 'Svenska' },
                                                { code: 'fi', label: 'Suomi' },
                                                { code: 'ar', label: 'العربية' },
                                                { code: 'uk', label: 'Українська' }
                                            ].map((l) => (
                                                <button
                                                    key={l.code}
                                                    onClick={() => {
                                                        setLang(l.code as LanguageCode);
                                                        setIsLangOpen(false);
                                                    }}
                                                    className={cn(
                                                        "text-left px-4 py-2 rounded-lg text-xs font-medium transition-colors",
                                                        lang === l.code ? "bg-primary/10 text-primary" : "text-text-muted hover:bg-bg-surface"
                                                    )}
                                                >
                                                    {l.label}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {user ? (
                            <div className="relative group ml-2">
                                <button className="flex items-center gap-2 outline-none">
                                    <div className={cn(
                                        "size-9 rounded-full flex items-center justify-center text-xs font-semibold uppercase border-2 transition-all hover:scale-105",
                                        scrolled ? "bg-bg-surface border-border-main text-text-main" : "bg-white/10 border-white/20 text-white"
                                    )}>
                                        {profile?.full_name?.[0] || user.email?.[0] || 'U'}
                                    </div>
                                </button>

                                {/* User Dropdown */}
                                <div className="absolute top-full right-0 pt-4 opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300 transform origin-top-right">
                                    <div className="bg-bg-card rounded-2xl shadow-2xl shadow-black/10 border border-border-main overflow-hidden min-w-[220px] p-2 ring-1 ring-black/5">
                                        <div className="px-4 py-3 border-b border-border-main/50 mb-1">
                                            <p className="text-sm font-medium text-text-main truncate max-w-[180px]">{profile?.full_name || "User"}</p>
                                            <p className="text-xs text-text-muted truncate max-w-[180px] font-medium">{user.email}</p>
                                        </div>

                                        {(profile?.role === 'admin' || profile?.role === 'super_admin' || user.email === 'nunommonteiro1972@gmail.com') && (
                                            <button
                                                onClick={() => setShowAdminPanel(true)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-text-muted hover:text-primary hover:bg-bg-surface rounded-xl transition-all text-left group/item"
                                            >
                                                <div className="size-6 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                                    <ShieldCheck className="size-3.5" />
                                                </div>
                                                {t.admin}
                                            </button>
                                        )}

                                        <button
                                            onClick={() => setShowUserPanel(true)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-text-muted hover:text-primary hover:bg-bg-surface rounded-xl transition-all text-left group/item"
                                        >
                                            <div className="size-6 rounded-lg bg-bg-surface flex items-center justify-center text-text-muted group-hover/item:bg-border-main transition-colors">
                                                <UserIcon className="size-3.5" />
                                            </div>
                                            {t.profile}
                                        </button>

                                        <div className="h-px bg-border-main/50 my-1" />

                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-xl transition-all text-left"
                                        >
                                            <LogOut className="size-3.5" />
                                            {t.signOut}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className={cn(
                                    "ml-4 px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all hover:scale-105 active:scale-95",
                                    scrolled ? "bg-text-main text-bg-surface hover:bg-primary shadow-lg shadow-black/10" : "bg-white text-black hover:bg-white/90 shadow-lg shadow-black/10"
                                )}
                            >
                                {t.signIn}
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className={cn(
                            "lg:hidden size-10 flex items-center justify-center rounded-xl shadow-lg transition-colors",
                            scrolled ? "bg-text-main text-bg-surface" : "bg-white text-black"
                        )}
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="lg:hidden absolute top-full left-0 w-full bg-bg-surface border-b border-border-main p-8 shadow-2xl overflow-hidden"
                    >
                        <nav className="flex flex-col gap-6 font-display text-2xl uppercase tracking-tight">
                            {[
                                { path: '/', label: t.home },
                                { path: '/education', label: t.education },
                                { path: '/workshops', label: t.workshops },
                                { path: '/news', label: t.news },
                                { path: '/blog', label: t.blog },
                                { path: '/about', label: t.about },
                                { path: '/partners', label: t.partners }
                            ].map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="hover:text-primary transition-colors hover:translate-x-2 inline-block duration-300"
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                        {user && (profile?.role === 'admin' || profile?.role === 'super_admin' || user.email === 'nunommonteiro1972@gmail.com') && (
                            <button
                                onClick={() => { setShowAdminPanel(true); setIsMenuOpen(false); }}
                                className="mt-8 flex items-center gap-2 text-sm font-medium text-primary uppercase tracking-wide"
                            >
                                <ShieldCheck className="size-4" />
                                {t.admin}
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

const NavDropdown = ({ label }: { label: string }) => (
    <div className="group relative py-2">
        <button className="flex items-center gap-1.5 text-sm font-semibold text-text-main transition-colors group-hover:text-primary">
            {label} <ChevronDown className="size-4 group-hover:rotate-180 transition-transform duration-300" />
        </button>
        {/* Simplified dropdown for visual match */}
        <div className="absolute top-full left-0 pt-2 opacity-0 -translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-300">
            <div className="bg-bg-card border border-border-main min-w-[200px] p-2">
                <Link to="#" className="block px-4 py-2 hover:bg-bg-surface text-xs font-medium">Overview</Link>
                <Link to="#" className="block px-4 py-2 hover:bg-bg-surface text-xs font-medium">Schedule</Link>
            </div>
        </div>
    </div>
);

