import React from 'react';
import { LanguageCode } from '../types';
import { Facebook, Instagram, Youtube, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface FooterProps {
    lang: LanguageCode;
}

export const Footer = ({ lang }: FooterProps) => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 dark:bg-slate-950 pt-16 lg:pt-32 pb-12 lg:pb-16 border-t border-slate-200/60 dark:border-white/5 overflow-hidden relative transition-colors duration-300">
            {/* Decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

            <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 lg:mb-24">
                    {/* Brand Section */}
                    <div className="lg:col-span-4 flex flex-col items-center lg:items-start text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 lg:mb-8">
                            <img src="/logo.png" className="size-8 object-contain" alt="Logo" />
                            <h2 className="text-xl font-black tracking-tight uppercase text-slate-900 dark:text-white">
                                Nordic <span className="text-primary italic">Sauna</span>
                            </h2>
                        </div>
                        <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-6 lg:mb-10 max-w-sm mx-auto lg:mx-0">
                            {lang === 'sv'
                                ? 'Ett gränsöverskridande projekt för att bevara och digitalisera det nordiska bastuarvet.'
                                : 'A cross-border heritage project dedicated to digitizing and preserving the unique Nordic sauna culture.'}
                        </p>
                        <div className="flex gap-4 justify-center lg:justify-start">
                            <SocialIcon href="https://www.facebook.com/profile.php?id=61584953528904" icon={<Facebook className="size-5" />} />
                            <SocialIcon href="https://www.instagram.com/nordic_sauna_map/" icon={<Instagram className="size-5" />} />
                            <SocialIcon href="https://www.youtube.com/channel/UC9BWTgS_03FevO5kZLWDjRg" icon={<Youtube className="size-5" />} />
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-8 lg:gap-16">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6">Archive</h4>
                            <ul className="space-y-4">
                                <FooterLink href="/">{lang === 'sv' ? 'Kartan' : 'The Map'}</FooterLink>
                                <FooterLink href="/news">{lang === 'sv' ? 'Nyheter' : 'News'}</FooterLink>
                                <FooterLink href="/blog">{lang === 'sv' ? 'Bloggen' : 'Blog'}</FooterLink>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6">Heritage</h4>
                            <ul className="space-y-4">
                                <FooterLink href="/education">{lang === 'sv' ? 'Utbildning' : 'Education'}</FooterLink>
                                <FooterLink href="/about">{lang === 'sv' ? 'Om projektet' : 'About'}</FooterLink>
                                <FooterLink href="/partners">{lang === 'sv' ? 'Partners' : 'Partners'}</FooterLink>
                            </ul>
                        </div>
                    </div>

                    {/* Funding Section */}
                    <div className="lg:col-span-4">
                        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none transition-colors">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-6">Supported By</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed mb-8 uppercase tracking-wider">
                                {lang === 'sv'
                                    ? 'Projektet ”Nordic Sauna Map” finansierades av Kulturfonden för Sverige och Finland.'
                                    : lang === 'fi'
                                        ? 'Nordic Sauna Map -hanketta on rahoittanut Suomalais-ruotsalainen kulttuurirahasto.'
                                        : 'The project “Nordic Sauna Map” was funded by Kulturfonden för Sverige och Finland.'}
                            </p>
                            <a
                                href="https://www.kielilahettilaat.fi/kulturfonden-for-sverige-och-finland/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <img
                                    src="https://rahastosuomiruotsi.org/wp-content/uploads/2024/09/Kulturfonden_for_Sverige_och_Finland_vagrat.png"
                                    alt="Kulturfonden Logo"
                                    className="h-8 w-auto grayscale invert dark:invert-0 group-hover:grayscale-0 transition-all opacity-70 group-hover:opacity-100"
                                />
                                <ArrowUpRight className="size-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-12 lg:pt-16 border-t border-slate-200/60 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-bold">
                        © {currentYear} Nordic Sauna Map. <span className="hidden md:inline mx-2 text-slate-200 dark:text-slate-800 text-xs">|</span>
                        <span className="md:inline block mt-2 md:mt-0 font-medium">Built for the preservation of heritage.</span>
                    </p>
                    <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                        <Link to="/privacy" className="hover:text-primary transition-colors">{lang === 'sv' ? 'Integritet' : lang === 'fi' ? 'Tietosuoja' : 'Privacy'}</Link>
                        <Link to="/cookies" className="hover:text-primary transition-colors">{lang === 'sv' ? 'Cookies' : lang === 'fi' ? 'Evästeet' : 'Cookies'}</Link>
                        <a href="mailto:info@nordicsaunamap.com" className="hover:text-primary transition-colors">{lang === 'sv' ? 'Kontakt' : lang === 'fi' ? 'Ota yhteyttä' : 'Contact'}</a>
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
        className="size-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-colors"
    >
        {icon}
    </motion.a>
);

const FooterLink = ({ href, children }: { href: string, children: string }) => (
    <li>
        <a
            href={href}
            className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white font-bold transition-all hover:translate-x-1 inline-block"
        >
            {children}
        </a>
    </li>
);
