import type { NotificationResponse } from 'expo-notifications';

import { processReminderResponse } from '../reminder-response-router';

function responseTo(
  action: string,
  data: Record<string, unknown>,
  identifier: string,
  date = 0,
): NotificationResponse {
  return {
    actionIdentifier: action,
    notification: {
      date,
      request: { identifier, content: { title: 'Time', body: 'Vit D', data } },
    },
  } as unknown as NotificationResponse;
}

function handlers() {
  return {
    onTake: jest.fn(),
    onSnooze: jest.fn(),
    onReorder: jest.fn(),
    onAddPack: jest.fn(),
  };
}

describe('processReminderResponse for a dose reminder', () => {
  it('hands the dose to the Taken handler', () => {
    // given
    const given = handlers();
    const response = responseTo('TAKE_ACTION', { doseId: 'd1' }, 'd-take');

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(true);
    expect(given.onTake).toHaveBeenCalledWith('d1');
  });

  it('hands the dose to the Snooze handler', () => {
    // given
    const given = handlers();
    const response = responseTo('SNOOZE_ACTION', { doseId: 'd1' }, 'd-snooze');

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(true);
    expect(given.onSnooze).toHaveBeenCalledWith('d1');
  });

  it('handles the reminder again when it is delivered anew', () => {
    // given
    const given = handlers();
    const first = responseTo(
      'TAKE_ACTION',
      { doseId: 'd1' },
      'd-redelivered',
      1000,
    );
    const again = responseTo(
      'TAKE_ACTION',
      { doseId: 'd1' },
      'd-redelivered',
      2000,
    );
    processReminderResponse(first, given);

    // when
    const handled = processReminderResponse(again, given);

    // then
    expect(handled).toBe(true);
    expect(given.onTake).toHaveBeenCalledTimes(2);
  });

  it('ignores the same delivery seen twice', () => {
    // given
    const given = handlers();
    const response = responseTo(
      'TAKE_ACTION',
      { doseId: 'd1' },
      'd-seen-twice',
      1000,
    );
    processReminderResponse(response, given);

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(false);
    expect(given.onTake).toHaveBeenCalledTimes(1);
  });

  it('ignores a response without a dose, like a leftover practice reminder', () => {
    // given
    const given = handlers();
    const response = responseTo('TAKE_ACTION', { type: 'practice' }, 'p-left');

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(false);
    expect(given.onTake).not.toHaveBeenCalled();
  });
});

describe('processReminderResponse for the reorder alert', () => {
  it('hands the product to the Buy handler', () => {
    // given
    const given = handlers();
    const response = responseTo(
      'BUY_ACTION',
      { type: 'reorder', productId: 'p1' },
      'reorder-p1',
    );

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(true);
    expect(given.onReorder).toHaveBeenCalledWith('p1');
  });

  it('ignores Buy without a product', () => {
    // given
    const given = handlers();
    const response = responseTo('BUY_ACTION', { type: 'reorder' }, 'reorder-x');

    // when
    const handled = processReminderResponse(response, given);

    // then
    expect(handled).toBe(false);
    expect(given.onReorder).not.toHaveBeenCalled();
  });
});
