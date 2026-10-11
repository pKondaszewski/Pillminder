export interface ReminderResponseHandlers {
  onTake: (doseId: string) => void;
  onSnooze: (doseId: string) => void;
  onReorder: (storeLink: string | null) => void;
  onAddPack: (productId: string) => void;
}
