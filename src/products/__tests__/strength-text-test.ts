import { normalizeStrength } from '../strength-text';

describe('normalizeStrength', () => {
  it.each([
    ['5mg', '5 mg'],
    ['5 mg', '5 mg'],
    ['  5MG ', '5 mg'],
    ['2g', '2 g'],
    ['50ug', '50 µg'],
    ['50 mcg', '50 µg'],
    ['50μg', '50 µg'],
    ['50µg', '50 µg'],
    ['1000iu', '1000 IU'],
    ['1000 j.m.', '1000 IU'],
    ['1000jm', '1000 IU'],
    ['10ml', '10 ml'],
    ['5%', '5%'],
    ['5 %', '5%'],
  ])('normalizes %s to %s', (input, expected) => {
    // when
    const result = normalizeStrength(input);

    // then
    expect(result).toBe(expected);
  });

  it('keeps the decimal separator as typed', () => {
    // when
    const comma = normalizeStrength('2,5mg');
    const dot = normalizeStrength('2.5mg');

    // then
    expect(comma).toBe('2,5 mg');
    expect(dot).toBe('2.5 mg');
  });

  it('normalizes each part of a combination', () => {
    // when
    const sum = normalizeStrength('50ug + 10mg');
    const ratio = normalizeStrength('5mg/ml');
    const perAmount = normalizeStrength('5mg/5ml');

    // then
    expect(sum).toBe('50 µg + 10 mg');
    expect(ratio).toBe('5 mg/ml');
    expect(perAmount).toBe('5 mg/5 ml');
  });

  it.each(['', 'forte', '2 tabletki', '5 gel', 'B12', '10 mgx'])(
    'leaves %j unchanged',
    (input) => {
      // when
      const result = normalizeStrength(input);

      // then
      expect(result).toBe(input);
    },
  );
});
