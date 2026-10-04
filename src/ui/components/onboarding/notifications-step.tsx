import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Pressable, StyleSheet } from 'react-native';

import { permissionStep } from '@/onboarding/onboarding-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useNotificationPermission } from '@/ui/hooks/use-notification-permission';
import { useTheme } from '@/ui/hooks/use-theme';

export function NotificationsStep({
  onGranted,
  onDismissed,
}: {
  onGranted: () => void;
  onDismissed: () => void;
}) {
  const { t } = useTranslation();
  const { permission, busy, request } = useNotificationPermission();
  const step = permission ? permissionStep(permission) : null;

  useEffect(() => {
    if (step === 'granted') onGranted();
  }, [step, onGranted]);

  if (!step || step === 'granted') return null;

  return (
    <ThemedView style={styles.step}>
      <ThemedView style={styles.texts}>
        <ThemedText type="title">{t('onboarding.title')}</ThemedText>
        <ThemedText themeColor="textSecondary">
          {t('onboarding.intro')}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          • {t('onboarding.featureDose')}
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          • {t('onboarding.featureReorder')}
        </ThemedText>
        {step === 'blocked' && (
          <ThemedText type="smallBold">{t('onboarding.blocked')}</ThemedText>
        )}
      </ThemedView>

      <ThemedView style={styles.actions}>
        {step === 'askable' ? (
          <PrimaryButton
            label={t('onboarding.allow')}
            onPress={request}
            disabled={busy}
          />
        ) : (
          <PrimaryButton
            label={t('onboarding.openSettings')}
            onPress={() => void Linking.openSettings()}
          />
        )}
        <Pressable
          onPress={onDismissed}
          accessibilityRole="button"
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
        >
          <ThemedText type="small" themeColor="textSecondary">
            {t(
              step === 'askable' ? 'onboarding.notNow' : 'onboarding.continue',
            )}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

function PrimaryButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => (pressed || disabled) && styles.pressed}
    >
      <ThemedView style={[styles.primary, { backgroundColor: theme.accent }]}>
        <ThemedText type="smallBold" style={styles.primaryLabel}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  step: {
    flex: 1,
    justifyContent: 'space-between',
  },
  texts: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
  },
  primary: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#ffffff',
  },
  skip: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
