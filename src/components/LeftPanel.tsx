import React, { useState } from 'react';
import { Bench, RouteInfo, UserLocation } from '../types/bench';
import { searchMadridAddress, GeocodedAddress } from '../services/geocodeService';
import { 
  Armchair, 
  MapPin, 
  Type, 
  Navigation, 
  Search, 
  Footprints, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Navigation2, 
  Volume2, 
  VolumeX, 
  X, 
  ExternalLink,
  Trees,
  Sun,
  Loader2,
  ShieldCheck
} from 'lucide-react';

interface LeftPanelProps {
  userLocation: UserLocation;
  activeZoneName: string;
  isLocating: boolean;
  gpsError: string | null;
  onRequestGPS: () => void;
  onOpenZonePicker: () => void;
  isLargeText: boolean;
  onToggleLargeText: () => void;
  onAddressSelected: (address: GeocodedAddress) => void;
  benches: Bench[];
  selectedBench: Bench | null;
  onSelectBench: (bench: Bench) => void;
  routeInfo: RouteInfo | null;
  onStartRoute: (bench: Bench) => void;
  onClearRoute: () => void;
  filterOnlyBackrest: boolean;
  onToggleFilterBackrest: () => void;
}

const COMMON_STREETS = [
  'Gran Vía',
  'Calle Mayor',
  'Calle de Alcalá',
  'Paseo del Prado',
  'Bravo Murillo',
  'Calle de Serrano',
];

export const LeftPanel: React.FC<LeftPanelProps> = ({
  userLocation,
  activeZoneName,
  isLocating,
  gpsError,
  onRequestGPS,
  onOpenZonePicker,
  isLargeText,
  onToggleLargeText,
  onAddressSelected,
  benches,
  selectedBench,
  onSelectBench,
  routeInfo,
  onStartRoute,
  onClearRoute,
  filterOnlyBackrest,
  onToggleFilterBackrest,
}) => {
  const [streetInput, setStreetInput] = useState('');
  const [numberInput, setNumberInput] = useState('');
  const [isSearchingStreet, setIsSearchingStreet] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Buscar dirección introducida
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!streetInput.trim()) {
      setSearchError('Escriba el nombre de una calle de Madrid.');
      return;
    }

    setIsSearchingStreet(true);
    setSearchError(null);

    try {
      const result = await searchMadridAddress(streetInput, numberInput);
      onAddressSelected(result);
    } catch (err: any) {
      setSearchError(err.message || 'No se encontró la calle. Revise el nombre.');
    } finally {
      setIsSearchingStreet(false);
    }
  };

  const handleQuickStreetClick = async (name: string) => {
    setStreetInput(name);
    setNumberInput('');
    setIsSearchingStreet(true);
    setSearchError(null);

    try {
      const result = await searchMadridAddress(name, '');
      onAddressSelected(result);
    } catch (err: any) {
      setSearchError(err.message || 'Error buscando la calle.');
    } finally {
      setIsSearchingStreet(false);
    }
  };

  // Leer en voz alta las instrucciones de la ruta
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window) || !selectedBench || !routeInfo) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = `Ruta hacia su banco de descanso en ${selectedBench.streetName}. 
    Distancia: ${routeInfo.distanceMeters} metros, aproximadamente ${routeInfo.durationMinutes} minutos caminando despacio. 
    Este banco está disponible para descansar en el espacio público. 
    ${routeInfo.instructions.map((step, idx) => `Paso ${idx + 1}: ${step.text} ${step.detail ? step.detail : ''}`).join('. ')}. 
    ¡Ha llegado a su banco para descansar!`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Bancos a mostrar
  const displayedBenches = benches;

  const closestBench = displayedBenches.length > 0 ? displayedBenches[0] : null;

  return (
    <aside className="w-full h-full flex flex-col bg-white border-r-4 border-slate-900 shadow-2xl flex-shrink-0 z-30 overflow-hidden">
      {/* 1. Cabecera principal con logotipo y controles de accesibilidad */}
      <div className="bg-slate-900 text-white p-4 border-b-4 border-amber-500 flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md flex-shrink-0">
              <Armchair className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <h1 className={`${isLargeText ? 'text-2xl' : 'text-xl'} font-black text-white leading-tight`}>
                Siéntate Madrid
              </h1>
              <p className="text-xs font-bold text-amber-300">
                Bancos públicos para descansar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleLargeText}
              aria-label="Ajustar tamaño de letra"
              className="min-h-[44px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-200 border-2 border-slate-600 font-extrabold text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
            >
              <Type className="w-4 h-4 text-amber-400" />
              <span>{isLargeText ? 'Letra A' : 'Letra A+'}</span>
            </button>

            <button
              type="button"
              onClick={onOpenZonePicker}
              aria-label="Ver zonas de Madrid"
              className="min-h-[44px] px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-amber-300 font-black text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
            >
              <MapPin className="w-4 h-4" />
              <span>Zonas</span>
            </button>
          </div>
        </div>

        {/* Punto actual y botón de refrescar GPS */}
        <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <span className="text-slate-400">Punto:</span>
            <span className="text-amber-200 font-extrabold truncate">{activeZoneName}</span>
          </div>

          <button
            type="button"
            onClick={onRequestGPS}
            disabled={isLocating}
            className="text-amber-300 hover:text-white underline font-bold flex items-center gap-1 cursor-pointer ml-2 flex-shrink-0"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Buscando...' : 'Usar GPS'}</span>
          </button>
        </div>
      </div>

      {/* 2. Aviso de GPS si aplica */}
      {gpsError && (
        <div className="bg-amber-100 border-b-2 border-amber-300 px-3.5 py-2 text-xs font-bold text-amber-950 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-800 flex-shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            type="button"
            onClick={onRequestGPS}
            className="px-2 py-0.5 bg-amber-700 text-white font-extrabold rounded text-[11px] cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* 3. Contenedor con scroll vertical para toda la parte textual */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Formulario de búsqueda integrado directamente en el panel izquierdo */}
        <div className="bg-slate-100 p-4 rounded-3xl border-3 border-slate-300 shadow-sm">
          <h2 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-blue-700 stroke-[3]" />
            Buscar calle y número en Madrid:
          </h2>

          <form onSubmit={handleSearchSubmit} className="space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  value={streetInput}
                  onChange={(e) => {
                    setStreetInput(e.target.value);
                    if (searchError) setSearchError(null);
                  }}
                  placeholder="Calle o plaza (ej. Alcalá)"
                  className="w-full min-h-[48px] px-3.5 py-2 text-base font-bold text-slate-900 bg-white border-2 border-slate-400 rounded-xl focus:border-amber-500 focus:ring-3 focus:ring-amber-200 outline-hidden"
                />
              </div>

              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value)}
                  placeholder="Nº (ej. 24)"
                  className="w-full min-h-[48px] px-3 py-2 text-base font-bold text-slate-900 bg-white border-2 border-slate-400 rounded-xl focus:border-amber-500 focus:ring-3 focus:ring-amber-200 outline-hidden"
                />
              </div>
            </div>

            {searchError && (
              <p className="text-xs font-bold text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-300">
                ⚠ {searchError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSearchingStreet}
              className="w-full min-h-[50px] px-4 py-2.5 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-md border-2 border-blue-900 cursor-pointer"
            >
              {isSearchingStreet ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                  <span>BUSCANDO CALLE...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 stroke-[2.5]" />
                  <span>BUSCAR BANCOS EN ESTA CALLE</span>
                </>
              )}
            </button>
          </form>

          {/* Accesos rápidos de calles con 1 toque */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap gap-1.5">
            <span className="text-[11px] font-black text-slate-500 w-full">Calles frecuentes:</span>
            {COMMON_STREETS.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleQuickStreetClick(st)}
                className="px-2.5 py-1 bg-white hover:bg-amber-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Si hay una RUTA ACTIVA: Mostrar el panel de navegación paso a paso aquí mismo */}
        {routeInfo && selectedBench && (
          <div className="bg-blue-50 p-4 rounded-3xl border-3 border-blue-600 shadow-md space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200">
              <span className="px-2 py-0.5 bg-blue-700 text-white text-[11px] font-black uppercase rounded">
                Ruta a pie activa
              </span>
              <button
                type="button"
                onClick={onClearRoute}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold cursor-pointer"
                aria-label="Cerrar ruta"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className={`${isLargeText ? 'text-xl' : 'text-lg'} font-black text-slate-950 leading-tight`}>
                {selectedBench.streetName}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-sm font-extrabold text-blue-950">
                <span className="flex items-center gap-1">
                  <Footprints className="w-4 h-4 text-blue-700" />
                  {routeInfo.distanceMeters} metros
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 text-emerald-800">
                  <Clock className="w-4 h-4 text-emerald-700" />
                  {routeInfo.durationMinutes} min a paso suave
                </span>
              </div>
            </div>

            {/* Botón de voz en español */}
            <button
              type="button"
              onClick={handleReadAloud}
              className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border-2 transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-rose-700 text-white border-rose-900 animate-pulse'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-600'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>Detener lectura de voz</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>Escuchar indicaciones en voz alta</span>
                </>
              )}
            </button>

            {/* Pasos de la ruta */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-black text-slate-500 uppercase block">
                Pasos para llegar:
              </span>
              {routeInfo.instructions.map((step, idx) => (
                <div key={step.id || idx} className="p-3 bg-white rounded-xl border border-slate-300 flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-900 text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="font-black text-sm text-slate-900 leading-snug">{step.text}</p>
                    {step.detail && <p className="text-xs text-slate-600 font-bold mt-0.5">{step.detail}</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedBench.lat},${selectedBench.lng}&travelmode=walking`;
                  window.open(url, '_blank');
                }}
                className="w-full text-blue-700 hover:text-blue-900 font-bold text-xs flex items-center justify-center gap-1 py-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir en Google Maps si prefiere</span>
              </button>
            </div>
          </div>
        )}

        {/* Tarjeta de Banco Más Cercano para Alivio Inmediato */}
        {!routeInfo && closestBench && (
          <div className="bg-amber-100/90 p-4 rounded-3xl border-3 border-amber-400 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 bg-blue-700 text-white text-[11px] font-black uppercase rounded-md tracking-wider">
                MÁS CERCANO A USTED
              </span>

              <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Armchair className="w-3.5 h-3.5 text-emerald-700" /> Banco disponible
              </span>
            </div>

            <div>
              <h3 className={`${isLargeText ? 'text-xl' : 'text-lg'} font-black text-slate-950 leading-tight`}>
                {closestBench.streetName}
              </h3>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">
                A solo <span className="text-blue-900 font-black">{closestBench.distanceMeters} metros</span> (aprox.{' '}
                <span className="text-emerald-800 font-black">{closestBench.walkingMinutes} min a pie</span>)
              </p>
            </div>

            <button
              type="button"
              onClick={() => onStartRoute(closestBench)}
              className="w-full min-h-[50px] px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-md border-2 border-emerald-900 cursor-pointer"
            >
              <Navigation2 className="w-5 h-5 fill-white" />
              <span>IR A ESTE BANCO (VER RUTA)</span>
            </button>
          </div>
        )}

        {/* Lista completa de bancos ordenados por cercanía */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Bancos por cercanía ({displayedBenches.length}):
            </h3>
            <span className="text-[11px] text-slate-500 font-bold">
              Toque cualquier banco para ver en mapa
            </span>
          </div>

          {displayedBenches.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border-2 border-slate-300">
              <p className="text-sm font-bold text-slate-700">No hay bancos que coincidan con el filtro.</p>
            </div>
          ) : (
            displayedBenches.map((bench) => {
              const isSelected = selectedBench?.id === bench.id;
              const isBackrest = bench.hasBackrest;

              return (
                <div
                  key={bench.id}
                  onClick={() => onSelectBench(bench)}
                  className={`p-3.5 rounded-2xl border-3 transition-all cursor-pointer bg-white shadow-xs ${
                    isSelected
                      ? 'border-blue-600 ring-4 ring-blue-200 bg-blue-50/40'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-800 text-white text-[11px] font-black rounded-lg flex items-center gap-1">
                      <Armchair className="w-3.5 h-3.5 text-amber-400" /> BANCO PÚBLICO
                    </span>

                    <div className="text-right">
                      <span className="text-base font-black text-blue-900 block leading-tight">
                        {bench.distanceMeters ?? '--'} m
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        ~{bench.walkingMinutes ?? 1} min
                      </span>
                    </div>
                  </div>

                  <div className="mt-1.5">
                    <h4 className={`${isLargeText ? 'text-lg' : 'text-base'} font-black text-slate-950 leading-snug`}>
                      {bench.streetName}
                    </h4>
                    {bench.landmark && (
                      <p className="text-xs font-bold text-slate-600 mt-0.5">
                        📍 {bench.landmark}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                      {bench.hasShade ? (
                        <span className="text-emerald-800 flex items-center gap-0.5">
                          <Trees className="w-3.5 h-3.5" /> Sombra
                        </span>
                      ) : (
                        <span className="text-amber-800 flex items-center gap-0.5">
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
                        onStartRoute(bench);
                      }}
                      className="min-h-[36px] px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white text-xs font-black rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Navigation2 className="w-3.5 h-3.5 fill-white" />
                      <span>CÓMO LLEGAR</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}

          {/* Sello de Calidad Oficial */}
          <div className="pt-3 pb-6 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50/80 rounded-full border border-blue-200 text-xs font-bold text-blue-900 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span>Catálogo Oficial: Datos Abiertos del Ayto. de Madrid (76.700 bancos)</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
