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
