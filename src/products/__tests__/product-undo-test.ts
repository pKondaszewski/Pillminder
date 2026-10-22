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

describe('productEditChange', () => {
  it('applies the patch and reverts to the full previous input', async () => {
    // given
    const save = jest.fn().mockResolvedValue(undefined);
    const change = productEditChange(
      product,
      { price: '25 zł' },
      'Saved',
      save,
    );

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
    const save = jest.fn().mockResolvedValue(undefined);
    const change = productEditChange(
      product,
      { category: 'care' },
      'Saved',
      save,
    );

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
