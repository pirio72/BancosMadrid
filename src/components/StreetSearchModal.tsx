import React, { useState } from 'react';
import { Search, MapPin, X, Loader2, Navigation } from 'lucide-react';
import { searchMadridAddress, GeocodedAddress } from '../services/geocodeService';

interface StreetSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddressSelected: (address: GeocodedAddress) => void;
  onRequestGPS: () => void;
  isLargeText: boolean;
}

const COMMON_STREETS = [
  'Gran Vía',
  'Calle Mayor',
  'Calle de Alcalá',
  'Calle Arenal',
  'Paseo del Prado',
  'Calle de Fuencarral',
  'Calle de Goya',
  'Calle de Serrano',
  'Bravo Murillo',
  'Plaza de España',
];

export const StreetSearchModal: React.FC<StreetSearchModalProps> = ({
  isOpen,
  onClose,
  onAddressSelected,
  onRequestGPS,
  isLargeText,
}) => {
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street.trim()) {
      setErrorMessage('Por favor, escriba el nombre de la calle.');
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);

    try {
      const result = await searchMadridAddress(street, houseNumber);
      onAddressSelected(result);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo encontrar la dirección. Revise el nombre.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickStreet = (name: string) => {
    setStreet(name);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-[850] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-slate-900 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera de alto contraste */}
        <div className="bg-amber-500 text-slate-950 px-5 py-4 flex items-center justify-between border-b-4 border-amber-600 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center">
              <Search className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className={`${isLargeText ? 'text-2xl' : 'text-xl'} font-black leading-tight`}>
                Buscar calle en Madrid
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                Funciona sin necesidad de activar el GPS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar búsqueda"
            className="w-11 h-11 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white flex items-center justify-center font-bold transition-colors cursor-pointer"
          >
            <X className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Formulario adaptado para mayores de 65 */}
        <div className="p-5 overflow-y-auto space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo 1: Calle */}
            <div>
              <label 
                htmlFor="search-street" 
                className={`block font-black text-slate-900 mb-1.5 ${isLargeText ? 'text-lg' : 'text-base'}`}
              >
                1. Nombre de la calle o plaza:
              </label>
              <div className="relative">
                <input
                  id="search-street"
                  type="text"
                  value={street}
                  onChange={(e) => {
                    setStreet(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  placeholder="Ej: Calle de Alcalá, Gran Vía, Mayor..."
                  autoFocus
                  className="w-full min-h-[56px] px-4 py-3 text-lg font-bold text-slate-950 bg-slate-50 border-3 border-slate-400 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-200 outline-hidden transition-all"
                />
                {street && (
                  <button
                    type="button"
                    onClick={() => setStreet('')}
                    aria-label="Borrar texto de la calle"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* Campo 2: Número de portal (Opcional) */}
            <div>
              <label 
                htmlFor="search-number" 
                className={`block font-black text-slate-900 mb-1.5 ${isLargeText ? 'text-lg' : 'text-base'}`}
              >
                2. Número de portal (opcional):
              </label>
              <input
                id="search-number"
                type="text"
                inputMode="numeric"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
                placeholder="Ej: 14"
                className="w-full min-h-[56px] px-4 py-3 text-lg font-bold text-slate-950 bg-slate-50 border-3 border-slate-400 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-200 outline-hidden transition-all"
              />
            </div>

            {/* Mensaje de error si la calle no se introduce */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border-2 border-rose-400 rounded-2xl text-rose-900 font-bold text-sm">
                ⚠ {errorMessage}
              </div>
            )}

            {/* Botón principal de búsqueda GIGANTE */}
            <button
              type="submit"
              disabled={isSearching}
              className="w-full min-h-[62px] px-6 py-4 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white rounded-2xl font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl border-3 border-blue-900 transition-all cursor-pointer"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
                  <span>BUSCANDO DIRECCIÓN...</span>
                </>
              ) : (
                <>
                  <Search className="w-6 h-6 stroke-[3]" />
                  <span>BUSCAR BANCOS EN ESTA CALLE</span>
                </>
              )}
            </button>
          </form>

          {/* Calles frecuentes en Madrid con 1 toque */}
          <div className="pt-2 border-t-2 border-slate-200">
            <span className="text-xs font-black text-slate-600 uppercase tracking-wide block mb-2">
              O elija una calle frecuente de Madrid:
            </span>
            <div className="flex flex-wrap gap-2">
              {COMMON_STREETS.map((streetName) => (
                <button
                  key={streetName}
                  type="button"
                  onClick={() => handleQuickStreet(streetName)}
                  className={`min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold border-2 transition-all cursor-pointer ${
                    street === streetName
                      ? 'bg-amber-400 text-slate-950 border-amber-600 ring-2 ring-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  {streetName}
                </button>
              ))}
            </div>
          </div>

          {/* Opción alternativa de volver a usar GPS */}
          <div className="pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                onRequestGPS();
                onClose();
              }}
              className="w-full min-h-[48px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-blue-900 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 border-blue-300 transition-colors cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-blue-700" />
              <span>Usar mi posición GPS en su lugar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
