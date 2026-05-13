CREATE TABLE `guest_list` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`count` integer NOT NULL DEFAULT 1,
	`notes` text NOT NULL DEFAULT '',
	`rsvp_confirmed` integer NOT NULL DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_guest_list_user_id` ON `guest_list` (`user_id`);
--> statement-breakpoint
CREATE TABLE `gift_registry` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`store` text NOT NULL DEFAULT '',
	`link` text NOT NULL,
	`price` real NOT NULL DEFAULT 0,
	`priority` text NOT NULL DEFAULT 'Medium',
	`purchased` integer NOT NULL DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_gift_registry_user_id` ON `gift_registry` (`user_id`);
