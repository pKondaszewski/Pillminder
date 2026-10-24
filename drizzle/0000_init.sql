CREATE TABLE `as_needed_intakes` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`taken_at` integer NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_as_needed_intakes_product` ON `as_needed_intakes` (`product_id`);--> statement-breakpoint
CREATE INDEX `idx_as_needed_intakes_taken_at` ON `as_needed_intakes` (`taken_at`);--> statement-breakpoint
CREATE TABLE `doses` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`schedule_id` text NOT NULL,
	`planned_at` integer NOT NULL,
	`state` text DEFAULT 'pending' NOT NULL,
	`taken_at` integer,
	`taken_quantity` integer,
	`snoozed_until` integer,
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
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_notes_product` ON `notes` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`file_name` text NOT NULL,
	`role` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_product_images_product` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`strength` text,
	`unit` text,
	`price` text,
	`store_link` text,
	`store_link_target` text,
	`status` text DEFAULT 'active' NOT NULL,
	`stock` integer,
	`pack_size` integer,
	`reorder_threshold` integer,
	`fasting` integer DEFAULT false NOT NULL,
	`profile_image_id` text,
	`last_used_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`profile_image_id`) REFERENCES `product_images`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`interval_days` integer NOT NULL,
	`weekdays` text,
	`cycle` text,
	`rhythm_anchor` integer,
	`rhythm_paused_days` integer DEFAULT 0 NOT NULL,
	`times_of_day` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`steps` text,
	`start_date` integer,
	`end_date` integer,
	`paused_at` integer,
	`resume_at` integer,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_schedules_product` ON `schedules` (`product_id`);