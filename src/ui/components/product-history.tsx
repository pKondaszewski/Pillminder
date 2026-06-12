import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import type { HistoryEntry } from '@/doses/dose-service';
import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDateTime } from '@/ui/commons/format-date';
import { useProductHistory } from '@/ui/hooks/use-product-history';

const TAKEN_COLOR = '#3aa76d';
const SKIPPED_COLOR = '#d9534f';

export function ProductHistory({ productId }: { productId: string }) {
  const { t } = useTranslation();
  const entries = useProductHistory(productId);

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="small">{t('editor.history')}</ThemedText>
      {entries.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('editor.historyEmpty')}
        </ThemedText>
      ) : (
        entries.map((entry) => <HistoryRow key={entry.id} entry={entry} />)
      )}
    </ThemedView>
  );
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const { t } = useTranslation();
  const taken = entry.status === 'taken';

  return (
    <ThemedView type="backgroundElement" style={styles.row}>
      <ThemedText type="small">{formatDateTime(entry.plannedAt)}</ThemedText>
      <ThemedText
        type="smallBold"
        style={{ color: taken ? TAKEN_COLOR : SKIPPED_COLOR }}
      >
        {taken ? t('history.taken') : t('history.skipped')}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
  },
});
