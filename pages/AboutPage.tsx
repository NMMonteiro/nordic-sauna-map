import React from 'react';
import { LanguageCode } from '../types';

interface AboutPageProps {
    lang: LanguageCode;
}

export const AboutPage = ({ lang }: AboutPageProps) => {
    const t = {
        en: {
            title: "Our project",
            subtitle: "About the project",
            aim: "The overall aim of the project is to preserve and promote sauna and winter bathing culture as a living part of Nordic cultural heritage. Through digital and educational methods, authentic audio and visual experiences, and trilingual educational materials, the project aims to inspire cross-border learning between Finland and Sweden.",
            resultsTitle: "Project results",
            results: [
                "An interactive sauna map with search and filter functions where users can discover saunas in Sweden and Finland, read short texts, view photos, listen to audio clips and read quotes from sauna owners and winter bathers.",
                "Trilingual lesson plans in PDF and web-based formats, freely available to teachers.",
                "A comparative report in PDF and interactive versions with image and audio examples."
            ]
        },
        fi: {
            title: "Projektimme",
            subtitle: "Tietoa projektista",
            aim: "Hankkeen yleisenä tavoitteena on säilyttää ja edistää sauna- ja talvikylpykulttuuria osana pohjoismaista kulttuuriperintöä. Digitaalisten ja pedagogisten menetelmien, aitojen ääni- ja kuvakokemusten sekä kolmikielisten oppimateriaalien avulla hanke pyrkii inspiroimaan rajat ylittävää oppimista Suomen ja Ruotsin välillä.",
            resultsTitle: "Projektin tulokset",
            results: [
                "Interaktiivinen saunakartta, jossa on haku- ja suodatustoiminnot ja jonka avulla käyttäjät voivat etsiä saunoja Ruotsista ja Suomesta, lukea lyhyitä tekstejä, katsella valokuvia, kuunnella äänitteitä ja lukea saunanomistajien ja talvikylpijöiden kommentteja.",
                "Kolmikieliset oppituntisuunnitelmat PDF- ja verkkomuodossa, vapaasti opettajien käytettävissä.",
                "Vertailuraportti PDF- ja interaktiivisessa muodossa, jossa on kuva- ja ääniesimerkkejä."
            ]
        },
        sv: {
            title: "Vårt projekt",
            subtitle: "Om projektet",
            aim: "Projektets övergripande mål är att bevara och tillgängliggöra bastu- och vinterbadkulturen som en levande del av det nordiska kulturarvet. Genom digitala och pedagogiska metoder, autentiska ljud- och bildupplevelser och trespråkigt utbildningsmaterial ska projektet inspirera till gränsöverskridande lärande mellan Finland och Sverige.",
            resultsTitle: "Projektresultat:",
            results: [
                "Interaktiv bastukarta med sök- och filtreringsfunktioner där användare kan upptäcka bastur i Sverige och Finland, läsa korta texter, se foton, lyssna på ljudklipp och ta del av citat från bastuägare och vinterbadare.",
                "Trespråkiga lektionsplaner i PDF- och webbaserat format, fritt tillgängliga för lärare.",
                "En jämförande rapporten som PDF och som interaktiv version med bild- och ljudexempel."
            ]
        }
    }[lang];

    return (
        <div className="min-h-screen bg-snow pt-32 pb-24">
            <div className="max-w-[1000px] mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-20">
                    <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-primary/20 text-primary text-[10px] font-black tracking-[0.2em] uppercase bg-primary/5">
                        {t.subtitle}
                    </span>
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight uppercase">
                        {t.title}
                    </h1>
                </div>

                <div className="space-y-20">
                    <section className="p-10 md:p-16 bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        <p className="text-2xl md:text-3xl text-slate-800 leading-relaxed font-light relative z-10">
                            {t.aim}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-black text-slate-900 mb-12 uppercase tracking-tight flex items-center gap-4">
                            <span className="w-12 h-1 bg-primary rounded-full"></span>
                            {t.resultsTitle}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {t.results.map((result, i) => (
                                <div key={i} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-all duration-300">
                                    <div className="size-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined font-bold">
                                            {i === 0 ? 'map' : i === 1 ? 'menu_book' : 'analytics'}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 leading-relaxed font-medium">
                                        {result}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};
