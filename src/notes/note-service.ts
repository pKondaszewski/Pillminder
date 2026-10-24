import { createLogger } from '@/config/logger';

import {
  createNoteRow,
  deleteNoteRow,
  type Note,
  notesByProductQuery,
  restoreNoteRow,
  updateNoteBodyRow,
} from './note-repository';

export type { Note } from './note-repository';

const log = createLogger('note-service');

export function getNotesQuery(productId: string) {
  return notesByProductQuery(productId);
}

export async function addNote(
  productId: string,
  body: string,
): Promise<string | null> {
  const trimmed = body.trim();
  if (trimmed === '') return null;
  log.info(`Adding note to product ${productId}`);
  try {
    return (await createNoteRow(productId, trimmed)).id;
  } catch (err) {
    log.error(`Failed to add note to product ${productId}`, err);
    throw err;
  }
}

export async function editNote(id: string, body: string): Promise<void> {
  const trimmed = body.trim();
  if (trimmed === '') return;
  log.info(`Updating note ${id}`);
  try {
    await updateNoteBodyRow(id, trimmed);
  } catch (err) {
    log.error(`Failed to update note ${id}`, err);
    throw err;
  }
}

export async function removeNote(id: string): Promise<Note | undefined> {
  log.info(`Deleting note ${id}`);
  try {
    return await deleteNoteRow(id);
  } catch (err) {
    log.error(`Failed to delete note ${id}`, err);
    throw err;
  }
}

export async function restoreNote(note: Note): Promise<void> {
  log.info(`Restoring note ${note.id}`);
  try {
    await restoreNoteRow(note);
  } catch (err) {
    log.error(`Failed to restore note ${note.id}`, err);
    throw err;
  }
}
