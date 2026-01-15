const db = require('./config/db');

async function updateSchema() {
    try {
        console.log('🔄 جاري تحديث هيكل جدول الحفظ (memorization)...');

        // التحقق من وجود العمود مسبقاً
        const [columns] = await db.query('SHOW COLUMNS FROM memorization LIKE "type"');

        if (columns.length === 0) {
            await db.query(`
                ALTER TABLE memorization 
                ADD COLUMN type ENUM('memo', 'revision') DEFAULT 'memo' 
                AFTER end_ayah
            `);
            console.log('✅ تم إضافة عمود "type" بنجاح');
        } else {
            console.log('ℹ️ عمود "type" موجود بالفعل');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ حدث خطأ أثناء التحديث:', error.message);
        process.exit(1);
    }
}

updateSchema();
