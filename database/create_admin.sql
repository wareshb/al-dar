-- سكريبت سريع لإنشاء مستخدم admin
-- استخدم هذا في MySQL مباشرة

USE dar_db;

-- حذف المستخدم القديم إن وجد
DELETE FROM users WHERE username = 'admin';

-- Hash لكلمة المرور admin123
-- تم إنشاءه باستخدام bcrypt
INSERT INTO users (username, password, full_name, email, role_id) 
VALUES (
  'admin', 
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'المدير العام',
  'admin@daralbrhaan.com',
  1
);

-- عرض المستخدم
SELECT id, username, full_name, email, role_id FROM users WHERE username = 'admin';
