import { makeParticles } from '../weather-particles';

describe('makeParticles', () => {
  it('creates the requested number of particles inside the unit square', () => {
    // when
    const particles = makeParticles(7, 42);

    // then
    expect(particles).toHaveLength(42);
    particles.forEach(({ x, y, size, offset }) => {
      [x, y, size, offset].forEach((value) => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      });
    });
  });

  it('is deterministic and differs between seeds', () => {
    // when
    const first = makeParticles(7, 10);
    const again = makeParticles(7, 10);
    const other = makeParticles(8, 10);

    // then
    expect(again).toEqual(first);
    expect(other).not.toEqual(first);
  });

  it('loops in whole cycles so the animation has no seam', () => {
    // when
    const particles = makeParticles(11, 30);

    // then
    particles.forEach(({ cycles }) => {
      expect(Number.isInteger(cycles)).toBe(true);
      expect(cycles).toBeGreaterThanOrEqual(2);
    });
  });
});
