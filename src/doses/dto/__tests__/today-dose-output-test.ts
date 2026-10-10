import { type TodayDoseRow, toTodayDose } from '../today-dose-output';

const row: TodayDoseRow = {
  id: 'dose-1',
  plannedAt: new Date('2026-10-10T08:00:00Z'),
  state: 'pending',
  takenAt: null,
  snoozedUntil: null,
  productName: 'Ibuprofen',
  productStrength: null,
  unit: 'tablet',
  quantity: 2,
};

describe('toTodayDose', () => {
  it('maps the joined row with quantity and unit', () => {
    // when
    const dose = toTodayDose(row);

    // then
    expect(dose).toEqual({
      id: 'dose-1',
      productName: 'Ibuprofen',
      quantity: 2,
      unit: 'tablet',
      plannedAt: row.plannedAt,
      state: 'pending',
      takenAt: null,
      snoozedUntil: null,
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
});
