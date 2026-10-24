import { eq } from 'drizzle-orm';

import { asNeededIntakes, products } from '@/config/db/schema';
import {
  clearTestDatabase,
  db,
  insertDose,
  insertIntake,
  insertProduct,
  insertSchedule,
} from '@/config/db/test-database';

import {
  deleteIntakeRow,
  insertIntakeRow,
  intakesBetweenQuery,
} from '../intake-repository';

jest.mock('@/config/db/database', () =>
  jest.requireActual('@/config/db/test-database'),
);

const NOW = new Date('2026-03-10T10:00:00Z');
const EARLIER_TODAY = new Date('2026-03-10T06:00:00Z');
const YESTERDAY = new Date('2026-03-09T06:00:00Z');

function productRow() {
  return db.select().from(products).where(eq(products.id, 'p1')).get();
}

describe('insertIntakeRow', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    clearTestDatabase();
  });
  afterEach(() => jest.useRealTimers());

  it('records the intake, lowers the stock and sets the last use', () => {
    // given
    insertProduct({ id: 'p1', stock: 10 });

    // when
    insertIntakeRow('i1', 'p1', NOW, 2);

    // then
    expect(db.select().from(asNeededIntakes).all()).toEqual([
      { id: 'i1', productId: 'p1', takenAt: NOW, quantity: 2 },
    ]);
    expect(productRow()).toMatchObject({ stock: 8, lastUsedAt: NOW });
  });

  it('keeps the later last use when the intake is older than a taken dose', () => {
    // given
    insertProduct({ id: 'p1', stock: 10 });
    insertSchedule({ id: 's1', productId: 'p1' });
    insertDose({
      id: 'd1',
      productId: 'p1',
      scheduleId: 's1',
      plannedAt: EARLIER_TODAY,
      state: 'taken',
      takenAt: EARLIER_TODAY,
    });

    // when
    insertIntakeRow('i1', 'p1', YESTERDAY, 1);

    // then
    expect(productRow()?.lastUsedAt).toEqual(EARLIER_TODAY);
  });

  it('does not take the stock below zero and leaves an untracked stock empty', () => {
    // given
    insertProduct({ id: 'p1', stock: 1 });
    insertProduct({ id: 'p2', stock: null });

    // when
    insertIntakeRow('i1', 'p1', NOW, 5);
    insertIntakeRow('i2', 'p2', NOW, 1);

    // then
    expect(productRow()?.stock).toBe(0);
    expect(
      db.select().from(products).where(eq(products.id, 'p2')).get()?.stock,
    ).toBeNull();
  });

  it('rolls back the whole intake when the product does not exist', () => {
    // when
    const recording = () => insertIntakeRow('i1', 'missing', NOW, 1);

    // then
    expect(recording).toThrow();
    expect(db.select().from(asNeededIntakes).all()).toEqual([]);
  });
});

describe('deleteIntakeRow', () => {
  beforeEach(() => clearTestDatabase());

  it('removes the intake, gives the quantity back and falls back to the previous use', () => {
    // given
    insertProduct({ id: 'p1', stock: 3, lastUsedAt: NOW });
    insertIntake({ id: 'old', productId: 'p1', takenAt: YESTERDAY });
    insertIntake({ id: 'new', productId: 'p1', takenAt: NOW, quantity: 2 });

    // when
    deleteIntakeRow('new');

    // then
    expect(db.select().from(asNeededIntakes).all()).toHaveLength(1);
    expect(productRow()).toMatchObject({ stock: 5, lastUsedAt: YESTERDAY });
  });

  it('clears the last use when nothing else was taken', () => {
    // given
    insertProduct({ id: 'p1', stock: 3, lastUsedAt: NOW });
    insertIntake({ id: 'i1', productId: 'p1', takenAt: NOW });

    // when
    deleteIntakeRow('i1');

    // then
    expect(productRow()).toMatchObject({ stock: 4, lastUsedAt: null });
  });

  it('ignores an intake that does not exist', () => {
    // given
    insertProduct({ id: 'p1', stock: 3 });

    // when
    deleteIntakeRow('missing');

    // then
    expect(productRow()?.stock).toBe(3);
  });
});

describe('intakesBetweenQuery', () => {
  beforeEach(() => clearTestDatabase());

  it('lists the intakes of the range newest first, with the product details', async () => {
    // given
    insertProduct({ id: 'p1', name: 'Ibuprofen', unit: 'tablet' });
    insertIntake({ id: 'old', productId: 'p1', takenAt: YESTERDAY });
    insertIntake({ id: 'a', productId: 'p1', takenAt: EARLIER_TODAY });
    insertIntake({ id: 'b', productId: 'p1', takenAt: NOW });

    // when
    const intakes = await intakesBetweenQuery(
      new Date('2026-03-10T00:00:00Z'),
      new Date('2026-03-11T00:00:00Z'),
    );

    // then
    expect(intakes.map((intake) => intake.id)).toEqual(['b', 'a']);
    expect(intakes[0]).toMatchObject({
      productName: 'Ibuprofen',
      unit: 'tablet',
      profileImageFileName: null,
    });
  });
});
