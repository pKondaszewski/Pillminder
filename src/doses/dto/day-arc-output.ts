export interface ArcPoint {
  x: number;
  y: number;
}

export interface AxisTick {
  label: string;
  x: number;
  y: number;
  anchor: 'start' | 'middle' | 'end';
}

export type DaySymbol = 'risingSun' | 'sun' | 'moon';

export type SkyTone = 'day' | 'night' | 'overdue' | 'done';
