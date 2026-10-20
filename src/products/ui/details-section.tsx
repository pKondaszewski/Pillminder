import { useTranslation } from 'react-i18next';

import { FieldRow } from '@/commons/ui/field-row';
import {
  categoryLabel,
  packSizeInMl,
  supportsFasting,
  supportsStrength,
} from '@/products/category';
import { packSizeText } from '@/products/product-form';
import type { Product } from '@/products/product-service';
import { FastingRow } from '@/products/ui/fasting-row';
import type { ProductSheetField } from '@/products/ui/field-sheets';
import { ProductSection } from '@/products/ui/section';

type Props = {
  product: Product;
  onEdit: (field: ProductSheetField) => void;
  onFastingChange: (fasting: boolean) => void;
};

export function DetailsSection({ product, onEdit, onFastingChange }: Props) {
  const { t } = useTranslation();
  const notSet = t('products.detail.notSet');

  return (
    <ProductSection
      title={t('products.detail.details')}
      hint={t('products.detail.tapToEdit')}
    >
      <FieldRow
        label={t('editor.category')}
        value={categoryLabel(product.category, t)}
        onPress={() => onEdit('category')}
      />
      {supportsStrength(product.category) ? (
        <FieldRow
          label={t('editor.strength')}
          value={product.strength ?? notSet}
          onPress={() => onEdit('strength')}
        />
      ) : null}
      {supportsFasting(product.category) ? (
        <FastingRow value={product.fasting} onChange={onFastingChange} />
      ) : null}
      <FieldRow
        label={t('editor.unit')}
        value={product.unit ? t(`unitName.${product.unit}`) : notSet}
        onPress={() => onEdit('unit')}
      />
      <FieldRow
        label={t(
          packSizeInMl(product.category)
            ? 'editor.packSizeMl'
            : 'editor.packSize',
        )}
        value={
          product.packSize === null
            ? notSet
            : packSizeText(product.category, product.packSize)
        }
        onPress={() => onEdit('packSize')}
      />
      <FieldRow
        label={t('products.detail.price')}
        value={product.price ?? notSet}
        onPress={() => onEdit('price')}
      />
      <FieldRow
        label={t('products.detail.store')}
        value={product.storeLink ?? notSet}
        onPress={() => onEdit('storeLink')}
      />
    </ProductSection>
  );
}
