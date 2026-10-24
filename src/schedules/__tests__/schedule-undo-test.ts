import type { Schedule } from '../schedule-repository';
import { scheduleEditChange } from '../schedule-undo';

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
  steps: null,
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
