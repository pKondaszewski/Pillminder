import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { TextField } from '@/commons/ui/text-field';
import { ThemedText } from '@/commons/ui/themed-text';
import { categoryUnit, packSizeInMl } from '@/products/category';
import type { NewProductInput } from '@/products/dto/new-product-input';
import {
  packSizeEstimate,
  packSizeText,
  PRICE_MAX_LENGTH,
  textFieldPatch,
  validateProductField,
} from '@/products/product-form';
import type {
  Product,
  ProductUnit,
  TextProductField,
} from '@/products/product-service';
import { CategoryPicker } from '@/products/ui/category-picker';
import { StoreSuggestions } from '@/products/ui/store-suggestions';
import { UnitChips } from '@/products/ui/unit-chips';

export type ProductSheetField = TextProductField | 'category' | 'unit';

export type ProductEditedField = ProductSheetField | 'fasting';

export const PRODUCT_FIELD_LABEL_KEYS: Record<ProductEditedField, string> = {
  name: 'editor.name',
  category: 'editor.category',
  strength: 'editor.strength',
  unit: 'editor.unit',
  packSize: 'editor.packSize',
  stock: 'editor.stock',
  price: 'products.detail.price',
  storeLink: 'products.detail.store',
  fasting: 'editor.fasting',
};

type SheetProps = {
  product: Product;
  onSave: (patch: Partial<NewProductInput>) => void;
  onClose: () => void;
};

type Props = SheetProps & { field: ProductSheetField };

type TextSheetConfig = {
  title: string;
  placeholder?: string;
  hint?: string;
  numeric?: boolean;
  maxLength?: number;
  suggestions?: boolean;
};

const TEXT_SHEETS: Record<TextProductField, TextSheetConfig> = {
  name: { title: 'editor.name', placeholder: 'editor.namePlaceholder' },
  strength: {
    title: 'editor.strength',
    placeholder: 'editor.strengthPlaceholder',
    hint: 'editor.strengthHint',
  },
  price: {
    title: 'editor.price',
    placeholder: 'editor.pricePlaceholder',
    hint: 'editor.priceHint',
    maxLength: PRICE_MAX_LENGTH,
  },
  stock: { title: 'editor.stock', numeric: true },
  packSize: {
    title: 'editor.packSize',
    placeholder: 'editor.packSizePlaceholder',
    numeric: true,
  },
  storeLink: {
    title: 'editor.storeLink',
    placeholder: 'editor.storeLinkPlaceholder',
    suggestions: true,
  },
};

export function ProductFieldSheet({ field, ...sheet }: Props) {
  if (field === 'category') return <CategorySheet {...sheet} />;
  if (field === 'unit') return <UnitSheet {...sheet} />;
  return <TextSheet field={field} {...sheet} />;
}

function TextSheet({
  field,
  product,
  onSave,
  onClose,
}: SheetProps & { field: TextProductField }) {
  const { t } = useTranslation();
  const config = TEXT_SHEETS[field];
  const inMl = field === 'packSize' && packSizeInMl(product.category);
  const placeholderKey = inMl
    ? 'editor.packSizeMlPlaceholder'
    : config.placeholder;
  const title = t(inMl ? 'editor.packSizeMl' : config.title);
  const current =
    field === 'packSize'
      ? packSizeText(product.category, product.packSize)
      : product[field];
  const [text, setText] = useState(current == null ? '' : String(current));
  const estimate = packSizeEstimate(product.category, text);
  const [submitted, setSubmitted] = useState(false);
  const error = submitted ? validateProductField(field, text) : null;

  const save = () => {
    if (validateProductField(field, text)) {
      setSubmitted(true);
      return;
    }
    onSave(textFieldPatch(field, text, product.category));
  };

  return (
    <BottomSheet visible title={title} onClose={onClose} onSave={save}>
      <TextField
        value={text}
        onChangeText={setText}
        keyboardType={config.numeric ? 'numeric' : 'default'}
        maxLength={config.maxLength}
        placeholder={placeholderKey ? t(placeholderKey) : undefined}
        accessibilityLabel={title}
        error={error ? t(error) : undefined}
        autoFocus
      />
      {estimate ? (
        <ThemedText type="caption">
          {t('editor.packSizeEstimate', estimate)}
        </ThemedText>
      ) : null}
      {config.hint ? (
        <ThemedText type="caption">{t(config.hint)}</ThemedText>
      ) : null}
      {config.suggestions ? (
        <StoreSuggestions category={product.category} onPick={setText} />
      ) : null}
    </BottomSheet>
  );
}

function CategorySheet({ product, onSave, onClose }: SheetProps) {
  const { t } = useTranslation();
  const [category, setCategory] = useState(product.category);
  const [submitted, setSubmitted] = useState(false);
  const error = submitted && category === '' ? 'editor.categoryRequired' : null;

  const save = () => {
    if (category === '') {
      setSubmitted(true);
      return;
    }
    const unit = categoryUnit(category);
    onSave(unit ? { category, unit } : { category });
  };

  return (
    <BottomSheet
      visible
      title={t('editor.category')}
      onClose={onClose}
      onSave={save}
    >
      <CategoryPicker
        value={category}
        error={error ? t(error) : undefined}
        onChange={setCategory}
      />
    </BottomSheet>
  );
}

function UnitSheet({ product, onSave, onClose }: SheetProps) {
  const { t } = useTranslation();
  const [unit, setUnit] = useState<ProductUnit | null>(product.unit);

  return (
    <BottomSheet
      visible
      title={t('editor.unit')}
      onClose={onClose}
      onSave={() => onSave({ unit })}
    >
      <UnitChips selected={unit} onSelect={setUnit} />
      <ThemedText type="caption">{t('editor.unitHint')}</ThemedText>
    </BottomSheet>
  );
}
