const AVERAGE_DROPS_PER_ML = 20;

export function mlToDrops(ml: number): number {
  return ml * AVERAGE_DROPS_PER_ML;
}

export function dropsToMl(drops: number): number {
  return Math.max(1, Math.round(drops / AVERAGE_DROPS_PER_ML));
}
