import type { AndroidSymbol } from 'expo-symbols';

import { isBuiltInCategory } from './category';
import type { BuiltInCategory } from './dto/new-product-input';

export type AvatarTone = BuiltInCategory | 'custom';

const AVATAR_ICONS: Record<AvatarTone, AndroidSymbol> = {
  medication: 'add',
  supplement: 'eco',
  care: 'sanitizer',
  custom: 'sell',
};

export function categoryAvatar(category: string): {
  tone: AvatarTone;
  icon: AndroidSymbol;
} {
  const tone = isBuiltInCategory(category) ? category : 'custom';
  return { tone, icon: AVATAR_ICONS[tone] };
}
