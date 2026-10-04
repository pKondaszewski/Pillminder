import { decideOnboarding, permissionStep } from '../onboarding-helper';

describe('decideOnboarding', () => {
  it.each([
    [true, true],
    [true, false],
  ])(
    'skips when permission is granted (dismissed: %s, canAskAgain: %s)',
    (promptDismissed, canAskAgain) => {
      // when
      const result = decideOnboarding(promptDismissed, {
        granted: true,
        canAskAgain,
      });

      // then
      expect(result).toBe('skip');
    },
  );

  it.each([true, false])(
    'shows when permission is missing and the prompt was not dismissed (canAskAgain: %s)',
    (canAskAgain) => {
      // when
      const result = decideOnboarding(false, { granted: false, canAskAgain });

      // then
      expect(result).toBe('show');
    },
  );

  it.each([true, false])(
    'skips when permission is missing but the user dismissed the prompt (canAskAgain: %s)',
    (canAskAgain) => {
      // when
      const result = decideOnboarding(true, { granted: false, canAskAgain });

      // then
      expect(result).toBe('skip');
    },
  );

  it('skips when permission is granted and the prompt was not dismissed', () => {
    // when
    const result = decideOnboarding(false, {
      granted: true,
      canAskAgain: true,
    });

    // then
    expect(result).toBe('skip');
  });
});

describe('permissionStep', () => {
  it.each([
    [{ granted: true, canAskAgain: true }, 'granted'],
    [{ granted: true, canAskAgain: false }, 'granted'],
    [{ granted: false, canAskAgain: true }, 'askable'],
    [{ granted: false, canAskAgain: false }, 'blocked'],
  ] as const)('maps %j to %s', (permission, expected) => {
    // when
    const result = permissionStep(permission);

    // then
    expect(result).toBe(expected);
  });
});
