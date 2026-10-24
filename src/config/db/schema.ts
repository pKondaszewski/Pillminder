import {
  type AnySQLiteColumn,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// Relative on purpose: drizzle-kit loads this file without the @ alias.
import { DOSE_STATES } from '../../doses/dose-transition';
import { PRODUCT_UNITS } from '../../products/dto/product-unit';
import { STORE_LINK_TARGETS } from '../../products/dto/store-link-target';
import type { ScheduleCycle } from '../../schedules/dto/schedule-cycle';
import type { ScheduleStep } from '../../schedules/dto/schedule-step';

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  strength: text('strength'),
  unit: text('unit', { enum: PRODUCT_UNITS }),
  price: text('price'),
  storeLink: text('store_link'),
  storeLinkTarget: text('store_link_target', { enum: STORE_LINK_TARGETS }),
  status: text('status', { enum: ['active', 'archived'] })
    .notNull()
    .default('active'),
  stock: integer('stock'),
  packSize: integer('pack_size'),
  reorderThreshold: integer('reorder_threshold'),
  fasting: integer('fasting', { mode: 'boolean' }).notNull().default(false),
  profileImageId: text('profile_image_id').references(
    (): AnySQLiteColumn => productImages.id,
    { onDelete: 'set null' },
  ),
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
    weekdays: text('weekdays', { mode: 'json' }).$type<number[]>(),
    cycle: text('cycle', { mode: 'json' }).$type<ScheduleCycle>(),
    rhythmAnchor: integer('rhythm_anchor', { mode: 'timestamp' }),
    rhythmPausedDays: integer('rhythm_paused_days').notNull().default(0),
    timesOfDay: text('times_of_day', { mode: 'json' })
      .$type<string[]>()
      .notNull(),
    quantity: integer('quantity').notNull().default(1),
    steps: text('steps', { mode: 'json' }).$type<ScheduleStep[]>(),
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
    scheduleId: text('schedule_id').references(() => schedules.id, {
      onDelete: 'set null',
    }),
    plannedAt: integer('planned_at', { mode: 'timestamp' }).notNull(),
    state: text('state', { enum: DOSE_STATES }).notNull().default('pending'),
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

export const asNeededIntakes = sqliteTable(
  'as_needed_intakes',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    takenAt: integer('taken_at', { mode: 'timestamp' }).notNull(),
    quantity: integer('quantity').notNull().default(1),
    deductedQuantity: integer('deducted_quantity'),
  },
  (table) => [
    index('idx_as_needed_intakes_product').on(table.productId),
    index('idx_as_needed_intakes_taken_at').on(table.takenAt),
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

export const productImages = sqliteTable(
  'product_images',
  {
    id: text('id').primaryKey(),
    productId: text('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    fileName: text('file_name').notNull(),
    role: text('role').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  },
  (table) => [index('idx_product_images_product').on(table.productId)],
);
