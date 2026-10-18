import { Image } from 'expo-image';
import { type ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { ImageSource } from '@/images/image-service';
import { supportsFasting, supportsStrength } from '@/products/category';
import type { NewProductInput } from '@/products/dto/new-product-input';
import {
  firstErrorField,
  newProductInput,
  type ProductFormField,
  type ProductFormValues,
  validateProductForm,
} from '@/products/product-form';
import { adjustWholeNumberText } from '@/products/whole-number-input';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { PrimaryButton } from '@/ui/components/commons/button';
import { Icon } from '@/ui/components/commons/icon';
import { Stepper } from '@/ui/components/commons/stepper';
import { TextField } from '@/ui/components/commons/text-field';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { CategoryPicker } from '@/ui/components/products/category-picker';
import { chooseImageSource } from '@/ui/components/products/choose-image-source';
import { FastingRow } from '@/ui/components/products/fasting-row';
import { StoreSuggestions } from '@/ui/components/products/store-suggestions';
import { UnitChips } from '@/ui/components/products/unit-chips';
import { usePickImage } from '@/ui/hooks/use-pick-image';
import { useSettings } from '@/ui/hooks/use-settings';
import { useTheme } from '@/ui/hooks/use-theme';

const SUBMIT_BUTTON_HEIGHT = 52;
const PHOTO_TILE_SIZE = 96;

type Props = {
  onSubmit: (input: NewProductInput, photoUri: string | null) => void;
};

export function NewProductForm({ onSubmit }: Props) {
  const { t } = useTranslation();
  const { currency } = useSettings();
  const pickImageUri = usePickImage();
  const scrollRef = useRef<ScrollView>(null);
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
  const [photoUri, setPhotoUri] = useState<string | null>(null);
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
      onSubmit(newProductInput(values), photoUri);
      return;
    }
    setSubmitted(true);
    scrollRef.current?.scrollTo({
      y: Math.max(0, (fieldOffsets.current[first] ?? 0) - Spacing.sixteen),
      animated: true,
    });
  };

  const pickPhoto = async (source: ImageSource) => {
    const uri = await pickImageUri(source);
    if (uri) setPhotoUri(uri);
  };

  const showStrength =
    values.category !== '' && supportsStrength(values.category);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <PhotoPickerTile
            uri={photoUri}
            label={t('images.add')}
            onPress={() => chooseImageSource(t, pickPhoto)}
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
              error={errorText('category')}
              onChange={(category) => change({ category })}
            />
          </FormField>

          {showStrength ? (
            <ThemedView style={styles.field}>
              <FieldLabel text={t('editor.strength')} />
              <TextField
                value={values.strength}
                onChangeText={(strength) => change({ strength })}
                placeholder={t('editor.strengthPlaceholder')}
              />
            </ThemedView>
          ) : null}

          <ThemedView style={styles.field}>
            <FieldLabel text={t('editor.unit')} />
            <UnitChips
              selected={values.unit}
              onSelect={(unit) => change({ unit })}
            />
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
          </FormField>
          <FormField field="packSize" onOffset={recordOffset}>
            <FieldLabel text={t('editor.packSize')} />
            <TextField
              value={values.packSize}
              onChangeText={(packSize) => change({ packSize })}
              keyboardType="numeric"
              placeholder={t('editor.packSizePlaceholder')}
              error={errorText('packSize')}
            />
          </FormField>

          <ThemedText type="label">{t('editor.sectionShopping')}</ThemedText>
          <FormField field="price" onOffset={recordOffset}>
            <FieldLabel text={t('editor.price', { currency })} />
            <TextField
              value={values.price}
              onChangeText={(price) => change({ price })}
              keyboardType="numeric"
              placeholder="0"
              error={errorText('price')}
            />
            <ThemedText type="caption">{t('editor.priceHint')}</ThemedText>
          </FormField>
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
        </ScrollView>

        <ThemedView style={styles.footer}>
          <PrimaryButton label={t('products.add')} onPress={submit} />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

function PhotoPickerTile({
  uri,
  label,
  onPress,
}: {
  uri: string | null;
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.photoTile, { borderColor: theme.borderStrong }]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.photoImage} contentFit="cover" />
      ) : (
        <Icon name="add_a_photo" size={28} color={theme.textSecondary} />
      )}
    </Pressable>
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
  photoTile: {
    width: PHOTO_TILE_SIZE,
    height: PHOTO_TILE_SIZE,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.card,
  },
  photoImage: {
    width: '100%',
    height: '100%',
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
