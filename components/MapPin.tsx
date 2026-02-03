import React from 'react';
import { Sauna, SaunaType } from '../types';

interface MapPinProps {
  sauna: Sauna;
  onClick: (sauna: Sauna) => void;
  zoom: number;
}

const getPinColorClass = (type: SaunaType) => {
  switch (type) {
    case SaunaType.SMOKE: return 'bg-slate-700';
    case SaunaType.ICE_BATH: return 'bg-blue-400';
    case SaunaType.WOOD_FIRED: return 'bg-cedar';
    default: return 'bg-primary';
  }
};

const getPinColorClassRing = (type: SaunaType) => {
    switch (type) {
      case SaunaType.SMOKE: return 'bg-slate-700/30';
      case SaunaType.ICE_BATH: return 'bg-blue-400/30';
      case SaunaType.WOOD_FIRED: return 'bg-cedar/30';
      default: return 'bg-primary/30';
    }
  };

export const MapPin: React.FC<MapPinProps> = ({ sauna, onClick, zoom }) => {
  return (
    <div 
      className="absolute group/pin cursor-pointer z-10 hover:z-20"
      style={{ 
        left: `${sauna.coordinates.x}%`, 
        top: `${sauna.coordinates.y}%`,
        transform: `scale(${1 / zoom})` 
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(sauna);
      }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <div className={`absolute -inset-2 ${getPinColorClassRing(sauna.type)} rounded-full animate-ping`}></div>
        <div className={`relative ${getPinColorClass(sauna.type)} size-4 rounded-full border-2 border-white shadow-lg`}></div>
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-xs font-bold py-1.5 px-3 rounded shadow-xl whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity translate-x-2 group-hover/pin:translate-x-0 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white pointer-events-none">
          {sauna.name}
        </div>
      </div>
    </div>
  );
};