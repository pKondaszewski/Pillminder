import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NewProductInput } from '@/products/dto/new-product-input';
import type { Product, ProductStatus } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { ProductEditorModal } from '@/ui/components/products/editor-modal';
import { ProductOverviewModal } from '@/ui/components/products/overview-modal';
import { ProductPeriodModal } from '@/ui/components/products/period-modal';
import { ProductRow } from '@/ui/components/products/row';
import { useProducts } from '@/ui/hooks/use-products';
import { useReorderStatuses } from '@/ui/hooks/use-reorder';
import { useRunThenCloseEditor } from '@/ui/hooks/use-run-then-close-editor';

export default function ProductListScreen() {
  const { t } = useTranslation();
  const {
    products,
    addProduct,
    editProduct,
    removeProduct,
    archiveProduct,
    restoreProduct,
  } = useProducts();
  const reorderStatuses = useReorderStatuses();

  const sortedProducts = [...products].sort(
    (a, b) => statusRank(a.status) - statusRank(b.status),
  );

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const editedProduct = products.find((p) => p.id === editing?.id) ?? editing;

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setEditorOpen(true);
  };

  const closeEditor = () => setEditorOpen(false);

  const renderItem = ({ item }: { item: Product }) => (
    <ProductRow
      product={item}
      reorder={reorderStatuses[item.id]}
      onPress={() => openEdit(item)}
    />
  );

  const runThenCloseEditor = useRunThenCloseEditor(closeEditor);

  const handleSave = (input: NewProductInput) =>
    runThenCloseEditor(
      () => (editing ? editProduct(editing.id, input) : addProduct(input)),
      'products.errorSave',
    );

  const handleDelete = (id: string) =>
    runThenCloseEditor(() => removeProduct(id), 'products.errorDelete');

  const handleArchive = (id: string, completionNote?: string) =>
    runThenCloseEditor(
      () => archiveProduct(id, completionNote),
      'products.errorArchive',
    );

  const handleRestore = (id: string) =>
    runThenCloseEditor(() => restoreProduct(id), 'products.errorRestore');

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FlatList
            data={sortedProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            ListFooterComponent={
              <ThemedView style={styles.footer}>
                {[
                  { label: `+ ${t('products.add')}`, onPress: openCreate },
                  {
                    label: t('overview.open'),
                    onPress: () => setOverviewOpen(true),
                  },
                  {
                    label: t('period.open'),
                    onPress: () => setPeriodOpen(true),
                  },
                ].map(({ label, onPress }) => (
                  <Pressable
                    key={label}
                    onPress={onPress}
                    accessibilityRole="button"
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <ThemedView type="backgroundElement" style={styles.addRow}>
                      <ThemedText themeColor="accent" style={styles.addText}>
                        {label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                ))}
              </ThemedView>
            }
          />
        </SafeAreaView>

        <ProductEditorModal
          visible={editorOpen}
          product={editedProduct}
          onClose={closeEditor}
          onSave={handleSave}
          onDelete={handleDelete}
          onArchive={handleArchive}
          onRestore={handleRestore}
        />

        <ProductOverviewModal
          visible={overviewOpen}
          onClose={() => setOverviewOpen(false)}
        />

        <ProductPeriodModal
          visible={periodOpen}
          onClose={() => setPeriodOpen(false)}
        />
      </ThemedView>
    </TabSwipe>
  );
}

function statusRank(status: ProductStatus): number {
  return status === 'archived' ? 1 : 0;
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
  footer: {
    gap: Spacing.two,
  },
  addRow: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  addText: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
