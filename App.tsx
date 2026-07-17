import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { SAUNAS } from './constants';
import { Sauna, LanguageCode, Country, Profile } from './types';
import { SaunaModal } from './components/SaunaModal';
import { ContributionForm } from './components/ContributionForm';
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
import { ComparativeReportPage } from './pages/ComparativeReportPage';
import { ProverbsPage } from './pages/ProverbsPage';
import { BlogPostEditor } from './components/BlogPostEditor';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { Map as MapIcon, Search, PlusCircle, ArrowRight, Compass, Shield, Wind } from 'lucide-react';
import { cn } from './lib/utils';
import { MapView } from './components/MapView';
import { Snowfall } from './components/Snowfall';

// --- Sub-components ---

interface HomePageProps {
    lang: LanguageCode;
    scrollToSection: (id: string) => (e: React.MouseEvent) => void;
    filterCountry: string;
    handleCountryFilter: (country: string | 'All') => void;
    allVisibleSaunas: Sauna[];
    availableCountries: string[];
    getSaunaCount: (country: string) => number;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    user: User | null;
    setShowContributionForm: (show: boolean) => void;
    setShowAuthModal: (show: boolean) => void;
    setSelectedSauna: (sauna: Sauna) => void;
    getCountryInfo: (country: string) => { flag: string; name: string };
}

const HomePage = ({
    lang,
    scrollToSection,
    filterCountry,
    handleCountryFilter,
    allVisibleSaunas,
    availableCountries,
    getSaunaCount,
    searchTerm,
    setSearchTerm,
    user,
    setShowContributionForm,
    setShowAuthModal,
    setSelectedSauna,
    getCountryInfo
}: HomePageProps) => {
    const { scrollY } = useScroll();
    const videoScale = useTransform(scrollY, [0, 800], [1, 1.2]);
    const textOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const textY = useTransform(scrollY, [0, 300], [0, 50]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="bg-[var(--bg-main)] transition-colors duration-300 overflow-hidden">
            {/* Hero Section */}
            <section id="hero-section" className="relative h-screen flex items-center justify-center overflow-hidden">
                <motion.div style={{ scale: videoScale }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-slate-900/[0.05] z-10" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-90% via-transparent to-[var(--bg-main)] z-20" />
                    <video autoPlay muted loop playsInline className="w-full h-full object-cover grayscale-[20%] brightness-[90%] transition-all duration-1000">
                        <source src="/Hero.mp4" type="video/mp4" />
                    </video>
                </motion.div>

                <motion.div
                    style={{ opacity: textOpacity, y: textY }}
                    className="relative z-30 text-center max-w-5xl px-6 pt-24 pb-12"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-white/30 text-white text-[10px] font-black tracking-[0.3em] uppercase bg-black/50 shadow-2xl">
                            <div className="size-1.5 bg-primary animate-pulse rounded-full" />
                            {lang === 'sv' ? 'Nordisk Bastukultur' : lang === 'fi' ? 'Pohjoismainen saunakulttuuri' : 'Nordic Sauna Heritage'}
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="text-6xl md:text-8xl lg:text-[7.5rem] font-black text-white mb-8 leading-[0.85] tracking-tighter"
                    >
                        NORDIC SAUNA <br /><span className="text-primary italic">MAP.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8, duration: 1 }}
                        className="text-lg md:text-2xl text-white/90 mb-12 max-w-2xl mx-auto font-light leading-relaxed"
                    >
                        {lang === 'sv'
                            ? 'Upptäck värmen i de nordiska traditionerna genom ett kurerat arkiv av tidlösa rökbastur och kalla bad.'
                            : lang === 'fi'
                                ? 'Löydä pohjoismaisten perinteiden lämpö kuratoidun arkiston kautta, joka sisältää ajattomia savusaunoja ja kylmiä kylpyjä.'
                                : 'Discover the warmth of Nordic traditions through a curated archive of timeless smoke saunas and cold baths.'
                        }
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-6"
                    >
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById('map-section');
                                if (element) {
                                    const headerOffset = 100;
                                    const elementPosition = element.getBoundingClientRect().top;
                                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                                    window.scrollTo({
                                        top: offsetPosition,
                                        behavior: 'smooth'
                                    });
                                }
                            }}
                            className="group relative bg-white text-slate-900 px-12 py-6 rounded-full font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-4 shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10">{lang === 'sv' ? 'Utforska kartan' : lang === 'fi' ? 'Tutki karttaa' : 'Explore the Map'}</span>
                            <div className="size-8 bg-slate-900 text-white rounded-full flex items-center justify-center -mr-2 group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="size-4" />
                            </div>
                        </button>
                    </motion.div>
                </motion.div>

                <div className="hidden lg:flex absolute bottom-12 right-12 z-30 flex-col items-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, 15, 0], x: 0 }}
                        transition={{
                            opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                            y: { duration: 2.5, repeat: Infinity, ease: "easeInOut" },
                            x: { duration: 1.2, ease: "easeOut" }
                        }}
                        className="flex flex-col items-center gap-6"
                    >
                        <span
                            className="text-[9px] font-black text-white/60 tracking-[0.5em] uppercase"
                            style={{ writingMode: 'vertical-rl' }}
                        >
                            Scroll
                        </span>
                        <div className="w-px h-24 bg-gradient-to-b from-white/60 via-white/20 to-transparent" />
                    </motion.div>
                </div>
            </section>

            {/* Features Stagger Section */}
            <section className="py-16 lg:py-24 bg-[var(--bg-main)] relative overflow-hidden">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                    <FeatureCard
                        icon={<Compass className="size-6" />}
                        title={lang === 'sv' ? 'Levande Historia' : lang === 'fi' ? 'Elävä Historia' : 'Living History'}
                        desc={lang === 'sv' ? 'Digitaliserar hundratals år av badtraditioner för den moderna eran.' : lang === 'fi' ? 'Satojen vuosien kylpyperinteiden digitointi nykyaikaa varten.' : 'Digitizing centuries of bathing traditions for the modern era.'}
                        delay={0.1}
                        imgSrc="/card_history.png"
                    />
                    <FeatureCard
                        icon={<Shield className="size-6" />}
                        title={lang === 'sv' ? 'Kulturarv' : lang === 'fi' ? 'Kulttuuriperintö' : 'Cultural Heritage'}
                        desc={lang === 'sv' ? 'Backas av Kulturfonden för Sverige och Finland för att främja gränsöverskridande samarbete.' : lang === 'fi' ? 'Suomalais-ruotsalaisen kulttuurirahaston tukema hanke rajatyylisen yhteistyön edistämiseksi.' : 'Backed by Kulturfonden för Sverige och Finland to foster cross-border cultural collaboration.'}
                        delay={0.2}
                        imgSrc="/card_heritage.png"
                    />
                    <FeatureCard
                        icon={<Wind className="size-6" />}
                        title={lang === 'sv' ? 'Välmående' : lang === 'fi' ? 'Hyvinvointi' : 'Wellbeing'}
                        desc={lang === 'sv' ? 'Upplev den hälsofrämjande magin bakom den nordiska bastun.' : lang === 'fi' ? 'Koe pohjoismaisen saunan terveyttä edistävä taika.' : 'Experience the health-promoting magic behind the Nordic sauna.'}
                        delay={0.3}
                        imgSrc="/card_wellbeing.png"
                    />
                </div>
            </section>

            {/* Interactive Map Section */}
            <section id="map-section" className="max-w-[1440px] mx-auto px-6 md:px-12 py-16 lg:py-32 relative">
                <div className="mb-24 flex flex-col lg:flex-row lg:items-end justify-between gap-12 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="inline-block px-4 py-1.5 mb-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-black tracking-[0.3em] uppercase"
                        >
                            Interactive Atlas
                        </motion.div>
                        <h2 className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
                            {lang === 'sv' ? 'Utforska Kartan' : lang === 'fi' ? 'Tutki Karttaa' : 'Explore the Map'}
                        </h2>
                        <p className="text-xl text-slate-400 font-light leading-relaxed max-w-xl">
                            {lang === 'sv'
                                ? 'Vårt interaktiva verktyg låter dig navigera genom registrerade platser, dolda arkiv och personliga berättelser.'
                                : 'Navigate through registered cultural sites, hidden archives, and personal stories across the Nordic region.'
                            }
                        </p>
                    </motion.div>

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="flex flex-wrap gap-3"
                    >
                        <motion.button
                            variants={itemVariants}
                            onClick={() => handleCountryFilter('All')}
                            className={cn(
                                "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95",
                                filterCountry === 'All'
                                    ? "bg-slate-900 dark:bg-primary text-white shadow-2xl shadow-slate-900/20"
                                    : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                            )}
                        >
                            {lang === 'sv' ? 'Alla' : lang === 'fi' ? 'Kaikki' : 'All'} ({allVisibleSaunas.length})
                        </motion.button>
                        {availableCountries.map(c => {
                            const { flag, name } = getCountryInfo(c);
                            return (
                                <motion.button
                                    key={c}
                                    variants={itemVariants}
                                    onClick={() => handleCountryFilter(c)}
                                    className={cn(
                                        "px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-2",
                                        filterCountry === c
                                            ? "bg-slate-900 dark:bg-primary text-white shadow-2xl shadow-slate-900/20"
                                            : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    )}
                                >
                                    <span>{name} ({getSaunaCount(c)})</span>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative rounded-[4rem] overflow-hidden shadow-2xl shadow-slate-200"
                >
                    <MapView
                        saunas={allVisibleSaunas}
                        lang={lang}
                        filterCountry={filterCountry}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onSaunaSelect={setSelectedSauna}
                        handleCountryFilter={handleCountryFilter}
                    />
                </motion.div>
            </section>

            {/* Contribute Banner - Premium Style */}
            <section className="py-16 lg:py-24 relative overflow-hidden bg-slate-900">
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1519783166144-83936959822a?auto=format&fit=crop&q=80" className="w-full h-full object-cover opacity-20 scale-105" alt="Sauna texture" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/10 to-transparent" />
                </div>

                <div className="max-w-[1240px] mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-none">
                            JOIN THE <br /><span className="text-primary italic">LEGACY.</span>
                        </h2>
                        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                            {lang === 'sv'
                                ? 'Bli en del av historien. Skicka in dina arkivbilder, berättelser och platser idag.'
                                : 'Become part of history. Contribute your archival photos, stories, and locations to the digital archive map today.'}
                        </p>
                        <button
                            onClick={() => user ? setShowContributionForm(true) : setShowAuthModal(true)}
                            className="group bg-primary text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto"
                        >
                            {lang === 'sv' ? 'Bidra till kartan' : 'Add Sauna'}
                            <div className="size-8 bg-white/20 rounded-full flex items-center justify-center -mr-2 group-hover:rotate-45 transition-transform">
                                <PlusCircle className="size-5" />
                            </div>
                        </button>
                    </motion.div>
                </div>
            </section >
        </div >
    );
};

const FeatureCard = ({ icon, title, desc, delay, imgSrc }: { icon: any, title: string, desc: string, delay: number, imgSrc: string }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay, duration: 0.8 }}
        className="group relative overflow-hidden rounded-[3.5rem] bg-slate-900 border border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col min-h-[500px]"
    >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img src={imgSrc} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-70 group-hover:opacity-100" />
            {/* Dark gradient fading from transparent at top to very dark at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />
        </div>
        
        {/* Content Section */}
        <div className="relative z-10 p-10 flex flex-col justify-end flex-1">
            <div className="size-16 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-white border border-white/20 group-hover:bg-primary group-hover:border-primary transition-all duration-500 mb-8">
                {icon}
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-4 tracking-tighter uppercase">{title}</h3>
            <p className="text-white/70 leading-relaxed font-light text-lg">{desc}</p>
        </div>
    </motion.div>
);

// --- Main App Component ---

const App = () => {
    const location = useLocation();
    const [saunas, setSaunas] = useState<Sauna[]>(SAUNAS);
    const [selectedSauna, setSelectedSauna] = useState<Sauna | null>(null);
    const [showContributionForm, setShowContributionForm] = useState(false);
    const [filterCountry, setFilterCountry] = useState<string | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [lang, setLang] = useState<LanguageCode>('sv');
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // AUTH STATE
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [userPanelTab, setUserPanelTab] = useState<'overview' | 'submissions' | 'education' | 'blog' | 'settings'>('overview');
    const handleShowUserPanel = (show: boolean, tab: 'overview' | 'submissions' | 'education' | 'blog' | 'settings' = 'overview') => {
        if (show) {
            setUserPanelTab(tab);
        }
        setShowUserPanel(show);
    };
    const [showBlogEditor, setShowBlogEditor] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    // Theme Management
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Auth Session Manager
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            if (firebaseUser) {
                fetchProfile(firebaseUser.uid);
            } else {
                setProfile(null);
            }
            fetchSaunas();
        });

        return () => unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const docRef = doc(db, 'profiles', userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                const data = docSnap.data() as Profile;
                setProfile(data);

                // Apply saved preferences if they exist
                const prefs = data.metadata?.preferences || data.preferences || {};
                if (prefs.theme) setTheme(prefs.theme);
                if (prefs.language) setLang(prefs.language);
            }
        } catch (err) {
            console.error('Profile fetch failed:', err);
        }
    };

    const fetchSaunas = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, 'saunas'));
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (data && data.length > 0) {
                const dbSaunas = (data || []).map((s: any) => {
                    // Resilient parsing for JSON fields
                    const metadata = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : (s.metadata || {});
                    const coordinates = typeof s.coordinates === 'string' ? JSON.parse(s.coordinates) : (s.coordinates || {});
                    const content = typeof s.content === 'string' ? JSON.parse(s.content) : (s.content || {});

                    // Extract and normalize country (fallback to Finland if missing)
                    let rawCountry = metadata?.country || s.country || 'Finland';
                    if (typeof rawCountry === 'string' && rawCountry) {
                        rawCountry = rawCountry.charAt(0).toUpperCase() + rawCountry.slice(1).toLowerCase();
                    } else {
                        rawCountry = 'Finland';
                    }

                    return {
                        ...s,
                        metadata,
                        coordinates,
                        content,
                        country: rawCountry
                    };
                });
                setSaunas(dbSaunas);
            }
        } catch (err) {
            console.error('Saunas fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const getSaunaCount = (country: string) => {
        return saunas.filter(s => s.country === country).length;
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

    const handleCountryFilter = (country: string | 'All') => {
        setFilterCountry(country);
    };

    const getCountryInfo = (country: string) => {
        const info = {
            'Finland': { flag: '🇫🇮', en: 'Finland', sv: 'Finland', fi: 'Suomi' },
            'Sweden': { flag: '🇸🇪', en: 'Sweden', sv: 'Sverige', fi: 'Ruotsi' },
            'Norway': { flag: '🇳🇴', en: 'Norway', sv: 'Norge', fi: 'Norja' },
            'Denmark': { flag: '🇩🇰', en: 'Denmark', sv: 'Danmark', fi: 'Tanska' },
            'Iceland': { flag: '🇮🇸', en: 'Iceland', sv: 'Island', fi: 'Islanti' }
        }[country];

        if (info) {
            return {
                flag: info.flag,
                name: lang === 'sv' ? info.sv : lang === 'fi' ? info.fi : info.en
            };
        }

        return {
            flag: '🌍',
            name: country || (lang === 'sv' ? 'Övrigt' : lang === 'fi' ? 'Muut' : 'Other')
        };
    };

    const allVisibleSaunas = saunas.filter(s => filterCountry === 'All' || s.country === filterCountry);
    const availableCountries = Array.from(new Set(saunas.map(s => s.country))).filter(Boolean);

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
            setShowUserPanel={handleShowUserPanel}
        >
            <Snowfall />
            <Routes>
                <Route path="/" element={
                    <HomePage
                        lang={lang}
                        scrollToSection={scrollToSection}
                        filterCountry={filterCountry}
                        handleCountryFilter={handleCountryFilter}
                        allVisibleSaunas={allVisibleSaunas}
                        availableCountries={availableCountries}
                        getSaunaCount={getSaunaCount}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        user={user}
                        setShowContributionForm={setShowContributionForm}
                        setShowAuthModal={setShowAuthModal}
                        setSelectedSauna={setSelectedSauna}
                        getCountryInfo={getCountryInfo}
                    />
                } />
                <Route path="/blog" element={<BlogPage lang={lang} user={user} profile={profile} onWritePost={() => setShowBlogEditor(true)} />} />
                <Route path="/news" element={<NewsPage lang={lang} />} />
                <Route path="/education" element={<EducationPage lang={lang} />} />
                <Route path="/outputs/comparative-report" element={<ComparativeReportPage lang={lang} />} />
                <Route path="/outputs/proverbs" element={<ProverbsPage lang={lang} />} />
                <Route path="/about" element={<AboutPage lang={lang} />} />
                <Route path="/partners" element={<PartnersPage lang={lang} />} />
                <Route path="/privacy" element={<PrivacyPolicyPage lang={lang} />} />
                <Route path="/cookies" element={<CookiePolicyPage lang={lang} />} />
                <Route path="/unsubscribe" element={<UnsubscribePage lang={lang} />} />
            </Routes>

            {/* Modals */}
            <AnimatePresence>
                {selectedSauna && <SaunaModal sauna={selectedSauna} lang={lang} onClose={() => setSelectedSauna(null)} />}
                {showContributionForm && <ContributionForm lang={lang} currentUser={user} onClose={() => setShowContributionForm(false)} />}
                {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}
                {showAdminPanel && <AdminPanel lang={lang} profile={profile} user={user} onClose={() => setShowAdminPanel(false)} onUpdate={fetchSaunas} />}
                {showUserPanel && user && (
                    <UserPanel
                        lang={lang}
                        user={user}
                        profile={profile}
                        onClose={() => setShowUserPanel(false)}
                        onAddSauna={() => setShowContributionForm(true)}
                        theme={theme}
                        setTheme={setTheme}
                        setLang={setLang}
                        onUpdate={fetchSaunas}
                        initialTab={userPanelTab}
                    />
                )}
                {showBlogEditor && user && <BlogPostEditor lang={lang} user={user} onClose={() => setShowBlogEditor(false)} onSuccess={() => setShowBlogEditor(false)} />}
            </AnimatePresence>
        </Layout>
    );
};

export default App;