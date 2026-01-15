const multer = require('multer');
const path = require('path');
const fs = require('fs');

// إنشاء مجلد Uploads إذا لم يكن موجودًا
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// الحصول على صورة
exports.getImage = (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '..', 'uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'الصورة غير موجودة'
            });
        }

        res.sendFile(filePath);
    } catch (error) {
        console.error('Get image error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الصورة'
        });
    }
};

// حذف صورة
exports.deleteImage = (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(__dirname, '..', 'uploads', filename);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'الصورة غير موجودة'
            });
        }

        fs.unlinkSync(filePath);

        res.json({
            success: true,
            message: 'تم حذف الصورة بنجاح'
        });
    } catch (error) {
        console.error('Delete image error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف الصورة'
        });
    }
};
