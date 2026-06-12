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
            lfi: {
                name: "Learning for Integration ry",
                description: "Learning for Integration ry is an NGO dedicated to supporting migrants through language education and cultural exchange in Finland.",
                services: [
                    { title: "Language Education", content: "Developing innovative methods for teaching Finnish to migrants." },
                    { title: "Social Inclusion", content: "Creating platforms for intercultural dialogue and integration." },
                    { title: "NGO Expertise", content: "Decades of experience in managing educational projects for migrants." }
                ]
            },
            learnmera: {
                name: "Learnmera Oy",
                description: "Learnmera is a language training company specializing in professional and informal education resources and digital learning solutions.",
                services: [
                    { title: "Language Instruction", content: "Professional language coaching for businesses and individuals." },
                    { title: "Resource Development", content: "Creating high-quality pedagogical materials for language learners." },
                    { title: "Digital Learning", content: "Specialized in developing accessible online learning platforms." }
                ]
            },
            mirsal: {
                name: "Mirsal ry",
                description: "Mirsal ry is an organization supporting Arabic speakers in Finland, focusing on community building and integration services.",
                services: [
                    { title: "Arabic Community", content: "Providing direct support and resources for the Arabic-speaking population." },
                    { title: "Cultural Liaison", content: "Bridging cultural gaps between migrants and Finnish society." },
                    { title: "Integration Support", content: "Guidance and mentoring for successful integration in Finland." }
                ]
            }
        },
        fi: {
            title: "Verkostomme",
            subtitle: "Projektin Konsortio",
            lfi: {
                name: "Learning for Integration ry",
                description: "Learning for Integration ry on kansalaisjärjestö, joka on omistautunut maahanmuuttajien tukemiseen kielikoulutuksen ja kulttuurivaihdon kautta Suomessa.",
                services: [
                    { title: "Kielikoulutus", content: "Innovatiivisten menetelmien kehittäminen suomen kielen opetukseen." },
                    { title: "Sosiaalinen Osallisuus", content: "Alustojen luominen kulttuurienväliselle vuoropuhelulle." },
                    { title: "Järjestöosaaminen", content: "Vuosikymmenten kokemus maahanmuuttajien koulutusprojektien hallinnasta." }
                ]
            },
            learnmera: {
                name: "Learnmera Oy",
                description: "Learnmera on kielikoulutusyritys, joka on erikoistunut ammatillisiin ja epävirallisiin koulutusresursseihin sekä digitaalisiin oppimisratkaisuihin.",
                services: [
                    { title: "Kieltenopetus", content: "Ammatillista kieli-valmennusta yrityksille ja yksityishenkilöille." },
                    { title: "Resurssien Kehitys", content: "Korkealaatuisten pedagogisten materiaalien luominen." },
                    { title: "Digitaalinen Oppiminen", content: "Erikoistunut saavutettavien verkkofoorumien kehittämiseen." }
                ]
            },
            mirsal: {
                name: "Mirsal ry",
                description: "Mirsal ry on järjestö, joka tukee arabiankielisiä Suomessa keskittyen yhteisöllisyyteen ja integraatiopalveluihin.",
                services: [
                    { title: "Arabiyhteisö", content: "Suoran tuen ja resurssien tarjoaminen arabiankielisille." },
                    { title: "Kulttuurisilta", content: "Kulttuurierojen kaventaminen maahanmuuttajien ja suomalaisen yhteiskunnan välillä." },
                    { title: "Kotouttamistuki", content: "Ohjaus ja mentorointi onnistuneeseen kotoutumiseen Suomessa." }
                ]
            }
        },
        sv: {
            title: "Vårt Nätverk",
            subtitle: "Projektkonsortium",
            lfi: {
                name: "Learning for Integration ry",
                description: "Learning for Integration ry är en icke-vinstdrivande organisation dedikerad till att stödja migranter genom språkutbildning och kulturutbyte i Finland.",
                services: [
                    { title: "Språkutbildning", content: "Utveckling av innovativa metoder för undervisning i finska för migranter." },
                    { title: "Social Inkludering", content: "Skapa plattformar för interkulturell dialog och integration." },
                    { title: "NGO-Expertis", content: "Decennier av erfarenhet av att hantera utbildningsprojekt för migranter." }
                ]
            },
            learnmera: {
                name: "Learnmera Oy",
                description: "Learnmera är ett språkutbildningsföretag specialiserat på professionella och informella utbildningsresurser och digitala lärlösningar.",
                services: [
                    { title: "Språkundervisning", content: "Professionell språkcoachning för företag och individer." },
                    { title: "Resursutveckling", content: "Skapa högkvalitativt pedagogiskt material för språkinlärare." },
                    { title: "Digitalt Lärande", content: "Specialiserad på att utveckla tillgängliga lärplattformar online." }
                ]
            },
            mirsal: {
                name: "Mirsal ry",
                description: "Mirsal ry är en organisation som stöder arabisktalande i Finland, med fokus på gemenskapsbyggande och integrationstjänster.",
                services: [
                    { title: "Arabiska Gemenskapen", content: "Tillhandahålla direkt stöd och resurser för den arabisktalande befolkningen." },
                    { title: "Kulturkontakt", content: "Överbrygga kulturella klyftor mellan migranter och det finländska samhället." },
                    { title: "Integrationsstöd", content: "Vägledning och mentorskap för framgångsrik integration i Finland." }
                ]
            }
        },
        ar: {
            title: "شبكتنا",
            subtitle: "شركاء المشروع",
            lfi: {
                name: "Learning for Integration ry",
                description: "Learning for Integration ry هي منظمة غير حكومية مخصصة لدعم المهاجرين من خلال تعليم اللغة والتبادل الثقافي في فنلندا.",
                services: [
                    { title: "تعليم اللغة", content: "تطوير أساليب مبتكرة لتعليم اللغة الفنلندية للمهاجرين." },
                    { title: "الإدماج الاجتماعي", content: "إنشاء منصات للحوار بين الثقافات والاندماج." },
                    { title: "خبرة المنظمات غير الحكومية", content: "عقود من الخبرة في إدارة المشاريع التعليمية للمهاجرين." }
                ]
            },
            learnmera: {
                name: "Learnmera Oy",
                description: "Learnmera هي شركة تدريب لغوي متخصصة في موارد التعليم المهنية وغير الرسمية وحلول التعلم الرقمية.",
                services: [
                    { title: "تعليم اللغة", content: "تدريب لغوي احترافي للشركات والأفراد." },
                    { title: "تطوير الموارد", content: "إنشاء مواد تربوية عالية الجودة لمتعلمي اللغة." },
                    { title: "التعلم الرقمي", content: "متخصصون في تطوير منصات التعلم عبر الإنترنت سهلة الوصول." }
                ]
            },
            mirsal: {
                name: "Mirsal ry",
                description: "Mirsal ry هي منظمة تدعم المتحدثين بالعربية في فنلندا، وتركز على بناء المجتمع وخدمات الاندماج.",
                services: [
                    { title: "المجتمع العربي", content: "توفير الدعم المباشر والموارد للسكان الناطقين بالعربية." },
                    { title: "الاتصال الثقافي", content: "سد الفجوات الثقافية بين المهاجرين والمجتمع الفنلندي." },
                    { title: "دعم الاندماج", content: "التوجيه والارشاد من أجل دمج ناجح في فنلندا." }
                ]
            }
        },
        uk: {
            title: "Наша Мережа",
            subtitle: "Партнери Проекту",
            lfi: {
                name: "Learning for Integration ry",
                description: "Learning for Integration ry - це громадська організація, яка займається підтримкою мігрантів через мовну освіту та культурний обмін у Фінляндії.",
                services: [
                    { title: "Мовна освіта", content: "Розробка інноваційних методів викладання фінської мови мігрантам." },
                    { title: "Соціальна інклюзія", content: "Створення платформ для міжкультурного діалогу та інтеграції." },
                    { title: "Експертиза ГО", content: "Десятиліття досвіду в управлінні освітніми проектами для мігрантів." }
                ]
            },
            learnmera: {
                name: "Learnmera Oy",
                description: "Learnmera - це компанія з мовної підготовки, що спеціалізується на професійних та неформальних освітніх ресурсах та цифрових рішеннях для навчання.",
                services: [
                    { title: "Навчання мови", content: "Професійний мовний коучинг для бізнесу та приватних осіб." },
                    { title: "Розробка ресурсів", content: "Створення високоякісних педагогічних матеріалів для вивчення мови." },
                    { title: "Цифрове навчання", content: "Спеціалізація на розробці доступних онлайн-платформ для навчання." }
                ]
            },
            mirsal: {
                name: "Mirsal ry",
                description: "Mirsal ry - це організація, що підтримує арабомовних жителів Фінляндії, зосереджуючись на розбудові громади та послугах з інтеграції.",
                services: [
                    { title: "Арабська громада", content: "Надання прямої підтримки та ресурсів для арабомовного населення." },
                    { title: "Культурні зв'язки", content: "Подолання культурних розривів між мігрантами та фінським суспільством." },
                    { title: "Підтримка інтеграції", content: "Наставництво для успішної інтеграції у Фінляндії." }
                ]
            }
        }
    }[lang] || {
        title: "Our Network",
        subtitle: "Partners",
        lfi: { name: "", description: "", services: [] },
        learnmera: { name: "", description: "", services: [] },
        mirsal: { name: "", description: "", services: [] }
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
        <div className="min-h-screen bg-bg-surface text-text-main transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            {/* Pro Max Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden select-none opacity-40">
                <div className="absolute top-[-5%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/10 rounded-full blur-3xl" />
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
                        className="text-2xl md:text-9xl font-semibold text-text-main mb-8 tracking-tight uppercase leading-[0.85]"
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
                    {/* Learning for Integration Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-32">
                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-bg-card rounded-3xl p-4 shadow-xl border border-border-main flex items-center justify-center">
                                    <Globe className="size-10 text-primary" />
                                </div>
                                <h2 className="text-2xl font-semibold text-text-main uppercase tracking-tight leading-none">
                                    {t.lfi.name}
                                </h2>
                            </div>

                            <p className="text-xl text-text-muted font-light leading-relaxed">
                                {t.lfi.description}
                            </p>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {t.lfi.services.map((service, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-10 bg-bg-card rounded-[3rem] border border-border-main shadow-lg transition-all group"
                                >
                                    <div className="size-12 rounded-2xl bg-bg-surface text-text-muted mb-6 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PlusCircle className="size-5" />
                                    </div>
                                    <h3 className="text-xs font-semibold text-text-main mb-3 uppercase tracking-[0.2em]">{service.title}</h3>
                                    <p className="text-text-muted font-light leading-relaxed">{service.content}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Learnmera Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-32 lg:order-2">
                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-bg-card rounded-3xl p-4 shadow-xl border border-border-main flex items-center justify-center">
                                    <img src="/Learnmera logo FB_no Bkg.png" alt="Learnmera" className="w-full h-full object-contain" />
                                </div>
                                <h2 className="text-2xl font-semibold text-text-main uppercase tracking-tight leading-none">
                                    {t.learnmera.name}
                                </h2>
                            </div>

                            <p className="text-xl text-text-muted font-light leading-relaxed">
                                {t.learnmera.description}
                            </p>

                            <div className="flex flex-col gap-6 pt-10 border-t border-border-main">
                                <div className="flex items-center gap-4 group">
                                    <div className="size-12 rounded-2xl bg-bg-card border border-border-main text-text-muted group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                                        <Mail className="size-5" />
                                    </div>
                                    <a href="mailto:veronica@learnmera.com" className="font-medium text-text-main hover:text-primary transition-colors">veronica@learnmera.com</a>
                                </div>
                                <div className="flex items-center gap-4 group">
                                    <div className="size-12 rounded-2xl bg-bg-card border border-border-main text-text-muted group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center justify-center">
                                        <ExternalLink className="size-5" />
                                    </div>
                                    <a href="https://learnmera.com/" target="_blank" rel="noopener noreferrer" className="font-medium text-text-main hover:text-primary transition-colors">learnmera.com</a>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 lg:order-1">
                            {t.learnmera.services.map((service, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-10 bg-bg-card rounded-[3rem] border border-border-main shadow-lg transition-all group"
                                >
                                    <div className="size-12 rounded-2xl bg-bg-surface text-text-muted mb-6 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PlusCircle className="size-5" />
                                    </div>
                                    <h3 className="text-xs font-semibold text-text-main mb-3 uppercase tracking-[0.2em]">{service.title}</h3>
                                    <p className="text-text-muted font-light leading-relaxed">{service.content}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Mirsal Section */}
                    <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
                        <div className="lg:col-span-5 space-y-10 lg:sticky lg:top-32">
                            <div className="flex items-center gap-6">
                                <div className="size-20 bg-bg-card rounded-3xl p-4 shadow-xl border border-border-main flex items-center justify-center">
                                    <ShieldCheck className="size-10 text-primary" />
                                </div>
                                <h2 className="text-2xl font-semibold text-text-main uppercase tracking-tight leading-none">
                                    {t.mirsal.name}
                                </h2>
                            </div>

                            <p className="text-xl text-text-muted font-light leading-relaxed">
                                {t.mirsal.description}
                            </p>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {t.mirsal.services.map((service, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -5 }}
                                    className="p-10 bg-bg-card rounded-[3rem] border border-border-main shadow-lg transition-all group"
                                >
                                    <div className="size-12 rounded-2xl bg-bg-surface text-text-muted mb-6 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                                        <PlusCircle className="size-5" />
                                    </div>
                                    <h3 className="text-xs font-semibold text-text-main mb-3 uppercase tracking-[0.2em]">{service.title}</h3>
                                    <p className="text-text-muted font-light leading-relaxed">{service.content}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                </motion.div>
            </div>
        </div>
    );
};
