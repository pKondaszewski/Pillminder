import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { describeRhythm, type Schedule } from '@/schedules/schedule-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDate } from '@/ui/commons/format-date';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { useProducts } from '@/ui/hooks/use-products';
import { useSchedules } from '@/ui/hooks/use-schedules';

export default function ScheduleListScreen() {
  const { t } = useTranslation();
  const { products } = useProducts();
  const { schedules } = useSchedules();

  const findProduct = (id: string) => products.find((p) => p.id === id);

  const now = new Date();

  const renderItem = ({ item }: { item: Schedule }) => {
    const product = findProduct(item.productId);
    return (
      <Pressable
        onPress={() => router.push(`/schedules/${item.id}`)}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedView type="surface" style={styles.row}>
          <ThemedText>
            {product?.name ?? t('schedule.unknownProduct')}
          </ThemedText>
          <ThemedText type="small">
            {describeRhythm(item, t, formatDate, product?.unit ?? null, now)}
          </ThemedText>
        </ThemedView>
      </Pressable>
    );
  };

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FlatList
            data={schedules}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            ListFooterComponent={
              <Pressable
                onPress={() => router.push('/schedules/new')}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView type="surface" style={styles.addRow}>
                  <ThemedText type="smallBold" themeColor="accent">
                    {t('schedule.add')}
                  </ThemedText>
                </ThemedView>
              </Pressable>
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
    paddingHorizontal: Spacing.twentyFour,
    gap: Spacing.sixteen,
  },
  list: {
    gap: Spacing.eight,
    paddingVertical: Spacing.sixteen,
  },
  row: {
    padding: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
    gap: Spacing.four,
  },
  addRow: {
    padding: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
