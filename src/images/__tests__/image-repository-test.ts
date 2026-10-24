import { eq } from 'drizzle-orm';

import { productImages, products } from '@/config/db/schema';
import {
  clearTestDatabase,
  db,
  insertImage,
  insertProduct,
} from '@/config/db/test-database';

import {
  createImageRow,
  deleteImageRow,
  restoreImageRow,
} from '../image-repository';

jest.mock('@/config/db/database', () =>
  jest.requireActual('@/config/db/test-database'),
);
jest.mock(
  'expo-crypto',
  () => jest.requireActual('@/config/db/test-database').testCrypto,
);

function profileImageId(productId = 'p1') {
  return db
    .select({ id: products.profileImageId })
    .from(products)
    .where(eq(products.id, productId))
    .get()?.id;
}

describe('image repository', () => {
  beforeEach(() => clearTestDatabase());

  it('makes the first image of a product its profile and keeps it when a second one is added', async () => {
    // given
    insertProduct({ id: 'p1' });

    // when
    const first = await createImageRow('p1', 'first.jpg');
    await createImageRow('p1', 'second.jpg');

    // then
    expect(profileImageId()).toBe(first.id);
    expect(db.select().from(productImages).all()).toHaveLength(2);
  });

  it('clears the profile reference when the profile image is deleted', async () => {
    // given
    insertProduct({ id: 'p1' });
    const image = await createImageRow('p1', 'first.jpg');

    // when
    await deleteImageRow(image.id);

    // then
    expect(profileImageId()).toBeNull();
    expect(db.select().from(productImages).all()).toEqual([]);
  });

  it('leaves the profile alone when another image is deleted', async () => {
    // given
    insertProduct({ id: 'p1' });
    const profile = await createImageRow('p1', 'first.jpg');
    const other = await createImageRow('p1', 'second.jpg');

    // when
    await deleteImageRow(other.id);

    // then
    expect(profileImageId()).toBe(profile.id);
  });

  it('restores a deleted image, as the profile when it was one', async () => {
    // given
    insertProduct({ id: 'p1' });
    const image = await createImageRow('p1', 'first.jpg');
    await deleteImageRow(image.id);

    // when
    await restoreImageRow(image, true);

    // then
    expect(profileImageId()).toBe(image.id);
    expect(
      db
        .select()
        .from(productImages)
        .all()
        .map((row) => row.id),
    ).toEqual([image.id]);
  });

  it('restores a deleted image without making it the profile', async () => {
    // given
    insertProduct({ id: 'p1' });
    const image = insertImage({
      id: 'img',
      productId: 'p1',
      fileName: 'a.jpg',
    });
    db.delete(productImages).run();

    // when
    await restoreImageRow(image, false);

    // then
    expect(profileImageId()).toBeNull();
    expect(db.select().from(productImages).all()).toHaveLength(1);
  });
});
