import type { ScheduleStep } from '../dto/schedule-step';
import {
  addStep,
  canAddStep,
  canRemoveStep,
  changeStepDays,
  changeStepQuantity,
  defaultSteps,
  removeStep,
  stopAfterLastStep,
} from '../step-edit';

const STOPPING: ScheduleStep[] = [
  { days: 3, quantity: 4 },
  { days: 3, quantity: 2 },
];

const OPEN: ScheduleStep[] = [
  { days: 7, quantity: 1 },
  { days: null, quantity: 2 },
];

describe('defaultSteps', () => {
  it('starts a ramp-up that does not stop by itself', () => {
    // when
    const steps = defaultSteps(2);

    // then
    expect(steps).toEqual([
      { days: 7, quantity: 2 },
      { days: null, quantity: 3 },
    ]);
  });
});

describe('addStep', () => {
  it('repeats the last quantity and keeps a stopping taper stopping', () => {
    // when
    const steps = addStep(STOPPING);

    // then
    expect(steps).toEqual([
      { days: 3, quantity: 4 },
      { days: 3, quantity: 2 },
      { days: 7, quantity: 2 },
    ]);
  });

  it('keeps an open-ended taper open-ended', () => {
    // when
    const steps = addStep(OPEN);

    // then
    expect(steps).toEqual([
      { days: 7, quantity: 1 },
      { days: 7, quantity: 2 },
      { days: null, quantity: 2 },
    ]);
  });
});

describe('removeStep', () => {
  it('removes a middle step', () => {
    // given
    const steps = [...STOPPING, { days: 5, quantity: 1 }];

    // when
    const result = removeStep(steps, 1);

    // then
    expect(result).toEqual([
      { days: 3, quantity: 4 },
      { days: 5, quantity: 1 },
    ]);
  });

  it('hands the open ending of a removed last step to the previous one', () => {
    // given
    const steps = [{ days: 2, quantity: 1 }, ...OPEN];

    // when
    const result = removeStep(steps, 2);

    // then
    expect(result).toEqual([
      { days: 2, quantity: 1 },
      { days: null, quantity: 1 },
    ]);
  });
});

describe('step limits', () => {
  it('allows removing only above the minimum', () => {
    // when
    const result = [STOPPING, addStep(STOPPING)].map(canRemoveStep);

    // then
    expect(result).toEqual([false, true]);
  });

  it('stops adding at the maximum', () => {
    // given
    const full = Array.from({ length: 10 }, () => ({ days: 1, quantity: 1 }));

    // when
    const result = [canAddStep(STOPPING), canAddStep(full)];

    // then
    expect(result).toEqual([true, false]);
  });
});

describe('changing a step', () => {
  it('keeps the days between 1 and 365', () => {
    // given
    const steps = [
      { days: 1, quantity: 1 },
      { days: 365, quantity: 1 },
    ];

    // when
    const result = [
      changeStepDays(steps, 0, -1)[0].days,
      changeStepDays(steps, 1, 1)[1].days,
    ];

    // then
    expect(result).toEqual([1, 365]);
  });

  it('leaves an open-ended step without days', () => {
    // when
    const result = changeStepDays(OPEN, 1, 1);

    // then
    expect(result).toEqual(OPEN);
  });

  it('changes the quantity of one step', () => {
    // when
    const result = changeStepQuantity(STOPPING, 1, 5);

    // then
    expect(result).toEqual([
      { days: 3, quantity: 4 },
      { days: 3, quantity: 5 },
    ]);
  });
});

describe('stopAfterLastStep', () => {
  it('gives the last step a length when stopping and drops it when not', () => {
    // when
    const stopping = stopAfterLastStep(OPEN, true);
    const open = stopAfterLastStep(STOPPING, false);

    // then
    expect(stopping[1]).toEqual({ days: 7, quantity: 2 });
    expect(open[1]).toEqual({ days: null, quantity: 2 });
  });
});
