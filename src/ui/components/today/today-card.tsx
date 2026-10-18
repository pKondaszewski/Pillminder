import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import {
  BULK_TAKE_MIN_OVERDUE,
  dayCountsText,
  durationText,
  handledCountsText,
  type TimelineMark,
  type TodayCardState,
  type TodayDose,
} from '@/doses/dose-service';
import { Radius, Spacing, type ThemeColor } from '@/ui/commons/constants/theme';
import { PrimaryButton } from '@/ui/components/commons/button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { DayTimeline } from '@/ui/components/today/day-timeline';
import { useFormatTime } from '@/ui/hooks/use-format-date';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  state: TodayCardState;
  marks: TimelineMark[];
  nowPosition: number | null;
  onTake: (dose: TodayDose) => void;
  onTakeOverdue: (doses: TodayDose[]) => void;
};

const CARD_COLORS: Record<
  TodayCardState['kind'],
  { background: ThemeColor; border: ThemeColor; title: ThemeColor }
> = {
  calm: { background: 'background', border: 'border', title: 'text' },
  overdue: {
    background: 'overdueCard',
    border: 'overdueCardBorder',
    title: 'overdueText',
  },
  done: {
    background: 'takenCard',
    border: 'takenCardBorder',
    title: 'takenText',
  },
  pastSummary: { background: 'surface', border: 'surface', title: 'text' },
  futureSummary: { background: 'surface', border: 'surface', title: 'text' },
};

export function TodayCard({
  state,
  marks,
  nowPosition,
  onTake,
  onTakeOverdue,
}: Props) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const theme = useTheme();
  const colors = CARD_COLORS[state.kind];
  const { title, lines } = cardCopy(state, t, formatTime);

  return (
    <ThemedView
      type={colors.background}
      style={[styles.card, { borderColor: theme[colors.border] }]}
    >
      <View style={styles.text}>
        <ThemedText type="headline" themeColor={colors.title}>
          {title}
        </ThemedText>
        {lines.map((line) => (
          <ThemedText key={line} type="small" themeColor="textSecondary">
            {line}
          </ThemedText>
        ))}
      </View>
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
      <DayTimeline marks={marks} nowPosition={nowPosition} />
      <ThemedText type="small" themeColor="textSecondary">
        {countLine(state, t)}
      </ThemedText>
    </ThemedView>
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
  },
  action: {
    flexDirection: 'row',
  },
});
