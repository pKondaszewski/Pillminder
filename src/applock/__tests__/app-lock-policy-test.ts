import {
  LOCK_AFTER_BACKGROUND_MS,
  shouldLockOnResume,
} from '../app-lock-policy';

describe('shouldLockOnResume', () => {
  const backgroundedAt = 1_000_000;

  it('does not lock when the app was never in the background', () => {
    // when
    const result = shouldLockOnResume(null, backgroundedAt);

    // then
    expect(result).toBe(false);
  });

  it('does not lock after a short break', () => {
    // when
    const result = shouldLockOnResume(
      backgroundedAt,
      backgroundedAt + LOCK_AFTER_BACKGROUND_MS - 1,
    );

    // then
    expect(result).toBe(false);
  });

  it('does not lock after exactly the limit', () => {
    // when
    const result = shouldLockOnResume(
      backgroundedAt,
      backgroundedAt + LOCK_AFTER_BACKGROUND_MS,
    );

    // then
    expect(result).toBe(false);
  });

  it('locks after longer than the limit', () => {
    // when
    const result = shouldLockOnResume(
      backgroundedAt,
      backgroundedAt + LOCK_AFTER_BACKGROUND_MS + 1,
    );

    // then
    expect(result).toBe(true);
  });
});
