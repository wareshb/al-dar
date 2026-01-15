const db = require('../config/db');

// الحصول على كافة الإعدادات
exports.getSettings = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT setting_key, setting_value FROM settings');

        // تحويل المصفوفة إلى كائن لسهولة التعامل معه في الفرونت آند
        const settingsObj = {};
        rows.forEach(row => {
            settingsObj[row.setting_key] = row.setting_value;
        });

        res.json({
            success: true,
            data: settingsObj
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الإعدادات'
        });
    }
};

// تحديث الإعدادات
exports.updateSettings = async (req, res) => {
    try {
        const settings = req.body; // يتوقع كائن { key: value, key2: value2 }

        const queries = Object.entries(settings).map(([key, value]) => {
            return db.query(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        });

        await Promise.all(queries);

        res.json({
            success: true,
            message: 'تم تحديث الإعدادات بنجاح'
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث الإعدادات'
        });
    }
};
