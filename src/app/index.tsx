import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { doseQuantityText, type TodayDose } from '@/doses/dose-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatTime } from '@/ui/commons/format-date';
import { Snackbar } from '@/ui/components/commons/snackbar';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { DoseStatusDot } from '@/ui/components/doses/status-dot';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { useTodaysDoses } from '@/ui/hooks/use-todays-doses';
import { useUndoableDoseAction } from '@/ui/hooks/use-undoable-dose-action';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { doses, takeDose, untakeDose, skipDose, unskipDose } =
    useTodaysDoses();
  const actions = useMemo(
    () => ({
      taken: { apply: takeDose, revert: untakeDose },
      skipped: { apply: skipDose, revert: unskipDose },
    }),
    [takeDose, untakeDose, skipDose, unskipDose],
  );
  const { undoable, applyWithUndo, revert, undoLast, dismissUndo } =
    useUndoableDoseAction(actions);

  const confirmRevert = (item: TodayDose, kind: 'taken' | 'skipped') => {
    const { title, message } =
      kind === 'taken'
        ? { title: 'home.undoTitle', message: 'home.undoConfirm' }
        : { title: 'home.unskipTitle', message: 'home.unskipConfirm' };
    Alert.alert(t(title), t(message, { name: item.productName }), [
      { text: t('editor.cancel'), style: 'cancel' },
      { text: t('home.undo'), onPress: () => revert(kind, item.id) },
    ]);
  };

  const renderItem = ({ item }: { item: TodayDose }) => {
    const quantityText = doseQuantityText(item.quantity, item.unit, t);
    return (
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedView style={styles.rowLeading}>
          <DoseStatusDot state={item.state} />
          <ThemedView style={styles.rowInfo}>
            <ThemedText type="smallBold">
              {formatTime(item.plannedAt)}
            </ThemedText>
            <ThemedText>{item.productName}</ThemedText>
            {quantityText ? (
              <ThemedText type="small" themeColor="textSecondary">
                {quantityText}
              </ThemedText>
            ) : null}
            {item.state === 'pending' && item.snoozedUntil ? (
              <ThemedText type="small" themeColor="textSecondary">
                {t('home.snoozed', { time: formatTime(item.snoozedUntil) })}
              </ThemedText>
            ) : null}
          </ThemedView>
        </ThemedView>

        <DoseActionButton
          state={item.state}
          takenAt={item.takenAt}
          onTake={() => applyWithUndo('taken', item.id)}
          onSkip={() => applyWithUndo('skipped', item.id)}
          onUndo={() => confirmRevert(item, 'taken')}
          onUnskip={() => confirmRevert(item, 'skipped')}
        />
      </ThemedView>
    );
  };

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FlatList
            data={doses}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            ListEmptyComponent={
              <ThemedText type="small">{t('home.empty')}</ThemedText>
            }
          />
        </SafeAreaView>
        {undoable ? (
          <Snackbar
            key={undoable.id}
            message={
              undoable.kind === 'taken'
                ? t('home.takenToast')
                : t('home.skippedToast')
            }
            actionLabel={t('home.undo')}
            onAction={undoLast}
            onDismiss={dismissUndo}
          />
        ) : null}
      </ThemedView>
    </TabSwipe>
  );
}

function DoseActionButton({
  state,
  takenAt,
  onTake,
  onSkip,
  onUndo,
  onUnskip,
}: {
  state: TodayDose['state'];
  takenAt: Date | null;
  onTake: () => void;
  onSkip: () => void;
  onUndo: () => void;
  onUnskip: () => void;
}) {
  const { t } = useTranslation();

  if (state === 'taken') {
    return (
      <Pressable
        onPress={onUndo}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedText type="small" themeColor="textSecondary">
          {t('home.taken', { time: takenAt ? formatTime(takenAt) : '' })}
        </ThemedText>
      </Pressable>
    );
  }

  if (state === 'skipped') {
    return (
      <Pressable
        onPress={onUnskip}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedText type="small" themeColor="textSecondary">
          {t('home.skipped')}
        </ThemedText>
      </Pressable>
    );
  }

  return (
    <ThemedView style={styles.actions}>
      <Pressable
        onPress={onSkip}
        hitSlop={Spacing.two}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedText type="small" themeColor="textSecondary">
          {t('home.skip')}
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={onTake}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedView type="backgroundSelected" style={styles.takeButton}>
          <ThemedText type="smallBold" themeColor="accent">
            {t('home.take')}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: Spacing.three,
  },
  rowLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  rowInfo: {
    gap: Spacing.one,
    backgroundColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: 'transparent',
  },
  takeButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
