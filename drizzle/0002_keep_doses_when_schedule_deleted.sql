PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_doses` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`schedule_id` text,
	`planned_at` integer NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`taken_at` integer,
	`taken_quantity` integer,
	`snoozed_until` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_doses`("id", "product_id", "schedule_id", "planned_at", "state", "taken_at", "taken_quantity", "snoozed_until") SELECT "id", "product_id", "schedule_id", "planned_at", "state", "taken_at", "taken_quantity", "snoozed_until" FROM `doses`;--> statement-breakpoint
DROP TABLE `doses`;--> statement-breakpoint
ALTER TABLE `__new_doses` RENAME TO `doses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_doses_unique_slot` ON `doses` (`schedule_id`,`planned_at`);--> statement-breakpoint
CREATE INDEX `idx_doses_product` ON `doses` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_doses_planned_at` ON `doses` (`planned_at`);