import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import type { Product } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import {
  DestructiveButton,
  SecondaryButton,
} from '@/ui/components/commons/button';
import { ConfirmDialog } from '@/ui/components/commons/confirm-dialog';
import { TextField } from '@/ui/components/commons/text-field';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type ActionsProps = {
  status: Product['status'];
  onArchive: () => void;
  onRestore: () => void;
  onDelete: () => void;
};

type ArchiveDialogProps = {
  productName: string;
  onConfirm: (completionNote?: string) => void;
  onCancel: () => void;
};

type DeleteDialogProps = {
  productName: string;
  onConfirm: () => void;
  onArchiveInstead: () => void;
  onCancel: () => void;
};

export function ProductActions({
  status,
  onArchive,
  onRestore,
  onDelete,
}: ActionsProps) {
  const { t } = useTranslation();
  const archived = status === 'archived';

  return (
    <ThemedView style={styles.actions}>
      <SecondaryButton
        label={archived ? t('editor.restore') : t('editor.archive')}
        onPress={archived ? onRestore : onArchive}
      />
      <DestructiveButton
        label={t('products.detail.deleteProduct')}
        onPress={onDelete}
      />
    </ThemedView>
  );
}

export function ArchiveProductDialog({
  productName,
  onConfirm,
  onCancel,
}: ArchiveDialogProps) {
  const { t } = useTranslation();
  const [completionNote, setCompletionNote] = useState('');

  return (
    <ConfirmDialog
      visible
      title={t('products.detail.archiveTitle', { name: productName })}
      bullets={[
        t('products.detail.archiveReminders'),
        t('products.detail.archiveKept'),
        t('products.detail.archiveRestore'),
      ]}
      confirmLabel={t('editor.archive')}
      onConfirm={() => onConfirm(completionNote.trim() || undefined)}
      onCancel={onCancel}
    >
      <TextField
        value={completionNote}
        onChangeText={setCompletionNote}
        multiline
        accessibilityLabel={t('notes.completionPrompt')}
        placeholder={t('notes.completionPlaceholder')}
      />
    </ConfirmDialog>
  );
}

export function DeleteProductDialog({
  productName,
  onConfirm,
  onArchiveInstead,
  onCancel,
}: DeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <ConfirmDialog
      visible
      destructive
      title={t('products.detail.deleteTitle', { name: productName })}
      message={t('products.detail.deleteWarning')}
      confirmLabel={t('products.detail.deleteForever')}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      <Pressable
        onPress={onArchiveInstead}
        accessibilityRole="button"
        hitSlop={Spacing.eight}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedText type="smallBold" themeColor="accent">
          {t('products.detail.deleteInstead')}
        </ThemedText>
      </Pressable>
    </ConfirmDialog>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
  pressed: {
    opacity: 0.7,
  },
});
