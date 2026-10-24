import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import type { Product } from '@/products/product-service';
import { stockAmountText } from '@/products/product-text';

import { useProducts } from './use-products';

export function useStockActions(
  { id, stock, packSize, unit }: Product,
  runWithUndo: RunWithUndo,
) {
  const { t } = useTranslation();
  const { shiftStock, restockPack } = useProducts();

  const step = (delta: number) => {
    if (stock === null) return;
    const applied = Math.max(0, stock + delta) - stock;
    void runWithUndo(
      {
        message: t('editor.saved', { field: t('editor.stock') }),
        apply: () => shiftStock(id, applied),
        revert: () => shiftStock(id, -applied),
      },
      'products.errorStock',
    );
  };

  const addPack = () => {
    if (stock === null || packSize === null) return;
    void runWithUndo(
      {
        message: t('products.detail.packAdded', {
          amount: stockAmountText(packSize, unit, t),
        }),
        apply: () => restockPack(id),
        revert: () => shiftStock(id, -packSize),
      },
      'products.errorStock',
    );
  };

  return { step, addPack };
}
