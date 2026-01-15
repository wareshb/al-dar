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
        quality_rating, reviewed_by, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                student_id,
                month,
                year,
                start_surah_id || null,
                start_ayah || null,
                end_surah_id || null,
                end_ayah || null,
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

        const [memorization] = await db.query(
            `SELECT m.*, 
        s.full_name as student_name,
        s1.name as start_surah_name, 
        s2.name as end_surah_name,
        t.full_name as reviewer_name
       FROM memorization m
       LEFT JOIN students s ON m.student_id = s.id
       LEFT JOIN surahs s1 ON m.start_surah_id = s1.id
       LEFT JOIN surahs s2 ON m.end_surah_id = s2.id
       LEFT JOIN teachers t ON m.reviewed_by = t.id
       WHERE m.month = ? AND m.year = ?
       ORDER BY s.full_name ASC`,
            [month, year]
        );

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
