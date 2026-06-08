import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { TodayDose } from '@/doses/dose-service';
import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatTime } from '@/ui/commons/format-date';
import { DoseStatusDot } from '@/ui/components/dose-status-dot';
import { TabSwipe } from '@/ui/components/tab-swipe';
import { useTodaysDoses } from '@/ui/hooks/use-todays-doses';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { doses, takeDose, untakeDose } = useTodaysDoses();

  const displayName = (dose: TodayDose) =>
    dose.productName ?? t('home.unknownProduct');

  const confirmUndo = (item: TodayDose) => {
    Alert.alert(
      t('home.undoTitle'),
      t('home.undoConfirm', { name: displayName(item) }),
      [
        { text: t('editor.cancel'), style: 'cancel' },
        { text: t('home.undo'), onPress: () => untakeDose(item.id) },
      ],
    );
  };

  const renderItem = ({ item }: { item: TodayDose }) => {
    return (
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedView style={styles.rowLeading}>
          <DoseStatusDot taken={item.taken} />
          <ThemedView style={styles.rowInfo}>
            <ThemedText type="smallBold">
              {formatTime(item.plannedAt)}
            </ThemedText>
            <ThemedText>{displayName(item)}</ThemedText>
            {!item.taken && item.snoozedUntil ? (
              <ThemedText type="small" themeColor="textSecondary">
                {t('home.snoozed', { time: formatTime(item.snoozedUntil) })}
              </ThemedText>
            ) : null}
          </ThemedView>
        </ThemedView>

        {item.taken ? (
          <Pressable
            onPress={() => confirmUndo(item)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedText type="small" themeColor="textSecondary">
              ✓ {item.takenAt ? formatTime(item.takenAt) : ''}
            </ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => takeDose(item.id)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="backgroundSelected" style={styles.takeButton}>
              <ThemedText type="smallBold" style={styles.takeText}>
                {t('home.take')}
              </ThemedText>
            </ThemedView>
          </Pressable>
        )}
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
      </ThemedView>
    </TabSwipe>
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
  takeButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  takeText: {
    color: '#3c87f7',
  },
  pressed: {
    opacity: 0.7,
  },
});
