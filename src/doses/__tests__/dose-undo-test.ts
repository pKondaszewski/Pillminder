import { bulkTakeChange, doseCorrectionChange } from '../dose-undo';
import type { DoseSnapshot } from '../dto/dose-snapshot';

const PLANNED = new Date('2026-03-10T06:00:00Z');

function pending(id: string): DoseSnapshot {
  return { id, state: 'pending', takenAt: null, takenQuantity: null };
}

describe('doseCorrectionChange', () => {
  it('corrects to the target and restores the previous state on revert', async () => {
    // given
    const dose: DoseSnapshot = {
      id: 'd1',
      state: 'taken',
      takenAt: PLANNED,
      takenQuantity: 2,
    };
    const correct = jest.fn().mockResolvedValue(undefined);
    const restore = jest.fn().mockResolvedValue(undefined);
    const change = doseCorrectionChange(
      dose,
      'skipped',
      'Skipped',
      correct,
      restore,
    );

    // when
    await change.apply();
    await change.revert();

    // then
    expect(correct).toHaveBeenCalledWith('d1', 'skipped');
    expect(restore).toHaveBeenCalledWith(dose);
  });
});

describe('bulkTakeChange', () => {
  it('takes every dose and restores every dose on revert', async () => {
    // given
    const doses = [pending('d1'), pending('d2')];
    const take = jest.fn().mockResolvedValue(undefined);
    const restore = jest.fn().mockResolvedValue(undefined);
    const change = bulkTakeChange(doses, 'Taken', take, restore);

    // when
    await change.apply();
    await change.revert();

    // then
    expect(take.mock.calls).toEqual([['d1'], ['d2']]);
    expect(restore.mock.calls).toEqual([[doses[0]], [doses[1]]]);
  });

  it('puts back the doses already taken and fails when one of them cannot be taken', async () => {
    // given
    const doses = [pending('d1'), pending('d2'), pending('d3')];
    const take = jest
      .fn()
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('db'));
    const restore = jest.fn().mockResolvedValue(undefined);
    const change = bulkTakeChange(doses, 'Taken', take, restore);

    // when
    const result = Promise.resolve(change.apply());

    // then
    await expect(result).rejects.toThrow('db');
    expect(take).toHaveBeenCalledTimes(2);
    expect(restore.mock.calls).toEqual([[doses[0]]]);
  });
});
