import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { DestructiveButton } from '@/commons/ui/button';
import { TextField } from '@/commons/ui/text-field';
import {
  checkCustomCategoryName,
  MAX_CUSTOM_CATEGORY_LENGTH,
} from '@/products/category';
import { CategoryActions } from '@/products/ui/category-actions';

type Props = {
  originalName: string | null;
  customCategories: string[];
  onSave: (name: string) => void;
  onDelete: (name: string) => void;
  onCancel: () => void;
};

export function CategoryNameForm({
  originalName,
  customCategories,
  onSave,
  onDelete,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [text, setText] = useState(originalName ?? '');
  const [error, setError] = useState<'blank' | 'taken' | null>(null);

  const save = () => {
    const check = checkCustomCategoryName(text, originalName, customCategories);
    if (check.error) {
      setError(check.error);
      return;
    }
    onSave(check.name);
  };

  return (
    <>
      <TextField
        value={text}
        onChangeText={(next) => {
          setText(next);
          setError(null);
        }}
        maxLength={MAX_CUSTOM_CATEGORY_LENGTH}
        autoFocus
        accessibilityLabel={t(
          originalName === null ? 'editor.newCategory' : 'editor.editCategory',
        )}
        placeholder={t('editor.newCategoryPlaceholder')}
        error={error ? t(`editor.categoryName.${error}`) : undefined}
      />
      {originalName === null ? null : (
        <DestructiveButton
          label={t('editor.delete')}
          onPress={() => onDelete(originalName)}
        />
      )}
      <CategoryActions
        confirmLabel={t('editor.save')}
        onConfirm={save}
        onCancel={onCancel}
      />
    </>
  );
}
