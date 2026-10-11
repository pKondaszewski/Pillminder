import { db } from './database';

// Drops tables inside the open connection instead of deleting the file: the
// module-level `db` stays valid, so no repository has to know about a reopen.
export function dropAllTables(): void {
  const client = db.$client;
  const tables = client.getAllSync<{ name: string }>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
  );

  // The pragma is a no-op inside a transaction, so it has to wrap it.
  client.execSync('PRAGMA foreign_keys = OFF');
  try {
    client.withTransactionSync(() => {
      tables.forEach(({ name }) =>
        client.execSync(`DROP TABLE IF EXISTS "${name}"`),
      );
    });
  } finally {
    client.execSync('PRAGMA foreign_keys = ON');
  }
}
