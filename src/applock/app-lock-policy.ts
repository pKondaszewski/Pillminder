export const LOCK_AFTER_BACKGROUND_MS = 60_000;

export function shouldLockOnResume(
  backgroundedAt: number | null,
  now: number,
): boolean {
  return (
    backgroundedAt !== null && now - backgroundedAt > LOCK_AFTER_BACKGROUND_MS
  );
}
