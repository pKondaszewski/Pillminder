import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { getNotesQuery, removeNote } from '@/notes/note-service';

export function useNotes(productId: string) {
  const { data } = useLiveQuery(getNotesQuery(productId), [productId]);

  return { notes: data, removeNote };
}
