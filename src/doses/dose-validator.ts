import type { Dose } from './dose-repository';

export function isDueInFuture(dose: Dose, now: Date): boolean {
  return dose.plannedAt.getTime() > now.getTime();
}

export function isPending(dose: Dose): boolean {
  return dose.state === 'pending';
}
