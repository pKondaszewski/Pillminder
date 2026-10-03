ALTER TABLE `doses` ADD `taken_quantity` integer;--> statement-breakpoint
ALTER TABLE `products` ADD `strength` text;--> statement-breakpoint
ALTER TABLE `schedules` ADD `quantity` integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `schedules` ADD `start_date` integer;--> statement-breakpoint
ALTER TABLE `schedules` ADD `end_date` integer;