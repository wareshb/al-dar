// Middleware للتحقق من صلاحيات المستخدم
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح - يجب تسجيل الدخول'
            });
        }

        const userRole = req.user.role_name;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'ليس لديك صلاحية للوصول إلى هذا المورد'
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
