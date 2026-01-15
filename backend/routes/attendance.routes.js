const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const authMiddleware = require('../middleware/auth.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// تسجيل الحضور اليومي
router.post('/', attendanceController.recordAttendance);

// الحصول على الحضور لتاريخ معين
router.get('/date/:date', attendanceController.getAttendanceByDate);

// الحصول على حضور حلقة معينة
router.get('/halaqa/:halaqaId', attendanceController.getHalaqaAttendance);

// الحصول على سجل حضور طالب
router.get('/student/:studentId', attendanceController.getStudentAttendance);

// تقرير الغياب
router.get('/report/absent', attendanceController.getAbsentReport);

// تحديث سجل حضور
router.put('/:id', attendanceController.updateAttendance);

module.exports = router;
