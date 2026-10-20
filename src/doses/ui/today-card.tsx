import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/commons/ui/button';
import { Radius, Spacing, type ThemeColor } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { useTheme } from '@/commons/ui/use-theme';
import {
  BULK_TAKE_MIN_OVERDUE,
  dayCountsText,
  durationText,
  handledCountsText,
  type TodayCardState,
  type TodayDose,
} from '@/doses/dose-service';

type Props = {
  state: TodayCardState;
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

export function TodayCard({ state, onTake, onTakeOverdue }: Props) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const theme = useTheme();
  const { title, lines } = cardCopy(state, t, formatTime);

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.cardGlass, borderColor: theme.border },
      ]}
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
    </View>
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
  const { title, lines } = stateCopy(state, t, formatTime);
  const collected = t('home.card.collected', {
    taken: state.counts.taken,
    total: state.counts.total,
  });
  const showsCollected = state.kind === 'calm' || state.kind === 'overdue';
  return { title, lines: showsCollected ? [...lines, collected] : lines };
}

function stateCopy(
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
      return {
        title: t('home.card.pastTitle'),
        lines: [dayCountsText(state.counts, t)],
      };
    case 'futureSummary':
      return {
        title: t('home.card.futureTitle'),
        lines: [t('home.card.futureCount', { count: state.counts.planned })],
      };
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
});
