import type { Product } from '../product-service';
import { categoryRenameChange, productEditChange } from '../product-undo';

const product = {
  id: 'p1',
  name: 'Euthyrox',
  category: 'medication',
  strength: '50mcg',
  unit: 'tablet',
  price: '20 zł',
  storeLink: null,
  stock: 10,
  packSize: 30,
  fasting: true,
} as Product;

function deps() {
  return {
    save: jest.fn().mockResolvedValue(undefined),
    shiftStock: jest.fn().mockResolvedValue(undefined),
  };
}

describe('productEditChange', () => {
  it('applies the patch and reverts to the full previous input', async () => {
    // given
    const { save, shiftStock } = deps();
    const change = productEditChange(product, { price: '25 zł' }, 'Saved', {
      save,
      shiftStock,
    });

    // when
    await change.apply();
    await change.revert();

    // then
    expect(save).toHaveBeenNthCalledWith(
      1,
      'p1',
      expect.objectContaining({ price: '25 zł', name: 'Euthyrox' }),
    );
    expect(save).toHaveBeenNthCalledWith(
      2,
      'p1',
      expect.objectContaining({ price: '20 zł', strength: '50mcg' }),
    );
  });

  it('restores strength when the category change had cleared it', async () => {
    // given
    const { save, shiftStock } = deps();
    const change = productEditChange(product, { category: 'care' }, 'Saved', {
      save,
      shiftStock,
    });

    // when
    await change.apply();
    await change.revert();

    // then
    expect(save.mock.calls[0][1]).toMatchObject({ strength: null });
    expect(save.mock.calls[1][1]).toMatchObject({
      category: 'medication',
      strength: '50mcg',
    });
  });
});

describe('productEditChange and the stock', () => {
  it('does not write the stock when another field is edited or reverted', async () => {
    // given
    const { save, shiftStock } = deps();
    const change = productEditChange(product, { price: '25 zł' }, 'Saved', {
      save,
      shiftStock,
    });

    // when
    await change.apply();
    await change.revert();

    // then
    expect(save.mock.calls[0][1]).not.toHaveProperty('stock');
    expect(save.mock.calls[1][1]).not.toHaveProperty('stock');
    expect(shiftStock).not.toHaveBeenCalled();
  });

  it('reverts a stock edit by the amount it changed, not to the old absolute value', async () => {
    // given
    const { save, shiftStock } = deps();
    const change = productEditChange(product, { stock: 25 }, 'Saved', {
      save,
      shiftStock,
    });

    // when
    await change.apply();
    await change.revert();

    // then
    expect(save.mock.calls[0][1]).toMatchObject({ stock: 25 });
    expect(save.mock.calls[1][1]).not.toHaveProperty('stock');
    expect(shiftStock).toHaveBeenCalledWith('p1', -15);
  });

  it('restores the old stock when tracking was switched on or off', async () => {
    // given
    const { save, shiftStock } = deps();
    const change = productEditChange(product, { stock: null }, 'Saved', {
      save,
      shiftStock,
    });

    // when
    await change.revert();

    // then
    expect(save).toHaveBeenCalledWith(
      'p1',
      expect.objectContaining({ stock: 10 }),
    );
    expect(shiftStock).not.toHaveBeenCalled();
  });
});

describe('categoryRenameChange', () => {
  it('renames forward on apply and back on revert', async () => {
    // given
    const rename = jest.fn().mockResolvedValue('Vitamins');
    const change = categoryRenameChange('Vits', 'Vitamins', 'Renamed', rename);

    // when
    await change.apply();
    await change.revert();

    // then
    expect(change.message).toBe('Renamed');
    expect(rename).toHaveBeenNthCalledWith(1, 'Vits', 'Vitamins');
    expect(rename).toHaveBeenNthCalledWith(2, 'Vitamins', 'Vits');
  });

  it('rejects when the rename fails', async () => {
    // given
    const rename = jest.fn().mockRejectedValue(new Error('taken'));
    const change = categoryRenameChange('Vits', 'Vitamins', 'Renamed', rename);

    // when
    const result = change.apply();

    // then
    await expect(result).rejects.toThrow('taken');
  });
});
