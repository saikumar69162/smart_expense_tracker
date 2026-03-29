CREATE DATABASE IF NOT EXISTS appdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE appdb;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Budgets`;
DROP TABLE IF EXISTS `Expenses`;
DROP TABLE IF EXISTS `Categories`;
DROP TABLE IF EXISTS `Users`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `Users` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(50) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `currency` VARCHAR(255) NOT NULL DEFAULT 'USD',
  `timezone` VARCHAR(255) NOT NULL DEFAULT 'UTC',
  `emailVerified` TINYINT(1) NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `lastLogin` DATETIME DEFAULT NULL,
  `preferences` JSON DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  KEY `users_is_active_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Categories` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) DEFAULT NULL,
  `name` VARCHAR(255) NOT NULL,
  `icon` VARCHAR(255) NOT NULL DEFAULT 'note',
  `color` VARCHAR(255) NOT NULL DEFAULT '#6b7280',
  `type` ENUM('expense', 'income') NOT NULL DEFAULT 'expense',
  `isDefault` TINYINT(1) NOT NULL DEFAULT 0,
  `parentCategory` CHAR(36) DEFAULT NULL,
  `budget` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_user_name_unique` (`userId`, `name`),
  KEY `categories_type_idx` (`type`),
  KEY `categories_is_default_idx` (`isDefault`),
  KEY `categories_parent_idx` (`parentCategory`),
  CONSTRAINT `categories_user_fk`
    FOREIGN KEY (`userId`) REFERENCES `Users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `categories_parent_fk`
    FOREIGN KEY (`parentCategory`) REFERENCES `Categories` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Expenses` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `categoryId` CHAR(36) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `date` DATE NOT NULL,
  `paymentMethod` ENUM('cash', 'card', 'online', 'other') NOT NULL DEFAULT 'cash',
  `location` VARCHAR(255) DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `receipt` VARCHAR(255) DEFAULT NULL,
  `isRecurring` TINYINT(1) NOT NULL DEFAULT 0,
  `recurringFrequency` ENUM('daily', 'weekly', 'monthly', 'yearly') DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `expenses_user_date_idx` (`userId`, `date`),
  KEY `expenses_user_category_idx` (`userId`, `categoryId`),
  KEY `expenses_category_idx` (`categoryId`),
  CONSTRAINT `expenses_user_fk`
    FOREIGN KEY (`userId`) REFERENCES `Users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `expenses_category_fk`
    FOREIGN KEY (`categoryId`) REFERENCES `Categories` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `expenses_amount_chk`
    CHECK (`amount` >= 0.01)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `Budgets` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `categoryId` CHAR(36) DEFAULT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `period` ENUM('monthly', 'weekly', 'yearly') NOT NULL DEFAULT 'monthly',
  `startDate` DATE NOT NULL,
  `endDate` DATE DEFAULT NULL,
  `alertThreshold` INT NOT NULL DEFAULT 80,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `budgets_user_idx` (`userId`),
  KEY `budgets_category_idx` (`categoryId`),
  CONSTRAINT `budgets_user_fk`
    FOREIGN KEY (`userId`) REFERENCES `Users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `budgets_category_fk`
    FOREIGN KEY (`categoryId`) REFERENCES `Categories` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `budgets_amount_chk`
    CHECK (`amount` >= 0),
  CONSTRAINT `budgets_alert_threshold_chk`
    CHECK (`alertThreshold` BETWEEN 0 AND 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `Categories` (`id`, `userId`, `name`, `icon`, `color`, `type`, `isDefault`, `parentCategory`, `budget`, `createdAt`, `updatedAt`) VALUES
  (UUID(), NULL, 'Food', '🍔', '#ef4444', 'expense', 1, NULL, 0.00, NOW(), NOW()),
  (UUID(), NULL, 'Transportation', '🚗', '#3b82f6', 'expense', 1, NULL, 0.00, NOW(), NOW()),
  (UUID(), NULL, 'Shopping', '🛍️', '#10b981', 'expense', 1, NULL, 0.00, NOW(), NOW()),
  (UUID(), NULL, 'Entertainment', '🎬', '#f59e0b', 'expense', 1, NULL, 0.00, NOW(), NOW()),
  (UUID(), NULL, 'Utilities', '💡', '#8b5cf6', 'expense', 1, NULL, 0.00, NOW(), NOW()),
  (UUID(), NULL, 'Healthcare', '🏥', '#ec4898', 'expense', 1, NULL, 0.00, NOW(), NOW()),
  (UUID(), NULL, 'Education', '📚', '#06b6d4', 'expense', 1, NULL, 0.00, NOW(), NOW()),
  (UUID(), NULL, 'Other', '📝', '#6b7280', 'expense', 1, NULL, 0.00, NOW(), NOW());
