import { dayCounts, todayCardState } from '../dose-today-card';
import type { TodayDose } from '../dto/today-dose-output';

const NOW = new Date(2026, 9, 10, 12, 0);
const TODAY = new Date(2026, 9, 10);

function dose(
  id: string,
  plannedAt: Date,
  state: TodayDose['state'] = 'pending',
  productName = 'Ibuprofen',
): TodayDose {
  return {
    id,
    productId: productName,
    productName,
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

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 10, hours, minutes);
}

describe('dayCounts', () => {
  it('counts doses by status', () => {
    // given
    const doses = [
      dose('a', at(7), 'taken'),
      dose('b', at(8), 'skipped'),
      dose('c', at(9)),
      dose('d', at(18)),
      dose('e', at(20)),
    ];

    // when
    const counts = dayCounts(doses, NOW);

    // then
    expect(counts).toEqual({
      total: 5,
      taken: 1,
      skipped: 1,
      overdue: 1,
      planned: 2,
    });
  });
});

describe('todayCardState', () => {
  it('is calm with the next dose when nothing is overdue', () => {
    // given
    const doses = [
      dose('a', at(8), 'taken'),
      dose('c', at(20), 'pending', 'Magnez'),
      dose('b', at(13, 50)),
    ];

    // when
    const state = todayCardState(doses, TODAY, NOW);

    // then
    expect(state).toMatchObject({
      kind: 'calm',
      next: { id: 'b' },
      untilNextMs: 110 * 60 * 1000,
    });
  });

  it('is overdue with the late time of a single dose', () => {
    // given
    const doses = [dose('a', at(10, 50)), dose('b', at(20))];

    // when
    const state = todayCardState(doses, TODAY, NOW);

    // then
    expect(state).toMatchObject({
      kind: 'overdue',
      names: ['Ibuprofen'],
      otherCount: 0,
      oldestLateMs: 70 * 60 * 1000,
    });
  });

  it('lists at most two names and counts the others', () => {
    // given
    const doses = [
      dose('a', at(8), 'pending', 'Euthyrox'),
      dose('b', at(9), 'pending', 'Magnez'),
      dose('c', at(10), 'pending', 'Witamina D'),
      dose('d', at(11), 'pending', 'Omega 3'),
    ];

    // when
    const state = todayCardState(doses, TODAY, NOW);

    // then
    expect(state).toMatchObject({
      kind: 'overdue',
      names: ['Euthyrox', 'Magnez'],
      otherCount: 2,
      oldestLateMs: 4 * 60 * 60 * 1000,
    });
  });

  it('counts a product once when it is overdue twice', () => {
    // given
    const doses = [dose('a', at(8)), dose('b', at(10))];

    // when
    const state = todayCardState(doses, TODAY, NOW);

    // then
    expect(state).toMatchObject({ names: ['Ibuprofen'], otherCount: 0 });
  });

  it('is done when everything is handled', () => {
    // given
    const doses = [dose('a', at(8), 'taken'), dose('b', at(9), 'skipped')];

    // when
    const state = todayCardState(doses, TODAY, NOW);

    // then
    expect(state).toMatchObject({
      kind: 'done',
      counts: { total: 2, taken: 1, skipped: 1 },
    });
  });

  it('is a past summary for an earlier day', () => {
    // given
    const doses = [dose('a', new Date(2026, 9, 9, 8))];

    // when
    const state = todayCardState(doses, new Date(2026, 9, 9), NOW);

    // then
    expect(state).toMatchObject({
      kind: 'pastSummary',
      counts: { total: 1, overdue: 1 },
    });
  });

  it('is a future summary for a later day', () => {
    // given
    const doses = [dose('a', new Date(2026, 9, 11, 8))];

    // when
    const state = todayCardState(doses, new Date(2026, 9, 11), NOW);

    // then
    expect(state).toMatchObject({
      kind: 'futureSummary',
      counts: { total: 1, planned: 1 },
    });
  });
});
