import { isAppLockEnabled } from '@/settings/settings-service';

type Listener = () => void;

const listeners = new Set<Listener>();

// Settings are read synchronously, so the very first render already knows whether the app starts locked
let locked = isAppLockEnabled();

export function isAppLocked(): boolean {
  return locked;
}

export function setAppLocked(value: boolean): void {
  if (locked === value) return;
  locked = value;
  listeners.forEach((listener) => listener());
}

export function subscribeToAppLock(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
