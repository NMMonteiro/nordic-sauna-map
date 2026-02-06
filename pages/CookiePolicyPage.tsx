import React from 'react';
import { LanguageCode } from '../types';
import { motion } from 'framer-motion';
import { Cookie, Settings, ShieldCheck, HelpCircle } from 'lucide-react';

interface CookiePolicyPageProps {
    lang: LanguageCode;
}

export const CookiePolicyPage = ({ lang }: CookiePolicyPageProps) => {
    const t = {
        en: {
            title: "Cookie Policy",
            lastUpdated: "Last updated: February 5, 2026",
            intro: "We use cookies to enhance your experience on our heritage map. This policy describes what cookies are, how we use them, and how you can manage your preferences.",
            sections: [
                {
                    title: "What are Cookies?",
                    icon: <Cookie className="size-6" />,
                    content: "Cookies are small text files stored on your device when you visit a website. They help the site remember your actions and preferences (like theme and language) over a period of time."
                },
                {
                    title: "Essential Cookies",
                    icon: <ShieldCheck className="size-6" />,
                    content: "These cookies are necessary for the website to function. We use them primarily to store your language preference (SV, FI, EN) and your theme choice (Light/Dark mode)."
                },
                {
                    title: "Analytics",
                    icon: <Settings className="size-6" />,
                    content: "We may use basic analytics to understand how many people visit the map. This data is anonymized and helps us improve the user experience for everyone."
                },
                {
                    title: "Your Choices",
                    icon: <HelpCircle className="size-6" />,
                    content: "You can control or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed."
                }
            ]
        },
        sv: {
            title: "Cookiepolicy",
            lastUpdated: "Senast uppdaterad: 5 februari 2026",
            intro: "Vi använder cookies för att förbättra din upplevelse på vår karta. Denna policy beskriver vad cookies är, hur vi använder dem och hur du kan hantera dina inställningar.",
            sections: [
                {
                    title: "Vad är Cookies?",
                    icon: <Cookie className="size-6" />,
                    content: "Cookies är små textfiler som lagras på din enhet när du besöker en webbplats. De hjälper webbplatsen att komma ihåg dina val och inställningar (som tema och språk) under en period."
                },
                {
                    title: "Nödvändiga Cookies",
                    icon: <ShieldCheck className="size-6" />,
                    content: "Dessa cookies är nödvändiga för att webbplatsen ska fungera. Vi använder dem främst för att lagra dina språkinställningar (SV, FI, EN) och ditt val av tema (Ljust/Mörkt läge)."
                },
                {
                    title: "Analys",
                    icon: <Settings className="size-6" />,
                    content: "Vi kan komma att använda grundläggande analys för att förstå hur många som besöker kartan. Denna data är anonymiserad och hjälper oss att förbättra användarupplevelsen för alla."
                },
                {
                    title: "Dina Val",
                    icon: <HelpCircle className="size-6" />,
                    content: "Du kan kontrollera eller radera cookies som du vill. Du kan radera alla cookies som redan finns på din dator och du kan ställa in de flesta webbläsare så att de förhindrar att de placeras."
                }
            ]
        },
        fi: {
            title: "Evästekäytäntö",
            lastUpdated: "Viimeksi päivitetty: 5. helmikuuta 2026",
            intro: "Käytämme evästeitä parantaaksemme kokemustasi kartallamme. Tämä käytäntö kuvaa, mitä evästeet ovat, miten käytämme niitä ja miten voit hallita asetuksiasi.",
            sections: [
                {
                    title: "Mitä evästeet ovat?",
                    icon: <Cookie className="size-6" />,
                    content: "Evästeet ovat pieniä tekstitiedostoja, joita tallennetaan laitteellesi, kun vierailet verkkosivustolla. Ne auttavat sivustoa muistamaan toimintasi ja asetuksesi (kuten teeman ja kielen) tietyn ajan kuluessa."
                },
                {
                    title: "Välttämättömät evästeet",
                    icon: <ShieldCheck className="size-6" />,
                    content: "Nämä evästeet ovat välttämättömiä verkkosivuston toiminnalle. Käytämme niitä ensisijaisesti kieliasetustesi (SV, FI, EN) ja teemavalintasi (vaalea/tumma tila) tallentamiseen."
                },
                {
                    title: "Analytiikka",
                    icon: <Settings className="size-6" />,
                    content: "Saatamme käyttää perusanalyysiä ymmärtääksemme, kuinka monta ihmistä vierailee kartalla. Nämä tiedot ovat anonymisoituja ja auttavat meitä parantamaan käyttökokemusta kaikille."
                },
                {
                    title: "Valintasi",
                    icon: <HelpCircle className="size-6" />,
                    content: "Voit hallita tai poistaa evästeitä haluamallasi tavalla. Voit poistaa kaikki tietokoneellasi jo olevat evästeet ja asettaa useimmat selaimet estämään niiden asettamisen."
                }
            ]
        }
    }[lang];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-100/30 dark:bg-slate-800 rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight uppercase">
                        {lang === 'sv' ? 'Cookie' : lang === 'fi' ? 'Eväste' : 'Cookie'} <br />
                        <span className="text-primary italic">{lang === 'sv' ? 'policy' : lang === 'fi' ? 'käytäntö' : 'Policy'}</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-12 uppercase tracking-widest text-sm">
                        {t.lastUpdated}
                    </p>

                    <div className="p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl mb-16">
                        <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-slate-700 dark:text-slate-300">
                            "{t.intro}"
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {t.sections.map((section, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl"
                            >
                                <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-800 text-primary flex items-center justify-center mb-8">
                                    {section.icon}
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4 text-slate-900 dark:text-white">
                                    {section.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
