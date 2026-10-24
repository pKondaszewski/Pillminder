import type { Dose } from '../dose-repository';
import { isDueInFuture } from '../dose-validator';

const NOW = new Date(2026, 9, 9, 12, 0);

function doseAt(plannedAt: Date): Dose {
  return {
    id: 'a',
    productId: 'p',
    scheduleId: 's',
    plannedAt,
    state: 'pending',
    takenAt: null,
    takenQuantity: null,
    snoozedUntil: null,
  };
}

describe('isDueInFuture', () => {
  it('is true for a dose planned after now', () => {
    // given
    const dose = doseAt(new Date(2026, 9, 9, 12, 1));

    // when
    const result = isDueInFuture(dose, NOW);

    // then
    expect(result).toBe(true);
  });

  it('is false for a dose planned exactly now or earlier', () => {
    // given
    const doses = [doseAt(NOW), doseAt(new Date(2026, 9, 9, 8, 0))];

    // when
    const results = doses.map((dose) => isDueInFuture(dose, NOW));

    // then
    expect(results).toEqual([false, false]);
  });
});
