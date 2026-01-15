-- تحديث جدول الطلاب لإضافة المعرف وبيانات ولي الأمر
-- قم بتشغيل هذا الكود في MySQL Workbench أو أي واجهة SQL لديك

ALTER TABLE students 
ADD COLUMN IF NOT EXISTS identification_number VARCHAR(50) AFTER id,
ADD COLUMN IF NOT EXISTS guardian_name VARCHAR(150),
ADD COLUMN IF NOT EXISTS guardian_phone VARCHAR(20);

-- ملاحظة: إذا كانت الأعمدة موجودة مسبقاً، سيتم تخطيها بسلام بفضل IF NOT EXISTS
