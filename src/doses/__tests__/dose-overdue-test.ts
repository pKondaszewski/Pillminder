import { overdueDoses } from '../dose-overdue';
import type { TodayDose } from '../dto/today-dose-output';

const NOW = new Date(2026, 9, 10, 18, 0);

function dose(
  id: string,
  plannedAt: Date,
  state: TodayDose['state'] = 'pending',
): TodayDose {
  return {
    id,
    productName: 'Ibuprofen',
    quantity: 1,
    unit: 'tablet',
    plannedAt,
    state,
    takenAt: null,
    snoozedUntil: null,
  };
}

describe('overdueDoses', () => {
  it('returns pending doses planned before now', () => {
    // given
    const doses = [
      dose('a', new Date(2026, 9, 10, 8, 0)),
      dose('b', new Date(2026, 9, 10, 17, 59)),
    ];

    // when
    const result = overdueDoses(doses, NOW);

    // then
    expect(result.map(({ id }) => id)).toEqual(['a', 'b']);
  });

  it('includes a dose planned exactly at now', () => {
    // given
    const doses = [dose('a', NOW)];

    // when
    const result = overdueDoses(doses, NOW);

    // then
    expect(result.map(({ id }) => id)).toEqual(['a']);
  });

  it('skips doses planned later today', () => {
    // given
    const doses = [dose('a', new Date(2026, 9, 10, 18, 1))];

    // when
    const result = overdueDoses(doses, NOW);

    // then
    expect(result).toEqual([]);
  });

  it('skips taken and skipped doses', () => {
    // given
    const earlier = new Date(2026, 9, 10, 8, 0);
    const doses = [dose('a', earlier, 'taken'), dose('b', earlier, 'skipped')];

    // when
    const result = overdueDoses(doses, NOW);

    // then
    expect(result).toEqual([]);
  });
});
