import { decideOnboardingSteps, permissionStep } from '../onboarding-helper';

const NOTHING_DONE = {
  permission: { granted: false, canAskAgain: true },
  notificationsPromptDismissed: false,
  batteryOptimizationEnabled: true,
  batteryPromptDismissed: false,
};

describe('decideOnboardingSteps', () => {
  it('shows notifications and then battery for a fresh user', () => {
    // when
    const result = decideOnboardingSteps(NOTHING_DONE);

    // then
    expect(result).toEqual(['notifications', 'battery']);
  });

  it.each([true, false])(
    'shows only battery when permission is granted (canAskAgain: %s)',
    (canAskAgain) => {
      // when
      const result = decideOnboardingSteps({
        ...NOTHING_DONE,
        permission: { granted: true, canAskAgain },
      });

      // then
      expect(result).toEqual(['battery']);
    },
  );

  it('shows only battery when the notifications prompt was dismissed', () => {
    // when
    const result = decideOnboardingSteps({
      ...NOTHING_DONE,
      notificationsPromptDismissed: true,
    });

    // then
    expect(result).toEqual(['battery']);
  });

  it('shows only notifications when battery optimization is already off', () => {
    // when
    const result = decideOnboardingSteps({
      ...NOTHING_DONE,
      batteryOptimizationEnabled: false,
    });

    // then
    expect(result).toEqual(['notifications']);
  });

  it('shows only notifications when the battery prompt was dismissed', () => {
    // when
    const result = decideOnboardingSteps({
      ...NOTHING_DONE,
      batteryPromptDismissed: true,
    });

    // then
    expect(result).toEqual(['notifications']);
  });

  it('shows nothing when everything is done or dismissed', () => {
    // when
    const result = decideOnboardingSteps({
      permission: { granted: true, canAskAgain: true },
      notificationsPromptDismissed: false,
      batteryOptimizationEnabled: false,
      batteryPromptDismissed: true,
    });

    // then
    expect(result).toEqual([]);
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
