export const SCENE_HEIGHT = 330;
export const SCENE_HORIZON_Y = 160;
export const SCENE_BODY_TRAVEL = 80;
export const SCENE_FADE_HEIGHT = 90;
export const SCENE_FADE_SHIFT = 30;
export const GROUND_Y = 204;

export function rayPath(count: number, inner: number, outer: number): string {
  return Array.from({ length: count }, (_, index) => {
    const angle = (2 * Math.PI * index) / count;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return `M${(cos * inner).toFixed(2)} ${(sin * inner).toFixed(2)}L${(cos * outer).toFixed(2)} ${(sin * outer).toFixed(2)}`;
  }).join('');
}
