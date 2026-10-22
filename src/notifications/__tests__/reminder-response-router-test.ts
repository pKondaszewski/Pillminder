import type { NotificationResponse } from 'expo-notifications';

import { processReminderResponse } from '../reminder-response-router';

function responseTo(
  action: string,
  data: Record<string, unknown>,
  identifier: string,
): NotificationResponse {
  return {
    actionIdentifier: action,
    notification: {
      request: { identifier, content: { title: 'Time', body: 'Vit D', data } },
    },
  } as unknown as NotificationResponse;
}

function handlers() {
  return {
    onTake: jest.fn(),
    onSnooze: jest.fn(),
    onPracticeTake: jest.fn(),
    onPracticeSnooze: jest.fn(),
    onReorder: jest.fn(),
    onAddPack: jest.fn(),
  };
}

describe('processReminderResponse for the practice reminder', () => {
  it('finishes the practice without touching doses on Taken', () => {
    // given
    const given = handlers();
    const response = responseTo('TAKE_ACTION', { type: 'practice' }, 'p-take');

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(true);
    expect(given.onPracticeTake).toHaveBeenCalledTimes(1);
    expect(given.onTake).not.toHaveBeenCalled();
  });

  it('snoozes with the texts of the notification', () => {
    // given
    const given = handlers();
    const response = responseTo(
      'SNOOZE_ACTION',
      { type: 'practice' },
      'p-snooze',
    );

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(true);
    expect(given.onPracticeSnooze).toHaveBeenCalledWith({
      title: 'Time',
      body: 'Vit D',
    });
    expect(given.onSnooze).not.toHaveBeenCalled();
  });

  it('ignores a repeated response', () => {
    // given
    const given = handlers();
    const response = responseTo('TAKE_ACTION', { type: 'practice' }, 'p-twice');
    processReminderResponse(response, given);

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(false);
    expect(given.onPracticeTake).toHaveBeenCalledTimes(1);
  });
});
