const db = require('../config/db');

// الحصول على جميع الطلاب مع إمكانية البحث والفلترة
exports.getAllStudents = async (req, res) => {
    try {
        const { search, academic_level, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let query = `SELECT s.*, 
      (SELECT h.name FROM halaqa_enrollments he 
       LEFT JOIN halaqat h ON he.halaqa_id = h.id 
       WHERE he.student_id = s.id AND he.is_active = true LIMIT 1) as halaqa_name
      FROM students s WHERE 1=1`;

        const params = [];

        // البحث بالاسم
        if (search) {
            query += ` AND s.full_name LIKE ?`;
            params.push(`%${search}%`);
        }

        // الفلترة حسب المرحلة الدراسية
        if (academic_level) {
            query += ` AND s.academic_level = ?`;
            params.push(academic_level);
        }

        query += ` ORDER BY s.registration_date DESC, s.full_name ASC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [students] = await db.query(query, params);

        // عدد الطلاب الكلي
        let countQuery = `SELECT COUNT(*) as total FROM students WHERE 1=1`;
        const countParams = [];

        if (search) {
            countQuery += ` AND full_name LIKE ?`;
            countParams.push(`%${search}%`);
        }

        if (academic_level) {
            countQuery += ` AND academic_level = ?`;
            countParams.push(academic_level);
        }

        const [countResult] = await db.query(countQuery, countParams);

        res.json({
            success: true,
            data: students,
            pagination: {
                total: countResult[0].total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(countResult[0].total / limit)
            }
        });
    } catch (error) {
        console.error('Get all students error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات الطلاب'
        });
    }
};

// الحصول على طالب واحد مع كل التفاصيل
exports.getStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const [students] = await db.query(`SELECT * FROM students WHERE id = ?`, [id]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'الطالب غير موجود'
            });
        }

        // الحصول على الحلقة
        const [halaqat] = await db.query(
            `SELECT h.*, t.full_name as teacher_name
       FROM halaqa_enrollments he
       LEFT JOIN halaqat h ON he.halaqa_id = h.id
       LEFT JOIN teachers t ON h.teacher_id = t.id
       WHERE he.student_id = ? AND he.is_active = true`,
            [id]
        );

        // الحصول على آخر سجلات الحفظ
        const [memorization] = await db.query(
            `SELECT m.*, 
        s1.name as start_surah_name, 
        s2.name as end_surah_name,
        t.full_name as reviewer_name
       FROM memorization m
       LEFT JOIN surahs s1 ON m.start_surah_id = s1.id
       LEFT JOIN surahs s2 ON m.end_surah_id = s2.id
       LEFT JOIN teachers t ON m.reviewed_by = t.id
       WHERE m.student_id = ?
       ORDER BY m.year DESC, m.month DESC
       LIMIT 10`,
            [id]
        );

        // الحصول على إحصائيات الحضور
        const [attendanceStats] = await db.query(
            `SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_days
       FROM attendances
       WHERE student_id = ?`,
            [id]
        );

        // الحصول على المخالفات
        const [violations] = await db.query(
            `SELECT * FROM violations 
       WHERE student_id = ? 
       ORDER BY violation_date DESC 
       LIMIT 10`,
            [id]
        );

        res.json({
            success: true,
            data: {
                student: students[0],
                halaqa: halaqat[0] || null,
                memorization,
                attendance: attendanceStats[0],
                violations
            }
        });
    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات الطالب'
        });
    }
};

// إضافة طالب جديد
exports.createStudent = async (req, res) => {
    try {
        const {
            identification_number,
            registration_date,
            full_name,
            birth_date,
            birth_place,
            permanent_address,
            academic_level,
            hifz_amount,
            phone,
            photo_url,
            guardian_name,
            guardian_relationship,
            guardian_phone,
            guardian_job,
            recommender_name_1,
            recommender_job_1,
            recommender_name_2,
            recommender_job_2
        } = req.body;

        const [result] = await db.query(
            `INSERT INTO students (
        identification_number, registration_date, full_name, birth_date, birth_place, permanent_address,
        academic_level, hifz_amount, phone, photo_url,
        guardian_name, guardian_relationship, guardian_phone, guardian_job,
        recommender_name_1, recommender_job_1, recommender_name_2, recommender_job_2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                identification_number || null,
                registration_date,
                full_name,
                birth_date || null,
                birth_place || null,
                permanent_address || null,
                academic_level || null,
                hifz_amount || null,
                phone || null,
                photo_url || null,
                guardian_name || null,
                guardian_relationship || null,
                guardian_phone || null,
                guardian_job || null,
                recommender_name_1 || null,
                recommender_job_1 || null,
                recommender_name_2 || null,
                recommender_job_2 || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'تم إضافة الطالب بنجاح',
            data: {
                id: result.insertId,
                full_name
            }
        });
    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إضافة الطالب',
            error: error.message // مؤقتاً للتشخيص
        });
    }
};

// تحديث بيانات طالب
exports.updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updateData), id];

        const [result] = await db.query(
            `UPDATE students SET ${fields} WHERE id = ?`,
            values
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'الطالب غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم تحديث بيانات الطالب بنجاح'
        });
    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث بيانات الطالب'
        });
    }
};

// حذف طالب
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(`DELETE FROM students WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'الطالب غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف الطالب بنجاح'
        });
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف الطالب'
        });
    }
};
