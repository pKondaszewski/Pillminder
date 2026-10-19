import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatDate, useFormatTime } from '@/commons/ui/use-format-date';
import { useTheme } from '@/commons/ui/use-theme';
import type { Product } from '@/products/product-service';
import { ProductSection } from '@/products/ui/section';
import { describeRhythm, type Schedule } from '@/schedules/schedule-service';

type Props = {
  schedules: Schedule[];
  unit: Product['unit'];
  canAdd: boolean;
  now: Date;
  onOpen: (scheduleId: string) => void;
  onAdd: () => void;
};

export function ScheduleSection({
  schedules,
  unit,
  canAdd,
  now,
  onOpen,
  onAdd,
}: Props) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const { formatTimes } = useFormatTime();
  const theme = useTheme();

  return (
    <ProductSection
      title={t('products.detail.schedules')}
      trailing={
        canAdd ? (
          <Pressable
            onPress={onAdd}
            accessibilityRole="button"
            hitSlop={Spacing.eight}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedText type="smallBold" themeColor="accent">
              {t('products.detail.addSchedule')}
            </ThemedText>
          </Pressable>
        ) : null
      }
    >
      {schedules.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('products.noSchedule')}
        </ThemedText>
      ) : (
        schedules.map((schedule) => (
          <Pressable
            key={schedule.id}
            onPress={() => onOpen(schedule.id)}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.card,
              { borderColor: theme.border },
              pressed && styles.pressed,
            ]}
          >
            <ThemedView style={styles.text}>
              <ThemedText type="small">
                {describeRhythm(
                  schedule,
                  t,
                  formatDate,
                  unit,
                  now,
                  formatTimes,
                )}
              </ThemedText>
            </ThemedView>
            <Icon name="chevron_right" size={20} color={theme.textTertiary} />
          </Pressable>
        ))
      )}
    </ProductSection>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    padding: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  text: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
