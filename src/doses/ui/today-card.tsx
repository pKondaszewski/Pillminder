import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/commons/ui/button';
import { Radius, Spacing, type ThemeColor } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedText } from '@/commons/ui/themed-text';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { useTheme } from '@/commons/ui/use-theme';
import {
  BULK_TAKE_MIN_OVERDUE,
  dayCountsText,
  type DaySymbol,
  durationText,
  handledCountsText,
  skyTone,
  type TimelineMark,
  type TodayCardState,
  type TodayDose,
} from '@/doses/dose-service';
import { DayTimeline } from '@/doses/ui/day-timeline';

type Props = {
  state: TodayCardState;
  marks: TimelineMark[];
  nowPosition: number | null;
  symbol: DaySymbol | null;
  onTake: (dose: TodayDose) => void;
  onTakeOverdue: (doses: TodayDose[]) => void;
};

const TITLE_COLORS: Record<TodayCardState['kind'], ThemeColor> = {
  calm: 'text',
  overdue: 'overdueText',
  done: 'takenText',
  pastSummary: 'text',
  futureSummary: 'text',
};

export function TodayCard({
  state,
  marks,
  nowPosition,
  symbol,
  onTake,
  onTakeOverdue,
}: Props) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const theme = useTheme();
  const { title, lines } = cardCopy(state, t, formatTime);
  const sky = skyTone(state, symbol);
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      onPress={() => setExpanded(!expanded)}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessibilityLabel={t(
        expanded ? 'home.card.hideDetails' : 'home.card.showDetails',
      )}
      style={[
        styles.card,
        { backgroundColor: theme.background, borderColor: theme.border },
      ]}
    >
      <DayTimeline
        marks={marks}
        nowPosition={nowPosition}
        symbol={symbol}
        skyTone={sky}
      >
        <View style={styles.text}>
          <ThemedText
            type="headline"
            themeColor={TITLE_COLORS[state.kind]}
            style={styles.centered}
          >
            {title}
          </ThemedText>
          {lines.map((line) => (
            <ThemedText
              key={line}
              type="small"
              themeColor="textSecondary"
              style={styles.centered}
            >
              {line}
            </ThemedText>
          ))}
        </View>
      </DayTimeline>
      {state.kind === 'overdue' ? (
        <View style={styles.action}>
          <PrimaryButton
            label={overdueActionLabel(state.overdue, t)}
            onPress={() =>
              isBulk(state.overdue)
                ? onTakeOverdue(state.overdue)
                : onTake(state.overdue[0])
            }
          />
        </View>
      ) : null}
      <View style={styles.details}>
        {expanded ? (
          <ThemedText type="small" themeColor="textSecondary">
            {countLine(state, t)}
          </ThemedText>
        ) : null}
        <Icon
          name={expanded ? 'expand_less' : 'expand_more'}
          size={20}
          color={theme.textTertiary}
        />
      </View>
    </Pressable>
  );
}

function isBulk(overdue: TodayDose[]): boolean {
  return overdue.length >= BULK_TAKE_MIN_OVERDUE;
}

function cardCopy(
  state: TodayCardState,
  t: TFunction,
  formatTime: (date: Date) => string,
): { title: string; lines: string[] } {
  switch (state.kind) {
    case 'calm':
      return {
        title: t('home.card.calm.title'),
        lines: [
          t('home.card.calm.next', {
            duration: durationText(state.untilNextMs, t),
          }),
          t('home.card.nextDose', {
            name: state.next.productName,
            time: formatTime(state.next.plannedAt),
          }),
        ],
      };
    case 'overdue':
      return overdueCopy(state, t);
    case 'done':
      return state.counts.skipped === 0
        ? {
            title: t('home.card.done.title'),
            lines: [t('home.card.allTaken', { count: state.counts.total })],
          }
        : {
            title: t('home.card.done.closedTitle'),
            lines: [
              handledCountsText(state.counts.taken, state.counts.skipped, t),
            ],
          };
    case 'pastSummary':
      return { title: t('home.card.pastTitle'), lines: [] };
    case 'futureSummary':
      return { title: t('home.card.futureTitle'), lines: [] };
  }
}

function overdueCopy(
  state: Extract<TodayCardState, { kind: 'overdue' }>,
  t: TFunction,
): { title: string; lines: string[] } {
  const duration = durationText(state.oldestLateMs, t);
  const names = state.names.join(', ');
  if (!isBulk(state.overdue)) {
    return {
      title: t('home.card.overdueOne', { duration }),
      lines: [names],
    };
  }
  const others =
    state.otherCount > 0
      ? ` ${t('home.card.others', { count: state.otherCount })}`
      : '';
  return {
    title: t('home.card.overdueMany', {
      count: state.overdue.length,
      duration,
    }),
    lines: [`${names}${others}`],
  };
}

function overdueActionLabel(overdue: TodayDose[], t: TFunction): string {
  return isBulk(overdue)
    ? t('home.bulkTake', { count: overdue.length })
    : t('home.take');
}

function countLine(state: TodayCardState, t: TFunction): string {
  return state.kind === 'futureSummary'
    ? t('home.card.futureCount', { count: state.counts.planned })
    : dayCountsText(state.counts, t);
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.twelve,
    padding: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  text: {
    gap: Spacing.four,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  centered: {
    textAlign: 'center',
  },
  action: {
    flexDirection: 'row',
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
