import type { Schedule } from '../schedule-repository';
import { scheduleEditChange } from '../schedule-undo';

const schedule: Schedule = {
  id: 's1',
  productId: 'p1',
  intervalDays: 1,
  weekdays: null,
  cycle: null,
  rhythmAnchor: null,
  rhythmPausedDays: 0,
  timesOfDay: ['08:00'],
  quantity: 1,
  steps: null,
  startDate: null,
  endDate: null,
  pausedAt: new Date(2026, 9, 18),
  resumeAt: new Date(2026, 9, 25),
};

describe('scheduleEditChange', () => {
  it('saves the change through save and reverts by restoring the snapshot', async () => {
    // given
    const save = jest.fn().mockResolvedValue(undefined);
    const restore = jest.fn().mockResolvedValue(undefined);
    const change = scheduleEditChange(schedule, { intervalDays: 2 }, 'Saved', {
      save,
      restore,
    });

    // when
    await change.apply();
    await change.revert();

    // then
    expect(save).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ intervalDays: 2, timesOfDay: ['08:00'] }),
    );
    expect(restore).toHaveBeenCalledWith(schedule);
  });
});
