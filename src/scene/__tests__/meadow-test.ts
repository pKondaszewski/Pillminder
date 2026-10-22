import type { MeadowMark } from '../dto/meadow';
import {
  basketSlot,
  creatureSlot,
  markSpacing,
  meadowEvents,
  meadowSlot,
  plantGrowth,
} from '../meadow';
import { GROUND_Y } from '../scene-geometry';

const WIDTH = 360;

function mark(overrides: Partial<MeadowMark> = {}): MeadowMark {
  return {
    id: 'a',
    position: 0.5,
    status: 'planned',
    size: 1,
    remaining: 1,
    taken: 0,
    label: 'a',
    ...overrides,
  };
}

describe('meadowSlot', () => {
  it('maps the 06-24 axis onto the meadow with side margins', () => {
    // when
    const start = meadowSlot(0, 0, WIDTH);
    const end = meadowSlot(1, 0, WIDTH);

    // then
    expect(start.x).toBeCloseTo(0.07 * WIDTH);
    expect(end.x).toBeCloseTo(0.85 * WIDTH);
  });

  it('staggers neighbouring marks vertically', () => {
    // when
    const even = meadowSlot(0.5, 0, WIDTH);
    const odd = meadowSlot(0.5, 1, WIDTH);

    // then
    expect(even.y).toBe(GROUND_Y + 14);
    expect(odd.y).toBe(GROUND_Y + 23);
  });
});

describe('basketSlot', () => {
  it('sits at the right edge of the meadow', () => {
    // when
    const basket = basketSlot(WIDTH);

    // then
    expect(basket).toEqual({ x: 330, y: GROUND_Y + 24 });
  });
});

describe('creatureSlot', () => {
  it('starts off-screen on the left and arrives at the current hour', () => {
    // when
    const start = creatureSlot(0.5, WIDTH, 0);
    const arrived = creatureSlot(0.5, WIDTH, 1);

    // then
    expect(start.x).toBe(-20);
    expect(arrived.x).toBeCloseTo(meadowSlot(0.5, 0, WIDTH).x);
  });
});

describe('markSpacing', () => {
  it('is the touch size as a share of the meadow width', () => {
    // when
    const spacing = markSpacing(WIDTH);

    // then
    expect(spacing).toBeCloseTo(44 / (0.78 * WIDTH));
  });
});

describe('plantGrowth', () => {
  it.each([
    [0, 0, 0],
    [1, 0, 1],
    [0.5, 0, 0.8],
    [0.5, 5, 0.2],
    [0.1, 5, 0],
  ])('entry %d for mark %i grows to %d', (entry, index, expected) => {
    // when
    const growth = plantGrowth(entry, index);

    // then
    expect(growth).toBeCloseTo(expected);
  });
});

describe('meadowEvents', () => {
  it('has nothing to compare on the first render', () => {
    // when
    const events = meadowEvents(null, [mark({ status: 'taken', taken: 1 })], 0);

    // then
    expect(events).toEqual([]);
  });

  it('flies a mark that has just been fully taken', () => {
    // given
    const before = [mark()];
    const after = [mark({ status: 'taken', taken: 1 })];

    // when
    const events = meadowEvents(before, after, 7);

    // then
    expect(events).toEqual([{ key: 7, markId: 'a', flies: true }]);
  });

  it('only sparks when part of a group was taken', () => {
    // given
    const before = [mark({ size: 3 })];
    const after = [mark({ size: 3, taken: 1 })];

    // when
    const events = meadowEvents(before, after, 0);

    // then
    expect(events).toEqual([{ key: 0, markId: 'a', flies: false }]);
  });

  it.each([
    ['taken back', mark({ status: 'taken', taken: 1 }), mark()],
    ['unchanged', mark({ taken: 1 }), mark({ taken: 1 })],
  ])('ignores a mark that was %s', (_, before, after) => {
    // when
    const events = meadowEvents([before], [after], 0);

    // then
    expect(events).toEqual([]);
  });

  it('ignores marks that appeared since the last render', () => {
    // when
    const events = meadowEvents([], [mark({ status: 'taken', taken: 1 })], 0);

    // then
    expect(events).toEqual([]);
  });

  it('numbers several events in a row', () => {
    // given
    const before = [mark({ id: 'a' }), mark({ id: 'b' })];
    const after = [
      mark({ id: 'a', status: 'taken', taken: 1 }),
      mark({ id: 'b', status: 'taken', taken: 1 }),
    ];

    // when
    const events = meadowEvents(before, after, 10);

    // then
    expect(events.map(({ key }) => key)).toEqual([10, 11]);
  });
});
