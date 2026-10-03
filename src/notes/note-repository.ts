import { desc, eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { notes } from '@/config/db/schema';

export type Note = typeof notes.$inferSelect;

export function notesByProductQuery(productId: string) {
  return db
    .select()
    .from(notes)
    .where(eq(notes.productId, productId))
    .orderBy(desc(notes.createdAt));
}

export async function createNote(
  productId: string,
  body: string,
): Promise<Note> {
  const now = new Date();
  const [created] = await db
    .insert(notes)
    .values({
      id: Crypto.randomUUID(),
      productId,
      body,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
}

export async function updateNoteBody(id: string, body: string): Promise<void> {
  await db
    .update(notes)
    .set({ body, updatedAt: new Date() })
    .where(eq(notes.id, id));
}

export async function deleteNoteRow(id: string): Promise<void> {
  await db.delete(notes).where(eq(notes.id, id));
}
