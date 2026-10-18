import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BUILT_IN_CATEGORIES,
  categoryLabel,
  MAX_CUSTOM_CATEGORY_LENGTH,
  normalizeCategory,
  storeSuggestionKeys,
  supportsStrength,
} from '@/products/category';
import type { NewProductInput } from '@/products/dto/new-product-input';
import type { Product } from '@/products/product-service';
import { PRODUCT_UNITS, type ProductUnit } from '@/products/product-unit';
import { parseWholeNumber } from '@/products/whole-number-input';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDateTime } from '@/ui/commons/format-date';
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from '@/ui/components/commons/button';
import { Chip } from '@/ui/components/commons/chip';
import { Stepper } from '@/ui/components/commons/stepper';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { ProductHistory } from '@/ui/components/products/history';
import { ProductImages } from '@/ui/components/products/images';
import { ProductNotes } from '@/ui/components/products/notes';
import { useCustomCategories } from '@/ui/hooks/use-custom-categories';
import { useNoteDraft } from '@/ui/hooks/use-note-draft';
import { useSettings } from '@/ui/hooks/use-settings';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  product: Product | null;
  onClose: () => void;
  onSave: (input: NewProductInput) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string, completionNote?: string) => void;
  onRestore?: (id: string) => void;
  onAddSchedule?: () => void;
};

export function ProductEditorForm({
  product,
  onClose,
  onSave,
  onDelete,
  onArchive,
  onRestore,
  onAddSchedule,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { currency } = useSettings();

  const [name, setName] = useState(product?.name ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    product?.category ?? null,
  );
  const [newCategoryName, setNewCategoryName] = useState<string | null>(null);
  const customCategories = useCustomCategories();
  const [strength, setStrength] = useState(product?.strength ?? '');
  const [unit, setUnit] = useState<ProductUnit | null>(product?.unit ?? null);
  const [priceText, setPriceText] = useState(toText(product?.price));
  const [storeLink, setStoreLink] = useState(product?.storeLink ?? '');
  const [stockText, setStockText] = useState(toText(product?.stock));
  const [packSizeText, setPackSizeText] = useState(toText(product?.packSize));
  const [showErrors, setShowErrors] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [completionNote, setCompletionNote] = useState('');
  const noteDraft = useNoteDraft(product?.id);

  const addingCategory = newCategoryName !== null;
  const category = addingCategory
    ? normalizeCategory(newCategoryName, customCategories)
    : selectedCategory;
  const hasStrength = category !== null && supportsStrength(category);
  const nameMissing = name.trim() === '';
  const categoryMissing = category === null;
  const showNameError = showErrors && nameMissing;
  const showCategoryError = showErrors && categoryMissing;
  const parsedPrice = parseWholeNumber(priceText, 0);
  const parsedStock = parseWholeNumber(stockText, 0);
  const parsedPackSize = parseWholeNumber(packSizeText, 1);
  const packSize = parsedPackSize.valid ? parsedPackSize.value : null;
  const showPriceError = showErrors && !parsedPrice.valid;
  const showStockError = showErrors && !parsedStock.valid;
  const showPackSizeError = showErrors && !parsedPackSize.valid;

  const handleSave = async () => {
    if (
      nameMissing ||
      categoryMissing ||
      !parsedPrice.valid ||
      !parsedStock.valid ||
      !parsedPackSize.valid
    ) {
      setShowErrors(true);
      return;
    }
    try {
      await noteDraft.submit();
    } catch {
      Alert.alert(t('products.errorTitle'), t('notes.errorSave'));
      return;
    }
    onSave({
      name: name.trim(),
      category,
      strength: hasStrength ? strength.trim() || null : null,
      unit,
      price: parsedPrice.value,
      storeLink: storeLink.trim() || null,
      stock: parsedStock.value,
      packSize,
    });
  };

  const selectCategory = (selected: string) => {
    setNewCategoryName(null);
    setSelectedCategory(selected);
  };

  const startAddingCategory = () => {
    if (!addingCategory) setNewCategoryName('');
  };

  const handleToggleStatus = () => {
    if (!product) return;
    if (product.status === 'archived') {
      onRestore?.(product.id);
    } else {
      setArchiving(true);
    }
  };

  const handleConfirmArchive = () => {
    if (!product) return;
    onArchive?.(product.id, completionNote.trim() || undefined);
  };

  const increaseStock = () => {
    if (!parsedStock.valid) return;
    setStockText(String((parsedStock.value ?? 0) + 1));
  };

  const addPack = (size: number) => {
    if (!parsedStock.valid) return;
    setStockText(String((parsedStock.value ?? 0) + size));
  };

  const decreaseStock = () => {
    if (!parsedStock.valid || parsedStock.value === null) return;
    setStockText(String(Math.max(0, parsedStock.value - 1)));
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, borderColor: theme.borderStrong },
  ];
  const numberInputStyle = (showError: boolean) => [
    inputStyle,
    showError ? { borderColor: theme.danger } : null,
  ];
  const nameInputStyle = [
    inputStyle,
    showNameError ? { borderColor: theme.danger } : null,
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="small">{t('editor.name')}</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t('editor.namePlaceholder')}
            placeholderTextColor={theme.textSecondary}
            style={nameInputStyle}
          />
          {showNameError && <FieldError message={t('editor.nameRequired')} />}

          <ThemedText type="small">{t('editor.category')}</ThemedText>
          <ThemedView style={styles.chipRow}>
            {[...BUILT_IN_CATEGORIES, ...customCategories].map((c) => (
              <Chip
                key={c}
                label={categoryLabel(c, t)}
                selected={c === category}
                onPress={() => selectCategory(c)}
              />
            ))}
            <Chip
              label={t('editor.addCategory')}
              selected={addingCategory}
              onPress={startAddingCategory}
            />
          </ThemedView>
          {addingCategory ? (
            <TextInput
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              maxLength={MAX_CUSTOM_CATEGORY_LENGTH}
              autoFocus
              accessibilityLabel={t('editor.newCategory')}
              placeholder={t('editor.newCategoryPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              style={inputStyle}
            />
          ) : null}
          {showCategoryError && (
            <FieldError message={t('editor.categoryRequired')} />
          )}

          {hasStrength ? (
            <>
              <ThemedText type="small">{t('editor.strength')}</ThemedText>
              <TextInput
                value={strength}
                onChangeText={setStrength}
                placeholder={t('editor.strengthPlaceholder')}
                placeholderTextColor={theme.textSecondary}
                style={inputStyle}
              />
            </>
          ) : null}

          <ThemedText type="small">{t('editor.unit')}</ThemedText>
          <ThemedView style={styles.chipRow}>
            {[null, ...PRODUCT_UNITS].map((u) => (
              <Chip
                key={u ?? 'none'}
                label={u ? t(`unitName.${u}`) : t('editor.unitNone')}
                selected={u === unit}
                onPress={() => setUnit(u)}
              />
            ))}
          </ThemedView>

          <ThemedText type="small">
            {t('editor.price', { currency })}
          </ThemedText>

          <TextInput
            value={priceText}
            onChangeText={setPriceText}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            style={numberInputStyle(showPriceError)}
          />
          {showPriceError && (
            <FieldError message={t('editor.wholeNumberInvalid')} />
          )}

          <ThemedText type="small">{t('editor.stock')}</ThemedText>
          <Stepper
            decrementLabel={t('editor.stockLess')}
            incrementLabel={t('editor.stockMore')}
            onDecrement={decreaseStock}
            onIncrement={increaseStock}
          >
            <TextInput
              value={stockText}
              onChangeText={setStockText}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              style={[numberInputStyle(showStockError), styles.stepperInput]}
            />
          </Stepper>
          {showStockError && (
            <FieldError message={t('editor.wholeNumberInvalid')} />
          )}
          {packSize !== null && (
            <ThemedView style={styles.actions}>
              <SecondaryButton
                label={t('editor.addPack', { count: packSize })}
                onPress={() => addPack(packSize)}
              />
            </ThemedView>
          )}

          <ThemedText type="small">{t('editor.packSize')}</ThemedText>
          <TextInput
            value={packSizeText}
            onChangeText={setPackSizeText}
            keyboardType="numeric"
            accessibilityLabel={t('editor.packSize')}
            placeholder={t('editor.packSizePlaceholder')}
            placeholderTextColor={theme.textSecondary}
            style={numberInputStyle(showPackSizeError)}
          />
          {showPackSizeError && (
            <FieldError message={t('editor.packSizeInvalid')} />
          )}

          <ThemedText type="small">{t('editor.storeLink')}</ThemedText>
          <TextInput
            value={storeLink}
            onChangeText={setStoreLink}
            placeholder={t('editor.storeLinkPlaceholder')}
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />
          {category ? (
            <ThemedView style={styles.chipRow}>
              {storeSuggestionKeys(category).map((key) => (
                <Chip
                  key={key}
                  label={t(`storeSuggestion.${key}`)}
                  selected={false}
                  onPress={() => setStoreLink(t(`storeSuggestion.${key}`))}
                />
              ))}
            </ThemedView>
          ) : null}

          {archiving ? (
            <ThemedView style={styles.archivePrompt}>
              <ThemedText type="small">
                {t('notes.completionPrompt')}
              </ThemedText>
              <TextInput
                value={completionNote}
                onChangeText={setCompletionNote}
                multiline
                placeholder={t('notes.completionPlaceholder')}
                placeholderTextColor={theme.textSecondary}
                style={[inputStyle, styles.noteInput]}
              />
              <ThemedView style={styles.actions}>
                <SecondaryButton
                  label={t('editor.cancel')}
                  onPress={() => setArchiving(false)}
                />
                <PrimaryButton
                  label={t('editor.archive')}
                  onPress={handleConfirmArchive}
                />
              </ThemedView>
            </ThemedView>
          ) : null}

          {product &&
          product.status !== 'archived' &&
          !archiving &&
          onAddSchedule ? (
            <ThemedView style={styles.actions}>
              <SecondaryButton
                label={t('schedule.add')}
                onPress={onAddSchedule}
              />
            </ThemedView>
          ) : null}

          {product && !archiving ? (
            <Pressable
              onPress={handleToggleStatus}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="surface" style={styles.statusButton}>
                <ThemedText type="smallBold">
                  {product.status === 'archived'
                    ? t('editor.restore')
                    : t('editor.archive')}
                </ThemedText>
              </ThemedView>
            </Pressable>
          ) : null}

          {product ? <ProductImages productId={product.id} /> : null}

          {product ? (
            <ProductNotes productId={product.id} noteDraft={noteDraft} />
          ) : null}

          {product?.lastUsedAt ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('editor.lastUsed', {
                when: formatDateTime(product.lastUsedAt),
              })}
            </ThemedText>
          ) : null}

          {product ? <ProductHistory productId={product.id} /> : null}
        </ScrollView>

        <ThemedView style={styles.actions}>
          <SecondaryButton label={t('editor.close')} onPress={onClose} />
          {product ? (
            <DestructiveButton
              label={t('editor.delete')}
              onPress={() => confirmDeleteProduct(product, t, onDelete)}
            />
          ) : null}
          <PrimaryButton label={t('editor.save')} onPress={handleSave} />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

function confirmDeleteProduct(
  product: Product,
  t: TFunction,
  onDelete?: (id: string) => void,
) {
  Alert.alert(
    t('editor.deleteTitle'),
    t('editor.deleteConfirm', { name: product.name }),
    [
      { text: t('editor.cancel'), style: 'cancel' },
      {
        text: t('editor.delete'),
        style: 'destructive',
        onPress: () => onDelete?.(product.id),
      },
    ],
  );
}

function toText(value: number | null | undefined) {
  return value == null ? '' : String(value);
}

function FieldError({ message }: { message: string }) {
  return (
    <ThemedText type="small" themeColor="danger">
      {message}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.twentyFour,
    paddingTop: Spacing.twentyFour,
    paddingBottom: Spacing.sixteen,
  },
  scrollContent: {
    gap: Spacing.eight,
    paddingBottom: Spacing.twentyFour,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.eight,
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.eight,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
  },
  statusButton: {
    marginTop: Spacing.sixteen,
    paddingVertical: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
    alignItems: 'center',
  },
  archivePrompt: {
    gap: Spacing.eight,
    marginTop: Spacing.sixteen,
  },
  noteInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pressed: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.eight,
    marginTop: Spacing.sixteen,
  },
});
