const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// إحصائيات لوحة التحكم
router.get('/stats', dashboardController.getDashboardStats);

// بيانات رسم بياني للحضور
router.get('/charts/attendance', dashboardController.getAttendanceChart);

// بيانات رسم بياني للحفظ
router.get('/charts/memorization', dashboardController.getMemorizationChart);

module.exports = router;
