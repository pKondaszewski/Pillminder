import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_SIZE } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

type Props = {
  month: Date;
  onChangeMonth: (offset: number) => void;
};

export function monthName(month: Date, t: TFunction): string {
  return t(`calendar.month.${MONTH_KEYS[month.getMonth()]}`);
}

export function MonthHeader({ month, onChangeMonth }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.monthHeader}>
      <MonthButton
        symbol="‹"
        accessibilityLabel={t('calendar.previousMonth')}
        onPress={() => onChangeMonth(-1)}
      />
      <ThemedText type="headline">
        {`${monthName(month, t)} ${month.getFullYear()}`}
      </ThemedText>
      <MonthButton
        symbol="›"
        accessibilityLabel={t('calendar.nextMonth')}
        onPress={() => onChangeMonth(1)}
      />
    </View>
  );
}

function MonthButton({
  symbol,
  accessibilityLabel,
  onPress,
}: {
  symbol: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
    >
      <ThemedText type="subtitle" themeColor="accent">
        {symbol}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
