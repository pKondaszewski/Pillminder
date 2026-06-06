import { useTranslation } from 'react-i18next';
import { Button, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';
import { Spacing } from '@/ui/constants/theme';

import { useProducts } from './use-products';

export default function ProductListScreen() {
  const { t } = useTranslation();
  const { products, addProduct } = useProducts();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title">{t('products.title')}</ThemedText>

        <Button
          title={t('products.addTest')}
          onPress={() =>
            addProduct({
              name: `Witamina D ${products.length + 1}`,
              category: 'supplement',
            })
          }
        />

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.row}>
              <ThemedText>{item.name}</ThemedText>
              <ThemedText type="small">
                {t(`category.${item.category}`)}
              </ThemedText>
            </ThemedView>
          )}
          ListEmptyComponent={
            <ThemedText type="small">{t('products.empty')}</ThemedText>
          }
        />
      </SafeAreaView>
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
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
});
