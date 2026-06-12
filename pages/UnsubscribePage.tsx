import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    addDoc,
    serverTimestamp
} from 'firebase/firestore';
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
                // Find and unsubscribe
                const q = query(
                    collection(db, 'newsletter_subscribers'),
                    where('email', '==', email.toLowerCase())
                );
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    const docId = querySnapshot.docs[0].id;
                    await updateDoc(doc(db, 'newsletter_subscribers', docId), {
                        status: 'unsubscribed',
                        updated_at: serverTimestamp()
                    });
                } else {
                    await addDoc(collection(db, 'newsletter_subscribers'), {
                        email: email.toLowerCase(),
                        status: 'unsubscribed',
                        created_at: serverTimestamp()
                    });
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
            message: "We respect your choice and your inbox. You won't receive our workshop updates anymore.",
            emotion: "We'll miss you!",
            error: "Connection Error",
            error_detailed: "Our server is currently busy. Please try again or contact support.",
            invalid: "Invalid Link",
            invalid_detailed: "This link is expired or incomplete.",
            back_home: "Return to Home",
            stay_connected: "Changed your mind? You're always welcome back."
        },
        sv: {
            loading: "Behandlar din begäran...",
            success: "Du är nu avregistrerad",
            message: "Vi respekterar ditt val och din inkorg. Du kommer inte längre att få våra workshop-uppdateringar.",
            emotion: "Vi kommer att sakna dig!",
            error: "Anslutningsfel",
            error_detailed: "Vår server är för närvarande upptagen. Försök igen eller kontakta support.",
            invalid: "Ogiltig länk",
            invalid_detailed: "Denna länk har gått ut eller är ofullständig.",
            back_home: "Tillbaka till hem",
            stay_connected: "Ändrat dig? Du är alltid välkommen tillbaka."
        },
        fi: {
            loading: "Käsitellään pyyntöäsi...",
            success: "Tilauksesi on peruutettu",
            message: "Kunnioitamme valintaasi. Et saa enää ilmoituksia työpajoistamme.",
            emotion: "Jäämme kaipaamaan sinua!",
            error: "Yhteysvirhe",
            error_detailed: "Palvelimemme on tällä hetkellä varattu. Yritä uudelleen tai ota yhteyttä tukeen.",
            invalid: "Virheellinen linkki",
            invalid_detailed: "Tämä linkki on vanhentunut tai puutteellinen.",
            back_home: "Takaisin kotiin",
            stay_connected: "Muutitko mielesi? Olet aina tervetullut takaisin."
        },
        ar: {
            loading: "جاري معالجة طلبك...",
            success: "تم إلغاء الاشتراك بنجاح",
            message: "نحن نحترم اختيارك. لن تتلقى تحديثات ورش العمل بعد الآن.",
            emotion: "سنفتقدك!",
            error: "خطأ في الاتصال",
            error_detailed: "خادمنا مشغول حاليًا. يرجى المحاولة مرة أخرى أو الاتصال بالدعم.",
            invalid: "رابط غير صالح",
            invalid_detailed: "هذا الرابط منتهي الصلاحية أو غير مكتمل.",
            back_home: "العودة إلى الصفحة الرئيسية",
            stay_connected: "هل غيرت رأيك؟ أنت مرحب بك دائمًا للعودة."
        },
        uk: {
            loading: "Обробка вашого запиту...",
            success: "Ви відписалися",
            message: "Ми поважаємо ваш вибір. Ви більше не отримуватимете оновлення про наші воркшопи.",
            emotion: "Нам буде вас бракувати!",
            error: "Помилка з'єднання",
            error_detailed: "Наш сервер зараз зайнятий. Спробуйте ще раз або зверніться до підтримки.",
            invalid: "Недійсне посилання",
            invalid_detailed: "Це посилання застаріло або є неповним.",
            back_home: "Повернутися на головну",
            stay_connected: "Змінили думку? Ви завжди можете повернутися."
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
        back_home: "Back Home",
        stay_connected: "You're always welcome back."
    };

    return (
        <div className="min-h-screen bg-bg-surface relative overflow-hidden flex items-center justify-center py-20 px-6">
            {/* Background elements for premium feel */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

            <div className="max-w-2xl w-full relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-bg-card rounded-[3.5rem] border border-border-main shadow-xl overflow-hidden"
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
                                        <h2 className="text-2xl font-semibold uppercase tracking-tight text-text-main">{t.loading}</h2>
                                        <p className="text-text-muted font-medium">Suomiportaat Workshop Platform</p>
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
                                        <div className="size-24 rounded-[2.5rem] bg-secondary text-white flex items-center justify-center mb-2 shadow-2xl rotate-3">
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
                                        <h2 className="text-2xl lg:text-xl font-semibold text-text-main leading-tight uppercase tracking-tight">
                                            {t.emotion}
                                        </h2>
                                        <p className="text-text-muted text-lg font-medium leading-relaxed max-w-md mx-auto">
                                            {t.message}
                                        </p>
                                    </div>

                                    <div className="pt-6 flex flex-col items-center gap-6">
                                        <Link
                                            to="/"
                                            className="group flex items-center gap-3 px-12 py-5 bg-secondary text-white rounded-[2rem] font-semibold uppercase tracking-wide text-xs hover:shadow-2xl hover:scale-105 active:scale-95 transition-all w-full sm:w-auto"
                                        >
                                            <Home className="size-4 text-primary" />
                                            {t.back_home}
                                        </Link>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted opacity-50">
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
                                    <div className="size-24 rounded-[2.5rem] bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xl">
                                        <AlertCircle className="size-12" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-semibold text-text-main uppercase tracking-tight">{status === 'error' ? t.error : t.invalid}</h2>
                                        <p className="text-text-muted font-medium max-w-sm mx-auto">
                                            {status === 'error' ? t.error_detailed : t.invalid_detailed}
                                        </p>
                                    </div>
                                    <Link
                                        to="/"
                                        className="inline-flex items-center gap-3 px-10 py-5 bg-gray-100 text-text-muted rounded-2xl font-semibold uppercase tracking-wide text-xs hover:bg-secondary hover:text-white transition-all"
                                    >
                                        <MoveLeft className="size-4" />
                                        {t.back_home}
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="bg-bg-surface p-8 border-t border-border-main flex items-center justify-center gap-8">
                        <div className="flex items-center gap-2 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                            <Sparkles className="size-4 text-primary" />
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">Suomiportaat Project Platform</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
