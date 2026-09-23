import React, { useState } from 'react';
import { Bench, RouteInfo } from '../types/bench';
import { 
  ArrowUp, 
  ArrowUpLeft, 
  ArrowUpRight, 
  MapPin, 
  Footprints, 
  Clock, 
  Volume2, 
  VolumeX, 
  X, 
  ExternalLink,
  CheckCircle2,
  Armchair
} from 'lucide-react';

interface RouteGuideModalProps {
  bench: Bench;
  routeInfo: RouteInfo;
  onClose: () => void;
  isLargeText: boolean;
}

export const RouteGuideModal: React.FC<RouteGuideModalProps> = ({
  bench,
  routeInfo,
  onClose,
  isLargeText,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Leer instrucciones en voz alta para personas mayores (Web Speech API)
  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const textToSpeak = `Ruta hacia su banco de descanso en ${bench.streetName}. 
    Distancia: ${routeInfo.distanceMeters} metros, aproximadamente ${routeInfo.durationMinutes} minutos a paso tranquilo. 
    Este banco está disponible para descansar. 
    ${routeInfo.instructions.map((step, idx) => `Paso ${idx + 1}: ${step.text} ${step.detail ? step.detail : ''}`).join('. ')}. 
    ¡Ha llegado a su banco para descansar!`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9; // Hablar un poco más pausado para mayor claridad
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'turn-left':
        return <ArrowUpLeft className="w-8 h-8 text-amber-500 stroke-[3]" />;
      case 'turn-right':
        return <ArrowUpRight className="w-8 h-8 text-amber-500 stroke-[3]" />;
      case 'destination':
        return <MapPin className="w-8 h-8 text-emerald-600 stroke-[3]" />;
      case 'start':
      case 'straight':
      default:
        return <ArrowUp className="w-8 h-8 text-blue-600 stroke-[3]" />;
    }
  };

  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${bench.lat},${bench.lng}&travelmode=walking`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[700] bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-4 border-slate-900 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Encabezado con alto contraste */}
        <div className="bg-blue-900 text-white p-4 sm:p-5 flex items-center justify-between border-b-4 border-blue-950">
          <div>
            <span className="px-2.5 py-1 bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-md inline-block mb-1">
              Ruta a pie más corta
            </span>
            <h2 className={`${isLargeText ? 'text-2xl' : 'text-xl'} font-black text-white leading-tight`}>
              {bench.streetName}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            aria-label="Cerrar indicaciones"
            className="w-12 h-12 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/40 text-white flex items-center justify-center transition-colors focus:ring-4 focus:ring-white"
          >
            <X className="w-8 h-8 stroke-[3]" />
          </button>
        </div>

        {/* Resumen de distancia, tiempo y tipo de banco */}
        <div className="bg-blue-50 border-b-2 border-blue-200 px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-black text-slate-900">
                <Footprints className="w-5 h-5 text-blue-700" />
                <span className="text-lg">{routeInfo.distanceMeters} m</span>
              </div>
              <span className="text-slate-400">·</span>
              <div className="flex items-center gap-1.5 font-black text-slate-900">
                <Clock className="w-5 h-5 text-emerald-700" />
                <span className="text-lg">{routeInfo.durationMinutes} min a pie</span>
              </div>
            </div>

            <span className="px-2.5 py-1 bg-slate-800 text-white text-xs font-black rounded-lg">
              Banco público
            </span>
          </div>
        </div>

        {/* Botón de Asistente de Voz para personas mayores */}
        <div className="p-3 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReadAloud}
            className={`w-full min-h-[50px] px-4 py-2.5 rounded-xl font-black text-base flex items-center justify-center gap-2.5 transition-colors border-2 ${
              isSpeaking
                ? 'bg-rose-700 text-white border-rose-900 animate-pulse'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-600'
            }`}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-6 h-6 stroke-[2.5]" />
                <span>Detener lectura de voz</span>
              </>
            ) : (
              <>
                <Volume2 className="w-6 h-6 stroke-[2.5]" />
                <span>Escuchar indicaciones en voz alta</span>
              </>
            )}
          </button>
        </div>

        {/* Lista de pasos simples numerados */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wide">
            Instrucciones sencillas paso a paso:
          </p>

          {routeInfo.instructions.map((step, idx) => (
            <div
              key={step.id || idx}
              className={`p-4 rounded-2xl border-2 flex items-start gap-3.5 ${
                step.type === 'destination'
                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300'
                  : 'bg-slate-50 border-slate-300'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white shadow-md border-2 border-slate-300 flex items-center justify-center flex-shrink-0">
                {getStepIcon(step.type)}
              </div>

              <div className="flex-1">
                <span className="text-xs font-black text-slate-500 uppercase block">
                  Paso {idx + 1}
                </span>
                <p className={`${isLargeText ? 'text-xl' : 'text-lg'} font-black text-slate-950 leading-snug mt-0.5`}>
                  {step.text}
                </p>
                {step.detail && (
                  <p className={`${isLargeText ? 'text-base' : 'text-sm'} font-bold text-slate-600 mt-1`}>
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          ))}

          {/* Información de referencia del banco */}
          {bench.landmark && (
            <div className="bg-amber-100/70 p-3.5 rounded-2xl border border-amber-300 text-slate-900">
              <span className="text-xs font-black text-amber-900 uppercase block">Referencia en el lugar:</span>
              <p className="font-extrabold text-sm mt-0.5">{bench.landmark}</p>
            </div>
          )}
        </div>

        {/* Pie de acciones finales */}
        <div className="p-4 bg-slate-100 border-t-2 border-slate-300 space-y-2">
          <button
            type="button"
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="w-full min-h-[56px] px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-lg shadow-md transition-colors border-2 border-slate-950"
          >
            SEGUIR EN EL MAPA
          </button>

          <button
            type="button"
            onClick={openInGoogleMaps}
            className="w-full min-h-[46px] text-blue-700 hover:text-blue-900 font-bold text-sm flex items-center justify-center gap-1.5 py-1"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Abrir en Google Maps navegación guiada</span>
          </button>
        </div>
      </div>
    </div>
  );
};
