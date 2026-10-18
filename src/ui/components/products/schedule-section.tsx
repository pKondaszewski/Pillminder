import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import type { Product } from '@/products/product-service';
import { describeRhythm, type Schedule } from '@/schedules/schedule-service';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { formatDate } from '@/ui/commons/format-date';
import { Icon } from '@/ui/components/commons/icon';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { ProductSection } from '@/ui/components/products/section';
import { useTheme } from '@/ui/hooks/use-theme';

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
                {describeRhythm(schedule, t, formatDate, unit, now)}
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
