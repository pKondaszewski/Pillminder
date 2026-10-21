import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_SIZE, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedText } from '@/commons/ui/themed-text';
import { useTheme } from '@/commons/ui/use-theme';
import {
  handledCountsText,
  type TimeSlotGroup,
  timeSlotLayout,
  type TodayDose,
} from '@/doses/dose-service';
import type { Intake } from '@/intakes/intake-service';

type Props = {
  group: TimeSlotGroup;
  renderDose: (dose: TodayDose) => ReactNode;
  renderIntake: (intake: Intake) => ReactNode;
};

export function TimeSlotSection({ group, renderDose, renderIntake }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);
  const layout = timeSlotLayout(group.data, expanded);
  const slotName = t(`home.slot.${group.slot}`);

  const intakes = group.intakes.map((intake) => (
    <View key={intake.id}>{renderIntake(intake)}</View>
  ));

  const overflowToggleLabel = expanded
    ? t('home.showLess')
    : t('home.showAll', {
        count: layout.kind === 'list' ? layout.overflowCount : null,
      });

  const plainHeader = (
    <ThemedText type="smallBold" themeColor="textSecondary">
      {slotName}
    </ThemedText>
  );

  const header =
    layout.kind === 'collapsed' ? (
      group.data.length > 0 ? (
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
      ) : (
        plainHeader
      )
    ) : layout.collapsible ? (
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
      plainHeader
    );

  return (
    <View style={styles.section}>
      {header}
      {layout.kind === 'list'
        ? layout.visible.map((dose) => (
            <View key={dose.id}>{renderDose(dose)}</View>
          ))
        : null}
      {intakes}
      {layout.kind === 'list' && layout.overflowCount !== null ? (
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
