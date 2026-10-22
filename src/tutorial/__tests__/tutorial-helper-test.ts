import {
  nextTutorialStep,
  startingTutorialStep,
  tutorialFormRoute,
} from '../tutorial-helper';

describe('startingTutorialStep', () => {
  it('keeps the intro for a user without products', () => {
    // when
    const result = startingTutorialStep('intro', 0);

    // then
    expect(result).toBe('intro');
  });

  it.each([1, 12])(
    'finishes the tutorial for a user with %s products (backup, older version)',
    (productCount) => {
      // when
      const result = startingTutorialStep('intro', productCount);

      // then
      expect(result).toBe('done');
    },
  );

  it.each(['product', 'schedule', 'hint'] as const)(
    'resumes an unfinished tutorial at %s even when products exist',
    (stored) => {
      // when
      const result = startingTutorialStep(stored, 1);

      // then
      expect(result).toBe(stored);
    },
  );

  it('never brings back a finished tutorial', () => {
    // when
    const result = startingTutorialStep('done', 0);

    // then
    expect(result).toBe('done');
  });
});

describe('nextTutorialStep', () => {
  it.each([
    ['intro', 'product'],
    ['product', 'schedule'],
    ['schedule', 'hint'],
    ['hint', 'done'],
    ['done', 'done'],
  ] as const)('moves %s to %s', (step, expected) => {
    // when
    const result = nextTutorialStep(step);

    // then
    expect(result).toBe(expected);
  });
});

describe('tutorialFormRoute', () => {
  it.each([
    ['product', '/products/new'],
    ['schedule', '/schedules/new'],
  ] as const)('opens the form for %s', (step, expected) => {
    // when
    const result = tutorialFormRoute(step);

    // then
    expect(result).toBe(expected);
  });

  it.each(['intro', 'hint', 'done'] as const)(
    'opens no form for %s',
    (step) => {
      // when
      const result = tutorialFormRoute(step);

      // then
      expect(result).toBeNull();
    },
  );
});
