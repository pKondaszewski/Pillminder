import { type DoseStatus, doseStatus } from './dose-status';
import type { TodayDose } from './dto/today-dose-output';

const TIMELINE_START_HOUR = 6;
const TIMELINE_END_HOUR = 24;
const TIMELINE_MERGE_WINDOW_MS = 60 * 60 * 1000;
const TIMELINE_MAX_SLICES = 4;

const MINUTES_PER_HOUR = 60;
const AXIS_MINUTES =
  (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * MINUTES_PER_HOUR;

const URGENCY_ORDER: readonly DoseStatus[] = [
  'overdue',
  'skipped',
  'taken',
  'planned',
];

export interface TimelineMark {
  id: string;
  position: number;
  statuses: DoseStatus[];
  count: number | null;
}

export function buildTimeline(doses: TodayDose[], now: Date): TimelineMark[] {
  return mergeNearby(doses).map((cluster) => {
    const statuses = cluster.map((dose) => doseStatus(dose, now));
    const tooMany = statuses.length > TIMELINE_MAX_SLICES;
    return {
      id: cluster[0].id,
      position: axisPosition(averageTime(cluster)),
      statuses: tooMany ? [mostUrgent(statuses)] : statuses,
      count: tooMany ? statuses.length : null,
    };
  });
}

export function nowPosition(now: Date): number {
  return axisPosition(now);
}

function mergeNearby(doses: TodayDose[]): TodayDose[][] {
  const sorted = [...doses].sort(
    (a, b) => a.plannedAt.getTime() - b.plannedAt.getTime(),
  );
  return sorted.reduce<TodayDose[][]>((clusters, dose) => {
    const last = clusters[clusters.length - 1];
    const previous = last?.[last.length - 1];
    const isNear =
      previous !== undefined &&
      dose.plannedAt.getTime() - previous.plannedAt.getTime() <
        TIMELINE_MERGE_WINDOW_MS;
    if (isNear) last.push(dose);
    else clusters.push([dose]);
    return clusters;
  }, []);
}

function averageTime(cluster: TodayDose[]): Date {
  const sum = cluster.reduce(
    (total, dose) => total + dose.plannedAt.getTime(),
    0,
  );
  return new Date(sum / cluster.length);
}

function axisPosition(time: Date): number {
  const minutes =
    time.getHours() * MINUTES_PER_HOUR +
    time.getMinutes() -
    TIMELINE_START_HOUR * MINUTES_PER_HOUR;
  return Math.min(1, Math.max(0, minutes / AXIS_MINUTES));
}

function mostUrgent(statuses: DoseStatus[]): DoseStatus {
  return URGENCY_ORDER.find((status) => statuses.includes(status))!;
}
