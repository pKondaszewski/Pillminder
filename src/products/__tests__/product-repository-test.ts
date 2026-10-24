import { db } from '@/config/db/database';

import { mergeBuiltInDuplicateCategoryRows } from '../product-repository';

jest.mock('@/config/db/database', () => ({ db: { transaction: jest.fn() } }));
jest.mock('expo-crypto', () => ({}));

function fakeTransaction(customCategories: string[]) {
  const updatedTo: string[] = [];
  const tx = {
    selectDistinct: () => ({
      from: () => ({
        where: () => ({
          all: () => customCategories.map((category) => ({ category })),
        }),
      }),
    }),
    update: () => ({
      set: (values: { category: string }) => ({
        where: () => ({ run: () => updatedTo.push(values.category) }),
      }),
    }),
  };
  jest
    .mocked(db.transaction)
    .mockImplementation(((body: (tx: unknown) => unknown) =>
      body(tx)) as never);
  return updatedTo;
}

describe('mergeBuiltInDuplicateCategoryRows', () => {
  it('moves products of customs named like a built-in and keeps the others', () => {
    // given
    const updatedTo = fakeTransaction(['Spray do nosa', 'lek', 'Vet gel']);

    // when
    const merged = mergeBuiltInDuplicateCategoryRows();

    // then
    expect(merged).toBe(2);
    expect(updatedTo).toEqual(['nasal-spray', 'medication']);
  });

  it('does nothing when no custom category duplicates a built-in', () => {
    // given
    const updatedTo = fakeTransaction(['Vet gel']);

    // when
    const merged = mergeBuiltInDuplicateCategoryRows();

    // then
    expect(merged).toBe(0);
    expect(updatedTo).toEqual([]);
  });
});
