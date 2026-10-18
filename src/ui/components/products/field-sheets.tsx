import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { NewProductInput } from '@/products/dto/new-product-input';
import {
  textFieldPatch,
  type TextProductField,
  validateProductField,
} from '@/products/product-form';
import type { Product } from '@/products/product-service';
import type { ProductUnit } from '@/products/product-unit';
import type { Currency } from '@/settings/settings-store';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import { TextField } from '@/ui/components/commons/text-field';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { CategoryPicker } from '@/ui/components/products/category-picker';
import { StoreSuggestions } from '@/ui/components/products/store-suggestions';
import { UnitChips } from '@/ui/components/products/unit-chips';

export type ProductSheetField = TextProductField | 'category' | 'unit';

type SheetProps = {
  product: Product;
  currency: Currency;
  onSave: (patch: Partial<NewProductInput>) => void;
  onClose: () => void;
};

type Props = SheetProps & { field: ProductSheetField };

type TextSheetConfig = {
  title: string;
  placeholder?: string;
  hint?: string;
  numeric?: boolean;
  suggestions?: boolean;
};

const TEXT_SHEETS: Record<TextProductField, TextSheetConfig> = {
  name: { title: 'editor.name', placeholder: 'editor.namePlaceholder' },
  strength: {
    title: 'editor.strength',
    placeholder: 'editor.strengthPlaceholder',
  },
  price: { title: 'editor.price', hint: 'editor.priceHint', numeric: true },
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
  currency,
  onSave,
  onClose,
}: SheetProps & { field: TextProductField }) {
  const { t } = useTranslation();
  const config = TEXT_SHEETS[field];
  const current = product[field];
  const [text, setText] = useState(current == null ? '' : String(current));
  const [submitted, setSubmitted] = useState(false);
  const error = submitted ? validateProductField(field, text) : null;

  const save = () => {
    if (validateProductField(field, text)) {
      setSubmitted(true);
      return;
    }
    onSave(textFieldPatch(field, text));
  };

  return (
    <BottomSheet
      visible
      title={t(config.title, { currency })}
      onClose={onClose}
      onSave={save}
    >
      <TextField
        value={text}
        onChangeText={setText}
        keyboardType={config.numeric ? 'numeric' : 'default'}
        placeholder={config.placeholder ? t(config.placeholder) : undefined}
        accessibilityLabel={t(config.title, { currency })}
        error={error ? t(error) : undefined}
        autoFocus
      />
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
    onSave({ category });
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
    </BottomSheet>
  );
}
