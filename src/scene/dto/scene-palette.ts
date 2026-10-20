import type { Season } from './season';
import type { SkyKey } from './sky-scene';

type Gradient = readonly [top: string, bottom: string];
type Land = readonly [far: string, mid: string, near: string, grass: string];

export interface ScenePalette {
  sky: Record<SkyKey, Gradient>;
  land: Record<Season, Land>;
  landNight: Land;
  star: string;
  moon: string;
  cloud: string;
  cloudOpacity: number;
  sunLow: string;
  bud: string;
  stem: string;
  stone: string;
  mushroomStem: string;
  mushroomCap: string;
  basket: string;
  wilted: string;
  petal: string;
  petalEdge: string;
  snow: string;
  road: string;
  roadEdge: string;
  house: string;
  roof: string;
  car: string;
  suitcase: string;
  door: string;
  wheel: string;
  window: string;
  tentShade: string;
}
