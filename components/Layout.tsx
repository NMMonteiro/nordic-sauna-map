import React, { ReactNode, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { Profile, LanguageCode } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { Newsletter } from './Newsletter';
import { CookieBanner } from './CookieBanner';
import { useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, GraduationCap, Grid, User as UserIcon, ShieldAlert } from 'lucide-react';

import { cn } from '../lib/utils';
import { useTranslation } from '../contexts/TranslationContext';

interface LayoutProps {
    children: ReactNode;
    lang: LanguageCode;
    setLang: (lang: LanguageCode) => void;
    user: FirebaseUser | null;
    profile: Profile | null;
    isMenuOpen: boolean;
    setIsMenuOpen: (open: boolean) => void;
    setShowAuthModal: (show: boolean) => void;
    setShowAdminPanel: (show: boolean) => void;
    setShowUserPanel: (show: boolean) => void;
    branding?: any;
}

export const Layout = ({
    children,
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
}: LayoutProps) => {
    const { scrollYProgress } = useScroll();
    const location = useLocation();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const SUPER_ADMIN_EMAIL = 'nunommonteiro1972@gmail.com';
    const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin' || user?.email === SUPER_ADMIN_EMAIL;

    const { t } = useTranslation();

    useEffect(() => {
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang]);


    const navItems = [
        {
            path: '/',
            icon: <Home className="size-5" />,
            label: t.home
        },

        { path: '/blog', icon: <BookOpen className="size-5" />, label: t.blog },
        { path: '/education', icon: <GraduationCap className="size-5" />, label: t.education },
        {
            action: () => user ? setShowUserPanel(true) : setShowAuthModal(true),
            icon: <UserIcon className="size-5" />,
            label: t.profile
        },
        ...(isAdmin ? [{
            action: () => setShowAdminPanel(true),
            icon: <ShieldAlert className="size-5" />,
            label: t.admin
        }] : [])
    ];

    return (
        <div className="min-h-screen font-display bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pb-[calc(70px+var(--safe-bottom))] lg:pb-0">
            {/* Scroll Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-[10001]"
                style={{ scaleX }}
            />

            <Header
                lang={lang}
                setLang={setLang}
                user={user}
                profile={profile}
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
                setShowAuthModal={setShowAuthModal}
                setShowAdminPanel={setShowAdminPanel}
                setShowUserPanel={setShowUserPanel}
                branding={branding}
            />

            <motion.main
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full relative"
            >
                {children}
            </motion.main>

            {/* Premium Mobile Bottom Navigation */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[9999] bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 px-6 pt-3 pb-[calc(12px+var(--safe-bottom))] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    {navItems.map((item, idx) => {
                        const isActive = item.path === location.pathname;
                        const isAction = !!item.action;

                        return (
                            <div key={idx} className="relative group">
                                {isAction ? (
                                    <button
                                        onClick={item.action}
                                        className="flex flex-col items-center gap-1.5 px-3 py-1 transition-all"
                                    >
                                        <div className={cn(
                                            "p-2 rounded-2xl transition-all duration-300",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/30 rotate-3 scale-110"
                                                : "bg-transparent text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
                                        )}>
                                            {item.icon}
                                        </div>
                                        <span className={cn(
                                            "text-xs font-semibold uppercase tracking-wide transition-colors",
                                            isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                        )}>
                                            {item.label}
                                        </span>
                                    </button>
                                ) : (
                                    <Link
                                        to={item.path!}
                                        className="flex flex-col items-center gap-1.5 px-3 py-1 transition-all"
                                    >
                                        <div className={cn(
                                            "p-2 rounded-2xl transition-all duration-300 relative",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/30 rotate-3 scale-110"
                                                : "bg-transparent text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800"
                                        )}>
                                            {item.icon}
                                            {isActive && (
                                                <motion.div
                                                    layoutId="nav-active"
                                                    className="absolute inset-0 bg-primary rounded-2xl -z-10"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                        </div>
                                        <span className={cn(
                                            "text-xs font-semibold uppercase tracking-wide transition-colors",
                                            isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                        )}>
                                            {item.label}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            </nav>


            {location.pathname !== '/unsubscribe' && <Newsletter lang={lang} />}
            <Footer lang={lang} branding={branding} />
            <CookieBanner lang={lang} />
        </div>
    );
};
