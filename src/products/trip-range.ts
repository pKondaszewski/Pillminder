import { isoDay } from '@/config/date-utils';

export interface TripRange {
  from: Date;
  to: Date | null;
}

export function tapDay(range: TripRange, day: Date): TripRange {
  const extendsRange = range.to === null && isoDay(day) >= isoDay(range.from);
  return extendsRange ? { from: range.from, to: day } : { from: day, to: null };
}

export function isEdgeOfRange(range: TripRange, day: Date): boolean {
  return [range.from, range.to].some(
    (edge) => edge !== null && isoDay(edge) === isoDay(day),
  );
}

export function isInsideRange(range: TripRange, day: Date): boolean {
  return (
    range.to !== null &&
    isoDay(day) > isoDay(range.from) &&
    isoDay(day) < isoDay(range.to)
  );
}
