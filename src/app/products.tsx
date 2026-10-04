import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { products as productsTable } from '@/config/db/schema';
import type { NewProductInput } from '@/products/dto/new-product-input';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { ProductEditorModal } from '@/ui/components/products/editor-modal';
import { ProductOverviewModal } from '@/ui/components/products/overview-modal';
import { ProductRow } from '@/ui/components/products/row';
import { useProducts } from '@/ui/hooks/use-products';
import { useReorderStatuses } from '@/ui/hooks/use-reorder';

type Product = typeof productsTable.$inferSelect;

function statusRank(status: Product['status']): number {
  return status === 'archived' ? 1 : 0;
}

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

  const showFailure = (messageKey: string) =>
    Alert.alert(t('products.errorTitle'), t(messageKey));

  const renderItem = ({ item }: { item: Product }) => (
    <ProductRow
      product={item}
      reorder={reorderStatuses[item.id]}
      onPress={() => openEdit(item)}
    />
  );

  const handleSave = async (input: NewProductInput) => {
    try {
      if (editing) {
        await editProduct(editing.id, input);
      } else {
        await addProduct(input);
      }
      closeEditor();
    } catch {
      showFailure('products.errorSave');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeProduct(id);
      closeEditor();
    } catch {
      showFailure('products.errorDelete');
    }
  };

  const handleArchive = async (id: string, completionNote?: string) => {
    try {
      await archiveProduct(id, completionNote);
      closeEditor();
    } catch {
      showFailure('products.errorArchive');
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreProduct(id);
      closeEditor();
    } catch {
      showFailure('products.errorRestore');
    }
  };

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
                <Pressable
                  onPress={openCreate}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView type="backgroundElement" style={styles.addRow}>
                    <ThemedText themeColor="accent" style={styles.addText}>
                      + {t('products.add')}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
                <Pressable
                  onPress={() => setOverviewOpen(true)}
                  accessibilityRole="button"
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView type="backgroundElement" style={styles.addRow}>
                    <ThemedText themeColor="accent" style={styles.addText}>
                      {t('overview.open')}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
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
