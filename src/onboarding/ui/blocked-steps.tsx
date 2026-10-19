import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';

const STEP_KEYS = [
  'onboarding.blockedStepOpen',
  'onboarding.blockedStepNotifications',
  'onboarding.blockedStepAllow',
] as const;

export function BlockedSteps() {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.list}>
      {STEP_KEYS.map((key, index) => (
        <ThemedView key={key} style={styles.row}>
          <ThemedView type="accentSoft" style={styles.number}>
            <ThemedText type="smallBold" themeColor="accent">
              {index + 1}
            </ThemedText>
          </ThemedView>
          <ThemedText style={styles.text}>{t(key)}</ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.twelve,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
  },
  number: {
    width: 28,
    height: 28,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
  },
});
