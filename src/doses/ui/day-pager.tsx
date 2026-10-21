import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Chip } from '@/commons/ui/chip';
import {
  Colors,
  MIN_TOUCH_SIZE,
  Radius,
  Spacing,
} from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { useTheme } from '@/commons/ui/use-theme';

type Props = {
  label: string;
  canGoNext: boolean;
  showBackToToday: boolean;
  night: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onOpenCalendar: () => void;
  onBackToToday: () => void;
};

export function DayPager({
  label,
  canGoNext,
  showBackToToday,
  night,
  onPrevious,
  onNext,
  onOpenCalendar,
  onBackToToday,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = night ? Colors.dark : theme;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ArrowButton
          symbol="‹"
          night={night}
          accessibilityLabel={t('home.pager.previousDay')}
          onPress={onPrevious}
        />
        <Pressable
          onPress={onOpenCalendar}
          accessibilityRole="button"
          accessibilityLabel={t('home.pager.openCalendar')}
          style={({ pressed }) => [styles.date, pressed && styles.pressed]}
        >
          <ThemedText type="subtitle" style={{ color: colors.text }}>
            {label}
          </ThemedText>
        </Pressable>
        <ArrowButton
          symbol="›"
          night={night}
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
  night,
  accessibilityLabel,
  disabled,
  onPress,
}: {
  symbol: string;
  night: boolean;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const colors = night ? Colors.dark : theme;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.arrow,
        {
          borderColor: colors.borderStrong,
        },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <ThemedText type="subtitle" style={{ color: colors.text }}>
        {symbol}
      </ThemedText>
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
