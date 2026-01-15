const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middleware/auth.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// تقرير شامل عن الطلاب
router.get('/students', reportsController.getStudentsReport);

// تقرير الحضور
router.get('/attendance', reportsController.getAttendanceReport);

// تقرير الحفظ
router.get('/memorization', reportsController.getMemorizationReport);

// تقرير الحلقات
router.get('/halaqat', reportsController.getHalaqatReport);

module.exports = router;
