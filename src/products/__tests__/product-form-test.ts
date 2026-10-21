import type { ProductFormValues } from '../dto/product-form-values';
import {
  editedProductInput,
  firstErrorField,
  newProductInput,
  packSizeEstimate,
  packSizeText,
  reorderThresholdPatch,
  textFieldPatch,
  validateProductField,
  validateProductForm,
  validateReorderThreshold,
} from '../product-form';
import type { Product } from '../product-service';

const VALID_VALUES: ProductFormValues = {
  name: ' Vitamin D ',
  category: 'supplement',
  strength: ' 2000iu ',
  unit: 'capsule',
  price: ' 25,50 zł ',
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
  price: '18 zł',
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
      stock: '-1',
      packSize: '0',
    });

    // then
    expect(errors).toEqual({
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
    ['price', '12,99 zł', null],
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
      stock: 'editor.wholeNumberInvalid',
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
      price: '25,50 zł',
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
    ['price', ' 12,99 zł ', { price: '12,99 zł' }],
    ['price', '15 euro', { price: '15 euro' }],
    ['price', '   ', { price: null }],
    ['price', '', { price: null }],
    ['stock', '7', { stock: 7 }],
    ['packSize', '30', { packSize: 30 }],
    ['storeLink', ' hebe ', { storeLink: 'hebe' }],
  ] as const)('patches %s from "%s"', (field, text, expected) => {
    // when
    const patch = textFieldPatch(field, text, 'medication');

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

describe('eye drops pack size', () => {
  it('stores the pack size entered in ml as drops', () => {
    // when
    const input = newProductInput({
      ...VALID_VALUES,
      category: 'eye-drops',
      unit: 'drop',
      packSize: '10',
    });

    // then
    expect(input.packSize).toBe(200);
  });

  it('patches the pack size in drops from ml text', () => {
    // when
    const patch = textFieldPatch('packSize', '5', 'eye-drops');

    // then
    expect(patch).toEqual({ packSize: 100 });
  });

  it('keeps the pack size as a use count for a nasal spray', () => {
    // when
    const input = newProductInput({
      ...VALID_VALUES,
      category: 'nasal-spray',
      packSize: '150',
    });

    // then
    expect(input.packSize).toBe(150);
  });

  it.each([
    ['eye-drops', '', '10', 200],
    ['eye-drops', '5', '10', 5],
    ['nasal-spray', '', '150', null],
  ])(
    '%s with stock "%s" and pack "%s" stores stock %s',
    (category, stock, packSize, expected) => {
      // when
      const input = newProductInput({
        ...VALID_VALUES,
        category,
        stock,
        packSize,
      });

      // then
      expect(input.stock).toBe(expected);
    },
  );

  it('rejects zero ml', () => {
    // when
    const error = validateProductField('packSize', '0');

    // then
    expect(error).toBe('editor.packSizeInvalid');
  });

  it.each([
    ['eye-drops', 200, '10'],
    ['nasal-spray', 150, '150'],
    ['eye-drops', null, ''],
  ])('shows %s pack size %s as "%s"', (category, packSize, expected) => {
    // when
    const text = packSizeText(category, packSize);

    // then
    expect(text).toBe(expected);
  });

  it('estimates drops only for valid ml of eye drops', () => {
    // when
    const results = [
      packSizeEstimate('eye-drops', '10'),
      packSizeEstimate('eye-drops', 'x'),
      packSizeEstimate('nasal-spray', '10'),
    ];

    // then
    expect(results).toEqual([{ ml: 10, drops: 200 }, null, null]);
  });
});

describe('reorder threshold field', () => {
  it.each([
    ['5', 5],
    ['0', 0],
    ['  12 ', 12],
    ['', null],
  ])('turns "%s" into %p', (text, expected) => {
    // when
    const patch = reorderThresholdPatch(text);

    // then
    expect(patch).toEqual({ reorderThreshold: expected });
  });

  it.each(['-1', '2.5', 'abc'])('rejects "%s"', (text) => {
    // when
    const error = validateReorderThreshold(text);

    // then
    expect(error).toBe('editor.wholeNumberInvalid');
  });

  it('accepts an empty threshold as no alert', () => {
    // when
    const error = validateReorderThreshold('');

    // then
    expect(error).toBeNull();
  });
});
