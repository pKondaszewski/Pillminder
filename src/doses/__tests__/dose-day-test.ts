import { dayStatus, groupDosesByProduct } from '../dose-day';
import type { TodayDose } from '../dto/today-dose-output';

const NOW = new Date(2026, 9, 10, 12, 0);
const TODAY = new Date(2026, 9, 10);

function dose(
  id: string,
  plannedAt: Date,
  state: TodayDose['state'] = 'pending',
  productId = 'ibuprofen',
): TodayDose {
  return {
    id,
    productId,
    productName: productId,
    quantity: 1,
    unit: 'tablet',
    plannedAt,
    state,
    takenAt: null,
    snoozedUntil: null,
  };
}

describe('dayStatus', () => {
  it('is none when nothing was planned that day', () => {
    // given
    const doses = [dose('a', new Date(2026, 9, 9, 8), 'taken')];

    // when
    const status = dayStatus(TODAY, doses, NOW);

    // then
    expect(status).toBe('none');
  });

  it('is allTaken when every dose of the day was taken', () => {
    // given
    const doses = [
      dose('a', new Date(2026, 9, 10, 8), 'taken'),
      dose('b', new Date(2026, 9, 10, 9), 'taken', 'vitamin-d'),
    ];

    // when
    const status = dayStatus(TODAY, doses, NOW);

    // then
    expect(status).toBe('allTaken');
  });

  it('is skipped when a dose was skipped and none missed', () => {
    // given
    const doses = [
      dose('a', new Date(2026, 9, 10, 8), 'taken'),
      dose('b', new Date(2026, 9, 10, 9), 'skipped'),
    ];

    // when
    const status = dayStatus(TODAY, doses, NOW);

    // then
    expect(status).toBe('skipped');
  });

  it('is missed when a past dose was left pending, even next to a skipped one', () => {
    // given
    const doses = [
      dose('a', new Date(2026, 9, 10, 8), 'skipped'),
      dose('b', new Date(2026, 9, 10, 9), 'pending'),
    ];

    // when
    const status = dayStatus(TODAY, doses, NOW);

    // then
    expect(status).toBe('missed');
  });

  it('is upcoming for a future day without judging it', () => {
    // given
    const tomorrow = new Date(2026, 9, 11);
    const doses = [dose('a', new Date(2026, 9, 11, 8))];

    // when
    const status = dayStatus(tomorrow, doses, NOW);

    // then
    expect(status).toBe('upcoming');
  });

  it('is upcoming for today while a dose is still ahead', () => {
    // given
    const doses = [
      dose('a', new Date(2026, 9, 10, 8), 'taken'),
      dose('b', new Date(2026, 9, 10, 20)),
    ];

    // when
    const status = dayStatus(TODAY, doses, NOW);

    // then
    expect(status).toBe('upcoming');
  });
});

describe('groupDosesByProduct', () => {
  it('groups doses per product in order of the first dose', () => {
    // given
    const doses = [
      dose('a', new Date(2026, 9, 10, 8), 'taken', 'vitamin-d'),
      dose('b', new Date(2026, 9, 10, 9), 'taken', 'ibuprofen'),
      dose('c', new Date(2026, 9, 10, 20), 'pending', 'vitamin-d'),
    ];

    // when
    const groups = groupDosesByProduct(doses);

    // then
    expect(groups.map((g) => g.productId)).toEqual(['vitamin-d', 'ibuprofen']);
    expect(groups[0].doses.map((d) => d.id)).toEqual(['a', 'c']);
  });
});
