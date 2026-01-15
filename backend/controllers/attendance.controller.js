const db = require('../config/db');

// تسجيل الحضور اليومي (دفعة واحدة)
exports.recordAttendance = async (req, res) => {
    try {
        const { attendance_date, records } = req.body;
        // records = [{ student_id, status, check_in_time, check_out_time, notes, attendance_id }]

        if (!attendance_date || !records || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد التاريخ وسجلات الحضور'
            });
        }

        // استخدام INSERT ... ON DUPLICATE KEY UPDATE للتحديث أو الإدراج
        for (const record of records) {
            if (record.attendance_id) {
                // تحديث سجل موجود
                await db.query(
                    `UPDATE attendances 
           SET status = ?, check_in_time = ?, check_out_time = ?, notes = ?, teacher_id = ?
           WHERE id = ?`,
                    [
                        record.status,
                        record.check_in_time || null,
                        record.check_out_time || null,
                        record.notes || null,
                        req.user.teacher_id || null,
                        record.attendance_id
                    ]
                );
            } else {
                // إدراج سجل جديد
                await db.query(
                    `INSERT INTO attendances 
           (attendance_date, student_id, teacher_id, status, check_in_time, check_out_time, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [
                        attendance_date,
                        record.student_id,
                        req.user.teacher_id || null,
                        record.status,
                        record.check_in_time || null,
                        record.check_out_time || null,
                        record.notes || null
                    ]
                );
            }
        }

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

// الحصول على حضور حلقة معينة لتاريخ معين
exports.getHalaqaAttendance = async (req, res) => {
    try {
        const { halaqaId } = req.params;
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد التاريخ'
            });
        }

        // الحصول على جميع الطلاب في الحلقة
        const [students] = await db.query(
            `SELECT s.id as student_id, s.full_name as student_name, s.phone, s.guardian_phone
       FROM halaqa_enrollments he
       LEFT JOIN students s ON he.student_id = s.id
       WHERE he.halaqa_id = ? AND he.is_active = true
       ORDER BY s.full_name ASC`,
            [halaqaId]
        );

        // الحصول على سجلات الحضور الموجودة لهذا التاريخ
        const [existingAttendance] = await db.query(
            `SELECT a.*, s.id as student_id, s.full_name as student_name
       FROM attendances a
       LEFT JOIN students s ON a.student_id = s.id
       LEFT JOIN halaqa_enrollments he ON s.id = he.student_id
       WHERE he.halaqa_id = ? AND a.attendance_date = ? AND he.is_active = true
       ORDER BY s.full_name ASC`,
            [halaqaId, date]
        );

        // دمج البيانات: إضافة سجلات الحضور الموجودة للطلاب
        const attendanceMap = {};
        existingAttendance.forEach(att => {
            attendanceMap[att.student_id] = att;
        });

        const result = students.map(student => {
            const existing = attendanceMap[student.student_id];
            return {
                student_id: student.student_id,
                student_name: student.student_name,
                phone: student.phone,
                guardian_phone: student.guardian_phone,
                attendance_id: existing?.id || null,
                status: existing?.status || 'present', // افتراضي: حاضر
                check_in_time: existing?.check_in_time || null,
                check_out_time: existing?.check_out_time || null,
                notes: existing?.notes || null
            };
        });

        // إحصائيات
        const stats = {
            total: result.length,
            present: result.filter(s => s.status === 'present').length,
            absent: result.filter(s => s.status === 'absent').length,
            late: result.filter(s => s.status === 'late').length,
            excused: result.filter(s => s.status === 'excused').length
        };

        res.json({
            success: true,
            data: result,
            stats
        });
    } catch (error) {
        console.error('Get halaqa attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب سجل الحضور'
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
