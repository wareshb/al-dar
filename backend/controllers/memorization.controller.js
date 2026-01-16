const db = require('../config/db');

// تسجيل إنجاز حفظ شهري
exports.recordMemorization = async (req, res) => {
    try {
        const {
            student_id,
            month,
            year,
            start_surah_id,
            start_ayah,
            end_surah_id,
            end_ayah,
            quality_rating,
            notes
        } = req.body;

        const reviewed_by = req.user.teacher_id || null;

        const [result] = await db.query(
            `INSERT INTO memorization 
       (student_id, month, year, start_surah_id, start_ayah, end_surah_id, end_ayah, 
        type, quality_rating, reviewed_by, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                student_id,
                month,
                year,
                start_surah_id || null,
                start_ayah || null,
                end_surah_id || null,
                end_ayah || null,
                req.body.type || 'memo',
                quality_rating || 5,
                reviewed_by,
                notes || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'تم تسجيل الإنجاز بنجاح',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('Record memorization error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تسجيل الإنجاز'
        });
    }
};

// الحصول على سجل حفظ طالب
exports.getStudentMemorization = async (req, res) => {
    try {
        const { studentId } = req.params;

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
       ORDER BY m.year DESC, m.month DESC`,
            [studentId]
        );

        res.json({
            success: true,
            data: memorization,
            count: memorization.length
        });
    } catch (error) {
        console.error('Get student memorization error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب سجل الحفظ'
        });
    }
};

// الحصول على سجلات الحفظ لشهر معين
exports.getMemorizationByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد الشهر والسنة'
            });
        }

        let query = `SELECT m.*, 
                    s.full_name as student_name,
                    s1.name as start_surah_name, 
                    s2.name as end_surah_name,
                    t.full_name as reviewer_name
                    FROM memorization m
                    LEFT JOIN students s ON m.student_id = s.id
                    LEFT JOIN surahs s1 ON m.start_surah_id = s1.id
                    LEFT JOIN surahs s2 ON m.end_surah_id = s2.id
                    LEFT JOIN teachers t ON m.reviewed_by = t.id
                    WHERE m.month = ? AND m.year = ?`;
        const params = [month, year];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            query += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he 
                JOIN halaqat h ON he.halaqa_id = h.id 
                WHERE he.student_id = m.student_id AND h.teacher_id = ? AND he.is_active = true
            )`;
            params.push(req.user.teacher_id);
        }

        query += ` ORDER BY s.full_name ASC`;

        const [memorization] = await db.query(query, params);

        res.json({
            success: true,
            data: memorization,
            count: memorization.length
        });
    } catch (error) {
        console.error('Get memorization by month error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب سجلات الحفظ'
        });
    }
};

// تحديث سجل حفظ
exports.updateMemorization = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            start_surah_id,
            start_ayah,
            end_surah_id,
            end_ayah,
            quality_rating,
            notes
        } = req.body;

        const [result] = await db.query(
            `UPDATE memorization 
       SET start_surah_id = ?, start_ayah = ?, end_surah_id = ?, end_ayah = ?,
           quality_rating = ?, notes = ?
       WHERE id = ?`,
            [
                start_surah_id || null,
                start_ayah || null,
                end_surah_id || null,
                end_ayah || null,
                quality_rating || 5,
                notes || null,
                id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'سجل الحفظ غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم تحديث سجل الحفظ بنجاح'
        });
    } catch (error) {
        console.error('Update memorization error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث سجل الحفظ'
        });
    }
};

// حذف سجل حفظ
exports.deleteMemorization = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await db.query(`DELETE FROM memorization WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'سجل الحفظ غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف سجل الحفظ بنجاح'
        });
    } catch (error) {
        console.error('Delete memorization error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف سجل الحفظ'
        });
    }
};

// الحصول على طلاب الحلقة مع آخر إنجاز لكل منهم
exports.getHalaqaStudentsWithProgress = async (req, res) => {
    try {
        const { halaqaId } = req.params;

        // إذا كان المستخدم معلماً، تحقق من ملكيته للحلقة
        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            const [halaqa] = await db.query('SELECT id FROM halaqat WHERE id = ? AND teacher_id = ?', [halaqaId, req.user.teacher_id]);
            if (halaqa.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'غير مصرح لك بالوصول لبيانات هذه الحلقة'
                });
            }
        }

        // الحصول على جميع الطلاب في الحلقة
        const [students] = await db.query(
            `SELECT s.id as student_id, s.full_name as student_name
             FROM halaqa_enrollments he
             JOIN students s ON he.student_id = s.id
             WHERE he.halaqa_id = ? AND he.is_active = true
             ORDER BY s.full_name ASC`,
            [halaqaId]
        );

        // الحصول على آخر إنجاز لكل طالب
        const studentIds = students.map(s => s.student_id);
        if (studentIds.length === 0) {
            return res.json({ success: true, data: [] });
        }

        const [latestRecords] = await db.query(
            `SELECT m.*, s1.name as start_surah_name, s2.name as end_surah_name
             FROM memorization m
             LEFT JOIN surahs s1 ON m.start_surah_id = s1.id
             LEFT JOIN surahs s2 ON m.end_surah_id = s2.id
             WHERE (m.student_id, m.year, m.month, m.id) IN (
                 SELECT student_id, year, month, MAX(id)
                 FROM memorization
                 WHERE (student_id, year, month) IN (
                     SELECT student_id, MAX(year), MAX(month)
                     FROM memorization
                     WHERE student_id IN (?)
                     GROUP BY student_id
                 )
                 GROUP BY student_id, year, month
             )
             ORDER BY m.year DESC, m.month DESC, m.id DESC`,
            [studentIds]
        );

        // دمج البيانات
        const progressMap = {};
        latestRecords.forEach(rec => {
            progressMap[rec.student_id] = rec;
        });

        const result = students.map(s => ({
            ...s,
            latest_memorization: progressMap[s.student_id] || null
        }));

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get halaqa students with progress error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات الطلاب'
        });
    }
};

// الحصول على قائمة السور
exports.getSurahs = async (req, res) => {
    try {
        const [surahs] = await db.query(`SELECT * FROM surahs ORDER BY order_no ASC`);

        res.json({
            success: true,
            data: surahs
        });
    } catch (error) {
        console.error('Get surahs error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب قائمة السور'
        });
    }
};
