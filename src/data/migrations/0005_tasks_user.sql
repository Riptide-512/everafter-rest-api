ALTER TABLE `tasks` RENAME TO `tasks_old`;

CREATE TABLE `tasks` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `user_id` integer NOT NULL,
  `title` text NOT NULL,
  `description` text NOT NULL DEFAULT '',
  `status` text NOT NULL DEFAULT 'todo',
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  CONSTRAINT "tasks_status_check" CHECK("tasks"."status" IN ('todo', 'in_progress', 'done'))
);

INSERT INTO `tasks` (`id`, `user_id`, `title`, `description`, `status`, `created_at`, `updated_at`)
SELECT
  t.`id`,
  p.`user_id`,
  t.`title`,
  t.`description`,
  t.`status`,
  t.`created_at`,
  t.`updated_at`
FROM `tasks_old` t
LEFT JOIN `projects` p ON p.`id` = t.`project_id`;

DROP TABLE `tasks_old`;

CREATE INDEX `idx_tasks_user_id` ON `tasks` (`user_id`);
