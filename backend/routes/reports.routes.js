const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middleware/auth.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// تقرير شامل عن الطلاب
router.get('/students', reportsController.getStudentsReport);

// تقرير عام
router.get('/general', reportsController.getGeneralReport);

// تقرير الحضور
router.get('/attendance', reportsController.getAttendanceReport);

// تقرير حضور المعلمين والموظفين
router.get('/staff-attendance', reportsController.getStaffAttendanceReport);

// تقرير الحفظ
router.get('/memorization', reportsController.getMemorizationReport);

// تقرير الحلقات
router.get('/halaqat', reportsController.getHalaqatReport);

// تقرير المخالفات
router.get('/violations', reportsController.getViolationsReport);

module.exports = router;
