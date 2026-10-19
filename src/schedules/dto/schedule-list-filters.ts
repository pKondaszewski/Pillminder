export type ScheduleKind = 'ongoing' | 'timed' | 'paused' | 'ended';

export type ScheduleListFilters = {
  query: string;
  kind: ScheduleKind | null;
  category: string | null;
};
