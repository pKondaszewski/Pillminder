import { mixColors, withAlpha } from '../color';

describe('mixColors', () => {
  it('returns the endpoints at share 0 and 1', () => {
    // when
    const start = mixColors('#102030', '#F0E0D0', 0);
    const end = mixColors('#102030', '#F0E0D0', 1);

    // then
    expect(start).toBe('#102030');
    expect(end).toBe('#f0e0d0');
  });

  it('blends channel by channel', () => {
    // when
    const mixed = mixColors('#000000', '#FFFFFF', 0.5);

    // then
    expect(mixed).toBe('#808080');
  });

  it('accepts short hex and rgb() colors', () => {
    // when
    const mixed = mixColors('#fff', 'rgb(0, 0, 0)', 0.5);

    // then
    expect(mixed).toBe('#808080');
  });
});

describe('withAlpha', () => {
  it.each([
    ['#FF8000', 'rgba(255,128,0,0.4)'],
    ['#F80', 'rgba(255,136,0,0.4)'],
    ['#FF800033', 'rgba(255,128,0,0.4)'],
    ['rgba(255,128,0,0.9)', 'rgba(255,128,0,0.4)'],
  ])('replaces the alpha of %s', (color, expected) => {
    // when
    const result = withAlpha(color, 0.4);

    // then
    expect(result).toBe(expected);
  });

  it('rejects colors it cannot read', () => {
    // when
    const convert = () => withAlpha('tomato', 0.4);

    // then
    expect(convert).toThrow('Unsupported color: tomato');
  });
});
