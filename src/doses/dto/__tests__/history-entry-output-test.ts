import type { Dose } from '../../dose-repository';
import { toHistoryEntries, toHistoryEntry } from '../history-entry-output';

const PLANNED = new Date(2026, 9, 4, 9, 0);

function dose(overrides: Partial<Dose>): Dose {
  return {
    id: 'dose-1',
    plannedAt: PLANNED,
    takenAt: null,
    state: 'pending',
    ...overrides,
  } as Dose;
}

describe('toHistoryEntry occurredAt', () => {
  it('uses takenAt for a taken dose', () => {
    // given
    const takenAt = new Date(2026, 9, 5, 0, 15);

    // when
    const entry = toHistoryEntry(dose({ state: 'taken', takenAt }));

    // then
    expect(entry.occurredAt).toEqual(takenAt);
    expect(entry.status).toBe('taken');
  });

  it('uses plannedAt for a taken dose without takenAt', () => {
    // given
    const taken = dose({ state: 'taken', takenAt: null });

    // when
    const entry = toHistoryEntry(taken);

    // then
    expect(entry.occurredAt).toEqual(PLANNED);
  });

  it('uses plannedAt for a skipped dose', () => {
    // given
    const skipped = dose({ state: 'skipped' });

    // when
    const entry = toHistoryEntry(skipped);

    // then
    expect(entry.occurredAt).toEqual(PLANNED);
    expect(entry.status).toBe('skipped');
  });

  it('uses plannedAt for a past pending dose', () => {
    // given
    const pending = dose({ state: 'pending' });

    // when
    const entry = toHistoryEntry(pending);

    // then
    expect(entry.occurredAt).toEqual(PLANNED);
    expect(entry.status).toBe('skipped');
  });
});

describe('toHistoryEntries', () => {
  it('puts a dose taken later above the next planned one', () => {
    // given
    const lateTaken = dose({
      id: 'a',
      plannedAt: new Date(2026, 9, 4, 9, 0),
      state: 'taken',
      takenAt: new Date(2026, 9, 4, 22, 0),
    });
    const nextPlanned = dose({
      id: 'b',
      plannedAt: new Date(2026, 9, 4, 21, 0),
      state: 'skipped',
    });

    // when
    const ids = toHistoryEntries([nextPlanned, lateTaken]).map((e) => e.id);

    // then
    expect(ids).toEqual(['a', 'b']);
  });

  it('breaks ties by plannedAt and then id, descending', () => {
    // given
    const at = new Date(2026, 9, 4, 12, 0);
    const doses = [
      dose({
        id: 'a',
        plannedAt: new Date(2026, 9, 4, 8, 0),
        state: 'taken',
        takenAt: at,
      }),
      dose({
        id: 'b',
        plannedAt: new Date(2026, 9, 4, 10, 0),
        state: 'taken',
        takenAt: at,
      }),
      dose({
        id: 'c',
        plannedAt: new Date(2026, 9, 4, 10, 0),
        state: 'taken',
        takenAt: at,
      }),
    ];

    // when
    const ids = toHistoryEntries(doses).map((e) => e.id);

    // then
    expect(ids).toEqual(['c', 'b', 'a']);
  });
});
