import * as Notifications from 'expo-notifications';

import {
  scheduleDoseReminder,
  scheduleDoseReminders,
} from '../notification-service';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn().mockResolvedValue('id'),
  cancelScheduledNotificationAsync: jest.fn().mockResolvedValue(undefined),
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

describe('scheduleDoseReminders', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
    jest.clearAllMocks();
  });

  afterEach(() => jest.useRealTimers());

  function dosesEveryDay(count: number, hour: number) {
    return Array.from({ length: count }, (_, day) => ({
      reminder: {
        id: `d${day}-${hour}`,
        plannedAt: new Date(2026, 0, 11 + day, hour, 0),
      },
      texts: TEXTS,
    }));
  }

  it('cancels the alarms that no longer fit instead of scheduling them', async () => {
    // given
    const inputs = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].flatMap(
      (hour) => dosesEveryDay(30, hour),
    );

    // when
    await scheduleDoseReminders(inputs);

    // then
    const scheduled = jest
      .mocked(Notifications.scheduleNotificationAsync)
      .mock.calls.map(([request]) => request.identifier);
    const cancelled = jest
      .mocked(Notifications.cancelScheduledNotificationAsync)
      .mock.calls.map(([identifier]) => identifier);
    expect(scheduled).not.toContain('d5-19:retry:2');
    expect(cancelled).toContain('d5-19:retry:2');
  });

  it('keeps going when one alarm fails to schedule', async () => {
    // given
    jest
      .mocked(Notifications.scheduleNotificationAsync)
      .mockRejectedValueOnce(new Error('too many alarms'));

    // when
    await scheduleDoseReminders(dosesEveryDay(2, 20));

    // then
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(6);
  });
});
