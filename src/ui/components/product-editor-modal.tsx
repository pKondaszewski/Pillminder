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

import type { products } from '@/config/db/schema';
import type { NewProductInput } from '@/products/dto/new-product-input';
import { ProductHistory } from '@/ui/components/product-history';
import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';
import { Spacing } from '@/ui/commons/constants/theme';
import { useTheme } from '@/ui/hooks/use-theme';

type Product = typeof products.$inferSelect;
type Category = NewProductInput['category'];

const CATEGORIES: Category[] = ['medication', 'supplement', 'care'];

interface Props {
  visible: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (input: NewProductInput) => void;
  onDelete: (id: string) => void;
}

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
}: Omit<Props, 'visible'>) {
  const { t } = useTranslation();
  const theme = useTheme();

  const [name, setName] = useState(product?.name ?? '');
  const [category, setCategory] = useState<Category>(
    product?.category ?? 'supplement',
  );
  const [price, setPrice] = useState(toText(product?.price));
  const [storeLink, setStoreLink] = useState(product?.storeLink ?? '');
  const [stock, setStock] = useState(toText(product?.stock));

  const handleSave = () => {
    if (name.trim() === '') return;
    onSave({
      name: name.trim(),
      category,
      price: toNumber(price),
      storeLink: storeLink.trim() || null,
      stock: toNumber(stock),
    });
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

  const bumpStock = (delta: number) => {
    const current = toNumber(stock) ?? 0;
    setStock(String(Math.max(0, current + delta)));
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, borderColor: theme.backgroundSelected },
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
            style={inputStyle}
          />

          <ThemedText type="small">{t('editor.category')}</ThemedText>
          <ThemedView style={styles.categoryRow}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView
                  type={
                    c === category ? 'backgroundSelected' : 'backgroundElement'
                  }
                  style={styles.categoryChip}
                >
                  <ThemedText
                    type="small"
                    themeColor={c === category ? 'text' : 'textSecondary'}
                  >
                    {t(`category.${c}`)}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </ThemedView>

          <ThemedText type="small">{t('editor.price')}</ThemedText>
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
            <Pressable
              onPress={() => bumpStock(-1)}
              hitSlop={Spacing.two}
              accessibilityLabel={t('editor.stockLess')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="backgroundElement" style={styles.stepperButton}>
                <ThemedText type="subtitle">−</ThemedText>
              </ThemedView>
            </Pressable>
            <TextInput
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              style={[inputStyle, styles.stepperInput]}
            />
            <Pressable
              onPress={() => bumpStock(1)}
              hitSlop={Spacing.two}
              accessibilityLabel={t('editor.stockMore')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="backgroundElement" style={styles.stepperButton}>
                <ThemedText type="subtitle">+</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>

          <ThemedText type="small">{t('editor.storeLink')}</ThemedText>
          <TextInput
            value={storeLink}
            onChangeText={setStoreLink}
            autoCapitalize="none"
            keyboardType="url"
            placeholder="https://"
            placeholderTextColor={theme.textSecondary}
            style={inputStyle}
          />

          {product ? <ProductHistory productId={product.id} /> : null}
        </ScrollView>

        <ThemedView style={styles.actions}>
          <ActionButton label={t('editor.close')} onPress={onClose} />
          {product ? (
            <ActionButton
              label={t('editor.delete')}
              onPress={handleDelete}
              color="#d9534f"
            />
          ) : null}
          <ActionButton
            label={t('editor.save')}
            onPress={handleSave}
            color="#3c87f7"
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ActionButton({
  label,
  onPress,
  color,
}: {
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.actionButtonInner}>
        <ThemedText type="smallBold" style={color ? { color } : undefined}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
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
  categoryRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  categoryChip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonInner: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
});
