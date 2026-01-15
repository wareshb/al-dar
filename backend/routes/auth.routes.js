const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// تسجيل الدخول (لا يحتاج إلى مصادقة)
router.post('/login', authController.login);

// الحصول على بيانات المستخدم الحالي (يحتاج إلى مصادقة)
router.get('/me', authMiddleware, authController.getCurrentUser);

// تغيير كلمة المرور (يحتاج إلى مصادقة)
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
