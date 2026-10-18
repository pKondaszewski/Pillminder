import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import { PrimaryButton, SecondaryButton } from '@/ui/components/commons/button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  bullets?: string[];
  children?: ReactNode;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  bullets = [],
  children,
  confirmLabel,
  destructive,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  const body = (
    <>
      {message ? (
        <ThemedText themeColor="textSecondary">{message}</ThemedText>
      ) : null}
      {bullets.map((bullet) => (
        <ThemedText key={bullet} themeColor="textSecondary">
          • {bullet}
        </ThemedText>
      ))}
      {children}
      <ThemedView style={styles.actions}>
        <SecondaryButton label={t('editor.cancel')} onPress={onCancel} />
        <PrimaryButton
          label={confirmLabel}
          onPress={onConfirm}
          danger={destructive}
        />
      </ThemedView>
    </>
  );

  if (!destructive) {
    return (
      <BottomSheet visible={visible} title={title} onClose={onCancel}>
        {body}
      </BottomSheet>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}
    >
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.overlay }]}
        onPress={onCancel}
        accessibilityLabel={t('editor.close')}
      />
      <ThemedView style={styles.center} pointerEvents="box-none">
        <ThemedView style={styles.dialog}>
          <ThemedText type="subtitle">{title}</ThemedText>
          {body}
        </ThemedView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.twenty,
    backgroundColor: 'transparent',
  },
  dialog: {
    alignSelf: 'stretch',
    gap: Spacing.twelve,
    padding: Spacing.twenty,
    borderRadius: Radius.card,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
});
