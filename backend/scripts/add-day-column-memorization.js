const db = require('../config/db');

async function migrate() {
    try {
        console.log('🔄 جاري إضافة عمود "day" لجدول الحفظ (memorization)...');

        // التحقق من وجود العمود مسبقاً
        const [columns] = await db.query('SHOW COLUMNS FROM memorization LIKE "day"');

        if (columns.length === 0) {
            await db.query(`
                ALTER TABLE memorization 
                ADD COLUMN day TINYINT(3) UNSIGNED DEFAULT 1 
                AFTER student_id
            `);
            console.log('✅ تم إضافة عمود "day" بنجاح');

            // تحديث اليوم بناءً على created_at للسجلات الحالية (اختياري)
            await db.query('UPDATE memorization SET day = DAY(created_at) WHERE day = 1');
            console.log('✅ تم تحديث بيانات اليوم للسجلات القديمة');
        } else {
            console.log('ℹ️ عمود "day" موجود بالفعل');
        }

        console.log('✨ اكتملت الهجرة بنجاح');
        process.exit(0);
    } catch (error) {
        console.error('❌ حدث خطأ أثناء الهجرة:', error.message);
        process.exit(1);
    }
}

migrate();
