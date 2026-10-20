import type { AndroidSymbol } from 'expo-symbols';

import { isBuiltInCategory } from './category';
import type { BuiltInCategory } from './dto/new-product-input';

export type AvatarTone = 'medication' | 'supplement' | 'care' | 'custom';

type Avatar = { tone: AvatarTone; icon: AndroidSymbol };

const AVATARS: Record<BuiltInCategory | 'custom', Avatar> = {
  medication: { tone: 'medication', icon: 'add' },
  supplement: { tone: 'supplement', icon: 'eco' },
  care: { tone: 'care', icon: 'sanitizer' },
  'nasal-spray': { tone: 'medication', icon: 'sanitizer' },
  'eye-drops': { tone: 'medication', icon: 'water_drop' },
  custom: { tone: 'custom', icon: 'sell' },
};

export function categoryAvatar(category: string): Avatar {
  return AVATARS[isBuiltInCategory(category) ? category : 'custom'];
}
