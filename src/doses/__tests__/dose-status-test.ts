import { activeSnoozeEnd, doseStatus } from '../dose-status';
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

describe('activeSnoozeEnd', () => {
  const snoozed = (
    state: TodayDose['state'],
    snoozedUntil: Date | null,
  ): TodayDose => ({
    ...dose(state, new Date(2026, 9, 10, 8)),
    snoozedUntil,
  });

  it('returns the snooze end while it is still ahead', () => {
    // given
    const until = new Date(2026, 9, 10, 12, 10);

    // when
    const end = activeSnoozeEnd(snoozed('pending', until), NOW);

    // then
    expect(end).toEqual(until);
  });

  it.each([
    ['has passed', 'pending', new Date(2026, 9, 10, 11, 50)],
    ['is exactly now', 'pending', NOW],
    ['was never set', 'pending', null],
    ['is left on a taken dose', 'taken', new Date(2026, 9, 10, 12, 10)],
  ] as const)('returns null when the snooze %s', (_, state, until) => {
    // when
    const end = activeSnoozeEnd(snoozed(state, until), NOW);

    // then
    expect(end).toBeNull();
  });
});
