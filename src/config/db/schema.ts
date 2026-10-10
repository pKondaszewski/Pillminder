import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// Relative on purpose: drizzle-kit loads this file without the @ alias.
import { PRODUCT_UNITS } from '../../products/product-unit';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  strength: text('strength'),
  unit: text('unit', { enum: PRODUCT_UNITS }),
  price: integer('price'),
  storeLink: text('store_link'),
  status: text('status', { enum: ['active', 'archived'] })
    .notNull()
    .default('active'),
  stock: integer('stock'),
  lastUsedAt: integer('last_used_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const schedules = sqliteTable(
  'schedules',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    intervalDays: integer('interval_days').notNull(),
    timesOfDay: text('times_of_day', { mode: 'json' })
      .$type<string[]>()
      .notNull(),
    quantity: integer('quantity').notNull().default(1),
    startDate: integer('start_date', { mode: 'timestamp' }),
    endDate: integer('end_date', { mode: 'timestamp' }),
    pausedAt: integer('paused_at', { mode: 'timestamp' }),
    resumeAt: integer('resume_at', { mode: 'timestamp' }),
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
    plannedAt: integer('planned_at', { mode: 'timestamp' }).notNull(),
    state: text('state', { enum: ['pending', 'taken', 'skipped'] })
      .notNull()
      .default('pending'),
    takenAt: integer('taken_at', { mode: 'timestamp' }),
    takenQuantity: integer('taken_quantity'),
    snoozedUntil: integer('snoozed_until', { mode: 'timestamp' }),
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
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [index('idx_notes_product').on(table.productId)],
);
