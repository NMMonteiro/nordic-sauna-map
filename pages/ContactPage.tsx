import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { LanguageCode } from '../types';

interface ContactPageProps {
    lang: LanguageCode;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
    const translations = {
        en: {
            title: 'Contact Us',
            subtitle: 'Get in touch with the Suomiportaat team',
            email: 'Email Us',
            address: 'Visit Us',
            phone: 'Call Us',
            message: 'Send us a message'
        },
        sv: {
            title: 'Kontakta oss',
            subtitle: 'Kom i kontakt med Suomiportaat-teamet',
            email: 'E-posta oss',
            address: 'Besök oss',
            phone: 'Ring oss',
            message: 'Skicka ett meddelande'
        },
        fi: {
            title: 'Ota yhteyttä',
            subtitle: 'Ota yhteyttä Suomiportaat-tiimiin',
            email: 'Sähköposti',
            address: 'Vieraile',
            phone: 'Soita meille',
            message: 'Lähetä viesti'
        },
        ar: {
            title: 'اتصل بنا',
            subtitle: 'تواصل مع فريق Suomiportaat',
            email: 'راسلنا',
            address: 'زورنا',
            phone: 'اتصل بنا',
            message: 'أرسل لنا رسالة'
        },
        uk: {
            title: 'Зв\'яжіться з нами',
            subtitle: 'Зв\'яжіться з командою Suomiportaat',
            email: 'Напишіть нам',
            address: 'Завітайте до нас',
            phone: 'Зателефонуйте нам',
            message: 'Надішліть нам повідомлення'
        }
    };

    const t = translations[lang];

    return (
        <div className="pt-32 pb-24 min-h-[60vh] bg-bg-main">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-text-main uppercase tracking-tight mb-4">
                        {t.title}
                    </h1>
                    <p className="text-lg text-text-muted font-medium">
                        {t.subtitle}
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-bg-card p-8 rounded-[2rem] border border-border-main text-center shadow-lg shadow-black/5"
                    >
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                            <Mail className="size-6" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-main mb-2">{t.email}</h3>
                        <a href="mailto:info@suomiportaat.fi" className="text-primary hover:underline font-medium">info@suomiportaat.fi</a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-bg-card p-8 rounded-[2rem] border border-border-main text-center shadow-lg shadow-black/5"
                    >
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                            <MapPin className="size-6" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-main mb-2">{t.address}</h3>
                        <p className="text-text-muted font-medium">Helsinki, Finland</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-bg-card p-8 rounded-[2rem] border border-border-main text-center shadow-lg shadow-black/5"
                    >
                        <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
                            <Phone className="size-6" />
                        </div>
                        <h3 className="text-sm font-semibold uppercase tracking-widest text-text-main mb-2">{t.phone}</h3>
                        <a href="tel:+358000000000" className="text-primary hover:underline font-medium">+358 000 000 000</a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
