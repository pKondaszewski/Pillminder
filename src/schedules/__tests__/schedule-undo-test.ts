import type { NewScheduleInput } from '../dto/new-schedule-input';
import type { Schedule } from '../schedule-repository';
import { scheduleCreateChange, scheduleEditChange } from '../schedule-undo';

const schedule: Schedule = {
  id: 's1',
  productId: 'p1',
  intervalDays: 1,
  weekdays: null,
  cycle: null,
  cycleAnchor: null,
  cyclePausedDays: 0,
  timesOfDay: ['08:00'],
  quantity: 1,
  startDate: null,
  endDate: null,
  pausedAt: new Date(2026, 9, 18),
  resumeAt: new Date(2026, 9, 25),
};

describe('scheduleEditChange', () => {
  it('saves the change through the save function and reverts to the previous input', async () => {
    // given
    const save = jest.fn().mockResolvedValue(undefined);
    const change = scheduleEditChange(
      schedule,
      { intervalDays: 2 },
      'Saved',
      save,
    );

    // when
    await change.apply();
    await change.revert();

    // then
    expect(save.mock.calls[0]).toEqual([
      's1',
      expect.objectContaining({ intervalDays: 2, timesOfDay: ['08:00'] }),
    ]);
    expect(save.mock.calls[1]).toEqual([
      's1',
      expect.objectContaining({ intervalDays: 1 }),
    ]);
  });
});

describe('scheduleCreateChange', () => {
  const input: NewScheduleInput = {
    productId: 'p1',
    intervalDays: 1,
    weekdays: null,
    cycle: null,
    timesOfDay: ['08:00'],
    quantity: 1,
    startDate: null,
    endDate: null,
  };

  it('adds the schedule and removes the created one on revert', async () => {
    // given
    const add = jest.fn().mockResolvedValue('new-id');
    const remove = jest.fn().mockResolvedValue(undefined);
    const change = scheduleCreateChange(input, 'Created', add, remove);

    // when
    await change.apply();
    await change.revert();

    // then
    expect(add).toHaveBeenCalledWith(input);
    expect(remove).toHaveBeenCalledWith('new-id');
  });

  it('removes nothing when the schedule was never created', async () => {
    // given
    const add = jest.fn().mockRejectedValue(new Error('fail'));
    const remove = jest.fn();
    const change = scheduleCreateChange(input, 'Created', add, remove);

    // when
    await expect(change.apply()).rejects.toThrow('fail');
    await change.revert();

    // then
    expect(remove).not.toHaveBeenCalled();
  });
});
