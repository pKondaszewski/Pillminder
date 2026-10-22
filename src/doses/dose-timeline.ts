import { doseStatus } from './dose-status';
import type { DoseStatus } from './dto/dose-status';
import type { TimelineMark } from './dto/timeline-mark';
import type { TodayDose } from './dto/today-dose-output';

const TIMELINE_START_HOUR = 6;
const TIMELINE_END_HOUR = 24;

const MINUTES_PER_HOUR = 60;
const AXIS_MINUTES =
  (TIMELINE_END_HOUR - TIMELINE_START_HOUR) * MINUTES_PER_HOUR;

const URGENCY_ORDER: readonly DoseStatus[] = [
  'overdue',
  'planned',
  'skipped',
  'taken',
];

interface Cluster {
  doses: TodayDose[];
  positionSum: number;
}

export function buildTimeline(
  doses: TodayDose[],
  now: Date,
  minSpacing: number,
): TimelineMark[] {
  return clusterBySpacing(doses, minSpacing).map(({ doses, positionSum }) => ({
    id: doses[0].id,
    position: positionSum / doses.length,
    status: mostUrgent(doses.map((dose) => doseStatus(dose, now))),
    doses,
    remaining: doses.filter(({ state }) => state === 'pending').length,
  }));
}

export function nowPosition(now: Date): number {
  return axisPosition(now);
}

function clusterBySpacing(doses: TodayDose[], minSpacing: number): Cluster[] {
  const sorted = [...doses].sort(
    (a, b) => a.plannedAt.getTime() - b.plannedAt.getTime(),
  );
  return sorted.reduce<Cluster[]>((clusters, dose) => {
    const position = axisPosition(dose.plannedAt);
    const last = clusters[clusters.length - 1];
    const isNear =
      last !== undefined &&
      position - last.positionSum / last.doses.length < minSpacing;
    if (isNear) {
      last.doses.push(dose);
      last.positionSum += position;
    } else {
      clusters.push({ doses: [dose], positionSum: position });
    }
    return clusters;
  }, []);
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
