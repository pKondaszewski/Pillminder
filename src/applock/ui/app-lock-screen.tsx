import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { SplashView } from '@/commons/ui/splash-view';

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
      navigationBarTranslucent
      onRequestClose={() => {}}
    >
      <Pressable
        style={styles.cover}
        accessibilityRole="button"
        accessibilityLabel={t('appLock.unlock')}
        onPress={onUnlock}
      >
        <SplashView />
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cover: {
    flex: 1,
  },
});
