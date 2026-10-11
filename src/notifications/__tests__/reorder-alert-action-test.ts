import { reorderAlertAction } from '../reorder-alert-action';

const NOW = new Date(2026, 0, 10, 12, 0);

describe('reorderAlertAction', () => {
  it('cancels when the product needs no reorder', () => {
    // given
    const reorderAt = null;

    // when
    const action = reorderAlertAction(reorderAt, NOW);

    // then
    expect(action).toEqual({ kind: 'cancel' });
  });

  it('reschedules when reorderAt is in the future', () => {
    // given
    const reorderAt = new Date(NOW.getTime() + 60_000);

    // when
    const action = reorderAlertAction(reorderAt, NOW);

    // then
    expect(action).toEqual({ kind: 'reschedule', at: reorderAt });
  });

  it('keeps the delivered alert when reorderAt has passed', () => {
    // given
    const reorderAt = new Date(NOW.getTime() - 60_000);

    // when
    const action = reorderAlertAction(reorderAt, NOW);

    // then
    expect(action).toEqual({ kind: 'keep' });
  });

  it('keeps the alert at the exact moment reorderAt is reached', () => {
    // given
    const reorderAt = new Date(NOW.getTime());

    // when
    const action = reorderAlertAction(reorderAt, NOW);

    // then
    expect(action).toEqual({ kind: 'keep' });
  });
});
