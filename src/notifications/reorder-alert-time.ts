const REORDER_ALERT_HOUR = 9;

export function reorderAlertTime(reorderAt: Date | null): Date | null {
  if (reorderAt === null) return null;
  const alertTime = new Date(reorderAt);
  alertTime.setHours(REORDER_ALERT_HOUR, 0, 0, 0);
  return alertTime;
}
