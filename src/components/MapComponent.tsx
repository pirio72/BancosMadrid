import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Bench, RouteInfo, UserLocation } from '../types/bench';
import { Locate, ZoomIn, ZoomOut } from 'lucide-react';

interface MapComponentProps {
  userLocation: UserLocation;
  benches: Bench[];
  selectedBench: Bench | null;
  onSelectBench: (bench: Bench) => void;
  routeInfo: RouteInfo | null;
  isLargeText: boolean;
}

export const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  benches,
  selectedBench,
  onSelectBench,
  routeInfo,
  isLargeText,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Inicializar mapa Leaflet con soporte robusto de redimensionamiento
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [userLocation.lat, userLocation.lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
    });

    // Capa de OpenStreetMap estándar altamente confiable y disponible
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    // Forzar actualización de tamaño para evitar mapas en blanco
    const invalidate = () => {
      map.invalidateSize();
    };

    invalidate();
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 300);
    const t3 = setTimeout(invalidate, 800);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        invalidate();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (resizeObserver) resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Actualizar marcador del usuario y centrar cuando cambie la posición
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const latLng: [number, number] = [userLocation.lat, userLocation.lng];

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latLng);
    } else {
      const userIconHtml = `
        <div style="position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center;">
          <div style="position:absolute; width:34px; height:34px; border-radius:9999px; background-color:rgba(59,130,246,0.35); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
          <div style="position:relative; width:26px; height:26px; border-radius:9999px; background-color:#1d4ed8; border:3px solid #ffffff; box-shadow:0 10px 15px -3px rgba(0,0,0,0.3); display:flex; align-items:center; justify-content:center;">
            <div style="width:10px; height:10px; border-radius:9999px; background-color:#ffffff;"></div>
          </div>
          <div style="margin-top:4px; padding:2px 8px; background-color:#1e3a8a; color:#ffffff; font-weight:900; font-size:11px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.2); white-space:nowrap; border:1px solid rgba(255,255,255,0.8); pointer-events:none;">
            Usted está aquí
          </div>
        </div>
      `;

      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: userIconHtml,
        iconSize: [120, 50],
        iconAnchor: [60, 13],
      });

      userMarkerRef.current = L.marker(latLng, {
        icon: userIcon,
        zIndexOffset: 1000,
      }).addTo(map);
    }

    // Centrar mapa si no hay una ruta activa específica
    if (!routeInfo) {
      map.setView(latLng, map.getZoom() || 17);
    }
  }, [userLocation, routeInfo]);

  // Actualizar marcadores de bancos
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    benches.forEach((bench) => {
      const isSelected = selectedBench?.id === bench.id;

      const bgColor = '#15803d'; // Verde esmeralda oficial
      const borderStyle = isSelected 
        ? 'border: 2.5px solid #facc15; box-shadow: 0 0 0 3px rgba(250,204,21,0.8); transform: scale(1.25);' 
        : 'border: 1.5px solid #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.35);';

      const iconHtml = `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer; user-select:none;">
          <!-- Pin del banco: tamaño reducido a la mitad (21px de diámetro) -->
          <div style="width:21px; height:21px; border-radius:9999px; background-color:${bgColor}; ${borderStyle} display:flex; align-items:center; justify-content:center; color:#ffffff; transition: transform 0.15s ease;">
            <svg style="width:12px; height:12px;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18v3h3v-3h10v3h3v-3h1a1 1 0 0 0 1-1v-4a2 2 0 0 0-2-2h-1V5a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v6H4a2 2 0 0 0-2 2v4a1 1 0 0 0 1 1h1zm3-13a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v6H7V5z"/>
            </svg>
          </div>
          <!-- Distancia en metros compacta -->
          ${
            bench.distanceMeters !== undefined && (isSelected || bench.distanceMeters < 120)
              ? `<div style="margin-top:2px; padding:1px 4px; background-color:#0f172a; color:#ffffff; font-weight:800; font-size:9px; border-radius:3px; box-shadow:0 1px 3px rgba(0,0,0,0.3); white-space:nowrap;">
                  ${bench.distanceMeters} m
                </div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-bench-marker',
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 11],
      });

      const marker = L.marker([bench.lat, bench.lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 500 : 100,
      });

      marker.on('click', () => {
        onSelectBench(bench);
      });

      markersGroup.addLayer(marker);
    });
  }, [benches, selectedBench, onSelectBench]);

  // Dibujar la ruta a pie cuando haya una activa
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }

    if (routeInfo && routeInfo.coordinates.length > 0) {
      const polyline = L.polyline(routeInfo.coordinates, {
        color: '#1d4ed8',
        weight: 8,
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
        dashArray: '4, 10',
      }).addTo(map);

      routePolylineRef.current = polyline;

      const bounds = L.latLngBounds(routeInfo.coordinates);
      bounds.extend([userLocation.lat, userLocation.lng]);
      map.fitBounds(bounds, {
        padding: [60, 60],
        maxZoom: 18,
      });
    }
  }, [routeInfo, userLocation]);

  // Si se selecciona un banco y no hay ruta aún, centrar en él
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedBench || routeInfo) return;

    map.flyTo([selectedBench.lat, selectedBench.lng], 18, {
      duration: 0.5,
    });
  }, [selectedBench, routeInfo]);

  // Acciones táctiles para mayores
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 17, {
        duration: 0.6,
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex-1 bg-stone-100 overflow-hidden">
      {/* Contenedor del mapa Leaflet */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full min-h-[400px]" 
        style={{ width: '100%', height: '100%', minHeight: '400px', zIndex: 1 }} 
      />

      {/* Controles táctiles grandes en pantalla */}
      <div className="absolute right-4 top-4 z-[400] flex flex-col gap-2.5">
        <button
          type="button"
          onClick={handleRecenter}
          aria-label="Centrar mapa en mi posición actual"
          className="w-14 h-14 bg-white text-blue-700 rounded-2xl shadow-xl border-2 border-blue-600 flex flex-col items-center justify-center active:bg-blue-50 transition-colors focus:ring-4 focus:ring-blue-300 cursor-pointer"
        >
          <Locate className="w-7 h-7 stroke-[2.5]" />
          <span className="text-[10px] font-black text-slate-900 leading-tight">Mi sitio</span>
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          aria-label="Acercar mapa"
          className="w-14 h-14 bg-white text-slate-900 rounded-2xl shadow-xl border-2 border-slate-700 flex flex-col items-center justify-center active:bg-slate-100 transition-colors focus:ring-4 focus:ring-slate-300 font-bold cursor-pointer"
        >
          <ZoomIn className="w-7 h-7 stroke-[2.5]" />
          <span className="text-[10px] font-black text-slate-900 leading-tight">Acercar</span>
        </button>

        <button
          type="button"
          onClick={handleZoomOut}
          aria-label="Alejar mapa"
          className="w-14 h-14 bg-white text-slate-900 rounded-2xl shadow-xl border-2 border-slate-700 flex flex-col items-center justify-center active:bg-slate-100 transition-colors focus:ring-4 focus:ring-slate-300 font-bold cursor-pointer"
        >
          <ZoomOut className="w-7 h-7 stroke-[2.5]" />
          <span className="text-[10px] font-black text-slate-900 leading-tight">Alejar</span>
        </button>
      </div>

      {/* Indicador visual en la parte superior del mapa */}
      <div className="absolute left-4 top-4 z-[400] bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl shadow-lg border-2 border-slate-700 pointer-events-auto">
        <div className="flex items-center gap-2 text-xs font-black text-slate-800">
          <span className="w-3 h-3 rounded-full bg-emerald-700 border border-white shadow-xs flex-shrink-0"></span>
          <span>Bancos públicos oficiales</span>
        </div>
      </div>
    </div>
  );
};
