import React, { useState, useEffect } from 'react';
import { LanguageCode } from '../types';
import { motion } from 'framer-motion';
import { Download, ChevronRight, BookOpen, Clock, Heart, Award, ArrowDownToLine, Flame, Snowflake } from 'lucide-react';
import { cn } from '../lib/utils';
import { COMPARATIVE_REPORT_DATA } from '../comparativeReportData';

interface ComparativeReportPageProps {
    lang: LanguageCode;
}

export const ComparativeReportPage = ({ lang }: ComparativeReportPageProps) => {
    const [activeSection, setActiveSection] = useState('intro');

    const sections = [
        { id: 'intro', label: { en: 'Introduction', fi: 'Johdanto', sv: 'Introduktion' } },
        { id: 'history', label: { en: 'Historical Background', fi: 'Historiallinen Tausta', sv: 'Historisk Bakgrund' } },
        { id: 'swedish', label: { en: 'Swedish Sauna Culture', fi: 'Ruotsalainen Bastukulttuuri', sv: 'Svensk Bastukultur' } },
        { id: 'finnish', label: { en: 'Finnish Sauna Culture', fi: 'Suomalainen Saunakulttuuri', sv: 'Finsk Saunakultur' } },
        { id: 'comparison', label: { en: 'Comparative Analysis', fi: 'Vertailuanalyysi', sv: 'Jämförande Analys' } },
        { id: 'future', label: { en: 'The Future & Conclusion', fi: 'Tulevaisuus & Johtopäätökset', sv: 'Framtid & Slutsatser' } }
    ];

    const t = {
        en: {
            title: "Comparative Report",
            subtitle: "Swedish & Finnish Sauna Culture",
            downloadBtn: "Download PDF Report",
            toc: "Table of Contents",
            similarities: "Key Similarities",
            differences: "Core Differences",
            architecture: "Architectural Styles",
            rituals: "Rituals & Practices",
            socialRole: "Societal Roles",
            healthBenefits: "Health Benefits",
            swedishSauna: "Swedish Bastu",
            finnishSauna: "Finnish Sauna"
        },
        fi: {
            title: "Vertailuraportti",
            subtitle: "Ruotsalainen & Suomalainen Saunakulttuuri",
            downloadBtn: "Lataa PDF-raportti",
            toc: "Sisällysluettelo",
            similarities: "Keskeiset Samankaltaisuudet",
            differences: "Keskeiset Erot",
            architecture: "Arkkitehtuuriset Tyylit",
            rituals: "Rituaalit & Käytännöt",
            socialRole: "Sosiaaliset Roolit",
            healthBenefits: "Terveyshyödyt",
            swedishSauna: "Ruotsalainen Bastu",
            finnishSauna: "Suomalainen Sauna"
        },
        sv: {
            title: "Jämförande Rapport",
            subtitle: "Svensk & Finsk Bastukultur",
            downloadBtn: "Ladda ner PDF-rapport",
            toc: "Innehållsförteckning",
            similarities: "Viktiga Likheter",
            differences: "Huvudsakliga Skillnader",
            architecture: "Arkitektoniska Stilar",
            rituals: "Ritualer & Rutiner",
            socialRole: "Samhälleliga Roller",
            healthBenefits: "Hälsofördelar",
            swedishSauna: "Svensk Bastu",
            finnishSauna: "Finsk Sauna"
        }
    }[lang] || {
        title: "Comparative Report",
        subtitle: "Sauna Cultures",
        downloadBtn: "Download PDF",
        toc: "Contents",
        similarities: "Similarities",
        differences: "Differences",
        architecture: "Architecture",
        rituals: "Rituals",
        socialRole: "Social Role",
        healthBenefits: "Health",
        swedishSauna: "Swedish Bastu",
        finnishSauna: "Finnish Sauna"
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;
            for (const section of sections) {
                const el = document.getElementById(section.id);
                if (el) {
                    const top = el.offsetTop;
                    const height = el.offsetHeight;
                    if (scrollPosition >= top && scrollPosition < top + height) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 120,
                behavior: 'smooth'
            });
            setActiveSection(id);
        }
    };

    const report = COMPARATIVE_REPORT_DATA[lang] || COMPARATIVE_REPORT_DATA['en'];

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-30">
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[40%] bg-blue-50/40 rounded-full blur-3xl" />
                <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[55%] bg-sky-50/40 rounded-full blur-3xl" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                {/* Header Banner */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 border-b border-slate-100 dark:border-slate-800 pb-12">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-block px-4 py-1.5 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-black tracking-[0.3em] uppercase"
                        >
                            {t.subtitle}
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none"
                        >
                            {t.title}
                        </motion.h1>
                    </div>

                    <motion.a
                        href="/Comparative_Report_Sauna_Culture.pdf"
                        download="Comparative_Report_Sauna_Culture.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        <ArrowDownToLine className="size-4 animate-bounce" />
                        {t.downloadBtn}
                    </motion.a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
                    {/* Left Sticky Table of Contents */}
                    <div className="hidden lg:block lg:sticky lg:top-28 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none">
                        <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.25em] mb-6 flex items-center gap-2">
                            <BookOpen className="size-4 text-primary" />
                            {t.toc}
                        </h3>
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => scrollTo(section.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border border-transparent",
                                        activeSection === section.id
                                            ? "bg-primary/5 text-primary border-primary/10 pl-6"
                                            : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white"
                                    )}
                                >
                                    <span>{(section.label as any)[lang]}</span>
                                    {activeSection === section.id && <ChevronRight className="size-3.5 text-primary" />}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-3 space-y-24">
                        {/* 1. Introduction */}
                        <section id="intro" className="scroll-mt-32 space-y-6">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                                {(sections[0].label as any)[lang]}
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-light leading-relaxed space-y-4">
                                {report.intro.paragraphs.map((p, idx) => (
                                    <p key={idx}>{p}</p>
                                ))}
                                <div className="p-8 bg-slate-900 text-white rounded-[2rem] border border-slate-800 relative overflow-hidden group my-8">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{report.purposeTitle}</h4>
                                    <p className="text-lg font-light leading-relaxed relative z-10 m-0">
                                        {report.purposeText}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 2. Historical Background */}
                        <section id="history" className="scroll-mt-32 space-y-6">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                                {(sections[1].label as any)[lang]}
                            </h2>
                             <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-100 mb-8 border border-slate-200">
                                <img src="/traditional_sauna_lake.png" className="w-full h-full object-cover" alt="Traditional log sauna by the lake" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Flame className="size-4 text-orange-500" /> {report.history.swedishTitle}</h3>
                                    <p>
                                        {report.history.swedishText}
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5"><Award className="size-4 text-primary" /> {report.history.finnishTitle}</h3>
                                    <p>
                                        {report.history.finnishText}
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 3. Swedish Sauna Culture */}
                        <section id="swedish" className="scroll-mt-32 space-y-6">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                                {(sections[2].label as any)[lang]}
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-light leading-relaxed space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
                                    {report.swedish.cards?.map((card, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-[2rem] shadow-lg">
                                            <h4 className="font-black text-sm text-slate-950 dark:text-white uppercase mb-2">{card.title}</h4>
                                            <p className="text-xs m-0 font-light">{card.text}</p>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-8">{report.swedish.practicesTitle}</h3>
                                <p>{report.swedish.practicesText1}</p>
                                <p>{report.swedish.practicesText2}</p>

                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-8">{report.swedish.socialTitle}</h3>
                                <p>{report.swedish.socialText}</p>
                            </div>
                        </section>

                        {/* 4. Finnish Sauna Culture */}
                        <section id="finnish" className="scroll-mt-32 space-y-6">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                                {(sections[3].label as any)[lang]}
                            </h2>
                            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-100 mb-8 border border-slate-200">
                                <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Steam inside a sauna room" />
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-light leading-relaxed space-y-6">
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-8">{report.finnish.steamTitle}</h3>
                                <p>{report.finnish.steamText1}</p>
                                <p>{report.finnish.steamText2}</p>

                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-8">{report.finnish.equalityTitle}</h3>
                                <p>{report.finnish.equalityText}</p>
                            </div>
                        </section>

                        {/* 5. Comparative Analysis */}
                        <section id="comparison" className="scroll-mt-32 space-y-8">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                                {(sections[4].label as any)[lang]}
                            </h2>

                            {/* Similarities Card */}
                            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                    <Heart className="size-5 text-red-500" />
                                    {report.similarities.title}
                                </h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-600 dark:text-slate-400 font-light leading-relaxed list-none p-0 m-0">
                                    {report.similarities.items.map((item, idx) => (
                                        <li key={idx} className="space-y-1 border-l-2 border-primary/20 pl-4">
                                            <strong className="text-slate-900 dark:text-white text-xs font-black uppercase tracking-wider block">{item.title}</strong>
                                            <span className="text-sm">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Differences Table */}
                            <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-none space-y-6">
                                <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                    <Snowflake className="size-5 text-sky-500" />
                                    {report.differences.title}
                                </h3>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider w-1/4">{report.differences.headers[0]}</th>
                                                <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider w-3/8">{report.differences.headers[1]}</th>
                                                <th className="py-4 text-[10px] font-black uppercase text-slate-400 tracking-wider w-3/8">{report.differences.headers[2]}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                            {report.differences.rows.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td className="py-4 font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">{row.label}</td>
                                                    <td className="py-4 text-xs font-light text-slate-600 dark:text-slate-400 pr-6">{row.swedish}</td>
                                                    <td className="py-4 text-xs font-light text-slate-600 dark:text-slate-400 pr-6">{row.finnish}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* 6. Future and Conclusion */}
                        <section id="future" className="scroll-mt-32 space-y-6">
                            <h2 className="text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
                                {(sections[5].label as any)[lang]}
                            </h2>
                            <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden bg-slate-100 mb-8 border border-slate-200">
                                <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200" className="w-full h-full object-cover" alt="Modern luxury spa area" />
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-light leading-relaxed space-y-4">
                                {report.future.paragraphs.map((p, idx) => (
                                    <p key={idx}>{p}</p>
                                ))}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-slate-100 dark:border-slate-800">
                                    <div className="space-y-2">
                                        <h4 className="font-black text-sm text-slate-950 dark:text-white uppercase">{report.future.swedenSummaryTitle}</h4>
                                        <p className="text-sm font-light leading-relaxed">
                                            {report.future.swedenSummaryText}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-black text-sm text-slate-950 dark:text-white uppercase">{report.future.finlandSummaryTitle}</h4>
                                        <p className="text-sm font-light leading-relaxed">
                                            {report.future.finlandSummaryText}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-12 p-8 md:p-10 rounded-[2.5rem] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl shadow-primary/5">
                                    <div className="space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary">PDF Document • 21.5 MB</span>
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                            {lang === 'sv' ? 'Fullständig jämförande rapport' : lang === 'fi' ? 'Täydellinen vertailuraportti' : 'Complete Comparative Report'}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-light max-w-lg m-0">
                                            {lang === 'sv' 
                                                ? 'Ladda ner hela rapporten i PDF-format för offline-läsning, utskrift eller arkivering.' 
                                                : lang === 'fi' 
                                                    ? 'Lataa koko raportti PDF-muodossa offline-lukemista, tulostamista tai arkistointia varten.' 
                                                    : 'Download the full report in high-resolution PDF format for offline reading, printing, or archival.'}
                                        </p>
                                    </div>
                                    <a
                                        href="/Comparative_Report_Sauna_Culture.pdf"
                                        download="Comparative_Report_Sauna_Culture.pdf"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="shrink-0 flex items-center gap-3 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        <ArrowDownToLine className="size-4" />
                                        {t.downloadBtn}
                                    </a>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

