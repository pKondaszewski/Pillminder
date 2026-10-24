import {
  batteryCardState,
  googleBackupCardState,
  locationCardState,
  notificationCardState,
} from '../status-card-state';

describe('notificationCardState', () => {
  it('is fine and offers no fix when the permission is granted', () => {
    // when
    const state = notificationCardState('granted');

    // then
    expect(state).toEqual({
      ok: true,
      statusKey: 'settings.notificationsGranted',
      fix: null,
    });
  });

  it('asks for the permission when it can still be requested', () => {
    // when
    const state = notificationCardState('askable');

    // then
    expect(state).toMatchObject({ ok: false, fix: 'request' });
  });

  it('sends to system settings when the permission is blocked', () => {
    // when
    const state = notificationCardState('blocked');

    // then
    expect(state).toMatchObject({ ok: false, fix: 'openSettings' });
  });
});

describe('batteryCardState', () => {
  it('is fine when battery optimization is off', () => {
    // when
    const state = batteryCardState(false);

    // then
    expect(state).toEqual({
      ok: true,
      statusKey: 'settings.batteryUnrestricted',
    });
  });

  it('warns when battery optimization is on', () => {
    // when
    const state = batteryCardState(true);

    // then
    expect(state).toEqual({
      ok: false,
      statusKey: 'settings.batteryRestricted',
    });
  });
});

describe('googleBackupCardState', () => {
  it('is fine and offers turning off once the user confirmed backup is on', () => {
    // when
    const state = googleBackupCardState(true);

    // then
    expect(state).toEqual({
      ok: true,
      neutral: false,
      statusKey: 'settings.googleBackupOn',
      actionKey: 'settings.googleBackupTurnOff',
    });
  });

  it('is neutral and offers the fix before the confirmation', () => {
    // when
    const state = googleBackupCardState(false);

    // then
    expect(state).toEqual({
      ok: false,
      neutral: true,
      statusKey: 'settings.googleBackupCheck',
      actionKey: 'settings.fix',
    });
  });
});

describe('locationCardState', () => {
  it('is on and offers disabling when permitted and coordinates are saved', () => {
    // when
    const state = locationCardState('granted', true);

    // then
    expect(state).toMatchObject({
      ok: true,
      statusKey: 'settings.locationOn',
      action: 'disable',
    });
  });

  it.each([
    ['askable', false],
    ['granted', false],
    ['askable', true],
  ] as const)(
    'is off and offers enabling for %s permission (coords saved: %s)',
    (step, hasCoords) => {
      // when
      const state = locationCardState(step, hasCoords);

      // then
      expect(state).toMatchObject({
        ok: false,
        neutral: true,
        statusKey: 'settings.locationOff',
        action: 'enable',
      });
    },
  );

  it.each([true, false])(
    'sends to system settings when blocked (coords saved: %s)',
    (hasCoords) => {
      // when
      const state = locationCardState('blocked', hasCoords);

      // then
      expect(state).toMatchObject({
        ok: false,
        statusKey: 'settings.locationBlocked',
        action: 'openSettings',
      });
    },
  );
});
