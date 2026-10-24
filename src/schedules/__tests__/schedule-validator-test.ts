import type { NewScheduleInput } from '../dto/new-schedule-input';
import { assertValidScheduleInput } from '../schedule-validator';

function input(overrides: Partial<NewScheduleInput> = {}): NewScheduleInput {
  return {
    productId: 'p1',
    intervalDays: 1,
    timesOfDay: ['08:00'],
    ...overrides,
  };
}

describe('assertValidScheduleInput', () => {
  it('accepts a positive interval and quantity', () => {
    // given
    const valid = input({ intervalDays: 3, quantity: 2 });

    // when
    const validate = () => assertValidScheduleInput(valid);

    // then
    expect(validate).not.toThrow();
  });

  it('accepts a missing quantity', () => {
    // given
    const valid = input({ quantity: undefined });

    // when
    const validate = () => assertValidScheduleInput(valid);

    // then
    expect(validate).not.toThrow();
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects intervalDays = %s', (value) => {
    // given
    const invalid = input({ intervalDays: value });

    // when
    const validate = () => assertValidScheduleInput(invalid);

    // then
    expect(validate).toThrow();
  });

  it.each([0, -1, 1.5, Number.NaN])('rejects quantity = %s', (value) => {
    // given
    const invalid = input({ quantity: value });

    // when
    const validate = () => assertValidScheduleInput(invalid);

    // then
    expect(validate).toThrow();
  });
});

describe('assertValidScheduleInput weekdays', () => {
  it('accepts a list of weekdays with a one-day interval', () => {
    // given
    const valid = input({ weekdays: [6, 0] });

    // when
    const validate = () => assertValidScheduleInput(valid);

    // then
    expect(validate).not.toThrow();
  });

  it.each([[[]], [[7]], [[-1]], [[1.5]], [[1, 1]]])(
    'rejects the weekdays %j',
    (weekdays) => {
      // given
      const invalid = input({ weekdays });

      // when
      const validate = () => assertValidScheduleInput(invalid);

      // then
      expect(validate).toThrow('Invalid weekdays');
    },
  );

  it('rejects weekdays combined with an interval', () => {
    // given
    const invalid = input({ weekdays: [1], intervalDays: 2 });

    // when
    const validate = () => assertValidScheduleInput(invalid);

    // then
    expect(validate).toThrow('Weekdays cannot be combined');
  });
});

describe('assertValidScheduleInput with a cycle', () => {
  it.each([
    [{ onDays: 21, offDays: 7, unit: 'days' }],
    [{ onDays: 56, offDays: 28, unit: 'weeks' }],
    [{ onDays: 365, offDays: 1, unit: 'days' }],
  ])('accepts the cycle %j', (cycle) => {
    // given
    const valid = input({ cycle: cycle as NewScheduleInput['cycle'] });

    // when
    const validate = () => assertValidScheduleInput(valid);

    // then
    expect(validate).not.toThrow();
  });

  it.each([
    [{ onDays: 0, offDays: 7, unit: 'days' }],
    [{ onDays: 21, offDays: 0, unit: 'days' }],
    [{ onDays: 1.5, offDays: 7, unit: 'days' }],
    [{ onDays: 366, offDays: 7, unit: 'days' }],
    [{ onDays: 21, offDays: 7, unit: 'months' }],
    [{ onDays: 10, offDays: 7, unit: 'weeks' }],
    [{ onDays: 21, offDays: 7 }],
    ['21/7'],
  ])('rejects the cycle %j', (cycle) => {
    // given
    const invalid = input({
      cycle: cycle as unknown as NewScheduleInput['cycle'],
    });

    // when
    const validate = () => assertValidScheduleInput(invalid);

    // then
    expect(validate).toThrow('Invalid cycle');
  });

  it('rejects a cycle combined with an interval', () => {
    // given
    const invalid = input({
      intervalDays: 2,
      cycle: { onDays: 21, offDays: 7, unit: 'days' },
    });

    // when
    const validate = () => assertValidScheduleInput(invalid);

    // then
    expect(validate).toThrow('Cycle cannot be combined');
  });

  it('accepts a cycle with weekdays', () => {
    // given
    const valid = input({
      weekdays: [6, 0],
      cycle: { onDays: 56, offDays: 28, unit: 'weeks' },
    });

    // when
    const validate = () => assertValidScheduleInput(valid);

    // then
    expect(validate).not.toThrow();
  });
});
