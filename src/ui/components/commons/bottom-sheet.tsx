import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { PrimaryButton, SecondaryButton } from '@/ui/components/commons/button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSave?: () => void;
  children: ReactNode;
};

// Without onSave the content brings its own actions (FilterSheet, ConfirmDialog)
export function BottomSheet({
  visible,
  title,
  onClose,
  onSave,
  children,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Pressable
          style={[styles.backdrop, { backgroundColor: theme.overlay }]}
          onPress={onClose}
          accessibilityLabel={t('editor.close')}
        />
        <ThemedView
          style={[styles.sheet, { paddingBottom: bottom + Spacing.sixteen }]}
        >
          <ThemedView
            type="borderStrong"
            style={styles.handle}
            accessibilityElementsHidden
          />
          <ThemedText type="subtitle">{title}</ThemedText>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            {children}
          </ScrollView>
          {onSave ? (
            <ThemedView style={styles.actions}>
              <SecondaryButton label={t('editor.cancel')} onPress={onClose} />
              <PrimaryButton label={t('editor.save')} onPress={onSave} />
            </ThemedView>
          ) : null}
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    maxHeight: '85%',
    gap: Spacing.sixteen,
    paddingHorizontal: Spacing.twenty,
    paddingTop: Spacing.twelve,
    borderTopLeftRadius: Radius.sheet,
    borderTopRightRadius: Radius.sheet,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    gap: Spacing.sixteen,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
});
