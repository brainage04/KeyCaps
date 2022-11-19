DROP DATABASE IF EXISTS `keycaps`;

CREATE DATABASE IF NOT EXISTS `keycaps`;

USE `keycaps`;

CREATE TABLE IF NOT EXISTS `users` (
	`id` int NOT NULL AUTO_INCREMENT,
	`date_created` bigint NOT NULL,
	`username` varchar(255) NOT NULL UNIQUE,
	`password` varchar(255) NOT NULL,
	`email_address` varchar(255) NOT NULL UNIQUE,
	`email_verification_token` int NOT NULL,
	`email_verification_token_expiration` bigint NOT NULL,
    `email_verified` boolean NOT NULL DEFAULT FALSE,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `admins` (
	`id` int NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`id`) REFERENCES `users`(`id`)
);

SELECT * FROM `users`;