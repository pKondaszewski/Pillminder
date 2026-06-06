import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

import * as schema from './schema';

export const DATABASE_NAME = 'pillpal.db';

const expo = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
expo.execSync('PRAGMA foreign_keys = ON');

export const db = drizzle(expo, { schema });
