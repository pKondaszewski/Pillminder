import { mixColors } from './color';
import type { ScenePalette } from './dto/scene-palette';
import type { Season } from './dto/season';
import type { SceneMood, SkyPhase } from './dto/sky-scene';

const NIGHT_LAND_SHARE: Record<Season, number> = {
  spring: 0.75,
  summer: 0.75,
  autumn: 0.75,
  winter: 0.55,
};
const TWILIGHT_LAND_SHARE = 0.45;

export const SCENE_PALETTES = {
  light: {
    sky: {
      dawn: ['#F8D5E4', '#FFEBD0'],
      day: ['#CDE7F7', '#EAF5FB'],
      dusk: ['#E2D2F2', '#FFDCC4'],
      night: ['#D3CEF0', '#E8E5F7'],
      done: ['#CBEBD7', '#E9F4EE'],
    },
    land: {
      spring: ['#A9CFE0', '#8CC4A0', '#6FB487', '#5AA571'],
      summer: ['#9FC8DA', '#7BB98C', '#5DAA74', '#4C9B62'],
      autumn: ['#B7C6D3', '#D2AE72', '#BE8C4C', '#A8743A'],
      winter: ['#C9D8E6', '#E3ECF4', '#F1F6FA', '#DCE6EF'],
    },
    landNight: ['#8A86BD', '#6D6AA6', '#55528F', '#47457F'],
    star: '#6A5FB5',
    moon: '#5B6675',
    cloud: '#FFFFFF',
    cloudOpacity: 0.75,
    sunLow: '#F08A4B',
    bud: '#8FC48A',
    stem: '#3F7F4E',
    stone: '#A3ADB8',
    mushroomStem: '#EFE6D3',
    mushroomCap: '#8A5A34',
    basket: '#A9743F',
    wilted: '#6E7782',
    petal: '#FFFFFF',
    petalEdge: '#C9D3DC',
    snow: '#FFFFFF',
    road: '#E8DCC3',
    roadEdge: '#CDBB98',
    house: '#F3EEE6',
    roof: '#B5523B',
    car: '#D9822B',
    suitcase: '#2F6E8E',
    door: '#225068',
    wheel: '#2A2420',
    window: 'rgba(255,255,255,0.8)',
    tentShade: 'rgba(0,0,0,0.25)',
  },
  dark: {
    sky: {
      dawn: ['#3B2A48', '#5C3B38'],
      day: ['#17405C', '#12293A'],
      dusk: ['#3B2A52', '#5A3626'],
      night: ['#0B0F2A', '#1B1730'],
      done: ['#1B4430', '#16291F'],
    },
    land: {
      spring: ['#1E4A63', '#1E5444', '#1C5A45', '#2A7A5A'],
      summer: ['#1D4660', '#1B5040', '#195641', '#25734F'],
      autumn: ['#2A3D4D', '#4D3B22', '#58401F', '#6E4E22'],
      winter: ['#2B3B4E', '#3A4A5E', '#46566B', '#55657A'],
    },
    landNight: ['#161B33', '#12172B', '#0E1222', '#0B0F1D'],
    star: '#E6EBF0',
    moon: '#E6EBF0',
    cloud: '#9FB6CC',
    cloudOpacity: 0.18,
    sunLow: '#F29A5C',
    bud: '#4F7A5A',
    stem: '#3E7A52',
    stone: '#6E7A88',
    mushroomStem: '#CFC4B2',
    mushroomCap: '#7A4F2E',
    basket: '#8A5E33',
    wilted: '#4F5864',
    petal: '#EEF2F6',
    petalEdge: '#9AA6B3',
    snow: '#DDE6EE',
    road: '#4A4030',
    roadEdge: '#5E5240',
    house: '#C9C2B6',
    roof: '#9A4632',
    car: '#E39448',
    suitcase: '#3A86AC',
    door: '#2A6584',
    wheel: '#2A2420',
    window: 'rgba(255,255,255,0.8)',
    tentShade: 'rgba(0,0,0,0.25)',
  },
} as const satisfies Record<'light' | 'dark', ScenePalette>;

export function sceneColors(
  palette: ScenePalette,
  season: Season,
  phase: SkyPhase,
  mood: SceneMood,
): string[] {
  const [top, bottom] = palette.sky[mood === 'done' ? 'done' : phase];
  return [top, bottom, ...landColors(palette, season, phase)];
}

function landColors(
  palette: ScenePalette,
  season: Season,
  phase: SkyPhase,
): string[] {
  const day = palette.land[season];
  if (phase === 'day') return [...day];
  const nightShare =
    phase === 'night' ? NIGHT_LAND_SHARE[season] : TWILIGHT_LAND_SHARE;
  return day.map((color, index) =>
    mixColors(color, palette.landNight[index], nightShare),
  );
}
