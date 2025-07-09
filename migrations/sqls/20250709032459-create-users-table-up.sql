CREATE TABLE `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `telegram_id` BIGINT(20) NOT NULL,
  `username` VARCHAR(255) DEFAULT NULL,
  `is_admin` TINYINT(1) NOT NULL DEFAULT 0,
  `language_code` VARCHAR(10) DEFAULT NULL,
  `phone_number` VARCHAR(20) DEFAULT NULL,
  `first_name` VARCHAR(255) DEFAULT NULL,
  `last_name` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telegram_id` (`telegram_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;