const db = require('../config/db');

// الحصول على جميع الحلقات
exports.getAllHalaqat = async (req, res) => {
    try {
        const [halaqat] = await db.query(
            `SELECT h.*, 
        t.full_name as teacher_name,
        (SELECT COUNT(*) FROM halaqa_enrollments WHERE halaqa_id = h.id AND is_active = true) as students_count
       FROM halaqat h
       LEFT JOIN teachers t ON h.teacher_id = t.id
       ORDER BY h.name ASC`
        );

        res.json({
            success: true,
            data: halaqat,
            count: halaqat.length
        });
    } catch (error) {
        console.error('Get all halaqat error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات الحلقات'
        });
    }
};

// الحصول على حلقة واحدة مع تفاصيلها
exports.getHalaqa = async (req, res) => {
    try {
        const { id } = req.params;

        const [halaqat] = await db.query(
            `SELECT h.*, t.full_name as teacher_name, t.phone as teacher_phone
       FROM halaqat h
       LEFT JOIN teachers t ON h.teacher_id = t.id
       WHERE h.id = ?`,
            [id]
        );

        if (halaqat.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'الحلقة غير موجودة'
            });
        }

        // الحصول على الطلاب
        const [students] = await db.query(
            `SELECT s.*, he.enroll_date
       FROM halaqa_enrollments he
       LEFT JOIN students s ON he.student_id = s.id
       WHERE he.halaqa_id = ? AND he.is_active = true
       ORDER BY s.full_name ASC`,
            [id]
        );

        // الحصول على جدول الحلقة
        const [schedules] = await db.query(
            `SELECT * FROM halaqa_schedules 
       WHERE halaqa_id = ? 
       ORDER BY day_of_week ASC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                halaqa: halaqat[0],
                students,
                schedules
            }
        });
    } catch (error) {
        console.error('Get halaqa error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات الحلقة'
        });
    }
};

// إنشاء حلقة جديدة
exports.createHalaqa = async (req, res) => {
    try {
        const { name, start_date, teacher_id, schedules } = req.body;

        const [result] = await db.query(
            `INSERT INTO halaqat (name, start_date, teacher_id) 
       VALUES (?, ?, ?)`,
            [name, start_date || null, teacher_id || null]
        );

        const halaqaId = result.insertId;

        // إضافة الجداول إذا تم تحديدها
        if (schedules && schedules.length > 0) {
            const scheduleValues = schedules.map(s => [halaqaId, s.day_of_week, s.start_time, s.end_time]);
            await db.query(
                `INSERT INTO halaqa_schedules (halaqa_id, day_of_week, start_time, end_time) 
         VALUES ?`,
                [scheduleValues]
            );
        }

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الحلقة بنجاح',
            data: {
                id: halaqaId,
                name
            }
        });
    } catch (error) {
        console.error('Create halaqa error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء الحلقة'
        });
    }
};

// تحديث حلقة
exports.updateHalaqa = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, start_date, teacher_id } = req.body;

        const [result] = await db.query(
            `UPDATE halaqat 
       SET name = ?, start_date = ?, teacher_id = ?
       WHERE id = ?`,
            [name, start_date || null, teacher_id || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'الحلقة غير موجودة'
            });
        }

        res.json({
            success: true,
            message: 'تم تحديث الحلقة بنجاح'
        });
    } catch (error) {
        console.error('Update halaqa error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث الحلقة'
        });
    }
};

// حذف حلقة
exports.deleteHalaqa = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(`DELETE FROM halaqat WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'الحلقة غير موجودة'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف الحلقة بنجاح'
        });
    } catch (error) {
        console.error('Delete halaqa error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف الحلقة'
        });
    }
};

// إضافة طلاب إلى الحلقة
exports.enrollStudents = async (req, res) => {
    try {
        const { id } = req.params;
        const { student_ids, enroll_date } = req.body;

        const date = enroll_date || new Date().toISOString().split('T')[0];

        const values = student_ids.map(student_id => [id, student_id, date]);

        await db.query(
            `INSERT INTO halaqa_enrollments (halaqa_id, student_id, enroll_date) 
       VALUES ?`,
            [values]
        );

        res.json({
            success: true,
            message: 'تم إضافة الطلاب إلى الحلقة بنجاح'
        });
    } catch (error) {
        console.error('Enroll students error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إضافة الطلاب'
        });
    }
};

// إزالة طالب من الحلقة
exports.removeStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;

        const [result] = await db.query(
            `UPDATE halaqa_enrollments 
       SET is_active = false 
       WHERE halaqa_id = ? AND student_id = ?`,
            [id, studentId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'الطالب غير مسجل في هذه الحلقة'
            });
        }

        res.json({
            success: true,
            message: 'تم إزالة الطالب من الحلقة بنجاح'
        });
    } catch (error) {
        console.error('Remove student error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إزالة الطالب'
        });
    }
};

// تحديث جدول الحلقة
exports.updateSchedules = async (req, res) => {
    try {
        const { id } = req.params;
        const { schedules } = req.body;

        // حذف الجداول القديمة
        await db.query(`DELETE FROM halaqa_schedules WHERE halaqa_id = ?`, [id]);

        // إضافة الجداول الجديدة
        if (schedules && schedules.length > 0) {
            const values = schedules.map(s => [id, s.day_of_week, s.start_time, s.end_time]);
            await db.query(
                `INSERT INTO halaqa_schedules (halaqa_id, day_of_week, start_time, end_time) 
         VALUES ?`,
                [values]
            );
        }

        res.json({
            success: true,
            message: 'تم تحديث جدول الحلقة بنجاح'
        });
    } catch (error) {
        console.error('Update schedules error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث الجدول'
        });
    }
};
