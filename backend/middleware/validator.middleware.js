const { validationResult } = require('express-validator');

// Middleware للتحقق من نتائج التحقق من البيانات
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'خطأ في البيانات المدخلة',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};

module.exports = validate;
