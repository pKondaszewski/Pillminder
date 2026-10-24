import { cycleStateOf } from '../cycle-state';
import type { NewScheduleInput } from '../dto/new-schedule-input';
import { draftSchedule } from '../schedule-draft';
import type { Schedule } from '../schedule-repository';

const NOW = new Date(2026, 0, 10, 12, 0);
const CYCLE = { onDays: 21, offDays: 7, unit: 'days' } as const;

function input(overrides: Partial<NewScheduleInput> = {}): NewScheduleInput {
  return {
    productId: 'p1',
    intervalDays: 1,
    timesOfDay: ['08:00'],
    cycle: CYCLE,
    ...overrides,
  };
}

describe('cycleStateOf', () => {
  it('anchors the cycle to the start date', () => {
    // given
    const withStart = input({ startDate: new Date(2026, 0, 20, 15, 30) });

    // when
    const state = cycleStateOf(withStart, undefined, NOW);

    // then
    expect(state).toEqual({
      cycleAnchor: new Date(2026, 0, 20),
      cyclePausedDays: 0,
    });
  });

  it('anchors a cycle without a start date to the day it is set', () => {
    // given
    const withoutStart = input();

    // when
    const state = cycleStateOf(withoutStart, undefined, NOW);

    // then
    expect(state.cycleAnchor).toEqual(new Date(2026, 0, 10));
  });

  it('keeps the anchor and the paused days when other fields are edited', () => {
    // given
    const existing = {
      cycleAnchor: new Date(2026, 0, 2),
      cyclePausedDays: 4,
    } as Schedule;

    // when
    const state = cycleStateOf(input(), existing, NOW);

    // then
    expect(state).toEqual({
      cycleAnchor: new Date(2026, 0, 2),
      cyclePausedDays: 4,
    });
  });

  it('follows a changed start date', () => {
    // given
    const existing = { cycleAnchor: new Date(2026, 0, 2) } as Schedule;
    const moved = input({ startDate: new Date(2026, 0, 6) });

    // when
    const state = cycleStateOf(moved, existing, NOW);

    // then
    expect(state.cycleAnchor).toEqual(new Date(2026, 0, 6));
  });

  it('clears the state when the cycle is removed', () => {
    // given
    const existing = {
      cycleAnchor: new Date(2026, 0, 2),
      cyclePausedDays: 4,
    } as Schedule;

    // when
    const state = cycleStateOf(input({ cycle: null }), existing, NOW);

    // then
    expect(state).toEqual({ cycleAnchor: null, cyclePausedDays: 0 });
  });
});

describe('draftSchedule', () => {
  it('carries the cycle and its anchor', () => {
    // given
    const draftInput = input();

    // when
    const draft = draftSchedule(draftInput, NOW);

    // then
    expect(draft).toMatchObject({
      cycle: CYCLE,
      cycleAnchor: new Date(2026, 0, 10),
      cyclePausedDays: 0,
    });
  });
});
