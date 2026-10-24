import { renderHook } from '@testing-library/react-native';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import type { UndoableChange } from '@/config/undoable-change';
import type { Product } from '@/products/product-service';
import { useProductEditActions } from '@/products/ui/use-product-edit-actions';
import { useProducts } from '@/products/ui/use-products';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/products/ui/field-sheets', () => ({
  PRODUCT_FIELD_LABEL_KEYS: {},
}));
jest.mock('@/products/ui/use-products', () => ({ useProducts: jest.fn() }));

const product = { id: 'p1', name: 'Iron' } as Product;

function setUp() {
  const archiveProduct = jest.fn().mockResolvedValue('note-1');
  const undoArchiveProduct = jest.fn().mockResolvedValue(undefined);
  jest.mocked(useProducts).mockReturnValue({
    archiveProduct,
    undoArchiveProduct,
  } as unknown as ReturnType<typeof useProducts>);
  const changes: UndoableChange[] = [];
  const runWithUndo = ((change: UndoableChange) => {
    changes.push(change);
    return Promise.resolve();
  }) as unknown as RunWithUndo;
  const { result } = renderHook(() =>
    useProductEditActions(product, runWithUndo),
  );
  return {
    actions: result.current,
    changes,
    archiveProduct,
    undoArchiveProduct,
  };
}

describe('useProductEditActions', () => {
  it('undoes an archive together with the completion note it added', async () => {
    // given
    const { actions, changes, archiveProduct, undoArchiveProduct } = setUp();

    // when
    void actions.archive('Course finished', jest.fn());
    await changes[0].apply();
    await changes[0].revert();

    // then
    expect(archiveProduct).toHaveBeenCalledWith('p1', 'Course finished');
    expect(undoArchiveProduct).toHaveBeenCalledWith('p1', 'note-1');
  });
});
