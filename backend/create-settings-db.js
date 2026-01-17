const db = require('./config/db');

async function createSettingsTable() {
    try {
        console.log('🔄 جاري إنشاء جدول إعدادات النظام (settings)...');

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                setting_key VARCHAR(100) NOT NULL UNIQUE,
                setting_value TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;

        await db.query(createTableQuery);
        console.log('✅ تم إنشاء الجدول بنجاح');

        // إضافة الإعدادات الافتراضية إذا لم تكن موجودة
        const defaultSettings = [
            ['dar_name', 'دار البرهان لتعليم القرآن الكريم'],
            ['dar_manager', ''],
            ['dar_logo', ''],
            ['dar_address', ''],
            ['dar_phone', ''],
            ['dar_vision', ''],
            ['dar_message', ''],
            ['report_header_text', '']
        ];

        for (const [key, value] of defaultSettings) {
            await db.query(
                'INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)',
                [key, value]
            );
        }

        console.log('✅ تم إدراج الإعدادات الافتراضية');
        process.exit(0);
    } catch (error) {
        console.error('❌ حدث خطأ:', error.message);
        process.exit(1);
    }
}

createSettingsTable();
