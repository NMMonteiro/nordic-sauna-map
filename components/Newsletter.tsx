import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageCode } from '../types';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface NewsletterProps {
    lang: LanguageCode;
}

export const Newsletter = ({ lang }: NewsletterProps) => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const t = {
        en: {
            title: "Stay in ",
            highlight: "the loop",
            desc: "Join our community newsletter and stay updated on the latest Finnish workshops and project events.",
            placeholder: "YOUR EMAIL ADDRESS",
            button: "Subscribe Now",
            success: "Welcome aboard! Check your inbox.",
            error: "Something went wrong. Please try again.",
            successTitle: "Thank You!",
            successMessage: "Thank you for subscribing to the Suomiportaat newsletter. We're excited to share our latest news, workshops, and updates with you.",
            close: "Continue"
        },
        sv: {
            title: "Håll dig ",
            highlight: "uppdaterad",
            desc: "Gå med i vårt nyhetsbrev och få information om de senaste finska workshopparna och projekthändelserna.",
            placeholder: "DIN E-POSTADRESS",
            button: "Prenumerera nu",
            success: "Välkommen! Kolla din inkorg.",
            error: "Något gick fel. Försök igen.",
            successTitle: "Tack!",
            successMessage: "Tack för att du prenumererar på Suomiportaats nyhetsbrev. Vi ser fram emot att dela våra senaste nyheter, workshops och uppdateringar med dig.",
            close: "Fortsätt"
        },
        fi: {
            title: "Pysy ",
            highlight: "ajan tasalla",
            desc: "Liity uutiskirjeeseemme ja pysy ajan tasalla uusimmista suomen kielen työpajoista ja projektin tapahtumista.",
            placeholder: "SÄHKÖPOSTIOSOITTEESI",
            button: "Tilaa nyt",
            success: "Tervetuloa mukaan! Tarkista sähköpostisi.",
            error: "Jokin meni vikaan. Yritä uudelleen.",
            successTitle: "Kiitos!",
            successMessage: "Kiitos, että tilasit Suomiportaat-uutiskirjeen. Olemme innoissamme voidessamme jakaa uusimmat uutiset, työpajat ja päivitykset kanssasi.",
            close: "Jatka"
        }
    }[lang] || {
        title: "Stay in ",
        highlight: "the loop",
        desc: "Join our community newsletter and stay updated on the latest Finnish workshops and project events.",
        placeholder: "YOUR EMAIL ADDRESS",
        button: "Subscribe Now",
        success: "Welcome aboard! Check your inbox.",
        error: "Something went wrong. Please try again.",
        successTitle: "Thank You!",
        successMessage: "Thank you for subscribing to the Suomiportaat newsletter. We're excited to share our latest news, workshops, and updates with you.",
        close: "Continue"
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        try {
            const emailId = email.toLowerCase().trim();
            const docRef = doc(db, 'newsletter_subscribers', emailId);
            
            // Check if already exists (safe with our 'get' permission)
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                setStatus('error');
                setErrorMsg(lang === 'fi' ? 'Olet jo tilaaja!' : 'Already subscribed!');
                return;
            }

            // Create new subscription using setDoc
            await setDoc(docRef, {
                email: emailId,
                language: lang,
                status: 'active',
                created_at: serverTimestamp(),
                source: 'website_footer'
            });

            setStatus('success');
            setEmail('');
        } catch (err: any) {
            console.error('Newsletter error:', err);
            setStatus('error');
            setErrorMsg(err.code === 'permission-denied' 
                ? 'Check Firestore Rules' 
                : t.error);
        }
    };

    return (
        <>
        <section className="py-16 md:py-24 bg-primary relative overflow-hidden">
            {/* Background elements - removed blur blobs */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-white text-center md:text-left"
                    >
                        <div className="hidden lg:flex size-20 md:size-24 bg-white/20 rounded-[2rem] md:rounded-[2.5rem] items-center justify-center border border-white/30 shrink-0">
                            <span className="material-symbols-outlined text-2xl">mark_email_unread</span>
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl lg:text-xl font-semibold uppercase tracking-tight leading-none mb-3 md:mb-4">
                                {t.title}<span className="text-nordic-lake italic">{t.highlight}</span>
                            </h3>
                            <p className="text-white/70 font-light max-w-md text-sm md:text-lg leading-relaxed">
                                {t.desc}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-auto min-w-full lg:min-w-[500px]"
                    >
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
                            <div className="relative w-full">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t.placeholder}
                                    required
                                    disabled={status === 'loading' || status === 'success'}
                                    className="w-full bg-slate-900/40 border border-white/20 rounded-2xl md:rounded-[2rem] px-6 md:px-8 py-4 md:py-6 text-sm font-semibold text-white placeholder:text-white/30 focus:bg-slate-900/60 transition-all outline-none disabled:opacity-50"
                                />
                                <AnimatePresence>

                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute -bottom-10 left-8 flex items-center gap-2 text-red-200 text-xs font-semibold uppercase tracking-wide"
                                        >
                                            <AlertCircle className="size-4" />
                                            {errorMsg}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className="w-full sm:w-auto bg-white text-primary px-8 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2rem] text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] hover:bg-snow hover:scale-105 active:scale-95 transition-all whitespace-nowrap shadow-xl shadow-black/10 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {status === 'loading' ? '...' : t.button}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
            
            {/* Success Modal */}
            <AnimatePresence>
                {status === 'success' && (
                    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => {
                                setStatus('idle');
                                setEmail('');
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-bg-surface w-full max-w-lg rounded-[3rem] p-12 shadow-2xl flex flex-col items-center text-center overflow-hidden border border-border-main"
                        >
                            <div className="absolute top-0 left-0 w-full h-32 bg-primary/5" />
                            <div className="size-24 bg-primary text-white rounded-full flex items-center justify-center mb-8 relative z-10 shadow-2xl shadow-primary/30 border-4 border-bg-surface">
                                <span className="material-symbols-outlined text-4xl">mark_email_read</span>
                            </div>
                            <h3 className="text-3xl font-semibold text-text-main uppercase font-display mb-4 tracking-tight">
                                {t.successTitle}
                            </h3>
                            <p className="text-text-muted font-body mb-8 leading-relaxed">
                                {t.successMessage}
                            </p>
                            <button
                                onClick={() => {
                                    setStatus('idle');
                                    setEmail('');
                                }}
                                className="bg-primary text-white px-10 py-4 rounded-full text-xs font-semibold uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 w-full"
                            >
                                {t.close}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};
