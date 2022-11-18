DROP DATABASE `brainspace`;

CREATE DATABASE IF NOT EXISTS `brainspace`;

USE `brainspace`;

CREATE TABLE IF NOT EXISTS `users` (
	`id` int NOT NULL AUTO_INCREMENT,
	`username` varchar(255) NOT NULL UNIQUE,
	`password` varchar(255) NOT NULL,
	`email_address` varchar(255) NOT NULL UNIQUE,
	`verification_token` varchar(255) NOT NULL UNIQUE,
    `email_verified` BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY (`id`)
);

CREATE TABLE IF NOT EXISTS `admins` (
	`id` int NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`id`) REFERENCES `users`(`id`)
);

SELECT * FROM `users`;

# UPDATE `users` SET `email_verified` = TRUE WHERE id = 1;