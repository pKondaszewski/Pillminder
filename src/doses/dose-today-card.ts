import { isoDay } from '@/config/date-utils';

import { doseStatus } from './dose-status';
import type { DayCounts, TodayCardState } from './dto/today-card-state';
import type { TodayDose } from './dto/today-dose-output';

export const BULK_TAKE_MIN_OVERDUE = 2;

const MAX_CARD_NAMES = 2;

export function dayCounts(doses: TodayDose[], now: Date): DayCounts {
  const statuses = doses.map((dose) => doseStatus(dose, now));
  const count = (wanted: string) =>
    statuses.filter((status) => status === wanted).length;
  return {
    total: doses.length,
    taken: count('taken'),
    skipped: count('skipped'),
    overdue: count('overdue'),
    planned: count('planned'),
  };
}

export function todayCardState(
  doses: TodayDose[],
  day: Date,
  now: Date,
): TodayCardState {
  const counts = dayCounts(doses, now);
  const dayKey = isoDay(day);
  const todayKey = isoDay(now);
  if (dayKey < todayKey) return { kind: 'pastSummary', counts };
  if (dayKey > todayKey) return { kind: 'futureSummary', counts };

  const byTime = [...doses].sort(
    (a, b) => a.plannedAt.getTime() - b.plannedAt.getTime(),
  );
  const overdue = byTime.filter((dose) => doseStatus(dose, now) === 'overdue');
  if (overdue.length > 0) return overdueState(overdue, counts, now);

  const next = byTime.find((dose) => doseStatus(dose, now) === 'planned');
  if (!next) return { kind: 'done', counts };
  return {
    kind: 'calm',
    counts,
    next,
    untilNextMs: next.plannedAt.getTime() - now.getTime(),
  };
}

function overdueState(
  overdue: TodayDose[],
  counts: DayCounts,
  now: Date,
): TodayCardState {
  const productNames = [...new Set(overdue.map((dose) => dose.productName))];
  return {
    kind: 'overdue',
    counts,
    overdue,
    names: productNames.slice(0, MAX_CARD_NAMES),
    otherCount: Math.max(0, productNames.length - MAX_CARD_NAMES),
    oldestLateMs: now.getTime() - overdue[0].plannedAt.getTime(),
  };
}
