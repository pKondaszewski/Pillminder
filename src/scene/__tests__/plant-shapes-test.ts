import { ellipsePath, ellipseRing, leafPath, spikePath } from '../plant-shapes';

describe('ellipseRing', () => {
  it('draws one closed ellipse per petal', () => {
    // when
    const ring = ellipseRing(12, 6.5, 4, 1.7);

    // then
    expect(ring.match(/Z/g)).toHaveLength(12);
  });

  it('shifts the petals by the phase', () => {
    // when
    const plain = ellipseRing(8, 3, 2, 1);
    const shifted = ellipseRing(8, 3, 2, 1, 0.5);

    // then
    expect(shifted).not.toBe(plain);
  });
});

describe('ellipsePath', () => {
  it('is one closed ellipse centred on the given point', () => {
    // when
    const path = ellipsePath(10, 20, 4, 2);

    // then
    expect(path).toBe('M6 20A4 2 0 1 0 14 20A4 2 0 1 0 6 20Z');
  });
});

describe('leafPath', () => {
  it('ends the leaf at the given length', () => {
    // when
    const path = leafPath(14);

    // then
    expect(path).toContain(' 14 0');
    expect(path.endsWith('Z')).toBe(true);
  });
});

describe('spikePath', () => {
  it('is a closed zigzag along the back of the hedgehog', () => {
    // when
    const path = spikePath();

    // then
    expect(path.startsWith('M-9 2')).toBe(true);
    expect(path.endsWith('L9 2Z')).toBe(true);
    expect(path.match(/L/g)).toHaveLength(10);
  });
});
