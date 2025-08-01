-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 01, 2025 at 03:56 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `monitoring`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expiry` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `email`, `password_hash`, `reset_token`, `reset_expiry`, `created_at`, `updated_at`) VALUES
(1, 'aufamunadil9@gmail.com', '$2b$10$ihGIwuG4UDkFIdqhTlUjwupcRSiG9UpXq1PmMl6/PnjP8NZ2ADEc6', NULL, NULL, '2025-07-31 15:12:13', '2025-07-31 15:45:36');

-- --------------------------------------------------------

--
-- Table structure for table `authorized_cards`
--

CREATE TABLE `authorized_cards` (
  `id` int(11) NOT NULL,
  `card_id` varchar(50) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authorized_cards`
--

INSERT INTO `authorized_cards` (`id`, `card_id`, `user_name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '0581D6E14CA100', 'Admin System (E-KTP)', 1, '2025-07-19 15:00:10', '2025-07-31 18:55:55'),
(2, '730C173F', 'Sekretaris (FW)', 1, '2025-07-20 19:15:00', '2025-07-31 18:56:02'),
(3, 'B34B2803', 'Anggota Reguler (S-1)', 1, '2025-07-20 20:25:40', '2025-07-31 19:03:54'),
(4, 'CC412803', 'Unknown Member', 0, '2025-07-25 01:20:40', '2025-07-31 18:56:16'),
(5, 'CARD005', 'Baru', 0, '2025-07-31 17:45:00', '2025-07-31 19:04:06');

-- --------------------------------------------------------

--
-- Table structure for table `device_status`
--

CREATE TABLE `device_status` (
  `id` int(11) NOT NULL,
  `device_id` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'offline',
  `sensors_data` text DEFAULT NULL,
  `last_heartbeat` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `device_status`
--

INSERT INTO `device_status` (`id`, `device_id`, `status`, `sensors_data`, `last_heartbeat`, `created_at`, `updated_at`) VALUES
(1, 'MAIN_DOOR', 'online', '{\"vibrationCount\":0,\"wifi_signal\":-22,\"uptime\":3328,\"door_locked\":true,\"system_armed\":false,\"free_memory\":32700}', '2025-08-01 01:48:14', '2025-07-31 15:12:13', '2025-08-01 01:48:14');

-- --------------------------------------------------------

--
-- Table structure for table `door_commands`
--

CREATE TABLE `door_commands` (
  `id` int(11) NOT NULL,
  `device_id` varchar(50) NOT NULL DEFAULT 'MAIN_DOOR',
  `command` varchar(100) NOT NULL,
  `parameters` text DEFAULT NULL,
  `status` enum('PENDING','SENT','COMPLETED','FAILED') DEFAULT 'PENDING',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `door_commands`
--

INSERT INTO `door_commands` (`id`, `device_id`, `command`, `parameters`, `status`, `created_at`, `updated_at`) VALUES
(1, 'MAIN_DOOR', 'LOCK', '{}', 'SENT', '2025-07-31 17:45:23', '2025-07-31 18:21:30'),
(2, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 17:45:26', '2025-07-31 18:21:46'),
(3, 'MAIN_DOOR', 'RESET', '{}', 'SENT', '2025-07-31 17:45:30', '2025-07-31 18:22:07'),
(4, 'MAIN_DOOR', 'RESET', '{}', 'SENT', '2025-07-31 17:52:06', '2025-07-31 18:22:22'),
(5, 'MAIN_DOOR', 'STATUS_CHECK', '{}', 'SENT', '2025-07-31 17:52:16', '2025-07-31 18:22:36'),
(6, 'MAIN_DOOR', 'RESET', '{}', 'SENT', '2025-07-31 18:22:15', '2025-07-31 18:22:52'),
(7, 'MAIN_DOOR', 'LOCK', '{}', 'SENT', '2025-07-31 18:28:31', '2025-07-31 18:28:42'),
(8, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 18:28:35', '2025-07-31 18:28:58'),
(9, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 18:28:39', '2025-07-31 18:29:19'),
(10, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 18:28:43', '2025-07-31 18:29:41'),
(11, 'MAIN_DOOR', 'STATUS_CHECK', '{}', 'SENT', '2025-07-31 18:28:48', '2025-07-31 18:29:55'),
(12, 'MAIN_DOOR', 'STATUS_CHECK', '{}', 'SENT', '2025-07-31 18:28:50', '2025-07-31 18:30:10'),
(13, 'MAIN_DOOR', 'STATUS_CHECK', '{}', 'SENT', '2025-07-31 18:29:14', '2025-07-31 18:30:26'),
(14, 'MAIN_DOOR', 'ARM_SYSTEM', '{}', 'SENT', '2025-07-31 18:29:18', '2025-07-31 18:30:42'),
(15, 'MAIN_DOOR', 'DISARM_SYSTEM', '{}', 'SENT', '2025-07-31 18:29:21', '2025-07-31 18:30:59'),
(16, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 18:33:29', '2025-07-31 18:33:29'),
(17, 'MAIN_DOOR', 'RESET', '{}', 'SENT', '2025-07-31 18:33:35', '2025-07-31 18:33:50'),
(18, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 18:57:03', '2025-07-31 18:57:04'),
(19, 'MAIN_DOOR', 'STATUS_CHECK', '{}', 'SENT', '2025-07-31 18:57:06', '2025-07-31 18:57:14'),
(20, 'MAIN_DOOR', 'RESET', '{}', 'SENT', '2025-07-31 18:57:09', '2025-07-31 18:57:27'),
(21, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 19:01:04', '2025-07-31 19:01:06'),
(22, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 19:06:39', '2025-07-31 19:06:48'),
(23, 'MAIN_DOOR', 'STATUS_CHECK', '{}', 'SENT', '2025-07-31 19:06:58', '2025-07-31 19:07:05'),
(24, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-07-31 19:07:03', '2025-07-31 19:07:15'),
(25, 'MAIN_DOOR', 'LOCK', '{}', 'SENT', '2025-07-31 19:07:06', '2025-07-31 19:07:33'),
(26, 'MAIN_DOOR', 'LOCK', '{}', 'SENT', '2025-08-01 00:54:51', '2025-08-01 00:54:59'),
(27, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-08-01 00:54:55', '2025-08-01 00:55:12'),
(28, 'MAIN_DOOR', 'STATUS_CHECK', '{}', 'SENT', '2025-08-01 00:55:07', '2025-08-01 00:55:30'),
(29, 'MAIN_DOOR', 'STATUS_CHECK', '{}', 'SENT', '2025-08-01 01:05:50', '2025-08-01 01:05:57'),
(30, 'MAIN_DOOR', 'UNLOCK', '{}', 'SENT', '2025-08-01 01:11:13', '2025-08-01 01:11:19');

-- --------------------------------------------------------

--
-- Table structure for table `log_aktivitas`
--

CREATE TABLE `log_aktivitas` (
  `id_log` int(11) NOT NULL,
  `kartu_id` varchar(50) NOT NULL,
  `pengguna` varchar(100) NOT NULL,
  `status` enum('berhasil','gagal','pending') DEFAULT 'berhasil',
  `keterangan` varchar(255) DEFAULT 'Akses Pintu',
  `device_id` varchar(50) DEFAULT 'MAIN_DOOR',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `log_aktivitas`
--

INSERT INTO `log_aktivitas` (`id_log`, `kartu_id`, `pengguna`, `status`, `keterangan`, `device_id`, `created_at`) VALUES
(1, 'CARD001', 'Admin System', 'berhasil', 'Akses masuk berhasil', 'MAIN_DOOR', '2025-07-20 06:15:32'),
(2, 'CARD001', 'Admin System', 'berhasil', 'Akses keluar berhasil', 'MAIN_DOOR', '2025-07-20 10:20:15'),
(3, 'CARD002', 'Sekretaris', 'berhasil', 'Akses masuk berhasil', 'MAIN_DOOR', '2025-07-21 03:39:22'),
(4, 'CARD002', 'Sekretaris', 'berhasil', 'Akses keluar berhasil', 'MAIN_DOOR', '2025-07-21 04:12:40'),
(5, 'CARD003', 'Anggota Reguler', 'berhasil', 'Akses masuk berhasil', 'MAIN_DOOR', '2025-07-21 05:10:47'),
(6, 'CARD003', 'Anggota Reguler', 'berhasil', 'Akses keluar berhasil', 'MAIN_DOOR', '2025-07-21 11:04:53'),
(7, 'CARD004', 'Unknown Member', 'gagal', 'Kartu tidak diotorisasi', 'MAIN_DOOR', '2025-07-22 03:08:30'),
(8, 'CARD001', 'Admin System', 'berhasil', 'Akses masuk berhasil', 'MAIN_DOOR', '2025-07-26 08:15:40'),
(9, 'CARD001', 'Admin System', 'berhasil', 'Akses keluar berhasil', 'MAIN_DOOR', '2025-07-26 11:00:00'),
(10, 'CARD003', 'Anggota Reguler', 'gagal', 'Akses ditolak - kartu nonaktif', 'MAIN_DOOR', '2025-07-26 11:25:40'),
(11, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: LOCK', 'MAIN_DOOR', '2025-07-31 17:45:23'),
(12, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 17:45:26'),
(13, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: RESET', 'MAIN_DOOR', '2025-07-31 17:45:30'),
(14, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: RESET', 'MAIN_DOOR', '2025-07-31 17:52:06'),
(15, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 17:52:16'),
(16, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:21:25'),
(17, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: LOCK', 'MAIN_DOOR', '2025-07-31 18:21:30'),
(18, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:21:33'),
(19, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:21:37'),
(20, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:21:42'),
(21, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:21:46'),
(22, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:21:54'),
(23, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:21:59'),
(24, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:22:03'),
(25, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: RESET', 'MAIN_DOOR', '2025-07-31 18:22:07'),
(26, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: RESET', 'MAIN_DOOR', '2025-07-31 18:22:15'),
(27, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:22:18'),
(28, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: RESET', 'MAIN_DOOR', '2025-07-31 18:22:22'),
(29, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:22:32'),
(30, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:22:36'),
(31, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:22:39'),
(32, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:22:44'),
(33, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:22:48'),
(34, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: RESET', 'MAIN_DOOR', '2025-07-31 18:22:52'),
(35, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:03'),
(36, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:08'),
(37, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:12'),
(38, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:17'),
(39, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:21'),
(40, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:26'),
(41, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:30'),
(42, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:35'),
(43, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:39'),
(44, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:44'),
(45, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:49'),
(46, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:53'),
(47, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:23:58'),
(48, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:02'),
(49, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:07'),
(50, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:11'),
(51, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:16'),
(52, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:21'),
(53, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:25'),
(54, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:30'),
(55, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:35'),
(56, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:39'),
(57, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:44'),
(58, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:48'),
(59, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:53'),
(60, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:24:58'),
(61, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:02'),
(62, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:07'),
(63, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:12'),
(64, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:16'),
(65, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:20'),
(66, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:25'),
(67, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:30'),
(68, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:34'),
(69, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:39'),
(70, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:43'),
(71, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:48'),
(72, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:53'),
(73, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:25:57'),
(74, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:02'),
(75, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:06'),
(76, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:11'),
(77, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:15'),
(78, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:20'),
(79, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:24'),
(80, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:29'),
(81, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:34'),
(82, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:38'),
(83, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:47'),
(84, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:26:52'),
(85, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:02'),
(86, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:07'),
(87, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:11'),
(88, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:16'),
(89, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:20'),
(90, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:25'),
(91, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:30'),
(92, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:34'),
(93, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:39'),
(94, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:43'),
(95, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:48'),
(96, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:52'),
(97, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:27:57'),
(98, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:02'),
(99, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:06'),
(100, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:10'),
(101, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:15'),
(102, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:20'),
(103, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:24'),
(104, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:29'),
(105, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: LOCK', 'MAIN_DOOR', '2025-07-31 18:28:31'),
(106, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:33'),
(107, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:28:35'),
(108, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:38'),
(109, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:28:39'),
(110, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: LOCK', 'MAIN_DOOR', '2025-07-31 18:28:42'),
(111, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:28:43'),
(112, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:45'),
(113, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:28:48'),
(114, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:49'),
(115, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:28:50'),
(116, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:28:54'),
(117, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:28:58'),
(118, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:06'),
(119, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:11'),
(120, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:29:14'),
(121, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:15'),
(122, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: ARM_SYSTEM', 'MAIN_DOOR', '2025-07-31 18:29:18'),
(123, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:29:19'),
(124, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: DISARM_SYSTEM', 'MAIN_DOOR', '2025-07-31 18:29:21'),
(125, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:28'),
(126, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:32'),
(127, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:37'),
(128, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:29:41'),
(129, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:41'),
(130, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:46'),
(131, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:50'),
(132, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:29:55'),
(133, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:29:58'),
(134, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:02'),
(135, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:06'),
(136, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:30:10'),
(137, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:13'),
(138, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:18'),
(139, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:22'),
(140, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:30:26'),
(141, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:30'),
(142, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:34'),
(143, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:38'),
(144, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: ARM_SYSTEM', 'MAIN_DOOR', '2025-07-31 18:30:42'),
(145, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:46'),
(146, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:51'),
(147, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:30:55'),
(148, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: DISARM_SYSTEM', 'MAIN_DOOR', '2025-07-31 18:30:59'),
(149, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:02'),
(150, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:06'),
(151, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:11'),
(152, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:16'),
(153, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:20'),
(154, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:25'),
(155, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:29'),
(156, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:34'),
(157, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:38'),
(158, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:43'),
(159, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:48'),
(160, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:52'),
(161, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:31:57'),
(162, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:32:01'),
(163, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:32:57'),
(164, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:02'),
(165, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:06'),
(166, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:11'),
(167, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:15'),
(168, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:20'),
(169, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:25'),
(170, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:33:29'),
(171, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:33:29'),
(172, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: RESET', 'MAIN_DOOR', '2025-07-31 18:33:35'),
(173, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:37'),
(174, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:41'),
(175, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:33:46'),
(176, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: RESET', 'MAIN_DOOR', '2025-07-31 18:33:50'),
(177, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:00'),
(178, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:18'),
(179, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:23'),
(180, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:27'),
(181, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:32'),
(182, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:36'),
(183, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:41'),
(184, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:45'),
(185, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:50'),
(186, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:55'),
(187, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:34:59'),
(188, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:04'),
(189, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:08'),
(190, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:13'),
(191, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:18'),
(192, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:22'),
(193, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:27'),
(194, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:31'),
(195, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:36'),
(196, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:40'),
(197, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:45'),
(198, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:50'),
(199, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:54'),
(200, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:35:59'),
(201, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:03'),
(202, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:07'),
(203, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:12'),
(204, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:17'),
(205, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:21'),
(206, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:26'),
(207, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:30'),
(208, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:35'),
(209, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:40'),
(210, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:44'),
(211, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:49'),
(212, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:53'),
(213, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:36:58'),
(214, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:02'),
(215, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:07'),
(216, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:11'),
(217, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:16'),
(218, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:21'),
(219, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:25'),
(220, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:30'),
(221, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:34'),
(222, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:39'),
(223, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:43'),
(224, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:48'),
(225, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:53'),
(226, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:37:57'),
(227, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:02'),
(228, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:07'),
(229, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:11'),
(230, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:16'),
(231, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:20'),
(232, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:25'),
(233, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:29'),
(234, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:34'),
(235, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:38'),
(236, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:43'),
(237, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:47'),
(238, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:52'),
(239, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:38:57'),
(240, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:01'),
(241, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:06'),
(242, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:11'),
(243, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:15'),
(244, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:19'),
(245, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:24'),
(246, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:29'),
(247, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:33'),
(248, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:38'),
(249, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:42'),
(250, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:47'),
(251, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:52'),
(252, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:39:56'),
(253, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:01'),
(254, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:05'),
(255, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:10'),
(256, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:14'),
(257, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:19'),
(258, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:23'),
(259, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:28'),
(260, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:33'),
(261, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:37'),
(262, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:41'),
(263, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:46'),
(264, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:50'),
(265, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:40:55'),
(266, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:00'),
(267, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:04'),
(268, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:09'),
(269, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:13'),
(270, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:18'),
(271, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:22'),
(272, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:27'),
(273, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:31'),
(274, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:36'),
(275, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:41'),
(276, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:45'),
(277, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:50'),
(278, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:54'),
(279, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:41:59'),
(280, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:03'),
(281, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:08'),
(282, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:13'),
(283, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:17'),
(284, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:22'),
(285, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:26'),
(286, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:31'),
(287, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:35'),
(288, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:40'),
(289, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:44'),
(290, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:49'),
(291, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:54'),
(292, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:42:58'),
(293, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:03'),
(294, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:07'),
(295, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:12'),
(296, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:16'),
(297, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:21'),
(298, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:25'),
(299, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:30'),
(300, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:34'),
(301, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:39'),
(302, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:44'),
(303, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:48'),
(304, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:53'),
(305, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:43:58'),
(306, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:02'),
(307, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:06'),
(308, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:11'),
(309, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:16'),
(310, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:20'),
(311, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:25'),
(312, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:29'),
(313, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:34'),
(314, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:38'),
(315, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:43'),
(316, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:47'),
(317, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:52'),
(318, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:44:56'),
(319, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:01'),
(320, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:05'),
(321, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:10'),
(322, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:14'),
(323, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:19'),
(324, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:24'),
(325, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:28'),
(326, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:33'),
(327, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:37'),
(328, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:42'),
(329, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:47'),
(330, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:51'),
(331, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:45:56'),
(332, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:00'),
(333, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:05'),
(334, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:09'),
(335, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:14'),
(336, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:18'),
(337, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:29'),
(338, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:37'),
(339, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:42'),
(340, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:46'),
(341, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:50'),
(342, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:46:55'),
(343, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:00'),
(344, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:04'),
(345, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:09'),
(346, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:14'),
(347, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:18'),
(348, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:23'),
(349, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:27'),
(350, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:32'),
(351, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:37'),
(352, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:41'),
(353, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:46'),
(354, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:50'),
(355, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:55'),
(356, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:47:59'),
(357, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:04'),
(358, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:09'),
(359, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:13'),
(360, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:18'),
(361, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:22'),
(362, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:27'),
(363, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:31'),
(364, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:36'),
(365, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:40'),
(366, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:45'),
(367, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:49'),
(368, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:54'),
(369, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:48:58'),
(370, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:03'),
(371, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:07'),
(372, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:12'),
(373, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:17'),
(374, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:21'),
(375, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:26'),
(376, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:30'),
(377, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:35'),
(378, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:40'),
(379, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:44'),
(380, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:49'),
(381, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:54'),
(382, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:49:58'),
(383, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:03'),
(384, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:07'),
(385, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:12'),
(386, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:16'),
(387, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:21'),
(388, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:25'),
(389, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:30'),
(390, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:35'),
(391, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:39'),
(392, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:44'),
(393, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:48'),
(394, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:53'),
(395, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:50:57'),
(396, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:51:02'),
(397, '18000000', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:51:06'),
(398, 'B34B2803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:51:49'),
(399, 'B34B2803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:52:01'),
(400, '730C173F', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:52:08'),
(401, '0581D6E14CA100', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:52:42'),
(402, 'B34B2803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:52:54'),
(403, '0581D6E14CA100', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:53:03'),
(404, '0581D6E14CA100', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:53:45'),
(405, 'CC412803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:54:01'),
(406, 'B34B2803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:54:05'),
(407, '730C173F', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:54:10'),
(408, 'CC412803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:54:15'),
(409, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:57:03'),
(410, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 18:57:04'),
(411, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:57:06'),
(412, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: RESET', 'MAIN_DOOR', '2025-07-31 18:57:09'),
(413, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 18:57:14'),
(414, '730C173F', 'Sekretaris (FW)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-07-31 18:57:22'),
(415, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: RESET', 'MAIN_DOOR', '2025-07-31 18:57:27'),
(416, '730C173F', 'Sekretaris (FW)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-07-31 18:58:00'),
(417, 'B34B2803', 'Anggota Reguler (S-1)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-07-31 18:58:08'),
(418, '0581D6E14CA100', 'Admin System (E-KTP)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-07-31 18:58:17'),
(419, '0581D6E14CA100', 'Admin System (E-KTP)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-07-31 18:58:27'),
(420, 'CC412803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 18:58:37'),
(421, '0581D6E14CA100', 'Admin System (E-KTP)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-07-31 18:58:45'),
(422, '0581D6E14CA100', 'Admin System (E-KTP)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-07-31 18:58:55'),
(423, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 19:01:04'),
(424, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 19:01:06'),
(425, '730C173F', 'Sekretaris (FW)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-07-31 19:05:24'),
(426, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 19:06:39'),
(427, 'CC412803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-07-31 19:06:43'),
(428, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 19:06:48'),
(429, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 19:06:58'),
(430, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-07-31 19:07:03'),
(431, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: STATUS_CHECK', 'MAIN_DOOR', '2025-07-31 19:07:05'),
(432, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: LOCK', 'MAIN_DOOR', '2025-07-31 19:07:06'),
(433, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-07-31 19:07:15'),
(434, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: LOCK', 'MAIN_DOOR', '2025-07-31 19:07:33'),
(435, 'CC412803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-08-01 00:53:49'),
(436, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: LOCK', 'MAIN_DOOR', '2025-08-01 00:54:51'),
(437, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-08-01 00:54:55'),
(438, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: LOCK', 'MAIN_DOOR', '2025-08-01 00:54:59'),
(439, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: STATUS_CHECK', 'MAIN_DOOR', '2025-08-01 00:55:07'),
(440, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-08-01 00:55:12'),
(441, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: STATUS_CHECK', 'MAIN_DOOR', '2025-08-01 00:55:30'),
(442, 'B34B2803', 'Anggota Reguler (S-1)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-08-01 01:02:14'),
(443, '0581D6E14CA100', 'Admin System (E-KTP)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-08-01 01:02:29'),
(444, '730C173F', 'Sekretaris (FW)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-08-01 01:02:51'),
(445, '730C173F', 'Sekretaris (FW)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-08-01 01:03:03'),
(446, 'CC412803', 'Unknown', 'gagal', 'Kartu tidak terdaftar', 'MAIN_DOOR', '2025-08-01 01:04:26'),
(447, '0581D6E14CA100', 'Admin System (E-KTP)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-08-01 01:04:59'),
(448, '0581D6E14CA100', 'Admin System (E-KTP)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-08-01 01:05:07'),
(449, 'B34B2803', 'Anggota Reguler (S-1)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-08-01 01:05:32'),
(450, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: STATUS_CHECK', 'MAIN_DOOR', '2025-08-01 01:05:50'),
(451, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: STATUS_CHECK', 'MAIN_DOOR', '2025-08-01 01:05:57'),
(452, 'REMOTE_CONTROL', 'Web Admin', 'pending', 'Remote command sent: UNLOCK', 'MAIN_DOOR', '2025-08-01 01:11:13'),
(453, 'REMOTE_COMMAND', 'Remote Control', 'berhasil', 'Remote command executed: UNLOCK', 'MAIN_DOOR', '2025-08-01 01:11:19'),
(454, '0581D6E14CA100', 'Admin System (E-KTP)', 'berhasil', 'Akses RFID berhasil', 'MAIN_DOOR', '2025-08-01 01:11:29');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `authorized_cards`
--
ALTER TABLE `authorized_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `card_id` (`card_id`),
  ADD KEY `idx_authorized_cards_card_id` (`card_id`);

--
-- Indexes for table `device_status`
--
ALTER TABLE `device_status`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `device_id` (`device_id`),
  ADD KEY `idx_device_status_device_id` (`device_id`);

--
-- Indexes for table `door_commands`
--
ALTER TABLE `door_commands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_door_commands_device_status` (`device_id`,`status`);

--
-- Indexes for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  ADD PRIMARY KEY (`id_log`),
  ADD KEY `idx_log_aktivitas_created_at` (`created_at`),
  ADD KEY `idx_log_aktivitas_kartu_id` (`kartu_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `authorized_cards`
--
ALTER TABLE `authorized_cards`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `device_status`
--
ALTER TABLE `device_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=246;

--
-- AUTO_INCREMENT for table `door_commands`
--
ALTER TABLE `door_commands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `log_aktivitas`
--
ALTER TABLE `log_aktivitas`
  MODIFY `id_log` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=455;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
