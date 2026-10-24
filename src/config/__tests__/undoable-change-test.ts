import { creationChange, deletionChange } from '../undoable-change';

describe('creationChange', () => {
  it('removes the entity created by apply on revert', async () => {
    // given
    const create = jest.fn().mockResolvedValue('id-9');
    const remove = jest.fn().mockResolvedValue(undefined);
    const change = creationChange('Created', create, remove);

    // when
    await change.apply();
    await change.revert();

    // then
    expect(create).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith('id-9');
  });

  it('removes nothing when apply failed', async () => {
    // given
    const create = jest.fn().mockRejectedValue(new Error('db'));
    const remove = jest.fn().mockResolvedValue(undefined);
    const change = creationChange('Created', create, remove);

    // when
    await Promise.resolve(change.apply()).catch(() => undefined);
    await change.revert();

    // then
    expect(remove).not.toHaveBeenCalled();
  });
});

describe('deletionChange', () => {
  it('restores exactly what remove returned on revert', async () => {
    // given
    const removed = { id: 'n1', body: 'text' };
    const remove = jest.fn().mockResolvedValue(removed);
    const restore = jest.fn().mockResolvedValue(undefined);
    const change = deletionChange('Deleted', remove, restore);

    // when
    await change.apply();
    await change.revert();

    // then
    expect(restore).toHaveBeenCalledWith(removed);
  });

  it('restores nothing when there was nothing to remove', async () => {
    // given
    const restore = jest.fn();
    const change = deletionChange('Deleted', () => undefined, restore);

    // when
    await change.apply();
    await change.revert();

    // then
    expect(restore).not.toHaveBeenCalled();
  });

  it('restores nothing when apply failed', async () => {
    // given
    const remove = jest.fn().mockRejectedValue(new Error('db'));
    const restore = jest.fn();
    const change = deletionChange('Deleted', remove, restore);

    // when
    await Promise.resolve(change.apply()).catch(() => undefined);
    await change.revert();

    // then
    expect(restore).not.toHaveBeenCalled();
  });
});
