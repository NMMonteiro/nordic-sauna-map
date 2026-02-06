import React, { ReactNode } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Header } from './Header';
import { Footer } from './Footer';
import { Profile, LanguageCode } from '../types';
import { User } from '@supabase/supabase-js';
import { Newsletter } from './Newsletter';
import { CookieBanner } from './CookieBanner';
import { useLocation, Link } from 'react-router-dom';
import { Map as MapIcon, BookOpen, GraduationCap, Grid, User as UserIcon, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
    children: ReactNode;
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
    setShowUserPanel
}: LayoutProps) => {
    const { scrollYProgress } = useScroll();
    const location = useLocation();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const isAdmin = profile?.role === 'admin';

    const scrollToMap = (e: React.MouseEvent) => {
        if (location.pathname === '/') {
            e.preventDefault();
            const element = document.getElementById('map-section');
            if (element) {
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = element.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

    const navItems = [
        {
            path: '/',
            icon: <MapIcon className="size-5" />,
            label: 'Map',
            action: location.pathname === '/' ? scrollToMap : undefined
        },
        { path: '/blog', icon: <BookOpen className="size-5" />, label: 'Blog' },
        { path: '/education', icon: <GraduationCap className="size-5" />, label: 'Learn' },
        {
            action: () => user ? setShowUserPanel(true) : setShowAuthModal(true),
            icon: <UserIcon className="size-5" />,
            label: 'Profile'
        },
        ...(isAdmin ? [{
            action: () => setShowAdminPanel(true),
            icon: <ShieldAlert className="size-5" />,
            label: 'Admin'
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
                                            "text-[10px] font-black uppercase tracking-widest transition-colors",
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
                                            "text-[10px] font-black uppercase tracking-widest transition-colors",
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
            <Footer lang={lang} />
            <CookieBanner lang={lang} />
        </div>
    );
};
