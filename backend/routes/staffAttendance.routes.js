const express = require('express');
const router = express.Router();
const staffAttendanceController = require('../controllers/staffAttendance.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All staff attendance routes require authentication
router.use(authMiddleware);

// Record daily attendance
router.post('/', staffAttendanceController.recordStaffAttendance);

// Get attendance for a specific date
router.get('/date/:date', staffAttendanceController.getStaffAttendanceByDate);

// Get attendance history for a teacher
router.get('/teacher/:teacherId', staffAttendanceController.getTeacherAttendance);

// Absence report
router.get('/report/absent', staffAttendanceController.getStaffAbsentReport);

// Update a single record
router.put('/:id', staffAttendanceController.updateStaffAttendance);

module.exports = router;
