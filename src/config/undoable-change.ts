export interface UndoableChange {
  message: string;
  apply: () => Promise<void> | void;
  revert: () => Promise<void> | void;
}

export function creationChange(
  message: string,
  create: () => Promise<string>,
  remove: (id: string) => Promise<void>,
): UndoableChange {
  let createdId: string | null = null;
  return {
    message,
    apply: async () => {
      createdId = await create();
    },
    revert: async () => {
      if (createdId) await remove(createdId);
    },
  };
}

export function deletionChange<T>(
  message: string,
  remove: () => Promise<T | undefined> | T | undefined,
  restore: (removed: T) => Promise<void> | void,
): UndoableChange {
  let removed: T | undefined;
  return {
    message,
    apply: async () => {
      removed = await remove();
    },
    revert: async () => {
      if (removed !== undefined) await restore(removed);
    },
  };
}
