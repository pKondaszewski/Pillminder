import type { Translate } from '@/config/translate';

import type { Schedule } from '../schedule-repository';
import { describeCourse, describeRhythm } from '../schedule-rhythm';

const PL: Record<string, string> = {
  'schedule.daily': 'Codziennie',
  'schedule.everyXDays': 'Co {{days}} dni',
  'schedule.weeklyOn': 'Co tydzień: {{day}}',
  'calendar.weekday.mon': 'Pn',
  'calendar.weekday.wed': 'Śr',
  'calendar.weekday.fri': 'Pt',
  'calendar.weekday.sat': 'So',
  'calendar.weekday.sun': 'Nd',
  'schedule.quantityValue': '{{count}} na dawkę',
  'schedule.periodRange': '{{from}} – {{to}}',
  'schedule.periodFrom': 'od {{date}}',
  'schedule.periodUntil': 'do {{date}}',
  'schedule.courseDay': 'Dzień {{day}} z {{total}}',
  'schedule.paused': 'Wstrzymany',
  'schedule.pausedUntil': 'Wstrzymany do {{date}}',
};

const t: Translate = (key, options = {}) =>
  Object.entries(options).reduce(
    (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
    PL[key] ?? key,
  );
const MONDAY = 1;
const NOW = new Date(2026, 0, 10, 12, 0);
const joinTimes = (times: string[]) => times.join(', ');
const formatDate = (date: Date) => date.toISOString().slice(0, 10);

function schedule(overrides: Partial<Schedule>): Schedule {
  return {
    id: 'schedule-1',
    productId: 'product-1',
    intervalDays: 1,
    weekdays: null,
    timesOfDay: ['08:00'],
    quantity: 1,
    startDate: null,
    endDate: null,
    pausedAt: null,
    resumeAt: null,
    ...overrides,
  };
}

describe('describeRhythm', () => {
  it('lists the weekdays with the times', () => {
    // given
    const input = schedule({ weekdays: [0, 6], timesOfDay: ['09:00'] });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      NOW,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe('So, Nd · 09:00');
  });

  it('puts Sunday first when the week starts on Sunday', () => {
    // given
    const input = schedule({ weekdays: [6, 0, 3], timesOfDay: ['09:00'] });

    // when
    const text = describeRhythm(input, t, formatDate, null, NOW, joinTimes, 0);

    // then
    expect(text).toBe('Nd, Śr, So · 09:00');
  });

  it('names the day of a once-a-week schedule', () => {
    // given
    const input = schedule({ weekdays: [1] });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      NOW,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe('Co tydzień: Pn · 08:00');
  });

  it('calls a schedule with all seven days daily', () => {
    // given
    const input = schedule({ weekdays: [0, 1, 2, 3, 4, 5, 6] });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      NOW,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe('Codziennie · 08:00');
  });

  it('describes a daily schedule with several times', () => {
    // given
    const input = schedule({ timesOfDay: ['08:00', '20:00'] });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      NOW,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe('Codziennie · 08:00, 20:00');
  });

  it('describes an every-X-days schedule with quantity', () => {
    // given
    const input = schedule({
      intervalDays: 3,
      timesOfDay: ['09:00'],
      quantity: 2,
    });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      NOW,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe('Co 3 dni · 09:00 · 2 na dawkę');
  });

  it.each([
    [new Date('2026-01-01'), new Date('2026-02-01'), '2026-01-01 – 2026-02-01'],
    [new Date('2026-01-01'), null, 'od 2026-01-01'],
    [null, new Date('2026-02-01'), 'do 2026-02-01'],
  ])('appends the period %#', (startDate, endDate, period) => {
    // given
    const input = schedule({ startDate, endDate });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      NOW,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe(`Codziennie · 08:00 · ${period}`);
  });

  it('prefixes a schedule paused without a resume date', () => {
    // given
    const now = new Date(2026, 4, 10, 12);
    const input = schedule({
      pausedAt: new Date(2026, 4, 8, 9),
      resumeAt: null,
    });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      now,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe('Wstrzymany · Codziennie · 08:00');
  });

  it('prefixes a paused schedule with its resume date', () => {
    // given
    const now = new Date(2026, 4, 10, 12);
    const resumeAt = new Date('2026-05-20T00:00:00Z');
    const input = schedule({ pausedAt: new Date(2026, 4, 8, 9), resumeAt });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      now,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe('Wstrzymany do 2026-05-20 · Codziennie · 08:00');
  });

  it('shows no pause marker once the resume date has passed', () => {
    // given
    const now = new Date(2026, 4, 10, 12);
    const input = schedule({
      pausedAt: new Date(2026, 4, 1, 9),
      resumeAt: new Date(2026, 4, 5),
    });

    // when
    const text = describeRhythm(
      input,
      t,
      formatDate,
      null,
      now,
      joinTimes,
      MONDAY,
    );

    // then
    expect(text).toBe('Codziennie · 08:00');
  });
});

describe('describeCourse', () => {
  it('combines the day of the course with the end date', () => {
    // given
    const progress = { day: 3, total: 7 };
    const endDate = new Date(2026, 0, 16);

    // when
    const result = describeCourse(progress, endDate, t, formatDate);

    // then
    expect(result).toBe(`Dzień 3 z 7 · do ${formatDate(endDate)}`);
  });

  it('shows only the end date before the course starts', () => {
    // given
    const endDate = new Date(2026, 0, 16);

    // when
    const result = describeCourse(null, endDate, t, formatDate);

    // then
    expect(result).toBe(`do ${formatDate(endDate)}`);
  });
});
