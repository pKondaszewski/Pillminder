UPDATE `schedules` SET `interval_days` = 1 WHERE `interval_days` < 1;--> statement-breakpoint
UPDATE `schedules` SET `quantity` = 1 WHERE `quantity` < 1;
