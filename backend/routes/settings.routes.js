const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

// كافة المسارات محمية
router.use(authMiddleware);

// المسارات
router.get('/', roleMiddleware('admin', 'supervisor'), settingsController.getSettings);
router.post('/', roleMiddleware('admin'), settingsController.updateSettings);

module.exports = router;
