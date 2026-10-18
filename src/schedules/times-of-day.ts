export const QUICK_TIMES = ['08:00', '14:00', '20:00'];

export function addTimeOfDay(times: string[], time: string): string[] {
  return times.includes(time) ? times : [...times, time].sort();
}
