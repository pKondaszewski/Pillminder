import type { UndoableChange } from '@/config/undoable-change';

import type { NewProductInput } from './dto/new-product-input';
import { editedProductInput } from './product-form';
import type { Product } from './product-service';

type SaveProduct = (id: string, input: NewProductInput) => Promise<void>;

export function productEditChange(
  product: Product,
  patch: Partial<NewProductInput>,
  message: string,
  save: SaveProduct,
): UndoableChange {
  return {
    message,
    apply: () => save(product.id, editedProductInput(product, patch)),
    revert: () => save(product.id, editedProductInput(product, {})),
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
