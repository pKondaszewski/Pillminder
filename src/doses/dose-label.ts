import type { Translate } from '@/config/translate';
import type { ProductUnit } from '@/products/product-service';
import { formatAmount } from '@/products/product-unit';

import { correctionStockDelta } from './dose-correction';
import type { MonthSummary } from './dose-month';
import type { CorrectionTarget } from './dto/correction-target';
import type { DayCounts } from './dto/today-card-state';
import type { TodayDose } from './dto/today-dose-output';

const MS_PER_MINUTE = 60 * 1000;
const MINUTES_PER_HOUR = 60;
const SEPARATOR = ' · ';

export function doseQuantityText(
  quantity: number,
  unit: ProductUnit | null,
  t: Translate,
): string | null {
  if (unit) return formatAmount(quantity, unit, t);
  return quantity !== 1 ? t('home.quantity', { count: quantity }) : null;
}

export function doseDetailsText(dose: TodayDose, t: Translate): string | null {
  const details = [
    doseQuantityText(dose.quantity, dose.unit, t),
    dose.fasting && t('notification.fastingSuffix'),
  ].filter(Boolean);
  return details.length > 0 ? details.join(SEPARATOR) : null;
}

export function stockEffectText(
  dose: TodayDose,
  target: CorrectionTarget,
  t: Translate,
): string | null {
  if (!dose.stockTracked) return null;
  const delta = correctionStockDelta(dose, target);
  if (delta === 0) return t('home.correction.stockSame');
  const size = Math.abs(delta);
  const amount = doseQuantityText(size, dose.unit, t) ?? String(size);
  return t(
    delta < 0 ? 'home.correction.stockLess' : 'home.correction.stockMore',
    { amount },
  );
}

export function reminderBody(
  name: string,
  quantity: number,
  unit: ProductUnit | null,
  fasting: boolean,
  t: Translate,
): string {
  const body = quantityBody(name, quantity, unit, t);
  return fasting
    ? `${body}${SEPARATOR}${t('notification.fastingSuffix')}`
    : body;
}

export function durationText(durationMs: number, t: Translate): string {
  const totalMinutes = Math.max(1, Math.round(durationMs / MS_PER_MINUTE));
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  if (hours === 0) return t('home.duration.minutes', { minutes });
  if (minutes === 0) return t('home.duration.hours', { hours });
  return t('home.duration.hoursMinutes', { hours, minutes });
}

export function dayCountsText(counts: DayCounts, t: Translate): string {
  return [
    t('home.counts.takenOf', { count: counts.taken, total: counts.total }),
    counts.skipped > 0 && t('home.counts.skipped', { count: counts.skipped }),
    counts.overdue > 0 && t('home.counts.overdue', { count: counts.overdue }),
    counts.planned > 0 && t('home.counts.later', { count: counts.planned }),
  ]
    .filter(Boolean)
    .join(SEPARATOR);
}

export function handledCountsText(
  taken: number,
  skipped: number,
  t: Translate,
): string {
  return [
    taken > 0 && t('home.counts.taken', { count: taken }),
    skipped > 0 && t('home.counts.skipped', { count: skipped }),
  ]
    .filter(Boolean)
    .join(SEPARATOR);
}

export function monthSummaryText(
  summary: MonthSummary,
  monthName: string,
  t: Translate,
): string {
  if (summary.due === 0)
    return t('calendar.summary.empty', { month: monthName });
  return [
    t('calendar.summary.taken', {
      month: monthName,
      taken: summary.taken,
      count: summary.due,
    }),
    summary.skipped > 0 && t('home.counts.skipped', { count: summary.skipped }),
    summary.missed > 0 &&
      t('calendar.summary.unticked', { count: summary.missed }),
    summary.throughToday && t('calendar.summary.untilToday'),
  ]
    .filter(Boolean)
    .join(SEPARATOR);
}

function quantityBody(
  name: string,
  quantity: number,
  unit: ProductUnit | null,
  t: Translate,
): string {
  if (unit) {
    return t('notification.bodyAmount', {
      name,
      amount: formatAmount(quantity, unit, t),
    });
  }
  return quantity > 1
    ? t('notification.bodyQuantity', { name, quantity })
    : t('notification.body', { name });
}
