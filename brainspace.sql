DROP DATABASE `brainspace`;

CREATE DATABASE IF NOT EXISTS `brainspace`;

USE `brainspace`;

CREATE TABLE IF NOT EXISTS `users` (
	`id` int NOT NULL AUTO_INCREMENT,
	`username` varchar(255) NOT NULL UNIQUE,
	`password` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL UNIQUE,
	PRIMARY KEY (`id`)
);

INSERT INTO `users` (`username`, `password`, `email`) VALUES ("Brainage", "$2y$10$aQEpsKARGa8tg597IrVGZeRORc76QSIxCqcSr9Lv7HzEMfm76IgyO", "thomasmcmah21@gmail.com"); # password is "Brainage030204!!!" salted with cost factor of 10

CREATE TABLE IF NOT EXISTS `admins` (
	`id` int NOT NULL,
	PRIMARY KEY (`id`),
	FOREIGN KEY (`id`) REFERENCES `users`(`id`)
);

INSERT INTO `admins` VALUES (1);

SELECT * FROM `users`;