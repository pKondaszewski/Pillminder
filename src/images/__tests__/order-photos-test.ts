import type { ProductImage } from '../image-repository';
import { orderPhotos } from '../order-photos';

function image(id: string, createdAt: number): ProductImage {
  return {
    id,
    productId: 'p1',
    fileName: `${id}.jpg`,
    role: 'box',
    createdAt: new Date(createdAt),
  };
}

describe('orderPhotos', () => {
  it('puts the profile photo first and the rest in the order of adding', () => {
    // given
    const images = [image('c', 3000), image('a', 1000), image('b', 2000)];

    // when
    const result = orderPhotos(images, 'b');

    // then
    expect(result.map((i) => i.id)).toEqual(['b', 'a', 'c']);
  });

  it('orders by age when no photo is the profile', () => {
    // given
    const images = [image('b', 2000), image('a', 1000)];

    // when
    const result = orderPhotos(images, null);

    // then
    expect(result.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('ignores a profile id that matches no photo', () => {
    // given
    const images = [image('b', 2000), image('a', 1000)];

    // when
    const result = orderPhotos(images, 'gone');

    // then
    expect(result.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('keeps the original order of photos added in the same second', () => {
    // given
    const images = [image('a', 1000), image('b', 1000), image('c', 1000)];

    // when
    const result = orderPhotos(images, null);

    // then
    expect(result.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the input', () => {
    // given
    const images = [image('b', 2000), image('a', 1000)];

    // when
    orderPhotos(images, 'b');

    // then
    expect(images.map((i) => i.id)).toEqual(['b', 'a']);
  });
});
