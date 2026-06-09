import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { products as productsTable } from '@/config/db/schema';
import type { NewProductInput } from '@/products/dto/new-product-input';
import { ProductEditorModal } from '@/ui/components/product-editor-modal';
import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';
import { Spacing } from '@/ui/commons/constants/theme';
import { TabSwipe } from '@/ui/components/tab-swipe';
import { useProducts } from '@/ui/hooks/use-products';
import { useReorderStatuses } from '@/ui/hooks/use-reorder';

type Product = typeof productsTable.$inferSelect;

export default function ProductListScreen() {
  const { t } = useTranslation();
  const { products, addProduct, editProduct, removeProduct } = useProducts();
  const reorderStatuses = useReorderStatuses();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setEditorOpen(true);
  };

  const closeEditor = () => setEditorOpen(false);

  const handleSave = async (input: NewProductInput) => {
    try {
      if (editing) {
        await editProduct(editing.id, input);
      } else {
        await addProduct(input);
      }
      closeEditor();
    } catch {
      // save failed — keep modal open so the user's input is not lost
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeProduct(id);
      closeEditor();
    } catch {
      // delete failed — keep modal open
    }
  };

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => {
              const reorder = reorderStatuses[item.id];
              return (
                <Pressable
                  onPress={() => openEdit(item)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView type="backgroundElement" style={styles.row}>
                    <ThemedText>{item.name}</ThemedText>
                    <ThemedText type="small">
                      {t(`category.${item.category}`)}
                    </ThemedText>
                    {reorder?.isLow && reorder.daysLeft !== null && (
                      <ThemedText type="small" style={styles.lowStock}>
                        {t('products.lowStock')} ·{' '}
                        {t('products.lowStockDays', {
                          days: Math.ceil(reorder.daysLeft),
                        })}
                      </ThemedText>
                    )}
                  </ThemedView>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <ThemedText type="small">{t('products.empty')}</ThemedText>
            }
            ListFooterComponent={
              <Pressable
                onPress={openCreate}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView type="backgroundElement" style={styles.addRow}>
                  <ThemedText style={styles.addText}>
                    + {t('products.add')}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            }
          />
        </SafeAreaView>

        <ProductEditorModal
          visible={editorOpen}
          product={editing}
          onClose={closeEditor}
          onSave={handleSave}
          onDelete={handleDelete}
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
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  addRow: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  addText: {
    color: '#3c87f7',
    fontWeight: '600',
  },
  lowStock: {
    color: '#d97706',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
