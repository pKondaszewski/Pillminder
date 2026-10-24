import {
  doseNotificationIdentifiers,
  planDoseNotifications,
  planReminderAlarms,
} from '../reminder-plan';

const NOW = new Date(2026, 0, 10, 12, 0);

function minutesAfter(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60_000);
}

describe('planDoseNotifications', () => {
  it('plans the first reminder and two retries for a dose due later today', () => {
    // given
    const plannedAt = minutesAfter(NOW, 60);

    // when
    const plan = planDoseNotifications('d1', plannedAt, NOW);

    // then
    expect(plan).toEqual([
      { identifier: 'd1', doseId: 'd1', kind: 'first', at: plannedAt },
      {
        identifier: 'd1:retry:1',
        doseId: 'd1',
        kind: 'retry',
        at: minutesAfter(plannedAt, 15),
      },
      {
        identifier: 'd1:retry:2',
        doseId: 'd1',
        kind: 'retry',
        at: minutesAfter(plannedAt, 45),
      },
    ]);
  });

  it('plans only the retries that are still ahead for a dose already due', () => {
    // given
    const plannedAt = minutesAfter(NOW, -20);

    // when
    const plan = planDoseNotifications('d1', plannedAt, NOW);

    // then
    expect(plan).toEqual([
      {
        identifier: 'd1:retry:2',
        doseId: 'd1',
        kind: 'retry',
        at: minutesAfter(plannedAt, 45),
      },
    ]);
  });

  it('plans nothing once the last retry has passed', () => {
    // given
    const plannedAt = minutesAfter(NOW, -45);

    // when
    const plan = planDoseNotifications('d1', plannedAt, NOW);

    // then
    expect(plan).toEqual([]);
  });

  it('plans only the first reminder for a dose beyond the retry horizon', () => {
    // given
    const plannedAt = new Date(2026, 0, 20, 8, 0);

    // when
    const plan = planDoseNotifications('d1', plannedAt, NOW);

    // then
    expect(plan).toEqual([
      { identifier: 'd1', doseId: 'd1', kind: 'first', at: plannedAt },
    ]);
  });
});

describe('planReminderAlarms', () => {
  function dosesEveryDay(count: number, hour: number) {
    return Array.from({ length: count }, (_, day) => ({
      id: `d${day}-${hour}`,
      plannedAt: new Date(2026, 0, 10 + day, hour, 0),
    }));
  }

  it('schedules everything when the plan fits the budget', () => {
    // given
    const doses = dosesEveryDay(2, 20);

    // when
    const { scheduled, dropped } = planReminderAlarms(doses, NOW, 10);

    // then
    expect(scheduled).toHaveLength(6);
    expect(dropped).toEqual([]);
  });

  it('keeps the first reminders of all doses before any retry', () => {
    // given
    const doses = dosesEveryDay(3, 20);

    // when
    const { scheduled, dropped } = planReminderAlarms(doses, NOW, 4);

    // then
    expect(scheduled.map(({ identifier }) => identifier)).toEqual([
      'd0-20',
      'd1-20',
      'd2-20',
      'd0-20:retry:1',
    ]);
    expect(dropped).toEqual([
      'd0-20:retry:2',
      'd1-20:retry:1',
      'd1-20:retry:2',
      'd2-20:retry:1',
      'd2-20:retry:2',
    ]);
  });

  it('drops the farthest first reminders across products when even they exceed the budget', () => {
    // given
    const doses = [...dosesEveryDay(10, 8), ...dosesEveryDay(10, 20)];

    // when
    const { scheduled, dropped } = planReminderAlarms(doses, NOW, 5);

    // then
    expect(scheduled.map(({ identifier }) => identifier)).toEqual([
      'd0-20',
      'd1-8',
      'd1-20',
      'd2-8',
      'd2-20',
    ]);
    expect(dropped).toContain('d9-20');
  });

  it('stays below the 500 alarms of Android for twelve times of day over 30 days', () => {
    // given
    const doses = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].flatMap(
      (hour) => dosesEveryDay(30, hour),
    );

    // when
    const { scheduled } = planReminderAlarms(doses, NOW);

    // then
    expect(scheduled.length).toBeLessThan(500);
    expect(scheduled.length).toBeGreaterThan(400);
  });
});

describe('doseNotificationIdentifiers', () => {
  it('lists the first reminder and every retry of the dose', () => {
    // given
    const doseId = 'd1';

    // when
    const identifiers = doseNotificationIdentifiers(doseId);

    // then
    expect(identifiers).toEqual(['d1', 'd1:retry:1', 'd1:retry:2']);
  });
});
