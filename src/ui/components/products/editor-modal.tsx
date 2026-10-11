import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
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
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDateTime } from '@/ui/commons/format-date';
import { ActionButton } from '@/ui/components/commons/action-button';
import { Chip } from '@/ui/components/commons/chip';
import { StepperButton } from '@/ui/components/commons/stepper-button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { ProductHistory } from '@/ui/components/products/history';
import { ProductNotes } from '@/ui/components/products/notes';
import { useCustomCategories } from '@/ui/hooks/use-custom-categories';
import { useNoteDraft } from '@/ui/hooks/use-note-draft';
import { useSettings } from '@/ui/hooks/use-settings';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (input: NewProductInput) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string, completionNote?: string) => void;
  onRestore: (id: string) => void;
};

function toText(value: number | null | undefined) {
  return value == null ? '' : String(value);
}

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

export function ProductEditorModal({
  visible,
  product,
  onClose,
  onSave,
  onDelete,
  onArchive,
  onRestore,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? (
        <EditorForm
          key={product?.id ?? 'new'}
          product={product}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
          onArchive={onArchive}
          onRestore={onRestore}
        />
      ) : null}
    </Modal>
  );
}

function EditorForm({
  product,
  onClose,
  onSave,
  onDelete,
  onArchive,
  onRestore,
}: Omit<Props, 'visible'>) {
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
  const [price, setPrice] = useState(toText(product?.price));
  const [storeLink, setStoreLink] = useState(product?.storeLink ?? '');
  const [stock, setStock] = useState(toText(product?.stock));
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

  const handleSave = async () => {
    if (nameMissing || categoryMissing) {
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
      price: toNumber(price),
      storeLink: storeLink.trim() || null,
      stock: toNumber(stock),
    });
  };

  const selectCategory = (selected: string) => {
    setNewCategoryName(null);
    setSelectedCategory(selected);
  };

  const startAddingCategory = () => {
    if (!addingCategory) setNewCategoryName('');
  };

  const handleDelete = () => {
    if (!product) return;
    Alert.alert(
      t('editor.deleteTitle'),
      t('editor.deleteConfirm', { name: product.name }),
      [
        { text: t('editor.cancel'), style: 'cancel' },
        {
          text: t('editor.delete'),
          style: 'destructive',
          onPress: () => onDelete(product.id),
        },
      ],
    );
  };

  const handleToggleStatus = () => {
    if (!product) return;
    if (product.status === 'archived') {
      onRestore(product.id);
    } else {
      setArchiving(true);
    }
  };

  const handleConfirmArchive = () => {
    if (!product) return;
    onArchive(product.id, completionNote.trim() || undefined);
  };

  const increaseStock = () => {
    const current = toNumber(stock) ?? 0;
    setStock(String(current + 1));
  };

  const decreaseStock = () => {
    const current = toNumber(stock);
    if (current === null) return;
    setStock(String(Math.max(0, current - 1)));
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, borderColor: theme.backgroundSelected },
  ];
  const nameInputStyle = [
    inputStyle,
    showNameError ? { borderColor: theme.danger } : null,
  ];

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="subtitle">
            {product ? t('editor.editTitle') : t('editor.newTitle')}
          </ThemedText>

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
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />

          <ThemedText type="small">{t('editor.stock')}</ThemedText>
          <ThemedView style={styles.stepperRow}>
            <StepperButton
              sign="−"
              accessibilityLabel={t('editor.stockLess')}
              onPress={decreaseStock}
            />
            <TextInput
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              style={[inputStyle, styles.stepperInput]}
            />
            <StepperButton
              sign="+"
              accessibilityLabel={t('editor.stockMore')}
              onPress={increaseStock}
            />
          </ThemedView>

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

          {product && archiving ? (
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
                <ActionButton
                  label={t('editor.cancel')}
                  onPress={() => setArchiving(false)}
                />
                <ActionButton
                  label={t('editor.archive')}
                  onPress={handleConfirmArchive}
                  themeColor="accent"
                />
              </ThemedView>
            </ThemedView>
          ) : product ? (
            <Pressable
              onPress={handleToggleStatus}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="backgroundElement" style={styles.statusButton}>
                <ThemedText type="smallBold">
                  {product.status === 'archived'
                    ? t('editor.restore')
                    : t('editor.archive')}
                </ThemedText>
              </ThemedView>
            </Pressable>
          ) : null}

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
          <ActionButton label={t('editor.close')} onPress={onClose} />
          {product ? (
            <ActionButton
              label={t('editor.delete')}
              onPress={handleDelete}
              themeColor="danger"
            />
          ) : null}
          <ActionButton
            label={t('editor.save')}
            onPress={handleSave}
            themeColor="accent"
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  scrollContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
  },
  statusButton: {
    marginTop: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  archivePrompt: {
    gap: Spacing.two,
    marginTop: Spacing.three,
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
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
});
