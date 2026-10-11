import {
  firstWeekdayOf,
  monthGridDays,
  splitIntoWeeks,
  weekdayKeysFrom,
} from '../calendar-grid';
import { isoDay } from '../date-utils';

const SUNDAY = 0;
const MONDAY = 1;

describe('monthGridDays', () => {
  it('pads a month to full weeks starting on Monday', () => {
    // given
    const october2026 = new Date(2026, 9, 15);

    // when
    const days = monthGridDays(october2026, MONDAY).map(isoDay);

    // then
    expect(days).toHaveLength(35);
    expect(days[0]).toBe('2026-09-28');
    expect(days[34]).toBe('2026-11-01');
  });

  it('pads a month to full weeks starting on Sunday', () => {
    // given
    const october2026 = new Date(2026, 9, 1);

    // when
    const days = monthGridDays(october2026, SUNDAY).map(isoDay);

    // then
    expect(days).toHaveLength(35);
    expect(days[0]).toBe('2026-09-27');
    expect(days[34]).toBe('2026-10-31');
  });

  it('adds no padding when the month fills whole weeks', () => {
    // given
    const february2027 = new Date(2027, 1, 10);

    // when
    const days = monthGridDays(february2027, MONDAY).map(isoDay);

    // then
    expect(days).toHaveLength(28);
    expect(days[0]).toBe('2027-02-01');
    expect(days[27]).toBe('2027-02-28');
  });

  it('spans six weeks when the month needs them', () => {
    // given
    const august2026 = new Date(2026, 7, 1);

    // when
    const days = monthGridDays(august2026, MONDAY);

    // then
    expect(days).toHaveLength(42);
  });
});

describe('firstWeekdayOf', () => {
  it('starts weeks on Monday in Polish and on Sunday in English', () => {
    // when
    const pl = firstWeekdayOf('pl');
    const en = firstWeekdayOf('en');

    // then
    expect(pl).toBe(MONDAY);
    expect(en).toBe(SUNDAY);
  });
});

describe('weekdayKeysFrom', () => {
  it('rotates weekday keys to start on the given weekday', () => {
    // when
    const keys = weekdayKeysFrom(MONDAY);

    // then
    expect(keys).toEqual(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
  });
});

describe('splitIntoWeeks', () => {
  it('splits grid days into rows of seven', () => {
    // given
    const days = monthGridDays(new Date(2026, 9, 15), MONDAY);

    // when
    const weeks = splitIntoWeeks(days);

    // then
    expect(weeks).toHaveLength(5);
    expect(weeks.every((week) => week.length === 7)).toBe(true);
  });
});
