import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing, type ThemeColor } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { useTheme } from '@/commons/ui/use-theme';
import {
  doseDetailsText,
  type DoseStatus,
  doseStatus,
  type TodayDose,
} from '@/doses/dose-service';
import { DoseActionButton } from '@/doses/ui/dose-action-button';
import {
  type DayMode,
  type RowPressAction,
  rowPressAction,
} from '@/doses/ui/dose-row-action';

type Props = {
  dose: TodayDose;
  mode: DayMode;
  now: Date;
  onTake: (dose: TodayDose) => void;
  onSkip: (dose: TodayDose) => void;
  onRevert: (dose: TodayDose) => void;
  onCorrect: (dose: TodayDose) => void;
  onOpenProduct: (dose: TodayDose) => void;
};

type RowPressHandlers = {
  onOpenProduct: (dose: TodayDose) => void;
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
  onOpenProduct,
}: Props) {
  const { t } = useTranslation();
  const { formatTime } = useFormatTime();
  const status = doseStatus(dose, now);
  const details = doseDetailsText(dose, t);
  const tinted = mode === 'today' && status === 'overdue';
  const handled = status === 'taken' || status === 'skipped';
  const action = rowPressAction(mode, handled);
  const pressHandler = pressHandlerFor(action, {
    onOpenProduct,
    onRevert,
    onCorrect,
  });
  const openProduct = () => onOpenProduct(dose);

  return (
    <Pressable
      onPress={() => pressHandler(dose)}
      onLongPress={openProduct}
      accessibilityHint={t(`home.rowHint.${action}`)}
      accessibilityActions={[
        { name: 'longpress', label: t('home.rowHint.open') },
      ]}
      onAccessibilityAction={openProduct}
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

function pressHandlerFor(
  action: RowPressAction,
  handlers: RowPressHandlers,
): (dose: TodayDose) => void {
  switch (action) {
    case 'open':
      return handlers.onOpenProduct;
    case 'revert':
      return handlers.onRevert;
    case 'correct':
      return handlers.onCorrect;
  }
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
