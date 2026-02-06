import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { Sauna, LanguageCode, Country } from '../types';
import { PlusCircle, Compass, Search } from 'lucide-react';
import { cn } from '../lib/utils';

interface MapViewProps {
    saunas: Sauna[];
    lang: LanguageCode;
    filterCountry: string;
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    onSaunaSelect: (sauna: Sauna) => void;
    handleCountryFilter: (country: string | 'All') => void;
}

export const MapView: React.FC<MapViewProps> = ({
    saunas,
    lang,
    filterCountry,
    searchTerm,
    setSearchTerm,
    onSaunaSelect,
    handleCountryFilter
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        const map = L.map(mapContainerRef.current, {
            center: [64.0, 20.0],
            zoom: 5,
            zoomControl: false,
            attributionControl: true
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        // Required for Leaflet to detect size in dynamic layouts
        setTimeout(() => map.invalidateSize(), 150);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Handle Country Filter FlyTo
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        let center: L.LatLngExpression = [64.0, 20.0];
        let zoom = 5;

        if (filterCountry === Country.FINLAND) {
            center = [64.5, 26.0];
            zoom = 6;
        } else if (filterCountry === Country.SWEDEN) {
            center = [62.0, 15.0];
            zoom = 6;
        }

        map.flyTo(center, zoom, { duration: 1.5 });
    }, [filterCountry]);

    // Handle Markers
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        const filtered = saunas.filter(s => {
            const matchesCountry = filterCountry === 'All' || s.country === filterCountry;
            const content = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
            const name = (content?.[lang]?.name || content?.['en']?.name || '').toLowerCase();
            const matchesSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
            return matchesCountry && matchesSearch;
        });

        filtered.forEach(sauna => {
            const lat = Number(sauna.coordinates?.lat);
            const lng = Number(sauna.coordinates?.lng);
            if (isNaN(lat) || isNaN(lng)) return;

            const content = typeof sauna.content === 'string' ? JSON.parse(sauna.content) : sauna.content;
            const saunaName = (content?.[lang]?.name || content?.['en']?.name || 'Sauna');

            const icon = L.divIcon({
                className: 'custom-leaflet-marker',
                html: `
                    <div class="relative group cursor-pointer" id="marker-${sauna.id}">
                      <div class="absolute -inset-4 bg-primary/20 rounded-full animate-ping opacity-60"></div>
                      <div class="relative bg-white size-5 rounded-full border-2 border-primary shadow-2xl transition-transform hover:scale-125 flex items-center justify-center">
                         <div class="size-2 bg-primary rounded-full"></div>
                      </div>
                      <div class="absolute left-1/2 -top-12 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-2 px-4 rounded-xl shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 pointer-events-none z-50">
                         ${saunaName}
                         <div class="absolute bottom-[-4px] left-1/2 -translate-x-1/2 size-2 bg-slate-900 rotate-45"></div>
                      </div>
                    </div>
                `,
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });

            const marker = L.marker([lat, lng], { icon })
                .addTo(map)
                .on('click', () => {
                    onSaunaSelect(sauna);
                    map.flyTo([lat, lng], 10, { duration: 1.5 });
                });

            markersRef.current.push(marker);
        });
    }, [saunas, filterCountry, searchTerm, lang, onSaunaSelect]);

    const handleSearch = () => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) {
            handleCountryFilter('All');
            return;
        }

        const filtered = saunas.filter(s => {
            const content = typeof s.content === 'string' ? JSON.parse(s.content) : s.content;
            const name = (content?.[lang]?.name || content?.['en']?.name || '').toLowerCase();
            const region = (s.metadata?.region || '').toLowerCase();
            const country = (s.country || '').toLowerCase();

            return name.includes(term) || region.includes(term) || country.includes(term);
        });

        if (filtered.length > 0 && mapInstanceRef.current) {
            if (filtered.length === 1) {
                const sauna = filtered[0];
                const lat = Number(sauna.coordinates?.lat);
                const lng = Number(sauna.coordinates?.lng);
                if (!isNaN(lat) && !isNaN(lng)) {
                    mapInstanceRef.current.flyTo([lat, lng], 12, { duration: 1.5 });
                    onSaunaSelect(sauna);
                }
            } else {
                // If multiple results, show the bounds of all results
                const bounds = L.latLngBounds(filtered.map(s => [Number(s.coordinates.lat), Number(s.coordinates.lng)] as [number, number]));
                mapInstanceRef.current.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
            }
        }
    };

    return (
        <div className="relative w-full h-[750px] bg-slate-100 rounded-[3rem] p-3 shadow-2xl overflow-hidden group border border-slate-200/50">
            <div ref={mapContainerRef} className="relative w-full h-full z-10 bg-white rounded-[2.5rem] overflow-hidden" />

            {/* Map Controls */}
            <div className="absolute top-24 left-6 lg:top-10 lg:left-10 z-10 flex flex-col gap-3">
                <div className="bg-white dark:bg-slate-900 p-1.5 lg:p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl">
                    <button onClick={() => mapInstanceRef.current?.zoomIn()} className="size-10 lg:size-12 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-900 dark:text-white transition-colors">
                        <PlusCircle className="size-5" />
                    </button>
                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-1" />
                    <button onClick={() => mapInstanceRef.current?.zoomOut()} className="size-10 lg:size-12 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-slate-900 dark:text-white transition-colors">
                        <span className="material-symbols-outlined font-black">remove</span>
                    </button>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm('');
                        handleCountryFilter('All');
                    }}
                    className="bg-white dark:bg-slate-900 size-10 lg:size-12 flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl text-primary hover:scale-105 transition-transform"
                >
                    <Compass className="size-5 lg:size-6" />
                </button>
            </div>

            {/* Floating Search - Centered on all screens for premium symmetry */}
            <div className="absolute top-6 left-6 right-6 lg:top-10 lg:left-1/2 lg:-translate-x-1/2 z-20 flex justify-center w-[calc(100%-3rem)] lg:w-auto">
                <div className="w-full lg:min-w-[400px] lg:max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-1.5 lg:p-2 flex items-center shadow-3xl">
                    <div className="bg-slate-50 dark:bg-slate-800 size-10 lg:size-12 rounded-2xl flex items-center justify-center mr-3 shrink-0">
                        <Search className="size-4 lg:size-5 text-slate-400" />
                    </div>
                    <input
                        className="bg-transparent border-none flex-1 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 text-sm font-semibold min-w-0"
                        placeholder={lang === 'sv' ? 'Sök platser...' : lang === 'fi' ? 'Etsi kohteita...' : 'Search locations...'}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                        onClick={handleSearch}
                        className="ml-2 px-6 py-3 bg-primary text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shrink-0 shadow-lg shadow-primary/20"
                    >
                        {lang === 'sv' ? 'Sök' : lang === 'fi' ? 'Etsi' : 'Find'}
                    </button>
                </div>
            </div>
        </div>
    );
};
