-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 15, 2026 at 04:32 PM
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
-- Database: `dar_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `achievement_date` date NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `achievement_type` enum('completion','award','milestone') DEFAULT 'milestone',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendances`
--

CREATE TABLE `attendances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attendance_date` date NOT NULL,
  `student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('present','absent') NOT NULL,
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `attendances`
--

INSERT INTO `attendances` (`id`, `attendance_date`, `student_id`, `teacher_id`, `status`, `check_in_time`, `check_out_time`, `notes`) VALUES
(1, '2026-01-15', 104, NULL, 'present', NULL, NULL, NULL),
(2, '2026-01-15', 106, NULL, 'present', NULL, NULL, NULL),
(3, '2026-01-15', 107, NULL, 'present', NULL, NULL, NULL),
(4, '2026-01-15', 108, NULL, 'present', NULL, NULL, NULL),
(5, '2026-01-15', 109, NULL, 'present', NULL, NULL, NULL),
(6, '2026-01-15', 101, NULL, 'present', NULL, NULL, NULL),
(7, '2026-01-15', 105, NULL, 'present', NULL, NULL, NULL),
(8, '2026-01-15', 102, NULL, 'present', NULL, NULL, NULL),
(9, '2026-01-15', 100, NULL, 'absent', NULL, NULL, NULL),
(10, '2026-01-15', 103, NULL, 'present', NULL, NULL, NULL),
(11, '2026-01-15', 110, NULL, 'present', NULL, NULL, NULL),
(12, '2026-01-15', 115, NULL, 'present', NULL, NULL, NULL),
(13, '2026-01-15', 116, NULL, 'present', NULL, NULL, NULL),
(14, '2026-01-15', 118, NULL, 'present', NULL, NULL, NULL),
(15, '2026-01-15', 111, NULL, 'present', NULL, NULL, NULL),
(16, '2026-01-15', 117, NULL, 'absent', NULL, NULL, NULL),
(17, '2026-01-15', 114, NULL, 'present', NULL, NULL, NULL),
(18, '2026-01-15', 112, NULL, 'present', NULL, NULL, NULL),
(19, '2026-01-15', 119, NULL, 'present', NULL, NULL, NULL),
(20, '2026-01-15', 113, NULL, 'present', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `halaqat`
--

CREATE TABLE `halaqat` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(120) NOT NULL,
  `start_date` date DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `halaqat`
--

INSERT INTO `halaqat` (`id`, `name`, `start_date`, `teacher_id`, `created_at`, `updated_at`) VALUES
(1, 'حلقة ابو بكر الصديق', NULL, 1, '2026-01-14 19:05:06', '2026-01-14 19:05:06'),
(10, 'حلقة الصديق', '2024-09-01', 10, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(11, 'حلقة الفاروق', '2024-09-01', 11, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(12, 'حلقة ذي النورين', '2024-09-01', 12, '2026-01-15 14:32:38', '2026-01-15 14:32:38');

-- --------------------------------------------------------

--
-- Table structure for table `halaqa_enrollments`
--

CREATE TABLE `halaqa_enrollments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `halaqa_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `enroll_date` date NOT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `halaqa_enrollments`
--

INSERT INTO `halaqa_enrollments` (`id`, `halaqa_id`, `student_id`, `enroll_date`, `is_active`) VALUES
(1, 1, 1, '2026-01-14', 1),
(2, 10, 100, '2024-09-01', 1),
(3, 10, 101, '2024-09-01', 1),
(4, 10, 102, '2024-09-01', 1),
(5, 10, 103, '2024-09-01', 1),
(6, 10, 104, '2024-09-01', 1),
(7, 10, 105, '2024-09-01', 1),
(8, 10, 106, '2024-09-01', 1),
(9, 10, 107, '2024-09-01', 1),
(10, 10, 108, '2024-09-01', 1),
(11, 10, 109, '2024-09-01', 1),
(12, 11, 110, '2024-09-01', 1),
(13, 11, 111, '2024-09-01', 1),
(14, 11, 112, '2024-09-01', 1),
(15, 11, 113, '2024-09-01', 1),
(16, 11, 114, '2024-09-01', 1),
(17, 11, 115, '2024-09-01', 1),
(18, 11, 116, '2024-09-01', 1),
(19, 11, 117, '2024-09-01', 1),
(20, 11, 118, '2024-09-01', 1),
(21, 11, 119, '2024-09-01', 1),
(22, 12, 120, '2024-09-01', 1),
(23, 12, 121, '2024-09-01', 1),
(24, 12, 122, '2024-09-01', 1),
(25, 12, 123, '2024-09-01', 1),
(26, 12, 124, '2024-09-01', 1),
(27, 12, 125, '2024-09-01', 1),
(28, 12, 126, '2024-09-01', 1),
(29, 12, 127, '2024-09-01', 1),
(30, 12, 128, '2024-09-01', 1),
(31, 12, 129, '2024-09-01', 1);

-- --------------------------------------------------------

--
-- Table structure for table `halaqa_schedules`
--

CREATE TABLE `halaqa_schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `halaqa_id` bigint(20) UNSIGNED NOT NULL,
  `day_of_week` tinyint(3) UNSIGNED NOT NULL COMMENT '0=الأحد, 1=الاثنين, 2=الثلاثاء, 3=الأربعاء, 4=الخميس, 5=الجمعة, 6=السبت',
  `start_time` time NOT NULL,
  `end_time` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `memorization`
--

CREATE TABLE `memorization` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `month` tinyint(3) UNSIGNED NOT NULL,
  `year` smallint(5) UNSIGNED NOT NULL,
  `start_surah_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `start_ayah` smallint(5) UNSIGNED DEFAULT NULL,
  `end_surah_id` tinyint(3) UNSIGNED DEFAULT NULL,
  `end_ayah` smallint(5) UNSIGNED DEFAULT NULL,
  `type` enum('memo', 'revision') DEFAULT 'memo',
  `quality_rating` tinyint(3) UNSIGNED DEFAULT 5 COMMENT 'من 1 إلى 5',
  `reviewed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`) VALUES
(1, 'admin', 'مدير النظام - صلاحيات كاملة', '2026-01-14 18:11:28'),
(2, 'teacher', 'معلم - متابعة الحلقة والحضور والحفظ', '2026-01-14 18:11:28'),
(3, 'supervisor', 'مشرف - عرض التقارير والإحصائيات', '2026-01-14 18:11:28');

-- --------------------------------------------------------

--
-- Table structure for table `staff_attendances`
--

CREATE TABLE `staff_attendances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `attendance_date` date NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('present','absent','late','excused','sick_leave','vacation') NOT NULL DEFAULT 'present',
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `recorded_by` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'المستخدم الذي سجل الحضور',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff_attendances`
--

INSERT INTO `staff_attendances` (`id`, `attendance_date`, `teacher_id`, `status`, `check_in_time`, `check_out_time`, `notes`, `recorded_by`, `created_at`, `updated_at`) VALUES
(1, '2026-01-15', 1, 'absent', NULL, NULL, NULL, 4, '2026-01-15 15:25:47', '2026-01-15 15:25:47'),
(2, '2026-01-15', 10, 'absent', NULL, NULL, NULL, 4, '2026-01-15 15:25:47', '2026-01-15 15:30:11'),
(3, '2026-01-15', 12, 'present', NULL, NULL, NULL, 4, '2026-01-15 15:25:47', '2026-01-15 15:25:47'),
(4, '2026-01-15', 11, 'present', NULL, NULL, NULL, 4, '2026-01-15 15:25:47', '2026-01-15 15:25:47'),
(5, '2026-01-15', 2, 'present', NULL, NULL, NULL, 4, '2026-01-15 15:25:47', '2026-01-15 15:25:47'),
(6, '2026-01-15', 13, 'present', NULL, NULL, NULL, 4, '2026-01-15 15:25:47', '2026-01-15 15:25:47');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `identification_number` varchar(50) DEFAULT NULL,
  `registration_date` date NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `gender` enum('male','female') DEFAULT 'male',
  `birth_date` date DEFAULT NULL,
  `birth_place` varchar(120) DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `address` text DEFAULT NULL,
  `academic_level` varchar(100) DEFAULT NULL,
  `hifz_amount` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `photo_url` varchar(255) DEFAULT NULL,
  `guardian_name` varchar(120) DEFAULT NULL,
  `guardian_relationship` varchar(50) DEFAULT NULL,
  `guardian_phone` varchar(20) DEFAULT NULL,
  `guardian_job` varchar(100) DEFAULT NULL,
  `recommender_name_1` varchar(120) DEFAULT NULL,
  `recommender_job_1` varchar(100) DEFAULT NULL,
  `recommender_name_2` varchar(120) DEFAULT NULL,
  `recommender_job_2` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `registration_date`, `full_name`, `birth_date`, `birth_place`, `permanent_address`, `academic_level`, `hifz_amount`, `phone`, `photo_url`, `guardian_name`, `guardian_relationship`, `guardian_phone`, `guardian_job`, `recommender_name_1`, `recommender_job_1`, `recommender_name_2`, `recommender_job_2`, `created_at`, `updated_at`) VALUES
(1, '2026-01-14', 'صالح علي صالح سعد', '2010-01-14', NULL, NULL, NULL, NULL, '7775545556', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-14 19:03:14', '2026-01-14 19:03:14'),
(100, '2024-09-01', 'محمد بن أحمد بن علي', '2010-05-15', NULL, NULL, 'ابتدائي', NULL, '7771001001', NULL, 'أحمد بن علي', 'والد', '7771001000', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(101, '2024-09-01', 'عبدالله بن محمد بن صالح', '2010-06-20', NULL, NULL, 'ابتدائي', NULL, '7771001002', NULL, 'محمد بن صالح', 'والد', '7771001001', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(102, '2024-09-01', 'عمر بن خالد بن إبراهيم', '2010-07-10', NULL, NULL, 'ابتدائي', NULL, '7771001003', NULL, 'خالد بن إبراهيم', 'والد', '7771001002', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(103, '2024-09-01', 'يوسف بن عبدالرحمن بن حسن', '2010-08-05', NULL, NULL, 'ابتدائي', NULL, '7771001004', NULL, 'عبدالرحمن بن حسن', 'والد', '7771001003', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(104, '2024-09-01', 'إبراهيم بن سعد بن ناصر', '2010-09-12', NULL, NULL, 'ابتدائي', NULL, '7771001005', NULL, 'سعد بن ناصر', 'والد', '7771001004', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(105, '2024-09-01', 'علي بن فهد بن ماجد', '2010-10-18', NULL, NULL, 'ابتدائي', NULL, '7771001006', NULL, 'فهد بن ماجد', 'والد', '7771001005', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(106, '2024-09-01', 'حسن بن سلمان بن راشد', '2010-11-25', NULL, NULL, 'ابتدائي', NULL, '7771001007', NULL, 'سلمان بن راشد', 'والد', '7771001006', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(107, '2024-09-01', 'خالد بن وليد بن حمد', '2010-12-30', NULL, NULL, 'ابتدائي', NULL, '7771001008', NULL, 'وليد بن حمد', 'والد', '7771001007', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(108, '2024-09-01', 'سعد بن نايف بن سالم', '2011-01-08', NULL, NULL, 'ابتدائي', NULL, '7771001009', NULL, 'نايف بن سالم', 'والد', '7771001008', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(109, '2024-09-01', 'عبدالرحمن بن طارق بن يحيى', '2011-02-14', NULL, NULL, 'ابتدائي', NULL, '7771001010', NULL, 'طارق بن يحيى', 'والد', '7771001009', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(110, '2024-09-01', 'أحمد بن حمد بن عثمان', '2010-03-20', NULL, NULL, 'ابتدائي', NULL, '7772002001', NULL, 'حمد بن عثمان', 'والد', '7772002000', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(111, '2024-09-01', 'صالح بن ناصر بن عبدالله', '2010-04-15', NULL, NULL, 'ابتدائي', NULL, '7772002002', NULL, 'ناصر بن عبدالله', 'والد', '7772002001', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(112, '2024-09-01', 'ماجد بن راشد بن سعيد', '2010-05-22', NULL, NULL, 'ابتدائي', NULL, '7772002003', NULL, 'راشد بن سعيد', 'والد', '7772002002', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(113, '2024-09-01', 'نواف بن فهد بن مبارك', '2010-06-18', NULL, NULL, 'ابتدائي', NULL, '7772002004', NULL, 'فهد بن مبارك', 'والد', '7772002003', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(114, '2024-09-01', 'فيصل بن سعد بن خالد', '2010-07-25', NULL, NULL, 'ابتدائي', NULL, '7772002005', NULL, 'سعد بن خالد', 'والد', '7772002004', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(115, '2024-09-01', 'بندر بن وليد بن حمدان', '2010-08-30', NULL, NULL, 'ابتدائي', NULL, '7772002006', NULL, 'وليد بن حمدان', 'والد', '7772002005', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(116, '2024-09-01', 'تركي بن سلمان بن راشد', '2010-09-10', NULL, NULL, 'ابتدائي', NULL, '7772002007', NULL, 'سلمان بن راشد', 'والد', '7772002006', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(117, '2024-09-01', 'عبدالعزيز بن طارق بن يوسف', '2010-10-15', NULL, NULL, 'ابتدائي', NULL, '7772002008', NULL, 'طارق بن يوسف', 'والد', '7772002007', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(118, '2024-09-01', 'سلمان بن نايف بن سالم', '2010-11-20', NULL, NULL, 'ابتدائي', NULL, '7772002009', NULL, 'نايف بن سالم', 'والد', '7772002008', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(119, '2024-09-01', 'مشعل بن فهد بن ماجد', '2010-12-28', NULL, NULL, 'ابتدائي', NULL, '7772002010', NULL, 'فهد بن ماجد', 'والد', '7772002009', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(120, '2024-09-01', 'عبدالله بن حمد بن عثمان', '2010-01-10', NULL, NULL, 'ابتدائي', NULL, '7773003001', NULL, 'حمد بن عثمان', 'والد', '7773003000', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(121, '2024-09-01', 'محمد بن صالح بن ناصر', '2010-02-15', NULL, NULL, 'ابتدائي', NULL, '7773003002', NULL, 'صالح بن ناصر', 'والد', '7773003001', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(122, '2024-09-01', 'خالد بن راشد بن سعيد', '2010-03-22', NULL, NULL, 'ابتدائي', NULL, '7773003003', NULL, 'راشد بن سعيد', 'والد', '7773003002', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(123, '2024-09-01', 'عمر بن فهد بن مبارك', '2010-04-18', NULL, NULL, 'ابتدائي', NULL, '7773003004', NULL, 'فهد بن مبارك', 'والد', '7773003003', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(124, '2024-09-01', 'يوسف بن سعد بن خالد', '2010-05-25', NULL, NULL, 'ابتدائي', NULL, '7773003005', NULL, 'سعد بن خالد', 'والد', '7773003004', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(125, '2024-09-01', 'إبراهيم بن وليد بن حمدان', '2010-06-30', NULL, NULL, 'ابتدائي', NULL, '7773003006', NULL, 'وليد بن حمدان', 'والد', '7773003005', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(126, '2024-09-01', 'علي بن سلمان بن راشد', '2010-07-10', NULL, NULL, 'ابتدائي', NULL, '7773003007', NULL, 'سلمان بن راشد', 'والد', '7773003006', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(127, '2024-09-01', 'حسن بن طارق بن يوسف', '2010-08-15', NULL, NULL, 'ابتدائي', NULL, '7773003008', NULL, 'طارق بن يوسف', 'والد', '7773003007', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(128, '2024-09-01', 'سعد بن نايف بن سالم', '2010-09-20', NULL, NULL, 'ابتدائي', NULL, '7773003009', NULL, 'نايف بن سالم', 'والد', '7773003008', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38'),
(129, '2024-09-01', 'عبدالرحمن بن فهد بن ماجد', '2010-10-28', NULL, NULL, 'ابتدائي', NULL, '7773003010', NULL, 'فهد بن ماجد', 'والد', '7773003009', NULL, NULL, NULL, NULL, NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38');

-- --------------------------------------------------------

--
-- Table structure for table `surahs`
--

CREATE TABLE `surahs` (
  `id` tinyint(3) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `order_no` tinyint(3) UNSIGNED NOT NULL,
  `ayah_count` smallint(5) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `surahs`
--

INSERT INTO `surahs` (`id`, `name`, `order_no`, `ayah_count`) VALUES
(1, 'الفاتحة', 1, 7),
(2, 'البقرة', 2, 286),
(3, 'آل عمران', 3, 200),
(4, 'النساء', 4, 176),
(5, 'المائدة', 5, 120),
(6, 'الأنعام', 6, 165),
(7, 'الأعراف', 7, 206),
(8, 'الأنفال', 8, 75),
(9, 'التوبة', 9, 129),
(10, 'يونس', 10, 109),
(11, 'هود', 11, 123),
(12, 'يوسف', 12, 111),
(13, 'الرعد', 13, 43),
(14, 'إبراهيم', 14, 52),
(15, 'الحجر', 15, 99),
(16, 'النحل', 16, 128),
(17, 'الإسراء', 17, 111),
(18, 'الكهف', 18, 110),
(19, 'مريم', 19, 98),
(20, 'طه', 20, 135),
(21, 'الأنبياء', 21, 112),
(22, 'الحج', 22, 78),
(23, 'المؤمنون', 23, 118),
(24, 'النور', 24, 64),
(25, 'الفرقان', 25, 77),
(26, 'الشعراء', 26, 227),
(27, 'النمل', 27, 93),
(28, 'القصص', 28, 88),
(29, 'العنكبوت', 29, 69),
(30, 'الروم', 30, 60),
(31, 'لقمان', 31, 34),
(32, 'السجدة', 32, 30),
(33, 'الأحزاب', 33, 73),
(34, 'سبأ', 34, 54),
(35, 'فاطر', 35, 45),
(36, 'يس', 36, 83),
(37, 'الصافات', 37, 182),
(38, 'ص', 38, 88),
(39, 'الزمر', 39, 75),
(40, 'غافر', 40, 85),
(41, 'فصلت', 41, 54),
(42, 'الشورى', 42, 53),
(43, 'الزخرف', 43, 89),
(44, 'الدخان', 44, 59),
(45, 'الجاثية', 45, 37),
(46, 'الأحقاف', 46, 35),
(47, 'محمد', 47, 38),
(48, 'الفتح', 48, 29),
(49, 'الحجرات', 49, 18),
(50, 'ق', 50, 45),
(51, 'الذاريات', 51, 60),
(52, 'الطور', 52, 49),
(53, 'النجم', 53, 62),
(54, 'القمر', 54, 55),
(55, 'الرحمن', 55, 78),
(56, 'الواقعة', 56, 96),
(57, 'الحديد', 57, 29),
(58, 'المجادلة', 58, 22),
(59, 'الحشر', 59, 24),
(60, 'الممتحنة', 60, 13),
(61, 'الصف', 61, 14),
(62, 'الجمعة', 62, 11),
(63, 'المنافقون', 63, 11),
(64, 'التغابن', 64, 18),
(65, 'الطلاق', 65, 12),
(66, 'التحريم', 66, 12),
(67, 'الملك', 67, 30),
(68, 'القلم', 68, 52),
(69, 'الحاقة', 69, 52),
(70, 'المعارج', 70, 44),
(71, 'نوح', 71, 28),
(72, 'الجن', 72, 28),
(73, 'المزمل', 73, 20),
(74, 'المدثر', 74, 56),
(75, 'القيامة', 75, 40),
(76, 'الإنسان', 76, 31),
(77, 'المرسلات', 77, 50),
(78, 'النبأ', 78, 40),
(79, 'النازعات', 79, 46),
(80, 'عبس', 80, 42),
(81, 'التكوير', 81, 29),
(82, 'الانفطار', 82, 19),
(83, 'المطففين', 83, 36),
(84, 'الانشقاق', 84, 25),
(85, 'البروج', 85, 22),
(86, 'الطارق', 86, 17),
(87, 'الأعلى', 87, 19),
(88, 'الغاشية', 88, 26),
(89, 'الفجر', 89, 30),
(90, 'البلد', 90, 20),
(91, 'الشمس', 91, 15),
(92, 'الليل', 92, 21),
(93, 'الضحى', 93, 11),
(94, 'الشرح', 94, 8),
(95, 'التين', 95, 8),
(96, 'العلق', 96, 19),
(97, 'القدر', 97, 5),
(98, 'البينة', 98, 8),
(99, 'الزلزلة', 99, 8),
(100, 'العاديات', 100, 11),
(101, 'القارعة', 101, 11),
(102, 'التكاثر', 102, 8),
(103, 'العصر', 103, 3),
(104, 'الهمزة', 104, 9),
(105, 'الفيل', 105, 5),
(106, 'قريش', 106, 4),
(107, 'الماعون', 107, 7),
(108, 'الكوثر', 108, 3),
(109, 'الكافرون', 109, 6),
(110, 'النصر', 110, 3),
(111, 'المسد', 111, 5),
(112, 'الإخلاص', 112, 4),
(113, 'الفلق', 113, 5),
(114, 'الناس', 114, 6);

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `birth_place` varchar(120) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `photo_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `email` varchar(150) DEFAULT NULL,
  `specialization` varchar(150) DEFAULT NULL,
  `is_mujaz` tinyint(1) DEFAULT 0,
  `current_job` varchar(150) DEFAULT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `staff_type` enum('teacher','admin','both') DEFAULT 'teacher',
  `address` text DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `full_name`, `birth_date`, `birth_place`, `phone`, `photo_url`, `created_at`, `updated_at`, `email`, `specialization`, `is_mujaz`, `current_job`, `qualification`, `staff_type`, `address`, `is_active`) VALUES
(1, 'ابراهيم الزبير', NULL, NULL, '777745555', NULL, '2026-01-14 19:04:12', '2026-01-14 19:04:12', NULL, NULL, 0, NULL, NULL, 'teacher', NULL, 1),
(2, 'محمد عبدالله', NULL, NULL, '777545454', NULL, '2026-01-14 19:31:10', '2026-01-14 19:31:10', 'ss@ss.com', 'علوم قران كريم ', 1, 'معلم حلقة ', 'بكالوريس', 'teacher', 'مارب', 1),
(10, 'الشيخ أحمد بن محمد', NULL, NULL, '7771111111', NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38', NULL, 'علوم القرآن الكريم', 1, NULL, 'إجازة في القراءات العشر', 'teacher', NULL, 1),
(11, 'الشيخ عمر بن عبدالله', NULL, NULL, '7772222222', NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38', NULL, 'علوم القرآن الكريم', 1, NULL, 'إجازة في القراءات السبع', 'teacher', NULL, 1),
(12, 'الشيخ خالد بن إبراهيم', NULL, NULL, '7773333333', NULL, '2026-01-15 14:32:38', '2026-01-15 14:32:38', NULL, 'علوم القرآن الكريم', 1, NULL, 'إجازة في القراءات العشر', 'teacher', NULL, 1),
(13, 'ناجي', NULL, NULL, '+967 777 000 000', NULL, '2026-01-15 15:13:41', '2026-01-15 15:13:41', 'admin@tihamah.com', NULL, 1, 'صندوق', NULL, 'admin', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `role_id` tinyint(3) UNSIGNED DEFAULT 1,
  `teacher_id` bigint(20) UNSIGNED DEFAULT NULL COMMENT 'ربط حساب المعلم إذا كان الدور teacher',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `full_name`, `email`, `role_id`, `teacher_id`, `is_active`, `created_at`, `updated_at`) VALUES
(3, 'aaa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'المدير العام', 'admin1@daralbrhaan.com', 1, NULL, 1, '2026-01-14 18:47:15', '2026-01-14 18:47:15'),
(4, 'admin', '$2a$10$IuD1bylKRBbsFR8lVTbknuIbEySG/GnzHs8fYLFG0rOiGO4pA8kbq', 'المدير العام', 'admin@daralbrhaan.com', 1, NULL, 1, '2026-01-14 19:01:14', '2026-01-14 19:01:14');

-- --------------------------------------------------------

--
-- Table structure for table `violations`
--

CREATE TABLE `violations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `violation_date` date NOT NULL,
  `description` varchar(255) NOT NULL,
  `action_taken` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_achievement_student` (`student_id`);

--
-- Indexes for table `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_attn_teacher` (`teacher_id`),
  ADD KEY `idx_attendance_date` (`attendance_date`),
  ADD KEY `idx_student_date` (`student_id`,`attendance_date`);

--
-- Indexes for table `halaqat`
--
ALTER TABLE `halaqat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_halaqa_teacher` (`teacher_id`);

--
-- Indexes for table `halaqa_enrollments`
--
ALTER TABLE `halaqa_enrollments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_enrollment_student` (`student_id`),
  ADD KEY `idx_enrollment_halaqa` (`halaqa_id`);

--
-- Indexes for table `halaqa_schedules`
--
ALTER TABLE `halaqa_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_halaqa_schedule` (`halaqa_id`,`day_of_week`);

--
-- Indexes for table `memorization`
--
ALTER TABLE `memorization`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_memo_start_surah` (`start_surah_id`),
  ADD KEY `fk_memo_end_surah` (`end_surah_id`),
  ADD KEY `fk_memo_reviewer` (`reviewed_by`),
  ADD KEY `idx_memorization_student_date` (`student_id`,`year`,`month`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `staff_attendances`
--
ALTER TABLE `staff_attendances`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_teacher_date` (`teacher_id`,`attendance_date`),
  ADD KEY `idx_staff_attendance_date` (`attendance_date`),
  ADD KEY `idx_staff_teacher_date` (`teacher_id`,`attendance_date`),
  ADD KEY `fk_staff_attn_teacher` (`teacher_id`),
  ADD KEY `fk_staff_attn_recorder` (`recorded_by`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_student_name` (`full_name`),
  ADD KEY `idx_registration_date` (`registration_date`);

--
-- Indexes for table `surahs`
--
ALTER TABLE `surahs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_surah_order` (`order_no`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_teacher_name` (`full_name`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_user_role` (`role_id`),
  ADD KEY `fk_user_teacher` (`teacher_id`),
  ADD KEY `idx_user_username` (`username`),
  ADD KEY `idx_user_email` (`email`);

--
-- Indexes for table `violations`
--
ALTER TABLE `violations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_violation_student` (`student_id`),
  ADD KEY `idx_violation_date` (`violation_date`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `halaqat`
--
ALTER TABLE `halaqat`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `halaqa_enrollments`
--
ALTER TABLE `halaqa_enrollments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `halaqa_schedules`
--
ALTER TABLE `halaqa_schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `memorization`
--
ALTER TABLE `memorization`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` tinyint(3) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `staff_attendances`
--
ALTER TABLE `staff_attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=130;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `violations`
--
ALTER TABLE `violations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `fk_achievement_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `fk_attn_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_attn_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `halaqat`
--
ALTER TABLE `halaqat`
  ADD CONSTRAINT `fk_halaqa_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `halaqa_enrollments`
--
ALTER TABLE `halaqa_enrollments`
  ADD CONSTRAINT `fk_enroll_halaqa` FOREIGN KEY (`halaqa_id`) REFERENCES `halaqat` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_enroll_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `halaqa_schedules`
--
ALTER TABLE `halaqa_schedules`
  ADD CONSTRAINT `fk_schedule_halaqa` FOREIGN KEY (`halaqa_id`) REFERENCES `halaqat` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `memorization`
--
ALTER TABLE `memorization`
  ADD CONSTRAINT `fk_memo_end_surah` FOREIGN KEY (`end_surah_id`) REFERENCES `surahs` (`id`),
  ADD CONSTRAINT `fk_memo_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_memo_start_surah` FOREIGN KEY (`start_surah_id`) REFERENCES `surahs` (`id`),
  ADD CONSTRAINT `fk_memo_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_attendances`
--
ALTER TABLE `staff_attendances`
  ADD CONSTRAINT `fk_staff_attn_recorder` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_staff_attn_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  ADD CONSTRAINT `fk_user_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `violations`
--
ALTER TABLE `violations`
  ADD CONSTRAINT `fk_viol_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
