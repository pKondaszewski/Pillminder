import { addDays, startOfDay } from '@/config/date-utils';

export const COURSE_PRESET_DAYS = [5, 7, 10] as const;

export function courseEndDate(
  startDate: Date | null,
  days: number,
  now: Date,
): Date {
  return addDays(startOfDay(startDate ?? now), days - 1);
}

export function isPeriodInvalid(
  startDate: Date | null,
  endDate: Date | null,
): boolean {
  return startDate !== null && endDate !== null && endDate < startDate;
}
