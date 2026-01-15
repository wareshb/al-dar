const express = require('express');
const router = express.Router();
const teachersController = require('../controllers/teachers.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// الحصول على جميع المعلمين
router.get('/', teachersController.getAllTeachers);

// الحصول على معلم واحد
router.get('/:id', teachersController.getTeacher);

// الحصول على حلقات المعلم
router.get('/:id/halaqat', teachersController.getTeacherHalaqat);

// إضافة معلم جديد (admin فقط)
router.post('/', roleMiddleware('admin'), teachersController.createTeacher);

// تحديث معلم (admin فقط)
router.put('/:id', roleMiddleware('admin'), teachersController.updateTeacher);

// حذف معلم (admin فقط)
router.delete('/:id', roleMiddleware('admin'), teachersController.deleteTeacher);

module.exports = router;
