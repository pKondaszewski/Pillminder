import { withoutRetiredTutorialStep } from '../retired-tutorial-step';

describe('withoutRetiredTutorialStep', () => {
  it('finishes the tutorial for a device stored on the retired hint step', () => {
    // given
    const stored = { tutorialStep: 'hint', theme: 'dark' };

    // when
    const result = withoutRetiredTutorialStep(stored);

    // then
    expect(result).toEqual({ tutorialStep: 'done', theme: 'dark' });
  });

  it.each(['practice', 'schedule', 'done'])('keeps the %s step', (step) => {
    // given
    const stored = { tutorialStep: step };

    // when
    const result = withoutRetiredTutorialStep(stored);

    // then
    expect(result).toEqual(stored);
  });
});
