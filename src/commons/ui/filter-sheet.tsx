import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { PrimaryButton, SecondaryButton } from '@/commons/ui/button';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedView } from '@/commons/ui/themed-view';

type Props = {
  visible: boolean;
  title: string;
  applyLabel: string;
  onClear: () => void;
  onClose: () => void;
  children: ReactNode;
};

export function FilterSheet({
  visible,
  title,
  applyLabel,
  onClear,
  onClose,
  children,
}: Props) {
  const { t } = useTranslation();

  return (
    <BottomSheet visible={visible} title={title} onClose={onClose}>
      {children}
      <ThemedView style={styles.actions}>
        <SecondaryButton label={t('filters.clear')} onPress={onClear} />
        <PrimaryButton label={applyLabel} onPress={onClose} />
      </ThemedView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
});
