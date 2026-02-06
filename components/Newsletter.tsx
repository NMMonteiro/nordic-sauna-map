import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LanguageCode } from '../types';
import { supabase } from '../supabaseClient';
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
            desc: "Join our community newsletter and get the latest sauna traditions and map updates directly.",
            placeholder: "YOUR EMAIL ADDRESS",
            button: "Subscribe Now",
            success: "Welcome aboard! Check your inbox.",
            error: "Something went wrong. Please try again."
        },
        sv: {
            title: "Håll dig ",
            highlight: "uppdaterad",
            desc: "Gå med i vårt nyhetsbrev och få de senaste bastutraditionerna och kartuppdateringarna direkt.",
            placeholder: "DIN E-POSTADRESS",
            button: "Prenumerera nu",
            success: "Välkommen! Kolla din inkorg.",
            error: "Något gick fel. Försök igen."
        },
        fi: {
            title: "Pysy ",
            highlight: "ajan tasalla",
            desc: "Liity uutiskirjeeseemme ja saat uusimmat saunaperinteet ja karttapäivitykset suoraan sähköpostiisi.",
            placeholder: "SÄHKÖPOSTIOSOITTEESI",
            button: "Tilaa nyt",
            success: "Tervetuloa mukaan! Tarkista sähköpostisi.",
            error: "Jokin meni vikaan. Yritä uudelleen."
        }
    }[lang] || {
        title: "Stay in ",
        highlight: "the loop",
        desc: "Join our community newsletter and get the latest sauna traditions and map updates directly.",
        placeholder: "YOUR EMAIL ADDRESS",
        button: "Subscribe Now",
        success: "Welcome aboard! Check your inbox.",
        error: "Something went wrong. Please try again."
    };

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        console.log(`[DEBUG] Attempting subscription for ${email} with language: ${lang}`);
        try {
            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email, language: lang }]);

            if (error) throw error;
            setStatus('success');
            setEmail('');
        } catch (err: any) {
            console.error('Newsletter error:', err);
            setStatus('error');
            setErrorMsg(err.message?.includes('unique constraint')
                ? 'Already subscribed!'
                : t.error);
        }
    };

    return (
        <section className="py-24 bg-primary relative overflow-hidden">
            {/* Background elements - removed blur blobs */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-8 text-white text-center lg:text-left"
                    >
                        <div className="hidden xl:flex size-24 bg-white/20 rounded-[2.5rem] items-center justify-center border border-white/30">
                            <span className="material-symbols-outlined text-4xl">mark_email_unread</span>
                        </div>
                        <div>
                            <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-4">
                                {t.title}<span className="text-nordic-lake italic">{t.highlight}</span>
                            </h3>
                            <p className="text-white/70 font-light max-w-md text-lg leading-relaxed">
                                {t.desc}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="w-full lg:w-auto min-w-full sm:min-w-[500px]"
                    >
                        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="relative w-full">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t.placeholder}
                                    required
                                    disabled={status === 'loading' || status === 'success'}
                                    className="w-full bg-slate-900/40 border border-white/20 rounded-[2rem] px-8 py-6 text-sm font-black text-white placeholder:text-white/30 focus:bg-slate-900/60 transition-all outline-none disabled:opacity-50"
                                />
                                <AnimatePresence>
                                    {status === 'success' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute -bottom-10 left-8 flex items-center gap-2 text-nordic-lake text-xs font-black uppercase tracking-widest"
                                        >
                                            <CheckCircle2 className="size-4" />
                                            {t.success}
                                        </motion.div>
                                    )}
                                    {status === 'error' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute -bottom-10 left-8 flex items-center gap-2 text-red-200 text-xs font-black uppercase tracking-widest"
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
                                className="w-full sm:w-auto bg-white text-primary px-12 py-6 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-snow hover:scale-105 active:scale-95 transition-all whitespace-nowrap shadow-2xl shadow-black/10 disabled:opacity-50 disabled:hover:scale-100"
                            >
                                {status === 'loading' ? '...' : t.button}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
