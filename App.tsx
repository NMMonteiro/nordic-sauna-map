/// <reference types="vite/client" />
import React, { useState, useEffect, useRef } from 'react';
import { SAUNAS } from './constants';
import { Sauna, LanguageCode, Country, Profile } from './types';
import { SaunaModal } from './components/SaunaModal';
import { ContributionForm } from './components/ContributionForm';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { UserPanel } from './components/UserPanel';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import * as L from 'leaflet';

// Free Map Service (Leaflet + CartoDB)

const App = () => {
    console.log("App component mounting...");
    const [saunas, setSaunas] = useState<Sauna[]>(SAUNAS);
    const [selectedSauna, setSelectedSauna] = useState<Sauna | null>(null);
    const [showContributionForm, setShowContributionForm] = useState(false);
    const [filterCountry, setFilterCountry] = useState<string | 'All'>('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [lang, setLang] = useState<LanguageCode>('sv');
    const [loading, setLoading] = useState(true);

    const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<L.Marker[]>([]);

    // AUTH STATE
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAdminPanel, setShowAdminPanel] = useState(false);
    const [showUserPanel, setShowUserPanel] = useState(false);

    // Auth Session Manager
    useEffect(() => {
        // Resolve initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchSaunas();
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
                fetchSaunas();
            } else {
                setProfile(null);
                fetchSaunas();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (!error && data) {
            setProfile(data as Profile);
        }
    };

    const fetchSaunas = async () => {
        try {
            console.log("Fetching latest sauna data from Supabase...");
            const { data, error } = await supabase
                .from('saunas')
                .select('*');

            if (error) throw error;
            if (data && data.length > 0) {
                console.log(`Successfully fetched ${data.length} saunas. Syncing UI...`);
                setSaunas(data as Sauna[]);
            } else {
                console.log("No saunas found in database. Using local archive.");
            }
        } catch (err) {
            console.error('Supabase Sync Error:', err);
        } finally {
            setLoading(false);
        }
    }

    // Data Fetching - Background Sync
    useEffect(() => {
        fetchSaunas();
    }, []);

    // Filter Logic
    const allVisibleSaunas = saunas.filter(sauna => {
        if (!sauna) return false;

        // Visibility check: Only show approved saunas to public/regular users
        const isApproved = sauna.status === 'approved';
        const isOwner = user && sauna.created_by === user.id;
        const isAdmin = profile?.role === 'admin';

        return (isApproved || isAdmin || isOwner);
    });

    const filteredSaunas = allVisibleSaunas.filter(sauna => {
        const content = typeof sauna.content === 'string' ? JSON.parse(sauna.content) : sauna.content;
        const metadata = typeof sauna.metadata === 'string' ? JSON.parse(sauna.metadata) : sauna.metadata;
        if (!content || !metadata) return false;

        const langContent = content[lang] || content['en'] || (content ? Object.values(content)[0] : null);
        if (!langContent || !(langContent as any).name) return false;

        const matchesCountry = filterCountry === 'All' || metadata.country === filterCountry;
        const matchesSearch = ((langContent as any).name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (metadata.region || '').toLowerCase().includes(searchTerm.toLowerCase());

        return matchesCountry && matchesSearch;
    });

    const getSaunaCount = (country: string) => {
        return allVisibleSaunas.filter(s => {
            const metadata = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : s.metadata;
            return metadata?.country === country;
        }).length;
    };

    // Dynamic country extraction (only from visible saunas)
    const availableCountries = Array.from(new Set(allVisibleSaunas.map(s => {
        const metadata = typeof s.metadata === 'string' ? JSON.parse(s.metadata) : s.metadata;
        return metadata?.country;
    }).filter(Boolean))).sort() as string[];

    // Scroll Handler
    const scrollToSection = (id: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapInstance) return;

        console.log("Initializing map instance...");

        const map = L.map(mapContainerRef.current, {
            center: [64.0, 20.0],
            zoom: 5,
            zoomControl: false,
            attributionControl: true
        });

        // Small delay to ensure container size is stabilized
        const timer = setTimeout(() => {
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
            }).addTo(map);
            map.invalidateSize();
            console.log("Map tiles loaded successfully");
        }, 500);

        setMapInstance(map);

        return () => {
            clearTimeout(timer);
            if (map) {
                map.remove();
            }
        };
    }, []);

    // Update Markers
    useEffect(() => {
        if (!mapInstance) return;

        console.log(`Syncing ${filteredSaunas.length} markers to map...`);

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        filteredSaunas.forEach(sauna => {
            // Robust coordinate checking
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
                    mapInstance.flyTo([lat, lng], 10, {
                        duration: 1.5
                    });
                });

            markersRef.current.push(marker);
        });
    }, [filteredSaunas, lang, mapInstance]);

    // Handle Country Filter and Focus
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

        mapInstance.flyTo(center, zoom, {
            duration: 1.5,
            easeLinearity: 0.25
        });
    };

    // Handle Global Search (Archive + Geocoding)
    const handleSearch = async () => {
        if (!searchTerm.trim() || !mapInstance) return;

        // 1. First, check if there's a direct sauna name/region match in our archive
        if (filteredSaunas.length === 1) {
            const sauna = filteredSaunas[0];
            setSelectedSauna(sauna);
            mapInstance.flyTo([sauna.coordinates.lat, sauna.coordinates.lng], 12, { duration: 1.5 });
            return;
        }

        // 2. If no direct single match, use OSM Nominatim for a geographic search
        try {
            console.log("Performing geographic search for:", searchTerm);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                mapInstance.flyTo([parseFloat(lat), parseFloat(lon)], 10, {
                    duration: 2,
                    easeLinearity: 0.25
                });
            } else {
                console.log("No location results found for:", searchTerm);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    };

    const handleZoomIn = () => mapInstance?.zoomIn();
    const handleZoomOut = () => mapInstance?.zoomOut();
    const handleReset = () => {
        setSearchTerm('');
        handleCountryFilter('All');
    };


    if (loading && saunas.length === 0) {
        return <div className="min-h-screen bg-snow flex items-center justify-center text-primary font-bold">Loading Archive...</div>;
    }

    return (
        <div className="min-h-screen font-display bg-snow">

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-sky/20">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-10">
                        <a className="flex items-center gap-3" href="#" onClick={scrollToSection('hero-section')}>
                            <img src="/logo.png" className="size-8 object-contain" alt="Logo" />
                            <h2 className="text-xl font-black tracking-tight uppercase text-primary">Nordic Sauna Map</h2>
                        </a>
                        <nav className="hidden md:flex items-center gap-8">
                            <button className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" onClick={scrollToSection('map-section')}>Archives</button>
                            <button className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" onClick={scrollToSection('education-section')}>Education</button>
                            <button className="text-sm font-medium hover:text-primary transition-colors cursor-pointer" onClick={scrollToSection('about-section')}>About</button>
                            <div className="h-4 w-px bg-sky/20"></div>
                            <div className="flex gap-3 text-xs font-bold tracking-widest text-slate-500">
                                <button
                                    onClick={() => setLang('sv')}
                                    className={`hover:text-primary transition-colors ${lang === 'sv' ? 'text-primary underline underline-offset-4 decoration-sky' : 'text-slate-400'}`}
                                >SV</button>
                                <button
                                    onClick={() => setLang('fi')}
                                    className={`hover:text-primary transition-colors ${lang === 'fi' ? 'text-primary underline underline-offset-4 decoration-sky' : 'text-slate-400'}`}
                                >FI</button>
                                <button
                                    onClick={() => setLang('en')}
                                    className={`hover:text-primary transition-colors ${lang === 'en' ? 'text-primary underline underline-offset-4 decoration-sky' : 'text-slate-400'}`}
                                >EN</button>
                            </div>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        {profile?.role === 'admin' && (
                            <button
                                onClick={() => setShowAdminPanel(true)}
                                className="hidden lg:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all font-display"
                            >
                                <span className="material-symbols-outlined text-sm">settings</span>
                                Admin
                            </button>
                        )}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowUserPanel(true)}
                                    className="text-right cursor-pointer group hidden sm:block"
                                >
                                    <div className="text-[10px] font-black uppercase text-slate-400 leading-none mb-1 group-hover:text-primary transition-colors">Authenticated</div>
                                    <div className="text-xs font-bold text-slate-800 leading-none group-hover:text-primary transition-colors">{profile?.full_name || user.email}</div>
                                </button>
                                <button
                                    onClick={() => supabase.auth.signOut()}
                                    className="size-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xl">logout</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowAuthModal(true)}
                                className="px-6 py-2.5 bg-nordic-lake text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all"
                            >
                                {lang === 'sv' ? 'Logga in' : lang === 'fi' ? 'Kirjaudu' : 'Sign In'}
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="w-full">
                {/* Hero Section */}
                <section id="hero-section" className="relative h-screen flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-slate-900/40 z-10"></div>
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover"
                        >
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

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 animate-bounce">
                        <button
                            onClick={scrollToSection('map-section')}
                            className="text-white flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
                        >
                            <span className="text-[10px] font-bold tracking-widest uppercase">Scroll</span>
                            <span className="material-symbols-outlined text-3xl">expand_more</span>
                        </button>
                    </div>
                </section>

                {/* Interactive Map Focal Point */}
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
                        {/* MAP CONTAINER */}
                        <div ref={mapContainerRef} className="relative w-full h-full z-10 bg-slate-50 rounded-[1.5rem] overflow-hidden shadow-inner"></div>

                        {/* Map Controls Overlay */}
                        <div className="absolute top-8 left-8 z-10 flex flex-col gap-2 pointer-events-auto">
                            <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-sky/10 shadow-xl">
                                <button
                                    onClick={handleZoomIn}
                                    className="flex size-11 items-center justify-center hover:bg-sky/10 rounded-xl text-primary transition-colors active:scale-95"
                                >
                                    <span className="material-symbols-outlined font-bold">add</span>
                                </button>
                                <div className="h-px w-full bg-sky/10 my-1"></div>
                                <button
                                    onClick={handleZoomOut}
                                    className="flex size-11 items-center justify-center hover:bg-sky/10 rounded-xl text-primary transition-colors active:scale-95"
                                >
                                    <span className="material-symbols-outlined font-bold">remove</span>
                                </button>
                            </div>
                            <button
                                onClick={handleReset}
                                className="bg-white/90 backdrop-blur-md size-11 flex items-center justify-center rounded-2xl border border-sky/10 shadow-xl text-primary active:scale-95 transition-transform"
                            >
                                <span className="material-symbols-outlined font-bold text-sky">my_location</span>
                            </button>
                        </div>

                        {/* Floating Search on Map - Polished Pill Design */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-20 pointer-events-auto">
                            <div className="bg-white/95 backdrop-blur-xl border border-sky/20 rounded-full p-1.5 flex items-center shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-all">
                                <span className="material-symbols-outlined text-primary ml-3 text-[22px] select-none shrink-0">search</span>
                                <input
                                    className="bg-transparent border-none flex-1 text-slate-800 placeholder-slate-400 focus:ring-0 text-sm px-3 min-w-0"
                                    placeholder={lang === 'sv' ? 'Sök platser...' : lang === 'fi' ? 'Etsi kohteita...' : 'Search locations...'}
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <button
                                    onClick={handleSearch}
                                    className="bg-nordic-lake text-white text-[10px] font-black uppercase tracking-[0.15em] h-10 px-6 rounded-full shadow-md shadow-primary/20 active:scale-95 transition-all flex items-center justify-center shrink-0"
                                >
                                    {lang === 'sv' ? 'Sök' : lang === 'fi' ? 'Hae' : 'Search'}
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Educational Section */}
                <section id="education-section" className="bg-frost py-24">
                    <div className="max-w-[1200px] mx-auto px-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                            <div>
                                <span className="text-primary font-black text-xs tracking-widest uppercase mb-3 block">Pedagogical Resources</span>
                                <h2 className="text-4xl font-black text-slate-900">Learning the Heat</h2>
                            </div>
                            <a className="text-primary font-bold flex items-center gap-2 hover:underline group" href="#">
                                View all resources <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                            </a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Resource Card 1 */}
                            <div className="group bg-white p-8 rounded-[2.5rem] border border-sky/10 hover:border-primary/30 transition-all cursor-pointer shadow-xl shadow-sky/5 hover:shadow-2xl">
                                <div className="aspect-video rounded-3xl mb-8 overflow-hidden bg-sky/5 relative">
                                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Modern educational classroom materials" src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop" />
                                    <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">PDF</div>
                                </div>
                                <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors">Primary School Lesson Plan</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light">Designed for ages 7-11. Introduces the chemistry of steam (löyly) and the communal history of Nordic bathing.</p>
                                <div className="flex items-center justify-between pt-6 border-t border-sky/10">
                                    <span className="text-xs font-bold text-sky">1.2 MB • SV | FI</span>
                                    <span className="material-symbols-outlined text-sky group-hover:text-primary transition-all">download</span>
                                </div>
                            </div>

                            {/* Resource Card 2 */}
                            <div className="group bg-white p-8 rounded-[2.5rem] border border-sky/10 hover:border-primary/30 transition-all cursor-pointer shadow-xl shadow-sky/5 hover:shadow-2xl">
                                <div className="aspect-video rounded-3xl mb-8 overflow-hidden bg-sky/5 relative">
                                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Old archival books" src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop" />
                                    <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">PDF</div>
                                </div>
                                <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors">Archival Research Guide</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light">Step-by-step methodology for university students conducting research on vernacular sauna architecture.</p>
                                <div className="flex items-center justify-between pt-6 border-t border-sky/10">
                                    <span className="text-xs font-bold text-sky">2.4 MB • EN</span>
                                    <span className="material-symbols-outlined text-sky group-hover:text-primary transition-all">download</span>
                                </div>
                            </div>

                            {/* Resource Card 3 */}
                            <div className="group bg-white p-8 rounded-[2.5rem] border border-sky/10 hover:border-primary/30 transition-all cursor-pointer shadow-xl shadow-sky/5 hover:shadow-2xl">
                                <div className="aspect-video rounded-3xl mb-8 overflow-hidden bg-sky/5 relative">
                                    <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="People discussing" src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2032&auto=format&fit=crop" />
                                    <div className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">PDF</div>
                                </div>
                                <h3 className="text-xl font-black mb-3 group-hover:text-primary transition-colors">Secondary School Activities</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light">Group projects focused on the socio-economic impacts of the wellness industry across the Baltic Sea.</p>
                                <div className="flex items-center justify-between pt-6 border-t border-sky/10">
                                    <span className="text-xs font-bold text-sky">1.8 MB • SV | FI | EN</span>
                                    <span className="material-symbols-outlined text-sky group-hover:text-primary transition-all">download</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contribute Section */}
                <section className="bg-nordic-lake py-24 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none"></div>
                    <div className="max-w-[1200px] mx-auto px-6 text-center text-white relative z-10">
                        <h2 className="text-4xl font-black mb-6">
                            {lang === 'sv' ? 'Är du en bastuägare?' : lang === 'fi' ? 'Oletko saunan omistaja?' : 'Are you a Sauna Owner?'}
                        </h2>
                        <p className="text-white/80 max-w-2xl mx-auto mb-12 text-lg font-light leading-relaxed">
                            {lang === 'sv'
                                ? 'Bidra till det nordiska kulturarvet genom att skicka in din bastus historia, foton och unika berättelser till vårt växande arkiv.'
                                : lang === 'fi'
                                    ? 'Osallistu pohjoismaiseen kulttuuriperintöön lähettämällä saunasi historia, valokuvat ja ainutlaatuiset tarinat kasvavaan arkistoomme.'
                                    : 'Contribute to the Nordic cultural heritage by submitting your sauna\'s history, photos, and unique stories to our growing archive.'
                            }
                        </p>
                        <button
                            onClick={() => {
                                if (!user) {
                                    setShowAuthModal(true);
                                } else if (profile?.status !== 'approved') {
                                    alert(lang === 'sv' ? 'Ditt konto väntar på godkännande.' : 'Your account is pending approval.');
                                } else {
                                    setShowContributionForm(true);
                                }
                            }}
                            className="bg-white text-primary px-12 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform shadow-2xl shadow-primary/40"
                        >
                            {lang === 'sv' ? 'Skicka in ditt bidrag' : lang === 'fi' ? 'Lähetä arkistomerkintä' : 'Submit Your Archive Entry'}
                        </button>
                    </div>
                </section>
            </main>

            <footer className="bg-white py-16 text-center text-slate-400 text-sm border-t border-sky/10">
                <p className="font-medium">© 2024 Nordic Sauna Map project. A shared cultural heritage archive.</p>
            </footer>

            {/* Modal */}
            {selectedSauna && (
                <SaunaModal
                    sauna={selectedSauna}
                    lang={lang}
                    onClose={() => setSelectedSauna(null)}
                />
            )}

            {showContributionForm && (
                <ContributionForm
                    lang={lang}
                    currentUser={user}
                    onClose={() => setShowContributionForm(false)}
                />
            )}

            {showAuthModal && (
                <AuthModal
                    lang={lang}
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={() => setShowAuthModal(false)}
                />
            )}

            {showAdminPanel && (
                <AdminPanel
                    lang={lang}
                    onClose={() => setShowAdminPanel(false)}
                    onUpdate={fetchSaunas}
                />
            )}

            {showUserPanel && user && (
                <UserPanel
                    lang={lang}
                    user={user}
                    profile={profile}
                    onClose={() => setShowUserPanel(false)}
                    onAddSauna={() => setShowContributionForm(true)}
                />
            )}
        </div>
    );
};

export default App;