import { creationChange } from '../undoable-change';

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
