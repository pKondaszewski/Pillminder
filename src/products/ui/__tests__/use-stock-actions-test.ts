import { renderHook } from '@testing-library/react-native';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import type { UndoableChange } from '@/config/undoable-change';
import type { Product } from '@/products/product-service';
import { useProducts } from '@/products/ui/use-products';
import { useStockActions } from '@/products/ui/use-stock-actions';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
jest.mock('@/products/ui/use-products', () => ({ useProducts: jest.fn() }));

const product = {
  id: 'p1',
  stock: 10,
  packSize: 30,
  unit: 'tablet',
} as Product;

function setUp(stock: number) {
  const shiftStock = jest.fn().mockResolvedValue(undefined);
  const restockPack = jest.fn().mockResolvedValue(undefined);
  jest.mocked(useProducts).mockReturnValue({
    shiftStock,
    restockPack,
  } as unknown as ReturnType<typeof useProducts>);
  const changes: UndoableChange[] = [];
  const runWithUndo = ((change: UndoableChange) => {
    changes.push(change);
    return Promise.resolve();
  }) as unknown as RunWithUndo;
  const { result } = renderHook(() =>
    useStockActions({ ...product, stock }, runWithUndo),
  );
  return { actions: result.current, changes, shiftStock, restockPack };
}

describe('useStockActions', () => {
  it('undoes a stock step by shifting back what it moved', async () => {
    // given
    const { actions, changes, shiftStock } = setUp(10);

    // when
    actions.step(-3);
    await changes[0].apply();
    await changes[0].revert();

    // then
    expect(shiftStock).toHaveBeenNthCalledWith(1, 'p1', -3);
    expect(shiftStock).toHaveBeenNthCalledWith(2, 'p1', 3);
  });

  it('gives back only what a clamped step removed', async () => {
    // given
    const { actions, changes, shiftStock } = setUp(2);

    // when
    actions.step(-5);
    await changes[0].apply();
    await changes[0].revert();

    // then
    expect(shiftStock).toHaveBeenNthCalledWith(1, 'p1', -2);
    expect(shiftStock).toHaveBeenNthCalledWith(2, 'p1', 2);
  });

  it('undoes a restocked pack by subtracting the pack size', async () => {
    // given
    const { actions, changes, restockPack, shiftStock } = setUp(10);

    // when
    actions.addPack();
    await changes[0].apply();
    await changes[0].revert();

    // then
    expect(restockPack).toHaveBeenCalledWith('p1');
    expect(shiftStock).toHaveBeenCalledWith('p1', -30);
  });
});
