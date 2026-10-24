import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { syncAllSchedules } from '@/doses/dose-service';
import { useDoseSync } from '@/doses/ui/use-dose-sync';

jest.mock('@/doses/dose-service', () => ({
  syncAllSchedules: jest.fn(),
}));

jest.mock('@/config/logger', () => ({
  createLogger: () => ({
    error: (...args: unknown[]) => mockLogError(...args),
  }),
}));

const mockLogError = jest.fn();
const removeListener = jest.fn();
let appStateListeners: ((state: AppStateStatus) => void)[] = [];

function changeAppState(state: AppStateStatus) {
  act(() => appStateListeners.forEach((listener) => listener(state)));
}

async function renderDoseSync() {
  const hook = renderHook(() => useDoseSync());
  await act(async () => {});
  return hook;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(syncAllSchedules).mockResolvedValue(undefined as never);
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    appStateListeners.push(listener);
    return { remove: removeListener };
  });
});

describe('useDoseSync', () => {
  it('syncs the schedules once on the first start', async () => {
    // when
    await renderDoseSync();

    // then
    expect(syncAllSchedules).toHaveBeenCalledTimes(1);
  });

  it('syncs the schedules again when the app becomes active', async () => {
    // given
    await renderDoseSync();

    // when
    changeAppState('active');

    // then
    expect(syncAllSchedules).toHaveBeenCalledTimes(2);
  });

  it('does not start a second sync when the app reports active while the first one runs', async () => {
    // given
    let finishFirstSync: () => void = () => {};
    jest.mocked(syncAllSchedules).mockReturnValueOnce(
      new Promise<void>((resolve) => {
        finishFirstSync = resolve;
      }),
    );
    renderHook(() => useDoseSync());

    // when
    changeAppState('active');

    // then
    expect(syncAllSchedules).toHaveBeenCalledTimes(1);
    await act(async () => finishFirstSync());
  });

  it('ignores the app going to the background', async () => {
    // given
    await renderDoseSync();

    // when
    changeAppState('background');

    // then
    expect(syncAllSchedules).toHaveBeenCalledTimes(1);
  });

  it('logs the error when the first sync fails', async () => {
    // given
    jest.mocked(syncAllSchedules).mockRejectedValueOnce(new Error('db locked'));

    // when
    await renderDoseSync();

    // then
    expect(mockLogError).toHaveBeenCalledTimes(1);
  });

  it('keeps syncing on activation after a failed sync', async () => {
    // given
    jest.mocked(syncAllSchedules).mockRejectedValue(new Error('db locked'));
    await renderDoseSync();

    // when
    changeAppState('active');
    await act(async () => {});

    // then
    expect(syncAllSchedules).toHaveBeenCalledTimes(2);
    expect(mockLogError).toHaveBeenCalledTimes(2);
  });

  it('stops listening to the app state on unmount', async () => {
    // given
    const { unmount } = await renderDoseSync();

    // when
    unmount();

    // then
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
