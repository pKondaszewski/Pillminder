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
});
