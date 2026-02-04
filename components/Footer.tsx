import React from 'react';
import { LanguageCode } from '../types';

interface FooterProps {
    lang: LanguageCode;
}

export const Footer = ({ lang }: FooterProps) => {
    return (
        <footer className="bg-white py-20 border-t border-sky/10">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center text-center md:text-left">
                    {/* Copyright & Info */}
                    <div>
                        <p className="font-black text-slate-900 text-lg mb-2">Nordic Sauna Map</p>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            © {new Date().getFullYear()} Nordic Sauna Map project.<br />
                            {lang === 'sv' ? 'Ett gemensamt kulturarvsarkiv.' : lang === 'fi' ? 'Yhteinen kulttuuriperintöarkisto.' : 'A shared cultural heritage archive.'}
                        </p>
                    </div>

                    {/* Social Links */}
                    <div className="flex justify-center gap-8">
                        <a href="https://www.facebook.com/profile.php?id=61584953528904" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-all hover:scale-110 active:scale-95" title="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                        <a href="https://www.instagram.com/nordic_sauna_map/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-all hover:scale-110 active:scale-95" title="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href="https://www.youtube.com/channel/UC9BWTgS_03FevO5kZLWDjRg" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-primary transition-all hover:scale-110 active:scale-95" title="YouTube">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.88 23 12 23 12s0-3.88-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                        </a>
                    </div>

                    {/* Funding Disclaimer */}
                    <div className="flex flex-col items-center md:items-end gap-4">
                        <p className="text-slate-400 text-[11px] leading-relaxed max-w-[280px] md:text-right uppercase tracking-wider font-bold">
                            {lang === 'sv'
                                ? 'Projektet ”Nordic Sauna Map” finansierades av Kulturfonden för Sverige och Finland.'
                                : lang === 'fi'
                                    ? 'Nordic Sauna Map -hanketta on rahoittanut Suomalais-ruotsalainen kulttuurirahasto.'
                                    : 'The project “Nordic Sauna Map” was funded by Kulturfonden för Sverige och Finland.'}
                        </p>
                        <a href="https://www.kielilahettilaat.fi/kulturfonden-for-sverige-och-finland/" target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity grayscale hover:grayscale-0 opacity-60 hover:opacity-100">
                            <img
                                src="https://rahastosuomiruotsi.org/wp-content/uploads/2024/09/Kulturfonden_for_Sverige_och_Finland_vagrat.png"
                                alt="Kulturfonden Logo"
                                className="h-10 w-auto"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
