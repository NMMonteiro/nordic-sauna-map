import React from 'react';
import { LanguageCode } from '../types';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, ScrollText } from 'lucide-react';

interface PrivacyPolicyPageProps {
    lang: LanguageCode;
}

export const PrivacyPolicyPage = ({ lang }: PrivacyPolicyPageProps) => {
    const t = {
        en: {
            title: "Privacy Policy",
            lastUpdated: "Last updated: February 5, 2026",
            intro: "At Nordic Sauna Map, we are committed to protecting your personal data and your privacy. This policy explains how we handle your information when you use our heritage platform.",
            sections: [
                {
                    title: "Information We Collect",
                    icon: <Eye className="size-6" />,
                    content: "We collect minimal information necessary for our project: Email addresses for newsletter subscribers, and names/emails for contributors who submit saunas or blog posts. We also collect location data and photos you voluntarily share as part of the heritage mapping."
                },
                {
                    title: "How We Use Data",
                    icon: <Lock className="size-6" />,
                    content: "Your data is used solely to maintain the Nordic Sauna Map, provide updates via our newsletter, and attribute credit to our cultural contributors. We never sell your data to third parties."
                },
                {
                    title: "Your Rights",
                    icon: <Shield className="size-6" />,
                    content: "In accordance with GDPR, you have the right to access, correct, or delete your data at any time. You can unsubscribe from our newsletter using the link in any email."
                },
                {
                    title: "Data Storage",
                    icon: <ScrollText className="size-6" />,
                    content: "We use Supabase (a secure cloud database) to store our records. Your data is protected by industry-standard encryption and security protocols."
                }
            ]
        },
        sv: {
            title: "Integritetspolicy",
            lastUpdated: "Senast uppdaterad: 5 februari 2026",
            intro: "På Nordic Sauna Map är vi måna om att skydda dina personuppgifter och din integritet. Denna policy förklarar hur vi hanterar din information när du använder vår plattform.",
            sections: [
                {
                    title: "Information Vi Samlar In",
                    icon: <Eye className="size-6" />,
                    content: "Vi samlar in minimalt med information som är nödvändig för vårt projekt: E-postadresser för nyhetsbrevsprenumeranter, samt namn/e-post för bidragsgivare som skickar in bastur eller blogginlägg. Vi samlar även in platsdata och foton som du frivilligt delar som en del av kulturarvskartläggningen."
                },
                {
                    title: "Hur Vi Använder Data",
                    icon: <Lock className="size-6" />,
                    content: "Dina uppgifter används enbart för att underhålla Nordic Sauna Map, tillhandahålla uppdateringar via vårt nyhetsbrev och ge erkännande till våra kulturella bidragsgivare. Vi säljer aldrig dina uppgifter till tredje part."
                },
                {
                    title: "Dina Rättigheter",
                    icon: <Shield className="size-6" />,
                    content: "I enlighet med GDPR har du rätt att när som helst få tillgång till, korrigera eller radera dina uppgifter. Du kan avsluta din prenumeration på vårt nyhetsbrev via länken i valfritt e-postmeddelande."
                },
                {
                    title: "Datalagring",
                    icon: <ScrollText className="size-6" />,
                    content: "Vi använder Supabase (en säker molndatabas) för att lagra våra register. Dina uppgifter skyddas av industristandard kryptering och säkerhetsprotokoll."
                }
            ]
        },
        fi: {
            title: "Tietosuojaseloste",
            lastUpdated: "Viimeksi päivitetty: 5. helmikuuta 2026",
            intro: "Nordic Sauna Mapissa olemme sitoutuneet suojaamaan henkilötietojasi ja yksityisyyttäsi. Tämä seloste selittää, miten käsittelemme tietojasi, kun käytät perintöalustaamme.",
            sections: [
                {
                    title: "Keräämämme Tiedot",
                    icon: <Eye className="size-6" />,
                    content: "Keräämme vain hankkeemme kannalta välttämättömät tiedot: Uutiskirjeen tilaajien sähköpostiosoitteet sekä saunoja tai blogikirjoituksia lähettävien avustajien nimet/sähköpostiosoitteet. Keräämme myös sijaintitietoja ja valokuvia, joita jaat vapaaehtoisesti osana perinnön kartoitusta."
                },
                {
                    title: "Miten Käytämme Tietoja",
                    icon: <Lock className="size-6" />,
                    content: "Tietojasi käytetään ainoastaan Nordic Sauna Mapin ylläpitämiseen, päivitysten tarjoamiseen uutiskirjeemme kautta ja tunnustuksen antamiseen kulttuurisille avustajillemme. Emme koskaan myy tietojasi kolmansille osapuolille."
                },
                {
                    title: "Oikeutesi",
                    icon: <Shield className="size-6" />,
                    content: "GDPR:n mukaisesti sinulla on oikeus tarkastella, korjata tai poistaa tietosi milloin tahansa. Voit peruuttaa uutiskirjeemme tilauksen minkä tahansa sähköpostiviestin linkistä."
                },
                {
                    title: "Tietojen Säilytys",
                    icon: <ScrollText className="size-6" />,
                    content: "Käytämme Supabasea (turvallinen pilvitietokanta) rekistereidemme säilyttämiseen. Tietosi on suojattu alan standardien mukaisella salauksella ja tietoturvakäytännöillä."
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
                        {lang === 'sv' ? 'Integritets' : lang === 'fi' ? 'Tietosuoja' : 'Privacy'} <br />
                        <span className="text-primary italic">{lang === 'sv' ? 'policy' : lang === 'fi' ? 'seloste' : 'Policy'}</span>
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

                    <div className="mt-24 p-12 bg-slate-900 rounded-[3rem] text-center">
                        <h2 className="text-2xl font-black text-white uppercase mb-4">Questions?</h2>
                        <p className="text-slate-400 mb-8">Contact us at info@nordicsaunamap.com</p>
                        <a href="mailto:info@nordicsaunamap.com" className="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-bold uppercase tracking-wider text-sm hover:scale-105 transition-transform">
                            Send Email
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
