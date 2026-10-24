export interface PendingUndo {
  message: string;
  undo: () => Promise<void> | void;
}

let pendingUndo: PendingUndo | null = null;

export function setPendingUndo(next: PendingUndo) {
  pendingUndo = next;
}

export function takePendingUndo(): PendingUndo | null {
  const taken = pendingUndo;
  pendingUndo = null;
  return taken;
}
