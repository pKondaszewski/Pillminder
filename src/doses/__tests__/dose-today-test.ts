import type { Schedule } from '@/schedules/schedule-service';

import { toTodayDose } from '../dose-today';
import type { TodayDoseRow } from '../dto/today-dose-output';

const schedule: Schedule = {
  id: 'schedule-1',
  productId: 'product-1',
  intervalDays: 1,
  weekdays: null,
  cycle: null,
  cycleAnchor: null,
  cyclePausedDays: 0,
  timesOfDay: ['08:00'],
  quantity: 2,
  steps: null,
  startDate: null,
  endDate: null,
  pausedAt: null,
  resumeAt: null,
};

const row: TodayDoseRow = {
  id: 'dose-1',
  productId: 'product-1',
  plannedAt: new Date('2026-10-10T08:00:00Z'),
  state: 'pending',
  takenAt: null,
  takenQuantity: null,
  snoozedUntil: null,
  productName: 'Ibuprofen',
  productStrength: null,
  category: 'medication',
  unit: 'tablet',
  fasting: true,
  stock: 10,
  profileImageFileName: 'photo.jpg',
  schedule,
};

describe('toTodayDose', () => {
  it('maps the joined row with quantity and unit', () => {
    // when
    const dose = toTodayDose(row);

    // then
    expect(dose).toEqual({
      id: 'dose-1',
      productId: 'product-1',
      productName: 'Ibuprofen',
      quantity: 2,
      unit: 'tablet',
      plannedAt: row.plannedAt,
      state: 'pending',
      takenAt: null,
      takenQuantity: null,
      snoozedUntil: null,
      category: 'medication',
      fasting: true,
      profileImageFileName: 'photo.jpg',
      stockTracked: true,
    });
  });

  it('appends the strength to the product name', () => {
    // given
    const withStrength = { ...row, productStrength: '400 mg' };

    // when
    const dose = toTodayDose(withStrength);

    // then
    expect(dose.productName).toBe('Ibuprofen 400 mg');
  });

  it('marks stock as untracked when the product has no stock', () => {
    // given
    const untracked = { ...row, stock: null };

    // when
    const dose = toTodayDose(untracked);

    // then
    expect(dose.stockTracked).toBe(false);
  });
});

describe('toTodayDose with steps', () => {
  const tapered: TodayDoseRow = {
    ...row,
    schedule: {
      ...schedule,
      cycleAnchor: new Date(2026, 9, 10),
      steps: [
        { days: 3, quantity: 4 },
        { days: null, quantity: 1 },
      ],
    },
  };

  it('gives each dose the quantity of its own day', () => {
    // given
    const days = [10, 12, 13, 20];

    // when
    const quantities = days.map(
      (day) =>
        toTodayDose({ ...tapered, plannedAt: new Date(2026, 9, day, 8) })
          .quantity,
    );

    // then
    expect(quantities).toEqual([4, 4, 1, 1]);
  });
});
