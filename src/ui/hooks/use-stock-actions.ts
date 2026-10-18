import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import type { Product } from '@/products/product-service';
import { stockAmountText } from '@/products/product-text';

import { useProducts } from './use-products';

type StockUndo = { id: number; previousStock: number; message: string };

export function useStockActions({ id, stock, packSize, unit }: Product) {
  const { t } = useTranslation();
  const { setStock, restockPack } = useProducts();
  const [undoable, setUndoable] = useState<StockUndo | null>(null);

  const run = async (change: () => Promise<void>) => {
    try {
      await change();
    } catch {
      Alert.alert(t('products.errorTitle'), t('products.errorStock'));
    }
  };

  const step = (delta: number) => {
    if (stock === null) return;
    void run(() => setStock(id, Math.max(0, stock + delta)));
  };

  const addPack = () => {
    if (stock === null || packSize === null) return;
    void run(async () => {
      await restockPack(id);
      setUndoable({
        id: Date.now(),
        previousStock: stock,
        message: t('products.detail.packAdded', {
          amount: stockAmountText(packSize, unit, t),
        }),
      });
    });
  };

  const undo = () => {
    if (!undoable) return;
    const { previousStock } = undoable;
    setUndoable(null);
    void run(() => setStock(id, previousStock));
  };

  const dismissUndo = () => setUndoable(null);

  return { undoable, step, addPack, undo, dismissUndo };
}
