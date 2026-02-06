import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { LanguageCode } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, Home, Heart, MailX, MoveLeft, Sparkles } from 'lucide-react';

interface UnsubscribePageProps {
    lang: LanguageCode;
}

export const UnsubscribePage = ({ lang }: UnsubscribePageProps) => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');

    const email = searchParams.get('email');
    const id = searchParams.get('id');

    useEffect(() => {
        const unsubscribe = async () => {
            // Artificial delay for premium feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            if (!email) {
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
            loading: "Processing your request...",
            success: "You've been unsubscribed",
            message: "We're genuinely sorry to see you leave, but we respect your inbox. You won't hear from us again.",
            emotion: "Sorry to see you go!",
            error: "Connection Error",
            error_detailed: "Our archive is currently experiencing high heat. Please try again or contact support.",
            invalid: "Invalid Link",
            invalid_detailed: "This link has cooled down or is incomplete.",
            back_home: "Return to Home",
            stay_connected: "Changed your mind? You're always welcome back."
        },
        sv: {
            loading: "Behandlar din begäran...",
            success: "Du är nu avregistrerad",
            message: "Vi är genuint ledsna att se dig lämna, men vi respekterar din inkorg. Du kommer inte att höra från oss igen.",
            emotion: "Tråkigt att se dig gå!",
            error: "Anslutningsfel",
            error_detailed: "Vårt arkiv upplever för närvarande hög värme. Försök igen eller kontakta support.",
            invalid: "Ogiltig länk",
            invalid_detailed: "Denna länk har svalnat eller är ofullständig.",
            back_home: "Tillbaka till hem",
            stay_connected: "Ändrat dig? Du är alltid välkommen tillbaka."
        },
        fi: {
            loading: "Käsitellään pyyntöäsi...",
            success: "Tilauksesi on peruutettu",
            message: "Olemme aidosti pahoillamme nähdessämme sinun lähtevän, mutta kunnioitamme sähköpostiasi. Et kuule meistä enää.",
            emotion: "Pahoillamme, että lähdet!",
            error: "Yhteysvirhe",
            error_detailed: "Arkistossamme on tällä hetkellä ruuhkaa. Yritä uudelleen tai ota yhteyttä tukeen.",
            invalid: "Virheellinen linkki",
            invalid_detailed: "Tämä linkki on vanhentunut tai puutteellinen.",
            back_home: "Takaisin kotiin",
            stay_connected: "Muutitko mielesi? Olet aina tervetullut takaisin."
        }
    }[lang] || {
        loading: "Processing...",
        success: "Unsubscribed",
        message: "We're sorry to see you go.",
        emotion: "Goodbye!",
        error: "Error",
        error_detailed: "Please try again later.",
        invalid: "Invalid",
        invalid_detailed: "Invalid link.",
        back_home: "Back Home"
    };

    return (
        <div className="min-h-screen bg-[#fcfdfe] relative overflow-hidden flex items-center justify-center py-20 px-6">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="max-w-2xl w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_40px_100px_rgba(0,0,0,0.06)] overflow-hidden"
                >
                    <div className="p-12 lg:p-20 text-center">
                        <AnimatePresence mode="wait">
                            {status === 'loading' && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-8"
                                >
                                    <div className="relative size-32 mx-auto">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="size-12 text-primary animate-spin" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">{t.loading}</h2>
                                        <p className="text-slate-400 font-medium">Updating the Nordic Archive...</p>
                                    </div>
                                </motion.div>
                            )}

                            {status === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-10"
                                >
                                    <div className="relative inline-block">
                                        <div className="size-24 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center mb-2 shadow-2xl shadow-slate-900/20 rotate-3">
                                            <MailX className="size-10" />
                                        </div>
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5, type: "spring" }}
                                            className="absolute -top-2 -right-2 size-8 bg-primary rounded-full flex items-center justify-center text-white shadow-lg"
                                        >
                                            <Heart className="size-4 fill-white" />
                                        </motion.div>
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight uppercase tracking-tighter">
                                            {t.emotion}
                                        </h2>
                                        <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md mx-auto">
                                            {t.message}
                                        </p>
                                    </div>

                                    <div className="pt-6 flex flex-col items-center gap-6">
                                        <Link
                                            to="/"
                                            className="group flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto border border-slate-800"
                                        >
                                            <Home className="size-4 text-primary" />
                                            {t.back_home}
                                        </Link>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                                            {t.stay_connected}
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {(status === 'error' || status === 'invalid') && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-10"
                                >
                                    <div className="size-24 rounded-[2.5rem] bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xl shadow-rose-100/50">
                                        <AlertCircle className="size-12" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{status === 'error' ? t.error : t.invalid}</h2>
                                        <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                            {status === 'error' ? t.error_detailed : t.invalid_detailed}
                                        </p>
                                    </div>
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-3 px-10 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-900 hover:text-white transition-all border border-transparent hover:border-slate-800"
                                    >
                                        <MoveLeft className="size-4" />
                                        {t.back_home}
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-slate-50/50 p-8 border-t border-slate-50 flex items-center justify-center gap-8">
                        <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                            <Sparkles className="size-4 text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Nordic Sauna Map digital Archive</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
