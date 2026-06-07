function startOfToday(): Date {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function previewOccurrences(
  intervalDays: number,
  timesOfDay: string[],
  count: number,
): Date[] {
  if (timesOfDay.length === 0 || count <= 0) return [];

  const step = Math.max(1, intervalDays);
  const times = [...timesOfDay].sort();
  const now = new Date();
  const result: Date[] = [];
  let day = startOfToday();

  while (result.length < count) {
    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number);
      const occurrence = new Date(day);
      occurrence.setHours(hours, minutes, 0, 0);
      if (occurrence >= now) {
        result.push(occurrence);
        if (result.length >= count) break;
      }
    }
    day = addDays(day, step);
  }

  return result;
}
