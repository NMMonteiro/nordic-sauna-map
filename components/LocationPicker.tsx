import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';

interface LocationPickerProps {
    onLocationSelect: (lat: number, lng: number) => void;
    initialLocation?: [number, number];
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation = [64.0, 26.0] }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const leafletMap = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const [coords, setCoords] = useState<{ lat: number, lng: number }>({
        lat: initialLocation[0],
        lng: initialLocation[1]
    });

    const customIcon = L.divIcon({
        className: 'custom-picker-marker',
        html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div class="size-6 bg-primary rounded-full border-4 border-white shadow-xl"></div>
        </div>
    `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });

    useEffect(() => {
        if (!mapRef.current || leafletMap.current) return;

        const map = L.map(mapRef.current, {
            center: initialLocation as L.LatLngTuple,
            zoom: 5,
            zoomControl: false
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19
        }).addTo(map);

        leafletMap.current = map;

        // Add initial marker if exists
        markerRef.current = L.marker(initialLocation as L.LatLngTuple, { icon: customIcon }).addTo(map);

        // Force a size recalculation after the modal transition finishes
        setTimeout(() => {
            map.invalidateSize();
        }, 500);

        map.on('click', (e: L.LeafletMouseEvent) => {
            const { lat, lng } = e.latlng;
            setCoords({ lat, lng });
            if (markerRef.current) {
                markerRef.current.setLatLng(e.latlng);
            } else {
                markerRef.current = L.marker(e.latlng, { icon: customIcon }).addTo(map);
            }
            onLocationSelect(lat, lng);
        });

        return () => {
            map.remove();
            leafletMap.current = null;
        };
    }, []);

    const handleManualInput = (field: 'lat' | 'lng', val: string) => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            const newCoords = { ...coords, [field]: num };
            setCoords(newCoords);
            if (leafletMap.current) {
                const newPos = L.latLng(newCoords.lat, newCoords.lng);
                if (markerRef.current) markerRef.current.setLatLng(newPos);
                leafletMap.current.setView(newPos, leafletMap.current.getZoom());
            }
            onLocationSelect(newCoords.lat, newCoords.lng);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative w-full h-[350px] rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                <div ref={mapRef} className="w-full h-full" />
                <div className="absolute top-4 left-4 z-[500] bg-white/90 backdrop-blur px-4 py-2 rounded-xl border border-sky/10 shadow-sm pointer-events-none">
                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Click on map to set pin</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Latitude</label>
                    <input
                        type="number"
                        step="0.0001"
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary"
                        value={coords.lat}
                        onChange={(e) => handleManualInput('lat', e.target.value)}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Longitude</label>
                    <input
                        type="number"
                        step="0.0001"
                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary"
                        value={coords.lng}
                        onChange={(e) => handleManualInput('lng', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
};
