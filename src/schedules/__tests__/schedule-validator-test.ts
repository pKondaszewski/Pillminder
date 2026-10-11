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
