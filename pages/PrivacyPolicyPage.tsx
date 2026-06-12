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
            lastUpdated: "Last updated: April 28, 2026",
            intro: "At Suomiportaat, we are committed to protecting your personal data and your privacy. This policy explains how we handle your information when you use our workshop platform.",
            sections: [
                {
                    title: "Information We Collect",
                    icon: <Eye className="size-6" />,
                    content: "We collect minimal information necessary for our project: Email addresses for newsletter subscribers, and names/emails for participants who register for workshops. We also collect feedback and progress data you voluntarily share."
                },
                {
                    title: "How We Use Data",
                    icon: <Lock className="size-6" />,
                    content: "Your data is used solely to organize Suomiportaat workshops, provide updates via our newsletter, and improve our educational services. We never sell your data to third parties."
                },
                {
                    title: "Your Rights",
                    icon: <Shield className="size-6" />,
                    content: "In accordance with GDPR, you have the right to access, correct, or delete your data at any time. You can unsubscribe from our newsletter using the link in any email."
                },
                {
                    title: "Data Storage",
                    icon: <ScrollText className="size-6" />,
                    content: "We use secure cloud infrastructure to store our records. Your data is protected by industry-standard encryption and security protocols."
                }
            ]
        },
        sv: {
            title: "Integritetspolicy",
            lastUpdated: "Senast uppdaterad: 28 april 2026",
            intro: "På Suomiportaat är vi måna om att skydda dina personuppgifter och din integritet. Denna policy förklarar hur vi hanterar din information när du använder vår plattform.",
            sections: [
                {
                    title: "Information Vi Samlar In",
                    icon: <Eye className="size-6" />,
                    content: "Vi samlar in minimalt med information som är nödvändig för vårt projekt: E-postadresser för nyhetsbrevsprenumeranter, samt namn/e-post för deltagare som anmäler sig till workshops."
                },
                {
                    title: "Hur Vi Använder Data",
                    icon: <Lock className="size-6" />,
                    content: "Dina uppgifter används enbart för att organisera Suomiportaat-workshops, tillhandahålla uppdateringar via vårt nyhetsbrev och förbättra våra utbildningstjänster."
                },
                {
                    title: "Dina Rättigheter",
                    icon: <Shield className="size-6" />,
                    content: "I enlighet med GDPR har du rätt att när som helst få tillgång till, korrigera eller radera dina uppgifter."
                },
                {
                    title: "Datalagring",
                    icon: <ScrollText className="size-6" />,
                    content: "Vi använder säker molninfrastruktur för att lagra våra register. Dina uppgifter skyddas av industristandard kryptering."
                }
            ]
        },
        fi: {
            title: "Tietosuojaseloste",
            lastUpdated: "Viimeksi päivitetty: 28. huhtikuuta 2026",
            intro: "Suomiportaat-hankkeessa olemme sitoutuneet suojaamaan henkilötietojasi ja yksityisyyttäsi. Tämä seloste selittää, miten käsittelemme tietojasi.",
            sections: [
                {
                    title: "Keräämämme Tiedot",
                    icon: <Eye className="size-6" />,
                    content: "Keräämme vain hankkeemme kannalta välttämätöntä tietoa: uutiskirjeen tilaajien sähköpostiosoitteet sekä työpajoihin osallistuvien nimet ja yhteystiedot."
                },
                {
                    title: "Miten Käytämme Tietoja",
                    icon: <Lock className="size-6" />,
                    content: "Tietojasi käytetään ainoastaan Suomiportaat-työpajojen järjestämiseen, viestintään ja koulutuspalveluidemme kehittämiseen."
                },
                {
                    title: "Oikeutesi",
                    icon: <Shield className="size-6" />,
                    content: "GDPR:n mukaisesti sinulla on oikeus tarkastella, korjata tai poistaa tietosi milloin tahansa."
                },
                {
                    title: "Tietojen Säilytys",
                    icon: <ScrollText className="size-6" />,
                    content: "Käytämme turvallisia pilvipalveluita tietojen tallentamiseen. Tietosi on suojattu asianmukaisilla salausmenetelmillä."
                }
            ]
        },
        ar: {
            title: "سياسة الخصوصية",
            lastUpdated: "آخر تحديث: 28 أبريل 2026",
            intro: "في Suomiportaat، نحن ملتزمون بحماية بياناتك الشخصية وخصوصيتك. توضح هذه السياسة كيف نتعامل مع معلوماتك عند استخدام منصة ورش العمل الخاصة بنا.",
            sections: [
                {
                    title: "المعلومات التي نجمعها",
                    icon: <Eye className="size-6" />,
                    content: "نحن نجمع الحد الأدنى من المعلومات اللازمة لمشروعنا: عناوين البريد الإلكتروني لمشتركي النشرة الإخبارية، والأسماء/البريد الإلكتروني للمشاركين في ورش العمل."
                },
                {
                    title: "كيف نستخدم البيانات",
                    icon: <Lock className="size-6" />,
                    content: "تُستخدم بياناتك فقط لتنظيم ورش عمل Suomiportaat، وتقديم التحديثات عبر نشرتنا الإخبارية، وتحسين خدماتنا التعليمية."
                },
                {
                    title: "حقوقك",
                    icon: <Shield className="size-6" />,
                    content: "وفقًا للقانون العام لحماية البيانات (GDPR)، لديك الحق في الوصول إلى بياناتك أو تصحيحها أو حذفها في أي وقت."
                },
                {
                    title: "تخزين البيانات",
                    icon: <ScrollText className="size-6" />,
                    content: "نحن نستخدم بنية تحتية سحابية آمنة لتخزين سجلاتنا. بياناتك محمية بروتوكولات التشفير والأمان القياسية في الصناعة."
                }
            ]
        },
        uk: {
            title: "Політика конфіденційності",
            lastUpdated: "Останнє оновлення: 28 квітня 2026",
            intro: "У Suomiportaat ми прагнемо захищати ваші персональні дані та вашу конфіденційність. Ця політика пояснює, як ми обробляємо вашу інформацію.",
            sections: [
                {
                    title: "Інформація, яку ми збираємо",
                    icon: <Eye className="size-6" />,
                    content: "Ми збираємо мінімальну інформацію, необхідну для нашого проєкту: адреси електронної пошти для підписників новин та імена/email для учасників воркшопів."
                },
                {
                    title: "Як ми використовуємо дані",
                    icon: <Lock className="size-6" />,
                    content: "Ваші дані використовуються виключно для організації воркшопів Suomiportaat, розсилки новин та вдосконалення наших освітніх послуг."
                },
                {
                    title: "Ваші права",
                    icon: <Shield className="size-6" />,
                    content: "Відповідно до GDPR, ви маєте право на доступ, виправлення або видалення своїх даних у будь-який час."
                },
                {
                    title: "Зберігання даних",
                    icon: <ScrollText className="size-6" />,
                    content: "Ми використовуємо безпечну хмарну інфраструктуру для зберігання наших записів. Ваші дані захищені стандартними протоколами шифрування."
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
                    <h1 className="text-xl md:text-7xl font-semibold mb-6 tracking-tight uppercase">
                        {lang === 'ar' || lang === 'uk' ? t.title : (
                            <>
                                {lang === 'sv' ? 'Integritets' : lang === 'fi' ? 'Tietosuoja' : 'Privacy'} <br />
                                <span className="text-primary italic">{lang === 'sv' ? 'policy' : lang === 'fi' ? 'seloste' : 'Policy'}</span>
                            </>
                        )}
                    </h1>
                    <p className="text-text-muted font-medium mb-12 uppercase tracking-wide text-sm">
                        {t.lastUpdated}
                    </p>

                    <div className="p-8 md:p-12 bg-bg-card rounded-[3rem] border border-border-main shadow-xl mb-16">
                        <p className="text-xl md:text-2xl font-medium leading-relaxed italic text-text-main opacity-80">
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
                                <h3 className="text-xl font-semibold uppercase tracking-tight mb-4 text-text-main">
                                    {section.title}
                                </h3>
                                <p className="text-text-muted leading-relaxed font-medium">
                                    {section.content}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-24 p-12 bg-secondary rounded-[3rem] text-center">
                        <h2 className="text-2xl font-semibold text-white uppercase mb-4">
                            {lang === 'ar' ? 'لديك أسئلة؟' : lang === 'uk' ? 'Маєте питання?' : 'Questions?'}
                        </h2>
                        <p className="text-gray-400 mb-8">Contact us at info@suomiportaat.fi</p>
                        <a href="mailto:info@suomiportaat.fi" className="inline-block px-8 py-4 bg-primary text-white rounded-2xl font-medium uppercase tracking-wider text-sm hover:scale-105 transition-transform">
                            {lang === 'ar' ? 'إرسال بريد إلكتروني' : lang === 'uk' ? 'Надіслати Email' : 'Send Email'}
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
