import type { Translate } from '@/config/translate';

import type { Schedule } from '../schedule-repository';
import {
  describeAmount,
  describeCourse,
  describeDays,
  describeRhythm,
} from '../schedule-rhythm';

const PL: Record<string, string> = {
  'schedule.daily': 'Codziennie',
  'schedule.everyXDays': 'Co {{days}} dni',
  'schedule.cycleDays': '{{count}} dni',
  'schedule.cycleWeeks': '{{count}} tyg.',
  'schedule.cycleOnOff': '{{on}} stosowania / {{off}} przerwy',
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
    cycle: null,
    cycleAnchor: null,
    cyclePausedDays: 0,
    timesOfDay: ['08:00'],
    quantity: 1,
    steps: null,
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

describe('describeDays with a cycle', () => {
  const cycleOf = (
    onDays: number,
    offDays: number,
    unit: 'days' | 'weeks',
  ) => ({
    intervalDays: 1,
    weekdays: null,
    cycle: { onDays, offDays, unit },
  });

  it('reads a cycle in days without the daily prefix', () => {
    // given
    const rhythm = cycleOf(21, 7, 'days');

    // when
    const result = describeDays(rhythm, t, MONDAY);

    // then
    expect(result).toBe('21 dni stosowania / 7 dni przerwy');
  });

  it('reads a cycle entered in weeks back as weeks', () => {
    // given
    const rhythm = cycleOf(56, 28, 'weeks');

    // when
    const result = describeDays(rhythm, t, MONDAY);

    // then
    expect(result).toBe('8 tyg. stosowania / 4 tyg. przerwy');
  });

  it('puts the weekdays before the cycle', () => {
    // given
    const rhythm = { ...cycleOf(56, 28, 'weeks'), weekdays: [6, 0] };

    // when
    const result = describeDays(rhythm, t, MONDAY);

    // then
    expect(result).toBe('So, Nd · 8 tyg. stosowania / 4 tyg. przerwy');
  });
});

describe('describeAmount', () => {
  const texts: Record<string, string> = {
    'schedule.stepDays': '{{count}} dni',
    'schedule.taperStops': '{{from}} → {{to}} w ciągu {{days}}',
    'schedule.taperStays': '{{from}} → {{to}} od dnia {{day}}',
    'unit.tablet': '{{count}} tabl.',
  };
  const tt: Translate = (key, options = {}) =>
    Object.entries(options).reduce(
      (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
      texts[key] ?? key,
    );
  const prednisone = [
    { days: 3, quantity: 4 },
    { days: 3, quantity: 3 },
    { days: 3, quantity: 2 },
    { days: 3, quantity: 1 },
  ];
  const rampUp = [
    { days: 7, quantity: 1 },
    { days: null, quantity: 2 },
  ];

  it('reads a stopping taper from the first to the last quantity', () => {
    // when
    const result = describeAmount(5, prednisone, 'tablet', tt);

    // then
    expect(result).toBe('4 tabl. → 1 tabl. w ciągu 12 dni');
  });

  it('reads an open-ended taper with the day the last quantity starts', () => {
    // when
    const result = describeAmount(5, rampUp, 'tablet', tt);

    // then
    expect(result).toBe('1 tabl. → 2 tabl. od dnia 8');
  });

  it('shows plain numbers for a product without a unit', () => {
    // when
    const result = describeAmount(5, prednisone, null, tt);

    // then
    expect(result).toBe('4 → 1 w ciągu 12 dni');
  });

  it('reads a flat quantity as the bare amount with the unit', () => {
    // when
    const result = describeAmount(2, null, 'tablet', tt);

    // then
    expect(result).toBe('2 tabl.');
  });

  it('reads a flat quantity as the bare number without a unit', () => {
    // when
    const result = describeAmount(3, null, null, tt);

    // then
    expect(result).toBe('3');
  });

  it('replaces the quantity in the whole rhythm description', () => {
    // given
    const tapered = schedule({ steps: rampUp, quantity: 5 });

    // when
    const result = describeRhythm(
      tapered,
      tt,
      formatDate,
      null,
      NOW,
      joinTimes,
      MONDAY,
    );

    // then
    expect(result).toBe('schedule.daily · 08:00 · 1 → 2 od dnia 8');
  });
});
