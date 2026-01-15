const express = require('express');
const router = express.Router();
const memorizationController = require('../controllers/memorization.controller');
const authMiddleware = require('../middleware/auth.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// الحصول على قائمة السور
router.get('/surahs', memorizationController.getSurahs);

// تسجيل إنجاز حفظ
router.post('/', memorizationController.recordMemorization);

// الحصول على سجل حفظ طالب
router.get('/student/:studentId', memorizationController.getStudentMemorization);

// الحصول على سجلات الحفظ لشهر معين
router.get('/month', memorizationController.getMemorizationByMonth);

// تحديث سجل حفظ
router.put('/:id', memorizationController.updateMemorization);

// حذف سجل حفظ
router.delete('/:id', memorizationController.deleteMemorization);

module.exports = router;
