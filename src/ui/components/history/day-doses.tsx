import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import {
  doseQuantityText,
  groupDosesByProduct,
  type TodayDose,
} from '@/doses/dose-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatTime } from '@/ui/commons/format-date';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { DoseStatusDot } from '@/ui/components/doses/status-dot';

export function DayDoses({ doses, now }: { doses: TodayDose[]; now: Date }) {
  const { t } = useTranslation();

  if (doses.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        {t('history.emptyDay')}
      </ThemedText>
    );
  }

  return (
    <ThemedView style={styles.groups}>
      {groupDosesByProduct(doses).map((group) => (
        <ThemedView key={group.productId} style={styles.group}>
          <ThemedText type="smallBold">{group.productName}</ThemedText>
          {group.doses.map((dose) => (
            <DoseRow key={dose.id} dose={dose} now={now} />
          ))}
        </ThemedView>
      ))}
    </ThemedView>
  );
}

function DoseRow({ dose, now }: { dose: TodayDose; now: Date }) {
  const { t } = useTranslation();
  const quantityText = doseQuantityText(dose.quantity, dose.unit, t);
  const stateLabels = {
    taken: t('home.taken', {
      time: dose.takenAt ? formatTime(dose.takenAt) : '',
    }),
    skipped: t('home.skipped'),
    pending: dose.plannedAt < now ? t('history.status.missed') : '',
  };

  return (
    <ThemedView type="surface" style={styles.row}>
      <ThemedView style={styles.rowLeading}>
        <DoseStatusDot state={dose.state} />
        <ThemedText type="smallBold">{formatTime(dose.plannedAt)}</ThemedText>
        {quantityText ? (
          <ThemedText type="small" themeColor="textSecondary">
            {quantityText}
          </ThemedText>
        ) : null}
      </ThemedView>
      <ThemedText type="small" themeColor="textSecondary">
        {stateLabels[dose.state]}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  groups: {
    gap: Spacing.sixteen,
  },
  group: {
    gap: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.sixteen,
    borderRadius: Spacing.eight,
  },
  rowLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.eight,
    backgroundColor: 'transparent',
  },
});
