const db = require('../config/db');

// تسجيل حضور المعلمين/الموظفين (دفعة واحدة)
const recordStaffAttendance = async (req, res) => {
    try {
        const { attendance_date, records } = req.body;
        if (!attendance_date || !records || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد التاريخ وسجلات الحضور'
            });
        }

        const recorded_by = req.user.id || null;

        for (const record of records) {
            await db.query(
                `INSERT INTO staff_attendances 
                (attendance_date, teacher_id, status, check_in_time, check_out_time, notes, recorded_by) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                check_in_time = VALUES(check_in_time),
                check_out_time = VALUES(check_out_time),
                notes = VALUES(notes),
                recorded_by = VALUES(recorded_by)`,
                [
                    attendance_date,
                    record.teacher_id,
                    record.status,
                    record.check_in_time || null,
                    record.check_out_time || null,
                    record.notes || null,
                    recorded_by
                ]
            );
        }

        res.json({
            success: true,
            message: 'تم تسجيل الحضور بنجاح'
        });
    } catch (error) {
        console.error('Record staff attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الحضور'
        });
    }
};

// الحصول على سجل الحضور لتاريخ معين
const getStaffAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;

        // الحصول على جميع المعلمين النشطين
        const [teachers] = await db.query(
            `SELECT id as teacher_id, full_name as teacher_name, phone, staff_type
             FROM teachers
             WHERE is_active = true
             ORDER BY full_name ASC`
        );

        // الحصول على سجلات الحضور الموجودة لهذا التاريخ
        const [existingAttendance] = await db.query(
            `SELECT sa.*, t.full_name as teacher_name, u.full_name as recorder_name
             FROM staff_attendances sa
             LEFT JOIN teachers t ON sa.teacher_id = t.id
             LEFT JOIN users u ON sa.recorded_by = u.id
             WHERE sa.attendance_date = ?`,
            [date]
        );

        // دمج البيانات
        const attendanceMap = {};
        existingAttendance.forEach(att => {
            attendanceMap[att.teacher_id] = att;
        });

        const result = teachers.map(teacher => {
            const existing = attendanceMap[teacher.teacher_id];
            return {
                teacher_id: teacher.teacher_id,
                teacher_name: teacher.teacher_name,
                phone: teacher.phone,
                staff_type: teacher.staff_type,
                attendance_id: existing?.id || null,
                status: existing?.status || 'present',
                check_in_time: existing?.check_in_time || null,
                check_out_time: existing?.check_out_time || null,
                notes: existing?.notes || null,
                recorder_name: existing?.recorder_name || null
            };
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get staff attendance by date error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب سجل الحضور'
        });
    }
};

// الحصول على سجل حضور معلم/موظف
const getTeacherAttendance = async (req, res) => {
    try {
        const { teacherId } = req.params;
        const { start_date, end_date } = req.query;

        let query = `SELECT sa.*, u.full_name as recorder_name 
                     FROM staff_attendances sa
                     LEFT JOIN users u ON sa.recorded_by = u.id
                     WHERE sa.teacher_id = ?`;
        const params = [teacherId];

        if (start_date && end_date) {
            query += ` AND sa.attendance_date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` ORDER BY sa.attendance_date DESC`;

        const [attendance] = await db.query(query, params);

        res.json({
            success: true,
            data: attendance
        });
    } catch (error) {
        console.error('Get teacher attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب سجل حضور المعلم'
        });
    }
};

// تقرير الغياب للمعلمين
const getStaffAbsentReport = async (req, res) => {
    try {
        const { start_date, end_date, min_absences = 3 } = req.query;

        let query = `
            SELECT t.id, t.full_name, t.phone, t.staff_type,
            COUNT(*) as absence_count,
            GROUP_CONCAT(sa.attendance_date ORDER BY sa.attendance_date DESC) as absence_dates
            FROM staff_attendances sa
            LEFT JOIN teachers t ON sa.teacher_id = t.id
            WHERE sa.status IN ('absent', 'sick_leave')
        `;

        const params = [];
        if (start_date && end_date) {
            query += ` AND sa.attendance_date BETWEEN ? AND ?`;
            params.push(start_date, end_date);
        }

        query += ` GROUP BY t.id, t.full_name, t.phone, t.staff_type
                   HAVING absence_count >= ?
                   ORDER BY absence_count DESC`;

        params.push(parseInt(min_absences));

        const [report] = await db.query(query, params);

        res.json({
            success: true,
            data: report
        });
    } catch (error) {
        console.error('Get staff absent report error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء تقرير الغياب'
        });
    }
};

// تحديث سجل حضور
const updateStaffAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, check_in_time, check_out_time, notes } = req.body;

        await db.query(
            `UPDATE staff_attendances 
             SET status = ?, check_in_time = ?, check_out_time = ?, notes = ?
             WHERE id = ?`,
            [status, check_in_time || null, check_out_time || null, notes || null, id]
        );

        res.json({
            success: true,
            message: 'تم تحديث سجل الحضور بنجاح'
        });
    } catch (error) {
        console.error('Update staff attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث سجل الحضور'
        });
    }
};

module.exports = {
    recordStaffAttendance,
    getStaffAttendanceByDate,
    getTeacherAttendance,
    getStaffAbsentReport,
    updateStaffAttendance
};
