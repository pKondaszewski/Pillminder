import { doses, schedules } from '@/config/db/schema';
import {
  clearTestDatabase,
  db,
  insertDose,
  insertProduct,
  insertSchedule,
} from '@/config/db/test-database';
import { cancelDoseReminders } from '@/notifications/notification-service';

import { toScheduleInput } from '../schedule-draft';
import {
  addSchedule,
  editSchedule,
  pauseSchedule,
  removeSchedule,
  restoreSchedule,
  resumeSchedule,
} from '../schedule-orchestrator';
import { getSchedule } from '../schedule-service';

jest.mock('@/config/db/database', () =>
  jest.requireActual('@/config/db/test-database'),
);
jest.mock(
  'expo-crypto',
  () => jest.requireActual('@/config/db/test-database').testCrypto,
);
jest.mock('@/config/logger', () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));
jest.mock('@/notifications/notification-service', () => ({
  cancelDoseReminder: jest.fn().mockResolvedValue(undefined),
  cancelDoseReminders: jest.fn().mockResolvedValue(undefined),
  dismissDoseReminder: jest.fn().mockResolvedValue(undefined),
  scheduleDoseReminder: jest.fn().mockResolvedValue(undefined),
  scheduleDoseReminders: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/settings/settings-service', () => ({
  getSnoozeMinutes: () => 10,
}));

const NOW = new Date('2026-03-10T10:00:00Z');
const TODAY_EVENING = new Date('2026-03-10T19:00:00Z');

function doseCount() {
  return db.select().from(doses).all().length;
}

describe('schedule orchestrator on a real database', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    jest.clearAllMocks();
    clearTestDatabase();
    insertProduct({ id: 'p1' });
  });
  afterEach(() => jest.useRealTimers());

  it('addSchedule stores the schedule and plans its doses', async () => {
    // when
    const id = await addSchedule({
      productId: 'p1',
      intervalDays: 1,
      timesOfDay: ['20:00'],
    });

    // then
    expect(db.select().from(schedules).get()?.id).toBe(id);
    expect(doseCount()).toBe(30);
  });

  it('editSchedule re-plans the pending doses for the new rhythm', async () => {
    // given
    const id = await addSchedule({
      productId: 'p1',
      intervalDays: 1,
      timesOfDay: ['20:00'],
    });

    // when
    await editSchedule(id, {
      productId: 'p1',
      intervalDays: 2,
      timesOfDay: ['20:00'],
    });

    // then
    expect(doseCount()).toBe(15);
  });

  it('restoreSchedule brings back the rhythm anchor and paused days that an edit dropped', async () => {
    // given
    const anchor = new Date(2026, 1, 24);
    const cycle = { onDays: 21, offDays: 7, unit: 'days' as const };
    const { id } = insertSchedule({
      id: 's1',
      productId: 'p1',
      cycle,
      rhythmAnchor: anchor,
      rhythmPausedDays: 3,
    });
    const snapshot = (await getSchedule(id))!;
    await editSchedule(id, { ...toScheduleInput(snapshot), cycle: null });

    // when
    await restoreSchedule(snapshot);

    // then
    const restored = await getSchedule(id);
    expect(restored?.cycle).toEqual(cycle);
    expect(restored?.rhythmAnchor).toEqual(anchor);
    expect(restored?.rhythmPausedDays).toBe(3);
  });

  it('pausing and resuming again keeps the paused days and the anchor', async () => {
    // given
    const id = await addSchedule({
      productId: 'p1',
      intervalDays: 1,
      timesOfDay: ['20:00'],
      cycle: { onDays: 21, offDays: 7, unit: 'days' },
    });
    await pauseSchedule(id, null);
    jest.setSystemTime(new Date('2026-03-15T10:00:00Z'));
    await resumeSchedule(id);
    const resumed = (await getSchedule(id))!;

    // when
    await pauseSchedule(id, null);
    await resumeSchedule(id);

    // then
    const again = await getSchedule(id);
    expect(resumed.rhythmPausedDays).toBe(5);
    expect(again?.rhythmPausedDays).toBe(5);
    expect(again?.rhythmAnchor).toEqual(resumed.rhythmAnchor);
  });

  it('pauseSchedule removes the pending doses and resumeSchedule plans them again', async () => {
    // given
    const id = await addSchedule({
      productId: 'p1',
      intervalDays: 1,
      timesOfDay: ['20:00'],
    });

    // when
    await pauseSchedule(id, null);
    const pausedCount = doseCount();
    await resumeSchedule(id);

    // then
    expect(pausedCount).toBe(0);
    expect(doseCount()).toBeGreaterThan(0);
    expect(db.select().from(schedules).get()).toMatchObject({
      pausedAt: null,
      resumeAt: null,
    });
  });

  it('removeSchedule keeps the taken, skipped and overdue doses and removes the future pending ones', async () => {
    // given
    const id = await addSchedule({
      productId: 'p1',
      intervalDays: 1,
      timesOfDay: ['20:00'],
    });
    insertDose({
      id: 'taken',
      productId: 'p1',
      scheduleId: id,
      plannedAt: new Date('2026-03-08T19:00:00Z'),
      state: 'taken',
      takenAt: NOW,
      takenQuantity: 2,
    });
    insertDose({
      id: 'skipped',
      productId: 'p1',
      scheduleId: id,
      plannedAt: new Date('2026-03-09T19:00:00Z'),
      state: 'skipped',
    });
    insertDose({
      id: 'overdue',
      productId: 'p1',
      scheduleId: id,
      plannedAt: new Date('2026-03-10T06:00:00Z'),
    });
    insertSchedule({ id: 'other', productId: 'p1' });
    insertDose({
      id: 'other-dose',
      productId: 'p1',
      scheduleId: 'other',
      plannedAt: TODAY_EVENING,
    });

    // when
    await removeSchedule(id);

    // then
    expect(
      db
        .select()
        .from(schedules)
        .all()
        .map((s) => s.id),
    ).toEqual(['other']);
    expect(
      db
        .select({ id: doses.id, scheduleId: doses.scheduleId })
        .from(doses)
        .orderBy(doses.plannedAt)
        .all(),
    ).toEqual([
      { id: 'taken', scheduleId: null },
      { id: 'skipped', scheduleId: null },
      { id: 'overdue', scheduleId: null },
      { id: 'other-dose', scheduleId: 'other' },
    ]);
  });

  it('removeSchedule cancels the reminders of its overdue pending doses', async () => {
    // given
    insertSchedule({ id: 's1', productId: 'p1' });
    insertDose({
      id: 'overdue',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: new Date('2026-03-09T19:00:00Z'),
    });
    insertDose({
      id: 'taken',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: new Date('2026-03-09T07:00:00Z'),
      state: 'taken',
      takenAt: NOW,
    });

    // when
    await removeSchedule('s1');

    // then
    expect(cancelDoseReminders).toHaveBeenCalledWith(['overdue']);
  });
});
