import {
  isAppLocked,
  setAppLocked,
  subscribeToAppLock,
} from '../app-lock-state';

jest.mock('@/settings/settings-service', () => ({
  isAppLockEnabled: () => true,
}));

describe('app lock state', () => {
  it('starts locked when the lock is enabled in settings', () => {
    // when
    const result = isAppLocked();

    // then
    expect(result).toBe(true);
  });

  it('notifies subscribers only when the state changes', () => {
    // given
    const listener = jest.fn();
    const unsubscribe = subscribeToAppLock(listener);

    // when
    setAppLocked(false);
    setAppLocked(false);
    unsubscribe();
    setAppLocked(true);

    // then
    expect(listener).toHaveBeenCalledTimes(1);
    expect(isAppLocked()).toBe(true);
  });
});
