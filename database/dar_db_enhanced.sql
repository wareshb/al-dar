-- =========================================================
-- قاعدة بيانات نظام دار البرهان لتعليم القرآن الكريم (محسّنة)
-- =========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. إنشاء قاعدة البيانات
CREATE DATABASE IF NOT EXISTS `dar_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `dar_db`;

-- ---------------------------------------------------------
-- 2. جدول الأدوار (roles)
-- ---------------------------------------------------------
CREATE TABLE `roles` (
  `id` TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- إدراج الأدوار الأساسية
INSERT INTO `roles` (`name`, `description`) VALUES
('admin', 'مدير النظام - صلاحيات كاملة'),
('teacher', 'معلم - متابعة الحلقة والحضور والحفظ'),
('supervisor', 'مشرف - عرض التقارير والإحصائيات');

-- ---------------------------------------------------------
-- 3. جدول المعلمين (teachers)
-- ---------------------------------------------------------
CREATE TABLE `teachers` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `full_name` VARCHAR(150) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `birth_place` VARCHAR(120) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `photo_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_teacher_name` (`full_name`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 4. جدول الطلاب (students)
-- ---------------------------------------------------------
CREATE TABLE `students` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `registration_date` DATE NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `birth_date` DATE DEFAULT NULL,
  `birth_place` VARCHAR(120) DEFAULT NULL,
  `permanent_address` TEXT DEFAULT NULL,
  `academic_level` VARCHAR(100) DEFAULT NULL,
  `hifz_amount` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `photo_url` VARCHAR(255) DEFAULT NULL,
  `guardian_name` VARCHAR(120) DEFAULT NULL,
  `guardian_relationship` VARCHAR(50) DEFAULT NULL,
  `guardian_phone` VARCHAR(20) DEFAULT NULL,
  `guardian_job` VARCHAR(100) DEFAULT NULL,
  `recommender_name_1` VARCHAR(120) DEFAULT NULL,
  `recommender_job_1` VARCHAR(100) DEFAULT NULL,
  `recommender_name_2` VARCHAR(120) DEFAULT NULL,
  `recommender_job_2` VARCHAR(100) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_student_name` (`full_name`),
  INDEX `idx_registration_date` (`registration_date`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 5. جدول الحلقات (halaqat)
-- ---------------------------------------------------------
CREATE TABLE `halaqat` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(120) NOT NULL,
  `start_date` DATE DEFAULT NULL,
  `teacher_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_halaqa_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  INDEX `idx_halaqa_teacher` (`teacher_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 6. جدول جداول الحلقات (halaqa_schedules)
-- ---------------------------------------------------------
CREATE TABLE `halaqa_schedules` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `halaqa_id` BIGINT UNSIGNED NOT NULL,
  `day_of_week` TINYINT UNSIGNED NOT NULL COMMENT '0=الأحد, 1=الاثنين, 2=الثلاثاء, 3=الأربعاء, 4=الخميس, 5=الجمعة, 6=السبت',
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  CONSTRAINT `fk_schedule_halaqa` FOREIGN KEY (`halaqa_id`) REFERENCES `halaqat` (`id`) ON DELETE CASCADE,
  INDEX `idx_halaqa_schedule` (`halaqa_id`, `day_of_week`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 7. جدول السور (surahs)
-- ---------------------------------------------------------
CREATE TABLE `surahs` (
  `id` TINYINT UNSIGNED PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `order_no` TINYINT UNSIGNED NOT NULL,
  `ayah_count` SMALLINT UNSIGNED NOT NULL,
  INDEX `idx_surah_order` (`order_no`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 8. جدول الانتساب (halaqa_enrollments)
-- ---------------------------------------------------------
CREATE TABLE `halaqa_enrollments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `halaqa_id` BIGINT UNSIGNED NOT NULL,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `enroll_date` DATE NOT NULL,
  `is_active` BOOLEAN DEFAULT TRUE,
  CONSTRAINT `fk_enroll_halaqa` FOREIGN KEY (`halaqa_id`) REFERENCES `halaqat` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_enroll_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  INDEX `idx_enrollment_student` (`student_id`),
  INDEX `idx_enrollment_halaqa` (`halaqa_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 9. جدول الحفظ الشهري (memorization)
-- ---------------------------------------------------------
CREATE TABLE `memorization` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `month` TINYINT UNSIGNED NOT NULL,
  `year` SMALLINT UNSIGNED NOT NULL,
  `start_surah_id` TINYINT UNSIGNED DEFAULT NULL,
  `start_ayah` SMALLINT UNSIGNED DEFAULT NULL,
  `end_surah_id` TINYINT UNSIGNED DEFAULT NULL,
  `end_ayah` SMALLINT UNSIGNED DEFAULT NULL,
  `quality_rating` TINYINT UNSIGNED DEFAULT 5 COMMENT 'من 1 إلى 5',
  `reviewed_by` BIGINT UNSIGNED DEFAULT NULL,
  `notes` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_memo_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_memo_start_surah` FOREIGN KEY (`start_surah_id`) REFERENCES `surahs` (`id`),
  CONSTRAINT `fk_memo_end_surah` FOREIGN KEY (`end_surah_id`) REFERENCES `surahs` (`id`),
  CONSTRAINT `fk_memo_reviewer` FOREIGN KEY (`reviewed_by`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  INDEX `idx_memorization_student_date` (`student_id`, `year`, `month`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 10. جدول الحضور (attendances)
-- ---------------------------------------------------------
CREATE TABLE `attendances` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `attendance_date` DATE NOT NULL,
  `student_id` BIGINT UNSIGNED DEFAULT NULL,
  `teacher_id` BIGINT UNSIGNED DEFAULT NULL,
  `status` ENUM('present', 'absent') NOT NULL,
  `check_in_time` TIME DEFAULT NULL,
  `check_out_time` TIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  CONSTRAINT `fk_attn_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_attn_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  INDEX `idx_attendance_date` (`attendance_date`),
  INDEX `idx_student_date` (`student_id`, `attendance_date`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 11. جدول المخالفات (violations)
-- ---------------------------------------------------------
CREATE TABLE `violations` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `violation_date` DATE NOT NULL,
  `description` VARCHAR(255) NOT NULL,
  `action_taken` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_viol_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  INDEX `idx_violation_student` (`student_id`),
  INDEX `idx_violation_date` (`violation_date`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 12. جدول الإنجازات (achievements)
-- ---------------------------------------------------------
CREATE TABLE `achievements` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `student_id` BIGINT UNSIGNED NOT NULL,
  `achievement_date` DATE NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `achievement_type` ENUM('completion', 'award', 'milestone') DEFAULT 'milestone',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_achievement_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  INDEX `idx_achievement_student` (`student_id`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 13. جدول المستخدمين (users)
-- ---------------------------------------------------------
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) DEFAULT NULL,
  `email` VARCHAR(150) UNIQUE DEFAULT NULL,
  `role_id` TINYINT UNSIGNED DEFAULT 1,
  `teacher_id` BIGINT UNSIGNED DEFAULT NULL COMMENT 'ربط حساب المعلم إذا كان الدور teacher',
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `fk_user_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  INDEX `idx_user_username` (`username`),
  INDEX `idx_user_email` (`email`)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- إدراج بيانات السور (114 سورة)
-- ---------------------------------------------------------
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

-- ---------------------------------------------------------
-- إدراج مستخدم افتراضي (سيتم تشفير كلمة المرور في التطبيق)
-- كلمة المرور: admin123
-- ---------------------------------------------------------
INSERT INTO `users` (`username`, `password`, `full_name`, `email`, `role_id`) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'المدير العام', 'admin@daralbrhaan.com', 1);

COMMIT;
