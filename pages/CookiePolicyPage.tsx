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
            lastUpdated: "Last updated: April 28, 2026",
            intro: "We use cookies to enhance your experience on our workshop platform. This policy describes what cookies are, how we use them, and how you can manage your preferences.",
            sections: [
                {
                    title: "What are Cookies?",
                    icon: <Cookie className="size-6" />,
                    content: "Cookies are small text files stored on your device when you visit a website. They help the site remember your actions and preferences (like theme and language) over a period of time."
                },
                {
                    title: "Essential Cookies",
                    icon: <ShieldCheck className="size-6" />,
                    content: "These cookies are necessary for the website to function. We use them primarily to store your language preference (FI, EN, SV, AR, UK) and your theme choice (Light/Dark mode)."
                },
                {
                    title: "Analytics",
                    icon: <Settings className="size-6" />,
                    content: "We may use basic analytics to understand how many people visit our platform. This data is anonymized and helps us improve the user experience for everyone."
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
            lastUpdated: "Senast uppdaterad: 28 april 2026",
            intro: "Vi använder cookies för att förbättra din upplevelse på vår plattform. Denna policy beskriver vad cookies är, hur vi använder dem och hur du kan hantera dina inställningar.",
            sections: [
                {
                    title: "Vad är Cookies?",
                    icon: <Cookie className="size-6" />,
                    content: "Cookies är små textfiler som lagras på din enhet när du besöker en webbplats. De hjälper webbplatsen att komma ihåg dina val och inställningar (som tema och språk) under en period."
                },
                {
                    title: "Nödvändiga Cookies",
                    icon: <ShieldCheck className="size-6" />,
                    content: "Dessa cookies är nödvändiga för att webbplatsen ska fungera. Vi använder dem främst för att lagra dina språkinställningar (FI, EN, SV, AR, UK) och ditt val av tema."
                },
                {
                    title: "Analys",
                    icon: <Settings className="size-6" />,
                    content: "Vi kan komma att använda grundläggande analys för att förstå hur många som besöker plattformen. Denna data är anonymiserad och hjälper oss att förbättra användarupplevelsen."
                },
                {
                    title: "Dina Val",
                    icon: <HelpCircle className="size-6" />,
                    content: "Du kan kontrollera eller radera cookies som du vill. Du kan radera alla cookies som redan finns på din dator."
                }
            ]
        },
        fi: {
            title: "Evästekäytäntö",
            lastUpdated: "Viimeksi päivitetty: 28. huhtikuuta 2026",
            intro: "Käytämme evästeitä parantaaksemme kokemustasi alustallamme. Tämä käytäntö kuvaa, mitä evästeet ovat, miten käytämme niitä ja miten voit hallita asetuksiasi.",
            sections: [
                {
                    title: "Mitä evästeet ovat?",
                    icon: <Cookie className="size-6" />,
                    content: "Evästeet ovat pieniä tekstitiedostoja, joita tallennetaan laitteellesi, kun vierailet verkkosivustolla. Ne auttavat sivustoa muistamaan toimintasi ja asetuksesi."
                },
                {
                    title: "Välttämättömät evästeet",
                    icon: <ShieldCheck className="size-6" />,
                    content: "Nämä evästeet ovat välttämättömiä verkkosivuston toiminnalle. Käytämme niitä ensisijaisesti kieliasetustesi (FI, EN, SV, AR, UK) ja teemavalintasi tallentamiseen."
                },
                {
                    title: "Analytiikka",
                    icon: <Settings className="size-6" />,
                    content: "Saatamme käyttää perusanalyysiä ymmärtääksemme kävijämääriä. Nämä tiedot ovat anonymisoituja."
                },
                {
                    title: "Valintasi",
                    icon: <HelpCircle className="size-6" />,
                    content: "Voit hallita tai poistaa evästeitä haluamallasi tavalla."
                }
            ]
        },
        ar: {
            title: "سياسة ملفات الارتباط",
            lastUpdated: "آخر تحديث: 28 أبريل 2026",
            intro: "نحن نستخدم ملفات تعريف الارتباط لتحسين تجربتك على منصة ورش العمل الخاصة بنا. توضح هذه السياسة ماهية ملفات تعريف الارتباط وكيفية استخدامنا لها.",
            sections: [
                {
                    title: "ما هي ملفات تعريف الارتباط؟",
                    icon: <Cookie className="size-6" />,
                    content: "ملفات تعريف الارتباط هي ملفات نصية صغيرة يتم تخزينها على جهازك عند زيارة موقع ويب. وهي تساعد الموقع على تذكر أفعالك وتفضيلاتك."
                },
                {
                    title: "ملفات الارتباط الأساسية",
                    icon: <ShieldCheck className="size-6" />,
                    content: "هذه الملفات ضرورية لعمل الموقع. نستخدمها بشكل أساسي لتخزين تفضيلات اللغة واختيار المظهر."
                },
                {
                    title: "التحليلات",
                    icon: <Settings className="size-6" />,
                    content: "قد نستخدم تحليلات أساسية لفهم كيفية زيارة المستخدمين للمنصة. هذه البيانات مجهولة المصدر."
                },
                {
                    title: "خياراتك",
                    icon: <HelpCircle className="size-6" />,
                    content: "يمكنك التحكم في ملفات تعريف الارتباط أو حذفها كما يحلو لك."
                }
            ]
        },
        uk: {
            title: "Політика використання файлів cookie",
            lastUpdated: "Останнє оновлення: 28 квітня 2026",
            intro: "Ми використовуємо файли cookie, щоб покращити ваш досвід на нашій платформі воркшопів. Ця політика описує, що таке файли cookie та як ми їх використовуємо.",
            sections: [
                {
                    title: "Що таке файли cookie?",
                    icon: <Cookie className="size-6" />,
                    content: "Cookie — це невеликі текстові файли, які зберігаються на вашому пристрої під час відвідування веб-сайту. Вони допомагають сайту запам'ятати ваші дії та налаштування."
                },
                {
                    title: "Необхідні файли cookie",
                    icon: <ShieldCheck className="size-6" />,
                    content: "Ці файли cookie необхідні для роботи веб-сайту. Ми використовуємо їх для збереження мовних налаштувань та вибору теми."
                },
                {
                    title: "Аналітика",
                    icon: <Settings className="size-6" />,
                    content: "Ми можемо використовувати базову аналітику для розуміння відвідуваності платформи. Ці дані анонімізовані."
                },
                {
                    title: "Ваш вибір",
                    icon: <HelpCircle className="size-6" />,
                    content: "Ви можете контролювати або видаляти файли cookie за вашим бажанням."
                }
            ]
        }
    }[lang] || t.en;

    return (
        <div className="min-h-screen bg-bg-surface text-text-main transition-colors duration-300 pt-40 pb-24 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
                <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-xl md:text-7xl font-semibold mb-6 tracking-tight uppercase font-display">
                        {lang === 'ar' || lang === 'uk' ? t.title : (
                            <>
                                {lang === 'sv' ? 'Cookie' : lang === 'fi' ? 'Eväste' : 'Cookie'} <br />
                                <span className="text-primary italic">{lang === 'sv' ? 'policy' : lang === 'fi' ? 'käytäntö' : 'Policy'}</span>
                            </>
                        )}
                    </h1>
                    <p className="text-text-muted font-medium mb-12 uppercase tracking-wide text-sm font-body">
                        {t.lastUpdated}
                    </p>

                    <div className="p-8 md:p-12 bg-bg-card rounded-[3rem] border border-border-main shadow-xl mb-16">
                        <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-text-main opacity-80 font-body">
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
                                className="p-10 bg-bg-card rounded-[2.5rem] border border-border-main shadow-lg"
                            >
                                <div className="size-14 rounded-2xl bg-bg-surface text-primary flex items-center justify-center mb-8">
                                    {section.icon}
                                </div>
                                <h3 className="text-xl font-semibold uppercase tracking-tight mb-4 text-text-main font-display">
                                    {section.title}
                                </h3>
                                <p className="text-text-muted leading-relaxed font-medium font-body">
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
