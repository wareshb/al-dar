const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// كافة المسارات محمية وتتطلب صلاحية مدير أو مشرف
router.get('/', protect, authorize('admin', 'supervisor'), settingsController.getSettings);
router.post('/', protect, authorize('admin'), settingsController.updateSettings);

module.exports = router;
