import { act, renderHook } from '@testing-library/react-native';
import { Alert, AppState, type AppStateStatus } from 'react-native';

import { translate } from '@/commons/ui/testing/test-i18n';
import { openGoogleBackupSettings } from '@/google-backup/google-backup-service';
import { useGoogleBackupSettings } from '@/google-backup/ui/use-google-backup-settings';
import { setGoogleBackupConfirmed } from '@/settings/settings-service';

jest.mock('@/google-backup/google-backup-service', () => ({
  openGoogleBackupSettings: jest.fn(),
}));
jest.mock('@/settings/settings-service', () => ({
  setGoogleBackupConfirmed: jest.fn(),
}));

jest.mock('@/config/logger', () => ({
  createLogger: () => ({
    error: (...args: unknown[]) => mockLogError(...args),
  }),
}));

const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
const mockLogError = jest.fn();
const removeListener = jest.fn();
let appStateListeners: ((state: AppStateStatus) => void)[] = [];

function changeAppState(state: AppStateStatus) {
  act(() => appStateListeners.forEach((listener) => listener(state)));
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(openGoogleBackupSettings).mockResolvedValue(undefined);
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_, listener) => {
    appStateListeners.push(listener);
    return { remove: removeListener };
  });
});

describe('useGoogleBackupSettings', () => {
  it('does not ask when the app becomes active without the button being used', () => {
    // given
    const { result } = renderHook(() => useGoogleBackupSettings());

    // when
    changeAppState('background');
    changeAppState('active');

    // then
    expect(result.current.question.pending).toBeNull();
  });

  it('asks after the user returns from the screen the button opened', async () => {
    // given
    const { result } = renderHook(() => useGoogleBackupSettings());
    await act(() => result.current.openSettings(false));

    // when
    changeAppState('background');
    changeAppState('active');

    // then
    expect(openGoogleBackupSettings).toHaveBeenCalledTimes(1);
    expect(result.current.question.pending).toEqual({ value: false });
  });

  it('does not ask while the app is still in the foreground after opening', async () => {
    // given
    const { result } = renderHook(() => useGoogleBackupSettings());

    // when
    await act(() => result.current.openSettings(true));
    changeAppState('active');

    // then
    expect(result.current.question.pending).toBeNull();
  });

  it('asks only once per visit', async () => {
    // given
    const { result } = renderHook(() => useGoogleBackupSettings());
    await act(() => result.current.openSettings(true));
    changeAppState('background');
    changeAppState('active');
    act(() => result.current.question.cancel());

    // when
    changeAppState('background');
    changeAppState('active');

    // then
    expect(result.current.question.pending).toBeNull();
  });

  it('stores the value of the button that was used when the user confirms', async () => {
    // given
    const { result } = renderHook(() => useGoogleBackupSettings());
    await act(() => result.current.openSettings(false));
    changeAppState('background');
    changeAppState('active');

    // when
    act(() => result.current.question.confirm());

    // then
    expect(setGoogleBackupConfirmed).toHaveBeenCalledWith(false);
    expect(result.current.question.pending).toBeNull();
  });

  it('alerts and does not ask later when the screen cannot be opened', async () => {
    // given
    jest
      .mocked(openGoogleBackupSettings)
      .mockRejectedValue(new Error('no activity'));
    const { result } = renderHook(() => useGoogleBackupSettings());

    // when
    await act(() => result.current.openSettings(true));
    changeAppState('background');
    changeAppState('active');

    // then
    expect(alertSpy).toHaveBeenCalledWith(
      translate('settings.googleBackupFailed'),
      'no activity',
    );
    expect(mockLogError).toHaveBeenCalledTimes(1);
    expect(result.current.question.pending).toBeNull();
  });

  it('stops listening to the app state on unmount', () => {
    // given
    const { unmount } = renderHook(() => useGoogleBackupSettings());

    // when
    unmount();

    // then
    expect(removeListener).toHaveBeenCalledTimes(1);
  });
});
