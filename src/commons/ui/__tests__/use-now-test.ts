import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { useNow } from '@/commons/ui/use-now';

const NOW = new Date(2026, 0, 10, 12, 0);
const MINUTE_MS = 60 * 1000;
const removeListener = jest.fn();
let appStateListeners: ((state: AppStateStatus) => void)[] = [];

beforeEach(() => {
  jest.useFakeTimers({ now: NOW });
  jest.clearAllMocks();
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    appStateListeners.push(listener);
    return { remove: removeListener };
  });
});
afterEach(() => jest.useRealTimers());

describe('useNow', () => {
  it('starts with the current time', () => {
    // when
    const { result } = renderHook(() => useNow());

    // then
    expect(result.current).toEqual(NOW);
  });

  it('refreshes every minute', () => {
    // given
    const { result } = renderHook(() => useNow());

    // when
    act(() => jest.advanceTimersByTime(MINUTE_MS));

    // then
    expect(result.current).toEqual(new Date(NOW.getTime() + MINUTE_MS));
  });

  it('refreshes when the app becomes active', () => {
    // given
    const { result } = renderHook(() => useNow());
    jest.setSystemTime(new Date(2026, 0, 11, 8, 0));

    // when
    act(() => appStateListeners.forEach((listener) => listener('active')));

    // then
    expect(result.current).toEqual(new Date(2026, 0, 11, 8, 0));
  });

  it('does not refresh when the app goes to the background', () => {
    // given
    const { result } = renderHook(() => useNow());
    jest.setSystemTime(new Date(2026, 0, 11, 8, 0));

    // when
    act(() => appStateListeners.forEach((listener) => listener('background')));

    // then
    expect(result.current).toEqual(NOW);
  });

  it('stops the timer and the listener on unmount', () => {
    // given
    const { unmount } = renderHook(() => useNow());

    // when
    unmount();

    // then
    expect(removeListener).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });
});
