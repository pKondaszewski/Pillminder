import { correctionStockDelta } from '../dose-correction';
import type { TodayDose } from '../dto/today-dose-output';

function dose(overrides: Partial<TodayDose>): TodayDose {
  return {
    id: 'a',
    productId: 'ibuprofen',
    productName: 'Ibuprofen',
    quantity: 2,
    unit: 'tablet',
    plannedAt: new Date(2026, 9, 9, 8),
    state: 'pending',
    takenAt: null,
    takenQuantity: null,
    snoozedUntil: null,
    category: 'medication',
    fasting: false,
    profileImageFileName: null,
    stockTracked: true,
    ...overrides,
  };
}

describe('correctionStockDelta', () => {
  it('takes the schedule quantity out of stock when an untaken dose is corrected to taken', () => {
    // given
    const unticked = dose({ state: 'pending' });

    // when
    const delta = correctionStockDelta(unticked, 'taken');

    // then
    expect(delta).toBe(-2);
  });

  it('returns what was deducted when a taken dose is corrected to skipped', () => {
    // given
    const taken = dose({ state: 'taken', takenQuantity: 3 });

    // when
    const delta = correctionStockDelta(taken, 'skipped');

    // then
    expect(delta).toBe(3);
  });

  it('leaves stock alone when the state does not change', () => {
    // given
    const taken = dose({ state: 'taken', takenQuantity: 2 });

    // when
    const delta = correctionStockDelta(taken, 'taken');

    // then
    expect(delta).toBe(0);
  });

  it('leaves stock alone when an untaken dose is corrected to skipped', () => {
    // given
    const unticked = dose({ state: 'pending' });

    // when
    const delta = correctionStockDelta(unticked, 'skipped');

    // then
    expect(delta).toBe(0);
  });
});
