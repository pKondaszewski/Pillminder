import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { Chip } from '@/ui/components/commons/chip';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  label: string;
  canGoNext: boolean;
  showBackToToday: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOpenCalendar: () => void;
  onBackToToday: () => void;
};

export function DayPager({
  label,
  canGoNext,
  showBackToToday,
  onPrevious,
  onNext,
  onOpenCalendar,
  onBackToToday,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ArrowButton
          symbol="‹"
          accessibilityLabel={t('home.pager.previousDay')}
          onPress={onPrevious}
        />
        <Pressable
          onPress={onOpenCalendar}
          accessibilityRole="button"
          accessibilityLabel={t('home.pager.openCalendar')}
          style={({ pressed }) => [styles.date, pressed && styles.pressed]}
        >
          <ThemedText type="subtitle">{label}</ThemedText>
        </Pressable>
        <ArrowButton
          symbol="›"
          accessibilityLabel={t('home.pager.nextDay')}
          disabled={!canGoNext}
          onPress={onNext}
        />
      </View>
      {showBackToToday ? (
        <View style={styles.backToToday}>
          <Chip
            label={t('home.pager.backToToday')}
            selected={false}
            onPress={onBackToToday}
          />
        </View>
      ) : null}
    </View>
  );
}

function ArrowButton({
  symbol,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  symbol: string;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.arrow,
        { borderColor: theme.borderStrong },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <ThemedText type="subtitle">{symbol}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.eight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.twelve,
  },
  arrow: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderWidth: 1,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    flex: 1,
    minHeight: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backToToday: {
    alignSelf: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
