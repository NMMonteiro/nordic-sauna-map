import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X } from 'lucide-react';
import { LanguageCode } from '../types';
import { Link } from 'react-router-dom';

interface CookieBannerProps {
    lang: LanguageCode;
}

export const CookieBanner = ({ lang }: CookieBannerProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 2000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const t = {
        en: {
            title: "Cookie Settings",
            msg: "We use cookies to remember your language and theme preferences for a better Nordic experience.",
            accept: "Accept",
            decline: "Decline",
            policy: "Cookie Policy"
        },
        sv: {
            title: "Cookieinställningar",
            msg: "Vi använder cookies för att komma ihåg dina språk- och temainställningar för en bättre nordisk upplevelse.",
            accept: "Acceptera",
            decline: "Neka",
            policy: "Cookiepolicy"
        },
        fi: {
            title: "Evästeasetukset",
            msg: "Käytämme evästeitä muistaaksemme kieli- ja teema-asetuksesi parempaa pohjoismaista kokemusta varten.",
            accept: "Hyväksy",
            decline: "Hylkää",
            policy: "Evästekäytäntö"
        }
    }[lang] || {
        title: "Cookie Settings",
        msg: "We use cookies for a better experience.",
        accept: "Accept",
        decline: "Decline",
        policy: "Cookie Policy"
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-0 md:bottom-8 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:w-[calc(100%-48px)] max-w-2xl z-[10002]"
                >
                    <div className="p-6 md:p-8 bg-slate-900 border-t md:border border-slate-800 rounded-t-[2rem] md:rounded-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl overflow-hidden relative group">
                        {/* Background flare */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8">
                            <div className="hidden md:flex size-16 rounded-2xl bg-slate-800 text-primary items-center justify-center shrink-0">
                                <Cookie className="size-8" />
                            </div>

                            <div className="flex-1 text-left">
                                <h4 className="text-white font-semibold uppercase tracking-tight mb-2 text-sm md:text-base flex items-center gap-2">
                                    <Cookie className="size-4 md:hidden text-primary" /> {t.title}
                                </h4>
                                <p className="text-slate-400 text-xs md:text-sm font-medium leading-relaxed">
                                    {t.msg}{' '}
                                    <Link to="/cookies" className="text-primary underline hover:text-primary/80 transition-colors">
                                        {t.policy}
                                    </Link>
                                </p>
                            </div>

                            <div className="flex gap-3 md:gap-4 w-full md:w-auto mt-2 md:mt-0">
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="flex-1 md:flex-none px-4 md:px-6 py-3 text-slate-400 hover:text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide transition-colors border border-slate-800 md:border-transparent rounded-xl md:rounded-none"
                                >
                                    {t.decline}
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 md:flex-none px-6 md:px-8 py-3 bg-primary text-white text-[10px] md:text-xs font-semibold uppercase tracking-wide rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                >
                                    {t.accept}
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
