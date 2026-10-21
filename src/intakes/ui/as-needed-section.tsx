import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { doseQuantityText } from '@/doses/dose-service';
import { type Intake, recentIntakeCount } from '@/intakes/intake-service';
import { AsNeededMark } from '@/intakes/ui/as-needed-mark';
import { ProductSection } from '@/products/ui/section';

const SHOWN_INTAKES = 5;

type Props = {
  intakes: Intake[];
  now: Date;
  onPress: (intake: Intake) => void;
};

export function AsNeededSection({ intakes, now, onPress }: Props) {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatTime();
  if (intakes.length === 0) return null;

  return (
    <ProductSection title={t('intake.historyTitle')}>
      <ThemedText type="small" themeColor="textSecondary">
        {t('intake.recentCount', { count: recentIntakeCount(intakes, now) })}
      </ThemedText>
      {intakes.slice(0, SHOWN_INTAKES).map((intake) => (
        <Pressable
          key={intake.id}
          onPress={() => onPress(intake)}
          accessibilityRole="button"
          accessibilityHint={t('intake.rowHint')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedView style={styles.row}>
            <AsNeededMark />
            <ThemedText type="small" themeColor="accent" style={styles.when}>
              {formatDateTime(intake.takenAt)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {doseQuantityText(intake.quantity, intake.unit, t) ?? ''}
            </ThemedText>
          </ThemedView>
        </Pressable>
      ))}
    </ProductSection>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
  },
  when: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
