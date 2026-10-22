import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { Chip } from '@/commons/ui/chip';
import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { useTheme } from '@/commons/ui/use-theme';
import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import { createLogger } from '@/config/logger';
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
import { categoryRenameChange } from '@/products/product-undo';
import { CategoryActions } from '@/products/ui/category-actions';
import { CategoryNameForm } from '@/products/ui/category-name-form';
import { useCustomCategories } from '@/products/ui/use-custom-categories';

const log = createLogger('category-picker');

type Props = {
  value: string;
  error?: string;
  onChange: (category: string) => void;
  runWithUndo: RunWithUndo;
  onProductsRemoved?: (productIds: string[]) => void;
};

type Step =
  | { kind: 'name'; originalName: string | null }
  | { kind: 'delete'; category: string; productCount: number };

type Editor = { title: string; body: ReactNode; close: () => void };

export function CategoryPicker(props: Props) {
  const { picker, editor } = useCategoryPicker(props);
  return (
    <>
      {picker}
      {editor ? (
        <BottomSheet visible title={editor.title} onClose={editor.close}>
          {editor.body}
        </BottomSheet>
      ) : null}
    </>
  );
}

// The editor is returned apart from the chips as plain content: a caller living
// inside a BottomSheet swaps it in for the chips, so there is only ever one Modal.
export function useCategoryPicker({
  value,
  error,
  onChange,
  runWithUndo,
  onProductsRemoved,
}: Props): { picker: ReactNode; editor: Editor | null } {
  const { t } = useTranslation();
  const theme = useTheme();
  const { categories: savedCategories, reload } = useCustomCategories();
  const [step, setStep] = useState<Step | null>(null);
  const run = useRunWithErrorAlert();

  const unsavedSelection =
    value !== '' &&
    !isBuiltInCategory(value) &&
    !savedCategories.includes(value);
  const customCategories = unsavedSelection
    ? [...savedCategories, value]
    : savedCategories;

  const close = () => setStep(null);

  const pressChip = (category: string) => {
    if (isBuiltInCategory(category)) {
      onChange(category);
      return;
    }
    setStep({ kind: 'name', originalName: category });
  };

  const saveName = (originalName: string | null, name: string) => {
    close();
    if (originalName === null || originalName === name) {
      onChange(name);
      return;
    }
    log.info(`Renaming category "${originalName}" to "${name}"`);
    void runWithUndo(
      categoryRenameChange(
        originalName,
        name,
        t('editor.categoryRenamed', { name }),
        async (from, to) => {
          await renameCustomCategory(from, to);
          reload();
          onChange(to);
        },
      ),
      'editor.categoryRenameError',
    );
  };

  // A category without products only exists as the current selection
  const removeUnsavedCategory = (category: string) =>
    void runWithUndo(
      {
        message: t('editor.categoryDeleted', { name: category }),
        apply: () => {
          if (value === category) onChange('');
        },
        revert: () => onChange(category),
      },
      'editor.categoryDeleteError',
    );

  const askDelete = (category: string) =>
    run(async () => {
      const productCount = (await listProductIdsByCategory(category)).length;
      log.info(`Deleting category "${category}" (${productCount} products)`);
      if (productCount === 0) {
        close();
        removeUnsavedCategory(category);
        return;
      }
      setStep({ kind: 'delete', category, productCount });
    }, 'editor.categoryDeleteError');

  const confirmDelete = (category: string) => {
    close();
    run(async () => {
      log.info(`Confirmed deleting category "${category}" with its products`);
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
          onPress={() => setStep({ kind: 'name', originalName: null })}
        />
      </ThemedView>
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );

  const editor: Editor | null =
    step?.kind === 'name'
      ? {
          title: t(
            step.originalName === null
              ? 'editor.newCategoryTitle'
              : 'editor.editCategory',
          ),
          body: (
            <CategoryNameForm
              originalName={step.originalName}
              customCategories={customCategories}
              onSave={(name) => saveName(step.originalName, name)}
              onDelete={askDelete}
              onCancel={close}
            />
          ),
          close,
        }
      : step?.kind === 'delete'
        ? {
            title: t('editor.deleteCategoryTitle'),
            body: (
              <>
                <ThemedText themeColor="textSecondary">
                  {t('editor.deleteCategoryWithProducts', {
                    count: step.productCount,
                  })}
                </ThemedText>
                <CategoryActions
                  confirmLabel={t('editor.delete')}
                  danger
                  onConfirm={() => confirmDelete(step.category)}
                  onCancel={close}
                />
              </>
            ),
            close,
          }
        : null;

  return { picker, editor };
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
