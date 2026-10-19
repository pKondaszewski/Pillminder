import * as Notifications from 'expo-notifications';

import { scheduleDoseReminder } from '../notification-service';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'bare' },
  ExecutionEnvironment: { StoreClient: 'storeClient' },
}));
jest.mock('expo-sqlite/kv-store', () => ({ __esModule: true, default: {} }));

const NOW = new Date(2026, 0, 10, 12, 0);
const TEXTS = {
  first: { title: 'first', body: 'first body' },
  retry: { title: 'retry', body: 'retry body' },
};

describe('scheduleDoseReminder', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    jest.clearAllMocks();
  });

  afterEach(() => jest.useRealTimers());

  it('tags the first notification and both retries with the dose id', async () => {
    // given
    const reminder = {
      id: 'dose-1',
      productName: 'Vitamin D',
      plannedAt: new Date(NOW.getTime() + 60_000),
    };

    // when
    await scheduleDoseReminder(reminder, TEXTS);

    // then
    const scheduled = jest
      .mocked(Notifications.scheduleNotificationAsync)
      .mock.calls.map(([request]) => request);
    expect(scheduled.map(({ identifier }) => identifier)).toEqual([
      'dose-1',
      'dose-1:retry:1',
      'dose-1:retry:2',
    ]);
    expect(scheduled.map(({ content }) => content.data)).toEqual([
      { doseId: 'dose-1', androidTag: 'dose-1' },
      { doseId: 'dose-1', androidTag: 'dose-1' },
      { doseId: 'dose-1', androidTag: 'dose-1' },
    ]);
  });
});
