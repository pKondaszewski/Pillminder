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

describe('cycleStateOf with steps', () => {
  const steps = [
    { days: 3, quantity: 2 },
    { days: null, quantity: 1 },
  ];

  it('anchors steps without a cycle to the day they are set', () => {
    // given
    const tapered = input({ cycle: null, steps });

    // when
    const state = cycleStateOf(tapered, undefined, NOW);

    // then
    expect(state).toEqual({
      cycleAnchor: new Date(2026, 0, 10),
      cyclePausedDays: 0,
    });
  });

  it('keeps the state while either the cycle or the steps remain', () => {
    // given
    const existing = {
      cycleAnchor: new Date(2026, 0, 2),
      cyclePausedDays: 4,
    } as Schedule;

    // when
    const withoutCycle = cycleStateOf(
      input({ cycle: null, steps }),
      existing,
      NOW,
    );

    // then
    expect(withoutCycle).toEqual({
      cycleAnchor: new Date(2026, 0, 2),
      cyclePausedDays: 4,
    });
  });

  it('clears the state when neither is left', () => {
    // when
    const state = cycleStateOf(input({ cycle: null }), undefined, NOW);

    // then
    expect(state).toEqual({ cycleAnchor: null, cyclePausedDays: 0 });
  });

  it('carries the steps into the draft', () => {
    // when
    const draft = draftSchedule(input({ cycle: null, steps }), NOW);

    // then
    expect(draft).toMatchObject({ steps, cycleAnchor: new Date(2026, 0, 10) });
  });
});

describe('cycleStateOf anchor rule', () => {
  const steps = [
    { days: 3, quantity: 2 },
    { days: null, quantity: 1 },
  ];
  const startedLongAgo = {
    startDate: new Date(2025, 11, 1),
    cycleAnchor: null,
    cyclePausedDays: 0,
  } as Schedule;

  it.each([
    ['a cycle', { cycle: CYCLE, steps: null }],
    ['steps', { cycle: null, steps }],
  ])('anchors %s added to an existing schedule at today', (_, change) => {
    // given
    const added = input({ ...change, startDate: new Date(2025, 11, 1) });

    // when
    const state = cycleStateOf(added, startedLongAgo, NOW);

    // then
    expect(state).toEqual({
      cycleAnchor: new Date(2026, 0, 10),
      cyclePausedDays: 0,
    });
  });

  it.each([
    ['a cycle', { cycle: CYCLE, steps: null }],
    ['steps', { cycle: null, steps }],
  ])('keeps the anchor of %s when the start date is unchanged', (_, change) => {
    // given
    const existing = {
      startDate: new Date(2026, 0, 6),
      cycleAnchor: new Date(2026, 0, 6),
      cyclePausedDays: 2,
    } as Schedule;
    const edited = input({ ...change, startDate: new Date(2026, 0, 6, 9, 0) });

    // when
    const state = cycleStateOf(edited, existing, NOW);

    // then
    expect(state).toEqual({
      cycleAnchor: new Date(2026, 0, 6),
      cyclePausedDays: 2,
    });
  });

  it.each([
    ['a cycle', { cycle: CYCLE, steps: null }],
    ['steps', { cycle: null, steps }],
  ])('moves the anchor of %s to a changed start date', (_, change) => {
    // given
    const existing = {
      startDate: new Date(2026, 0, 6),
      cycleAnchor: new Date(2026, 0, 6),
      cyclePausedDays: 2,
    } as Schedule;
    const moved = input({ ...change, startDate: new Date(2026, 0, 8) });

    // when
    const state = cycleStateOf(moved, existing, NOW);

    // then
    expect(state).toEqual({
      cycleAnchor: new Date(2026, 0, 8),
      cyclePausedDays: 0,
    });
  });

  it('anchors a new schedule with steps at its start date', () => {
    // given
    const created = input({
      cycle: null,
      steps,
      startDate: new Date(2026, 0, 20),
    });

    // when
    const state = cycleStateOf(created, undefined, NOW);

    // then
    expect(state.cycleAnchor).toEqual(new Date(2026, 0, 20));
  });
});
