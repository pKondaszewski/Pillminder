export type ReorderAlertAction =
  | { kind: 'cancel' }
  | { kind: 'reschedule'; at: Date }
  | { kind: 'keep' };

export function reorderAlertAction(
  reorderAt: Date | null,
  now: Date,
): ReorderAlertAction {
  if (reorderAt === null) return { kind: 'cancel' };
  return reorderAt.getTime() > now.getTime()
    ? { kind: 'reschedule', at: reorderAt }
    : { kind: 'keep' };
}
