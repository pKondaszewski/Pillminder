import { setPendingUndo, takePendingUndo } from '../pending-undo-store';

describe('pending undo store', () => {
  afterEach(takePendingUndo);

  it('hands over the stored undo', () => {
    // given
    const undo = jest.fn();
    setPendingUndo({ message: 'Created', undo });

    // when
    const taken = takePendingUndo();

    // then
    expect(taken).toEqual({ message: 'Created', undo });
  });

  it('hands an undo over only once', () => {
    // given
    setPendingUndo({ message: 'Created', undo: jest.fn() });
    takePendingUndo();

    // when
    const second = takePendingUndo();

    // then
    expect(second).toBeNull();
  });

  it('keeps only the latest undo', () => {
    // given
    setPendingUndo({ message: 'First', undo: jest.fn() });
    setPendingUndo({ message: 'Second', undo: jest.fn() });

    // when
    const taken = takePendingUndo();

    // then
    expect(taken?.message).toBe('Second');
  });
});
