import React from 'react';
import { Bench } from '../types/bench';
import { Armchair, Footprints, Clock, Navigation2, Trees, Sun } from 'lucide-react';

interface BenchListDrawerProps {
  benches: Bench[];
  selectedBench: Bench | null;
  onSelectBench: (bench: Bench) => void;
  onShowRoute: (bench: Bench) => void;
  filterOnlyBackrest: boolean;
  isLargeText: boolean;
}

export const BenchListDrawer: React.FC<BenchListDrawerProps> = ({
  benches,
  selectedBench,
  onSelectBench,
  onShowRoute,
  filterOnlyBackrest,
  isLargeText,
}) => {
  const displayedBenches = filterOnlyBackrest
    ? benches.filter((b) => b.hasBackrest)
    : benches;

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-amber-50/50">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">
          Bancos ordenados por cercanía ({displayedBenches.length})
        </h2>
      </div>

      {displayedBenches.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border-2 border-slate-300">
          <p className="text-lg font-bold text-slate-700">
            No se encontraron bancos con los filtros actuales.
          </p>
        </div>
      ) : (
        displayedBenches.map((bench, idx) => {
          const isSelected = selectedBench?.id === bench.id;
          const isBackrest = bench.hasBackrest;

          return (
            <div
              key={bench.id}
              onClick={() => onSelectBench(bench)}
              className={`p-4 rounded-3xl border-3 transition-all cursor-pointer bg-white shadow-sm ${
                isSelected
                  ? 'border-blue-600 ring-4 ring-blue-200'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="px-3 py-1 bg-slate-800 text-white text-xs font-black rounded-xl flex items-center gap-1.5 shadow-xs">
                  <Armchair className="w-4 h-4 text-amber-300 stroke-[2.5]" /> BANCO PÚBLICO
                </span>

                {/* Distancia y Tiempo */}
                <div className="text-right flex-shrink-0">
                  <span className={`${isLargeText ? 'text-xl' : 'text-lg'} font-black text-blue-900 block leading-tight`}>
                    {bench.distanceMeters ?? '--'} m
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    ~{bench.walkingMinutes ?? 1} min
                  </span>
                </div>
              </div>

              {/* Nombre de la calle y referencia */}
              <div className="mt-2.5">
                <h3 className={`${isLargeText ? 'text-xl' : 'text-lg'} font-black text-slate-950 leading-snug`}>
                  {bench.streetName}
                </h3>
                {bench.landmark && (
                  <p className="text-xs sm:text-sm font-bold text-slate-700 mt-0.5">
                    📍 {bench.landmark}
                  </p>
                )}
              </div>

              {/* Detalles adicionales y botón de acción */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
                  {bench.hasShade ? (
                    <span className="flex items-center gap-1 text-emerald-800">
                      <Trees className="w-3.5 h-3.5" /> Sombra
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-800">
                      <Sun className="w-3.5 h-3.5" /> Sol
                    </span>
                  )}
                  <span>·</span>
                  <span>{bench.material || 'Madera'}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowRoute(bench);
                  }}
                  className="min-h-[44px] px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm font-black rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                >
                  <Navigation2 className="w-4 h-4 fill-white" />
                  <span>CÓMO LLEGAR</span>
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
