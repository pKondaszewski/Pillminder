import { doses, products } from '@/config/db/schema';
import {
  clearTestDatabase,
  db,
  insertDose,
  insertProduct,
  insertSchedule,
} from '@/config/db/test-database';
import {
  cancelDoseReminder,
  cancelDoseReminders,
  scheduleDoseReminders,
} from '@/notifications/notification-service';

import {
  revertDose,
  skipDose,
  syncDosesForProductOfDose,
  syncDosesForSchedules,
  takeDose,
} from '../dose-service';

jest.mock('@/config/db/database', () =>
  jest.requireActual('@/config/db/test-database'),
);
jest.mock(
  'expo-crypto',
  () => jest.requireActual('@/config/db/test-database').testCrypto,
);
jest.mock('@/notifications/notification-service', () => ({
  cancelDoseReminder: jest.fn().mockResolvedValue(undefined),
  cancelDoseReminders: jest.fn().mockResolvedValue(undefined),
  dismissDoseReminder: jest.fn().mockResolvedValue(undefined),
  scheduleDoseReminder: jest.fn().mockResolvedValue(undefined),
  scheduleDoseReminders: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/config/logger', () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));
jest.mock('@/settings/settings-service', () => ({
  getSnoozeMinutes: () => 10,
}));

const NOW = new Date('2026-03-10T10:00:00Z');
const YESTERDAY = new Date('2026-03-09T19:00:00Z');
const TODAY_EVENING = new Date('2026-03-10T19:00:00Z');
const TOMORROW_EVENING = new Date('2026-03-11T19:00:00Z');

function plannedTimes() {
  return db
    .select({ plannedAt: doses.plannedAt })
    .from(doses)
    .orderBy(doses.plannedAt)
    .all()
    .map((dose) => dose.plannedAt.toISOString());
}

describe('dose service on a real database', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    jest.clearAllMocks();
    clearTestDatabase();
  });
  afterEach(() => jest.useRealTimers());

  describe('syncDosesForSchedules', () => {
    it('plans the doses for the 30-day window and schedules a reminder for each new dose', async () => {
      // given
      const product = insertProduct({ id: 'p1' });
      const schedule = insertSchedule({
        id: 's1',
        productId: product.id,
        timesOfDay: ['20:00'],
      });

      // when
      await syncDosesForSchedules([schedule]);

      // then
      const times = plannedTimes();
      expect(times).toHaveLength(30);
      expect(times[0]).toBe(TODAY_EVENING.toISOString());
      expect(times[1]).toBe(TOMORROW_EVENING.toISOString());
      const inputs = jest.mocked(scheduleDoseReminders).mock.calls[0][0];
      expect(inputs).toHaveLength(30);
      expect(inputs[0]).toEqual({
        reminder: { id: expect.any(String), plannedAt: TODAY_EVENING },
        texts: expect.anything(),
      });
    });

    it('is idempotent: a second sync keeps the doses and adds none', async () => {
      // given
      const schedule = insertSchedule({
        id: 's1',
        productId: insertProduct({ id: 'p1' }).id,
        timesOfDay: ['20:00'],
      });
      await syncDosesForSchedules([schedule]);
      const idsBefore = db
        .select({ id: doses.id })
        .from(doses)
        .all()
        .map((dose) => dose.id)
        .sort();

      // when
      await syncDosesForSchedules([schedule]);

      // then
      const idsAfter = db
        .select({ id: doses.id })
        .from(doses)
        .all()
        .map((dose) => dose.id)
        .sort();
      expect(idsAfter).toEqual(idsBefore);
    });

    it('replaces the pending doses when the times of the schedule change and cancels the old reminders', async () => {
      // given
      const product = insertProduct({ id: 'p1' });
      const schedule = insertSchedule({
        id: 's1',
        productId: product.id,
        timesOfDay: ['20:00'],
      });
      await syncDosesForSchedules([schedule]);
      const oldIds = db
        .select({ id: doses.id })
        .from(doses)
        .all()
        .map((dose) => dose.id);
      jest.clearAllMocks();

      // when
      await syncDosesForSchedules([{ ...schedule, timesOfDay: ['21:00'] }]);

      // then
      expect(plannedTimes()[0]).toBe('2026-03-10T20:00:00.000Z');
      expect(plannedTimes()).toHaveLength(30);
      expect(cancelDoseReminders).toHaveBeenCalledWith(
        expect.arrayContaining(oldIds),
      );
    });

    it('keeps a dose that was already taken and does not plan a second one for its slot', async () => {
      // given
      const product = insertProduct({ id: 'p1' });
      const schedule = insertSchedule({
        id: 's1',
        productId: product.id,
        timesOfDay: ['20:00'],
      });
      insertDose({
        id: 'taken',
        productId: 'p1',
        scheduleId: 's1',
        plannedAt: TODAY_EVENING,
        state: 'taken',
        takenAt: NOW,
      });

      // when
      await syncDosesForSchedules([schedule]);

      // then
      expect(plannedTimes()).toHaveLength(30);
      expect(
        db
          .select()
          .from(doses)
          .all()
          .filter((d) => d.state === 'taken'),
      ).toHaveLength(1);
    });

    it('plans nothing for an archived product and removes its pending doses', async () => {
      // given
      const product = insertProduct({ id: 'p1', status: 'archived' });
      const schedule = insertSchedule({
        id: 's1',
        productId: product.id,
        timesOfDay: ['20:00'],
      });
      insertDose({
        id: 'stale',
        productId: 'p1',
        scheduleId: 's1',
        plannedAt: TOMORROW_EVENING,
      });

      // when
      await syncDosesForSchedules([schedule]);

      // then
      expect(db.select().from(doses).all()).toEqual([]);
      expect(scheduleDoseReminders).toHaveBeenCalledWith([]);
    });

    it('plans the reminders of all products together, not only of the synced schedule', async () => {
      // given
      insertProduct({ id: 'p1' });
      insertProduct({ id: 'p2' });
      insertSchedule({ id: 's1', productId: 'p1', timesOfDay: ['20:00'] });
      const second = insertSchedule({
        id: 's2',
        productId: 'p2',
        timesOfDay: ['21:00'],
      });
      insertDose({
        id: 'other',
        productId: 'p1',
        scheduleId: 's1',
        plannedAt: TOMORROW_EVENING,
      });

      // when
      await syncDosesForSchedules([second]);

      // then
      const ids = jest
        .mocked(scheduleDoseReminders)
        .mock.calls[0][0].map(({ reminder }) => reminder.id);
      expect(ids).toContain('other');
      expect(ids).toHaveLength(31);
    });

    it('plans nothing after the end date of the course', async () => {
      // given
      const product = insertProduct({ id: 'p1' });
      const schedule = insertSchedule({
        id: 's1',
        productId: product.id,
        timesOfDay: ['20:00'],
        endDate: new Date('2026-03-10T12:00:00Z'),
      });

      // when
      await syncDosesForSchedules([schedule]);

      // then
      expect(plannedTimes()).toEqual([TODAY_EVENING.toISOString()]);
    });
  });

  describe('syncDosesForProductOfDose', () => {
    it('extends the plan of the dose product to the full window', async () => {
      // given
      insertProduct({ id: 'p1' });
      insertSchedule({ id: 's1', productId: 'p1', timesOfDay: ['20:00'] });
      insertDose({
        id: 'd1',
        productId: 'p1',
        scheduleId: 's1',
        plannedAt: TODAY_EVENING,
      });

      // when
      await syncDosesForProductOfDose('d1');

      // then
      expect(plannedTimes()).toHaveLength(30);
    });

    it('leaves the doses of other products alone', async () => {
      // given
      insertProduct({ id: 'p1' });
      insertProduct({ id: 'p2' });
      insertSchedule({ id: 's1', productId: 'p1', timesOfDay: ['20:00'] });
      insertSchedule({ id: 's2', productId: 'p2', timesOfDay: ['20:00'] });
      insertDose({
        id: 'd1',
        productId: 'p1',
        scheduleId: 's1',
        plannedAt: TODAY_EVENING,
      });

      // when
      await syncDosesForProductOfDose('d1');

      // then
      const otherProductDoses = db
        .select()
        .from(doses)
        .all()
        .filter((dose) => dose.productId === 'p2');
      expect(otherProductDoses).toEqual([]);
    });

    it('does nothing for an unknown dose', async () => {
      // given
      insertProduct({ id: 'p1' });
      insertSchedule({ id: 's1', productId: 'p1', timesOfDay: ['20:00'] });

      // when
      await syncDosesForProductOfDose('missing');

      // then
      expect(plannedTimes()).toEqual([]);
    });
  });

  describe('taking, skipping and reverting', () => {
    function seedPendingDose(plannedAt: Date) {
      insertProduct({ id: 'p1', stock: 10 });
      insertSchedule({ id: 's1', productId: 'p1' });
      insertDose({
        id: 'd1',
        productId: 'p1',
        scheduleId: 's1',
        plannedAt,
      });
    }

    it('takeDose marks the dose taken, lowers the stock and cancels its reminder', async () => {
      // given
      seedPendingDose(TODAY_EVENING);

      // when
      await takeDose('d1');

      // then
      expect(db.select().from(doses).get()?.state).toBe('taken');
      expect(db.select().from(products).get()?.stock).toBe(9);
      expect(cancelDoseReminder).toHaveBeenCalledWith('d1');
    });

    it('skipDose marks the dose skipped and leaves the stock alone', async () => {
      // given
      seedPendingDose(TODAY_EVENING);

      // when
      await skipDose('d1');

      // then
      expect(db.select().from(doses).get()?.state).toBe('skipped');
      expect(db.select().from(products).get()?.stock).toBe(10);
    });

    it('revertDose of a taken future dose restores the stock and schedules its reminder again', async () => {
      // given
      seedPendingDose(TODAY_EVENING);
      await takeDose('d1');
      jest.clearAllMocks();

      // when
      await revertDose('d1');

      // then
      expect(db.select().from(doses).get()?.state).toBe('pending');
      expect(db.select().from(products).get()?.stock).toBe(10);
      expect(scheduleDoseReminders).toHaveBeenCalledWith([
        {
          reminder: { id: 'd1', plannedAt: TODAY_EVENING },
          texts: expect.anything(),
        },
      ]);
    });

    it('revertDose of a past dose restores the stock without a new reminder', async () => {
      // given
      seedPendingDose(YESTERDAY);
      await takeDose('d1');

      // when
      await revertDose('d1');

      // then
      expect(db.select().from(products).get()?.stock).toBe(10);
      expect(scheduleDoseReminders).not.toHaveBeenCalled();
    });
  });
});
