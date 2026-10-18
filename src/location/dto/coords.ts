export interface Coords {
  latitude: number;
  longitude: number;
}

export interface StoredLocation extends Coords {
  savedAt: number;
}
