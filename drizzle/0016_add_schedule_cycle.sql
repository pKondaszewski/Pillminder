ALTER TABLE `schedules` ADD `cycle` text;--> statement-breakpoint
ALTER TABLE `schedules` ADD `cycle_anchor` integer;--> statement-breakpoint
ALTER TABLE `schedules` ADD `cycle_paused_days` integer DEFAULT 0 NOT NULL;