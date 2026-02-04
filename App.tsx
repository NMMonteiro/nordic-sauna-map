import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
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
import { BlogPostEditor } from './components/BlogPostEditor';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import * as L from 'leaflet';

// --- Sub-components (Moved outside to prevent re-creation on every render) ---

const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="py-24 max-w-[1200px] mx-auto px-6 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4">{title}</h1>
        <p className="text-slate-500">This section is currently under development to reflect the Nordic heritage.</p>
    </div>
);

interface HomePageProps {
    lang: LanguageCode;
    scrollToSection: (id: string) => (e: React.MouseEvent) => void;
    filterCountry: string;
    handleCountryFilter: (country: string | 'All') => void;
    allVisibleSaunas: Sauna[];
    availableCountries: string[];
    getSaunaCount: (country: string) => number;
    mapContainerRef: React.RefObject<HTMLDivElement>;
    handleZoomIn: () => void;
    handleZoomOut: () => void;
    handleReset: () => void;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    handleSearch: () => void;
    user: User | null;
    setShowContributionForm: (show: boolean) => void;
    setShowAuthModal: (show: boolean) => void;
}

const HomePage = ({
    lang,
    scrollToSection,
    filterCountry,
    handleCountryFilter,
    allVisibleSaunas,
    availableCountries,
    getSaunaCount,
    mapContainerRef,
    handleZoomIn,
    handleZoomOut,
    handleReset,
    searchTerm,
    setSearchTerm,
    handleSearch,
    user,
    setShowContributionForm,
    setShowAuthModal
}: HomePageProps) => (
    <>
        {/* Hero Section */}
        <section id="hero-section" className="relative h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
                <video autoPlay muted loop playsInline className="w-full h-full object-cover">
                    <source src="/Hero.mp4" type="video/mp4" />
                </video>
            </div>
            <div className="relative z-30 text-center max-w-4xl px-6">
                <span className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/30 text-white text-xs font-bold tracking-[0.2em] uppercase bg-black/20 backdrop-blur-sm">
                    {lang === 'sv' ? 'Gränsöverskridande Kulturarv' : lang === 'fi' ? 'Rajat ylittävä kulttuuriperintö' : 'Cross-Border Cultural Heritage'}
                </span>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                    {lang === 'sv' ? (
                        <>Bevara värmen i <br /><span className="text-sky">nordiska traditioner.</span></>
                    ) : lang === 'fi' ? (
                        <>Säilytä <br /><span className="text-sky">pohjoismaisen perinteen lämpö.</span></>
                    ) : (
                        <>Preserving the Heat of <br /><span className="text-sky">Nordic Traditions.</span></>
                    )}
                </h1>
                <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
                    {lang === 'sv'
                        ? 'Upptäck den atmosfäriska historien och de levande traditionerna av finska rökbastur och svenska vinterbad i vårt interaktiva digitala arkiv.'
                        : lang === 'fi'
                            ? 'Tutustu suomalaisten savusaunojen ja ruotsalaisten talvikylpyjen tunnelmalliseen historiaan ja eläviin perinteisiin interaktiivisessa digitaalisessa arkistossamme.'
                            : 'Discover the atmospheric history and living traditions of Finnish smoke saunas and Swedish winter baths in our interactive digital archive.'
                    }
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={scrollToSection('map-section')}
                        className="bg-white text-primary hover:scale-105 transition-transform px-10 py-4 rounded-xl font-bold flex items-center gap-2 shadow-2xl"
                    >
                        {lang === 'sv' ? 'Utforska kartan' : lang === 'fi' ? 'Tutki karttaa' : 'Explore the Map'} <span className="material-symbols-outlined">map</span>
                    </button>
                </div>
            </div>

            {/* Fixed Scroll Indicator positioning */}
            <div className="absolute bottom-[90px] left-0 right-0 z-30 flex justify-center animate-bounce pointer-events-none">
                <button
                    onClick={scrollToSection('map-section')}
                    className="pointer-events-auto text-white flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
                >
                    <span className="text-[10px] font-bold tracking-widest uppercase">Scroll</span>
                    <span className="material-symbols-outlined text-3xl">expand_more</span>
                </button>
            </div>
        </section>

        {/* Interactive Map Section */}
        <section id="map-section" className="max-w-[1200px] mx-auto px-6 py-24">
            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-4">{lang === 'sv' ? 'Interaktiv Arkivkarta' : lang === 'fi' ? 'Interaktiivinen arkistokartta' : 'Interactive Archive Map'}</h2>
                    <p className="text-slate-500 max-w-lg font-light">
                        {lang === 'sv'
                            ? 'Navigera genom registrerade kulturplatser i Norden. Filtrera efter bastutyp, historisk betydelse eller geografiskt område.'
                            : lang === 'fi'
                                ? 'Navigoi Pohjoismaiden rekisteröityjen kulttuurikohteiden välillä. Suodata saunatyypin, historiallisen merkityksen tai maantieteellisen alueen mukaan.'
                                : 'Navigate through registered cultural sites across the Nordic region. Filter by sauna type, historical significance, or geographical area.'
                        }
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => handleCountryFilter('All')}
                        className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all ${filterCountry === 'All' ? 'bg-nordic-lake border-transparent text-white shadow-lg shadow-primary/20' : 'bg-white border-sky/20 text-slate-500 hover:border-primary/40'}`}
                    >
                        {lang === 'sv' ? 'Alla' : lang === 'fi' ? 'Kaikki' : 'All'} ({allVisibleSaunas.length})
                    </button>
                    {availableCountries.map(c => (
                        <button
                            key={c}
                            onClick={() => handleCountryFilter(c)}
                            className={`px-5 py-2.5 rounded-full border text-sm font-bold transition-all ${filterCountry === c ? 'bg-nordic-lake border-transparent text-white shadow-lg shadow-primary/20' : 'bg-white border-sky/20 text-slate-500 hover:border-primary/40'}`}
                        >
                            {c} ({getSaunaCount(c)})
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative w-full h-[600px] bg-white rounded-[2rem] border border-sky/20 shadow-2xl overflow-hidden group p-2">
                <div ref={mapContainerRef} className="relative w-full h-full z-10 bg-slate-50 rounded-[1.5rem] overflow-hidden shadow-inner"></div>

                <div className="absolute top-8 left-8 z-10 flex flex-col gap-2 pointer-events-auto">
                    <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-sky/10 shadow-xl">
                        <button onClick={handleZoomIn} className="flex size-11 items-center justify-center hover:bg-sky/10 rounded-xl text-primary transition-colors active:scale-95">
                            <span className="material-symbols-outlined font-bold">add</span>
                        </button>
                        <div className="h-px w-full bg-sky/10 my-1"></div>
                        <button onClick={handleZoomOut} className="flex size-11 items-center justify-center hover:bg-sky/10 rounded-xl text-primary transition-colors active:scale-95">
                            <span className="material-symbols-outlined font-bold">remove</span>
                        </button>
                    </div>
                    <button onClick={handleReset} className="bg-white/90 backdrop-blur-md size-11 flex items-center justify-center rounded-2xl border border-sky/10 shadow-xl text-primary active:scale-95 transition-transform">
                        <span className="material-symbols-outlined font-bold text-sky">my_location</span>
                    </button>
                </div>

                <div className="absolute bottom-10 left-0 right-0 px-6 z-20 flex justify-center pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-xl border border-sky/20 rounded-full p-1.5 flex items-center shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-all pointer-events-auto w-full max-w-md">
                        <span className="material-symbols-outlined text-primary ml-3 text-[22px] select-none shrink-0">search</span>
                        <input
                            className="bg-transparent border-none flex-1 text-slate-800 placeholder-slate-400 focus:ring-0 text-sm px-3 min-w-0"
                            placeholder={lang === 'sv' ? 'Sök platser...' : lang === 'fi' ? 'Etsi kohteita...' : 'Search locations...'}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button onClick={handleSearch} className="bg-nordic-lake text-white text-[10px] font-black uppercase tracking-[0.15em] h-10 px-6 rounded-full shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center justify-center shrink-0">
                            {lang === 'sv' ? 'Sök' : lang === 'fi' ? 'Hae' : 'Search'}
                        </button>
                    </div>
                </div>
            </div>
        </section>

        {/* Educational Section */}
        <section id="education-section" className="bg-frost py-24">
            <div className="max-w-[1200px] mx-auto px-6 text-center">
                <h2 className="text-4xl font-black text-slate-900 mb-8">Learning the Heat</h2>
                <p className="text-slate-500 mb-12 max-w-2xl mx-auto">Explore our pedagogical resources designed to bring Nordic heritage into the classroom.</p>
                <Link to="/education" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform">View All Resources</Link>
            </div>
        </section>

        {/* Contribute Banner */}
        <section className="bg-nordic-lake py-24 relative overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none"></div>
            <div className="max-w-[1200px] mx-auto px-6 text-center text-white relative z-10">
                <h2 className="text-4xl font-black mb-6">
                    {lang === 'sv' ? 'Är du en bastuägare?' : lang === 'fi' ? 'Oletko saunan omistaja?' : 'Are you a Sauna Owner?'}
                </h2>
                <p className="text-white/80 max-w-2xl mx-auto mb-12 text-lg font-light leading-relaxed">
                    {lang === 'sv' ? 'Bidra till det nordiska kulturarvet genom att skicka in din bastus historia.' : 'Contribute to the Nordic cultural heritage by submitting your sauna\'s history.'}
                </p>
                <button
                    onClick={() => user ? setShowContributionForm(true) : setShowAuthModal(true)}
                    className="bg-white text-primary px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl shadow-primary/40"
                >
                    {lang === 'sv' ? 'Skicka in ditt bidrag' : 'Submit Your Archive Entry'}
                </button>
            </div>
        </section>
    </>
);

// --- Main App Component ---

const App = () => {
    const location = useLocation();
    console.log("App component mounting or route changed:", location.pathname);
    // Fallback to SAUNAS constants if DB is empty to ensure user sees content
    const [saunas, setSaunas] = useState<Sauna[]>(SAUNAS);
    const [selectedSauna, setSelectedSauna] = useState<Sauna | null>(null);
    const [showContributionForm, setShowContributionForm] = useState(false);
    const [filterCountry, setFilterCountry] = useState<string | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [lang, setLang] = useState<LanguageCode>('sv');
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // AUTH STATE
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [showBlogEditor, setShowBlogEditor] = useState(false);

    // Auth Session Manager
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            }
            fetchSaunas();
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
            }
            fetchSaunas();
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            if (error) throw error;
            setProfile(data);
        } catch (err) {
            console.error('Profile fetch failed:', err);
        }
    };

    const fetchSaunas = async () => {
        setLoading(true);
        try {
            console.log("Fetching saunas from Supabase...");
            const { data, error } = await supabase
                .from('saunas')
                .select('*');

            if (error) throw error;

            console.log(`Successfully fetched ${data?.length || 0} saunas.`);

            if (data && data.length > 0) {
                const dbSaunas = (data || []).map(s => ({
                    ...s,
                    coordinates: typeof s.coordinates === 'string' ? JSON.parse(s.coordinates) : s.coordinates,
                    content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content
                }));
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

    // Initialize Map - route-aware to prevent blank map on navigation
    useEffect(() => {
        // If we are not on the home page, make sure to clean up the map if it exists
        if (location.pathname !== '/') {
            if (mapInstance) {
                console.log("Navigating away from home. Cleaning up map instance...");
                mapInstance.remove();
                setMapInstance(null);
            }
            return;
        }

        // If we ARE on home but map isn't inited and container is ready
        if (mapContainerRef.current && !mapInstance) {
            console.log("Initializing map instance on Home route...");
            const map = L.map(mapContainerRef.current, {
                center: [64.0, 20.0],
                zoom: 5,
                zoomControl: false,
                attributionControl: true
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Required to ensure tiles render correctly in dynamic layouts
            setTimeout(() => {
                map.invalidateSize();
            }, 100);

            setMapInstance(map);
        }

        // Optional: Ensure markers are updated immediately on init
    }, [location.pathname, mapInstance]);

    const filteredSaunas = saunas.filter(s => {
        const matchesCountry = filterCountry === 'All' || s.country === filterCountry;
        const content = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
        const name = (content?.[lang]?.name || content?.['en']?.name || '').toLowerCase();
        const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
        return matchesCountry && matchesSearch;
    });

    // Update Markers
    useEffect(() => {
        if (!mapInstance) return;

        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        filteredSaunas.forEach(sauna => {
            const lat = Number(sauna.coordinates?.lat);
            const lng = Number(sauna.coordinates?.lng);
            if (isNaN(lat) || isNaN(lng)) return;

            const content = typeof sauna.content === 'string' ? JSON.parse(sauna.content) : sauna.content;
            const langContent = content?.[lang] || content?.['en'] || (content ? Object.values(content)[0] : null);
            const saunaName = (langContent as any)?.name || 'Sauna';

            const icon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `
                    <div class="relative group cursor-pointer" id="marker-${sauna.sauna_id}">
                      <div class="absolute -inset-3 bg-primary/20 rounded-full animate-ping opacity-60"></div>
                      <div class="relative bg-white w-4 h-4 rounded-full border-2 border-primary shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform hover:scale-125"></div>
                      <div class="absolute left-6 top-1/2 -translate-y-1/2 bg-white text-primary text-[10px] font-black py-1.5 px-3 rounded-full shadow-xl border border-sky/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0 pointer-events-none z-50">
                         ${saunaName}
                      </div>
                    </div>
                `,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            const marker = L.marker([lat, lng], { icon })
                .addTo(mapInstance)
                .on('click', () => {
                    setSelectedSauna(sauna);
                    mapInstance.flyTo([lat, lng], 10, { duration: 1.5 });
                });

            markersRef.current.push(marker);
        });
    }, [saunas, filterCountry, searchTerm, lang, mapInstance]);

    const handleCountryFilter = (country: string | 'All') => {
        setFilterCountry(country);
        if (!mapInstance) return;

        let center: L.LatLngExpression = [64.0, 20.0];
        let zoom = 5;

        if (country === Country.FINLAND) {
            center = [64.5, 26.0];
            zoom = 6;
        } else if (country === Country.SWEDEN) {
            center = [62.0, 15.0];
            zoom = 6;
        }

        mapInstance.flyTo(center, zoom, { duration: 1.5 });
    };

    const handleSearch = () => {
        if (!searchTerm.trim()) {
            setFilterCountry('All');
            if (mapInstance) mapInstance.flyTo([64.0, 20.0], 5, { duration: 1.5 });
            return;
        }

        const found = saunas.find(s => {
            const content = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
            const name = (content?.[lang]?.name || content?.['en']?.name || '').toLowerCase();
            return name.includes(searchTerm.toLowerCase());
        });

        if (found && mapInstance) {
            const lat = Number(found.coordinates?.lat);
            const lng = Number(found.coordinates?.lng);
            if (!isNaN(lat) && !isNaN(lng)) {
                mapInstance.flyTo([lat, lng], 12, { duration: 1.5 });
                setSelectedSauna(found);
            }
        }
    };

    const handleZoomIn = () => mapInstance?.zoomIn();
    const handleZoomOut = () => mapInstance?.zoomOut();
    const handleReset = () => {
        setFilterCountry('All');
        setSearchTerm('');
        mapInstance?.flyTo([64.0, 20.0], 5, { duration: 1.5 });
    };

    const allVisibleSaunas = saunas.filter(s => filterCountry === 'All' || s.country === filterCountry);
    const availableCountries = Array.from(new Set(saunas.map(s => s.country)));

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
        >
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
                        mapContainerRef={mapContainerRef}
                        handleZoomIn={handleZoomIn}
                        handleZoomOut={handleZoomOut}
                        handleReset={handleReset}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        handleSearch={handleSearch}
                        user={user}
                        setShowContributionForm={setShowContributionForm}
                        setShowAuthModal={setShowAuthModal}
                    />
                } />
                <Route path="/blog" element={<BlogPage lang={lang} user={user} profile={profile} onWritePost={() => setShowBlogEditor(true)} />} />
                <Route path="/news" element={<NewsPage lang={lang} />} />
                <Route path="/education" element={<EducationPage lang={lang} />} />
                <Route path="/about" element={<AboutPage lang={lang} />} />
                <Route path="/partners" element={<PartnersPage lang={lang} />} />
            </Routes>

            {/* Modals */}
            {selectedSauna && <SaunaModal sauna={selectedSauna} lang={lang} onClose={() => setSelectedSauna(null)} />}
            {showContributionForm && <ContributionForm lang={lang} currentUser={user} onClose={() => setShowContributionForm(false)} />}
            {showAuthModal && <AuthModal lang={lang} onClose={() => setShowAuthModal(false)} onSuccess={() => setShowAuthModal(false)} />}
            {showAdminPanel && <AdminPanel lang={lang} profile={profile} user={user} onClose={() => setShowAdminPanel(false)} onUpdate={fetchSaunas} />}
            {showUserPanel && user && <UserPanel lang={lang} user={user} profile={profile} onClose={() => setShowUserPanel(false)} onAddSauna={() => setShowContributionForm(true)} />}
            {showBlogEditor && user && <BlogPostEditor lang={lang} user={user} onClose={() => setShowBlogEditor(false)} onSuccess={() => setShowBlogEditor(false)} />}
        </Layout>
    );
};

export default App;