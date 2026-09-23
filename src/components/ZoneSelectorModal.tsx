import React from 'react';
import { MADRID_PRESET_LOCATIONS } from '../data/madridBenches';
import { MapPin, X, Navigation } from 'lucide-react';

interface ZoneSelectorModalProps {
  currentLocationName?: string;
  onSelectZone: (zone: { name: string; lat: number; lng: number }) => void;
  onRequestGPS: () => void;
  onClose: () => void;
  isLargeText: boolean;
}

export const ZoneSelectorModal: React.FC<ZoneSelectorModalProps> = ({
  currentLocationName,
  onSelectZone,
  onRequestGPS,
  onClose,
  isLargeText,
}) => {
  return (
    <div className="fixed inset-0 z-[800] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-slate-900 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Encabezado */}
        <div className="bg-amber-500 text-slate-950 p-4 flex items-center justify-between border-b-4 border-amber-600">
          <div>
            <h2 className={`${isLargeText ? 'text-2xl' : 'text-xl'} font-black leading-tight`}>
              Zonas de Madrid
            </h2>
            <p className="text-xs font-bold text-slate-900">
              Elija una zona o use su GPS actual
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de zonas"
            className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Botón destacado de GPS actual */}
        <div className="p-4 bg-blue-50 border-b-2 border-blue-200">
          <button
            type="button"
            onClick={() => {
              onRequestGPS();
              onClose();
            }}
            className="w-full min-h-[54px] px-4 py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2.5 shadow-md border-2 border-blue-900"
          >
            <Navigation className="w-6 h-6" />
            <span>USAR MI UBICACIÓN GPS EXACTA</span>
          </button>
        </div>

        {/* Lista de Zonas populares de Madrid */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          <p className="text-xs font-black text-slate-500 uppercase">
            Seleccionar barrio o plaza de Madrid:
          </p>

          {MADRID_PRESET_LOCATIONS.map((loc) => {
            const isSelected = currentLocationName === loc.name;
            return (
              <button
                key={loc.name}
                type="button"
                onClick={() => {
                  onSelectZone(loc);
                  onClose();
                }}
                className={`w-full min-h-[52px] px-4 py-3 rounded-2xl text-left font-extrabold flex items-center justify-between border-2 transition-all ${
                  isSelected
                    ? 'bg-amber-100 border-amber-500 text-slate-950 ring-2 ring-amber-300'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-300 text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={`w-5 h-5 ${isSelected ? 'text-amber-700' : 'text-slate-500'}`} />
                  <span className={`${isLargeText ? 'text-lg' : 'text-base'}`}>{loc.name}</span>
                </div>
                {isSelected && (
                  <span className="text-xs font-black px-2 py-0.5 bg-amber-400 text-slate-950 rounded">
                    Activa
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Botón cerrar */}
        <div className="p-3 bg-slate-100 border-t border-slate-300">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl font-bold text-slate-700 hover:bg-slate-200"
          >
            Volver
          </button>
        </div>
      </div>
    </div>
  );
};
