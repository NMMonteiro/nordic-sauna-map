import { LanguageCode } from '../types';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { Globe, Mail, Phone, ExternalLink, ShieldCheck, PlusCircle } from 'lucide-react';

interface PartnersPageProps {
    lang: LanguageCode;
}

export const PartnersPage = ({ lang }: PartnersPageProps) => {
    const t = {
        en: {
            title: "Our Network",
            subtitle: "Project Consortium",
            learnmera: {
                name: "Learnmera / Finland",
                description: "Learnmera is a private language education and translation provider located in the greater Helsinki area. They offer a variety of services, including language instruction, translation, marketing, and educational resource development.",
                services: [
                    { title: "Language Instruction", content: "Expert business language lessons in major Nordic and European languages." },
                    { title: "Translation & Marketing", content: "Effective cross-cultural communication for global organizations." },
                    { title: "Educational Resources", content: "Vast experience in creating trilingual cultural and pedagogical materials." },
                    { title: "Digital Solutions", content: "Development of web portals, benchmarking tools, and mobile applications." }
                ],
                trackRecord: "Personal have worked on over 60 EU projects, managing platforms with over 35,000 global educators."
            },
            bcreative: {
                name: "B-Creative / Sweden",
                intro: "B-Creative develops advanced courses, events, and workshops focusing on language learning, virtual travel, and cultural concepts with a vast European network.",
                experience: "Decades of involvement in EU-projects focused on lifelong learning, social exclusion, and vocational training for disadvantaged groups."
            }
        },
        fi: {
            title: "Kumppanimme",
            subtitle: "Projektin Konsortio",
            learnmera: {
                name: "Learnmera / Suomi",
                description: "Learnmera on yksityinen kielikoulutuksen ja käännöspalveluiden tarjoaja Helsingistä, erikoistuen opetusresurssien kehittämiseen.",
                services: [
                    { title: "Kieltenopetus", content: "Liike-elämän kieltenopetusta tärkeimmissä pohjoismaisissa kielissä." },
                    { title: "Käännöspalvelut", content: "Tehokasta viestintää yrityksille ja organisaatioille." },
                    { title: "Opetusresurssit", content: "Laaja kokemus kolmikielisten materiaalien luomisesta." },
                    { title: "Digitaaliset Ratkaisut", content: "Verkkosivujen, pelien ja mobiilisovellusten kehittäminen." }
                ],
                trackRecord: "Henkilöstö on työskennellyt yli 60 kansainvälisessä hankkeessa ja hallinnoi 35 000 opettajan verkostoa."
            },
            bcreative: {
                name: "B-Creative / Ruotsi",
                intro: "B-Creative kehittää kursseja ja työpajoja kielten oppimisesta ja kulttuurikonsepteista laajassa eurooppalaisessa verkostossa.",
                experience: "Pitkäaikainen kokemus EU-hankkeista, jotka keskittyvät elinikäiseen oppimiseen ja sosiaaliseen osallisuuteen."
            }
        },
        sv: {
            title: "Vårt Nätverk",
            subtitle: "Projektkonsortium",
            learnmera: {
                name: "Learnmera / Finland",
                description: "Learnmera är en privat språkutbildnings- och översättningsleverantör som erbjuder språkundervisning och utveckling av utbildningsresurser.",
                services: [
                    { title: "Språkundervisning", content: "Språklektioner för företag i de viktigaste nordiska språken." },
                    { title: "Översättningstjänster", content: "Effektiv kommunikation för internationella organisationer." },
                    { title: "Utbildningsresurser", content: "Stor erfarenhet av att skapa trespråkigt pedagogiskt material." },
                    { title: "Digitala Lösningar", content: "Utveckling av webbportaler, benchmarkingverktyg och mobilappar." }
                ],
                trackRecord: "Personal som arbetat med över 60 EU-projekt och förvaltar plattformar med 35 000 lärare."
            },
            bcreative: {
                name: "B-Creative / Sverige",
                intro: "B-Creative utvecklar kurser och workshops inom språkinlärning och kulturella koncept med ett stort nätverk i Europa.",
                experience: "Involverad i EU-projekt med fokus på livslångt lärande, social utestängning och yrkesutbildning för vuxna."
            }
        }
    }[lang] || {
        title: "Our Network",
        subtitle: "Partners",
        learnmera: { name: "", description: "", services: [], trackRecord: "" },
        bcreative: { name: "", intro: "", experience: "" }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    } as const;

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { type: "spring", stiffness: 100 }
        }
    } as const;

    return (
        <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-40">
                <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] bg-blue-50/50 rounded-full" />
                <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/40 rounded-full" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-32">
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

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-40"
                >
                    {/* Learnmera Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-5 space-y-10 sticky top-32">
                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center">
                                    <img src="/Learnmera logo FB_no Bkg.png" alt="Learnmera" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                    {t.learnmera.name.split(' / ')[0]} <br />
                                    <span className="text-primary text-xl font-bold tracking-[0.2em]">{t.learnmera.name.split(' / ')[1]}</span>
                                </h2>
                            </div>

                            <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                                {t.learnmera.description}
                            </p>

                            <div className="flex flex-col gap-6 pt-10 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4 group">
                                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                                        <Mail className="size-5" />
                                    </div>
                                    <a href="mailto:veronica@learnmera.com" className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">veronica@learnmera.com</a>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                                        <ExternalLink className="size-5" />
                                    </div>
                                    <a href="https://learnmera.com/" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">learnmera.com</a>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {t.learnmera.services.map((service, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/30 dark:shadow-none transition-all group"
                                >
                                    <div className="size-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 mb-6 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PlusCircle className="size-5" />
                                    </div>
                                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white mb-3 uppercase tracking-[0.2em]">{service.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-light leading-relaxed">{service.content}</p>
                                </motion.div>
                            ))}

                            <div className="md:col-span-2 p-12 bg-slate-900 rounded-[4rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative z-10 flex items-start gap-8">
                                    <ShieldCheck className="size-12 text-blue-400 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mb-4">Enterprise Status</p>
                                        <p className="text-xl md:text-2xl font-light leading-snug opacity-90">
                                            {t.learnmera.trackRecord}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* B-Creative Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-5 space-y-10 lg:order-2 sticky top-32">
                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-slate-50 dark:bg-slate-800 rounded-3xl p-4 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-center justify-center">
                                    <img src="/Gemini_Generated_Image_4638o4638o4638o4.png" alt="B-Creative" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                    {t.bcreative.name.split(' / ')[0]} <br />
                                    <span className="text-primary text-xl font-bold tracking-[0.2em]">{t.bcreative.name.split(' / ')[1]}</span>
                                </h2>
                            </div>

                            <p className="text-xl text-slate-500 dark:text-slate-400 font-light leading-relaxed">
                                {t.bcreative.intro}
                            </p>
                        </div>

                        <div className="lg:col-span-7 lg:order-1">
                            <div className="p-16 bg-blue-50/50 dark:bg-slate-900/50 rounded-[4rem] border border-blue-100 dark:border-slate-800 shadow-2xl shadow-blue-200/20 dark:shadow-none relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="relative z-10 max-w-2xl">
                                    <p className="text-2xl md:text-4xl font-light text-slate-800 dark:text-slate-100 leading-[1.3] tracking-tight">
                                        {t.bcreative.experience}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};
