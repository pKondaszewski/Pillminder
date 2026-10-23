import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { TextField } from '@/commons/ui/text-field';
import { ThemedText } from '@/commons/ui/themed-text';
import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import {
  categoryUnit,
  packSizeInMl,
  strengthTextKeys,
} from '@/products/category';
import type { NewProductInput } from '@/products/dto/new-product-input';
import {
  packSizeEstimate,
  packSizeText,
  PRICE_MAX_LENGTH,
  reorderThresholdPatch,
  storeLinkPatch,
  textFieldPatch,
  validateProductField,
  validateReorderThreshold,
} from '@/products/product-form';
import type {
  Product,
  ProductUnit,
  TextProductField,
} from '@/products/product-service';
import { isPlainTextStore } from '@/products/store-link';
import { useCategoryPicker } from '@/products/ui/category-picker';
import { StoreLinkTargetChips } from '@/products/ui/store-link-target-chips';
import { StoreSuggestions } from '@/products/ui/store-suggestions';
import { UnitChips } from '@/products/ui/unit-chips';

export type ProductSheetField =
  | TextProductField
  | 'category'
  | 'unit'
  | 'reorderThreshold';

type TextSheetField = TextProductField | 'reorderThreshold';

export type ProductEditedField = ProductSheetField | 'fasting';

export const PRODUCT_FIELD_LABEL_KEYS: Record<ProductEditedField, string> = {
  name: 'editor.name',
  category: 'editor.category',
  strength: 'editor.strength',
  unit: 'editor.unit',
  packSize: 'editor.packSize',
  reorderThreshold: 'editor.reorderThreshold',
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

type CategorySheetProps = SheetProps & {
  runWithUndo: RunWithUndo;
  onProductDeleted: () => void;
};

type Props = CategorySheetProps & { field: ProductSheetField };

type TextSheetConfig = {
  title: string;
  placeholder?: string;
  hint?: string;
  numeric?: boolean;
  maxLength?: number;
};

const TEXT_SHEETS: Record<TextSheetField, TextSheetConfig> = {
  name: { title: 'editor.name', placeholder: 'editor.namePlaceholder' },
  strength: { title: 'editor.strength' },
  price: {
    title: 'editor.price',
    placeholder: 'editor.pricePlaceholder',
    hint: 'editor.priceHint',
    maxLength: PRICE_MAX_LENGTH,
  },
  stock: { title: 'editor.stock', numeric: true },
  reorderThreshold: {
    title: 'editor.reorderThreshold',
    hint: 'editor.reorderThresholdHint',
    numeric: true,
  },
  packSize: {
    title: 'editor.packSize',
    placeholder: 'editor.packSizePlaceholder',
    numeric: true,
  },
  storeLink: {
    title: 'editor.storeLink',
    placeholder: 'editor.storeLinkPlaceholder',
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
}: SheetProps & { field: TextSheetField }) {
  const { t } = useTranslation();
  const config = TEXT_SHEETS[field];
  const inMl = field === 'packSize' && packSizeInMl(product.category);
  const texts = field === 'strength' ? strengthTextKeys(product.unit) : config;
  const placeholderKey = inMl
    ? 'editor.packSizeMlPlaceholder'
    : texts.placeholder;
  const title = t(inMl ? 'editor.packSizeMl' : config.title);
  const current =
    field === 'packSize'
      ? packSizeText(product.category, product.packSize)
      : product[field];
  const [text, setText] = useState(current == null ? '' : String(current));
  const [target, setTarget] = useState(product.storeLinkTarget);
  const estimate = packSizeEstimate(product.category, text);
  const [submitted, setSubmitted] = useState(false);
  const error = submitted ? validateTextSheet(field, text) : null;

  const save = () => {
    if (validateTextSheet(field, text)) {
      setSubmitted(true);
      return;
    }
    onSave(savePatch());
  };

  const savePatch = () => {
    if (field === 'reorderThreshold') return reorderThresholdPatch(text);
    if (field === 'storeLink') return storeLinkPatch(text, target);
    return textFieldPatch(field, text, product.category);
  };

  const changeText = (value: string) => {
    setText(value);
    if (field === 'storeLink') setTarget(null);
  };

  return (
    <BottomSheet visible title={title} onClose={onClose} onSave={save}>
      <TextField
        value={text}
        onChangeText={changeText}
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
      {texts.hint ? (
        <ThemedText type="caption">{t(texts.hint)}</ThemedText>
      ) : null}
      {field === 'storeLink' ? (
        <StoreSuggestions category={product.category} onPick={changeText} />
      ) : null}
      {field === 'storeLink' && isPlainTextStore(text) ? (
        <StoreLinkTargetChips selected={target} onSelect={setTarget} />
      ) : null}
    </BottomSheet>
  );
}

function validateTextSheet(field: TextSheetField, text: string) {
  return field === 'reorderThreshold'
    ? validateReorderThreshold(text)
    : validateProductField(field, text);
}

function CategorySheet({
  product,
  onSave,
  onClose,
  runWithUndo,
  onProductDeleted,
}: CategorySheetProps) {
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

  const { picker, editor } = useCategoryPicker({
    value: category,
    error: error ? t(error) : undefined,
    onChange: setCategory,
    runWithUndo,
    onProductsRemoved: (ids) => {
      if (ids.includes(product.id)) onProductDeleted();
    },
  });

  return (
    <BottomSheet
      visible
      title={editor?.title ?? t('editor.category')}
      onClose={editor?.close ?? onClose}
      onSave={editor ? undefined : save}
    >
      {editor?.body ?? picker}
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
