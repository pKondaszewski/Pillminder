import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Chip } from '@/commons/ui/chip';
import { ConfirmDialog } from '@/commons/ui/confirm-dialog';
import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { useTheme } from '@/commons/ui/use-theme';
import {
  BUILT_IN_CATEGORIES,
  categoryLabel,
  isBuiltInCategory,
} from '@/products/category';
import { removeCategoryProducts } from '@/products/product-orchestrator';
import {
  listProductIdsByCategory,
  renameCustomCategory,
} from '@/products/product-service';
import { CategoryNameSheet } from '@/products/ui/category-name-sheet';
import { useCustomCategories } from '@/products/ui/use-custom-categories';

type Props = {
  value: string;
  error?: string;
  onChange: (category: string) => void;
  onProductsRemoved?: (productIds: string[]) => void;
};

type Dialog =
  | { kind: 'name'; originalName: string | null }
  | { kind: 'delete'; category: string; productCount: number };

export function CategoryPicker(props: Props) {
  const { picker, dialogs } = useCategoryPicker(props);
  return (
    <>
      {picker}
      {dialogs}
    </>
  );
}

// Dialogs are returned apart from the chips, so a caller living inside a Modal
// can render them next to it instead of nesting a second Modal.
export function useCategoryPicker({
  value,
  error,
  onChange,
  onProductsRemoved,
}: Props): { picker: ReactNode; dialogs: ReactNode; dialogOpen: boolean } {
  const { t } = useTranslation();
  const theme = useTheme();
  const { categories: savedCategories, reload } = useCustomCategories();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const run = useRunWithErrorAlert();

  const unsavedSelection =
    value !== '' &&
    !isBuiltInCategory(value) &&
    !savedCategories.includes(value);
  const customCategories = unsavedSelection
    ? [...savedCategories, value]
    : savedCategories;

  const pressChip = (category: string) => {
    if (isBuiltInCategory(category)) {
      onChange(category);
      return;
    }
    setDialog({ kind: 'name', originalName: category });
  };

  const saveName = (originalName: string | null, name: string) => {
    setDialog(null);
    if (originalName === null || originalName === name) {
      onChange(name);
      return;
    }
    run(async () => {
      const renamed = await renameCustomCategory(originalName, name);
      reload();
      onChange(renamed);
    }, 'editor.categoryRenameError');
  };

  const askDelete = (category: string) =>
    run(async () => {
      const productCount = (await listProductIdsByCategory(category)).length;
      setDialog({ kind: 'delete', category, productCount });
    }, 'editor.categoryDeleteError');

  const confirmDelete = (category: string) => {
    setDialog(null);
    run(async () => {
      const removedIds = await removeCategoryProducts(category);
      reload();
      if (value === category) onChange('');
      onProductsRemoved?.(removedIds);
    }, 'editor.categoryDeleteError');
  };

  const picker = (
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
            selected={category === value}
            onPress={() => pressChip(category)}
          />
        ))}
        <Chip
          label={t('editor.addCategory')}
          selected={false}
          onPress={() => setDialog({ kind: 'name', originalName: null })}
        />
      </ThemedView>
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );

  const dialogs = (
    <>
      {dialog?.kind === 'name' ? (
        <CategoryNameSheet
          originalName={dialog.originalName}
          customCategories={customCategories}
          onSave={(name) => saveName(dialog.originalName, name)}
          onDelete={askDelete}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.kind === 'delete' ? (
        <ConfirmDialog
          visible
          destructive
          title={t('editor.deleteCategoryTitle')}
          message={
            dialog.productCount > 0
              ? t('editor.deleteCategoryWithProducts', {
                  count: dialog.productCount,
                })
              : t('editor.deleteCategoryEmpty')
          }
          confirmLabel={t('editor.delete')}
          onConfirm={() => confirmDelete(dialog.category)}
          onCancel={() => setDialog(null)}
        />
      ) : null}
    </>
  );

  return { picker, dialogs, dialogOpen: dialog !== null };
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
