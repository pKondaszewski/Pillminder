import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { PrimaryButton, SecondaryButton } from '@/commons/ui/button';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedView } from '@/commons/ui/themed-view';

type Props = {
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function CategoryActions({
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  return (
    <ThemedView style={styles.actions}>
      <SecondaryButton label={t('editor.cancel')} onPress={onCancel} />
      <PrimaryButton label={confirmLabel} danger={danger} onPress={onConfirm} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
});
