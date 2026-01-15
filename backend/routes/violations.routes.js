const express = require('express');
const router = express.Router();
const violationsController = require('../controllers/violations.controller');
const authMiddleware = require('../middleware/auth.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// الحصول على جميع المخالفات
router.get('/', violationsController.getAllViolations);

// الحصول على مخالفة واحدة
router.get('/:id', violationsController.getViolation);

// الحصول على مخالفات طالب
router.get('/student/:studentId', violationsController.getStudentViolations);

// إضافة مخالفة
router.post('/', violationsController.createViolation);

// تحديث مخالفة
router.put('/:id', violationsController.updateViolation);

// حذف مخالفة
router.delete('/:id', violationsController.deleteViolation);

module.exports = router;
