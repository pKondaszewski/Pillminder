import { startActivityAsync } from 'expo-intent-launcher';

import { openGoogleBackupSettings } from '../google-backup-service';

jest.mock('expo-intent-launcher', () => ({
  ActivityAction: {
    BACKUP_SETTINGS: 'com.android.settings.BACKUP_SETTINGS',
  },
  startActivityAsync: jest.fn(),
}));

const startActivity = jest.mocked(startActivityAsync);

describe('openGoogleBackupSettings', () => {
  beforeEach(() => startActivity.mockReset());

  it('opens the backup settings', async () => {
    // given
    startActivity.mockResolvedValue({ resultCode: 0 });

    // when
    await openGoogleBackupSettings();

    // then
    expect(startActivity.mock.calls).toEqual([
      ['com.android.settings.BACKUP_SETTINGS'],
    ]);
  });

  it('fails when the phone cannot open them', async () => {
    // given
    startActivity.mockRejectedValue(new Error('no backup screen'));

    // when
    const result = openGoogleBackupSettings();

    // then
    await expect(result).rejects.toThrow('no backup screen');
  });
});
