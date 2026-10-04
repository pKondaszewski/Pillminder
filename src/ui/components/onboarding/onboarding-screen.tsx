import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedView } from '@/ui/components/commons/themed-view';

import { NotificationsStep } from './notifications-step';

export function OnboardingScreen({
  onFinish,
  onDismiss,
}: {
  onFinish: () => void;
  onDismiss: () => void;
}) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <NotificationsStep onGranted={onFinish} onDismissed={onDismiss} />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
});
