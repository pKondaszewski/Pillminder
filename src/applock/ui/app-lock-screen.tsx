import { useTranslation } from 'react-i18next';
import { Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppLogo } from '@/commons/ui/app-logo';
import { PrimaryButton } from '@/commons/ui/button';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';

type Props = {
  onUnlock: () => void;
};

export function AppLockScreen({ onUnlock }: Props) {
  const { t } = useTranslation();

  return (
    <Modal
      visible
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <ThemedView style={styles.cover}>
        <SafeAreaView style={styles.content}>
          <AppLogo size={72} />
          <ThemedText type="headline">{t('appLock.lockedTitle')}</ThemedText>
          <PrimaryButton label={t('appLock.unlock')} onPress={onUnlock} />
        </SafeAreaView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cover: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.twenty,
    paddingHorizontal: Spacing.twenty,
  },
});
