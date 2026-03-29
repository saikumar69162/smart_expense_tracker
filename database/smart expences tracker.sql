-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: mysql:3306
-- Generation Time: Mar 29, 2026 at 02:37 PM
-- Server version: 8.4.8
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `appdb`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`appuser`@`%` PROCEDURE `GenerateRecurringExpenses` ()   BEGIN
    INSERT INTO expenses (user_id, category_id, amount, description, expense_date, is_recurring, recurring_id)
    SELECT 
        r.user_id,
        r.category_id,
        r.amount,
        r.description,
        CURDATE(),
        TRUE,
        r.id
    FROM recurring_expenses r
    WHERE r.is_active = TRUE
        AND r.next_due_date <= CURDATE();
    
    UPDATE recurring_expenses
    SET 
        next_due_date = CASE frequency
            WHEN 'daily' THEN DATE_ADD(next_due_date, INTERVAL interval_count DAY)
            WHEN 'weekly' THEN DATE_ADD(next_due_date, INTERVAL (interval_count * 7) DAY)
            WHEN 'biweekly' THEN DATE_ADD(next_due_date, INTERVAL (interval_count * 14) DAY)
            WHEN 'monthly' THEN DATE_ADD(next_due_date, INTERVAL interval_count MONTH)
            WHEN 'quarterly' THEN DATE_ADD(next_due_date, INTERVAL (interval_count * 3) MONTH)
            WHEN 'yearly' THEN DATE_ADD(next_due_date, INTERVAL interval_count YEAR)
        END,
        last_generated_date = CURDATE()
    WHERE is_active = TRUE
        AND next_due_date <= CURDATE();
END$$

CREATE DEFINER=`appuser`@`%` PROCEDURE `GetBudgetStatus` (IN `p_user_id` CHAR(36), IN `p_year` INT, IN `p_month` INT)   BEGIN
    SELECT 
        b.id AS budget_id,
        c.name AS category_name,
        b.amount AS budget_amount,
        COALESCE(SUM(e.amount), 0) AS actual_amount,
        b.amount - COALESCE(SUM(e.amount), 0) AS remaining,
        CASE 
            WHEN b.amount = 0 THEN 0
            ELSE ROUND((COALESCE(SUM(e.amount), 0) / b.amount) * 100, 2)
        END AS percentage_used,
        CASE 
            WHEN COALESCE(SUM(e.amount), 0) > b.amount THEN 'Exceeded'
            WHEN COALESCE(SUM(e.amount), 0) = b.amount THEN 'Met'
            ELSE 'Under Budget'
        END AS status
    FROM budgets b
    LEFT JOIN categories c ON b.category_id = c.id
    LEFT JOIN expenses e ON e.category_id = b.category_id 
        AND e.user_id = b.user_id
        AND YEAR(e.expense_date) = p_year
        AND MONTH(e.expense_date) = p_month
    WHERE b.user_id = p_user_id
        AND b.year = p_year
        AND b.month = p_month
        AND b.is_active = TRUE
    GROUP BY b.id, c.name, b.amount;
END$$

CREATE DEFINER=`appuser`@`%` PROCEDURE `GetCategoryBreakdown` (IN `p_user_id` CHAR(36), IN `p_start_date` DATE, IN `p_end_date` DATE)   BEGIN
    SELECT 
        c.name AS category_name,
        c.icon,
        c.color,
        COUNT(e.id) AS transaction_count,
        SUM(e.amount) AS total_amount,
        ROUND((SUM(e.amount) / (SELECT COALESCE(SUM(amount), 1) FROM expenses WHERE user_id = p_user_id AND expense_date BETWEEN p_start_date AND p_end_date) * 100), 2) AS percentage
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = p_user_id
        AND e.expense_date BETWEEN p_start_date AND p_end_date
        AND c.type = 'expense'
    GROUP BY c.id, c.name, c.icon, c.color
    ORDER BY total_amount DESC;
END$$

CREATE DEFINER=`appuser`@`%` PROCEDURE `GetDailySpendingTrend` (IN `p_user_id` CHAR(36), IN `p_start_date` DATE, IN `p_end_date` DATE)   BEGIN
    SELECT 
        expense_date,
        COUNT(*) AS transaction_count,
        SUM(amount) AS daily_total,
        AVG(amount) AS average_transaction
    FROM expenses
    WHERE user_id = p_user_id
        AND expense_date BETWEEN p_start_date AND p_end_date
    GROUP BY expense_date
    ORDER BY expense_date DESC;
END$$

CREATE DEFINER=`appuser`@`%` PROCEDURE `GetFinancialSummary` (IN `p_user_id` CHAR(36), IN `p_year` INT, IN `p_month` INT)   BEGIN
    SELECT 
        COALESCE(SUM(CASE WHEN c.type = 'income' THEN e.amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN c.type = 'expense' THEN e.amount ELSE 0 END), 0) AS total_expense,
        COALESCE(SUM(CASE WHEN c.type = 'income' THEN e.amount ELSE -e.amount END), 0) AS net_savings
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = p_user_id
        AND YEAR(e.expense_date) = p_year
        AND MONTH(e.expense_date) = p_month;
END$$

CREATE DEFINER=`appuser`@`%` PROCEDURE `GetMonthlyExpenseSummary` (IN `p_user_id` CHAR(36), IN `p_year` INT, IN `p_month` INT)   BEGIN
    SELECT 
        c.id AS category_id,
        c.name AS category_name,
        c.icon,
        c.color,
        COUNT(e.id) AS transaction_count,
        COALESCE(SUM(e.amount), 0) AS total_amount,
        COALESCE(AVG(e.amount), 0) AS average_amount
    FROM categories c
    LEFT JOIN expenses e ON e.category_id = c.id 
        AND e.user_id = p_user_id
        AND YEAR(e.expense_date) = p_year
        AND MONTH(e.expense_date) = p_month
    WHERE c.type = 'expense' 
        AND (c.user_id = p_user_id OR c.is_system = TRUE)
    GROUP BY c.id, c.name, c.icon, c.color
    ORDER BY total_amount DESC;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `category_id` char(36) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `period` enum('monthly','quarterly','yearly') DEFAULT 'monthly',
  `year` int NOT NULL,
  `month` int DEFAULT NULL,
  `alert_threshold` int DEFAULT '80',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) DEFAULT NULL,
  `name` varchar(50) NOT NULL,
  `icon` varchar(10) DEFAULT 0xF09F939D,
  `color` varchar(7) DEFAULT '#6B7280',
  `type` enum('expense','income') DEFAULT 'expense',
  `parent_id` char(36) DEFAULT NULL,
  `is_system` tinyint(1) DEFAULT '0',
  `budget_limit` decimal(12,2) DEFAULT '0.00',
  `sort_order` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `user_id`, `name`, `icon`, `color`, `type`, `parent_id`, `is_system`, `budget_limit`, `sort_order`, `created_at`, `updated_at`) VALUES
('510c74bb-2b6f-11f1-b778-fa49175581a8', NULL, 'Food & Dining', '🍔', '#EF4444', 'expense', NULL, 1, 0.00, 1, '2026-03-29 13:00:52', '2026-03-29 13:00:52'),
('510c7af0-2b6f-11f1-b778-fa49175581a8', NULL, 'Entertainment', '🎬', '#F59E0B', 'expense', NULL, 1, 0.00, 4, '2026-03-29 13:00:52', '2026-03-29 13:00:52'),
('510c7c76-2b6f-11f1-b778-fa49175581a8', NULL, 'Insurance', '🛡️', '#14B8A6', 'expense', NULL, 1, 0.00, 9, '2026-03-29 13:00:52', '2026-03-29 13:00:52'),
('510c7cd4-2b6f-11f1-b778-fa49175581a8', NULL, 'Gifts & Donations', '🎁', '#A855F7', 'expense', NULL, 1, 0.00, 11, '2026-03-29 13:00:52', '2026-03-29 13:00:52'),
('510c7d32-2b6f-11f1-b778-fa49175581a8', NULL, 'Salary', '💰', '#10B981', 'income', NULL, 1, 0.00, 1, '2026-03-29 13:00:52', '2026-03-29 13:00:52'),
('510c7dc1-2b6f-11f1-b778-fa49175581a8', NULL, 'Gift Received', '🎁', '#F59E0B', 'income', NULL, 1, 0.00, 4, '2026-03-29 13:00:52', '2026-03-29 13:00:52'),
('6bd2e5ee-2b6f-11f1-b778-fa49175581a8', NULL, 'Transportation', '🚗', '#3B82F6', 'expense', NULL, 1, 0.00, 2, '2026-03-29 13:01:37', '2026-03-29 13:01:37'),
('6bd2e65a-2b6f-11f1-b778-fa49175581a8', NULL, 'Shopping', '🛍️', '#10B981', 'expense', NULL, 1, 0.00, 3, '2026-03-29 13:01:37', '2026-03-29 13:01:37'),
('6bd2e726-2b6f-11f1-b778-fa49175581a8', NULL, 'Utilities', '💡', '#8B5CF6', 'expense', NULL, 1, 0.00, 5, '2026-03-29 13:01:37', '2026-03-29 13:01:37'),
('6bd2e7d3-2b6f-11f1-b778-fa49175581a8', NULL, 'Education', '📚', '#06B6D4', 'expense', NULL, 1, 0.00, 7, '2026-03-29 13:01:37', '2026-03-29 13:01:37'),
('6bd2e80a-2b6f-11f1-b778-fa49175581a8', NULL, 'Rent & Mortgage', '🏠', '#6366F1', 'expense', NULL, 1, 0.00, 8, '2026-03-29 13:01:37', '2026-03-29 13:01:37'),
('6bd2ec34-2b6f-11f1-b778-fa49175581a8', NULL, 'Personal Care', '💇', '#F43F5E', 'expense', NULL, 1, 0.00, 10, '2026-03-29 13:01:37', '2026-03-29 13:01:37'),
('6bd2ee9a-2b6f-11f1-b778-fa49175581a8', NULL, 'Travel', '✈️', '#0EA5E9', 'expense', NULL, 1, 0.00, 12, '2026-03-29 13:01:37', '2026-03-29 13:01:37'),
('6bd2ef2b-2b6f-11f1-b778-fa49175581a8', NULL, 'Freelance', '💼', '#3B82F6', 'income', NULL, 1, 0.00, 2, '2026-03-29 13:01:37', '2026-03-29 13:01:37'),
('bb1d187f-2b6f-11f1-b778-fa49175581a8', NULL, 'Healthcare', '🏥', '#EC4898', 'expense', NULL, 1, 0.00, 6, '2026-03-29 13:03:50', '2026-03-29 13:03:50'),
('bb1d1c40-2b6f-11f1-b778-fa49175581a8', NULL, 'Investment', '📈', '#8B5CF6', 'income', NULL, 1, 0.00, 3, '2026-03-29 13:03:50', '2026-03-29 13:03:50'),
('bb1d1cb6-2b6f-11f1-b778-fa49175581a8', NULL, 'Other', '📝', '#6B7280', 'expense', NULL, 1, 0.00, 99, '2026-03-29 13:03:50', '2026-03-29 13:03:50');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `category_id` char(36) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` text,
  `expense_date` date NOT NULL,
  `payment_method` enum('cash','credit_card','debit_card','bank_transfer','mobile_payment','other') DEFAULT 'cash',
  `location` varchar(255) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `receipt_image` varchar(500) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT '0',
  `recurring_id` char(36) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','success','warning','error') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `action_url` varchar(500) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `recurring_expenses`
--

CREATE TABLE `recurring_expenses` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `category_id` char(36) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` text,
  `frequency` enum('daily','weekly','biweekly','monthly','quarterly','yearly') NOT NULL,
  `interval_count` int DEFAULT '1',
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `next_due_date` date NOT NULL,
  `last_generated_date` date DEFAULT NULL,
  `day_of_month` int DEFAULT NULL,
  `day_of_week` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `savings_contributions`
--

CREATE TABLE `savings_contributions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `goal_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `contribution_date` date NOT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `savings_goals`
--

CREATE TABLE `savings_goals` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `target_amount` decimal(12,2) NOT NULL,
  `current_amount` decimal(12,2) DEFAULT '0.00',
  `start_date` date NOT NULL,
  `target_date` date NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `currency_code` varchar(3) DEFAULT 'USD',
  `monthly_budget` decimal(12,2) DEFAULT '0.00',
  `email_verified` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `role` varchar(20) DEFAULT 'user',
  `preferences` json DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(45) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `full_name`, `avatar_url`, `currency_code`, `monthly_budget`, `email_verified`, `is_active`, `role`, `preferences`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`) VALUES
('1af2a4d7-7c35-4e00-bcf9-b5f3ba26c603', 'saikumar', 'saikumar@gmail.com', '$2a$10$DVOVObN3be6EgI5Lfi5AIO5sorZ56vORWBzqg1JynlfG/8aVRbLcW', 'Sai kumar', NULL, 'GBP', 0.00, 0, 1, 'user', '{\"darkMode\": false, \"weeklyReport\": true, \"notifications\": true}', NULL, NULL, '2026-03-29 13:51:51', '2026-03-29 14:36:37'),
('bb2169b1-2b6f-11f1-b778-fa49175581a8', 'demo_user', 'Saikumar1@gmail.com', '$2a$10$ymhX2T62Ro54rg1pxZUq7OQasLXMx1KCQJjLFDJjLmeI80g8pcJAy', 'Demo User', NULL, 'GBP', 0.00, 1, 1, 'user', NULL, NULL, NULL, '2026-03-29 13:03:50', '2026-03-29 14:36:53');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` char(36) NOT NULL DEFAULT (uuid()),
  `user_id` char(36) NOT NULL,
  `session_token` varchar(500) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `expires_at` timestamp NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_budget_vs_actual`
-- (See below for the actual view)
--
CREATE TABLE `v_budget_vs_actual` (
`user_id` char(36)
,`year` int
,`month` int
,`category_name` varchar(50)
,`budget_amount` decimal(12,2)
,`actual_amount` decimal(34,2)
,`variance` decimal(35,2)
,`percentage_used` decimal(40,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_daily_spending`
-- (See below for the actual view)
--
CREATE TABLE `v_daily_spending` (
`user_id` char(36)
,`expense_date` date
,`num_transactions` bigint
,`total_spent` decimal(34,2)
,`avg_transaction` decimal(16,6)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_monthly_expense_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_monthly_expense_summary` (
`user_id` char(36)
,`full_name` varchar(100)
,`year` year
,`month` int
,`category_name` varchar(50)
,`icon` varchar(10)
,`transaction_count` bigint
,`total_amount` decimal(34,2)
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_category_period` (`user_id`,`category_id`,`year`,`month`),
  ADD KEY `idx_budgets_user_id` (`user_id`),
  ADD KEY `idx_budgets_category_id` (`category_id`),
  ADD KEY `idx_budgets_year_month` (`year`,`month`),
  ADD KEY `idx_budgets_is_active` (`is_active`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_category` (`user_id`,`name`),
  ADD KEY `parent_id` (`parent_id`),
  ADD KEY `idx_categories_user_id` (`user_id`),
  ADD KEY `idx_categories_type` (`type`),
  ADD KEY `idx_categories_is_system` (`is_system`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_expenses_user_id` (`user_id`),
  ADD KEY `idx_expenses_category_id` (`category_id`),
  ADD KEY `idx_expenses_expense_date` (`expense_date`),
  ADD KEY `idx_expenses_user_date` (`user_id`,`expense_date`),
  ADD KEY `idx_expenses_amount` (`amount`),
  ADD KEY `idx_expenses_payment_method` (`payment_method`),
  ADD KEY `idx_expenses_is_recurring` (`is_recurring`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notifications_user_id` (`user_id`),
  ADD KEY `idx_notifications_is_read` (`is_read`),
  ADD KEY `idx_notifications_created_at` (`created_at`),
  ADD KEY `idx_notifications_user_unread` (`user_id`,`is_read`);

--
-- Indexes for table `recurring_expenses`
--
ALTER TABLE `recurring_expenses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `idx_recurring_user_id` (`user_id`),
  ADD KEY `idx_recurring_next_due_date` (`next_due_date`),
  ADD KEY `idx_recurring_is_active` (`is_active`),
  ADD KEY `idx_recurring_frequency` (`frequency`);

--
-- Indexes for table `savings_contributions`
--
ALTER TABLE `savings_contributions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contributions_goal_id` (`goal_id`),
  ADD KEY `idx_contributions_user_id` (`user_id`),
  ADD KEY `idx_contributions_date` (`contribution_date`);

--
-- Indexes for table `savings_goals`
--
ALTER TABLE `savings_goals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_savings_user_id` (`user_id`),
  ADD KEY `idx_savings_status` (`status`),
  ADD KEY `idx_savings_target_date` (`target_date`),
  ADD KEY `idx_savings_priority` (`priority`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_email` (`email`),
  ADD KEY `idx_users_username` (`username`),
  ADD KEY `idx_users_is_active` (`is_active`),
  ADD KEY `idx_users_created_at` (`created_at`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `idx_sessions_user_id` (`user_id`),
  ADD KEY `idx_sessions_token` (`session_token`),
  ADD KEY `idx_sessions_expires_at` (`expires_at`),
  ADD KEY `idx_sessions_is_active` (`is_active`);

-- --------------------------------------------------------

--
-- Structure for view `v_budget_vs_actual`
--
DROP TABLE IF EXISTS `v_budget_vs_actual`;

CREATE ALGORITHM=UNDEFINED DEFINER=`appuser`@`%` SQL SECURITY DEFINER VIEW `v_budget_vs_actual`  AS SELECT `b`.`user_id` AS `user_id`, `b`.`year` AS `year`, `b`.`month` AS `month`, coalesce(`c`.`name`,'Overall') AS `category_name`, `b`.`amount` AS `budget_amount`, coalesce(sum(`e`.`amount`),0) AS `actual_amount`, (`b`.`amount` - coalesce(sum(`e`.`amount`),0)) AS `variance`, (case when (`b`.`amount` = 0) then 0 else round(((coalesce(sum(`e`.`amount`),0) / `b`.`amount`) * 100),2) end) AS `percentage_used` FROM ((`budgets` `b` left join `categories` `c` on((`b`.`category_id` = `c`.`id`))) left join `expenses` `e` on(((`e`.`category_id` = `b`.`category_id`) and (`e`.`user_id` = `b`.`user_id`) and (year(`e`.`expense_date`) = `b`.`year`) and (month(`e`.`expense_date`) = `b`.`month`)))) WHERE (`b`.`is_active` = true) GROUP BY `b`.`user_id`, `b`.`year`, `b`.`month`, `c`.`name`, `b`.`amount` ;

-- --------------------------------------------------------

--
-- Structure for view `v_daily_spending`
--
DROP TABLE IF EXISTS `v_daily_spending`;

CREATE ALGORITHM=UNDEFINED DEFINER=`appuser`@`%` SQL SECURITY DEFINER VIEW `v_daily_spending`  AS SELECT `expenses`.`user_id` AS `user_id`, `expenses`.`expense_date` AS `expense_date`, count(0) AS `num_transactions`, sum(`expenses`.`amount`) AS `total_spent`, avg(`expenses`.`amount`) AS `avg_transaction` FROM `expenses` GROUP BY `expenses`.`user_id`, `expenses`.`expense_date` ;

-- --------------------------------------------------------

--
-- Structure for view `v_monthly_expense_summary`
--
DROP TABLE IF EXISTS `v_monthly_expense_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`appuser`@`%` SQL SECURITY DEFINER VIEW `v_monthly_expense_summary`  AS SELECT `u`.`id` AS `user_id`, `u`.`full_name` AS `full_name`, year(`e`.`expense_date`) AS `year`, month(`e`.`expense_date`) AS `month`, `c`.`name` AS `category_name`, `c`.`icon` AS `icon`, count(`e`.`id`) AS `transaction_count`, coalesce(sum(`e`.`amount`),0) AS `total_amount` FROM ((`expenses` `e` join `users` `u` on((`e`.`user_id` = `u`.`id`))) join `categories` `c` on((`e`.`category_id` = `c`.`id`))) WHERE (`c`.`type` = 'expense') GROUP BY `u`.`id`, `u`.`full_name`, year(`e`.`expense_date`), month(`e`.`expense_date`), `c`.`name`, `c`.`icon` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `budgets_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `categories_ibfk_2` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `expenses`
--
ALTER TABLE `expenses`
  ADD CONSTRAINT `expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `expenses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `recurring_expenses`
--
ALTER TABLE `recurring_expenses`
  ADD CONSTRAINT `recurring_expenses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recurring_expenses_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `savings_contributions`
--
ALTER TABLE `savings_contributions`
  ADD CONSTRAINT `savings_contributions_ibfk_1` FOREIGN KEY (`goal_id`) REFERENCES `savings_goals` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `savings_contributions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `savings_goals`
--
ALTER TABLE `savings_goals`
  ADD CONSTRAINT `savings_goals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
