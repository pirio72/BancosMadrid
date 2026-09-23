/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Bench, RouteInfo, UserLocation } from './types/bench';
import { MADRID_PRESET_BENCHES } from './data/madridBenches';
import { 
  fetchNearbyBenches, 
  getWalkingRoute, 
  enrichBenchesWithDistance, 
  calculateDistanceMeters
} from './services/benchService';
import { LeftPanel } from './components/LeftPanel';
import { MapComponent } from './components/MapComponent';
import { ZoneSelectorModal } from './components/ZoneSelectorModal';
import { GeocodedAddress } from './services/geocodeService';
import { Map, AlignLeft, RefreshCw } from 'lucide-react';

// Ubicación por defecto en Madrid Centro (Puerta del Sol)
const DEFAULT_MADRID_LOCATION: UserLocation = {
  lat: 40.416775,
  lng: -3.703790,
  address: 'Puerta del Sol, Madrid',
  isFallback: true,
};

export default function App() {
  const [userLocation, setUserLocation] = useState<UserLocation>(DEFAULT_MADRID_LOCATION);
  const [activeZoneName, setActiveZoneName] = useState<string>('Puerta del Sol, Madrid');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Inicializar bancos exclusivamente con bancos reales verificados de Madrid
  const [benches, setBenches] = useState<Bench[]>(() =>
    enrichBenchesWithDistance(MADRID_PRESET_BENCHES, DEFAULT_MADRID_LOCATION.lat, DEFAULT_MADRID_LOCATION.lng)
  );

  const [isLoadingBenches, setIsLoadingBenches] = useState<boolean>(false);
  const [selectedBench, setSelectedBench] = useState<Bench | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState<boolean>(false);

  // Estados de vista y accesibilidad
  const [filterOnlyBackrest, setFilterOnlyBackrest] = useState<boolean>(false);
  const [isLargeText, setIsLargeText] = useState<boolean>(true);
  const [showZonePicker, setShowZonePicker] = useState<boolean>(false);

  // En móviles: alternar si se ve el mapa a pantalla completa o el panel
  const [mobileActiveView, setMobileActiveView] = useState<'both' | 'map' | 'panel'>('map');

  // Cargar bancos reales (en parques, zonas ajardinadas y aceras)
  const loadBenchesForLocation = useCallback(async (lat: number, lng: number, streetName?: string) => {
    // 1. Mostrar de inmediato los bancos predefinidos reales ordenados por distancia
    const initialRealBenches = enrichBenchesWithDistance(MADRID_PRESET_BENCHES, lat, lng);
    setBenches(initialRealBenches);

    // 2. Consultar en OpenStreetMap los bancos reales en parques, zonas verdes y aceras
    setIsLoadingBenches(true);
    try {
      const results = await fetchNearbyBenches(lat, lng, 1200, streetName);
      if (results && results.length > 0) {
        setBenches(results);
      }
    } catch (err) {
      console.error('Error cargando bancos de OSM:', err);
    } finally {
      setIsLoadingBenches(false);
    }
  }, []);

  // Solicitar ubicación GPS del usuario
  const requestCurrentLocation = useCallback(() => {
    setIsLocating(true);
    setGpsError(null);

    if (!('geolocation' in navigator)) {
      setGpsError('Navegador sin GPS. Escriba su calle en el panel.');
      setIsLocating(false);
      loadBenchesForLocation(DEFAULT_MADRID_LOCATION.lat, DEFAULT_MADRID_LOCATION.lng, 'Puerta del Sol');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const newLocation: UserLocation = {
          lat: latitude,
          lng: longitude,
          accuracy,
          address: 'Su ubicación actual',
          isFallback: false,
        };

        setUserLocation(newLocation);
        setActiveZoneName('Su posición GPS');
        setIsLocating(false);
        loadBenchesForLocation(latitude, longitude, 'su ubicación');
      },
      (error) => {
        console.warn('Geolocation aviso:', error.message);
        setGpsError('GPS desactivado. Puede escribir una calle en el panel.');
        setIsLocating(false);
        loadBenchesForLocation(DEFAULT_MADRID_LOCATION.lat, DEFAULT_MADRID_LOCATION.lng, 'Puerta del Sol');
      },
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 30000,
      }
    );
  }, [loadBenchesForLocation]);

  useEffect(() => {
    requestCurrentLocation();
  }, [requestCurrentLocation]);

  // Manejar cuando el usuario busca una calle y número
  const handleAddressSelected = (address: GeocodedAddress) => {
    const newLocation: UserLocation = {
      lat: address.lat,
      lng: address.lng,
      address: address.displayName,
      isFallback: true,
    };
    setUserLocation(newLocation);
    setActiveZoneName(address.displayName);
    setGpsError(null);
    setSelectedBench(null);
    setRouteInfo(null);
    loadBenchesForLocation(address.lat, address.lng, address.street);

    // En móviles, mostrar el mapa tras buscar para ver los bancos directamente
    if (window.innerWidth < 768) {
      setMobileActiveView('map');
    }
  };

  // Cambiar a una zona predefinida de Madrid
  const handleSelectZone = (zone: { name: string; lat: number; lng: number }) => {
    setUserLocation({
      lat: zone.lat,
      lng: zone.lng,
      address: zone.name,
      isFallback: true,
    });
    setActiveZoneName(zone.name);
    setGpsError(null);
    setSelectedBench(null);
    setRouteInfo(null);
    loadBenchesForLocation(zone.lat, zone.lng, zone.name);

    if (window.innerWidth < 768) {
      setMobileActiveView('map');
    }
  };

  // Seleccionar un banco
  const handleSelectBench = (bench: Bench) => {
    setSelectedBench(bench);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(40);
    }
  };

  // Calcular ruta a pie más corta
  const handleStartRoute = async (bench: Bench) => {
    setIsCalculatingRoute(true);
    setSelectedBench(bench);
    try {
      const route = await getWalkingRoute(
        userLocation.lat,
        userLocation.lng,
        bench.lat,
        bench.lng,
        bench
      );
      setRouteInfo(route);
      if (window.innerWidth < 768) {
        setMobileActiveView('map');
      }
    } catch (err) {
      console.error('Error calculando ruta:', err);
    } finally {
      setIsCalculatingRoute(false);
    }
  };

  const handleClearRoute = () => {
    setRouteInfo(null);
  };

  // Bancos filtrados según respaldo
  const displayedBenches = filterOnlyBackrest
    ? benches.filter((b) => b.hasBackrest)
    : benches;

  return (
    <div className={`h-[100dvh] w-full flex flex-col sm:flex-row bg-slate-900 text-slate-900 overflow-hidden ${isLargeText ? 'text-lg' : 'text-base'}`}>
      {/* 
        COLUMNA IZQUIERDA:
        Toda la parte textual, búsqueda de calle y número, banco más cercano y lista de bancos.
        Ocupa EXACTAMENTE el 30% del ancho de pantalla.
      */}
      <div className={`h-full flex-shrink-0 left-text-column-30 ${
        mobileActiveView === 'map' ? 'hidden sm:flex' : 'flex'
      }`}>
        <LeftPanel
          userLocation={userLocation}
          activeZoneName={activeZoneName}
          isLocating={isLocating}
          gpsError={gpsError}
          onRequestGPS={requestCurrentLocation}
          onOpenZonePicker={() => setShowZonePicker(true)}
          isLargeText={isLargeText}
          onToggleLargeText={() => setIsLargeText((prev) => !prev)}
          onAddressSelected={handleAddressSelected}
          benches={displayedBenches}
          selectedBench={selectedBench}
          onSelectBench={handleSelectBench}
          routeInfo={routeInfo}
          onStartRoute={handleStartRoute}
          onClearRoute={handleClearRoute}
          filterOnlyBackrest={filterOnlyBackrest}
          onToggleFilterBackrest={() => setFilterOnlyBackrest((prev) => !prev)}
        />
      </div>

      {/* 
        COLUMNA DERECHA:
        EL MAPA ENORME A TODA PANTALLA.
        Ocupa EXACTAMENTE el 70% del ancho de pantalla.
      */}
      <main className={`h-full relative min-h-0 bg-stone-100 flex flex-col overflow-hidden right-map-column-70 ${
        mobileActiveView === 'panel' ? 'hidden sm:flex' : 'flex'
      }`}>
        <MapComponent
          userLocation={userLocation}
          benches={displayedBenches}
          selectedBench={selectedBench}
          onSelectBench={handleSelectBench}
          routeInfo={routeInfo}
          isLargeText={isLargeText}
        />

        {/* Indicador flotante si está calculando o buscando bancos reales en OpenStreetMap */}
        {(isLoadingBenches || isCalculatingRoute) && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] px-4 py-2 bg-slate-950/90 text-white rounded-full shadow-2xl flex items-center gap-2 text-sm font-black border-2 border-amber-400">
            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            <span>
              {isCalculatingRoute
                ? 'Trazando ruta peatonal...'
                : 'Cargando bancos de parques, jardines y aceras...'}
            </span>
          </div>
        )}

        {/* Botón flotante en móviles para ver la información textual si estamos viendo el mapa */}
        <div className="sm:hidden absolute bottom-4 left-4 right-4 z-[500]">
          <button
            type="button"
            onClick={() => setMobileActiveView('panel')}
            className="w-full min-h-[54px] bg-slate-950 text-white rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-2xl border-3 border-amber-400 cursor-pointer active:scale-95 transition-transform"
          >
            <AlignLeft className="w-6 h-6 text-amber-400" />
            <span>VER PANEL DE BÚSQUEDA Y LISTA ({displayedBenches.length})</span>
          </button>
        </div>
      </main>

      {/* Barra de alternancia solo en móviles pequeños cuando se ve el panel */}
      {mobileActiveView === 'panel' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-[600] p-3 bg-slate-950 border-t-3 border-amber-400">
          <button
            type="button"
            onClick={() => setMobileActiveView('map')}
            className="w-full min-h-[50px] bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl font-black text-base flex items-center justify-center gap-2 border-2 border-amber-600 shadow-xl cursor-pointer"
          >
            <Map className="w-6 h-6" />
            <span>VOLVER A VER EL MAPA EN GRANDE</span>
          </button>
        </div>
      )}

      {/* Modal de Selector de Zonas de Madrid */}
      {showZonePicker && (
        <ZoneSelectorModal
          currentLocationName={activeZoneName}
          onSelectZone={handleSelectZone}
          onRequestGPS={requestCurrentLocation}
          onClose={() => setShowZonePicker(false)}
          isLargeText={isLargeText}
        />
      )}
    </div>
  );
}
