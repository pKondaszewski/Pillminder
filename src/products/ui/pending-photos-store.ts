let pendingUris: string[] = [];
const listeners = new Set<() => void>();

export function getPendingUris(): string[] {
  return pendingUris;
}

export function setPendingUris(next: string[]) {
  pendingUris = next;
  listeners.forEach((listener) => listener());
}

export function clearPendingUris() {
  setPendingUris([]);
}

export function subscribeToPendingUris(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
