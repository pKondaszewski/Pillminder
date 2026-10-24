import { eq } from 'drizzle-orm';

import {
  asNeededIntakes,
  doses,
  notes,
  productImages,
  products,
  schedules,
} from '@/config/db/schema';
import {
  clearTestDatabase,
  db,
  insertDose,
  insertImage,
  insertIntake,
  insertProduct,
  insertSchedule,
} from '@/config/db/test-database';
import { deleteImageFiles } from '@/images/image-files';
import {
  cancelDoseReminders,
  cancelReorderAlert,
} from '@/notifications/notification-service';

import {
  archiveProduct,
  removeCategoryProducts,
  removeProduct,
  restockPack,
  restoreProduct,
} from '../product-orchestrator';

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
jest.mock('@/images/image-files', () => ({ deleteImageFiles: jest.fn() }));
jest.mock('@/notifications/notification-service', () => ({
  cancelDoseReminders: jest.fn().mockResolvedValue(undefined),
  cancelReorderAlert: jest.fn().mockResolvedValue(undefined),
  dismissDoseReminder: jest.fn().mockResolvedValue(undefined),
  scheduleDoseReminder: jest.fn().mockResolvedValue(undefined),
}));

const NOW = new Date('2026-03-10T10:00:00Z');
const TOMORROW = new Date('2026-03-11T06:00:00Z');
const YESTERDAY = new Date('2026-03-09T06:00:00Z');

function rowCounts() {
  return {
    products: db.select().from(products).all().length,
    schedules: db.select().from(schedules).all().length,
    doses: db.select().from(doses).all().length,
    intakes: db.select().from(asNeededIntakes).all().length,
    notes: db.select().from(notes).all().length,
    images: db.select().from(productImages).all().length,
  };
}

function insertFullProduct(id: string, category = 'medication') {
  insertProduct({ id, category });
  insertSchedule({ id: `${id}-s`, productId: id });
  insertDose({
    id: `${id}-d`,
    productId: id,
    scheduleId: `${id}-s`,
    plannedAt: TOMORROW,
  });
  insertIntake({ id: `${id}-i`, productId: id, takenAt: YESTERDAY });
  db.insert(notes)
    .values({
      id: `${id}-n`,
      productId: id,
      body: 'note',
      createdAt: NOW,
      updatedAt: NOW,
    })
    .run();
  insertImage({ id: `${id}-img`, productId: id, fileName: `${id}.jpg` });
  db.update(products)
    .set({ profileImageId: `${id}-img` })
    .where(eq(products.id, id))
    .run();
}

describe('product orchestrator on a real database', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    jest.clearAllMocks();
    clearTestDatabase();
  });
  afterEach(() => jest.useRealTimers());

  describe('removeProduct', () => {
    it('deletes the product with its schedules, doses, intakes, notes and images', async () => {
      // given
      insertFullProduct('p1');
      insertFullProduct('other');

      // when
      await removeProduct('p1');

      // then
      expect(rowCounts()).toEqual({
        products: 1,
        schedules: 1,
        doses: 1,
        intakes: 1,
        notes: 1,
        images: 1,
      });
      expect(db.select().from(products).get()?.id).toBe('other');
    });

    it('deletes the doses kept after their schedule was deleted', async () => {
      // given
      insertProduct({ id: 'p1' });
      insertDose({
        id: 'kept',
        productId: 'p1',
        scheduleId: null,
        plannedAt: NOW,
        state: 'taken',
      });

      // when
      await removeProduct('p1');

      // then
      expect(db.select().from(doses).all()).toEqual([]);
    });

    it('deletes the image files of the product and cancels its reorder alert', async () => {
      // given
      insertFullProduct('p1');

      // when
      await removeProduct('p1');

      // then
      expect(deleteImageFiles).toHaveBeenCalledWith(['p1.jpg']);
      expect(cancelReorderAlert).toHaveBeenCalledWith('p1');
    });

    it('cancels the reminders of the future pending doses only', async () => {
      // given
      insertFullProduct('p1');
      insertDose({
        id: 'overdue',
        productId: 'p1',
        scheduleId: 'p1-s',
        plannedAt: YESTERDAY,
      });

      // when
      await removeProduct('p1');

      // then
      expect(cancelDoseReminders).toHaveBeenCalledWith(['p1-d']);
    });
  });

  describe('removeCategoryProducts', () => {
    it('removes every product of the category and nothing else', async () => {
      // given
      insertFullProduct('a', 'Vet gel');
      insertFullProduct('b', 'Vet gel');
      insertFullProduct('c', 'medication');

      // when
      const removed = await removeCategoryProducts('Vet gel');

      // then
      expect([...removed].sort()).toEqual(['a', 'b']);
      expect(db.select().from(products).all()).toHaveLength(1);
      expect(db.select().from(doses).all()).toHaveLength(1);
    });
  });

  describe('restockPack', () => {
    it('adds a pack to the stock and cancels the reorder alert', async () => {
      // given
      insertProduct({ id: 'p1', stock: 2, packSize: 20 });

      // when
      await restockPack('p1');

      // then
      expect(db.select().from(products).get()?.stock).toBe(22);
      expect(cancelReorderAlert).toHaveBeenCalledWith('p1');
    });
  });

  describe('archiveProduct and restoreProduct', () => {
    it('archives: drops the future pending doses, keeps the history and saves the completion note', async () => {
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
        id: 'history',
        productId: 'p1',
        scheduleId: 's1',
        plannedAt: YESTERDAY,
        state: 'taken',
        takenAt: YESTERDAY,
      });

      // when
      await archiveProduct('p1', '  Course finished ');

      // then
      expect(db.select().from(products).get()?.status).toBe('archived');
      expect(
        db
          .select()
          .from(doses)
          .all()
          .map((d) => d.id),
      ).toEqual(['history']);
      expect(db.select().from(notes).all()).toMatchObject([
        { productId: 'p1', body: 'Course finished' },
      ]);
    });

    it('restores: the product is active again and its pending doses are planned from the schedule', async () => {
      // given
      insertProduct({ id: 'p1', status: 'archived' });
      insertSchedule({ id: 's1', productId: 'p1', timesOfDay: ['20:00'] });

      // when
      await restoreProduct('p1');

      // then
      expect(db.select().from(products).get()?.status).toBe('active');
      expect(db.select().from(doses).all()).toHaveLength(30);
    });
  });
});
