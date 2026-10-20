ALTER TABLE `products` ADD `price_text` text;--> statement-breakpoint
UPDATE `products` SET `price_text` = CAST(`price` AS text) WHERE `price` IS NOT NULL;--> statement-breakpoint
ALTER TABLE `products` DROP COLUMN `price`;--> statement-breakpoint
ALTER TABLE `products` RENAME COLUMN `price_text` TO `price`;
