import { type DayMode, rowPressAction } from '../dose-row-action';

describe('rowPressAction', () => {
  it.each([
    ['today', false, 'open'],
    ['today', true, 'revert'],
    ['past', false, 'correct'],
    ['past', true, 'correct'],
    ['future', false, 'open'],
    ['future', true, 'open'],
  ] as const)(
    'in %s mode with handled=%s picks %s',
    (mode: DayMode, handled, expected) => {
      // when
      const action = rowPressAction(mode, handled);

      // then
      expect(action).toBe(expected);
    },
  );
});
