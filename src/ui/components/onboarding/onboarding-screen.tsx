import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { OnboardingStep } from '@/onboarding/onboarding-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedView } from '@/ui/components/commons/themed-view';

import { BatteryStep } from './battery-step';
import { NotificationsStep } from './notifications-step';
import type { OnboardingProgress } from './onboarding-step-layout';

export function OnboardingScreen({
  step,
  progress,
  onAdvance,
  onDismiss,
}: {
  step: OnboardingStep;
  progress: OnboardingProgress;
  onAdvance: () => void;
  onDismiss: () => void;
}) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {step === 'notifications' ? (
          <NotificationsStep
            progress={progress}
            onGranted={onAdvance}
            onDismissed={onDismiss}
          />
        ) : (
          <BatteryStep progress={progress} onDone={onDismiss} />
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
    paddingHorizontal: Spacing.twentyFour,
    paddingVertical: Spacing.twentyFour,
  },
});
