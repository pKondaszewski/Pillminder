import type { MeadowEvent, MeadowMark, Point } from './dto/meadow';
import { GROUND_Y } from './scene-geometry';

const MEADOW_FROM = 0.07;
const MEADOW_SPAN = 0.78;
const SLOT_DEPTH = 14;
const SLOT_STAGGER = 9;
const BASKET_INSET_X = 30;
const BASKET_DEPTH = 24;
const CREATURE_DEPTH = 32;
const CREATURE_START_X = -20;
const GROWTH_SPEED = 1.6;
const GROWTH_DELAY = 0.12;
const MIN_MARK_SPACING = 44;

export function meadowSlot(
  position: number,
  index: number,
  width: number,
): Point {
  return {
    x: (MEADOW_FROM + MEADOW_SPAN * position) * width,
    y: GROUND_Y + SLOT_DEPTH + (index % 2) * SLOT_STAGGER,
  };
}

export function basketSlot(width: number): Point {
  return { x: width - BASKET_INSET_X, y: GROUND_Y + BASKET_DEPTH };
}

export function creatureSlot(
  position: number,
  width: number,
  arrival: number,
): Point {
  'worklet';
  const target = (MEADOW_FROM + MEADOW_SPAN * position) * width;
  return {
    x: CREATURE_START_X + (target - CREATURE_START_X) * arrival,
    y: GROUND_Y + CREATURE_DEPTH,
  };
}

export function markSpacing(width: number): number {
  return MIN_MARK_SPACING / (MEADOW_SPAN * width);
}

export function plantGrowth(entry: number, index: number): number {
  'worklet';
  return Math.min(1, Math.max(0, entry * GROWTH_SPEED - index * GROWTH_DELAY));
}

export function meadowEvents(
  previous: MeadowMark[] | null,
  next: MeadowMark[],
  firstKey: number,
): MeadowEvent[] {
  if (previous === null) return [];
  const before = new Map(previous.map((mark) => [mark.id, mark]));
  return next
    .filter((mark) => mark.taken > (before.get(mark.id)?.taken ?? mark.taken))
    .map((mark, index) => ({
      key: firstKey + index,
      markId: mark.id,
      flies: mark.status === 'taken' && before.get(mark.id)?.status !== 'taken',
    }));
}
