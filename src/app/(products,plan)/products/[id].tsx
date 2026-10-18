import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { isoDay } from '@/config/date-utils';
import { editedProductInput } from '@/products/product-form';
import type { Product } from '@/products/product-service';
import { lastUsedText } from '@/products/product-text';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDate, formatTime } from '@/ui/commons/format-date';
import { openStore } from '@/ui/commons/open-store';
import { Snackbar } from '@/ui/components/commons/snackbar';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { DetailsSection } from '@/ui/components/products/details-section';
import {
  ProductFieldSheet,
  type ProductSheetField,
} from '@/ui/components/products/field-sheets';
import { ProductNotes } from '@/ui/components/products/notes';
import {
  ArchiveProductDialog,
  DeleteProductDialog,
  ProductActions,
} from '@/ui/components/products/product-actions';
import { ProductHeader } from '@/ui/components/products/product-header';
import { RecentDaysSection } from '@/ui/components/products/recent-days';
import { ScheduleSection } from '@/ui/components/products/schedule-section';
import { StockCard } from '@/ui/components/products/stock-card';
import { useProductImages } from '@/ui/hooks/use-product-images';
import { useProducts } from '@/ui/hooks/use-products';
import { useRecentDays } from '@/ui/hooks/use-recent-days';
import { useReorderStatuses } from '@/ui/hooks/use-reorder';
import { useRunWithErrorAlert } from '@/ui/hooks/use-run-with-error-alert';
import { useSchedules } from '@/ui/hooks/use-schedules';
import { useSettings } from '@/ui/hooks/use-settings';
import { useStockActions } from '@/ui/hooks/use-stock-actions';

type Sheet =
  | { kind: 'field'; field: ProductSheetField }
  | { kind: 'archive' | 'delete' };

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const product = products.find((p) => p.id === id);

  return product ? <ProductDetail product={product} /> : null;
}

function ProductDetail({ product }: { product: Product }) {
  const { t, i18n } = useTranslation();
  const { currency } = useSettings();
  const { editProduct, removeProduct, archiveProduct, restoreProduct } =
    useProducts();
  const { schedules } = useSchedules();
  const reorderStatuses = useReorderStatuses();
  const { images } = useProductImages(product.id);
  const recent = useRecentDays(product.id);
  const stock = useStockActions(product);

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const runThenCloseSheet = useRunWithErrorAlert(() => setSheet(null));
  const runThenGoBack = useRunWithErrorAlert(() => router.back());
  const runWithAlert = useRunWithErrorAlert();

  const now = new Date();
  const productSchedules = schedules.filter((s) => s.productId === product.id);
  const archived = product.status === 'archived';

  const openDay = (day: Date) =>
    router.navigate({ pathname: '/', params: { date: isoDay(day) } });
  const openCalendar = () =>
    router.navigate({
      pathname: '/',
      params: { calendarProductId: product.id },
    });
  const editField = (field: ProductSheetField) =>
    setSheet({ kind: 'field', field });

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <ProductHeader
          product={product}
          photoCount={images.length}
          lastUsed={lastUsedText(
            product.lastUsedAt,
            now,
            t,
            formatDate,
            formatTime,
          )}
          onPhotosPress={() => router.push(`/products/${product.id}/photos`)}
          onNamePress={() => editField('name')}
          onCategoryPress={() => editField('category')}
        />
        <StockCard
          product={product}
          reorder={reorderStatuses[product.id]}
          now={now}
          onDecrease={() => stock.step(-1)}
          onIncrease={() => stock.step(1)}
          onAddPack={stock.addPack}
          onEditStock={() => editField('stock')}
          onOrder={() => openStore(product.storeLink)}
        />
        <ScheduleSection
          schedules={productSchedules}
          unit={product.unit}
          canAdd={!archived}
          now={now}
          onOpen={(scheduleId) => router.push(`/schedules/${scheduleId}`)}
          onAdd={() =>
            router.push({
              pathname: '/schedules/new',
              params: { productId: product.id, locked: '1' },
            })
          }
        />
        <RecentDaysSection
          recent={recent}
          onDayPress={openDay}
          onCalendarPress={openCalendar}
        />
        <ProductNotes productId={product.id} />
        <DetailsSection
          product={product}
          currency={currency}
          locale={i18n.language}
          onEdit={editField}
          onFastingChange={(fasting) =>
            runWithAlert(
              () =>
                editProduct(
                  product.id,
                  editedProductInput(product, { fasting }),
                ),
              'products.errorSave',
            )
          }
        />
        <ProductActions
          status={product.status}
          onArchive={() => setSheet({ kind: 'archive' })}
          onRestore={() =>
            runWithAlert(
              () => restoreProduct(product.id),
              'products.errorRestore',
            )
          }
          onDelete={() => setSheet({ kind: 'delete' })}
        />
      </ScrollView>

      {stock.undoable ? (
        <Snackbar
          key={stock.undoable.id}
          message={stock.undoable.message}
          actionLabel={t('products.detail.undo')}
          onAction={stock.undo}
          onDismiss={stock.dismissUndo}
        />
      ) : null}

      {sheet?.kind === 'field' ? (
        <ProductFieldSheet
          field={sheet.field}
          product={product}
          currency={currency}
          onSave={(patch) =>
            runThenCloseSheet(
              () => editProduct(product.id, editedProductInput(product, patch)),
              'products.errorSave',
            )
          }
          onClose={() => setSheet(null)}
        />
      ) : null}

      {sheet?.kind === 'archive' ? (
        <ArchiveProductDialog
          productName={product.name}
          onConfirm={(completionNote) =>
            runThenCloseSheet(
              () => archiveProduct(product.id, completionNote),
              'products.errorArchive',
            )
          }
          onCancel={() => setSheet(null)}
        />
      ) : null}

      {sheet?.kind === 'delete' ? (
        <DeleteProductDialog
          productName={product.name}
          onConfirm={() =>
            runThenGoBack(
              () => removeProduct(product.id),
              'products.errorDelete',
            )
          }
          onArchiveInstead={() => setSheet({ kind: 'archive' })}
          onCancel={() => setSheet(null)}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: Spacing.twentyFour,
    padding: Spacing.twenty,
    paddingBottom: Spacing.twentyFour * 3,
  },
});
