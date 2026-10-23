import {
  clearPendingUris,
  getPendingUris,
  setPendingUris,
  subscribeToPendingUris,
} from '../pending-photos-store';

describe('pending photos store', () => {
  afterEach(clearPendingUris);

  it('keeps the uris and notifies subscribers', () => {
    // given
    const listener = jest.fn();
    subscribeToPendingUris(listener);

    // when
    setPendingUris(['a', 'b']);

    // then
    expect(getPendingUris()).toEqual(['a', 'b']);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('empties the uris on clear', () => {
    // given
    setPendingUris(['a']);

    // when
    clearPendingUris();

    // then
    expect(getPendingUris()).toEqual([]);
  });

  it('stops notifying after unsubscribe', () => {
    // given
    const listener = jest.fn();
    const unsubscribe = subscribeToPendingUris(listener);
    unsubscribe();

    // when
    setPendingUris(['a']);

    // then
    expect(listener).not.toHaveBeenCalled();
  });
});
