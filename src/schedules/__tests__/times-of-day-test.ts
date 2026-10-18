import { addTimeOfDay } from '../times-of-day';

describe('addTimeOfDay', () => {
  it('inserts the time keeping the list sorted', () => {
    // given
    const times = ['08:00', '20:00'];

    // when
    const result = addTimeOfDay(times, '14:00');

    // then
    expect(result).toEqual(['08:00', '14:00', '20:00']);
  });

  it('does not add a time twice', () => {
    // given
    const times = ['08:00'];

    // when
    const result = addTimeOfDay(times, '08:00');

    // then
    expect(result).toEqual(['08:00']);
  });
});
