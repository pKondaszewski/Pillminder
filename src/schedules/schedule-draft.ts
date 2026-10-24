import { cycleStateOf } from './cycle-state';
import type { NewScheduleInput } from './dto/new-schedule-input';
import { isPeriodInvalid } from './schedule-period';
import type { Schedule } from './schedule-repository';

type DraftField = 'product' | 'times' | 'period';

type Draft = {
  productId: string;
  timesOfDay: string[];
  startDate?: Date | null;
  endDate?: Date | null;
};

export function scheduleDraftErrors({
  productId,
  timesOfDay,
  startDate,
  endDate,
}: Draft): Partial<Record<DraftField, string>> {
  return {
    ...(productId === '' && { product: 'schedule.productRequired' }),
    ...(timesOfDay.length === 0 && { times: 'schedule.timesRequired' }),
    ...(isPeriodInvalid(startDate ?? null, endDate ?? null) && {
      period: 'schedule.periodInvalid',
    }),
  };
}

export function draftSchedule(input: NewScheduleInput, now: Date): Schedule {
  return {
    id: '',
    productId: input.productId,
    intervalDays: input.intervalDays,
    weekdays: input.weekdays ?? null,
    cycle: input.cycle ?? null,
    ...cycleStateOf(input, undefined, now),
    timesOfDay: input.timesOfDay,
    quantity: input.quantity ?? 1,
    steps: input.steps ?? null,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
    pausedAt: null,
    resumeAt: null,
  };
}

export function toScheduleInput(schedule: Schedule): NewScheduleInput {
  return {
    productId: schedule.productId,
    intervalDays: schedule.intervalDays,
    weekdays: schedule.weekdays,
    cycle: schedule.cycle,
    timesOfDay: schedule.timesOfDay,
    quantity: schedule.quantity,
    steps: schedule.steps,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
  };
}
