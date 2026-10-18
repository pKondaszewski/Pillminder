import { supportsFasting, supportsStrength } from './category';
import type { NewProductInput } from './dto/new-product-input';
import type { Product } from './product-service';
import type { ProductUnit } from './product-unit';
import { normalizeStrength } from './strength-text';
import { parseWholeNumber } from './whole-number-input';

export type TextProductField =
  | 'name'
  | 'strength'
  | 'price'
  | 'stock'
  | 'packSize'
  | 'storeLink';

export type ValidatedProductField = 'name' | 'price' | 'stock' | 'packSize';

export type ProductFormField = ValidatedProductField | 'category';

export type ProductFormError =
  | 'editor.nameRequired'
  | 'editor.categoryRequired'
  | 'editor.wholeNumberInvalid'
  | 'editor.packSizeInvalid';

export type ProductFormErrors = Partial<
  Record<ProductFormField, ProductFormError>
>;

export type ProductFormValues = Record<TextProductField, string> & {
  category: string;
  unit: ProductUnit | null;
  fasting: boolean;
};

const FORM_FIELD_ORDER: ProductFormField[] = [
  'name',
  'category',
  'stock',
  'packSize',
  'price',
];

export function validateProductField(
  field: TextProductField,
  text: string,
): ProductFormError | null {
  switch (field) {
    case 'strength':
    case 'storeLink':
      return null;
    case 'name':
      return text.trim() === '' ? 'editor.nameRequired' : null;
    case 'price':
    case 'stock':
      return parseWholeNumber(text, 0).valid
        ? null
        : 'editor.wholeNumberInvalid';
    case 'packSize':
      return parseWholeNumber(text, 1).valid ? null : 'editor.packSizeInvalid';
  }
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
): Partial<NewProductInput> {
  switch (field) {
    case 'name':
      return { name: text.trim() };
    case 'strength':
      return { strength: normalizeStrength(text) || null };
    case 'storeLink':
      return { storeLink: text.trim() || null };
    case 'price':
      return { price: wholeNumberOrNull(text, 0) };
    case 'stock':
      return { stock: wholeNumberOrNull(text, 0) };
    case 'packSize':
      return { packSize: wholeNumberOrNull(text, 1) };
  }
}

export function newProductInput(values: ProductFormValues): NewProductInput {
  return {
    name: values.name.trim(),
    category: values.category,
    strength: supportsStrength(values.category)
      ? normalizeStrength(values.strength) || null
      : null,
    unit: values.unit,
    price: wholeNumberOrNull(values.price, 0),
    storeLink: values.storeLink.trim() || null,
    stock: wholeNumberOrNull(values.stock, 0),
    packSize: wholeNumberOrNull(values.packSize, 1),
    fasting: supportsFasting(values.category) && values.fasting,
  };
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
    stock: product.stock,
    packSize: product.packSize,
    fasting: product.fasting,
    ...patch,
  };
  return supportsStrength(edited.category)
    ? edited
    : { ...edited, strength: null };
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
