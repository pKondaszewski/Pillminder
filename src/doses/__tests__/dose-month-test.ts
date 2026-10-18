import { monthSummary } from '../dose-month';
import type { TodayDose } from '../dto/today-dose-output';

const OCTOBER = new Date(2026, 9, 1);

function dose(plannedAt: Date, state: TodayDose['state']): TodayDose {
  return {
    id: String(plannedAt.getTime()),
    productId: 'ibuprofen',
    productName: 'Ibuprofen',
    quantity: 1,
    unit: 'tablet',
    plannedAt,
    state,
    takenAt: null,
    takenQuantity: null,
    snoozedUntil: null,
    category: 'medication',
    fasting: false,
    profileImageFileName: null,
    stockTracked: true,
  };
}

describe('monthSummary', () => {
  it('counts the due doses of the month and ignores the planned ones', () => {
    // given
    const now = new Date(2026, 9, 10, 12);
    const doses = [
      dose(new Date(2026, 9, 2, 8), 'taken'),
      dose(new Date(2026, 9, 3, 8), 'taken'),
      dose(new Date(2026, 9, 4, 8), 'skipped'),
      dose(new Date(2026, 9, 5, 8), 'pending'),
      dose(new Date(2026, 9, 20, 8), 'pending'),
      dose(new Date(2026, 8, 30, 8), 'taken'),
    ];

    // when
    const summary = monthSummary(doses, OCTOBER, now);

    // then
    expect(summary).toEqual({
      taken: 2,
      due: 4,
      skipped: 1,
      missed: 1,
      throughToday: true,
    });
  });

  it('is not marked as running until today for another month', () => {
    // given
    const now = new Date(2026, 10, 3, 12);

    // when
    const summary = monthSummary([], OCTOBER, now);

    // then
    expect(summary.throughToday).toBe(false);
  });
});
