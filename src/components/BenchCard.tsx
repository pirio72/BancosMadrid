import React from 'react';
import { Bench } from '../types/bench';
import { CheckCircle2, AlertTriangle, Footprints, Clock, Trees, Sun, Navigation2, X, Armchair, Sparkles } from 'lucide-react';

interface BenchCardProps {
  bench: Bench;
  onClose: () => void;
  onStartRoute: (bench: Bench) => void;
  isLargeText: boolean;
}

export const BenchCard: React.FC<BenchCardProps> = ({
  bench,
  onClose,
  onStartRoute,
  isLargeText,
}) => {
  const isBackrest = bench.hasBackrest;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[600] p-3 sm:p-4 bg-black/50 backdrop-blur-xs flex justify-center animate-in fade-in slide-in-from-bottom duration-200">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-slate-900 overflow-hidden">
        {/* Cabecera del banco */}
        <div className="px-5 py-3.5 flex items-center justify-between text-white font-black bg-slate-900">
          <div className="flex items-center gap-2.5">
            <Armchair className="w-7 h-7 text-amber-400 stroke-[2.5] flex-shrink-0" />
            <div>
              <span className={`${isLargeText ? 'text-xl' : 'text-lg'} uppercase tracking-wide block leading-none`}>
                BANCO PÚBLICO
              </span>
              <span className="text-xs font-bold text-slate-300">
                Mobiliario urbano para descanso
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle del banco"
            className="w-11 h-11 rounded-full bg-black/25 hover:bg-black/40 active:bg-black/60 text-white flex items-center justify-center transition-colors focus:ring-4 focus:ring-white"
          >
            <X className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Contenido Principal con datos directos */}
        <div className="p-5 space-y-4">
          {/* Título de la calle y referencia */}
          <div>
            <h2 className={`${isLargeText ? 'text-2xl' : 'text-xl'} font-black text-slate-950 leading-tight`}>
              {bench.streetName}
            </h2>
            {bench.landmark && (
              <p className={`${isLargeText ? 'text-base' : 'text-sm'} font-bold text-slate-700 mt-1 bg-amber-50 p-2.5 rounded-xl border border-amber-200`}>
                📍 <span className="text-slate-900 font-extrabold">{bench.landmark}</span>
              </p>
            )}
          </div>

          {/* Métricas clave para personas mayores: Distancia y Tiempo caminando despacio */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-100 p-3.5 rounded-2xl border-2 border-slate-300 text-center">
              <span className="text-xs font-black text-slate-600 uppercase block">Distancia</span>
              <p className={`${isLargeText ? 'text-2xl' : 'text-xl'} font-black text-blue-900 flex items-center justify-center gap-1 mt-0.5`}>
                <Footprints className="w-6 h-6 text-blue-600" />
                {bench.distanceMeters ?? '--'} m
              </p>
              <span className="text-xs font-bold text-slate-500">
                ~{bench.stepsCount ?? Math.round((bench.distanceMeters || 0) / 0.65)} pasos
              </span>
            </div>

            <div className="bg-slate-100 p-3.5 rounded-2xl border-2 border-slate-300 text-center">
              <span className="text-xs font-black text-slate-600 uppercase block">A paso suave</span>
              <p className={`${isLargeText ? 'text-2xl' : 'text-xl'} font-black text-emerald-800 flex items-center justify-center gap-1 mt-0.5`}>
                <Clock className="w-6 h-6 text-emerald-600" />
                {bench.walkingMinutes ?? 1} min
              </p>
              <span className="text-xs font-bold text-slate-500">
                Caminando tranquilo
              </span>
            </div>
          </div>

          {/* Características extra de descanso */}
          <div className="flex flex-wrap gap-2 pt-1 text-sm font-extrabold">
            {bench.hasShade ? (
              <span className="px-3 py-1.5 bg-emerald-100 text-emerald-950 rounded-xl border border-emerald-300 flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-emerald-700" /> Con sombra de árboles
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-amber-100 text-amber-950 rounded-xl border border-amber-300 flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-700" /> Zona descubierta (al sol)
              </span>
            )}

            {bench.material && (
              <span className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl border border-slate-300 capitalize">
                Madera / Material: {bench.material}
              </span>
            )}

            {bench.hasArmrests && (
              <span className="px-3 py-1.5 bg-blue-100 text-blue-950 rounded-xl border border-blue-300 flex items-center gap-1">
                <Armchair className="w-4 h-4 text-blue-700" /> Con reposabrazos para apoyarse
              </span>
            )}
          </div>

          {/* Botón principal GIGANTE para ver la ruta a pie (Requisito 4) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onStartRoute(bench)}
              className="w-full min-h-[62px] px-6 py-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-2xl shadow-xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-transform active:scale-[0.98] border-3 border-blue-900 focus:ring-4 focus:ring-blue-300"
            >
              <Navigation2 className="w-7 h-7 fill-white stroke-[2.5]" />
              <span>VER RUTA A PIE MÁS CORTA</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
