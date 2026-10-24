import fs from 'node:fs';
import path from 'node:path';

import BetterSqlite3 from 'better-sqlite3';

const MIGRATIONS = path.join(__dirname, '../../../../drizzle');

function applyMigration(client: BetterSqlite3.Database, file: string): void {
  fs.readFileSync(path.join(MIGRATIONS, file), 'utf8')
    .split('--> statement-breakpoint')
    .forEach((statement) => client.exec(statement));
}

function databaseBeforeMigration(): BetterSqlite3.Database {
  const client = new BetterSqlite3(':memory:');
  client.pragma('foreign_keys = ON');
  applyMigration(client, '0000_init.sql');
  applyMigration(client, '0001_add_intake_deducted_quantity.sql');
  client.exec(`
    INSERT INTO products (id, name, category, created_at, updated_at) VALUES ('p1', 'Product', 'medication', 0, 0);
    INSERT INTO schedules (id, product_id, interval_days, times_of_day) VALUES ('s1', 'p1', 1, '["08:00"]');
    INSERT INTO doses (id, product_id, schedule_id, planned_at, state, taken_at, taken_quantity, snoozed_until) VALUES
      ('d1', 'p1', 's1', 100, 'taken', 101, 2, NULL),
      ('d2', 'p1', 's1', 200, 'skipped', NULL, NULL, NULL),
      ('d3', 'p1', 's1', 300, 'pending', NULL, NULL, 350);
  `);
  return client;
}

describe('0002_keep_doses_when_schedule_deleted', () => {
  it('keeps every dose with all its columns and breaks no foreign key', () => {
    // given
    const client = databaseBeforeMigration();
    const before = client.prepare('SELECT * FROM doses ORDER BY id').all();

    // when
    applyMigration(client, '0002_keep_doses_when_schedule_deleted.sql');

    // then
    expect(before).toHaveLength(3);
    expect(client.prepare('SELECT * FROM doses ORDER BY id').all()).toEqual(
      before,
    );
    expect(client.pragma('foreign_key_check')).toEqual([]);
  });

  it('keeps the unique slot index and the other indexes', () => {
    // given
    const client = databaseBeforeMigration();

    // when
    applyMigration(client, '0002_keep_doses_when_schedule_deleted.sql');

    // then
    const indexes = client
      .prepare('SELECT name, "unique" FROM pragma_index_list(\'doses\')')
      .all();
    expect(indexes).toEqual(
      expect.arrayContaining([
        { name: 'idx_doses_unique_slot', unique: 1 },
        { name: 'idx_doses_product', unique: 0 },
        { name: 'idx_doses_planned_at', unique: 0 },
      ]),
    );
    expect(() =>
      client.exec(
        "INSERT INTO doses (id, product_id, schedule_id, planned_at) VALUES ('dup', 'p1', 's1', 100)",
      ),
    ).toThrow(/UNIQUE/);
  });

  it('sets schedule_id to null when the schedule is deleted and cascades on the product', () => {
    // given
    const client = databaseBeforeMigration();
    applyMigration(client, '0002_keep_doses_when_schedule_deleted.sql');

    // when
    client.exec("DELETE FROM schedules WHERE id = 's1'");
    const afterScheduleDelete = client
      .prepare('SELECT id, schedule_id FROM doses ORDER BY id')
      .all();
    client.exec("DELETE FROM products WHERE id = 'p1'");

    // then
    expect(afterScheduleDelete).toEqual([
      { id: 'd1', schedule_id: null },
      { id: 'd2', schedule_id: null },
      { id: 'd3', schedule_id: null },
    ]);
    expect(client.prepare('SELECT * FROM doses').all()).toEqual([]);
  });
});
