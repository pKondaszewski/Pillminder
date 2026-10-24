import { packSizeInMl, supportsFasting, supportsStrength } from './category';
import type { NewProductInput } from './dto/new-product-input';
import type {
  ProductFormField,
  ProductFormValues,
  TextProductField,
} from './dto/product-form-values';
import type { StoreLinkTarget } from './dto/store-link-target';
import { dropsToMl, mlToDrops } from './eye-drops';
import type { Product } from './product-service';
import { isPlainTextStore } from './store-link';
import { normalizeStrength } from './strength-text';
import { parseWholeNumber } from './whole-number-input';

export const PRICE_MAX_LENGTH = 30;

export type ProductFormError =
  | 'editor.nameRequired'
  | 'editor.categoryRequired'
  | 'editor.wholeNumberInvalid'
  | 'editor.packSizeInvalid';

export type ProductFormErrors = Partial<
  Record<ProductFormField, ProductFormError>
>;

const FORM_FIELD_ORDER: ProductFormField[] = [
  'name',
  'category',
  'stock',
  'packSize',
];

export function validateProductField(
  field: TextProductField,
  text: string,
): ProductFormError | null {
  switch (field) {
    case 'strength':
    case 'storeLink':
    case 'price':
      return null;
    case 'name':
      return text.trim() === '' ? 'editor.nameRequired' : null;
    case 'stock':
      return parseWholeNumber(text, 0).valid
        ? null
        : 'editor.wholeNumberInvalid';
    case 'packSize':
      return parseWholeNumber(text, 1).valid ? null : 'editor.packSizeInvalid';
  }
}

export function validateReorderThreshold(
  text: string,
): ProductFormError | null {
  return parseWholeNumber(text, 0).valid ? null : 'editor.wholeNumberInvalid';
}

export function reorderThresholdPatch(text: string): Partial<NewProductInput> {
  return { reorderThreshold: wholeNumberOrNull(text, 0) };
}

export function validateProductForm(
  values: ProductFormValues,
): ProductFormErrors {
  return Object.fromEntries(
    FORM_FIELD_ORDER.flatMap((field) => {
      const error = validateFormField(field, values);
      return error ? [[field, error]] : [];
    }),
  );
}

export function firstErrorField(
  errors: ProductFormErrors,
): ProductFormField | null {
  return FORM_FIELD_ORDER.find((field) => errors[field] !== undefined) ?? null;
}

export function textFieldPatch(
  field: TextProductField,
  text: string,
  category: string,
): Partial<NewProductInput> {
  switch (field) {
    case 'name':
      return { name: text.trim() };
    case 'strength':
      return { strength: normalizeStrength(text) || null };
    case 'storeLink':
      return { storeLink: text.trim() || null };
    case 'price':
      return { price: text.trim() || null };
    case 'stock':
      return { stock: wholeNumberOrNull(text, 0) };
    case 'packSize':
      return { packSize: packSizeOrNull(text, category) };
  }
}

export function storeLinkPatch(
  text: string,
  target: StoreLinkTarget | null,
): Partial<NewProductInput> {
  const storeLink = text.trim() || null;
  return {
    storeLink,
    storeLinkTarget: isPlainTextStore(storeLink) ? target : null,
  };
}

export function newProductInput(values: ProductFormValues): NewProductInput {
  const packSize = packSizeOrNull(values.packSize, values.category);
  const stock = wholeNumberOrNull(values.stock, 0);
  return {
    name: values.name.trim(),
    category: values.category,
    strength: supportsStrength(values.category)
      ? normalizeStrength(values.strength) || null
      : null,
    unit: values.unit,
    price: values.price.trim() || null,
    storeLink: values.storeLink.trim() || null,
    stock: stock === null && packSizeInMl(values.category) ? packSize : stock,
    packSize,
    fasting: supportsFasting(values.category) && values.fasting,
  };
}

export function packSizeText(
  category: string,
  packSize: number | null,
): string {
  if (packSize === null) return '';
  return String(packSizeInMl(category) ? dropsToMl(packSize) : packSize);
}

export function packSizeEstimate(
  category: string,
  text: string,
): { ml: number; drops: number } | null {
  if (!packSizeInMl(category)) return null;
  const parsed = parseWholeNumber(text, 1);
  return parsed.valid && parsed.value !== null
    ? { ml: parsed.value, drops: mlToDrops(parsed.value) }
    : null;
}

export function editedProductInput(
  product: Product,
  patch: Partial<NewProductInput>,
): NewProductInput {
  const edited: NewProductInput = {
    name: product.name,
    category: product.category,
    strength: product.strength,
    unit: product.unit,
    price: product.price,
    storeLink: product.storeLink,
    storeLinkTarget: product.storeLinkTarget,
    packSize: product.packSize,
    reorderThreshold: product.reorderThreshold,
    fasting: product.fasting,
    ...patch,
  };
  return supportsStrength(edited.category)
    ? edited
    : { ...edited, strength: null };
}

function packSizeOrNull(text: string, category: string): number | null {
  const size = wholeNumberOrNull(text, 1);
  return size !== null && packSizeInMl(category) ? mlToDrops(size) : size;
}

function wholeNumberOrNull(text: string, min: number): number | null {
  const parsed = parseWholeNumber(text, min);
  return parsed.valid ? parsed.value : null;
}

function validateFormField(
  field: ProductFormField,
  values: ProductFormValues,
): ProductFormError | null {
  if (field === 'category') {
    return values.category === '' ? 'editor.categoryRequired' : null;
  }
  return validateProductField(field, values[field]);
}
