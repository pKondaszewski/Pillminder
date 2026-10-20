import { GROUND_Y } from './scene-geometry';

export const ROAD_PANEL_MARGIN = 20;
export const ROAD_PANEL_PADDING = 12;
export const ROAD_PANEL_TOP = GROUND_Y + 24;
export const ROAD_OVERRUN_DAYS = 3;
const ROAD_END_INSET = 72;
const ROAD_BASE_Y = GROUND_Y + 8;
const ROAD_WOBBLE = 5;
const ROAD_WOBBLE_CYCLES = 1.3;
const ROAD_STEP = 4;
const MAX_DAY_STONES = 14;

export interface RoadAxis {
  start: number;
  end: number;
  limit: number;
  perDay: number;
}

export function roadAxis(width: number, tripDays: number): RoadAxis {
  const start = ROAD_PANEL_MARGIN + ROAD_PANEL_PADDING;
  const end = width - ROAD_END_INSET;
  return {
    start,
    end,
    limit: width - start,
    perDay: (end - start) / tripDays,
  };
}

export function roadX(axis: RoadAxis, day: number): number {
  'worklet';
  return axis.start + axis.perDay * day;
}

export function roadY(width: number, x: number): number {
  'worklet';
  return (
    ROAD_BASE_Y +
    ROAD_WOBBLE * Math.sin(((2 * Math.PI * x) / width) * ROAD_WOBBLE_CYCLES)
  );
}

export function roadPath(width: number, from: number, to: number): string {
  const points: string[] = [];
  for (let x = from; x < to; x += ROAD_STEP) {
    points.push(pointAt(width, x));
  }
  points.push(pointAt(width, to));
  return `M${points.join('L')}`;
}

export function dayStoneDays(tripDays: number): number[] {
  const step = Math.ceil((tripDays - 1) / MAX_DAY_STONES) || 1;
  const days: number[] = [];
  for (let day = step; day < tripDays; day += step) days.push(day);
  return days;
}

function pointAt(width: number, x: number): string {
  return `${x.toFixed(1)} ${roadY(width, x).toFixed(1)}`;
}
