import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { OnboardingStep } from '@/onboarding/onboarding-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedView } from '@/ui/components/commons/themed-view';

import { BatteryStep } from './battery-step';
import { NotificationsStep } from './notifications-step';

export function OnboardingScreen({
  step,
  onAdvance,
  onDismiss,
}: {
  step: OnboardingStep;
  onAdvance: () => void;
  onDismiss: () => void;
}) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {step === 'notifications' ? (
          <NotificationsStep onGranted={onAdvance} onDismissed={onDismiss} />
        ) : (
          <BatteryStep onDone={onDismiss} />
        )}
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
