import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useFormatTime } from '@/ui/hooks/use-format-date';

type Props = {
  hasTimes: boolean;
  doses: Date[];
};

export function DosePreview({ hasTimes, doses }: Props) {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatTime();

  if (!hasTimes || doses.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary">
        {hasTimes ? t('schedule.previewNone') : t('schedule.previewEmpty')}
      </ThemedText>
    );
  }

  return (
    <ThemedView type="surface" style={styles.box}>
      {doses.map((dose) => (
        <ThemedText key={dose.toISOString()} type="mono">
          {formatDateTime(dose)}
        </ThemedText>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: Spacing.sixteen,
    borderRadius: Radius.card,
    gap: Spacing.four,
  },
});
