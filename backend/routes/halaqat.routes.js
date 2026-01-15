const express = require('express');
const router = express.Router();
const halaqatController = require('../controllers/halaqat.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// الحصول على جميع الحلقات
router.get('/', halaqatController.getAllHalaqat);

// الحصول على حلقة واحدة
router.get('/:id', halaqatController.getHalaqa);

// إنشاء حلقة جديدة (admin فقط)
router.post('/', roleMiddleware('admin'), halaqatController.createHalaqa);

// تحديث حلقة (admin فقط)
router.put('/:id', roleMiddleware('admin'), halaqatController.updateHalaqa);

// حذف حلقة (admin فقط)
router.delete('/:id', roleMiddleware('admin'), halaqatController.deleteHalaqa);

// إضافة طلاب إلى الحلقة (admin فقط)
router.post('/:id/enroll', roleMiddleware('admin'), halaqatController.enrollStudents);

// إزالة طالب من الحلقة (admin فقط)
router.delete('/:id/students/:studentId', roleMiddleware('admin'), halaqatController.removeStudent);

// تحديث جدول الحلقة (admin فقط)
router.put('/:id/schedules', roleMiddleware('admin'), halaqatController.updateSchedules);

module.exports = router;
