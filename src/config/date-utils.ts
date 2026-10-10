export function startOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function msUntilNextDay(now: Date): number {
  return addDays(startOfDay(now), 1).getTime() - now.getTime();
}

export interface DateRange {
  from: Date;
  to: Date;
}

// `lastDay` is a calendar day the user sees as inclusive; the returned `to` is
// the start of the following day, matching the half-open ranges of getAdherence.
export function inclusiveDayRange(firstDay: Date, lastDay: Date): DateRange {
  return {
    from: startOfDay(firstDay),
    to: addDays(startOfDay(lastDay), 1),
  };
}
