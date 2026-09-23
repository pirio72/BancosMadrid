/**
 * Servicio de integración con el catálogo oficial de Datos Abiertos del Ayuntamiento de Madrid:
 * "Mobiliario urbano. Bancos" (https://datos.madrid.es/dataset/300095-0-mobiliario-bancos)
 *
 * Contiene los más de 76.700 bancos públicos oficiales instalados y gestionados por el
 * Ayuntamiento de Madrid, con sus coordenadas oficiales de alta precisión (sistema MINT).
 */

import { Bench } from '../types/bench';
import { calculateDistanceMeters, calculateWalkingMinutes, calculateSteps } from './benchService';

// Array de bancos oficiales en memoria: [id, lat, lng, backrest, street, aux, model]
type CompactBenchRow = [string, number, number, number, string, string, string];

let cachedBenches: CompactBenchRow[] | null = null;
let spatialGrid: Map<string, CompactBenchRow[]> | null = null;
let isDatasetLoading = false;
let loadPromise: Promise<CompactBenchRow[]> | null = null;

/**
 * Carga e indexa espacialmente el censo completo de bancos oficiales del Ayuntamiento de Madrid.
 */
export async function loadOfficialMadridDataset(): Promise<CompactBenchRow[]> {
  if (cachedBenches) return cachedBenches;
  if (loadPromise) return loadPromise;

  isDatasetLoading = true;
  loadPromise = (async () => {
    try {
      const response = await fetch('/data/madrid_bancos.json');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} cargando datos del Ayto. de Madrid`);
      }
      const data: CompactBenchRow[] = await response.json();
      cachedBenches = data;

      // Crear índice espacial de celdas de 0.01 grados (~1 km x 1 km)
      const grid = new Map<string, CompactBenchRow[]>();
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const cellKey = `${Math.floor(row[1] * 100)}_${Math.floor(row[2] * 100)}`;
        let cell = grid.get(cellKey);
        if (!cell) {
          cell = [];
          grid.set(cellKey, cell);
        }
        cell.push(row);
      }
      spatialGrid = grid;
      return data;
    } catch (err) {
      console.warn('Aviso: no se pudo cargar el censo del Ayto. de Madrid:', err);
      return [];
    } finally {
      isDatasetLoading = false;
    }
  })();

  return loadPromise;
}

/**
 * Consulta los bancos oficiales del Ayuntamiento de Madrid en un radio dado.
 * Si el conjunto oficial aún no se ha cargado en memoria, inicia su carga en segundo plano.
 */
export async function queryOfficialMadridBenches(
  lat: number,
  lng: number,
  radiusMeters = 800
): Promise<Bench[]> {
  const data = await loadOfficialMadridDataset();
  if (!data || data.length === 0 || !spatialGrid) {
    return [];
  }

  // Radio en grados aproximados
  const deltaLat = radiusMeters / 111000;
  const deltaLng = radiusMeters / 85000;

  const minLatB = Math.floor((lat - deltaLat) * 100);
  const maxLatB = Math.floor((lat + deltaLat) * 100);
  const minLngB = Math.floor((lng - deltaLng) * 100);
  const maxLngB = Math.floor((lng + deltaLng) * 100);

  const matchedBenches: Bench[] = [];

  for (let la = minLatB; la <= maxLatB; la++) {
    for (let ln = minLngB; ln <= maxLngB; ln++) {
      const cell = spatialGrid.get(`${la}_${ln}`);
      if (!cell) continue;

      for (let i = 0; i < cell.length; i++) {
        const row = cell[i];
        const bLat = row[1];
        const bLng = row[2];

        const dLat = bLat - lat;
        if (dLat > deltaLat || dLat < -deltaLat) continue;
        const dLng = bLng - lng;
        if (dLng > deltaLng || dLng < -deltaLng) continue;

        const dist = calculateDistanceMeters(lat, lng, bLat, bLng);
        if (dist <= radiusMeters) {
          const id = row[0];
          const hasBackrest = row[3] === 1;
          const streetName = row[4];
          const aux = row[5];
          const model = row[6] || 'MU-16';

          const isGarden = aux.includes('JARDIN') || aux.includes('PARQUE');
          const landmark = isGarden
            ? `Zona ajardinada · Modelo oficial ${model}`
            : aux
            ? `Junto a ${aux} · Modelo oficial ${model}`
            : `Banco municipal en acera · Modelo ${model}`;

          matchedBenches.push({
            id: `mad-${id}`,
            lat: bLat,
            lng: bLng,
            name: 'Banco público (Oficial Ayto.)',
            streetName: streetName || 'Vía pública de Madrid',
            landmark,
            hasBackrest,
            hasShade: isGarden || hasBackrest,
            hasArmrests: model === 'MU-16' || model.startsWith('BA-12'),
            material: model.startsWith('MU-16') || model.startsWith('BA-12') ? 'madera' : 'madera/metal',
            seatsCount: 3,
            distanceMeters: dist,
            walkingMinutes: calculateWalkingMinutes(dist),
            stepsCount: calculateSteps(dist),
          });
        }
      }
    }
  }

  // Ordenar por distancia ascendente
  matchedBenches.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

  // Devolver los bancos más cercanos (hasta 60 bancos dentro del radio)
  return matchedBenches.slice(0, 60);
}
