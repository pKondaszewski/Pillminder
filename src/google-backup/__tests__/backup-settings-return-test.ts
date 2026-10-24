import { nextBackupSettingsPhase } from '../backup-settings-return';

describe('nextBackupSettingsPhase', () => {
  it('asks when the app becomes active after leaving for the settings', () => {
    // when
    const result = nextBackupSettingsPhase('left', 'active');

    // then
    expect(result).toEqual({ phase: 'idle', shouldAsk: true });
  });

  it('does not ask on a resume the button did not cause', () => {
    // when
    const result = nextBackupSettingsPhase('idle', 'active');

    // then
    expect(result).toEqual({ phase: 'idle', shouldAsk: false });
  });

  it('remembers that the app left once it goes to the background', () => {
    // when
    const result = nextBackupSettingsPhase('opened', 'background');

    // then
    expect(result).toEqual({ phase: 'left', shouldAsk: false });
  });

  it('ignores an active event fired before the app left', () => {
    // when
    const result = nextBackupSettingsPhase('opened', 'active');

    // then
    expect(result).toEqual({ phase: 'opened', shouldAsk: false });
  });
});
