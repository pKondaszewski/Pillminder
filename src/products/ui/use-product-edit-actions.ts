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
  const { editProduct, archiveProduct, restoreProduct } = useProducts();

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
        editProduct,
      ),
      'products.errorSave',
      onSuccess,
    );

  const archive = (completionNote: string | undefined, onSuccess: () => void) =>
    runWithUndo(
      {
        message: t('products.detail.archivedToast', { name: product.name }),
        apply: () => archiveProduct(product.id, completionNote),
        revert: () => restoreProduct(product.id),
      },
      'products.errorArchive',
      onSuccess,
    );

  const restore = () =>
    runWithUndo(
      {
        message: t('products.detail.restoredToast', { name: product.name }),
        apply: () => restoreProduct(product.id),
        revert: () => archiveProduct(product.id),
      },
      'products.errorRestore',
    );

  return { saveField, archive, restore };
}
