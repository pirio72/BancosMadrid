export interface Bench {
  id: string;
  lat: number;
  lng: number;
  hasBackrest: boolean; // Indicador fundamental de comodidad
  hasShade?: boolean; // Si está a la sombra o bajo árboles
  hasArmrests?: boolean; // Reposabrazos (fácil para levantarse)
  material?: 'madera' | 'piedra' | 'metal' | 'hormigón' | string;
  name: string;
  streetName: string;
  landmark?: string; // Punto de referencia fácil para personas mayores (ej. "frente a la farmacia")
  distanceMeters?: number;
  walkingMinutes?: number;
  stepsCount?: number;
  seatsCount?: number;
  isOverpassLive?: boolean;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  address?: string;
  isFallback?: boolean;
}

export interface RouteInstruction {
  id: string;
  text: string;
  detail?: string;
  distanceMeters: number;
  type: 'start' | 'straight' | 'turn-left' | 'turn-right' | 'destination';
}

export interface RouteInfo {
  benchId: string;
  distanceMeters: number;
  durationMinutes: number;
  stepsCount: number;
  coordinates: [number, number][]; // [lat, lng]
  instructions: RouteInstruction[];
}
