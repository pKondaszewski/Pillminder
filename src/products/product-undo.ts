import type { UndoableChange } from '@/config/undoable-change';

import type { NewProductInput } from './dto/new-product-input';
import { editedProductInput } from './product-form';
import type { Product } from './product-service';

type SaveProduct = (id: string, input: NewProductInput) => Promise<void>;
type ShiftStock = (id: string, delta: number) => Promise<void>;

export function productEditChange(
  product: Product,
  patch: Partial<NewProductInput>,
  message: string,
  { save, shiftStock }: { save: SaveProduct; shiftStock: ShiftStock },
): UndoableChange {
  return {
    message,
    apply: () => save(product.id, editedProductInput(product, patch)),
    revert: async () => {
      const base = editedProductInput(product, {});
      const shiftBack = stockShiftBack(product, patch);
      if (typeof shiftBack === 'number') {
        await save(product.id, base);
        await shiftStock(product.id, shiftBack);
      } else if (patch.stock !== undefined) {
        await save(product.id, { ...base, stock: product.stock });
      } else {
        await save(product.id, base);
      }
    },
  };
}

type RenameCategory = (from: string, to: string) => Promise<unknown>;

export function categoryRenameChange(
  from: string,
  to: string,
  message: string,
  rename: RenameCategory,
): UndoableChange {
  return {
    message,
    apply: async () => {
      await rename(from, to);
    },
    revert: async () => {
      await rename(to, from);
    },
  };
}

function stockShiftBack(
  product: Product,
  patch: Partial<NewProductInput>,
): number | null {
  const { stock: edited } = patch;
  return typeof edited === 'number' && typeof product.stock === 'number'
    ? product.stock - edited
    : null;
}
