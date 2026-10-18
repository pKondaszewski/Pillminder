import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import {
  BUILT_IN_CATEGORIES,
  categoryLabel,
  MAX_CUSTOM_CATEGORY_LENGTH,
  normalizeCategory,
} from '@/products/category';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { Chip } from '@/ui/components/commons/chip';
import { TextField } from '@/ui/components/commons/text-field';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useCustomCategories } from '@/ui/hooks/use-custom-categories';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  value: string;
  error?: string;
  onChange: (category: string) => void;
};

export function CategoryPicker({ value, error, onChange }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const customCategories = useCustomCategories();
  const [newName, setNewName] = useState<string | null>(null);
  const adding = newName !== null;

  const select = (category: string) => {
    setNewName(null);
    onChange(category);
  };

  const startAdding = () => {
    if (adding) return;
    setNewName('');
    onChange('');
  };

  const changeNewName = (text: string) => {
    setNewName(text);
    onChange(normalizeCategory(text, customCategories) ?? '');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.chips,
          { borderColor: error ? theme.danger : 'transparent' },
        ]}
      >
        {[...BUILT_IN_CATEGORIES, ...customCategories].map((category) => (
          <Chip
            key={category}
            label={categoryLabel(category, t)}
            selected={!adding && category === value}
            onPress={() => select(category)}
          />
        ))}
        <Chip
          label={t('editor.addCategory')}
          selected={adding}
          onPress={startAdding}
        />
      </ThemedView>
      {adding ? (
        <TextField
          value={newName}
          onChangeText={changeNewName}
          maxLength={MAX_CUSTOM_CATEGORY_LENGTH}
          autoFocus
          accessibilityLabel={t('editor.newCategory')}
          placeholder={t('editor.newCategoryPlaceholder')}
        />
      ) : null}
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.eight,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
    padding: Spacing.four,
    borderWidth: 1,
    borderRadius: Radius.button,
  },
});
