import { useTranslation } from 'react-i18next';

import type { Product } from '@/products/product-service';
import { stockAmountText } from '@/products/product-text';

import { useProducts } from './use-products';
import type { RunWithUndo } from './use-undo-snackbar';

export function useStockActions(
  { id, stock, packSize, unit }: Product,
  runWithUndo: RunWithUndo,
) {
  const { t } = useTranslation();
  const { setStock, restockPack } = useProducts();

  const step = (delta: number) => {
    if (stock === null) return;
    void runWithUndo(
      {
        message: t('editor.saved', { field: t('editor.stock') }),
        apply: () => setStock(id, Math.max(0, stock + delta)),
        revert: () => setStock(id, stock),
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
        revert: () => setStock(id, stock),
      },
      'products.errorStock',
    );
  };

  return { step, addPack };
}
