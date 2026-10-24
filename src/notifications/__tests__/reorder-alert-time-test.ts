import { reorderAlertAction } from '../reorder-alert-action';
import { reorderAlertTime } from '../reorder-alert-time';

const NINE = new Date(2026, 0, 10, 9, 0);

describe('reorderAlertTime', () => {
  it('has no time when the product needs no reorder', () => {
    // when
    const alertTime = reorderAlertTime(null);

    // then
    expect(alertTime).toBeNull();
  });

  it('moves a midnight reorderAt to 09:00 of the same day', () => {
    // given
    const reorderAt = new Date(2026, 0, 10, 0, 0);

    // when
    const alertTime = reorderAlertTime(reorderAt);

    // then
    expect(alertTime).toEqual(NINE);
  });

  it('moves a late reorderAt back to 09:00 of the same day', () => {
    // given
    const reorderAt = new Date(2026, 0, 10, 16, 30);

    // when
    const alertTime = reorderAlertTime(reorderAt);

    // then
    expect(alertTime).toEqual(NINE);
  });
});

describe('reorder alert at 09:00 of the reorder day', () => {
  const reorderAt = new Date(2026, 0, 10, 0, 0);

  it('is scheduled when now is before 09:00', () => {
    // given
    const now = new Date(2026, 0, 10, 7, 0);

    // when
    const action = reorderAlertAction(reorderAlertTime(reorderAt), null, now);

    // then
    expect(action).toEqual({ kind: 'reschedule', at: NINE });
  });

  it('is shown right away when now is after 09:00', () => {
    // given
    const now = new Date(2026, 0, 10, 10, 0);

    // when
    const action = reorderAlertAction(reorderAlertTime(reorderAt), null, now);

    // then
    expect(action).toEqual({ kind: 'notifyNow' });
  });

  it('is shown right away when the reorder day has passed', () => {
    // given
    const now = new Date(2026, 0, 12, 8, 0);

    // when
    const action = reorderAlertAction(reorderAlertTime(reorderAt), null, now);

    // then
    expect(action).toEqual({ kind: 'notifyNow' });
  });
});
