import { type ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type LayoutChangeEvent, StyleSheet } from 'react-native';
import { type KeyboardAwareScrollViewRef } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/commons/ui/button';
import { Spacing } from '@/commons/ui/constants/theme';
import { KeyboardAwareScrollView } from '@/commons/ui/keyboard-aware-scroll-view';
import { Stepper } from '@/commons/ui/stepper';
import { TextField } from '@/commons/ui/text-field';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import {
  packSizeInMl,
  strengthTextKeys,
  supportsFasting,
  supportsStrength,
  unitAfterCategoryChange,
} from '@/products/category';
import type { NewProductInput } from '@/products/dto/new-product-input';
import {
  firstErrorField,
  newProductInput,
  packSizeEstimate,
  PRICE_MAX_LENGTH,
  validateProductForm,
} from '@/products/product-form';
import type {
  ProductFormField,
  ProductFormValues,
} from '@/products/product-service';
import { CategoryPicker } from '@/products/ui/category-picker';
import { FastingRow } from '@/products/ui/fasting-row';
import { PhotoPickerTile } from '@/products/ui/photo-picker-tile';
import { StoreSuggestions } from '@/products/ui/store-suggestions';
import { UnitChips } from '@/products/ui/unit-chips';
import { usePendingPhotoUris } from '@/products/ui/use-pending-photos';
import { adjustWholeNumberText } from '@/products/whole-number-input';

const SUBMIT_BUTTON_HEIGHT = 52;

type Props = {
  onSubmit: (input: NewProductInput, photoUris: string[]) => void;
  onPhotosPress: () => void;
};

export function NewProductForm({ onSubmit, onPhotosPress }: Props) {
  const { t } = useTranslation();
  const { snackbar, runWithUndo } = useUndoSnackbar();
  const uris = usePendingPhotoUris();
  const scrollRef = useRef<KeyboardAwareScrollViewRef>(null);
  const fieldOffsets = useRef<Partial<Record<ProductFormField, number>>>({});

  const [values, setValues] = useState<ProductFormValues>({
    name: '',
    category: '',
    strength: '',
    unit: null,
    price: '',
    stock: '',
    packSize: '',
    storeLink: '',
    fasting: false,
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = submitted ? validateProductForm(values) : {};
  const errorText = (field: ProductFormField) => {
    const error = errors[field];
    return error ? t(error) : undefined;
  };
  const change = (patch: Partial<ProductFormValues>) =>
    setValues((previous) => ({ ...previous, ...patch }));
  const recordOffset = (field: ProductFormField, offset: number) => {
    fieldOffsets.current[field] = offset;
  };

  const submit = () => {
    const found = validateProductForm(values);
    const first = firstErrorField(found);
    if (first === null) {
      onSubmit(newProductInput(values), uris);
      return;
    }
    setSubmitted(true);
    scrollRef.current?.scrollTo({
      y: Math.max(0, (fieldOffsets.current[first] ?? 0) - Spacing.sixteen),
      animated: true,
    });
  };

  const packSizeMl = packSizeInMl(values.category);
  const estimate = packSizeEstimate(values.category, values.packSize);
  const strengthKeys = strengthTextKeys(values.unit);
  const showStrength =
    values.category !== '' && supportsStrength(values.category);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <KeyboardAwareScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
        >
          <PhotoPickerTile
            category={values.category}
            profileUri={uris[0] ?? null}
            count={uris.length}
            onPress={onPhotosPress}
          />

          <FormField field="name" onOffset={recordOffset}>
            <FieldLabel text={t('editor.name')} />
            <TextField
              value={values.name}
              onChangeText={(name) => change({ name })}
              placeholder={t('editor.namePlaceholder')}
              error={errorText('name')}
            />
          </FormField>

          <FormField field="category" onOffset={recordOffset}>
            <FieldLabel text={t('editor.category')} />
            <CategoryPicker
              value={values.category}
              runWithUndo={runWithUndo}
              error={errorText('category')}
              onChange={(category) =>
                change({
                  category,
                  unit: unitAfterCategoryChange(
                    values.category,
                    category,
                    values.unit,
                  ),
                })
              }
            />
          </FormField>

          {showStrength ? (
            <ThemedView style={styles.field}>
              <FieldLabel text={t('editor.strength')} />
              <TextField
                value={values.strength}
                onChangeText={(strength) => change({ strength })}
                placeholder={t(strengthKeys.placeholder)}
              />
              <ThemedText type="caption">{t(strengthKeys.hint)}</ThemedText>
            </ThemedView>
          ) : null}

          <ThemedView style={styles.field}>
            <FieldLabel text={t('editor.unit')} />
            <UnitChips
              selected={values.unit}
              onSelect={(unit) => change({ unit })}
            />
            <ThemedText type="caption">{t('editor.unitHint')}</ThemedText>
          </ThemedView>

          {supportsFasting(values.category) ? (
            <FastingRow
              value={values.fasting}
              onChange={(fasting) => change({ fasting })}
            />
          ) : null}

          <ThemedText type="label">{t('editor.sectionStock')}</ThemedText>
          <FormField field="stock" onOffset={recordOffset}>
            <Stepper
              decrementLabel={t('editor.stockLess')}
              incrementLabel={t('editor.stockMore')}
              onDecrement={() =>
                change({ stock: adjustWholeNumberText(values.stock, -1) })
              }
              onIncrement={() =>
                change({ stock: adjustWholeNumberText(values.stock, 1) })
              }
            >
              <ThemedView style={styles.stepperValue}>
                <TextField
                  value={values.stock}
                  onChangeText={(stock) => change({ stock })}
                  keyboardType="numeric"
                  textAlign="center"
                  placeholder="0"
                  accessibilityLabel={t('editor.stock')}
                  error={errorText('stock')}
                />
              </ThemedView>
            </Stepper>
            {packSizeMl ? (
              <ThemedText type="caption">
                {t('editor.stockEmptyIsFullPack')}
              </ThemedText>
            ) : null}
          </FormField>
          <FormField field="packSize" onOffset={recordOffset}>
            <FieldLabel
              text={t(packSizeMl ? 'editor.packSizeMl' : 'editor.packSize')}
            />
            <TextField
              value={values.packSize}
              onChangeText={(packSize) => change({ packSize })}
              keyboardType="numeric"
              placeholder={t(
                packSizeMl
                  ? 'editor.packSizeMlPlaceholder'
                  : 'editor.packSizePlaceholder',
              )}
              error={errorText('packSize')}
            />
            {estimate ? (
              <ThemedText type="caption">
                {t('editor.packSizeEstimate', estimate)}
              </ThemedText>
            ) : null}
          </FormField>

          <ThemedText type="label">{t('editor.sectionShopping')}</ThemedText>
          <ThemedView style={styles.field}>
            <FieldLabel text={t('editor.price')} />
            <TextField
              value={values.price}
              onChangeText={(price) => change({ price })}
              maxLength={PRICE_MAX_LENGTH}
              placeholder={t('editor.pricePlaceholder')}
            />
            <ThemedText type="caption">{t('editor.priceHint')}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.field}>
            <FieldLabel text={t('editor.storeLink')} />
            <TextField
              value={values.storeLink}
              onChangeText={(storeLink) => change({ storeLink })}
              placeholder={t('editor.storeLinkPlaceholder')}
            />
            <StoreSuggestions
              category={values.category}
              onPick={(storeLink) => change({ storeLink })}
            />
          </ThemedView>
        </KeyboardAwareScrollView>

        <ThemedView style={styles.footer}>
          <PrimaryButton label={t('products.add')} onPress={submit} />
        </ThemedView>
      </SafeAreaView>
      <UndoSnackbar snackbar={snackbar} />
    </ThemedView>
  );
}

function FormField({
  field,
  onOffset,
  children,
}: {
  field: ProductFormField;
  onOffset: (field: ProductFormField, offset: number) => void;
  children: ReactNode;
}) {
  return (
    <ThemedView
      style={styles.field}
      onLayout={({ nativeEvent }: LayoutChangeEvent) =>
        onOffset(field, nativeEvent.layout.y)
      }
    >
      {children}
    </ThemedView>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <ThemedText type="small" themeColor="textSecondary">
      {text}
    </ThemedText>
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
    gap: Spacing.sixteen,
    padding: Spacing.twenty,
  },
  field: {
    gap: Spacing.eight,
  },
  stepperValue: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    height: SUBMIT_BUTTON_HEIGHT,
    marginHorizontal: Spacing.twenty,
    marginBottom: Spacing.sixteen,
  },
});
