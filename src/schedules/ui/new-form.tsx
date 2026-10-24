import { type ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { PrimaryButton } from '@/commons/ui/button';
import { Spacing } from '@/commons/ui/constants/theme';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatDate } from '@/commons/ui/use-format-date';
import { startOfDay } from '@/config/date-utils';
import type { Translate } from '@/config/translate';
import { productLabel } from '@/products/product-label';
import type { Product } from '@/products/product-service';
import { reorderStatus } from '@/products/reorder';
import type { NewScheduleInput } from '@/schedules/dto/new-schedule-input';
import { draftSchedule, scheduleDraftErrors } from '@/schedules/schedule-draft';
import {
  previewOccurrences,
  type Rhythm,
  type Schedule,
} from '@/schedules/schedule-service';
import { describeStockSufficiency } from '@/schedules/stock-sufficiency';
import { DosePreview } from '@/schedules/ui/dose-preview';
import { type Period, PeriodFields } from '@/schedules/ui/period-fields';
import { ProductPicker } from '@/schedules/ui/product-picker';
import { QuantityStepper } from '@/schedules/ui/quantity-stepper';
import { RhythmPicker } from '@/schedules/ui/rhythm-picker';
import { TimeChips } from '@/schedules/ui/time-chips';

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
  const [rhythm, setRhythm] = useState<Rhythm>({
    intervalDays: 1,
    weekdays: null,
  });
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
    ...rhythm,
    timesOfDay,
    quantity,
    ...period,
  };
  const errors = scheduleDraftErrors(input);
  const shownErrors = submitted ? errors : {};
  const doses = errors.period
    ? []
    : previewOccurrences(rhythm, timesOfDay, period, now);
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
          <RhythmPicker rhythm={rhythm} onChange={setRhythm} />
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
