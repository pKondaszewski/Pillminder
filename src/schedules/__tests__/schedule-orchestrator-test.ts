import { doses, schedules } from '@/config/db/schema';
import {
  clearTestDatabase,
  db,
  insertDose,
  insertProduct,
  insertSchedule,
} from '@/config/db/test-database';

import {
  addSchedule,
  editSchedule,
  pauseSchedule,
  removeSchedule,
  resumeSchedule,
} from '../schedule-orchestrator';

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
});
