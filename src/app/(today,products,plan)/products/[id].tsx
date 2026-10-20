import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/commons/ui/constants/theme';
import { KeyboardAwareScrollView } from '@/commons/ui/keyboard-aware-scroll-view';
import { openStore } from '@/commons/ui/open-store';
import { ThemedView } from '@/commons/ui/themed-view';
import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import { useFormatDate, useFormatTime } from '@/commons/ui/use-format-date';
import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import { isoDay } from '@/config/date-utils';
import { useRecentDays } from '@/doses/ui/use-recent-days';
import type { Product } from '@/products/product-service';
import { lastUsedText } from '@/products/product-text';
import { DetailsSection } from '@/products/ui/details-section';
import {
  ProductFieldSheet,
  type ProductSheetField,
} from '@/products/ui/field-sheets';
import { ProductNotes } from '@/products/ui/notes';
import {
  ArchiveProductDialog,
  DeleteProductDialog,
  ProductActions,
} from '@/products/ui/product-actions';
import { ProductHeader } from '@/products/ui/product-header';
import { RecentDaysSection } from '@/products/ui/recent-days';
import { ScheduleSection } from '@/products/ui/schedule-section';
import { StockCard } from '@/products/ui/stock-card';
import { useProductEditActions } from '@/products/ui/use-product-edit-actions';
import { useProductImages } from '@/products/ui/use-product-images';
import { useProducts } from '@/products/ui/use-products';
import { useReorderStatuses } from '@/products/ui/use-reorder';
import { useStockActions } from '@/products/ui/use-stock-actions';
import { useSchedules } from '@/schedules/ui/use-schedules';

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
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const { formatTime } = useFormatTime();
  const { removeProduct } = useProducts();
  const { schedules } = useSchedules();
  const reorderStatuses = useReorderStatuses();
  const { images } = useProductImages(product.id);
  const recent = useRecentDays(product.id);
  const { snackbar, runWithUndo } = useUndoSnackbar();
  const stock = useStockActions(product, runWithUndo);
  const edit = useProductEditActions(product, runWithUndo);

  const [sheet, setSheet] = useState<Sheet | null>(null);
  const runThenGoBack = useRunWithErrorAlert(() => router.back());

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
      <KeyboardAwareScrollView contentContainerStyle={styles.content}>
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
          onEdit={editField}
          onFastingChange={(fasting) => edit.saveField('fasting', { fasting })}
        />
        <ProductActions
          status={product.status}
          onArchive={() => setSheet({ kind: 'archive' })}
          onRestore={edit.restore}
          onDelete={() => setSheet({ kind: 'delete' })}
        />
      </KeyboardAwareScrollView>

      <UndoSnackbar snackbar={snackbar} />

      {sheet?.kind === 'field' ? (
        <ProductFieldSheet
          field={sheet.field}
          product={product}
          onSave={(patch) =>
            edit.saveField(sheet.field, patch, () => setSheet(null))
          }
          onClose={() => setSheet(null)}
        />
      ) : null}

      {sheet?.kind === 'archive' ? (
        <ArchiveProductDialog
          productName={product.name}
          onConfirm={(completionNote) =>
            edit.archive(completionNote, () => setSheet(null))
          }
          onCancel={() => setSheet(null)}
        />
      ) : null}

      {sheet?.kind === 'delete' ? (
        <DeleteProductDialog
          productName={product.name}
          status={product.status}
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
