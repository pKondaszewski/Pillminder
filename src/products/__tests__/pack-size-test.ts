import { parsePackSize } from '../pack-size';

describe('parsePackSize', () => {
  it('treats blank text as no pack size', () => {
    // given
    const text = '  ';

    // when
    const result = parsePackSize(text);

    // then
    expect(result).toEqual({ valid: true, packSize: null });
  });

  it('parses a positive integer', () => {
    // given
    const text = ' 30 ';

    // when
    const result = parsePackSize(text);

    // then
    expect(result).toEqual({ valid: true, packSize: 30 });
  });

  it.each(['0', '-5', '2.5', 'abc', '1e1x'])('rejects %s', (text) => {
    // when
    const result = parsePackSize(text);

    // then
    expect(result).toEqual({ valid: false });
  });
});
