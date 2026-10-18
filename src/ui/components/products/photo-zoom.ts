export const MIN_SCALE = 1;
const MAX_SCALE = 5;
const DOUBLE_TAP_SCALE = 2.5;

type Point = { x: number; y: number };
type Size = { width: number; height: number };

export function clampScale(scale: number): number {
  'worklet';
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

export function doubleTapScale(currentScale: number): number {
  'worklet';
  return currentScale > MIN_SCALE ? MIN_SCALE : DOUBLE_TAP_SCALE;
}

function maxTranslation(scale: number, view: Size): Point {
  'worklet';
  return {
    x: Math.max(0, (view.width * (scale - 1)) / 2),
    y: Math.max(0, (view.height * (scale - 1)) / 2),
  };
}

export function clampTranslation(
  translation: Point,
  scale: number,
  view: Size,
): Point {
  'worklet';
  const max = maxTranslation(scale, view);
  // + 0 turns -0 (from -max when max is 0) into 0
  return {
    x: Math.min(max.x, Math.max(-max.x, translation.x)) + 0,
    y: Math.min(max.y, Math.max(-max.y, translation.y)) + 0,
  };
}

// focal is relative to the view centre; the point under it stays in place
export function translationAfterZoom(
  translation: Point,
  fromScale: number,
  toScale: number,
  focal: Point,
  view: Size,
): Point {
  'worklet';
  const ratio = toScale / fromScale;
  return clampTranslation(
    {
      x: focal.x - (focal.x - translation.x) * ratio,
      y: focal.y - (focal.y - translation.y) * ratio,
    },
    toScale,
    view,
  );
}

export function canPanHorizontally(
  translationX: number,
  scale: number,
  view: Size,
  deltaX: number,
): boolean {
  'worklet';
  const max = maxTranslation(scale, view).x;
  if (max === 0) return false;
  if (deltaX > 0) return translationX < max;
  if (deltaX < 0) return translationX > -max;
  return true;
}
