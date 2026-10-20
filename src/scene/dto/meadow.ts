export type MarkStatus = 'planned' | 'overdue' | 'taken' | 'skipped';

export interface MeadowMark {
  id: string;
  position: number;
  status: MarkStatus;
  size: number;
  taken: number;
  label: string;
}

export interface MeadowEvent {
  key: number;
  markId: string;
  flies: boolean;
}

export interface Point {
  x: number;
  y: number;
}
