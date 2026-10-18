import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  handledCountsText,
  type TimeSlotGroup,
  timeSlotLayout,
  type TodayDose,
} from '@/doses/dose-service';
import { Spacing } from '@/ui/commons/constants/theme';
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

  return (
    <View style={styles.section}>
      <ThemedText type="label">{slotName}</ThemedText>
      {layout.visible.map((dose) => (
        <View key={dose.id}>{renderDose(dose)}</View>
      ))}
      {layout.showAllCount !== null ? (
        <Pressable
          onPress={() => setExpanded(true)}
          accessibilityRole="button"
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="smallBold" themeColor="accent">
            {t('home.showAll', { count: layout.showAllCount })}
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
  pressed: {
    opacity: 0.7,
  },
});
