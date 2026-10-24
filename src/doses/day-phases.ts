import type { Coords } from '@/location/dto/coords';
import { sunTimes } from '@/location/sun-times';

import type { DayPhases } from './dto/day-phases';

const DEFAULT_SUNRISE_HOUR = 6;
const DEFAULT_SUNSET_HOUR = 18;

export function dayPhases(date: Date, coords: Coords | null): DayPhases {
  return (coords && sunTimes(date, coords)) || defaultPhases(date);
}

function defaultPhases(date: Date): DayPhases {
  return {
    sunrise: atHour(date, DEFAULT_SUNRISE_HOUR),
    sunset: atHour(date, DEFAULT_SUNSET_HOUR),
  };
}

function atHour(date: Date, hour: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
}
