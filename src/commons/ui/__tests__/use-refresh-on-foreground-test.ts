import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { useRefreshOnForeground } from '@/commons/ui/use-refresh-on-foreground';

const removeListener = jest.fn();
let appStateListeners: ((state: AppStateStatus) => void)[] = [];

function changeAppState(state: AppStateStatus) {
  act(() => appStateListeners.forEach((listener) => listener(state)));
}

beforeEach(() => {
  jest.clearAllMocks();
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    appStateListeners.push(listener);
    return { remove: removeListener };
  });
});

describe('useRefreshOnForeground', () => {
  it('refreshes once on mount', () => {
    // given
    const refresh = jest.fn();

    // when
    renderHook(() => useRefreshOnForeground(refresh));

    // then
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('refreshes when the app becomes active', () => {
    // given
    const refresh = jest.fn();
    renderHook(() => useRefreshOnForeground(refresh));

    // when
    changeAppState('active');

    // then
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('does not refresh when the app goes to the background', () => {
    // given
    const refresh = jest.fn();
    renderHook(() => useRefreshOnForeground(refresh));

    // when
    changeAppState('background');

    // then
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it('stops listening on unmount', () => {
    // given
    const refresh = jest.fn();
    const { unmount } = renderHook(() => useRefreshOnForeground(refresh));

    // when
    unmount();

    // then
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
