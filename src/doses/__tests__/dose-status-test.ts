import { doseStatus } from '../dose-status';
import type { TodayDose } from '../dto/today-dose-output';

const NOW = new Date(2026, 9, 10, 12, 0);

function dose(state: TodayDose['state'], plannedAt: Date): TodayDose {
  return {
    id: 'dose',
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

describe('doseStatus', () => {
  it.each([
    ['taken', new Date(2026, 9, 10, 20), 'taken'],
    ['skipped', new Date(2026, 9, 10, 20), 'skipped'],
    ['pending', new Date(2026, 9, 10, 8), 'overdue'],
    ['pending', NOW, 'overdue'],
    ['pending', new Date(2026, 9, 10, 12, 1), 'planned'],
  ] as const)(
    'maps a %s dose planned at %s to %s',
    (state, plannedAt, expected) => {
      // when
      const status = doseStatus(dose(state, plannedAt), NOW);

      // then
      expect(status).toBe(expected);
    },
  );
});
