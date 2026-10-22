import type { Season } from './dto/season';

const MONTHS_IN_YEAR = 12;
const HALF_YEAR_MONTHS = 6;
const NORTHERN_SEASON_BY_MONTH: readonly Season[] = [
  'winter',
  'winter',
  'spring',
  'spring',
  'spring',
  'summer',
  'summer',
  'summer',
  'autumn',
  'autumn',
  'autumn',
  'winter',
];

export function resolveSeason(
  preference: Season | 'auto',
  date: Date,
  latitude: number | null,
): Season {
  return preference === 'auto' ? seasonOf(date, latitude) : preference;
}

export function seasonOf(date: Date, latitude: number | null): Season {
  const shift = latitude !== null && latitude < 0 ? HALF_YEAR_MONTHS : 0;
  return NORTHERN_SEASON_BY_MONTH[(date.getMonth() + shift) % MONTHS_IN_YEAR];
}
