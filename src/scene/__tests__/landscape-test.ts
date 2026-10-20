import { grassPath, hillPath, type HillSpec } from '../landscape';

const HILL: HillSpec = { baseY: 200, amplitude: 10, phase: 1, bottomY: 300 };
const HILL_AMPLITUDE_LIMIT = 10 * 1.35;

describe('hillPath', () => {
  it('is a closed shape from the left edge to past the right edge', () => {
    // when
    const path = hillPath(100, HILL);

    // then
    expect(path.startsWith('M0 300L0.0 ')).toBe(true);
    expect(path.endsWith('108.0 300Z')).toBe(true);
  });

  it('keeps the ridge within the amplitude around the base line', () => {
    // when
    const path = hillPath(600, HILL);

    // then
    const ridge = [...path.matchAll(/L[\d.]+ ([\d.]+)/g)]
      .map((match) => Number(match[1]))
      .slice(0, -1);
    ridge.forEach((y) => {
      expect(y).toBeGreaterThanOrEqual(200 - HILL_AMPLITUDE_LIMIT);
      expect(y).toBeLessThanOrEqual(200 + HILL_AMPLITUDE_LIMIT);
    });
  });
});

describe('grassPath', () => {
  it('draws one closed triangle per blade', () => {
    // when
    const path = grassPath(300, 250, 20, 12, 7);

    // then
    expect(path.match(/Z/g)).toHaveLength(12);
  });

  it('is deterministic for the same seed and differs between seeds', () => {
    // when
    const first = grassPath(300, 250, 20, 12, 7);
    const again = grassPath(300, 250, 20, 12, 7);
    const other = grassPath(300, 250, 20, 12, 8);

    // then
    expect(again).toBe(first);
    expect(other).not.toBe(first);
  });
});
