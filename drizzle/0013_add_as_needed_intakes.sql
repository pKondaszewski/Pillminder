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
ALTER TABLE `products` ADD `reorder_threshold` integer;