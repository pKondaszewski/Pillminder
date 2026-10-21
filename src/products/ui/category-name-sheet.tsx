import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { DestructiveButton } from '@/commons/ui/button';
import { TextField } from '@/commons/ui/text-field';
import {
  checkCustomCategoryName,
  MAX_CUSTOM_CATEGORY_LENGTH,
} from '@/products/category';

type Props = {
  originalName: string | null;
  customCategories: string[];
  onSave: (name: string) => void;
  onDelete: (name: string) => void;
  onClose: () => void;
};

export function CategoryNameSheet({
  originalName,
  customCategories,
  onSave,
  onDelete,
  onClose,
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

  const title = t(
    originalName === null ? 'editor.newCategoryTitle' : 'editor.editCategory',
  );

  return (
    <BottomSheet visible title={title} onClose={onClose} onSave={save}>
      <TextField
        value={text}
        onChangeText={(next) => {
          setText(next);
          setError(null);
        }}
        maxLength={MAX_CUSTOM_CATEGORY_LENGTH}
        autoFocus
        accessibilityLabel={
          originalName === null ? t('editor.newCategory') : title
        }
        placeholder={t('editor.newCategoryPlaceholder')}
        error={error ? t(`editor.categoryName.${error}`) : undefined}
      />
      {originalName === null ? null : (
        <DestructiveButton
          label={t('editor.delete')}
          onPress={() => onDelete(originalName)}
        />
      )}
    </BottomSheet>
  );
}
