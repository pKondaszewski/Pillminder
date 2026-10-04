import {
  describeRhythm,
  type RhythmText,
  type Translate,
} from '../schedule-rhythm';

const PL: Record<string, string> = {
  'schedule.daily': 'Codziennie',
  'schedule.everyXDays': 'Co {{days}} dni',
  'schedule.quantityValue': '{{count}} na dawkę',
  'schedule.periodRange': '{{from}} – {{to}}',
  'schedule.periodFrom': 'od {{date}}',
  'schedule.periodUntil': 'do {{date}}',
};

const t: Translate = (key, options = {}) =>
  Object.entries(options).reduce(
    (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
    PL[key] ?? key,
  );
const formatDate = (date: Date) => date.toISOString().slice(0, 10);

function schedule(overrides: Partial<RhythmText>): RhythmText {
  return {
    intervalDays: 1,
    timesOfDay: ['08:00'],
    quantity: 1,
    startDate: null,
    endDate: null,
    ...overrides,
  };
}

describe('describeRhythm', () => {
  it('describes a daily schedule with several times', () => {
    // given
    const input = schedule({ timesOfDay: ['08:00', '20:00'] });

    // when
    const text = describeRhythm(input, t, formatDate);

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
    const text = describeRhythm(input, t, formatDate);

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
    const text = describeRhythm(input, t, formatDate);

    // then
    expect(text).toBe(`Codziennie · 08:00 · ${period}`);
  });
});
