export interface ReminderResponseHandlers {
  onTake: (doseId: string) => void;
  onSnooze: (doseId: string) => void;
  onReorder: (productId: string) => void;
  onAddPack: (productId: string) => void;
}
