const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadController = require('../controllers/upload.controller');
const authMiddleware = require('../middleware/auth.middleware');

// إنشاء مجلد Uploads إذا لم يكن موجودًا
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// إعداد Multer للتخزين
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// فلتر للملفات (الصور فقط)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('الملف المرفوع يجب أن يكون صورة فقط'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
});

// رفع صورة واحدة
router.post('/image', authMiddleware, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'لم يتم رفع أي ملف'
            });
        }

        res.json({
            success: true,
            message: 'تم رفع الصورة بنجاح',
            data: {
                filename: req.file.filename,
                url: `/uploads/${req.file.filename}`,
                size: req.file.size
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء رفع الصورة'
        });
    }
});

// الحصول على صورة
router.get('/:filename', uploadController.getImage);

// حذف صورة
router.delete('/:filename', authMiddleware, uploadController.deleteImage);

// معالجة الأخطاء
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'حجم الملف كبير جداً. الحد الأقصى 5MB'
            });
        }
    }

    res.status(500).json({
        success: false,
        message: error.message || 'حدث خطأ أثناء رفع الملف'
    });
});

module.exports = router;
