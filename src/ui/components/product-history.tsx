import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import type { HistoryEntry } from '@/doses/dose-service';
import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDateTime } from '@/ui/commons/format-date';
import { useProductHistory } from '@/ui/hooks/use-product-history';

const TAKEN_COLOR = '#3aa76d';
const SKIPPED_COLOR = '#d9534f';
const COLLAPSED_COUNT = 5;

export function ProductHistory({ productId }: { productId: string }) {
  const { t } = useTranslation();
  const entries = useProductHistory(productId);
  const [expanded, setExpanded] = useState(false);

  const visible = expanded ? entries : entries.slice(0, COLLAPSED_COUNT);
  const canExpand = entries.length > COLLAPSED_COUNT;

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="small">{t('editor.history')}</ThemedText>
      {entries.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('editor.historyEmpty')}
        </ThemedText>
      ) : (
        visible.map((entry) => <HistoryRow key={entry.id} entry={entry} />)
      )}
      {canExpand ? (
        <Pressable
          onPress={() => setExpanded((prev) => !prev)}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="smallBold" style={styles.toggle}>
            {expanded ? t('editor.showLess') : t('editor.showMore')}
          </ThemedText>
        </Pressable>
      ) : null}
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
  toggle: {
    color: '#3c87f7',
    paddingVertical: Spacing.one,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
