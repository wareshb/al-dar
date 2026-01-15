const db = require('./config/db');

async function updateStudentsSchema() {
    try {
        console.log('🔄 جاري تحديث هيكل جدول الطلاب (students)...');

        // 1. إضافة عمود identification_number إذا لم يكن موجوداً
        const [idCol] = await db.query('SHOW COLUMNS FROM students LIKE "identification_number"');
        if (idCol.length === 0) {
            await db.query('ALTER TABLE students ADD COLUMN identification_number VARCHAR(50) AFTER id');
            console.log('✅ تم إضافة عمود "identification_number"');
        }

        // 2. إضافة عمود gender إذا لم يكن موجوداً
        const [genderCol] = await db.query('SHOW COLUMNS FROM students LIKE "gender"');
        if (genderCol.length === 0) {
            await db.query("ALTER TABLE students ADD COLUMN gender ENUM('male', 'female') DEFAULT 'male' AFTER full_name");
            console.log('✅ تم إضافة عمود "gender"');
        }

        // 3. إضافة عمود is_active إذا لم يكن موجوداً
        const [activeCol] = await db.query('SHOW COLUMNS FROM students LIKE "is_active"');
        if (activeCol.length === 0) {
            await db.query('ALTER TABLE students ADD COLUMN is_active TINYINT(1) DEFAULT 1 AFTER phone');
            console.log('✅ تم إضافة عمود "is_active"');
        }

        // 4. إضافة عمود address إذا لم يكن موجوداً
        const [addressCol] = await db.query('SHOW COLUMNS FROM students LIKE "address"');
        if (addressCol.length === 0) {
            await db.query('ALTER TABLE students ADD COLUMN address TEXT AFTER permanent_address');
            console.log('✅ تم إضافة عمود "address"');
        }

        console.log('🎉 تم تحديث الجدول بنجاح');
        process.exit(0);
    } catch (error) {
        console.error('❌ حدث خطأ أثناء التحديث:', error.message);
        process.exit(1);
    }
}

updateStudentsSchema();
