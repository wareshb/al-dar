-- تحديث جدول المعلمين والموظفين (Staff Management)
-- قم بتشغيل هذا الكود في MySQL Workbench أو أي واجهة SQL لديك

ALTER TABLE teachers 
ADD COLUMN IF NOT EXISTS email VARCHAR(150),
ADD COLUMN IF NOT EXISTS specialization VARCHAR(150),
ADD COLUMN IF NOT EXISTS is_mujaz BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_job VARCHAR(150),
ADD COLUMN IF NOT EXISTS qualification VARCHAR(150),
ADD COLUMN IF NOT EXISTS staff_type ENUM('teacher', 'admin', 'both') DEFAULT 'teacher',
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- في حال لم يكن العمود is_active موجوداً مسبقاً، سيتم إنشاؤه
-- وفي حال كان موجوداً، سيتم المتابعة دون أخطاء بفضل كلمة IF NOT EXISTS (في نسخ MySQL الحديثة)
