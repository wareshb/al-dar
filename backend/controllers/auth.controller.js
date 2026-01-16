const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// تسجيل الدخول
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // التحقق من وجود اسم المستخدم وكلمة المرور
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إدخال اسم المستخدم وكلمة المرور'
            });
        }

        console.log('--- Login Debug ---');
        console.log('Username provided:', username);

        // البحث عن المستخدم في جدول المشرفين (الأدمن)
        let [users] = await db.query(
            `SELECT u.*, r.name as role_name 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             WHERE u.username = ?`,
            [username]
        );

        let user = users[0];
        let roleName = user ? user.role_name : null;
        let teacherId = user ? user.teacher_id : null;

        // إذا لم يتم العثور على المستخدم في جدول المشرفين، ابحث في جدول المعلمين
        if (!user) {
            console.log('User not found in users table, checking teachers table...');
            const [teachers] = await db.query(
                'SELECT * FROM teachers WHERE username = ? AND is_active = 1',
                [username]
            );

            if (teachers.length > 0) {
                user = teachers[0];
                roleName = 'teacher'; // دور افتراضي للمعلم
                teacherId = user.id;
            }
        }

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // التحقق من كلمة المرور
        const isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('Login failed: Password mismatch');
            return res.status(401).json({
                success: false,
                message: 'اسم المستخدم أو كلمة المرور غير صحيحة'
            });
        }

        // إنشاء JWT Token
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role_id: user.role_id || null, // قد يكون null للمعلم إذا لم نستخدم جدول الأدوار له
                role_name: roleName,
                teacher_id: teacherId
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // إرسال الاستجابة
        res.json({
            success: true,
            message: 'تم تسجيل الدخول بنجاح',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    full_name: user.full_name,
                    email: user.email,
                    role: roleName,
                    teacher_id: teacherId
                }
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الدخول'
        });
    }
};

// الحصول على بيانات المستخدم الحالي
exports.getCurrentUser = async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT u.id, u.username, u.full_name, u.email, r.name as role, u.teacher_id
       FROM users u 
       LEFT JOIN roles r ON u.role_id = r.id 
       WHERE u.id = ?`,
            [req.user.id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'المستخدم غير موجود'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });

    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات المستخدم'
        });
    }
};

// تغيير كلمة المرور
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'يرجى إدخال كلمة المرور الحالية والجديدة'
            });
        }

        // الحصول على المستخدم الحالي
        const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        const user = users[0];

        // التحقق من كلمة المرور الحالية
        const isValid = await bcrypt.compare(currentPassword, user.password);

        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: 'كلمة المرور الحالية غير صحيحة'
            });
        }

        // تشفير كلمة المرور الجديدة
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // تحديث كلمة المرور
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({
            success: true,
            message: 'تم تغيير كلمة المرور بنجاح'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تغيير كلمة المرور'
        });
    }
};
