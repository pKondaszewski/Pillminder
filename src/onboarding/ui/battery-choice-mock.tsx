import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';

const OPTIONS = [
  { key: 'onboarding.batteryOptionUnrestricted', highlighted: true },
  { key: 'onboarding.batteryOptionOptimized', highlighted: false },
  { key: 'onboarding.batteryOptionRestricted', highlighted: false },
] as const;

export function BatteryChoiceMock() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ThemedView
      type="surface"
      style={[styles.card, { borderColor: theme.border }]}
    >
      <ThemedText type="smallBold">
        {t('onboarding.batteryMockTitle')}
      </ThemedText>
      {OPTIONS.map(({ key, highlighted }) => (
        <ThemedView
          key={key}
          type={highlighted ? 'accentSoft' : 'surface'}
          style={[styles.option, highlighted && { borderColor: theme.accent }]}
        >
          <ThemedView
            type={highlighted ? 'accent' : 'borderStrong'}
            style={styles.radio}
          />
          <ThemedText
            type={highlighted ? 'smallBold' : 'small'}
            themeColor={highlighted ? 'accent' : 'text'}
          >
            {t(key)}
          </ThemedText>
        </ThemedView>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.eight,
    padding: Spacing.fourteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    padding: Spacing.twelve,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: Radius.button,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: Radius.pill,
  },
});
