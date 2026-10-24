import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { takePendingUndo } from '@/commons/ui/pending-undo-store';
import { translate } from '@/commons/ui/testing/test-i18n';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';

jest.mock('expo-router', () =>
  jest.requireActual('../testing/focus-effect-mock'),
);

const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

function change(overrides: { apply?: () => Promise<void> } = {}) {
  return {
    message: 'Dose taken',
    apply: jest.fn().mockResolvedValue(undefined),
    revert: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

beforeEach(() => {
  alertSpy.mockClear();
  takePendingUndo();
});

describe('useUndoSnackbar', () => {
  it('shows the snackbar after the change is applied', async () => {
    // given
    const { result } = renderHook(() => useUndoSnackbar());
    const onSuccess = jest.fn();

    // when
    await act(() =>
      result.current.runWithUndo(change(), 'home.errorChangeDose', onSuccess),
    );

    // then
    expect(result.current.snackbar).toMatchObject({
      message: 'Dose taken',
      actionLabel: translate('home.undo'),
    });
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('reverts the change and hides the snackbar on the action', async () => {
    // given
    const undoable = change();
    const { result } = renderHook(() => useUndoSnackbar());
    await act(() =>
      result.current.runWithUndo(undoable, 'home.errorChangeDose'),
    );

    // when
    await act(async () => result.current.snackbar?.onAction());

    // then
    expect(undoable.revert).toHaveBeenCalledTimes(1);
    expect(result.current.snackbar).toBeNull();
  });

  it('hides the snackbar without reverting on dismiss', async () => {
    // given
    const undoable = change();
    const { result } = renderHook(() => useUndoSnackbar());
    await act(() =>
      result.current.runWithUndo(undoable, 'home.errorChangeDose'),
    );

    // when
    act(() => result.current.snackbar?.onDismiss());

    // then
    expect(undoable.revert).not.toHaveBeenCalled();
    expect(result.current.snackbar).toBeNull();
  });

  it('gives every shown snackbar a new key, so its timer restarts', async () => {
    // given
    const { result } = renderHook(() => useUndoSnackbar());
    await act(() =>
      result.current.runWithUndo(change(), 'home.errorChangeDose'),
    );
    const firstKey = result.current.snackbar?.key;

    // when
    await act(() =>
      result.current.runWithUndo(change(), 'home.errorChangeDose'),
    );

    // then
    expect(result.current.snackbar?.key).not.toBe(firstKey);
  });

  it('alerts and shows nothing when the change fails', async () => {
    // given
    const failing = change({
      apply: jest.fn().mockRejectedValue(new Error('db locked')),
    });
    const { result } = renderHook(() => useUndoSnackbar());
    const onSuccess = jest.fn();

    // when
    await act(() =>
      result.current.runWithUndo(failing, 'home.errorChangeDose', onSuccess),
    );

    // then
    expect(result.current.snackbar).toBeNull();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(alertSpy).toHaveBeenCalledWith(
      translate('common.errorTitle'),
      translate('home.errorChangeDose'),
    );
  });

  it('alerts when the revert fails', async () => {
    // given
    const undoable = change();
    undoable.revert.mockRejectedValue(new Error('db locked'));
    const { result } = renderHook(() => useUndoSnackbar());
    await act(() =>
      result.current.runWithUndo(undoable, 'home.errorChangeDose'),
    );

    // when
    await act(async () => result.current.snackbar?.onAction());

    // then
    expect(alertSpy).toHaveBeenCalledTimes(1);
  });

  it('hands the undo to the screen focused next, not to the current one', async () => {
    // given
    const leaving = renderHook(() => useUndoSnackbar());
    const onSuccess = jest.fn();

    // when
    await act(() =>
      leaving.result.current.runWithUndoOnNextScreen(
        change(),
        'home.errorChangeDose',
        onSuccess,
      ),
    );
    const next = renderHook(() => useUndoSnackbar());

    // then
    expect(leaving.result.current.snackbar).toBeNull();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(next.result.current.snackbar?.message).toBe('Dose taken');
  });

  it('reverts a handed-over undo from the screen focused next', async () => {
    // given
    const undoable = change();
    const leaving = renderHook(() => useUndoSnackbar());
    await act(() =>
      leaving.result.current.runWithUndoOnNextScreen(
        undoable,
        'home.errorChangeDose',
        jest.fn(),
      ),
    );
    const next = renderHook(() => useUndoSnackbar());

    // when
    await act(async () => next.result.current.snackbar?.onAction());

    // then
    expect(undoable.revert).toHaveBeenCalledTimes(1);
  });

  it('shows a handed-over undo only once', async () => {
    // given
    const leaving = renderHook(() => useUndoSnackbar());
    await act(() =>
      leaving.result.current.runWithUndoOnNextScreen(
        change(),
        'home.errorChangeDose',
        jest.fn(),
      ),
    );
    renderHook(() => useUndoSnackbar());

    // when
    const later = renderHook(() => useUndoSnackbar());

    // then
    expect(later.result.current.snackbar).toBeNull();
  });
});
