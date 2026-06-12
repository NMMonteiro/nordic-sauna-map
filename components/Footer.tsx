import React from 'react';
import { LanguageCode, BrandingPreferences } from '../types';
import { Facebook, Instagram, Youtube, ArrowUpRight, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FooterProps {
    lang: LanguageCode;
    branding?: BrandingPreferences;
}

export const Footer = ({ lang, branding }: FooterProps) => {
    const currentYear = new Date().getFullYear();

    const translations = {
        en: {
            desc: 'A platform dedicated to empowering young migrants through Finnish language education and cultural integration.',
            explore: 'Explore',
            info: 'Information',
            home: 'Home',
            news: 'News',
            blog: 'Blog',
            education: 'Education',
            about: 'About',
            partners: 'Partners',
            funded_by: 'Funded By',
            visit: 'Visit Website',
            rights: 'All rights reserved.',
            privacy: 'Privacy',
            cookies: 'Cookies'
        },
        sv: {
            desc: 'En plattform dedikerad till att stärka unga migranter genom finsk språkutbildning och kulturell integration.',
            explore: 'Utforska',
            info: 'Information',
            home: 'Hem',
            news: 'Nyheter',
            blog: 'Blogg',
            education: 'Utbildning',
            about: 'Om oss',
            partners: 'Partner',
            funded_by: 'Finansierad av',
            visit: 'Besök webbplats',
            rights: 'Alla rättigheter förbehållna.',
            privacy: 'Integritet',
            cookies: 'Kakor'
        },
        fi: {
            desc: 'Sivusto, joka on omistettu nuorten maahanmuuttajien voimaannuttamiselle suomen kielen koulutuksen ja kulttuurisen integraation kautta.',
            explore: 'Tutustu',
            info: 'Tietoa',
            home: 'Koti',
            news: 'Uutiset',
            blog: 'Blogi',
            education: 'Koulutus',
            about: 'Meistä',
            partners: 'Kumppanit',
            funded_by: 'Rahoittaja',
            visit: 'Vieraile sivustolla',
            rights: 'Kaikki oikeudet pidätetään.',
            privacy: 'Tietosuoja',
            cookies: 'Evästeet'
        },
        ar: {
            desc: 'منصة مخصصة لتمكين المهاجرين الشباب من خلال تعليم اللغة الفنلندية والاندماج الثقافي.',
            explore: 'اكتشف',
            info: 'معلومات',
            home: 'الرئيسية',
            news: 'الأخبار',
            blog: 'المدونة',
            education: 'التعليم',
            about: 'عنا',
            partners: 'الشركاء',
            funded_by: 'تمويل من',
            visit: 'زيارة الموقع',
            rights: 'جميع الحقوق محفوظة.',
            privacy: 'الخصوصية',
            cookies: 'ملفات تعريف الارتباط'
        },
        uk: {
            desc: 'Платформа, присвячена розширенню можливостей молодих мігрантів через вивчення фінської мови та культурну інтеграцію.',
            explore: 'Дослідити',
            info: 'Інформація',
            home: 'Головна',
            news: 'Новини',
            blog: 'Блог',
            education: 'Освіта',
            about: 'Про нас',
            partners: 'Партнери',
            funded_by: 'За підтримки',
            visit: 'Відвідати сайт',
            rights: 'Всі права захищені.',
            privacy: 'Конфіденційність',
            cookies: 'Cookies'
        }
    };

    const t = translations[lang];

    return (
        <footer className="bg-bg-card pt-24 pb-12 border-t border-border-main overflow-hidden relative lg:snap-start">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-8">
                            <img src={branding?.logoUrl || "/logo.png"} className="size-10 object-contain" alt="Logo" />
                            <h2 className="font-display text-2xl font-semibold tracking-tight text-text-main uppercase">
                                {branding?.siteName || "Suomiportaat"}
                            </h2>
                        </div>
                        <p className="text-lg text-text-muted font-medium leading-relaxed mb-10 max-w-sm">
                            {t.desc}
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon href="https://www.facebook.com" icon={<Facebook className="size-5" />} />
                            <SocialIcon href="https://www.instagram.com" icon={<Instagram className="size-5" />} />
                            <SocialIcon href="https://www.youtube.com" icon={<Youtube className="size-5" />} />
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-5 grid grid-cols-2 gap-16">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted opacity-50 mb-8 font-body">{t.explore}</h4>
                            <ul className="space-y-4">
                                <FooterLink href="/">{t.home}</FooterLink>
                                <FooterLink href="/news">{t.news}</FooterLink>
                                <FooterLink href="/blog">{t.blog}</FooterLink>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted opacity-50 mb-8 font-body">{t.info}</h4>
                            <ul className="space-y-4">
                                <FooterLink href="/education">{t.education}</FooterLink>
                                <FooterLink href="/about">{t.about}</FooterLink>
                                <FooterLink href="/partners">{t.partners}</FooterLink>
                            </ul>
                        </div>
                    </div>

                    {/* Funding Section */}
                    <div className="lg:col-span-3">
                        <div className="p-8 border-t lg:border-t-0 lg:border-l border-border-main flex flex-col justify-between h-full">
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted opacity-50 mb-8 font-body">{t.funded_by}</h4>
                                {branding?.fundingLogoUrl && (
                                    <img
                                        src={branding.fundingLogoUrl}
                                        alt="Funding Agency"
                                        className="h-16 w-auto object-contain mb-6 mix-blend-multiply dark:mix-blend-normal"
                                    />
                                )}
                                <p className="text-xs text-text-main font-medium leading-relaxed mb-8 uppercase tracking-wider">
                                    {branding?.fundingText || "Supported by Finnish Cultural Foundation."}
                                </p>
                                {branding?.fundingUrl && (
                                    <a
                                        href={branding.fundingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary hover:text-primary/80 transition-colors group"
                                    >
                                        {t.visit}
                                        <ArrowUpRight className="size-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 border-t border-border-main flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-xs text-text-muted font-medium uppercase tracking-wide">
                        © {currentYear} {branding?.siteName || "Suomiportaat"}. {t.rights}
                    </p>
                    <div className="flex gap-12 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        <Link to="/privacy" className="hover:text-primary transition-colors">{t.privacy}</Link>
                        <Link to="/cookies" className="hover:text-primary transition-colors">{t.cookies}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};


const SocialIcon = ({ href, icon }: { href: string, icon: any }) => (
    <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -4, scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="size-12 bg-bg-surface rounded-none border border-border-main flex items-center justify-center text-text-muted hover:text-primary hover:border-primary/20 transition-colors"
    >
        {icon}
    </motion.a>
);

const FooterLink = ({ href, children }: { href: string, children: string }) => (
    <li>
        <Link
            to={href}
            className="text-text-muted hover:text-primary transition-all hover:translate-x-1 inline-block font-medium"
        >
            {children}
        </Link>
    </li>
);
