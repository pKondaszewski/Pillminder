import {
  courseProgress,
  groupSchedules,
  scheduleKind,
  type ScheduleListFilters,
} from '../schedule-list';
import type { ScheduleListItem } from '../schedule-repository';

const NOW = new Date(2026, 9, 20, 12, 0);

function day(month: number, dayOfMonth: number): Date {
  return new Date(2026, month - 1, dayOfMonth);
}

const NO_FILTERS: ScheduleListFilters = {
  query: '',
  kind: null,
  category: null,
};

function item(
  id: string,
  overrides: Partial<ScheduleListItem> = {},
): ScheduleListItem {
  return {
    id,
    productId: `product-${id}`,
    intervalDays: 1,
    timesOfDay: ['08:00'],
    quantity: 1,
    startDate: null,
    endDate: null,
    pausedAt: null,
    resumeAt: null,
    productName: `Product ${id}`,
    productCategory: 'supplement',
    productUnit: null,
    productStatus: 'active',
    profileImageFileName: null,
    ...overrides,
  };
}

describe('scheduleKind', () => {
  it('is paused when the product is archived', () => {
    // given
    const schedule = item('a', { productStatus: 'archived' });

    // when
    const result = scheduleKind(schedule, NOW);

    // then
    expect(result).toBe('paused');
  });

  it('is paused for an archived product even after the end date', () => {
    // given
    const schedule = item('a', {
      productStatus: 'archived',
      endDate: day(10, 1),
    });

    // when
    const result = scheduleKind(schedule, NOW);

    // then
    expect(result).toBe('paused');
  });

  it('is ongoing without an end date', () => {
    // given
    const schedule = item('a');

    // when
    const result = scheduleKind(schedule, NOW);

    // then
    expect(result).toBe('ongoing');
  });

  it('is timed with an end date today or later', () => {
    // given
    const schedule = item('a', { endDate: day(10, 20) });

    // when
    const result = scheduleKind(schedule, NOW);

    // then
    expect(result).toBe('timed');
  });

  it('is ended the day after the end date', () => {
    // given
    const schedule = item('a', { endDate: day(10, 19) });

    // when
    const result = scheduleKind(schedule, NOW);

    // then
    expect(result).toBe('ended');
  });

  it('is paused while a pause is active', () => {
    // given
    const schedule = item('a', { pausedAt: day(10, 18), resumeAt: day(11, 1) });

    // when
    const result = scheduleKind(schedule, NOW);

    // then
    expect(result).toBe('paused');
  });

  it('prefers ended over paused', () => {
    // given
    const schedule = item('a', { endDate: day(10, 10), pausedAt: day(10, 5) });

    // when
    const result = scheduleKind(schedule, NOW);

    // then
    expect(result).toBe('ended');
  });
});

describe('groupSchedules', () => {
  const ongoing = item('1', { productName: 'Zinc' });
  const timed = item('2', { productName: 'Amoxicillin', endDate: day(10, 25) });
  const paused = item('3', { productName: 'Iron', pausedAt: day(10, 1) });
  const ended = item('4', { productName: 'Old', endDate: day(10, 1) });
  const all = [ended, paused, timed, ongoing];

  it('orders groups ongoing, timed, paused and hides ended by default', () => {
    // given
    const filters = NO_FILTERS;

    // when
    const result = groupSchedules(all, filters, NOW, 'en');

    // then
    expect(result.map((g) => g.kind)).toEqual(['ongoing', 'timed', 'paused']);
  });

  it('shows only ended schedules when that kind is chosen', () => {
    // given
    const filters = { ...NO_FILTERS, kind: 'ended' as const };

    // when
    const result = groupSchedules(all, filters, NOW, 'en');

    // then
    expect(result).toEqual([{ kind: 'ended', items: [ended] }]);
  });

  it('sorts items by product name inside a group', () => {
    // given
    const second = item('5', { productName: 'Magnesium' });

    // when
    const result = groupSchedules([ongoing, second], NO_FILTERS, NOW, 'en');

    // then
    expect(result[0].items.map((i) => i.productName)).toEqual([
      'Magnesium',
      'Zinc',
    ]);
  });

  it('filters by product name ignoring case', () => {
    // given
    const filters = { ...NO_FILTERS, query: ' amox' };

    // when
    const result = groupSchedules(all, filters, NOW, 'en');

    // then
    expect(result).toEqual([{ kind: 'timed', items: [timed] }]);
  });

  it('filters by product category', () => {
    // given
    const medication = item('6', { productCategory: 'medication' });
    const filters = { ...NO_FILTERS, category: 'medication' };

    // when
    const result = groupSchedules([ongoing, medication], filters, NOW, 'en');

    // then
    expect(result).toEqual([{ kind: 'ongoing', items: [medication] }]);
  });

  it('ignores a category filter that no schedule has anymore', () => {
    // given
    const filters = { ...NO_FILTERS, category: 'care' };

    // when
    const result = groupSchedules([ongoing], filters, NOW, 'en');

    // then
    expect(result).toEqual([{ kind: 'ongoing', items: [ongoing] }]);
  });

  it('returns no groups for an empty list', () => {
    // given
    const items: ScheduleListItem[] = [];

    // when
    const result = groupSchedules(items, NO_FILTERS, NOW, 'en');

    // then
    expect(result).toEqual([]);
  });
});

describe('courseProgress', () => {
  it('counts the current day within the course', () => {
    // given
    const schedule = item('a', {
      startDate: day(10, 18),
      endDate: day(10, 24),
    });

    // when
    const result = courseProgress(schedule, NOW);

    // then
    expect(result).toEqual({ day: 3, total: 7 });
  });

  it('is null without both dates', () => {
    // given
    const schedule = item('a', { endDate: day(10, 24) });

    // when
    const result = courseProgress(schedule, NOW);

    // then
    expect(result).toBeNull();
  });

  it('is null before the course starts', () => {
    // given
    const schedule = item('a', {
      startDate: day(10, 22),
      endDate: day(10, 24),
    });

    // when
    const result = courseProgress(schedule, NOW);

    // then
    expect(result).toBeNull();
  });

  it('stops at the last day after the course ended', () => {
    // given
    const schedule = item('a', { startDate: day(10, 1), endDate: day(10, 5) });

    // when
    const result = courseProgress(schedule, NOW);

    // then
    expect(result).toEqual({ day: 5, total: 5 });
  });
});

describe('groupSchedules with archived products', () => {
  it('lists an archived product schedule under paused', () => {
    // given
    const items = [item('a', { productStatus: 'archived' }), item('b')];

    // when
    const result = groupSchedules(items, NO_FILTERS, NOW, 'en');

    // then
    expect(result.map((g) => [g.kind, g.items.map((i) => i.id)])).toEqual([
      ['ongoing', ['b']],
      ['paused', ['a']],
    ]);
  });

  it('matches the paused kind filter', () => {
    // given
    const items = [item('a', { productStatus: 'archived' }), item('b')];
    const filters = { ...NO_FILTERS, kind: 'paused' as const };

    // when
    const result = groupSchedules(items, filters, NOW, 'en');

    // then
    expect(result.map((g) => g.items.map((i) => i.id))).toEqual([['a']]);
  });
});
