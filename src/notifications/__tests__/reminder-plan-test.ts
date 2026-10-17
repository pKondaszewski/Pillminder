import {
  doseNotificationIdentifiers,
  isWithinRetryHorizon,
  planDoseNotifications,
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
      { identifier: 'd1', kind: 'first', at: plannedAt },
      {
        identifier: 'd1:retry:1',
        kind: 'retry',
        at: minutesAfter(plannedAt, 15),
      },
      {
        identifier: 'd1:retry:2',
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
    expect(plan).toEqual([{ identifier: 'd1', kind: 'first', at: plannedAt }]);
  });
});

describe('isWithinRetryHorizon', () => {
  it('is false for a dose 8 days ahead and true for one 6 days ahead', () => {
    // given
    const eightDaysAhead = new Date(2026, 0, 18, 12, 0);
    const sixDaysAhead = new Date(2026, 0, 16, 12, 0);

    // when
    const result = [eightDaysAhead, sixDaysAhead].map((plannedAt) =>
      isWithinRetryHorizon(plannedAt, NOW),
    );

    // then
    expect(result).toEqual([false, true]);
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
