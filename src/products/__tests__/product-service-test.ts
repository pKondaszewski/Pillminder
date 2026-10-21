import { getCustomCategories, renameCategoryRows } from '../product-repository';
import { renameCustomCategory } from '../product-service';

jest.mock('../product-repository', () => ({
  getCustomCategories: jest.fn(),
  renameCategoryRows: jest.fn().mockResolvedValue(undefined),
}));

describe('renameCustomCategory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(getCustomCategories).mockResolvedValue(['Vitamins', 'Herbs']);
  });

  it('renames the category on all products and returns the new name', async () => {
    // when
    const result = await renameCustomCategory('Vitamins', ' Minerals ');

    // then
    expect(result).toBe('Minerals');
    expect(renameCategoryRows).toHaveBeenCalledWith('Vitamins', 'Minerals');
  });

  it.each(['herbs', 'Medication', 'spray do nosa'])(
    'rejects the colliding name "%s" without touching products',
    async (name) => {
      // when
      const result = renameCustomCategory('Vitamins', name);

      // then
      await expect(result).rejects.toThrow('taken');
      expect(renameCategoryRows).not.toHaveBeenCalled();
    },
  );
});
