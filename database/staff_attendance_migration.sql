-- إضافة جدول حضور المعلمين والموظفين
CREATE TABLE IF NOT EXISTS `staff_attendances` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `attendance_date` date NOT NULL,
  `teacher_id` bigint UNSIGNED NOT NULL,
  `status` enum('present','absent','late','excused','sick_leave','vacation') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'present',
  `check_in_time` time DEFAULT NULL,
  `check_out_time` time DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `recorded_by` bigint UNSIGNED DEFAULT NULL COMMENT 'المستخدم الذي سجل الحضور',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_staff_attendance_date` (`attendance_date`),
  KEY `idx_staff_teacher_date` (`teacher_id`,`attendance_date`),
  KEY `fk_staff_attn_teacher` (`teacher_id`),
  KEY `fk_staff_attn_recorder` (`recorded_by`),
  CONSTRAINT `fk_staff_attn_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_staff_attn_recorder` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- إضافة فهرس فريد لمنع تكرار التسجيل لنفس المعلم في نفس اليوم
ALTER TABLE `staff_attendances` 
ADD UNIQUE KEY `unique_teacher_date` (`teacher_id`, `attendance_date`);
