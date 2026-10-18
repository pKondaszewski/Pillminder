import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  handledCountsText,
  type TimeSlotGroup,
  timeSlotLayout,
  type TodayDose,
} from '@/doses/dose-service';
import { MIN_TOUCH_SIZE, Spacing } from '@/ui/commons/constants/theme';
import { Icon } from '@/ui/components/commons/icon';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  group: TimeSlotGroup;
  renderDose: (dose: TodayDose) => ReactNode;
};

export function TimeSlotSection({ group, renderDose }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const layout = timeSlotLayout(group.data, expanded);
  const slotName = t(`home.slot.${group.slot}`);

  if (layout.kind === 'collapsed') {
    return (
      <Pressable
        onPress={() => setExpanded(true)}
        accessibilityRole="button"
        accessibilityLabel={t('home.expandSlot', { slot: slotName })}
        style={({ pressed }) => [styles.collapsed, pressed && styles.pressed]}
      >
        <ThemedText type="smallBold" themeColor="textSecondary">
          {t('home.slotSummary', {
            slot: slotName,
            counts: handledCountsText(layout.taken, layout.skipped, t),
          })}
        </ThemedText>
        <Icon name="chevron_right" size={20} color={theme.textTertiary} />
      </Pressable>
    );
  }

  const overflowToggleLabel = expanded
    ? t('home.showLess')
    : t('home.showAll', { count: layout.overflowCount });

  return (
    <View style={styles.section}>
      {layout.collapsible ? (
        <Pressable
          onPress={() => setExpanded(false)}
          accessibilityRole="button"
          accessibilityLabel={t('home.collapseSlot', { slot: slotName })}
          style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        >
          <ThemedText type="smallBold" themeColor="textSecondary">
            {slotName}
          </ThemedText>
          <Icon name="expand_less" size={20} color={theme.textTertiary} />
        </Pressable>
      ) : (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {slotName}
        </ThemedText>
      )}
      {layout.visible.map((dose) => (
        <View key={dose.id}>{renderDose(dose)}</View>
      ))}
      {layout.overflowCount !== null ? (
        <Pressable
          onPress={() => setExpanded(!expanded)}
          accessibilityRole="button"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="smallBold" themeColor="accent">
            {overflowToggleLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.four,
  },
  collapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.twelve,
  },
  header: {
    minHeight: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.7,
  },
});
