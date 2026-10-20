import type { SunTimes } from '../dto/sky-scene';
import {
  bodyPosition,
  isCelebration,
  shootingStarDelayMs,
  skyPhase,
  skyScene,
  stars,
} from '../sky-scene';

const SUN: SunTimes = {
  sunrise: new Date(2026, 9, 10, 6),
  sunset: new Date(2026, 9, 10, 18),
};

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 10, hours, minutes);
}

describe('skyPhase', () => {
  it.each([
    [5, 0, 'night'],
    [5, 45, 'dawn'],
    [6, 59, 'dawn'],
    [7, 0, 'day'],
    [8, 0, 'day'],
    [14, 0, 'day'],
    [16, 30, 'dusk'],
    [18, 20, 'dusk'],
    [18, 45, 'night'],
    [23, 0, 'night'],
  ])('%i:%i is %s', (hours, minutes, expected) => {
    // when
    const phase = skyPhase(at(hours, minutes), SUN);

    // then
    expect(phase).toBe(expected);
  });
});

describe('skyScene', () => {
  it('follows the sun between sunrise and sunset', () => {
    // when
    const scene = skyScene(at(12), SUN, true);

    // then
    expect(scene).toEqual({ phase: 'day', body: 'sun', progress: 0.5 });
  });

  it('shows the moon after sunset', () => {
    // when
    const scene = skyScene(at(0), SUN, true);

    // then
    expect(scene.body).toBe('moon');
    expect(scene.phase).toBe('night');
    expect(scene.progress).toBeCloseTo(0.5);
  });

  it('keeps the moon up before sunrise', () => {
    // when
    const scene = skyScene(at(5), SUN, true);

    // then
    expect(scene.body).toBe('moon');
    expect(scene.progress).toBeCloseTo(11 / 12);
  });

  it('shows a neutral daytime sky for days other than today', () => {
    // when
    const scene = skyScene(at(23), SUN, false);

    // then
    expect(scene).toEqual({ phase: 'day', body: 'sun', progress: 0.5 });
  });
});

describe('bodyPosition', () => {
  it.each([
    [0, 0.12, 0],
    [0.5, 0.5, 1],
    [1, 0.88, 0],
  ])('progress %d is at x %d and elevation %d', (progress, x, elevation) => {
    // when
    const position = bodyPosition(progress);

    // then
    expect(position.x).toBeCloseTo(x);
    expect(position.elevation).toBeCloseTo(elevation);
  });
});

describe('isCelebration', () => {
  it.each([
    ['calm', 'done', true],
    ['overdue', 'done', true],
    [null, 'done', false],
    ['done', 'done', false],
    ['calm', 'overdue', false],
  ] as const)('%s -> %s is %s', (previous, next, expected) => {
    // when
    const celebrate = isCelebration(previous, next);

    // then
    expect(celebrate).toBe(expected);
  });
});

describe('stars', () => {
  it('is deterministic', () => {
    // when
    const first = stars();
    const second = stars();

    // then
    expect(first).toEqual(second);
    expect(first).toHaveLength(14);
  });

  it('keeps every star inside the sky above the horizon', () => {
    // when
    const all = stars();

    // then
    all.forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(24);
      expect(y).toBeLessThan(160);
    });
  });

  it('twinkles in whole cycles so the loop has no seam', () => {
    // when
    const all = stars();

    // then
    all.forEach(({ cycles }) => expect(Number.isInteger(cycles)).toBe(true));
  });
});

describe('shootingStarDelayMs', () => {
  it('maps the random value to a delay between 6 and 15 seconds', () => {
    // when
    const delays = [0, 0.5, 1].map(shootingStarDelayMs);

    // then
    expect(delays).toEqual([6000, 10500, 15000]);
  });
});
