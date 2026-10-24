import type { AdherenceDose } from '../dose-adherence';
import { buildRecentDays, recentDaysRange, STRIP_DAYS } from '../dose-strip';

const NOW = new Date(2026, 9, 18, 12, 0);

function dose(plannedAt: Date, state: AdherenceDose['state']): AdherenceDose {
  return { plannedAt, state };
}

describe('recentDaysRange', () => {
  it('covers the last 14 calendar days up to the end of today', () => {
    // when
    const { from, to } = recentDaysRange(NOW);

    // then
    expect(from).toEqual(new Date(2026, 9, 5));
    expect(to).toEqual(new Date(2026, 9, 19));
  });
});

describe('buildRecentDays', () => {
  it('lists 14 days from the oldest to today', () => {
    // when
    const { days } = buildRecentDays([], NOW);

    // then
    expect(days).toHaveLength(STRIP_DAYS);
    expect(days[0].day).toEqual(new Date(2026, 9, 5));
    expect(days[13].day).toEqual(new Date(2026, 9, 18));
  });

  it('gives each day the status of its doses', () => {
    // given
    const doses = [
      dose(new Date(2026, 9, 16, 8), 'taken'),
      dose(new Date(2026, 9, 17, 8), 'skipped'),
      dose(new Date(2026, 9, 18, 8), 'pending'),
      dose(new Date(2026, 9, 18, 20), 'pending'),
    ];

    // when
    const { days } = buildRecentDays(doses, NOW);

    // then
    expect(days.slice(10).map((d) => d.status)).toEqual([
      'none',
      'allTaken',
      'skipped',
      'missed',
    ]);
  });

  it('counts only doses inside the 14 days', () => {
    // given
    const doses = [
      dose(new Date(2026, 9, 4, 8), 'taken'),
      dose(new Date(2026, 9, 5, 8), 'taken'),
      dose(new Date(2026, 9, 17, 8), 'skipped'),
      dose(new Date(2026, 9, 18, 8), 'pending'),
      dose(new Date(2026, 9, 18, 20), 'pending'),
    ];

    // when
    const { counts } = buildRecentDays(doses, NOW);

    // then
    expect(counts).toMatchObject({
      taken: 1,
      skipped: 1,
      missed: 1,
      upcoming: 1,
    });
  });
});
