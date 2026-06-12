import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { LanguageCode, Profile, BrandingPreferences, Workshop } from './types';

import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { UserPanel } from './components/UserPanel';
import { Layout } from './components/Layout';
import { EducationPage } from './pages/EducationPage';
import { BlogPage } from './pages/BlogPage';
import { NewsPage } from './pages/NewsPage';
import { AboutPage } from './pages/AboutPage';
import { PartnersPage } from './pages/PartnersPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import { UnsubscribePage } from './pages/UnsubscribePage';
import { ContactPage } from './pages/ContactPage';
import { BlogPostEditor } from './components/BlogPostEditor';
import { WorkshopsPage } from './pages/WorkshopsPage';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, getDocs, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { BookOpen, GraduationCap, ArrowRight, Shield, Star, Sparkles } from 'lucide-react';
import { cn } from './lib/utils';
import { useTranslation } from './contexts/TranslationContext';


// --- Sub-components ---

const StatItem = ({ label, value }: { label: string, value: string }) => (
    <div className="text-center md:text-left px-8 py-4 border-l border-border-main flex flex-col justify-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted/50 mb-2 font-body">{label}</span>
        <span className="font-display text-2xl font-semibold text-text-main">{value}</span>
    </div>
);

const FeatureCard = ({ icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8 }}
        className="group p-12 bg-white flex flex-col items-start transition-all hover:bg-bg-surface cursor-pointer"
    >
        <div className="size-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mb-10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
            {icon}
        </div>
        <h3 className="font-display text-2xl font-semibold text-slate-900 mb-6 tracking-tight">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-medium text-base">{desc}</p>
        <div className="mt-auto pt-10">
            <div className="w-8 h-1 bg-slate-100 group-hover:w-16 group-hover:bg-primary transition-all duration-500" />
        </div>
    </motion.div>
);

interface HomePageProps {
    lang: LanguageCode;
    scrollToSection: (id: string) => (e: React.MouseEvent) => void;
    user: FirebaseUser | null;
    setShowAuthModal: (show: boolean) => void;
    branding?: BrandingPreferences;
}



const FALLBACK_WORKSHOPS: Workshop[] = [
    {
        title: {
            en: 'Finnish for Arabic Speakers: Oral Skills & Culture',
            fi: 'Suomi arabiankielisille: suulliset taidot ja kulttuuri',
            sv: 'Finska för arabisktalande: muntliga färdigheter & kultur',
            ar: 'العربية: المهارات اللغوية والثقافة',
            uk: 'Фінська для арабомовних: мова та культура'
        },
        date: 'MAY 2026',
        label: 'WORKSHOP',
        image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop'
    },
    {
        title: {
            en: 'Ukrainian Support Group: Language & Integration',
            fi: 'Ukrainalainen tukiryhmä: kieli ja kotoutuminen',
            sv: 'Ukrainskt stödgrupp: språk & integration',
            ar: 'مجموعة دعم الأوكرانيين: اللغة والاندماج',
            uk: 'Українська група підтримки: мова та інтеграція'
        },
        date: 'MAY 2026',
        label: 'WORKSHOP',
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop'
    },
    {
        title: {
            en: 'Open Language Café: Informal Finnish Practice',
            fi: 'Avoin kielikahvila: epävirallista suomen harjoittelua',
            sv: 'Öppet språkcafé: informell finskpraktik',
            ar: 'مقهى اللغة المفتوح: ممارسة غير رسمية',
            uk: 'Відкрите мовне кафе: неформальна практика'
        },
        date: 'MAY 2026',
        label: 'WORKSHOP',
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop'
    }
];

const HomePage = ({
    lang,
    user,
    setShowAuthModal,
    branding
}: HomePageProps) => {
    const [workshops, setWorkshops] = useState<Workshop[]>([]);

    useEffect(() => {
        const fetchWorkshops = async () => {
            try {
                const q = query(collection(db, 'workshops'), orderBy('created_at', 'desc'));
                const snap = await getDocs(q);
                const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Workshop));
                setWorkshops(data);
            } catch {
                // silently fall back to hardcoded workshops
            }
        };
        fetchWorkshops();
    }, []);

    const heroBg = branding?.heroBgUrl || "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2098&auto=format&fit=crop";
    const isVideo = branding?.heroBgType === 'video';

    const { t } = useTranslation();

    return (
        <div className="bg-bg-surface transition-colors duration-300 overflow-hidden">
            {/* 1. Full Screen Hero - Immersive Template Style */}
            <section className="relative h-screen w-full flex items-center justify-center overflow-hidden lg:snap-start">
                {/* Immersive Background Layer */}
                <div className="absolute inset-0 z-0">
                    {isVideo ? (
                        <video
                            src={heroBg}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={heroBg}
                            className="w-full h-full object-cover"
                            alt="Hero background"
                        />
                    )}
                    {/* Dark overlay for premium feel and text readability over any media */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]" />
                </div>

                <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-12 w-full">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-semibold text-white mb-6 md:mb-8 leading-[0.85] tracking-tight uppercase text-center"
                        >
                            {t.heroTitle.split('\n').map((line, i) => (
                                <span key={i} className="block">{line}</span>
                            ))}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed mb-12 max-w-2xl mx-auto text-center font-body"
                        >
                            {t.heroDesc}
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-wrap gap-6 justify-center"
                        >
                            <button
                                onClick={() => !user && setShowAuthModal(true)}
                                className="px-8 py-4 md:px-12 md:py-6 rounded-full bg-primary text-white text-xs md:text-sm font-semibold uppercase tracking-wide hover:bg-white hover:text-black transition-all duration-500 shadow-2xl shadow-primary/20"
                            >
                                {lang === 'sv' ? 'Gå med' : lang === 'fi' ? 'Ilmoittaudu' : lang === 'ar' ? 'انضم إلينا' : lang === 'uk' ? 'Приєднатися' : 'Join Workshop'}
                            </button>
                            <Link
                                to="/about"
                                className="px-8 py-4 md:px-12 md:py-6 rounded-full border-2 border-white/20 text-white text-xs md:text-sm font-semibold uppercase tracking-wide hover:bg-white/10 transition-all duration-500 backdrop-blur-md inline-block text-center"
                            >
                                {lang === 'sv' ? 'Läs mer' : lang === 'fi' ? 'Lue lisää' : lang === 'ar' ? 'اقرأ أكثر' : lang === 'uk' ? 'Читати далі' : 'Learn More'}
                            </Link>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
                >
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70 font-body">{{ sv: 'Scrolla', fi: 'Vieritä', ar: 'تمرير', uk: 'Прокрутити', en: 'Scroll' }[lang] || 'Scroll'}</span>
                    <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
                </motion.div>
            </section>

            {/* 2. Project Mission Section - Premium Card-based Layout */}
            <section className="py-32 bg-bg-surface relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="max-w-[1440px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-center mb-24">
                        <div>
                            <motion.span 
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-6 block font-body"
                            >
                                Our Mission
                            </motion.span>
                            <motion.h2 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="font-display text-xl md:text-7xl font-semibold text-text-main mb-12 leading-[1.1] uppercase tracking-tight"
                            >
                                Empowering <br /> <span className="text-primary italic">New Voices</span>
                            </motion.h2>
                            <motion.p 
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-lg md:text-xl text-text-muted font-medium leading-relaxed mb-12 max-w-xl font-body"
                            >
                                {t.missionText}
                            </motion.p>
                            
                            <div className="flex flex-wrap items-center gap-12">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wide text-text-muted/50 block mb-2 font-body">{t.fundedBy}</span>
                                    <div className="font-display text-xl font-semibold text-text-main uppercase tracking-tight">{t.foundation}</div>
                                </div>
                                <Link to="/about" className="group inline-flex items-center gap-4 px-8 py-4 rounded-full bg-bg-card border border-border-main text-text-main text-xs font-semibold uppercase tracking-wide hover:bg-primary hover:text-white hover:border-primary transition-all duration-500 shadow-lg">
                                    {t.explore}
                                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>

                        {/* Visual Asset / Illustration Placeholder */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="relative aspect-video lg:aspect-square bg-bg-card rounded-[4rem] overflow-hidden border border-border-main shadow-2xl group cursor-pointer"
                        >
                            <img 
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop" 
                                className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                                alt="Students collaborating"
                            />
                            <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500" />
                        </motion.div>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <MissionCard index={0} title={t.feature1Title || "Oral Communication"} desc={t.feature1Desc || "Improve your spoken Finnish through interactive workshops and informal conversation."} />
                        <MissionCard index={1} title={t.feature2Title || "Cultural Integration"} desc={t.feature2Desc || "Learn about Finnish culture and society in a welcoming, multi-cultural environment."} />
                        <MissionCard index={2} title={t.feature3Title || "Relaxed Learning"} desc={t.feature3Desc || "Join our workshops in a stress-free setting designed for young adults and migrants."} />
                    </div>
                </div>
            </section>

            {/* 3. Workshops & Partners Section */}
            <section className="py-32 lg:py-0 lg:min-h-screen lg:flex lg:items-center lg:snap-start bg-bg-card border-y border-border-main">
                <div className="max-w-[1440px] mx-auto px-6 md:px-12 w-full">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-12">
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-6 block font-body">{t.timeline}</span>
                            <h2 className="font-display text-2xl lg:text-8xl font-semibold text-text-main uppercase tracking-tight leading-[0.85]">
                                {t.workshopStart} <br /> <span className="italic text-primary">{t.workshopMonth}</span>
                            </h2>
                        </div>
                        <div className="flex flex-col gap-6">
                            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-muted/50 font-body">{t.partners}</span>
                            <div className="flex flex-wrap gap-x-8 gap-y-4 text-xs font-semibold text-text-main uppercase tracking-wide font-body">
                                <span className="hover:text-primary transition-colors cursor-default">Learning for Integration ry</span>
                                <span className="hover:text-primary transition-colors cursor-default">Learnmera Oy</span>
                                <span className="hover:text-primary transition-colors cursor-default">Mirsal ry</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {(workshops.length > 0 ? workshops : FALLBACK_WORKSHOPS).slice(0, 3).map((w, i) => (
                            <NewsCard
                                key={w.id || i}
                                image={w.image}
                                label={w.label || 'WORKSHOP'}
                                date={w.date}
                                title={w.title[lang] || w.title.en || ''}
                                linkUrl={w.linkUrl}
                            />
                        ))}
                    </div>

                    <div className="mt-16 text-center">
                        <Link to="/workshops" className="inline-flex items-center gap-4 px-10 py-5 rounded-full bg-primary text-white font-display text-sm font-semibold uppercase tracking-wide hover:bg-black transition-all duration-500 shadow-xl shadow-primary/20 group">
                            {lang === 'sv' ? 'Visa Alla Workshops' : lang === 'fi' ? 'Katso Kaikki Työpajat' : lang === 'ar' ? 'عرض جميع ورش العمل' : lang === 'uk' ? 'Переглянути Всі Воркшопи' : 'View All Workshops'}
                            <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

// --- Helper Components ---

const MissionCard = ({ title, desc, index }: { title: string, desc: string, index: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group p-10 bg-white rounded-[3rem] border border-border-main shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 cursor-pointer relative overflow-hidden"
    >
        {/* Subtle decorative number */}
        <span className="absolute -top-4 -right-4 text-9xl font-semibold text-primary/5 select-none transition-colors group-hover:text-primary/10">0{index + 1}</span>
        
        <div className="relative z-10">
            <h3 className="font-display text-2xl font-semibold text-text-main mb-6 uppercase tracking-tight group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-base text-text-muted font-medium leading-relaxed font-body mb-10">{desc}</p>
            <div className="size-12 rounded-2xl bg-bg-surface border border-border-main flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </div>
        </div>
    </motion.div>
);

const HeritageRound = ({ title, desc }: { title: string, desc: string }) => (
    <div className="group py-16 flex justify-between items-center cursor-pointer transition-all duration-500 hover:px-8 hover:bg-bg-card rounded-[3rem]">
        <div className="max-w-2xl">
            <h3 className="font-display text-xl md:text-2xl font-semibold text-text-main mb-4 uppercase tracking-tight group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-lg text-text-muted font-medium leading-relaxed font-body">{desc}</p>
        </div>
        <div className="size-20 rounded-[2rem] border border-border-main flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-500 shadow-xl">
            <ArrowRight className="size-8 group-hover:translate-x-1 transition-transform" />
        </div>
    </div>
);

const NewsCard = ({ image, label, date, title, linkUrl }: { image: string, label: string, date: string, title: string, linkUrl?: string }) => (
    <motion.div
        className="group cursor-pointer"
        whileHover={{ y: -10 }}
    >
        <div className="aspect-[4/5] bg-bg-card mb-10 overflow-hidden rounded-[4rem] border border-border-main shadow-2xl relative">
            <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale-[0.5] group-hover:grayscale-0" alt={title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
            <div className="absolute top-8 left-8">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-white uppercase tracking-wide border border-white/20">
                    {label}
                </span>
            </div>
        </div>
        <div className="px-4">
            <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary font-body">{date}</span>
                <div className="w-12 h-px bg-border-main" />
            </div>
            <h3 className="font-display text-xl font-semibold text-text-main mb-8 leading-[1.1] uppercase tracking-tight group-hover:text-primary transition-colors">{title}</h3>
            {linkUrl ? (
                <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted group-hover:text-text-main transition-colors font-body hover:text-primary">
                    <span>Register / Info</span>
                    <ArrowRight className="size-4" />
                </a>
            ) : (
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-text-muted group-hover:text-text-main transition-colors font-body">
                    <span>View Details</span>
                    <ArrowRight className="size-4" />
                </div>
            )}
        </div>
    </motion.div>
);


// --- Main App Component ---

const App = () => {

    const location = useLocation();
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Single source of truth for language — from TranslationContext
    const { lang, setLang } = useTranslation();

    // AUTH STATE
    const [user, setUser] = useState<FirebaseUser | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [showBlogEditor, setShowBlogEditor] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [globalBranding, setGlobalBranding] = useState<BrandingPreferences>();



    // Theme Management
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Language & Direction Management
    useEffect(() => {
        document.documentElement.lang = lang;
        if (lang === 'ar') {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
    }, [lang]);

    // Auth Session Manager
    useEffect(() => {
        let profileUnsubscribe: (() => void) | undefined;

        const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const docRef = doc(db, 'profiles', firebaseUser.uid);
                let logoutTimer: NodeJS.Timeout;
                
                profileUnsubscribe = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        if (logoutTimer) clearTimeout(logoutTimer);
                        
                        const data = docSnap.data();
                        setProfile(data as Profile);

                        // Apply saved preferences if they exist
                        const prefs = data.preferences || data.metadata?.preferences || {};
                        if (prefs.theme) setTheme(prefs.theme as any);
                        if (prefs.language) setLang(prefs.language as any);
                    } else {
                        console.log("Profile not found. Waiting 3s to confirm...");
                        logoutTimer = setTimeout(() => {
                            console.log("Profile was deleted or not found. Signing out.");
                            setProfile(null);
                            auth.signOut();
                        }, 3000);
                    }
                }, (err) => {
                    console.error('Profile listener failed:', err);
                });
            } else {
                setProfile(null);
                if (profileUnsubscribe) {
                    profileUnsubscribe();
                    profileUnsubscribe = undefined;
                }
            }
        });

        return () => {
            authUnsubscribe();
            if (profileUnsubscribe) profileUnsubscribe();
        };
    }, []);

    const applyBranding = (prefs: any) => {
        if (!prefs) return;
        const root = document.documentElement;
        if (prefs.primaryColor) {
            root.style.setProperty('--primary', prefs.primaryColor);
            root.style.setProperty('--primary-glow', `${prefs.primaryColor}66`);
        }
        if (prefs.secondaryColor) root.style.setProperty('--secondary', prefs.secondaryColor);
        if (prefs.fontFamily) {
            root.style.setProperty('--font-display', `'${prefs.fontFamily}', sans-serif`);
        }

        // Update document title
        if (prefs.siteName) {
            document.title = prefs.siteName;
        }

        // Update favicon
        if (prefs.logoUrl) {
            const favicon = document.querySelector("link[rel*='icon']");
            if (favicon) {
                (favicon as HTMLLinkElement).href = prefs.logoUrl;
            } else {
                const link = document.createElement('link');
                link.rel = 'icon';
                link.href = prefs.logoUrl;
                document.head.appendChild(link);
            }
        }
    };

    // Global Branding fetch
    useEffect(() => {
        const fetchGlobalBranding = async () => {
            try {
                const brandingRef = doc(db, 'configs', 'branding');
                const brandingSnap = await getDoc(brandingRef);

                if (brandingSnap.exists()) {
                    const data = brandingSnap.data();
                    setGlobalBranding(data as any);
                    applyBranding(data);
                }
            } catch (err) {
                console.error('Global branding fetch failed:', err);
            }
        };

        fetchGlobalBranding();
    }, []);


    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'materials'));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMaterials(data as any[]);
        } catch (err) {
            console.error('Materials fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };


    const scrollToSection = (id: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };


    return (
        <Layout
            lang={lang}
            setLang={setLang}
            user={user}
            profile={profile}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            setShowAuthModal={setShowAuthModal}
            setShowAdminPanel={setShowAdminPanel}
            setShowUserPanel={setShowUserPanel}
            branding={globalBranding}
        >
            <Routes>
                <Route path="/" element={
                    <HomePage
                        lang={lang}
                        scrollToSection={scrollToSection}
                        user={user}
                        setShowAuthModal={setShowAuthModal}
                        branding={globalBranding}
                    />
                } />


                <Route path="/blog" element={<BlogPage lang={lang} user={user} profile={profile} onWritePost={() => setShowBlogEditor(true)} />} />
                <Route path="/news" element={<NewsPage lang={lang} />} />
                <Route path="/education" element={<EducationPage lang={lang} />} />
                <Route path="/about" element={<AboutPage lang={lang} />} />
                <Route path="/partners" element={<PartnersPage lang={lang} />} />
                <Route path="/contact" element={<ContactPage lang={lang} />} />
                <Route path="/workshops" element={<WorkshopsPage lang={lang} />} />
                <Route path="/privacy" element={<PrivacyPolicyPage lang={lang} />} />
                <Route path="/cookies" element={<CookiePolicyPage lang={lang} />} />
                <Route path="/unsubscribe" element={<UnsubscribePage lang={lang} />} />
            </Routes>

            {/* Modals */}
            <AnimatePresence>
                {/* Removed SaunaModal and ContributionForm for Step 1 */}
                {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}
                {showAdminPanel && <AdminPanel lang={lang} profile={profile} user={user} onClose={() => setShowAdminPanel(false)} onUpdate={fetchMaterials} />}

                {showUserPanel && user && (
                    <UserPanel
                        lang={lang}
                        user={user}
                        profile={profile}
                        onClose={() => setShowUserPanel(false)}
                        theme={theme}
                        setTheme={setTheme}
                        setLang={setLang}
                        onUpdate={fetchMaterials}
                    />
                )}
                {showBlogEditor && user && <BlogPostEditor lang={lang} user={user} onClose={() => setShowBlogEditor(false)} onSuccess={() => setShowBlogEditor(false)} />}
            </AnimatePresence>
        </Layout>
    );
};

export default App;
