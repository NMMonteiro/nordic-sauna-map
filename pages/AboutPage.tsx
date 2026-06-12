import React from 'react';
import { motion } from 'framer-motion';
import { LanguageCode } from '../types';
import { Globe, Users, GraduationCap } from 'lucide-react';

interface AboutPageProps {
    lang: LanguageCode;
}

export const AboutPage = ({ lang }: AboutPageProps) => {
    const t = {
        en: {
            title: "Project Identity",
            subtitle: "About Suomiportaat",
            mission: {
                title: "Empowering Through Language",
                text: "Suomiportaat project aims to empower young migrants in the capital area of Finland, primarily Arabic and Ukrainian speakers but also other migrants from other backgrounds, by providing free Finnish language workshops in a relaxed and informal setting. These workshops will focus on improving oral communication skills and fostering cultural integration. The project is funded by Finnish Cultural Foundation."
            },
            partners: {
                title: "Our Partners",
                list: [
                    { name: "Learning for Integration ry", desc: "An NGO working with language and education for migrants." },
                    { name: "Learnmera Oy", desc: "A professional language training company." },
                    { name: "Mirsal ry", desc: "An organisation supporting especially Arabic speakers in Finland." }
                ]
            },
            experience: {
                title: "The Workshop Experience",
                text: "Participants in the Suomiportaat Finnish workshops will not only learn practical Finnish but also gain valuable insights into Finnish culture. Workshops will cover a range of topics, from everyday conversations to important issues like multiculturalism, equality, and finding employment in Finland."
            },
            methodology: {
                title: "Tutors & Materials",
                text: "Experienced tutors will guide participants through interactive activities, discussions, and games using a variety of engaging materials, including flashcards, discussion cards, and digital tools. All materials will be available in Finnish, English, Arabic and Ukrainian, both online and in print."
            },
            vision: {
                title: "Our Vision",
                text: "This project seeks to address the growing need for accessible Finnish language learning opportunities among migrants. By improving their language skills, participants will be better equipped to integrate into Finnish society, pursue education, and enhance their employment prospects. Ultimately, this project aims to contribute to a more inclusive and integrated society where everyone has the opportunity to thrive."
            }
        },
        sv: {
            title: "Projektidentitet",
            subtitle: "Om Suomiportaat",
            mission: {
                title: "Stärka genom språk",
                text: "Suomiportaat-projektet syftar till att stärka unga migranter i huvudstadsregionen genom kostnadsfria finska språkvärkstäder i en avslappnad miljö. Finansierat av Finska kulturfonden."
            },
            partners: { title: "Våra partner", list: [] },
            experience: { title: "Workshoperfarenhet", text: "" },
            methodology: { title: "Handledare & material", text: "" },
            vision: { title: "Vår vision", text: "" }
        },
        fi: {
            title: "Projektin Identiteetti",
            subtitle: "Tietoa Suomiportaat-hankkeesta",
            mission: {
                title: "Voimaannuttamista kielen kautta",
                text: "Suomiportaat-hanke pyrkii voimaannuttamaan pääkaupunkiseudun nuoria maahanmuuttajia tarjoamalla ilmaisia suomen kielen työpajoja rennossa ympäristössä. Hanketta rahoittaa Suomen Kulttuurirahasto."
            },
            partners: { title: "Yhteistyökumppanit", list: [] },
            experience: { title: "Työpajakokemus", text: "" },
            methodology: { title: "Tuutorit & materiaalit", text: "" },
            vision: { title: "Visio", text: "" }
        },
        ar: {
            title: "هوية المشروع",
            subtitle: "حول Suomiportaat",
            mission: {
                title: "التمكين من خلال اللغة",
                text: "يهدف مشروع Suomiportaat إلى تمكين المهاجرين الشباب في منطقة العاصمة الفنلندية من خلال توفير ورش عمل مجانية للغة الفنلندية في بيئة مريحة. المشروع بتمويل من المؤسسة الثقافية الفنلندية."
            },
            partners: { title: "شركاؤنا", list: [] },
            experience: { title: "تجربة ورشة العمل", text: "" },
            methodology: { title: "المدربون والمواد", text: "" },
            vision: { title: "رؤيتنا", text: "" }
        },
        uk: {
            title: "Ідентичність проєкту",
            subtitle: "Про Suomiportaat",
            mission: {
                title: "Розширення можливостей через мову",
                text: "Проєкт Suomiportaat має на меті розширити можливості молодих мігрантів у столичному регіоні Фінляндії, надаючи безкоштовні воркшопи з фінської мови. Проєкт фінансується Фінським культурним фондом."
            },
            partners: { title: "Наші партнери", list: [] },
            experience: { title: "Досвід воркшопів", text: "" },
            methodology: { title: "Тютори та матеріали", text: "" },
            vision: { title: "Наше бачення", text: "" }
        }
    }[lang] || {
        title: "Project Identity",
        subtitle: "About Us",
        mission: { title: "", text: "" },
        partners: { title: "", list: [] },
        experience: { title: "", text: "" },
        methodology: { title: "", text: "" },
        vision: { title: "", text: "" }
    };

    return (
        <div className="min-h-screen bg-bg-surface text-text-main transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-40">
                <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[20%] left-[-10%] w-[40%] h-[40%] bg-indigo-50/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
                {/* Header */}
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 mb-8 rounded-full bg-bg-card border border-border-main text-text-muted text-xs font-semibold tracking-[0.3em] uppercase"
                    >
                        {t.subtitle}
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl md:text-9xl font-semibold text-text-main mb-8 tracking-tight uppercase leading-[0.85] font-display"
                    >
                        {t.title.split(' ')[0]} <br />
                        <span className="text-primary italic">{t.title.split(' ')[1]}</span>
                    </motion.h1>
                </div>

                <div className="space-y-40">
                    {/* Mission Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
                    >
                        <div className="relative p-12 md:p-20 bg-text-main rounded-[4rem] text-bg-surface overflow-hidden group shadow-2xl">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                            <h2 className="text-xs font-semibold uppercase tracking-[0.4em] mb-8 opacity-50 relative z-10">{t.mission.title}</h2>
                            <p className="text-2xl md:text-xl leading-[1.4] font-light relative z-10 tracking-tight">
                                {t.mission.text}
                            </p>
                        </div>
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-8 block">{t.partners.title}</h3>
                                <div className="grid grid-cols-1 gap-6">
                                    {t.partners.list.map((partner: any, i: number) => (
                                        <div key={i} className="p-8 bg-bg-card border border-border-main rounded-3xl hover:border-primary/30 transition-all group">
                                            <div className="font-display text-xl font-semibold mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">{partner.name}</div>
                                            <div className="text-text-muted text-sm font-medium">{partner.desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Features Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-12 md:p-16 bg-bg-card rounded-[4rem] border border-border-main flex flex-col justify-center">
                            <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-primary mb-10">{t.experience.title}</h2>
                            <p className="text-xl md:text-2xl text-text-main font-medium leading-relaxed font-body">
                                {t.experience.text}
                            </p>
                        </div>
                        <div className="p-12 md:p-16 bg-primary text-white rounded-[4rem] flex flex-col justify-center shadow-2xl shadow-primary/20">
                            <h2 className="text-xs font-semibold uppercase tracking-[0.4em] text-white/50 mb-10">{t.methodology.title}</h2>
                            <p className="text-xl md:text-2xl font-medium leading-relaxed font-body">
                                {t.methodology.text}
                            </p>
                        </div>
                    </section>

                    {/* Vision Footer */}
                    <motion.section
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-center max-w-4xl mx-auto py-20 border-t border-border-main"
                    >
                        <h2 className="text-xs font-semibold uppercase tracking-[0.5em] text-primary mb-12">{t.vision.title}</h2>
                        <p className="text-2xl md:text-2xl font-semibold text-text-main uppercase tracking-tight leading-[1.1] mb-12">
                            {t.vision.text}
                        </p>
                    </motion.section>
                </div>
            </div>
        </div>
    );
};
