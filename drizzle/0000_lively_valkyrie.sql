CREATE TABLE `doses` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`schedule_id` text NOT NULL,
	`planned_at` text NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`taken_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`schedule_id`) REFERENCES `schedules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_doses_unique_slot` ON `doses` (`schedule_id`,`planned_at`);--> statement-breakpoint
CREATE INDEX `idx_doses_product` ON `doses` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_doses_planned_at` ON `doses` (`planned_at`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notes_product` ON `notes` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price` integer,
	`store_link` text,
	`status` text DEFAULT 'active' NOT NULL,
	`stock` integer,
	`last_used_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`interval_days` integer NOT NULL,
	`times_of_day` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_schedules_product` ON `schedules` (`product_id`);