import { parseWholeNumber } from '../whole-number-input';

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
