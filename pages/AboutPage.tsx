import { LanguageCode } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface AboutPageProps {
    lang: LanguageCode;
}

export const AboutPage = ({ lang }: AboutPageProps) => {
    const t = {
        en: {
            title: "Our Heritage",
            subtitle: "Project Mission",
            aim: "The overall aim of the project is to preserve and promote sauna and winter bathing culture as a living part of Nordic cultural heritage. Through digital and educational methods, authentic audio and visual experiences, and trilingual educational materials, the project aims to inspire cross-border learning between Finland and Sweden.",
            resultsTitle: "Core Deliverables",
            results: [
                "An interactive sauna map with search and filter functions where users can discover saunas in Sweden and Finland, read short texts, view photos, listen to audio clips and read quotes from sauna owners and winter bathers.",
                "Trilingual lesson plans in PDF and web-based formats, freely available to teachers.",
                "A comparative report in PDF and interactive versions with image and audio examples."
            ]
        },
        fi: {
            title: "Perintömme",
            subtitle: "Projektin Missio",
            aim: "Hankkeen yleisenä tavoitteena on säilyttää ja edistää sauna- ja talvikylpykulttuuria osana pohjoismaista kulttuuriperintöä. Digitaalisten ja pedagogisten menetelmien, aitojen ääni- ja kuvakokemusten sekä kolmikielisten oppimateriaalien avulla hanke pyrkii inspiroimaan rajat ylittävää oppimista Suomen ja Ruotsin välillä.",
            resultsTitle: "Projektin Tulokset",
            results: [
                "Interaktiivinen saunakartta, jossa on haku- ja suodatustoiminnot ja jonka avulla käyttäjät voivat etsiä saunoja Ruotsista ja Suomesta, lukea lyhyitä tekstejä, katsella valokuvia, kuunnella äänitteitä ja lukea saunanomistajien ja talvikylpijöiden kommentteja.",
                "Kolmikieliset oppituntisuunnitelmat PDF- ja verkkomuodossa, vapaasti opettajien käytettävissä.",
                "Vertailuraportti PDF- ja interaktiivisessa muodossa, jossa on kuva- ja ääniesimerkkejä."
            ]
        },
        sv: {
            title: "Vårt Arv",
            subtitle: "Projektets Mission",
            aim: "Projektets övergripande mål är att bevara och tillgängliggöra bastu- och vinterbadkulturen som en levande del av det nordiska kulturarvet. Genom digitala och pedagogiska metoder, autentiska ljud- och bildupplevelser och tresprågigt utbildningsmaterial ska projektet inspirera till gränsöverskridande lärande mellan Finland och Sverige.",
            resultsTitle: "Projektets Resultat",
            results: [
                "Interaktiv bastukarta med sök- och filtreringsfunktioner där användare kan upptäcka bastur i Sverige och Finland, läsa korta texter, se foton, lyssna på ljudklipp och ta del av citat från bastuägare och vinterbadare.",
                "Trespråkiga lektionsplaner i PDF- och webbaserat format, fritt tillgängliga för lärare.",
                "En jämförande rapporten som PDF och som interaktiv version med bild- och ljudexempel."
            ]
        }
    }[lang] || {
        title: "Our Heritage",
        subtitle: "Project Mission",
        aim: "The overall aim of the project is to preserve and promote sauna and winter bathing culture as a living part of Nordic cultural heritage.",
        resultsTitle: "Core Deliverables",
        results: []
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-40">
                <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full" />
                <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-sky-50/50 rounded-full" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 mb-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black tracking-[0.3em] uppercase"
                    >
                        {t.subtitle}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-9xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase leading-[0.85]"
                    >
                        {t.title.split(' ')[0]} <br />
                        <span className="text-primary italic">{t.title.split(' ')[1]}</span>
                    </motion.h1>
                </div>

                <div className="space-y-32">
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <div className="relative p-12 md:p-20 bg-slate-900 rounded-[4rem] text-white overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                            <p className="text-2xl md:text-4xl leading-[1.3] font-light relative z-10 tracking-tight">
                                {t.aim}
                            </p>
                        </div>
                    </motion.section>

                    <section>
                        <motion.h2
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-xs font-black text-slate-400 mb-16 uppercase tracking-[0.5em] text-center"
                        >
                            {t.resultsTitle}
                        </motion.h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {t.results.map((result, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-none hover:-translate-y-2 transition-all duration-500 group"
                                >
                                    <div className="size-16 rounded-[2rem] bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                        <span className="material-symbols-outlined text-2xl font-bold">
                                            {i === 0 ? 'map' : i === 1 ? 'school' : 'analytics'}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-light text-lg">
                                        {result}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
