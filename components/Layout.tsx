import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Profile, LanguageCode } from '../types';
import { User } from '@supabase/supabase-js';

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
    return (
        <div className="min-h-screen font-display bg-snow">
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

            <main className="w-full">
                {children}
            </main>

            <Footer lang={lang} />
        </div>
    );
};
