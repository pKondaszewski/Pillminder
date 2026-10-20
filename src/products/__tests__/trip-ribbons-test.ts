import type { TravelPlanEntry } from '../dto/travel-plan-output';
import { MAX_RIBBON_ROWS, tripRibbons } from '../trip-ribbons';

function entry(overrides: Partial<TravelPlanEntry> & { id: string }) {
  return {
    name: overrides.id,
    title: overrides.id,
    pack: '1 szt.',
    verdict: 'enough',
    runOutOffsetDays: 30,
    ...overrides,
  } as TravelPlanEntry;
}

describe('tripRibbons', () => {
  it('cuts a long-lasting stock off a few days after the return', () => {
    // given
    const entries = [entry({ id: 'a', runOutOffsetDays: 30 })];

    // when
    const { ribbons } = tripRibbons(entries, 8);

    // then
    expect(ribbons).toEqual([
      { id: 'a', name: 'a', warning: false, endDay: 11, runsOutDay: null },
    ]);
  });

  it('marks the run-out day only when the stock ends during the trip', () => {
    // given
    const entries = [
      entry({
        id: 'during',
        verdict: 'runsOutDuringTrip',
        runOutOffsetDays: 4.5,
      }),
      entry({
        id: 'after',
        verdict: 'runsOutAfterReturn',
        runOutOffsetDays: 10,
      }),
    ];

    // when
    const { ribbons } = tripRibbons(entries, 8);

    // then
    expect(
      ribbons.map(({ id, warning, endDay, runsOutDay }) => [
        id,
        warning,
        endDay,
        runsOutDay,
      ]),
    ).toEqual([
      ['during', true, 4.5, 4.5],
      ['after', true, 10, null],
    ]);
  });

  it('draws a full-length ribbon when the stock never runs out', () => {
    // given
    const entries = [entry({ id: 'a', runOutOffsetDays: null })];

    // when
    const { ribbons } = tripRibbons(entries, 5);

    // then
    expect(ribbons[0].endDay).toBe(8);
  });

  it('keeps a stock that ran out before departure at the start of the road', () => {
    // given
    const entries = [
      entry({ id: 'a', verdict: 'runsOutDuringTrip', runOutOffsetDays: -2 }),
    ];

    // when
    const { ribbons } = tripRibbons(entries, 5);

    // then
    expect(ribbons[0]).toMatchObject({ endDay: 0, runsOutDay: 0 });
  });

  it('skips products without a tracked stock', () => {
    // given
    const entries = [
      entry({ id: 'a', verdict: null, runOutOffsetDays: null }),
      entry({ id: 'b' }),
    ];

    // when
    const { ribbons, hiddenCount } = tripRibbons(entries, 8);

    // then
    expect(ribbons.map(({ id }) => id)).toEqual(['b']);
    expect(hiddenCount).toBe(0);
  });

  it('shows the at-risk products first and folds the rest into a counter', () => {
    // given
    const entries = [
      ...['a', 'b', 'c', 'd'].map((id) => entry({ id })),
      entry({ id: 'risk', verdict: 'runsOutAfterReturn', runOutOffsetDays: 9 }),
    ];

    // when
    const result = tripRibbons(entries, 8);

    // then
    expect(result.ribbons).toHaveLength(MAX_RIBBON_ROWS);
    expect(result.ribbons[0].id).toBe('risk');
    expect(result.hiddenCount).toBe(1);
    expect(result.hiddenAreAllEnough).toBe(true);
  });

  it('keeps the earliest run-outs when even the at-risk ones do not fit', () => {
    // given
    const entries = [9, 3, 7, 5, 1, 8].map((day) =>
      entry({
        id: `d${day}`,
        verdict: 'runsOutDuringTrip',
        runOutOffsetDays: day,
      }),
    );

    // when
    const result = tripRibbons(entries, 10);

    // then
    expect(result.ribbons.map(({ id }) => id)).toEqual([
      'd1',
      'd3',
      'd5',
      'd7',
    ]);
    expect(result.hiddenCount).toBe(2);
    expect(result.hiddenAreAllEnough).toBe(false);
  });
});
