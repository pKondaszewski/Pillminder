import { toTodayDose } from '../dose-today';
import type { TodayDoseRow } from '../dto/today-dose-output';

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
  quantity: 2,
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
