const db = require('../config/db');
const dayjs = require('dayjs');

// الحصول على جميع الطلاب مع إمكانية البحث والفلترة
exports.getAllStudents = async (req, res) => {
    try {
        const { search, academic_level, halaqa_id, is_active, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let query = `SELECT s.*, 
      (SELECT h.name FROM halaqa_enrollments he 
       LEFT JOIN halaqat h ON he.halaqa_id = h.id 
       WHERE he.student_id = s.id AND he.is_active = true LIMIT 1) as halaqa_name,
      (SELECT he.halaqa_id FROM halaqa_enrollments he 
       WHERE he.student_id = s.id AND he.is_active = true LIMIT 1) as halaqa_id
      FROM students s WHERE 1=1`;

        const params = [];

        // إذا كان المستخدم معلماً، أظهر فقط طلاب حلقاته
        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            query += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he2 
                JOIN halaqat h2 ON he2.halaqa_id = h2.id 
                WHERE he2.student_id = s.id AND h2.teacher_id = ? AND he2.is_active = true
            )`;
            params.push(req.user.teacher_id);
        }

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

        // الفلترة حسب الحلقة
        if (halaqa_id) {
            query += ` AND EXISTS (SELECT 1 FROM halaqa_enrollments he WHERE he.student_id = s.id AND he.halaqa_id = ? AND he.is_active = true)`;
            params.push(halaqa_id);
        }

        // الفلترة حسب الحالة
        if (is_active !== undefined && is_active !== '') {
            query += ` AND s.is_active = ?`;
            params.push(is_active === 'true' || is_active === true || is_active === '1' ? 1 : 0);
        }

        query += ` ORDER BY s.registration_date DESC, s.full_name ASC LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), parseInt(offset));

        const [students] = await db.query(query, params);

        // عدد الطلاب الكلي
        let countQuery = `SELECT COUNT(*) as total FROM students s WHERE 1=1`;
        const countParams = [];

        // إذا كان المستخدم معلماً، أظهر فقط عدد طلاب حلقاته
        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            countQuery += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he2 
                JOIN halaqat h2 ON he2.halaqa_id = h2.id 
                WHERE he2.student_id = s.id AND h2.teacher_id = ? AND he2.is_active = true
            )`;
            countParams.push(req.user.teacher_id);
        }

        if (search) {
            countQuery += ` AND s.full_name LIKE ?`;
            countParams.push(`%${search}%`);
        }

        if (academic_level) {
            countQuery += ` AND s.academic_level = ?`;
            countParams.push(academic_level);
        }

        if (halaqa_id) {
            countQuery += ` AND EXISTS (SELECT 1 FROM halaqa_enrollments he WHERE he.student_id = s.id AND he.halaqa_id = ? AND he.is_active = true)`;
            countParams.push(halaqa_id);
        }

        if (is_active !== undefined && is_active !== '') {
            countQuery += ` AND s.is_active = ?`;
            countParams.push(is_active === 'true' || is_active === true || is_active === '1' ? 1 : 0);
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

// الحصول على المعرف التالي للطالب
exports.getNextId = async (req, res) => {
    try {
        const year = dayjs().year();
        const prefix = year.toString();

        const [rows] = await db.query(
            `SELECT identification_number FROM students 
             WHERE identification_number LIKE ? 
             ORDER BY identification_number DESC LIMIT 1`,
            [`${prefix}%`]
        );

        let nextNumber = 1;
        if (rows.length > 0 && rows[0].identification_number) {
            const lastId = rows[0].identification_number;
            const lastNumber = parseInt(lastId.substring(4));
            if (!isNaN(lastNumber)) {
                nextNumber = lastNumber + 1;
            }
        }

        const nextId = `${prefix}${nextNumber.toString().padStart(3, '0')}`;

        res.json({
            success: true,
            nextId
        });
    } catch (error) {
        console.error('Get next ID error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء توليد المعرف التالي'
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
        identification_number, registration_date, full_name, gender, birth_date, birth_place, 
        permanent_address, address, academic_level, hifz_amount, phone, is_active, photo_url,
        guardian_name, guardian_relationship, guardian_phone, guardian_job,
        recommender_name_1, recommender_job_1, recommender_name_2, recommender_job_2
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                identification_number || null,
                registration_date,
                full_name,
                req.body.gender || 'male',
                birth_date || null,
                birth_place || null,
                permanent_address || null,
                req.body.address || null,
                academic_level || null,
                hifz_amount || null,
                phone || null,
                req.body.is_active !== undefined ? (req.body.is_active ? 1 : 0) : 1,
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

        const student_id = result.insertId;

        // إذا تم تزويد معرف الحلقة، قم بتسجيل الطالب فيها
        if (req.body.halaqa_id) {
            await db.query(
                `INSERT INTO halaqa_enrollments (halaqa_id, student_id, enroll_date, is_active) 
                 VALUES (?, ?, ?, 1)`,
                [req.body.halaqa_id, student_id, registration_date]
            );
        }

        res.status(201).json({
            success: true,
            message: 'تم إضافة الطالب بنجاح',
            data: {
                id: student_id,
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
        const { halaqa_id, ...updateData } = req.body;

        if (Object.keys(updateData).length > 0) {
            const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
            const values = [...Object.values(updateData), id];

            const [result] = await db.query(
                `UPDATE students SET ${fields} WHERE id = ?`,
                values
            );

            if (result.affectedRows === 0 && !halaqa_id) {
                return res.status(404).json({
                    success: false,
                    message: 'الطالب غير موجود'
                });
            }
        }

        // تحديث الحلقة إذا تغيرت
        if (halaqa_id !== undefined) {
            // إيقاف التسجيل الحالي
            await db.query(
                `UPDATE halaqa_enrollments SET is_active = 0 WHERE student_id = ? AND is_active = 1`,
                [id]
            );

            // إضافة تسجيل جديد إذا تم اختيار حلقة
            if (halaqa_id) {
                await db.query(
                    `INSERT INTO halaqa_enrollments (halaqa_id, student_id, enroll_date, is_active) 
                     VALUES (?, ?, CURDATE(), 1)`,
                    [halaqa_id, id]
                );
            }
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
