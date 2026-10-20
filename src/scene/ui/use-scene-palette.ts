import { useColorScheme } from 'react-native';

import { SCENE_PALETTES, type ScenePalette } from '@/scene/scene-service';

export function useScenePalette(): ScenePalette {
  return SCENE_PALETTES[useColorScheme() === 'dark' ? 'dark' : 'light'];
}
