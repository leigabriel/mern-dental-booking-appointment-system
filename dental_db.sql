-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 30, 2025 at 10:38 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.16

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dental_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED NOT NULL,
  `doctor_id` int UNSIGNED NOT NULL,
  `service_id` int UNSIGNED NOT NULL,
  `appointment_date` date NOT NULL,
  `time_slot` time NOT NULL,
  `payment_method` enum('gcash','paypal','clinic') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'clinic',
  `payment_status` enum('unpaid','pending','paid','failed','refunded') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `payment_reference` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `status` enum('pending','confirmed','cancelled','declined') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `decline_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `user_id`, `doctor_id`, `service_id`, `appointment_date`, `time_slot`, `payment_method`, `payment_status`, `payment_reference`, `paid_at`, `status`, `decline_message`, `notes`, `created_at`) VALUES
(1, 3, 1, 1, '2025-11-22', '08:00:00', 'gcash', 'paid', 'src_puDhxPBLkfJgHWAUDzaUvbCq', '2025-11-22 12:58:04', 'confirmed', NULL, NULL, '2025-11-22 12:57:58'),
(2, 3, 1, 1, '2025-11-22', '09:00:00', 'gcash', 'paid', 'src_Pcy8MUJwHpP6GZiY9vCqESjM', '2025-11-22 13:26:49', 'confirmed', NULL, NULL, '2025-11-22 13:26:43'),
(3, 5, 1, 1, '2025-11-24', '08:00:00', 'gcash', 'paid', 'src_dF7tzy1ey5dCbBA6JFEMPgGo', '2025-11-24 01:49:46', 'declined', 'hh', NULL, '2025-11-24 01:49:30'),
(5, 5, 2, 1, '2025-11-30', '08:00:00', 'clinic', 'paid', NULL, '2025-11-30 04:25:14', 'confirmed', NULL, NULL, '2025-11-30 04:25:04'),
(6, 5, 2, 1, '2025-11-30', '09:00:00', 'clinic', 'unpaid', NULL, NULL, 'cancelled', NULL, NULL, '2025-11-30 04:27:13'),
(7, 5, 2, 1, '2025-11-30', '10:00:00', 'gcash', 'refunded', 'refund-7', NULL, 'cancelled', NULL, NULL, '2025-11-30 04:27:26'),
(8, 5, 1, 1, '2025-11-30', '14:00:00', 'clinic', 'paid', NULL, '2025-11-30 08:06:50', 'confirmed', NULL, NULL, '2025-11-30 04:46:55'),
(9, 5, 1, 1, '2025-11-30', '15:00:00', 'clinic', 'unpaid', NULL, NULL, 'declined', 'zz', NULL, '2025-11-30 04:47:48'),
(10, 5, 2, 3, '2025-11-30', '15:00:00', 'gcash', 'refunded', 'refund-10', NULL, 'declined', 'kk', NULL, '2025-11-30 04:49:22'),
(11, 5, 1, 1, '2025-12-01', '17:00:00', 'clinic', 'unpaid', NULL, NULL, 'declined', 'zz', NULL, '2025-11-30 04:53:29'),
(12, 8, 1, 1, '2025-11-30', '08:00:00', 'clinic', 'paid', NULL, '2025-11-30 08:03:46', 'declined', 'a', NULL, '2025-11-30 08:01:19');

-- --------------------------------------------------------

--
-- Table structure for table `doctors`
--

CREATE TABLE `doctors` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int UNSIGNED DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `specialty` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_available` tinyint(1) NOT NULL DEFAULT '1' COMMENT 'Doctor availability status: 1=available, 0=unavailable'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `doctors`
--

INSERT INTO `doctors` (`id`, `user_id`, `name`, `specialty`, `email`, `created_at`, `is_available`) VALUES
(1, 2, 'Nitchel Acosta', 'General Dentist', 'nitchel@dentalcare.com', '2025-11-22 12:34:43', 1),
(2, 6, 'Mylene Arellano', 'Dentist', 'mylene@dentalcare.com', '2025-11-26 00:31:06', 1);

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `duration_mins` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`id`, `name`, `price`, `duration_mins`, `created_at`) VALUES
(1, 'Dental Cleaning and Prophylaxis', 1500.00, 30, '2025-11-22 12:45:28'),
(2, 'Tooth Extraction (Simple)', 2500.00, 30, '2025-11-22 12:45:28'),
(3, 'Tooth Extraction (Surgical)', 5000.00, 60, '2025-11-22 12:45:28'),
(4, 'Dental Filling (Composite)', 2000.00, 45, '2025-11-22 12:45:28'),
(5, 'Root Canal Treatment', 8000.00, 90, '2025-11-22 12:45:28'),
(6, 'Teeth Whitening', 6000.00, 60, '2025-11-22 12:45:28'),
(7, 'Dental Crown Installation', 12000.00, 120, '2025-11-22 12:45:28'),
(8, 'Braces Installation (Metal)', 35000.00, 90, '2025-11-22 12:45:28'),
(9, 'Dental Implant', 45000.00, 120, '2025-11-22 12:45:28'),
(10, 'Oral Surgery Consultation', 1000.00, 30, '2025-11-22 12:45:28');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int UNSIGNED NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` datetime DEFAULT NULL,
  `verification_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','staff','user','doctor') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `is_suspended` tinyint(1) DEFAULT '0',
  `suspended_at` timestamp NULL DEFAULT NULL,
  `suspension_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `full_name`, `email`, `email_verified_at`, `verification_token`, `password`, `google_id`, `role`, `is_suspended`, `suspended_at`, `suspension_reason`, `created_at`) VALUES
(1, 'admin', 'Administrator', 'leigabrieldemo2005@gmail.com', '2025-11-22 20:34:43', NULL, '$2a$10$vYp0n9YtLFT6UyHpmo08sODDeWnPXDugsHc5PZE46.eSUdpmrFaEy', NULL, 'admin', 0, NULL, NULL, '2025-11-22 12:34:43'),
(2, 'nitchel', 'Nitchel Acosta', 'nitchel@dentalcare.com', '2025-11-22 20:34:43', NULL, '$2a$10$1bEX4CYaLBaVRj2QBkemDOZ9sIGGo5H1VRAEL8aMFRC2nR2Lr6nmq', NULL, 'doctor', 0, NULL, NULL, '2025-11-22 12:34:43'),
(3, 'myjudith', 'Judith Hernandez', 'judith@gmail.com', '2025-11-22 20:44:46', NULL, '$2a$10$.qxlHhHjti0hsf/UohEnoOuWYhz0S2tVtthQDmzfpl6PBvS7fYpDm', NULL, 'user', 0, NULL, NULL, '2025-11-22 12:44:35'),
(4, 'vina', 'Vina Fernandez', 'vina@gmail.com', '2025-11-22 20:46:18', NULL, '$2a$10$Hp5tdfRVyZXjApJRC0bqaeNo/v0BB9xh3elc9ASQQdNMSsFm5Fjmu', NULL, 'staff', 0, NULL, NULL, '2025-11-22 12:46:18'),
(5, 'dan', 'Dan Kirvy Manongsong', 'dan@gmail.com', '2025-11-24 09:48:51', NULL, '$2a$10$Q9aFC7nNh0yTmPh9x9Xuc..rHsEaPXRhbcAPLMBQY54oCOcc/Emcm', NULL, 'user', 0, NULL, NULL, '2025-11-24 01:48:43'),
(6, 'mylene', 'Mylene Arellano', 'mylene@dentalcare.com', '2025-11-26 08:31:06', NULL, '$2a$10$wFvF/yJW9PBwFkZTeZD6/.KuGQ3dtLnujNamaKq7s7T.1cQ2lWlB.', NULL, 'doctor', 0, NULL, NULL, '2025-11-26 00:31:06'),
(8, 'malibiranleigabriel715', 'Lei Gabriel Malibiran', 'malibiranleigabriel@gmail.com', '2025-11-30 16:01:04', NULL, NULL, '118303102941629974519', 'user', 0, NULL, NULL, '2025-11-30 08:01:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `appointments`
--
ALTER TABLE `appointments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_booking` (`doctor_id`,`appointment_date`,`time_slot`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_doctor_id` (`doctor_id`),
  ADD KEY `idx_service_id` (`service_id`);

--
-- Indexes for table `doctors`
--
ALTER TABLE `doctors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_available` (`is_available`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_name` (`name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`),
  ADD KEY `idx_role` (`role`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `appointments`
--
ALTER TABLE `appointments`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `doctors`
--
ALTER TABLE `doctors`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `appointments`
--
ALTER TABLE `appointments`
  ADD CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE RESTRICT,
  ADD CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT;

--
-- Constraints for table `doctors`
--
ALTER TABLE `doctors`
  ADD CONSTRAINT `doctors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
