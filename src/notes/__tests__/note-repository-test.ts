import { clearTestDatabase, insertProduct } from '@/config/db/test-database';

import {
  createNoteRow,
  deleteNoteRow,
  notesByProductQuery,
  restoreNoteRow,
} from '../note-repository';

jest.mock('@/config/db/database', () =>
  jest.requireActual('@/config/db/test-database'),
);
jest.mock(
  'expo-crypto',
  () => jest.requireActual('@/config/db/test-database').testCrypto,
);

describe('note deletion', () => {
  beforeEach(() => clearTestDatabase());

  it('returns the deleted note and restores it unchanged', async () => {
    // given
    insertProduct({ id: 'p1' });
    const created = await createNoteRow('p1', 'Take with food');

    // when
    const deleted = await deleteNoteRow(created.id);
    const afterDelete = await notesByProductQuery('p1');
    if (!deleted) throw new Error('note was not deleted');
    await restoreNoteRow(deleted);

    // then
    expect(deleted).toEqual(created);
    expect(afterDelete).toEqual([]);
    expect(await notesByProductQuery('p1')).toEqual([created]);
  });

  it('returns nothing for an unknown note', async () => {
    // when
    const deleted = await deleteNoteRow('missing');

    // then
    expect(deleted).toBeUndefined();
  });
});
