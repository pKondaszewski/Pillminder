import { eq } from 'drizzle-orm';

import { products } from '@/config/db/schema';
import {
  clearTestDatabase,
  db,
  insertProduct,
} from '@/config/db/test-database';

import {
  addPackToStockRow,
  createProductRow,
  mergeBuiltInDuplicateCategoryRows,
  updateProductRow,
} from '../product-repository';

jest.mock('@/config/db/database', () =>
  jest.requireActual('@/config/db/test-database'),
);
jest.mock(
  'expo-crypto',
  () => jest.requireActual('@/config/db/test-database').testCrypto,
);

const NOW = new Date('2026-03-10T10:00:00Z');

function productRow(id: string) {
  return db.select().from(products).where(eq(products.id, id)).get();
}

describe('mergeBuiltInDuplicateCategoryRows', () => {
  beforeEach(() => clearTestDatabase());

  it('moves products of customs named like a built-in and keeps the others', () => {
    // given
    insertProduct({ id: 'spray', category: 'Spray do nosa' });
    insertProduct({ id: 'lek', category: 'lek' });
    insertProduct({ id: 'lek2', category: 'lek' });
    insertProduct({ id: 'vet', category: 'Vet gel' });
    insertProduct({ id: 'builtin', category: 'care' });

    // when
    const merged = mergeBuiltInDuplicateCategoryRows();

    // then
    expect(merged).toBe(2);
    expect(
      db
        .select({ id: products.id, category: products.category })
        .from(products)
        .all()
        .sort((a, b) => a.id.localeCompare(b.id)),
    ).toEqual([
      { id: 'builtin', category: 'care' },
      { id: 'lek', category: 'medication' },
      { id: 'lek2', category: 'medication' },
      { id: 'spray', category: 'nasal-spray' },
      { id: 'vet', category: 'Vet gel' },
    ]);
  });

  it('does nothing when no custom category duplicates a built-in', () => {
    // given
    insertProduct({ id: 'vet', category: 'Vet gel' });

    // when
    const merged = mergeBuiltInDuplicateCategoryRows();

    // then
    expect(merged).toBe(0);
    expect(productRow('vet')?.category).toBe('Vet gel');
    expect(productRow('vet')?.updatedAt).toEqual(
      new Date('2026-01-01T00:00:00Z'),
    );
  });
});

describe('addPackToStockRow', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    clearTestDatabase();
  });
  afterEach(() => jest.useRealTimers());

  it('adds one pack to the current stock', async () => {
    // given
    insertProduct({ id: 'p1', stock: 4, packSize: 30 });

    // when
    await addPackToStockRow('p1');

    // then
    expect(productRow('p1')).toMatchObject({ stock: 34, updatedAt: NOW });
  });

  it('adds a pack to an empty stock', async () => {
    // given
    insertProduct({ id: 'p1', stock: 0, packSize: 30 });

    // when
    await addPackToStockRow('p1');

    // then
    expect(productRow('p1')?.stock).toBe(30);
  });

  it.each([
    ['no stock tracking', { stock: null, packSize: 30 }],
    ['no pack size', { stock: 4, packSize: null }],
  ])('leaves the product alone with %s', async (_, values) => {
    // given
    insertProduct({ id: 'p1', ...values });

    // when
    await addPackToStockRow('p1');

    // then
    expect(productRow('p1')).toMatchObject({
      ...values,
      updatedAt: new Date('2026-01-01T00:00:00Z'),
    });
  });
});

describe('createProductRow and updateProductRow', () => {
  beforeEach(() => {
    jest.useFakeTimers({ now: NOW });
    clearTestDatabase();
  });
  afterEach(() => jest.useRealTimers());

  it('creates an active product with defaults for the optional fields', async () => {
    // given
    const input = { name: 'Vitamin D', category: 'supplement' };

    // when
    const created = await createProductRow(input);

    // then
    expect(productRow(created.id)).toMatchObject({
      name: 'Vitamin D',
      category: 'supplement',
      status: 'active',
      stock: null,
      fasting: false,
      lastUsedAt: null,
      createdAt: NOW,
      updatedAt: NOW,
    });
  });

  it('files a product under the existing custom category regardless of case', async () => {
    // given
    insertProduct({ id: 'p1', category: 'Vet gel' });

    // when
    const created = await createProductRow({
      name: 'Another',
      category: '  vet   GEL ',
    });

    // then
    expect(created.category).toBe('Vet gel');
  });

  it('maps a built-in label typed as a custom category to the built-in', async () => {
    // when
    const created = await createProductRow({
      name: 'Drops',
      category: 'Spray do nosa',
    });

    // then
    expect(created.category).toBe('nasal-spray');
  });

  it('rejects a blank category without writing anything', async () => {
    // when
    const creating = createProductRow({ name: 'Nameless', category: '   ' });

    // then
    await expect(creating).rejects.toThrow('category must not be blank');
    expect(db.select().from(products).all()).toEqual([]);
  });

  it('updates the fields and clears the optional ones that are not given', async () => {
    // given
    insertProduct({ id: 'p1', strength: '500 mg', stock: 5, price: '10' });

    // when
    const updated = await updateProductRow('p1', {
      name: 'Renamed',
      category: 'medication',
    });

    // then
    expect(updated).toMatchObject({
      name: 'Renamed',
      strength: null,
      stock: null,
      price: null,
      updatedAt: NOW,
    });
  });
});
