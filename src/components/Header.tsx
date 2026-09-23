import React from 'react';
import { Armchair, MapPin, Type, Navigation, Search } from 'lucide-react';

interface HeaderProps {
  isLargeText: boolean;
  onToggleLargeText: () => void;
  onOpenZonePicker: () => void;
  onOpenSearch: () => void;
  onRequestLocation: () => void;
  isLocating: boolean;
  activeZoneName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isLargeText,
  onToggleLargeText,
  onOpenZonePicker,
  onOpenSearch,
  onRequestLocation,
  isLocating,
  activeZoneName,
}) => {
  return (
    <header className="bg-slate-900 text-white shadow-xl border-b-4 border-amber-500 sticky top-0 z-50 flex-shrink-0">
      <div className="max-w-3xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Logo y título de máxima legibilidad */}
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md flex-shrink-0">
              <Armchair className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className={`${isLargeText ? 'text-2xl' : 'text-xl'} font-black tracking-tight text-white flex items-center gap-1.5`}>
                Siéntate Madrid
              </h1>
              <p className={`${isLargeText ? 'text-sm' : 'text-xs'} font-bold text-amber-300 leading-tight`}>
                Bancos públicos para descansar
              </p>
            </div>
          </div>

          {/* Botones de acción principales */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Botón Buscar Calle y Número */}
            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Buscar calle y número"
              className="min-h-[46px] px-3 sm:px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white border-2 border-blue-400 flex items-center gap-1.5 font-black text-xs sm:text-sm shadow-md transition-colors focus:ring-4 focus:ring-blue-300 cursor-pointer"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 stroke-[2.5]" />
              <span>Buscar Calle</span>
            </button>

            {/* Selector de tamaño de letra */}
            <button
              type="button"
              onClick={onToggleLargeText}
              aria-label={isLargeText ? 'Cambiar a letra estándar' : 'Aumentar tamaño de letra'}
              className="min-h-[46px] px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border-2 border-slate-600 flex items-center gap-1 font-bold text-amber-200 transition-colors shadow-sm focus:ring-4 focus:ring-amber-400 cursor-pointer"
            >
              <Type className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-extrabold">{isLargeText ? 'A' : 'A+'}</span>
            </button>

            {/* Zonas de Madrid */}
            <button
              type="button"
              onClick={onOpenZonePicker}
              aria-label="Ver zonas de Madrid"
              className="min-h-[46px] px-2.5 sm:px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 border-2 border-amber-300 flex items-center gap-1 font-black text-xs sm:text-sm shadow-md transition-colors focus:ring-4 focus:ring-amber-300 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline">Zonas</span>
            </button>
          </div>
        </div>

        {/* Barra de estado de ubicación y acceso directo a búsqueda */}
        <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-300">
          <div className="flex items-center gap-1.5 truncate">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <span className="text-slate-400">Punto actual:</span>
            <span className="text-amber-200 font-extrabold truncate">
              {activeZoneName || 'Madrid Centro'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenSearch}
              className="text-amber-300 hover:text-white underline font-extrabold flex items-center gap-1 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Cambiar calle</span>
            </button>

            <button
              type="button"
              onClick={onRequestLocation}
              disabled={isLocating}
              className="text-blue-300 hover:text-white underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>GPS</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
