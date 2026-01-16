const db = require('../config/db');
const bcrypt = require('bcryptjs');

// الحصول على جميع المعلمين
exports.getAllTeachers = async (req, res) => {
    try {
        const [teachers] = await db.query(
            `SELECT * FROM teachers ORDER BY full_name ASC`
        );

        res.json({
            success: true,
            data: teachers,
            count: teachers.length
        });
    } catch (error) {
        console.error('Get all teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات المعلمين'
        });
    }
};

// الحصول على معلم واحد
exports.getTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        const [teachers] = await db.query(
            `SELECT t.*, 
        (SELECT COUNT(*) FROM halaqat WHERE teacher_id = t.id) as halaqat_count
       FROM teachers t 
       WHERE t.id = ?`,
            [id]
        );

        if (teachers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'المعلم غير موجود'
            });
        }

        res.json({
            success: true,
            data: teachers[0]
        });
    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات المعلم'
        });
    }
};

// إضافة معلم جديد
exports.createTeacher = async (req, res) => {
    try {
        const {
            full_name, username, password, birth_date, birth_place, phone, photo_url,
            email, specialization, is_mujaz, current_job, qualification,
            staff_type, address, is_active
        } = req.body;

        let hashedPassword = null;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10);
        }

        const [result] = await db.query(
            `INSERT INTO teachers (
                full_name, username, password, birth_date, birth_place, phone, photo_url,
                email, specialization, is_mujaz, current_job, qualification,
                staff_type, address, is_active
            ) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                full_name, username || null, hashedPassword, birth_date || null, birth_place || null, phone || null, photo_url || null,
                email || null, specialization || null, is_mujaz || false, current_job || null, qualification || null,
                staff_type || 'teacher', address || null, is_active !== undefined ? is_active : true
            ]
        );

        res.status(201).json({
            success: true,
            message: 'تم إضافة المعلم بنجاح',
            data: {
                id: result.insertId,
                full_name,
                birth_date,
                birth_place,
                phone,
                photo_url
            }
        });
    } catch (error) {
        console.error('Create teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إضافة المعلم'
        });
    }
};

// تحديث بيانات معلم
exports.updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            full_name, username, password, birth_date, birth_place, phone, photo_url,
            email, specialization, is_mujaz, current_job, qualification,
            staff_type, address, is_active
        } = req.body;

        let updateQuery = `UPDATE teachers 
                           SET full_name = ?, username = ?, birth_date = ?, birth_place = ?, phone = ?, photo_url = ?,
                               email = ?, specialization = ?, is_mujaz = ?, current_job = ?, qualification = ?,
                               staff_type = ?, address = ?, is_active = ?`;
        let params = [
            full_name, username || null, birth_date || null, birth_place || null, phone || null, photo_url || null,
            email || null, specialization || null, is_mujaz || false, current_job || null, qualification || null,
            staff_type || 'teacher', address || null, is_active !== undefined ? is_active : true
        ];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateQuery = `UPDATE teachers 
                           SET full_name = ?, username = ?, password = ?, birth_date = ?, birth_place = ?, phone = ?, photo_url = ?,
                               email = ?, specialization = ?, is_mujaz = ?, current_job = ?, qualification = ?,
                               staff_type = ?, address = ?, is_active = ?`;
            params = [
                full_name, username || null, hashedPassword, birth_date || null, birth_place || null, phone || null, photo_url || null,
                email || null, specialization || null, is_mujaz || false, current_job || null, qualification || null,
                staff_type || 'teacher', address || null, is_active !== undefined ? is_active : true
            ];
        }

        updateQuery += ` WHERE id = ?`;
        params.push(id);

        const [result] = await db.query(updateQuery, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'المعلم غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم تحديث بيانات المعلم بنجاح'
        });
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء تحديث بيانات المعلم'
        });
    }
};

// حذف معلم
exports.deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;

        // التحقق من وجود حلقات مرتبطة بالمعلم
        const [halaqat] = await db.query(
            `SELECT COUNT(*) as count FROM halaqat WHERE teacher_id = ?`,
            [id]
        );

        if (halaqat[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'لا يمكن حذف المعلم لأنه مرتبط بحلقات. يرجى حذف الحلقات أولاً أو تعيين معلم آخر'
            });
        }

        const [result] = await db.query(`DELETE FROM teachers WHERE id = ?`, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'المعلم غير موجود'
            });
        }

        res.json({
            success: true,
            message: 'تم حذف المعلم بنجاح'
        });
    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء حذف المعلم'
        });
    }
};

// الحصول على حلقات المعلم
exports.getTeacherHalaqat = async (req, res) => {
    try {
        const { id } = req.params;

        const [halaqat] = await db.query(
            `SELECT h.*,
        (SELECT COUNT(*) FROM halaqa_enrollments WHERE halaqa_id = h.id AND is_active = true) as students_count
       FROM halaqat h
       WHERE h.teacher_id = ?
       ORDER BY h.name ASC`,
            [id]
        );

        res.json({
            success: true,
            data: halaqat,
            count: halaqat.length
        });
    } catch (error) {
        console.error('Get teacher halaqat error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب حلقات المعلم'
        });
    }
};
