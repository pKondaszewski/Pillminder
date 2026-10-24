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
  restoreDoseRow,
  setDoseStateRow,
} from '../dose-repository';
import type { DoseState } from '../dose-transition';

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

  it('does not take the stock below zero and records only what was deducted', async () => {
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
    expect(doseRow('d1')?.takenQuantity).toBe(1);
  });

  it.each<DoseState>(['pending', 'skipped'])(
    'gives back only what was deducted when a dose taken from too little stock goes to %s',
    async (target) => {
      // given
      insertProduct({ id: 'p1', stock: 1 });
      insertSchedule({ id: 's1', productId: 'p1', quantity: 3 });
      insertDose({
        id: 'd1',
        productId: 'p1',
        scheduleId: 's1',
        plannedAt: EARLIER_TODAY,
      });
      await setDoseStateRow('d1', 'taken');

      // when
      await setDoseStateRow('d1', target);

      // then
      expect(productRow()?.stock).toBe(1);
      expect(doseRow('d1')?.takenQuantity).toBeNull();
    },
  );

  it('takes and reverts the full quantity when the stock is enough', async () => {
    // given
    insertProduct({ id: 'p1', stock: 5 });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 3 });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
    });

    // when
    await setDoseStateRow('d1', 'taken');
    const stockAfterTaking = productRow()?.stock;
    await setDoseStateRow('d1', 'pending');

    // then
    expect(stockAfterTaking).toBe(2);
    expect(productRow()?.stock).toBe(5);
  });

  it('gives nothing back when a dose was taken from an empty stock', async () => {
    // given
    insertProduct({ id: 'p1', stock: 0 });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 3 });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
    });

    // when
    await setDoseStateRow('d1', 'taken');
    await setDoseStateRow('d1', 'pending');

    // then
    expect(productRow()?.stock).toBe(0);
  });

  it('keeps an untracked stock untracked through take and revert', async () => {
    // given
    insertProduct({ id: 'p1', stock: null });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 3 });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
    });

    // when
    await setDoseStateRow('d1', 'taken');
    const takenQuantity = doseRow('d1')?.takenQuantity;
    await setDoseStateRow('d1', 'pending');

    // then
    expect(takenQuantity).toBe(3);
    expect(productRow()?.stock).toBeNull();
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

describe('restoreDoseRow', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    clearTestDatabase();
  });
  afterEach(() => jest.useRealTimers());

  it('gives back exactly the deducted amounts of a bulk take from a low stock', async () => {
    // given
    insertProduct({ id: 'p1', stock: 3 });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 2 });
    ['d1', 'd2'].forEach((id, index) =>
      insertDose({
        id,
        productId: 'p1',
        scheduleId: 's1',
        plannedAt: new Date(EARLIER_TODAY.getTime() + index * 60_000),
      }),
    );
    await setDoseStateRow('d1', 'taken');
    await setDoseStateRow('d2', 'taken');
    const pending = {
      state: 'pending' as const,
      takenAt: null,
      takenQuantity: null,
    };

    // when
    await restoreDoseRow({ id: 'd1', ...pending });
    await restoreDoseRow({ id: 'd2', ...pending });

    // then
    expect(productRow()?.stock).toBe(3);
    expect(doseRow('d1')).toMatchObject(pending);
    expect(doseRow('d2')).toMatchObject(pending);
    expect(productRow()?.lastUsedAt).toBeNull();
  });

  it('restores a taken dose with its original time and takes its stock again', async () => {
    // given
    insertProduct({ id: 'p1', stock: 10 });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 2 });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: YESTERDAY,
      state: 'taken',
      takenAt: EARLIER_TODAY,
      takenQuantity: 2,
    });
    await setDoseStateRow('d1', 'skipped', { backdated: true });

    // when
    await restoreDoseRow({
      id: 'd1',
      state: 'taken',
      takenAt: EARLIER_TODAY,
      takenQuantity: 2,
    });

    // then
    expect(doseRow('d1')).toMatchObject({
      state: 'taken',
      takenAt: EARLIER_TODAY,
      takenQuantity: 2,
    });
    expect(productRow()).toMatchObject({
      stock: 10,
      lastUsedAt: EARLIER_TODAY,
    });
  });

  it('restores a skipped dose after it was corrected to taken', async () => {
    // given
    insertProduct({ id: 'p1', stock: 10 });
    insertSchedule({ id: 's1', productId: 'p1', quantity: 2 });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: YESTERDAY,
      state: 'skipped',
    });
    await setDoseStateRow('d1', 'taken', { backdated: true });

    // when
    await restoreDoseRow({
      id: 'd1',
      state: 'skipped',
      takenAt: null,
      takenQuantity: null,
    });

    // then
    expect(doseRow('d1')).toMatchObject({ state: 'skipped', takenAt: null });
    expect(productRow()).toMatchObject({ stock: 10, lastUsedAt: null });
  });
});
