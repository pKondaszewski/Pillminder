import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category', {
    enum: ['medication', 'supplement', 'care'],
  }).notNull(),
  price: integer('price'),
  storeLink: text('store_link'),
  status: text('status', { enum: ['active', 'archived'] })
    .notNull()
    .default('active'),
  stock: integer('stock'),
  lastUsedAt: text('last_used_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const schedules = sqliteTable(
  'schedules',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['daily', 'everyXDays'] }).notNull(),
    intervalDays: integer('interval_days').notNull(),
    timesOfDay: text('times_of_day', { mode: 'json' })
      .$type<string[]>()
      .notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date'),
  },
  (table) => [index('idx_schedules_product').on(table.productId)],
);

export const doses = sqliteTable(
  'doses',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    scheduleId: text('schedule_id')
      .notNull()
      .references(() => schedules.id, { onDelete: 'cascade' }),
    plannedAt: text('planned_at').notNull(),
    state: text('state', { enum: ['pending', 'taken', 'skipped'] })
      .notNull()
      .default('pending'),
    takenAt: text('taken_at'),
  },
  (table) => [
    uniqueIndex('idx_doses_unique_slot').on(table.scheduleId, table.plannedAt),
    index('idx_doses_product').on(table.productId),
    index('idx_doses_planned_at').on(table.plannedAt),
  ],
);

export const notes = sqliteTable(
  'notes',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    body: text('body').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [index('idx_notes_product').on(table.productId)],
);
