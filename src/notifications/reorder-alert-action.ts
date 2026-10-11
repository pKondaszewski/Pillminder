export type ReorderAlertAction =
  | { kind: 'cancel' }
  | { kind: 'reschedule'; at: Date }
  | { kind: 'notifyNow' }
  | { kind: 'keep' };

// alertedAt: when this low-stock episode's alert is (or was) delivered
export function reorderAlertAction(
  reorderAt: Date | null,
  alertedAt: Date | null,
  now: Date,
): ReorderAlertAction {
  if (reorderAt === null) return { kind: 'cancel' };
  if (reorderAt.getTime() > now.getTime()) {
    return { kind: 'reschedule', at: reorderAt };
  }
  const alreadyDelivered =
    alertedAt !== null && alertedAt.getTime() <= now.getTime();
  return alreadyDelivered ? { kind: 'keep' } : { kind: 'notifyNow' };
}
