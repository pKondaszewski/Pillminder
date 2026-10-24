import '../background-task';

import type { NotificationResponse } from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';

import { snoozeDose, syncAllSchedules, takeDose } from '@/doses/dose-service';

import { SNOOZE_ACTION, TAKE_ACTION } from '../identifiers';

jest.mock('expo-task-manager', () => ({
  isTaskDefined: jest.fn().mockReturnValue(false),
  defineTask: jest.fn(),
}));
jest.mock('react-native', () => {
  const actual = jest.requireActual('react-native');
  actual.AppState.currentState = 'background';
  return actual;
});
jest.mock('@/config/logger', () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));
jest.mock('@/config/db/database', () => ({ db: {} }));
jest.mock('drizzle-orm/expo-sqlite/migrator', () => ({
  migrate: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../../drizzle/migrations', () => ({}));
jest.mock('@/doses/dose-service', () => ({
  snoozeDose: jest.fn().mockResolvedValue(undefined),
  takeDose: jest.fn().mockResolvedValue(undefined),
  syncAllSchedules: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/products/product-orchestrator', () => ({
  restockPack: jest.fn(),
}));
jest.mock('../notification-service', () => ({
  isNotificationsSupported: true,
}));

type TaskHandler = (body: { data: unknown; error: null }) => Promise<void>;

function response(actionIdentifier: string): NotificationResponse {
  return {
    actionIdentifier,
    notification: {
      request: { content: { dataString: JSON.stringify({ doseId: 'd1' }) } },
    },
  } as unknown as NotificationResponse;
}

const handler = (TaskManager.defineTask as jest.Mock).mock
  .calls[0][1] as TaskHandler;

async function runTask(actionIdentifier: string): Promise<void> {
  await handler({ data: response(actionIdentifier), error: null });
}

describe('background notification task', () => {
  beforeEach(() => jest.clearAllMocks());

  it('syncs all schedules after a Take', async () => {
    // when
    await runTask(TAKE_ACTION);

    // then
    expect(takeDose).toHaveBeenCalledWith('d1');
    expect(syncAllSchedules).toHaveBeenCalledTimes(1);
  });

  it('syncs all schedules after a Snooze', async () => {
    // when
    await runTask(SNOOZE_ACTION);

    // then
    expect(snoozeDose).toHaveBeenCalledWith('d1');
    expect(syncAllSchedules).toHaveBeenCalledTimes(1);
  });

  it('still syncs when the Take fails', async () => {
    // given
    (takeDose as jest.Mock).mockRejectedValueOnce(new Error('db locked'));

    // when
    await runTask(TAKE_ACTION);

    // then
    expect(syncAllSchedules).toHaveBeenCalledTimes(1);
  });

  it('does not throw when the sync fails', async () => {
    // given
    (syncAllSchedules as jest.Mock).mockRejectedValueOnce(
      new Error('db locked'),
    );

    // when
    const result = runTask(TAKE_ACTION);

    // then
    await expect(result).resolves.toBeUndefined();
  });
});
