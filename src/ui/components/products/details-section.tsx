import { useTranslation } from 'react-i18next';

import {
  categoryLabel,
  supportsFasting,
  supportsStrength,
} from '@/products/category';
import type { Product } from '@/products/product-service';
import type { Currency } from '@/settings/settings-store';
import { formatPrice } from '@/ui/commons/format-price';
import { FieldRow } from '@/ui/components/commons/field-row';
import { FastingRow } from '@/ui/components/products/fasting-row';
import type { ProductSheetField } from '@/ui/components/products/field-sheets';
import { ProductSection } from '@/ui/components/products/section';

type Props = {
  product: Product;
  currency: Currency;
  locale: string;
  onEdit: (field: ProductSheetField) => void;
  onFastingChange: (fasting: boolean) => void;
};

export function DetailsSection({
  product,
  currency,
  locale,
  onEdit,
  onFastingChange,
}: Props) {
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
        label={t('editor.packSize')}
        value={product.packSize === null ? notSet : String(product.packSize)}
        onPress={() => onEdit('packSize')}
      />
      <FieldRow
        label={t('products.detail.price')}
        value={
          product.price === null
            ? notSet
            : formatPrice(product.price, currency, locale)
        }
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
