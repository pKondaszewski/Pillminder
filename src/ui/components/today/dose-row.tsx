import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  doseDetailsText,
  type DoseStatus,
  doseStatus,
  type TodayDose,
} from '@/doses/dose-service';
import { Radius, Spacing, type ThemeColor } from '@/ui/commons/constants/theme';
import { Icon } from '@/ui/components/commons/icon';
import { ProductAvatar } from '@/ui/components/commons/product-avatar';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { DoseActionButton } from '@/ui/components/today/dose-action-button';
import { useFormatTime } from '@/ui/hooks/use-format-date';
import { useTheme } from '@/ui/hooks/use-theme';

export type DayMode = 'today' | 'past' | 'future';

type Props = {
  dose: TodayDose;
  mode: DayMode;
  now: Date;
  onTake: (dose: TodayDose) => void;
  onSkip: (dose: TodayDose) => void;
  onRevert: (dose: TodayDose) => void;
  onCorrect: (dose: TodayDose) => void;
};

export function DoseRow({
  dose,
  mode,
  now,
  onTake,
  onSkip,
  onRevert,
  onCorrect,
}: Props) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const status = doseStatus(dose, now);
  const details = doseDetailsText(dose, t);
  const tinted = mode === 'today' && status === 'overdue';
  const handled = status === 'taken' || status === 'skipped';
  const onPress = rowPressHandler(mode, handled, dose, onRevert, onCorrect);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView
        type={tinted ? 'overdueSoft' : 'background'}
        style={styles.row}
      >
        <ThemedText type="mono" themeColor="textSecondary" style={styles.time}>
          {formatTime(dose.plannedAt)}
        </ThemedText>
        <ProductAvatar
          category={dose.category}
          size={36}
          imageFileName={dose.profileImageFileName}
          dimmed={handled}
        />
        <View style={styles.info}>
          <ThemedText
            style={status === 'taken' && styles.struck}
            numberOfLines={1}
          >
            {dose.productName}
          </ThemedText>
          {details ? (
            <ThemedText type="small" themeColor="textSecondary">
              {details}
            </ThemedText>
          ) : null}
          {dose.snoozedUntil && status !== 'taken' ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('home.snoozed', {
                time: formatTime(dose.snoozedUntil),
              })}
            </ThemedText>
          ) : null}
        </View>
        <DoseTrailing
          dose={dose}
          mode={mode}
          now={now}
          onTake={onTake}
          onSkip={onSkip}
        />
      </ThemedView>
    </Pressable>
  );
}

function DoseTrailing({
  dose,
  mode,
  now,
  onTake,
  onSkip,
}: {
  dose: TodayDose;
  mode: DayMode;
  now: Date;
  onTake: Props['onTake'];
  onSkip: Props['onSkip'];
}) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const theme = useTheme();
  const status = doseStatus(dose, now);
  const statusText = (
    <ThemedText type="small" themeColor={STATUS_TEXT_COLORS[status]}>
      {statusLabel(dose, status, t, formatTime)}
    </ThemedText>
  );

  if (mode === 'past') {
    return (
      <View style={styles.trailing}>
        {statusText}
        <Icon name="chevron_right" size={20} color={theme.textTertiary} />
      </View>
    );
  }
  if (mode === 'future') return null;
  if (status === 'taken' || status === 'skipped') return statusText;

  return (
    <View style={styles.trailing}>
      {status === 'overdue' ? (
        <DoseActionButton label={t('home.skip')} onPress={() => onSkip(dose)} />
      ) : null}
      <DoseActionButton
        label={t('home.take')}
        filled={status === 'overdue'}
        onPress={() => onTake(dose)}
      />
    </View>
  );
}

function rowPressHandler(
  mode: DayMode,
  handled: boolean,
  dose: TodayDose,
  onRevert: Props['onRevert'],
  onCorrect: Props['onCorrect'],
): (() => void) | undefined {
  if (mode === 'past') return () => onCorrect(dose);
  if (mode === 'today' && handled) return () => onRevert(dose);
  return undefined;
}

function statusLabel(
  dose: TodayDose,
  status: DoseStatus,
  t: TFunction,
  formatTime: (date: Date) => string,
): string {
  if (status === 'taken') {
    return t('home.taken', {
      time: dose.takenAt ? formatTime(dose.takenAt) : '',
    });
  }
  if (status === 'skipped') return t('home.skipped');
  if (status === 'overdue') return t('home.unticked');
  return '';
}

const STATUS_TEXT_COLORS: Record<DoseStatus, ThemeColor> = {
  taken: 'takenText',
  overdue: 'overdueText',
  skipped: 'skippedText',
  planned: 'textSecondary',
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    paddingVertical: Spacing.ten,
    paddingHorizontal: Spacing.twelve,
    borderRadius: Radius.button,
  },
  time: {
    width: 48,
  },
  info: {
    flex: 1,
  },
  trailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
  },
  struck: {
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.7,
  },
});
