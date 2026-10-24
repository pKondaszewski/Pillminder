import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import type { NewProductInput } from '@/products/dto/new-product-input';
import type { Product } from '@/products/product-service';
import { productEditChange } from '@/products/product-undo';
import {
  PRODUCT_FIELD_LABEL_KEYS,
  type ProductEditedField,
} from '@/products/ui/field-sheets';

import { useProducts } from './use-products';

export function useProductEditActions(
  product: Product,
  runWithUndo: RunWithUndo,
) {
  const { t } = useTranslation();
  const {
    editProduct,
    shiftStock,
    archiveProduct,
    restoreProduct,
    undoArchiveProduct,
  } = useProducts();

  const saveField = (
    field: ProductEditedField,
    patch: Partial<NewProductInput>,
    onSuccess?: () => void,
  ) =>
    runWithUndo(
      productEditChange(
        product,
        patch,
        t('editor.saved', { field: t(PRODUCT_FIELD_LABEL_KEYS[field]) }),
        { save: editProduct, shiftStock },
      ),
      'products.errorSave',
      onSuccess,
    );

  const archive = (
    completionNote: string | undefined,
    onSuccess: () => void,
  ) => {
    let completionNoteId: string | null = null;
    return runWithUndo(
      {
        message: t('products.detail.archivedToast', { name: product.name }),
        apply: async () => {
          completionNoteId = await archiveProduct(product.id, completionNote);
        },
        revert: () => undoArchiveProduct(product.id, completionNoteId),
      },
      'products.errorArchive',
      onSuccess,
    );
  };

  const restore = () =>
    runWithUndo(
      {
        message: t('products.detail.restoredToast', { name: product.name }),
        apply: () => restoreProduct(product.id),
        revert: async () => {
          await archiveProduct(product.id);
        },
      },
      'products.errorRestore',
    );

  return { saveField, archive, restore };
}
