import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { LanguageCode, SiteTranslations } from '../types';

interface TranslationContextType {
    t: Record<string, string>;
    lang: LanguageCode;
    setLang: (lang: LanguageCode) => void;
    isLoading: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Core default translations just in case the database is empty or still loading
export const DEFAULT_TRANSLATIONS: SiteTranslations = {
    en: {
        // Navigation
        home: "Home", education: "Education", workshops: "Workshops", news: "News",
        blog: "Blog", about: "About", partners: "Partners", signIn: "Sign In",
        signOut: "Sign Out", contact: "Contact", search: "Search", languages: "Languages",
        admin: "Admin Panel", profile: "Profile",
        
        // Home Page
        heroTitle: "SUOMI\nPORTAAT",
        heroDesc: "Free Finnish language workshops for young migrants in the capital area.",
        missionTitle: "Empowering New Voices",
        missionText: "Suomiportaat project aims to empower young migrants in the capital area of Finland by providing free Finnish language workshops in a relaxed and informal setting. We focus on improving oral communication skills and fostering cultural integration.",
        fundedBy: "Funded by",
        foundation: "Finnish Cultural Foundation",
        explore: "Explore the project",
        timeline: "Timeline",
        workshopStart: "Workshops Start",
        workshopMonth: "May 2026",
        projectPartners: "Project Partners",
        
        // Workshops Page
        workshopsTitle: "Workshops",
        workshopsSubtitle: "Join our free Finnish language workshops",
        workshopsDesc: "Explore our upcoming and past workshops. We focus on improving oral communication skills and fostering cultural integration in a relaxed setting.",
        loadingWorkshops: "Loading workshops...",
        noWorkshops: "No workshops available yet. Please check back later!",
        viewDetails: "View Details",
        registerInfo: "Register / Info",
        viewAllWorkshops: "View All Workshops",

        // Mission Feature Cards
        feature1Title: "Oral Communication",
        feature1Desc: "Improve your spoken Finnish through interactive workshops and informal conversation.",
        feature2Title: "Cultural Integration",
        feature2Desc: "Learn about Finnish culture and society in a welcoming, multi-cultural environment.",
        feature3Title: "Relaxed Learning",
        feature3Desc: "Join our workshops in a stress-free setting designed for young adults and migrants."
    },
    fi: {
        home: "Koti", education: "Koulutus", workshops: "Työpajat", news: "Uutiset",
        blog: "Blogi", about: "Meistä", partners: "Kumppanit", signIn: "Kirjaudu",
        signOut: "Kirjaudu ulos", contact: "Ota yhteyttä", search: "Haku", languages: "Kielet",
        admin: "Hallintapaneeli", profile: "Profiili",
        
        heroTitle: "SUOMI\nPORTAAT",
        heroDesc: "Maksuttomia suomen kielen työpajoja nuorille maahanmuuttajille pääkaupunkiseudulla.",
        missionTitle: "Uusia Ääniä Voimaannuttamassa",
        missionText: "Suomiportaat-hankkeen tavoitteena on voimaannuttaa pääkaupunkiseudun nuoria maahanmuuttajia tarjoamalla maksuttomia suomen kielen työpajoja rennossa ja epävirallisessa ympäristössä. Keskitymme suullisen viestinnän parantamiseen ja kulttuuriseen kotoutumiseen.",
        fundedBy: "Rahoittaja",
        foundation: "Suomen Kulttuurirahasto",
        explore: "Tutustu hankkeeseen",
        timeline: "Aikataulu",
        workshopStart: "Työpajat alkavat",
        workshopMonth: "Toukokuu 2026",
        projectPartners: "Yhteistyökumppanit",
        
        workshopsTitle: "Työpajat",
        workshopsSubtitle: "Liity maksuttomiin suomen kielen työpajoihimme",
        workshopsDesc: "Tutustu tuleviin ja menneisiin työpajoihimme. Keskitymme suullisen viestinnän parantamiseen ja kulttuuriseen kotoutumiseen rennossa ympäristössä.",
        loadingWorkshops: "Ladataan työpajoja...",
        noWorkshops: "Työpajoja ei ole vielä saatavilla. Palaa myöhemmin!",
        viewDetails: "Katso Tiedot",
        registerInfo: "Ilmoittautuminen / Info",
        viewAllWorkshops: "Katso Kaikki Työpajat",

        // Mission Feature Cards
        feature1Title: "Suullinen viestintä",
        feature1Desc: "Paranna puhuttua suomea interaktiivisissa työpajoissa ja vapaamuotoisissa keskusteluissa.",
        feature2Title: "Kulttuurinen kotoutuminen",
        feature2Desc: "Opi suomalaisesta kulttuurista ja yhteiskunnasta vieraanvaraisessa, monikulttuurisessa ympäristössä.",
        feature3Title: "Rento oppiminen",
        feature3Desc: "Liity työpajoihimme stressittömässä ympäristössä, joka on suunniteltu nuorille aikuisille ja maahanmuuttajille."
    },
    sv: {
        home: "Hem", education: "Utbildning", workshops: "Workshops", news: "Nyheter",
        blog: "Blogg", about: "Om oss", partners: "Partners", signIn: "Logga in",
        signOut: "Logga ut", contact: "Kontakt", search: "Sök", languages: "Språk",
        admin: "Adminpanel", profile: "Profil",
        
        heroTitle: "SUOMI\nPORTAAT",
        heroDesc: "Kostnadsfria finska språkkurser för unga migranter i huvudstadsregionen.",
        missionTitle: "Empowering New Voices",
        missionText: "Projektet Suomiportaat syftar till att stärka unga migranter i huvudstadsregionen genom att erbjuda kostnadsfria finska språkkurser i en avslappnad miljö. Vi fokuserar på att förbättra den muntliga kommunikationsförmågan och främja kulturell integration.",
        fundedBy: "Finansierat av",
        foundation: "Finska Kulturfonden",
        explore: "Utforska projektet",
        timeline: "Tidplan",
        workshopStart: "Workshops startar",
        workshopMonth: "Maj 2026",
        projectPartners: "Projektpartners",
        
        workshopsTitle: "Workshops",
        workshopsSubtitle: "Delta i våra kostnadsfria finska språkkurser",
        workshopsDesc: "Utforska våra kommande och tidigare workshops. Vi fokuserar på att förbättra muntlig kommunikation och främja kulturell integration i en avslappnad miljö.",
        loadingWorkshops: "Laddar workshops...",
        noWorkshops: "Inga workshops tillgängliga ännu. Kom tillbaka senare!",
        viewDetails: "Visa Detaljer",
        registerInfo: "Registrering / Info",
        viewAllWorkshops: "Visa Alla Workshops",

        // Mission Feature Cards
        feature1Title: "Muntlig kommunikation",
        feature1Desc: "Förbättra din talade finska genom interaktiva workshops och informella samtal.",
        feature2Title: "Kulturell integration",
        feature2Desc: "Lär dig om finsk kultur och samhälle i en välkomnande, mångkulturell miljö.",
        feature3Title: "Avslappnat lärande",
        feature3Desc: "Delta i våra workshops i en stressfri miljö utformad för unga vuxna och migranter."
    },
    ar: {
        home: "الرئيسية", education: "التعليم", workshops: "ورش العمل", news: "الأخبار",
        blog: "المدونة", about: "عنا", partners: "الشركاء", signIn: "تسجيل الدخول",
        signOut: "تسجيل الخروج", contact: "اتصل بنا", search: "بحث", languages: "اللغات",
        admin: "لوحة التحكم", profile: "الملف الشخصي",
        
        heroTitle: "SUOMI\nPORTAAT",
        heroDesc: "ورش عمل مجانية للغة الفنلندية للمهاجرين الشباب في منطقة العاصمة.",
        missionTitle: "تمكين الأصوات الجديدة",
        missionText: "يهدف مشروع Suomiportaat إلى تمكين المهاجرين الشباب في منطقة العاصمة الفنلندية من خلال توفير ورش عمل مجانية للغة الفنلندية في بيئة مريحة وغير رسمية. نحن نركز على تحسين مهارات التواصل الشفهي وتعزيز الاندماج الثقافي.",
        fundedBy: "بتمويل من",
        foundation: "المؤسسة الثقافية الفنلندية",
        explore: "استكشف المشروع",
        timeline: "الجدول الزمني",
        workshopStart: "تبدأ ورش العمل",
        workshopMonth: "مايو 2026",
        projectPartners: "شركاء المشروع",
        
        workshopsTitle: "ورش العمل",
        workshopsSubtitle: "انضم إلى ورش عمل اللغة الفنلندية المجانية",
        workshopsDesc: "اكتشف ورش العمل القادمة والسابقة. نركز على تحسين مهارات التواصل الشفهي وتعزيز الاندماج الثقافي في بيئة مريحة.",
        loadingWorkshops: "جاري تحميل ورش العمل...",
        noWorkshops: "لا توجد ورش عمل متاحة بعد. يرجى التحقق لاحقًا!",
        viewDetails: "عرض التفاصيل",
        registerInfo: "التسجيل / معلومات",
        viewAllWorkshops: "عرض جميع ورش العمل"
    },
    uk: {
        home: "Головна", education: "Освіта", workshops: "Воркшопи", news: "Новини",
        blog: "Блог", about: "Про нас", partners: "Партнери", signIn: "Увійти",
        signOut: "Вийти", contact: "Контакти", search: "Пошук", languages: "Мови",
        admin: "Панель адміністратора", profile: "Профіль",
        
        heroTitle: "SUOMI\nPORTAAT",
        heroDesc: "Безкоштовні воркшопи з фінської мови для молодих мігрантів у столичному регіоні.",
        missionTitle: "Розширення Можливостей",
        missionText: "Проєкт Suomiportaat має на меті розширити можливості молодих мігрантів у столичному регіоні Фінляндії, надаючи безкоштовні воркшопи з фінської мови в невимушеній та неформальній обстановці. Ми зосереджені на покращенні навичок усного мовлення та сприянні культурній інтеграції.",
        fundedBy: "За підтримки",
        foundation: "Фінський культурний фонд",
        explore: "Дізнатися більше про проєкт",
        timeline: "Графік",
        workshopStart: "Початок воркшопів",
        workshopMonth: "Травень 2026",
        projectPartners: "Партнери проєкту",
        
        workshopsTitle: "Воркшопи",
        workshopsSubtitle: "Приєднуйтесь до наших безкоштовних воркшопів з фінської мови",
        workshopsDesc: "Ознайомтеся з нашими майбутніми та минулими воркшопами. Ми зосереджуємося на вдосконаленні навичок усного мовлення та сприянні культурній інтеграції у невимушеній атмосфері.",
        loadingWorkshops: "Завантаження воркшопів...",
        noWorkshops: "Наразі немає доступних воркшопів. Будь ласка, перевірте пізніше!",
        viewDetails: "Детальніше",
        registerInfo: "Реєстрація / Інфо",
        viewAllWorkshops: "Переглянути Всі Воркшопи"
    }
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [lang, setLang] = useState<LanguageCode>('en');
    const [translations, setTranslations] = useState<SiteTranslations>(DEFAULT_TRANSLATIONS);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const docRef = doc(db, 'configs', 'translations');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTranslations({ ...DEFAULT_TRANSLATIONS, ...docSnap.data() as SiteTranslations });
                }
            } catch (err) {
                console.error("Failed to load translations from Firestore:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTranslations();
    }, []);

    const t = new Proxy({} as Record<string, string>, {
        get: (target, prop) => {
            if (typeof prop !== 'string') return undefined;
            // 1. Try selected language from DB
            if (translations[lang] && translations[lang][prop]) return translations[lang][prop];
            // 2. Try selected language from Hardcoded Defaults
            if (DEFAULT_TRANSLATIONS[lang] && DEFAULT_TRANSLATIONS[lang][prop]) return DEFAULT_TRANSLATIONS[lang][prop];
            // 3. Try English from DB
            if (translations.en && translations.en[prop]) return translations.en[prop];
            // 4. Try English from Hardcoded Defaults
            if (DEFAULT_TRANSLATIONS.en && DEFAULT_TRANSLATIONS.en[prop]) return DEFAULT_TRANSLATIONS.en[prop];
            // 5. Fallback to the raw key
            return prop;
        }
    });

    return (
        <TranslationContext.Provider value={{ t, lang, setLang, isLoading }}>
            {children}
        </TranslationContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(TranslationContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a TranslationProvider');
    }
    return context;
};
