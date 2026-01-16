const db = require('../config/db');

// الحصول على جميع المخالفات
exports.getAllViolations = async (req, res) => {
    try {
        const { student_id, start_date, end_date } = req.query;

        let query = `
      SELECT v.*, s.full_name as student_name
      FROM violations v
      LEFT JOIN students s ON v.student_id = s.id
      WHERE 1=1
    `;
        const params = [];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            query += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he 
                JOIN halaqat h ON he.halaqa_id = h.id 
                WHERE he.student_id = v.student_id AND h.teacher_id = ? AND he.is_active = true
            )`;
            params.push(req.user.teacher_id);
        }

        if (student_id) {
            query += ` AND v.student_id = ?`;
            params.push(student_id);
        }

        if (start_date && end_date) {
            query += ` AND v.violation_date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY v.violation_date DESC`;

        const [violations] = await db.query(query, params);

        res.json({
            success: true,
            data: violations,
            count: violations.length
        });
    } catch (error) {
        console.error('Get all violations error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب المخالفات'
        });
    }
};

// الحصول على مخالفة واحدة
exports.getViolation = async (req, res) => {
    try {
        const { id } = req.params;

        const [violations] = await db.query(
            `SELECT v.*, s.full_name as student_name, s.phone, s.guardian_phone
       FROM violations v
       LEFT JOIN students s ON v.student_id = s.id
       WHERE v.id = ?`,
            [id]
        );

        if (violations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'المخالفة غير موجودة'
            });
        }

        res.json({
            success: true,
            data: violations[0]
        });
    } catch (error) {
        console.error('Get violation error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب المخالفة'
        });
    }
};

// إضافة مخالفة جديدة
exports.createViolation = async (req, res) => {
    try {
        const { student_id, violation_date, description, action_taken } = req.body;

        const [result] = await db.query(
            `INSERT INTO violations (student_id, violation_date, description, action_taken) 
       VALUES (?, ?, ?, ?)`,
            [student_id, violation_date, description, action_taken || null]
        );

        res.status(201).json({
            success: true,
            message: 'تم تسجيل المخالفة بنجاح',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('Create violation error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل المخالفة'
        });
    }
};

// تحديث مخالفة
exports.updateViolation = async (req, res) => {
    try {
        const { id } = req.params;
        const { violation_date, description, action_taken } = req.body;

        const [result] = await db.query(
            `UPDATE violations 
       SET violation_date = ?, description = ?, action_taken = ?
       WHERE id = ?`,
            [violation_date, description, action_taken || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'المخالفة غير موجودة'
            });
        }

        res.json({
            success: true,
            message: 'تم تحديث المخالفة بنجاح'
        });
    } catch (error) {
        console.error('Update violation error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث المخالفة'
        });
    }
};

// حذف مخالفة
exports.deleteViolation = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(`DELETE FROM violations WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'المخالفة غير موجودة'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف المخالفة بنجاح'
        });
    } catch (error) {
        console.error('Delete violation error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف المخالفة'
        });
    }
};

// الحصول على مخالفات طالب
exports.getStudentViolations = async (req, res) => {
    try {
        const { studentId } = req.params;

        const [violations] = await db.query(
            `SELECT * FROM violations 
       WHERE student_id = ? 
       ORDER BY violation_date DESC`,
            [studentId]
        );

        res.json({
            success: true,
            data: violations,
            count: violations.length
        });
    } catch (error) {
        console.error('Get student violations error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب مخالفات الطالب'
        });
    }
};
