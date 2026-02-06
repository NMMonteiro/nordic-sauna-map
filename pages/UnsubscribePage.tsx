import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LanguageCode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Home } from 'lucide-react';

interface UnsubscribePageProps {
    lang: LanguageCode;
}

export const UnsubscribePage = ({ lang }: UnsubscribePageProps) => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
    const [message, setMessage] = useState('');

    const email = searchParams.get('email');
    const id = searchParams.get('id');

    useEffect(() => {
        const unsubscribe = async () => {
            if (!email || !id) {
                setStatus('invalid');
                return;
            }

            try {
                // 1. Try to find and unsubscribe from dedicated list
                const { data: subData } = await supabase
                    .from('newsletter_subscribers')
                    .select('id')
                    .eq('email', email)
                    .single();

                if (subData) {
                    await supabase
                        .from('newsletter_subscribers')
                        .update({ status: 'unsubscribed' })
                        .eq('email', email);
                } else {
                    // 2. If they are a member but not in subscriber list, 
                    // we create an 'unsubscribed' record for them to ensure 
                    // future newsletters skip them
                    await supabase
                        .from('newsletter_subscribers')
                        .insert([{
                            email: email,
                            status: 'unsubscribed'
                        }]);
                }

                setStatus('success');
            } catch (err) {
                console.error('Unsubscribe error:', err);
                setStatus('error');
            }
        };

        unsubscribe();
    }, [email, id]);

    const t = {
        en: {
            loading: "Checking your subscription...",
            success: "Unsubscribed Successfully",
            success_detailed: "We've removed your email from our mailing list. We're sorry to see you go!",
            error: "Something went wrong",
            error_detailed: "We couldn't process your request. Please try again later or contact us directly.",
            invalid: "Invalid Link",
            invalid_detailed: "This unsubscribe link appears to be missing required information.",
            back_home: "Back to the Map"
        },
        sv: {
            loading: "Kontrollerar din prenumeration...",
            success: "Prenumerationen avslutad",
            success_detailed: "Vi har tagit bort din e-postadress från vår sändlista. Vi är ledsna att se dig gå!",
            error: "Något gick fel",
            error_detailed: "Vi kunde inte behandla din förfrågan. Försök igen senare eller kontakta oss direkt.",
            invalid: "Ogiltig länk",
            invalid_detailed: "Denna avregistreringslänkar verkar sakna nödvändig information.",
            back_home: "Tillbaka till kartan"
        },
        fi: {
            loading: "Tarkistetaan tilaustasi...",
            success: "Tilauksesi on peruutettu",
            success_detailed: "Olemme poistaneet sähköpostiosoitteesi postituslistaltamme. Olemme pahoillamme, että lähdet!",
            error: "Jotain meni pieleen",
            error_detailed: "Emme voineet käsitellä pyyntöäsi. Yritä myöhemmin uudelleen tai ota meihin suoraan yhteyttä.",
            invalid: "Virheellinen linkki",
            invalid_detailed: "Tästä peruutuslinkistä puuttuu tarvittavia tietoja.",
            back_home: "Takaisin kartalle"
        }
    }[lang] || {
        loading: "Checking your subscription...",
        success: "Unsubscribed Successfully",
        success_detailed: "We've removed your email from our mailing list.",
        error: "Something went wrong",
        error_detailed: "Please try again later.",
        invalid: "Invalid Link",
        invalid_detailed: "Link is missing info.",
        back_home: "Back Home"
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pt-40 pb-24 flex items-center justify-center px-6">
            <div className="max-w-md w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl text-center"
                >
                    <AnimatePresence mode="wait">
                        {status === 'loading' && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center"
                            >
                                <Loader2 className="size-16 text-primary animate-spin mb-8" />
                                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">{t.loading}</h2>
                            </motion.div>
                        )}

                        {status === 'success' && (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="size-20 rounded-[2rem] bg-emerald-50 dark:bg-emerald-950 text-emerald-500 flex items-center justify-center mb-10 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 className="size-10" />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">{t.success}</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">
                                    {t.success_detailed}
                                </p>
                                <Link
                                    to="/"
                                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 border border-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold uppercase tracking-wider text-sm hover:scale-105 transition-transform"
                                >
                                    <Home className="size-4" />
                                    {t.back_home}
                                </Link>
                            </motion.div>
                        )}

                        {(status === 'error' || status === 'invalid') && (
                            <motion.div
                                key="error"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="size-20 rounded-[2rem] bg-rose-50 dark:bg-rose-950 text-rose-500 flex items-center justify-center mb-10 shadow-lg shadow-rose-500/20">
                                    <AlertCircle className="size-10" />
                                </div>
                                <h2 className="text-3xl font-black uppercase tracking-tight mb-4">{status === 'error' ? t.error : t.invalid}</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">
                                    {status === 'error' ? t.error_detailed : t.invalid_detailed}
                                </p>
                                <Link
                                    to="/"
                                    className="flex items-center gap-2 px-8 py-4 bg-slate-900 border border-slate-800 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold uppercase tracking-wider text-sm hover:scale-105 transition-transform"
                                >
                                    <Home className="size-4" />
                                    {t.back_home}
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
};
