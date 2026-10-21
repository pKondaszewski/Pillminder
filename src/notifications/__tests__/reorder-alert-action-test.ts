import { reorderAlertAction } from '../reorder-alert-action';

const NOW = new Date(2026, 0, 10, 12, 0);

describe('reorderAlertAction', () => {
  it('cancels when the product needs no reorder', () => {
    // given
    const reorderAt = null;

    // when
    const action = reorderAlertAction(reorderAt, null, NOW);

    // then
    expect(action).toEqual({ kind: 'cancel' });
  });

  it('reschedules when reorderAt is in the future', () => {
    // given
    const reorderAt = new Date(NOW.getTime() + 60_000);

    // when
    const action = reorderAlertAction(reorderAt, null, NOW);

    // then
    expect(action).toEqual({ kind: 'reschedule', at: reorderAt });
  });

  it('reschedules a future reorderAt even if an alert was delivered before', () => {
    // given
    const reorderAt = new Date(NOW.getTime() + 60_000);
    const alertedAt = new Date(NOW.getTime() - 60_000);

    // when
    const action = reorderAlertAction(reorderAt, alertedAt, NOW);

    // then
    expect(action).toEqual({ kind: 'reschedule', at: reorderAt });
  });

  it('notifies now when reorderAt has passed and no alert was posted', () => {
    // given
    const reorderAt = new Date(NOW.getTime() - 60_000);

    // when
    const action = reorderAlertAction(reorderAt, null, NOW);

    // then
    expect(action).toEqual({ kind: 'notifyNow' });
  });

  it('notifies now when the scheduled alert is still ahead of now', () => {
    // given
    const reorderAt = new Date(NOW.getTime() - 60_000);
    const alertedAt = new Date(NOW.getTime() + 24 * 60 * 60_000);

    // when
    const action = reorderAlertAction(reorderAt, alertedAt, NOW);

    // then
    expect(action).toEqual({ kind: 'notifyNow' });
  });

  it('keeps the alert already delivered in this episode', () => {
    // given
    const reorderAt = new Date(NOW.getTime() - 60_000);
    const alertedAt = new Date(NOW.getTime() - 2 * 60_000);

    // when
    const action = reorderAlertAction(reorderAt, alertedAt, NOW);

    // then
    expect(action).toEqual({ kind: 'keep' });
  });

  it('notifies when reorderAt is reached exactly and nothing was posted', () => {
    // given
    const reorderAt = new Date(NOW.getTime());

    // when
    const action = reorderAlertAction(reorderAt, null, NOW);

    // then
    expect(action).toEqual({ kind: 'notifyNow' });
  });
});

describe('reorderAlertAction for a threshold episode', () => {
  it('notifies once when the stock reaches the threshold', () => {
    // given
    const reorderAt = NOW;

    // when
    const action = reorderAlertAction(reorderAt, null, NOW);

    // then
    expect(action).toEqual({ kind: 'notifyNow' });
  });

  it('keeps the delivered alert while the stock stays low', () => {
    // given
    const alertedAt = new Date(NOW.getTime() - 60_000);

    // when
    const action = reorderAlertAction(NOW, alertedAt, NOW);

    // then
    expect(action).toEqual({ kind: 'keep' });
  });

  it('cancels, and so ends the episode, once the stock is restocked', () => {
    // when
    const action = reorderAlertAction(null, NOW, NOW);

    // then
    expect(action).toEqual({ kind: 'cancel' });
  });
});
