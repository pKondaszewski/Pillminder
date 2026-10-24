import { eq } from 'drizzle-orm';

import { doses, products } from '@/config/db/schema';
import {
  clearTestDatabase,
  db,
  insertDose,
  insertIntake,
  insertProduct,
  insertSchedule,
} from '@/config/db/test-database';

import {
  deleteFuturePendingDoseRowsForSchedules,
  replacePendingDoseRows,
  setDoseStateRow,
} from '../dose-repository';

jest.mock('@/config/db/database', () =>
  jest.requireActual('@/config/db/test-database'),
);
jest.mock(
  'expo-crypto',
  () => jest.requireActual('@/config/db/test-database').testCrypto,
);

const NOW = new Date('2026-03-10T10:00:00Z');
const EARLIER_TODAY = new Date('2026-03-10T06:00:00Z');
const YESTERDAY = new Date('2026-03-09T06:00:00Z');
const LATER_TODAY = new Date('2026-03-10T18:00:00Z');
const TOMORROW = new Date('2026-03-11T06:00:00Z');
const START_OF_DAY = new Date('2026-03-10T00:00:00Z');

function productRow(id = 'p1') {
  return db.select().from(products).where(eq(products.id, id)).get();
}

function doseRow(id: string) {
  return db.select().from(doses).where(eq(doses.id, id)).get();
}

describe('setDoseStateRow', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    clearTestDatabase();
  });
  afterEach(() => jest.useRealTimers());

  it('takes a dose: stores the taken time and quantity, lowers the stock, sets the last use', async () => {
    // given
    insertProduct({ id: 'p1', stock: 10 });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 2 });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
    });

    // when
    await setDoseStateRow('d1', 'taken');

    // then
    expect(doseRow('d1')).toMatchObject({
      state: 'taken',
      takenAt: NOW,
      takenQuantity: 2,
    });
    expect(productRow()).toMatchObject({ stock: 8, lastUsedAt: NOW });
  });

  it('clears a pending snooze when the dose is taken', async () => {
    // given
    insertProduct({ id: 'p1' });
    insertSchedule({ id: 's1', productId: 'p1' });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
      snoozedUntil: LATER_TODAY,
    });

    // when
    await setDoseStateRow('d1', 'taken');

    // then
    expect(doseRow('d1')?.snoozedUntil).toBeNull();
  });

  it('reverts a taken dose: gives back the quantity actually taken and falls back to the previous use', async () => {
    // given
    insertProduct({ id: 'p1', stock: 5, lastUsedAt: NOW });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 3 });
    insertDose({
      id: 'earlier',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: YESTERDAY,
      state: 'taken',
      takenAt: YESTERDAY,
      takenQuantity: 3,
    });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
      state: 'taken',
      takenAt: NOW,
      takenQuantity: 2,
    });

    // when
    await setDoseStateRow('d1', 'pending');

    // then
    expect(doseRow('d1')).toMatchObject({
      state: 'pending',
      takenAt: null,
      takenQuantity: null,
    });
    expect(productRow()).toMatchObject({ stock: 7, lastUsedAt: YESTERDAY });
  });

  it('counts an as-needed intake as the last use after the dose is reverted', async () => {
    // given
    insertProduct({ id: 'p1', stock: 5, lastUsedAt: NOW });
    insertSchedule({ id: 's1', productId: 'p1' });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
      state: 'taken',
      takenAt: NOW,
      takenQuantity: 1,
    });
    insertIntake({ id: 'i1', productId: 'p1', takenAt: YESTERDAY });

    // when
    await setDoseStateRow('d1', 'pending');

    // then
    expect(productRow()?.lastUsedAt).toEqual(YESTERDAY);
  });

  it('gives back one unit for a dose taken before quantities were stored', async () => {
    // given
    insertProduct({ id: 'p1', stock: 5, lastUsedAt: NOW });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 4 });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
      state: 'taken',
      takenAt: NOW,
      takenQuantity: null,
    });

    // when
    await setDoseStateRow('d1', 'skipped');

    // then
    expect(doseRow('d1')?.state).toBe('skipped');
    expect(productRow()).toMatchObject({ stock: 6, lastUsedAt: null });
  });

  it('does not take the stock below zero', async () => {
    // given
    insertProduct({ id: 'p1', stock: 1 });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 3 });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
    });

    // when
    await setDoseStateRow('d1', 'taken');

    // then
    expect(productRow()?.stock).toBe(0);
  });

  it('leaves the stock empty for a product that does not track it', async () => {
    // given
    insertProduct({ id: 'p1', stock: null });
    insertSchedule({ id: 's1', productId: 'p1' });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
    });

    // when
    await setDoseStateRow('d1', 'taken');

    // then
    expect(productRow()).toMatchObject({ stock: null, lastUsedAt: NOW });
  });

  it('records a backdated correction at the planned time', async () => {
    // given
    insertProduct({ id: 'p1', stock: 10 });
    insertSchedule({ id: 's1', productId: 'p1' });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: YESTERDAY,
    });

    // when
    await setDoseStateRow('d1', 'taken', { backdated: true });

    // then
    expect(doseRow('d1')?.takenAt).toEqual(YESTERDAY);
    expect(productRow()?.lastUsedAt).toEqual(YESTERDAY);
  });

  it('changes nothing when the dose is already in the requested state', async () => {
    // given
    insertProduct({ id: 'p1', stock: 10 });
    insertSchedule({ id: 's1', productId: 'p1' });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
      state: 'skipped',
    });

    // when
    await setDoseStateRow('d1', 'skipped');

    // then
    expect(productRow()).toMatchObject({ stock: 10, lastUsedAt: null });
  });

  it('ignores a dose that does not exist', async () => {
    // given
    insertProduct({ id: 'p1', stock: 10 });

    // when
    await setDoseStateRow('missing', 'taken');

    // then
    expect(productRow()?.stock).toBe(10);
  });
});

describe('replacePendingDoseRows', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    clearTestDatabase();
    insertProduct({ id: 'p1' });
    insertSchedule({ id: 's1', productId: 'p1' });
  });
  afterEach(() => jest.useRealTimers());

  it('swaps the pending doses for the new slots and keeps what is still wanted', async () => {
    // given
    insertDose({
      id: 'obsolete',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: LATER_TODAY,
    });
    insertDose({
      id: 'wanted',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: TOMORROW,
    });
    const slot = (plannedAt: Date) => ({
      productId: 'p1',
      scheduleId: 's1',
      plannedAt,
    });
    const dayAfter = new Date('2026-03-12T06:00:00Z');

    // when
    const result = await replacePendingDoseRows('s1', START_OF_DAY, NOW, [
      slot(TOMORROW),
      slot(dayAfter),
    ]);

    // then
    expect(result.removedIds).toEqual(['obsolete']);
    expect(result.kept.map((dose) => dose.id)).toEqual(['wanted']);
    expect(result.inserted.map((dose) => dose.plannedAt)).toEqual([dayAfter]);
    expect(
      db
        .select()
        .from(doses)
        .all()
        .map((dose) => dose.plannedAt.getTime())
        .sort(),
    ).toEqual([TOMORROW.getTime(), dayAfter.getTime()]);
  });

  it('leaves taken and skipped doses and the ones before the window alone', async () => {
    // given
    insertDose({
      id: 'taken',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: LATER_TODAY,
      state: 'taken',
      takenAt: NOW,
    });
    insertDose({
      id: 'skipped',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: TOMORROW,
      state: 'skipped',
    });
    insertDose({
      id: 'history',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: YESTERDAY,
    });

    // when
    const result = await replacePendingDoseRows('s1', START_OF_DAY, NOW, []);

    // then
    expect(result.removedIds).toEqual([]);
    expect(
      db
        .select({ id: doses.id })
        .from(doses)
        .all()
        .map((dose) => dose.id)
        .sort(),
    ).toEqual(['history', 'skipped', 'taken']);
  });

  it('does not insert a slot that is taken already, and does not fail on it', async () => {
    // given
    insertDose({
      id: 'taken',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: LATER_TODAY,
      state: 'taken',
      takenAt: NOW,
    });

    // when
    const result = await replacePendingDoseRows('s1', START_OF_DAY, NOW, [
      { productId: 'p1', scheduleId: 's1', plannedAt: LATER_TODAY },
    ]);

    // then
    expect(result.inserted).toEqual([]);
    expect(db.select().from(doses).all()).toHaveLength(1);
  });

  it('does not touch the doses of another schedule', async () => {
    // given
    insertSchedule({ id: 's2', productId: 'p1' });
    insertDose({
      id: 'other',
      productId: 'p1',
      scheduleId: 's2',
      plannedAt: TOMORROW,
    });

    // when
    await replacePendingDoseRows('s1', START_OF_DAY, NOW, []);

    // then
    expect(doseRow('other')).toBeDefined();
  });
});

describe('deleteFuturePendingDoseRowsForSchedules', () => {
  beforeEach(() => clearTestDatabase());

  it('removes only the pending doses from the given time on and returns their ids', async () => {
    // given
    insertProduct({ id: 'p1' });
    insertSchedule({ id: 's1', productId: 'p1' });
    insertDose({
      id: 'future',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: TOMORROW,
    });
    insertDose({
      id: 'overdue',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: YESTERDAY,
    });
    insertDose({
      id: 'taken',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: LATER_TODAY,
      state: 'taken',
      takenAt: NOW,
    });

    // when
    const removedIds = await deleteFuturePendingDoseRowsForSchedules(
      ['s1'],
      NOW,
    );

    // then
    expect(removedIds).toEqual(['future']);
    expect(
      db
        .select({ id: doses.id })
        .from(doses)
        .all()
        .map((dose) => dose.id)
        .sort(),
    ).toEqual(['overdue', 'taken']);
  });
});
