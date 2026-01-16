const jwt = require('jsonwebtoken');

// Middleware للتحقق من صلاحية JWT Token
const authMiddleware = async (req, res, next) => {
    try {
        // الحصول على التوكن من الـ Header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'غير مصرح - لا يوجد توكن'
            });
        }

        const token = authHeader.split(' ')[1];

        // التحقق من صلاحية التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // إضافة بيانات المستخدم إلى الطلب
        req.user = decoded;

        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'انتهت صلاحية الجلسة، يرجى تسجيل الدخول مرة أخرى'
            });
        }

        return res.status(401).json({
            success: false,
            message: 'توكن غير صالح'
        });
    }
};

module.exports = authMiddleware;
