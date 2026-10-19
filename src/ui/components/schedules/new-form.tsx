import { type ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { startOfDay } from '@/config/date-utils';
import type { Translate } from '@/config/translate';
import { productLabel } from '@/products/product-label';
import type { Product } from '@/products/product-service';
import { reorderStatus } from '@/products/reorder';
import type { NewScheduleInput } from '@/schedules/dto/new-schedule-input';
import { draftSchedule, scheduleDraftErrors } from '@/schedules/schedule-draft';
import {
  previewOccurrences,
  type Schedule,
} from '@/schedules/schedule-service';
import { describeStockSufficiency } from '@/schedules/stock-sufficiency';
import { Spacing } from '@/ui/commons/constants/theme';
import { PrimaryButton } from '@/ui/components/commons/button';
import { ProductAvatar } from '@/ui/components/commons/product-avatar';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { DosePreview } from '@/ui/components/schedules/dose-preview';
import {
  type Period,
  PeriodFields,
} from '@/ui/components/schedules/period-fields';
import { ProductPicker } from '@/ui/components/schedules/product-picker';
import { QuantityStepper } from '@/ui/components/schedules/quantity-stepper';
import { RhythmPicker } from '@/ui/components/schedules/rhythm-picker';
import { TimeChips } from '@/ui/components/schedules/time-chips';
import { useFormatDate } from '@/ui/hooks/use-format-date';

type Props = {
  products: Product[];
  schedules: Schedule[];
  selectedProductId?: string;
  productLocked: boolean;
  onSubmit: (input: NewScheduleInput) => void;
  onNewProduct: () => void;
};

type Field = 'product' | 'times' | 'period';

const FIELD_ORDER: Field[] = ['product', 'times', 'period'];

export function NewScheduleForm({
  products,
  schedules,
  selectedProductId,
  productLocked,
  onSubmit,
  onNewProduct,
}: Props) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const now = new Date();

  const [productId, setProductId] = useState(
    selectedProductId ?? (products.length === 1 ? products[0].id : ''),
  );
  const [seenProductId, setSeenProductId] = useState(selectedProductId);
  if (selectedProductId !== seenProductId) {
    setSeenProductId(selectedProductId);
    if (selectedProductId) setProductId(selectedProductId);
  }
  const [intervalDays, setIntervalDays] = useState(1);
  const [timesOfDay, setTimesOfDay] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [period, setPeriod] = useState<Period>({
    startDate: startOfDay(now),
    endDate: null,
  });
  const [submitted, setSubmitted] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const [fieldOffsets, setFieldOffsets] = useState<
    Partial<Record<Field, number>>
  >({});

  const product = products.find((p) => p.id === productId);
  const input: NewScheduleInput = {
    productId,
    intervalDays,
    timesOfDay,
    quantity,
    ...period,
  };
  const errors = scheduleDraftErrors(input);
  const shownErrors = submitted ? errors : {};
  const doses = errors.period
    ? []
    : previewOccurrences(intervalDays, timesOfDay, period, now);
  const stockLine = errors.period
    ? null
    : describeStock(input, product, schedules, now, t, formatDate);

  const submit = () => {
    setSubmitted(true);
    const firstInvalid = FIELD_ORDER.find((field) => errors[field]);
    if (!firstInvalid) return onSubmit(input);
    scrollRef.current?.scrollTo({
      y: fieldOffsets[firstInvalid] ?? 0,
      animated: true,
    });
  };

  const trackOffset = (field: Field) => (event: LayoutChangeEvent) => {
    const y = event.nativeEvent.layout.y;
    setFieldOffsets((offsets) => ({ ...offsets, [field]: y }));
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Section
            label={t('schedule.product')}
            onLayout={trackOffset('product')}
          >
            {productLocked && product ? (
              <View style={styles.locked}>
                <ProductAvatar
                  category={product.category}
                  imageFileName={product.profileImageFileName}
                  size={36}
                />
                <ThemedText>
                  {productLabel(product.name, product.strength)}
                </ThemedText>
              </View>
            ) : (
              <ProductPicker
                products={products}
                selectedProductId={productId}
                error={shownErrors.product && t(shownErrors.product)}
                onSelect={setProductId}
                onNewProduct={onNewProduct}
              />
            )}
          </Section>

          <Section label={t('schedule.intervalDays')}>
            <RhythmPicker
              intervalDays={intervalDays}
              onChange={setIntervalDays}
            />
          </Section>

          <Section
            label={t('schedule.timesOfDay')}
            onLayout={trackOffset('times')}
          >
            <TimeChips
              times={timesOfDay}
              error={shownErrors.times && t(shownErrors.times)}
              onChange={setTimesOfDay}
            />
          </Section>

          <Section label={t('schedule.quantity')}>
            <QuantityStepper
              quantity={quantity}
              unit={product?.unit ?? null}
              onChange={setQuantity}
            />
          </Section>

          <Section
            label={t('schedule.periodLabel')}
            onLayout={trackOffset('period')}
          >
            <PeriodFields
              {...period}
              now={now}
              error={shownErrors.period && t(shownErrors.period)}
              onChange={setPeriod}
            />
          </Section>

          {stockLine ? (
            <ThemedText
              type="small"
              themeColor={stockLine.warning ? 'overdueText' : 'textSecondary'}
            >
              {stockLine.message}
            </ThemedText>
          ) : null}

          <Section label={t('schedule.preview')}>
            <DosePreview hasTimes={timesOfDay.length > 0} doses={doses} />
          </Section>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label={t('schedule.submit')} onPress={submit} />
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function Section({
  label,
  onLayout,
  children,
}: {
  label: string;
  onLayout?: (event: LayoutChangeEvent) => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.section} onLayout={onLayout}>
      <ThemedText type="label">{label}</ThemedText>
      {children}
    </View>
  );
}

function describeStock(
  input: NewScheduleInput,
  product: Product | undefined,
  schedules: Schedule[],
  now: Date,
  t: Translate,
  formatDate: (date: Date) => string,
) {
  if (!product || input.timesOfDay.length === 0) return null;
  const productSchedules = schedules.filter((s) => s.productId === product.id);
  return describeStockSufficiency(
    {
      stock: product.stock,
      unit: product.unit,
      status: reorderStatus(
        product.stock,
        [...productSchedules, draftSchedule(input)],
        now,
      ),
      hasEndDate: input.endDate != null,
    },
    t,
    formatDate,
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: Spacing.twenty,
    padding: Spacing.twenty,
  },
  section: {
    gap: Spacing.eight,
  },
  locked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.twenty,
    paddingTop: Spacing.twelve,
    paddingBottom: Spacing.sixteen,
  },
});
