const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/students.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// جميع المسارات تحتاج إلى مصادقة
router.use(authMiddleware);

// الحصول على جميع الطلاب مع البحث والفلترة
router.get('/', studentsController.getAllStudents);

// الحصول على طالب واحد مع كل التفاصيل
router.get('/:id', studentsController.getStudent);

// إضافة طالب جديد
router.post('/', roleMiddleware('admin', 'supervisor'), studentsController.createStudent);

// تحديث طالب
router.put('/:id', roleMiddleware('admin', 'supervisor'), studentsController.updateStudent);

// حذف طالب (admin فقط)
router.delete('/:id', roleMiddleware('admin'), studentsController.deleteStudent);

module.exports = router;
