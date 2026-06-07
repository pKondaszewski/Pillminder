import type { Dose } from './dose-repository';

export function isPresent<T>(value: T): value is NonNullable<T> {
  return value != null;
}

export function isDueInFuture(dose: Dose): boolean {
  return dose.plannedAt.getTime() > Date.now();
}

export function isPending(dose: Dose): boolean {
  return dose.state === 'pending';
}
