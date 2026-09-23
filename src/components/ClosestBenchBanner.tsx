import React from 'react';
import { Bench } from '../types/bench';
import { Armchair, Navigation2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ClosestBenchBannerProps {
  bench: Bench;
  onSelect: (bench: Bench) => void;
  onShowRoute: (bench: Bench) => void;
  filterOnlyBackrest: boolean;
  onToggleFilterBackrest: () => void;
  isLargeText: boolean;
}

export const ClosestBenchBanner: React.FC<ClosestBenchBannerProps> = ({
  bench,
  onSelect,
  onShowRoute,
  filterOnlyBackrest,
  onToggleFilterBackrest,
  isLargeText,
}) => {
  return (
    <div className="bg-white border-b-2 border-slate-300 shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-2.5">
        {/* Tarjeta del banco más cercano para descanso urgente */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50/80 p-3 rounded-2xl border-2 border-amber-300">
          <div className="flex-1 min-w-0" onClick={() => onSelect(bench)} role="button" tabIndex={0}>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-700 text-white text-[11px] font-black uppercase rounded-md tracking-wider">
                MÁS CERCANO
              </span>

              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Armchair className="w-3.5 h-3.5 text-emerald-700" /> Banco disponible
              </span>
            </div>

            <p className={`${isLargeText ? 'text-lg' : 'text-base'} font-black text-slate-950 truncate mt-0.5`}>
              {bench.streetName}
            </p>

            <p className="text-xs sm:text-sm font-extrabold text-slate-700">
              A solo <span className="text-blue-900 font-black">{bench.distanceMeters ?? 50} metros</span> ·{' '}
              <span className="text-emerald-800 font-black">{bench.walkingMinutes ?? 1} min a pie</span>
            </p>
          </div>

          <button
            type="button"
            onClick={() => onShowRoute(bench)}
            className="min-h-[50px] px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-colors border-2 border-emerald-900 flex-shrink-0"
          >
            <Navigation2 className="w-5 h-5 fill-white" />
            <span>IR A ESTE BANCO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
