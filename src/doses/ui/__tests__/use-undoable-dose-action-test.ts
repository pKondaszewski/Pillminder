import { act, renderHook } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { translate } from '@/commons/ui/testing/test-i18n';
import type { TodayDose } from '@/doses/dose-service';

import { useUndoableDoseAction } from '../use-undoable-dose-action';

jest.mock('expo-router', () =>
  jest.requireActual('@/commons/ui/testing/focus-effect-mock'),
);

const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});

function overdueDose(id: string): TodayDose {
  return {
    id,
    productName: 'Euthyrox',
    state: 'pending',
    takenAt: null,
    takenQuantity: null,
  } as TodayDose;
}

function setup() {
  const take = jest.fn().mockResolvedValue(undefined);
  const restore = jest.fn().mockResolvedValue(undefined);
  const correct = jest.fn().mockResolvedValue(undefined);
  const noop = jest.fn().mockResolvedValue(undefined);
  const hook = renderHook(() =>
    useUndoableDoseAction(
      {
        taken: { apply: take, revert: noop },
        skipped: { apply: noop, revert: noop },
      },
      { correct, restore },
    ),
  );
  return { hook, take, restore, correct };
}

beforeEach(() => alertSpy.mockClear());

describe('useUndoableDoseAction', () => {
  it('shows one undo for a bulk take and restores every dose on undo', async () => {
    // given
    const doses = [overdueDose('d1'), overdueDose('d2')];
    const { hook, take, restore } = setup();

    // when
    await act(() => hook.result.current.takeAll(doses));
    const message = hook.result.current.snackbar?.message;
    await act(async () => hook.result.current.snackbar?.onAction());

    // then
    expect(take.mock.calls).toEqual([['d1'], ['d2']]);
    expect(message).toBe(translate('home.bulkTakenToast', { count: 2 }));
    expect(restore.mock.calls).toEqual([[doses[0]], [doses[1]]]);
  });

  it('alerts and shows no undo when a bulk take fails', async () => {
    // given
    const { hook, take } = setup();
    take.mockRejectedValueOnce(new Error('db'));

    // when
    await act(() => hook.result.current.takeAll([overdueDose('d1')]));

    // then
    expect(hook.result.current.snackbar).toBeNull();
    expect(alertSpy).toHaveBeenCalledWith(
      translate('common.errorTitle'),
      translate('home.bulkTakeError'),
    );
  });

  it('shows an undo for a dose correction and restores the previous state on undo', async () => {
    // given
    const dose = overdueDose('d1');
    const { hook, correct, restore } = setup();

    // when
    await act(() => hook.result.current.correctWithUndo(dose, 'taken'));
    const message = hook.result.current.snackbar?.message;
    await act(async () => hook.result.current.snackbar?.onAction());

    // then
    expect(correct).toHaveBeenCalledWith('d1', 'taken');
    expect(message).toBe(translate('home.takenToast', { name: 'Euthyrox' }));
    expect(restore).toHaveBeenCalledWith(dose);
  });
});
