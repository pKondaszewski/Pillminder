import type { Coords } from '@/location/dto/coords';
import { sunTimes } from '@/location/sun-times';

export interface DayPhases {
  sunrise: Date;
  noon: Date;
  sunset: Date;
}

const DEFAULT_SUNRISE_HOUR = 6;
const DEFAULT_NOON_HOUR = 12;
const DEFAULT_SUNSET_HOUR = 18;

export function dayPhases(date: Date, coords: Coords | null): DayPhases {
  return (coords && sunTimes(date, coords)) || defaultPhases(date);
}

function defaultPhases(date: Date): DayPhases {
  return {
    sunrise: atHour(date, DEFAULT_SUNRISE_HOUR),
    noon: atHour(date, DEFAULT_NOON_HOUR),
    sunset: atHour(date, DEFAULT_SUNSET_HOUR),
  };
}

function atHour(date: Date, hour: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour);
}
