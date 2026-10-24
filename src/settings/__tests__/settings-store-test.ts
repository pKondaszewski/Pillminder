const mockStorage = new Map<string, string>();

jest.mock('expo-sqlite/kv-store', () => ({
  __esModule: true,
  default: {
    getItemSync: (key: string) => mockStorage.get(key) ?? null,
    setItemSync: (key: string, value: string) => mockStorage.set(key, value),
  },
}));

function loadStore() {
  jest.resetModules();
  return jest.requireActual<typeof import('../settings-store')>(
    '../settings-store',
  );
}

describe('settings store', () => {
  beforeEach(() => mockStorage.clear());

  it('ignores the retired tutorialStep key and keeps the other stored values', () => {
    // given
    mockStorage.set(
      'settings',
      JSON.stringify({ tutorialStep: 'practice', theme: 'dark' }),
    );

    // when
    const settings = loadStore().getSettings();

    // then
    expect(settings.theme).toBe('dark');
    expect(settings).not.toHaveProperty('tutorialStep');
  });

  it('falls back to false for a non-boolean', () => {
    // given
    mockStorage.set(
      'settings',
      JSON.stringify({ googleBackupConfirmed: 'yes' }),
    );

    // when
    const settings = loadStore().getSettings();

    // then
    expect(settings.googleBackupConfirmed).toBe(false);
  });

  it('remembers the confirmed Google backup', () => {
    // given
    const store = loadStore();

    // when
    store.updateSettings({ googleBackupConfirmed: true });

    // then
    expect(loadStore().getSettings().googleBackupConfirmed).toBe(true);
  });
});
