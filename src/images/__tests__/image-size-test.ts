import { needsShrinking, resizeTarget } from '../image-size';

describe('resizeTarget', () => {
  it('limits the width of a landscape photo', () => {
    // given
    const width = 4000;
    const height = 3000;

    // when
    const result = resizeTarget(width, height);

    // then
    expect(result).toEqual({ width: 1920 });
  });

  it('limits the height of a portrait photo', () => {
    // given
    const width = 3000;
    const height = 4000;

    // when
    const result = resizeTarget(width, height);

    // then
    expect(result).toEqual({ height: 1920 });
  });

  it('limits the width of a square photo', () => {
    // given
    const side = 3000;

    // when
    const result = resizeTarget(side, side);

    // then
    expect(result).toEqual({ width: 1920 });
  });

  it('does not upscale a photo that fits', () => {
    // given
    const width = 1920;
    const height = 1080;

    // when
    const result = resizeTarget(width, height);

    // then
    expect(result).toBeNull();
  });
});

describe('needsShrinking', () => {
  it('shrinks a file at the threshold or over it', () => {
    // given
    const sizes = [2 * 1024 * 1024, 8 * 1024 * 1024];

    // when
    const results = sizes.map(needsShrinking);

    // then
    expect(results).toEqual([true, true]);
  });

  it('leaves a file under the threshold alone', () => {
    // given
    const size = 600 * 1024;

    // when
    const result = needsShrinking(size);

    // then
    expect(result).toBe(false);
  });
});
