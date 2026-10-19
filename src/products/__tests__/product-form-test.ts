import type { ProductFormValues } from '../dto/product-form-values';
import {
  editedProductInput,
  firstErrorField,
  newProductInput,
  textFieldPatch,
  validateProductField,
  validateProductForm,
} from '../product-form';
import type { Product } from '../product-service';

const VALID_VALUES: ProductFormValues = {
  name: ' Vitamin D ',
  category: 'supplement',
  strength: ' 2000iu ',
  unit: 'capsule',
  price: '25',
  stock: '60',
  packSize: '90',
  storeLink: ' rossmann ',
  fasting: true,
};

const PRODUCT = {
  id: 'p1',
  name: 'Euthyrox',
  category: 'medication',
  strength: '50 µg',
  unit: 'tablet',
  price: 18,
  storeLink: 'pharmacy',
  stock: 30,
  packSize: 60,
  fasting: true,
} as Product;

describe('validateProductForm', () => {
  it('has no errors for a complete form', () => {
    // when
    const errors = validateProductForm(VALID_VALUES);

    // then
    expect(errors).toEqual({});
  });

  it('accepts an empty optional number', () => {
    // when
    const errors = validateProductForm({
      ...VALID_VALUES,
      price: '',
      stock: '',
      packSize: '',
    });

    // then
    expect(errors).toEqual({});
  });

  it('reports a blank name and a missing category', () => {
    // when
    const errors = validateProductForm({
      ...VALID_VALUES,
      name: '  ',
      category: '',
    });

    // then
    expect(errors).toEqual({
      name: 'editor.nameRequired',
      category: 'editor.categoryRequired',
    });
  });

  it('reports invalid numbers per field', () => {
    // when
    const errors = validateProductForm({
      ...VALID_VALUES,
      price: '2.5',
      stock: '-1',
      packSize: '0',
    });

    // then
    expect(errors).toEqual({
      price: 'editor.wholeNumberInvalid',
      stock: 'editor.wholeNumberInvalid',
      packSize: 'editor.packSizeInvalid',
    });
  });
});

describe('validateProductField', () => {
  it.each([
    ['name', 'Iron', null],
    ['name', '', 'editor.nameRequired'],
    ['price', '', null],
    ['price', 'abc', 'editor.wholeNumberInvalid'],
    ['stock', '0', null],
    ['packSize', '1', null],
    ['packSize', '0', 'editor.packSizeInvalid'],
  ] as const)('checks %s "%s"', (field, text, expected) => {
    // when
    const error = validateProductField(field, text);

    // then
    expect(error).toBe(expected);
  });
});

describe('firstErrorField', () => {
  it('returns the field that comes first in the form', () => {
    // when
    const field = firstErrorField({
      price: 'editor.wholeNumberInvalid',
      category: 'editor.categoryRequired',
    });

    // then
    expect(field).toBe('category');
  });

  it('returns null without errors', () => {
    // when
    const field = firstErrorField({});

    // then
    expect(field).toBeNull();
  });
});

describe('newProductInput', () => {
  it('trims text, parses numbers and drops the fasting flag outside medication', () => {
    // when
    const input = newProductInput(VALID_VALUES);

    // then
    expect(input).toEqual({
      name: 'Vitamin D',
      category: 'supplement',
      strength: '2000 IU',
      unit: 'capsule',
      price: 25,
      storeLink: 'rossmann',
      stock: 60,
      packSize: 90,
      fasting: false,
    });
  });

  it('keeps the fasting flag for a medication', () => {
    // when
    const input = newProductInput({ ...VALID_VALUES, category: 'medication' });

    // then
    expect(input.fasting).toBe(true);
  });

  it('drops the strength for a category without one', () => {
    // when
    const input = newProductInput({ ...VALID_VALUES, category: 'care' });

    // then
    expect(input.strength).toBeNull();
  });

  it('turns blank optional fields into null', () => {
    // when
    const input = newProductInput({
      ...VALID_VALUES,
      strength: '',
      price: '',
      stock: '',
      packSize: '',
      storeLink: '',
    });

    // then
    expect(input).toMatchObject({
      strength: null,
      price: null,
      stock: null,
      packSize: null,
      storeLink: null,
    });
  });
});

describe('textFieldPatch', () => {
  it.each([
    ['name', ' Iron ', { name: 'Iron' }],
    ['strength', '', { strength: null }],
    ['strength', '50ug', { strength: '50 µg' }],
    ['price', '12', { price: 12 }],
    ['price', '', { price: null }],
    ['stock', '7', { stock: 7 }],
    ['packSize', '30', { packSize: 30 }],
    ['storeLink', ' hebe ', { storeLink: 'hebe' }],
  ] as const)('patches %s from "%s"', (field, text, expected) => {
    // when
    const patch = textFieldPatch(field, text);

    // then
    expect(patch).toEqual(expected);
  });
});

describe('editedProductInput', () => {
  it('keeps every other field, including the fasting flag', () => {
    // when
    const input = editedProductInput(PRODUCT, { price: null });

    // then
    expect(input).toEqual({
      name: 'Euthyrox',
      category: 'medication',
      strength: '50 µg',
      unit: 'tablet',
      price: null,
      storeLink: 'pharmacy',
      stock: 30,
      packSize: 60,
      fasting: true,
    });
  });

  it('clears the strength when the category cannot have one', () => {
    // when
    const input = editedProductInput(PRODUCT, { category: 'care' });

    // then
    expect(input.strength).toBeNull();
  });
});
