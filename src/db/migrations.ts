export interface Migration {
  version: number;
  up: string;
}

export const migrations: Migration[] = [
  {
    version: 1,
    up: `
      CREATE TABLE products (
        id               TEXT PRIMARY KEY NOT NULL,
        name             TEXT NOT NULL,
        dose             TEXT,
        notes            TEXT,
        category         TEXT NOT NULL,
        custom_category  TEXT,
        price            INTEGER,
        store_link       TEXT,
        status           TEXT NOT NULL DEFAULT 'active',
        stock            INTEGER,
        reorder_threshold INTEGER,
        last_used_at     TEXT,
        completion_note  TEXT,
        created_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL
      );

      CREATE TABLE schedules (
        id            TEXT PRIMARY KEY NOT NULL,
        product_id    TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        type          TEXT NOT NULL,
        interval_days INTEGER NOT NULL,
        times_of_day  TEXT NOT NULL,
        start_date    TEXT NOT NULL,
        end_date      TEXT
      );

      CREATE TABLE doses (
        id          TEXT PRIMARY KEY NOT NULL,
        product_id  TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        schedule_id TEXT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
        planned_at  TEXT NOT NULL,
        state       TEXT NOT NULL DEFAULT 'pending',
        taken_at    TEXT
      );

      CREATE INDEX idx_schedules_product ON schedules(product_id);
      CREATE INDEX idx_doses_product ON doses(product_id);
      CREATE INDEX idx_doses_planned_at ON doses(planned_at);
      CREATE UNIQUE INDEX idx_doses_unique_slot ON doses(schedule_id, planned_at);
    `,
  },
];
