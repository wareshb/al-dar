const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function createAdminUser() {
    try {
        // تشفير كلمة المرور
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // حذف المستخدم القديم إن وجد
        await db.query('DELETE FROM users WHERE username = ?', ['admin']);

        // إضافة المستخدم الجديد
        await db.query(
            `INSERT INTO users (username, password, full_name, email, role_id) 
       VALUES (?, ?, ?, ?, ?)`,
            ['admin', hashedPassword, 'المدير العام', 'admin@daralbrhaan.com', 1]
        );

        console.log('✅ تم إنشاء المستخدم admin بنجاح');
        console.log('Username: admin');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('❌ خطأ في إنشاء المستخدم:', error);
        process.exit(1);
    }
}

createAdminUser();
