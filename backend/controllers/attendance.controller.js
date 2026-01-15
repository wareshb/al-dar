const db = require('../config/db');

// تسجيل الحضور اليومي (دفعة واحدة)
exports.recordAttendance = async (req, res) => {
    try {
        const { attendance_date, records } = req.body;
        // records = [{ student_id, status, check_in_time, check_out_time, notes }]

        if (!attendance_date || !records || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد التاريخ وسجلات الحضور'
            });
        }

        const values = records.map(r => [
            attendance_date,
            r.student_id,
            req.user.teacher_id || null,
            r.status,
            r.check_in_time || null,
            r.check_out_time || null,
            r.notes || null
        ]);

        await db.query(
            `INSERT INTO attendances 
       (attendance_date, student_id, teacher_id, status, check_in_time, check_out_time, notes) 
       VALUES ?`,
            [values]
        );

        res.json({
            success: true,
            message: 'تم تسجيل الحضور بنجاح'
        });
    } catch (error) {
        console.error('Record attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الحضور'
        });
    }
};

// الحصول على سجل الحضور لتاريخ معين
exports.getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;

        const [attendance] = await db.query(
            `SELECT a.*, s.full_name as student_name, t.full_name as teacher_name
       FROM attendances a
       LEFT JOIN students s ON a.student_id = s.id
       LEFT JOIN teachers t ON a.teacher_id = t.id
       WHERE a.attendance_date = ?
       ORDER BY s.full_name ASC`,
            [date]
        );

        res.json({
            success: true,
            data: attendance,
            count: attendance.length
        });
    } catch (error) {
        console.error('Get attendance by date error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب سجل الحضور'
        });
    }
};

// الحصول على سجل حضور طالب
exports.getStudentAttendance = async (req, res) => {
    try {
        const { studentId } = req.params;
        const { start_date, end_date } = req.query;

        let query = `SELECT * FROM attendances WHERE student_id = ?`;
        const params = [studentId];

        if (start_date && end_date) {
            query += ` AND attendance_date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY attendance_date DESC`;

        const [attendance] = await db.query(query, params);

        // إحصائيات
        const stats = {
            total: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length
        };

        res.json({
            success: true,
            data: attendance,
            stats
        });
    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب سجل حضور الطالب'
        });
    }
};

// الحصول على تقرير الغياب
exports.getAbsentReport = async (req, res) => {
    try {
        const { start_date, end_date, min_absences = 3 } = req.query;

        let query = `
      SELECT s.id, s.full_name, s.phone, s.guardian_phone,
        COUNT(*) as absence_count,
        GROUP_CONCAT(a.attendance_date ORDER BY a.attendance_date DESC) as absence_dates
      FROM attendances a
      LEFT JOIN students s ON a.student_id = s.id
      WHERE a.status = 'absent'
    `;

        const params = [];

        if (start_date && end_date) {
            query += ` AND a.attendance_date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` GROUP BY s.id, s.full_name, s.phone, s.guardian_phone
               HAVING absence_count >= ?
               ORDER BY absence_count DESC`;

        params.push(parseInt(min_absences));

        const [report] = await db.query(query, params);

        res.json({
            success: true,
            data: report,
            count: report.length
        });
    } catch (error) {
        console.error('Get absent report error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء تقرير الغياب'
        });
    }
};

// تحديث سجل حضور
exports.updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, check_in_time, check_out_time, notes } = req.body;

        const [result] = await db.query(
            `UPDATE attendances 
       SET status = ?, check_in_time = ?, check_out_time = ?, notes = ?
       WHERE id = ?`,
            [status, check_in_time || null, check_out_time || null, notes || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'سجل الحضور غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم تحديث سجل الحضور بنجاح'
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث سجل الحضور'
        });
    }
};
