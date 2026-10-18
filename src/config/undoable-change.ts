export interface UndoableChange {
  message: string;
  apply: () => Promise<void> | void;
  revert: () => Promise<void> | void;
}
