import { adjustWholeNumberText, parseWholeNumber } from '../whole-number-input';

describe('parseWholeNumber', () => {
  it('treats blank text as no value', () => {
    // given
    const text = '  ';

    // when
    const result = parseWholeNumber(text, 1);

    // then
    expect(result).toEqual({ valid: true, value: null });
  });

  it('parses a whole number, ignoring surrounding spaces', () => {
    // given
    const text = ' 30 ';

    // when
    const result = parseWholeNumber(text, 1);

    // then
    expect(result).toEqual({ valid: true, value: 30 });
  });

  it('accepts the minimum itself', () => {
    // given
    const text = '0';

    // when
    const result = parseWholeNumber(text, 0);

    // then
    expect(result).toEqual({ valid: true, value: 0 });
  });

  it('rejects a number below the minimum', () => {
    // given
    const text = '0';

    // when
    const result = parseWholeNumber(text, 1);

    // then
    expect(result).toEqual({ valid: false });
  });

  it.each([
    '-5',
    '2.5',
    '12,50',
    '3o',
    '12 zł',
    '1e1',
    '0x10',
    'abc',
    '9'.repeat(20),
  ])('rejects %s', (text) => {
    // when
    const result = parseWholeNumber(text, 0);

    // then
    expect(result).toEqual({ valid: false });
  });
});

describe('adjustWholeNumberText', () => {
  it.each([
    ['5', 1, '6'],
    ['', 1, '1'],
    ['0', -1, '0'],
    ['12', -5, '7'],
    ['abc', 1, 'abc'],
  ])('moves "%s" by %s to "%s"', (text, delta, expected) => {
    // when
    const result = adjustWholeNumberText(text, delta);

    // then
    expect(result).toBe(expected);
  });
});
