const db = require('../config/db');

// إحصائيات لوحة التحكم
exports.getDashboardStats = async (req, res) => {
    try {
        // عدد الطلاب
        let studentsCountQuery = `SELECT COUNT(*) as count FROM students s WHERE 1=1`;
        let teachersCountQuery = `SELECT COUNT(*) as count FROM teachers WHERE 1=1`;
        let halaqatCountQuery = `SELECT COUNT(*) as count FROM halaqat h WHERE 1=1`;
        let activeStudentsQuery = `SELECT COUNT(DISTINCT student_id) as count FROM halaqa_enrollments he WHERE he.is_active = true`;

        const params = [];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            const teacherFilter = ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he2 
                JOIN halaqat h2 ON he2.halaqa_id = h2.id 
                WHERE he2.student_id = s.id AND h2.teacher_id = ? AND he2.is_active = true
            )`;
            studentsCountQuery += teacherFilter;

            halaqatCountQuery += ` AND h.teacher_id = ?`;

            activeStudentsQuery += ` AND EXISTS (
                SELECT 1 FROM halaqat h3 WHERE h3.id = he.halaqa_id AND h3.teacher_id = ?
            )`;

            params.push(req.user.teacher_id);
        }

        const [studentsCount] = await db.query(studentsCountQuery, params);
        const [teachersCount] = await db.query(teachersCountQuery);
        const [halaqatCount] = await db.query(halaqatCountQuery, params);
        const [activeStudents] = await db.query(activeStudentsQuery, params);

        // نسبة الحضور اليوم
        const today = new Date().toISOString().split('T')[0];
        let todayAttendanceQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
            FROM attendances a
            WHERE a.attendance_date = ?
        `;
        const attendanceParams = [today];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            todayAttendanceQuery += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he 
                JOIN halaqat h ON he.halaqa_id = h.id 
                WHERE he.student_id = a.student_id AND h.teacher_id = ? AND he.is_active = true
            )`;
            attendanceParams.push(req.user.teacher_id);
        }

        const [todayAttendance] = await db.query(todayAttendanceQuery, attendanceParams);

        // نسبة الحضور هذا الشهر
        let monthAttendanceQuery = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
            FROM attendances a
            WHERE YEAR(a.attendance_date) = YEAR(CURDATE()) 
            AND MONTH(a.attendance_date) = MONTH(CURDATE())
        `;
        const monthParams = [];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            monthAttendanceQuery += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he 
                JOIN halaqat h ON he.halaqa_id = h.id 
                WHERE he.student_id = a.student_id AND h.teacher_id = ? AND he.is_active = true
            )`;
            monthParams.push(req.user.teacher_id);
        }

        const [monthAttendance] = await db.query(monthAttendanceQuery, monthParams);

        // آخر المسجلين
        let recentStudentsQuery = `SELECT s.id, s.full_name, s.registration_date, s.phone FROM students s WHERE 1=1 `;
        const recentParams = [];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            recentStudentsQuery += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he 
                JOIN halaqat h ON he.halaqa_id = h.id 
                WHERE he.student_id = s.id AND h.teacher_id = ? AND he.is_active = true
            )`;
            recentParams.push(req.user.teacher_id);
        }

        recentStudentsQuery += ` ORDER BY s.registration_date DESC LIMIT 5`;
        const [recentStudents] = await db.query(recentStudentsQuery, recentParams);

        // آخر المخالفات
        let recentViolationsQuery = `
            SELECT v.*, s.full_name as student_name
            FROM violations v
            LEFT JOIN students s ON v.student_id = s.id
            WHERE 1=1
        `;
        const violationParams = [];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            recentViolationsQuery += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he 
                JOIN halaqat h ON he.halaqa_id = h.id 
                WHERE he.student_id = v.student_id AND h.teacher_id = ? AND he.is_active = true
            )`;
            violationParams.push(req.user.teacher_id);
        }

        recentViolationsQuery += ` ORDER BY v.violation_date DESC LIMIT 5`;
        const [recentViolations] = await db.query(recentViolationsQuery, violationParams);

        // توزيع الطلاب على الحلقات
        let halaqatDistQuery = `
            SELECT h.name, 
                COUNT(he.student_id) as students_count,
                t.full_name as teacher_name
            FROM halaqat h
            LEFT JOIN halaqa_enrollments he ON h.id = he.halaqa_id AND he.is_active = true
            LEFT JOIN teachers t ON h.teacher_id = t.id
        `;
        const distParams = [];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            halaqatDistQuery += ` WHERE h.teacher_id = ?`;
            distParams.push(req.user.teacher_id);
        }

        halaqatDistQuery += ` GROUP BY h.id, h.name, t.full_name ORDER BY students_count DESC`;
        const [halaqatDistribution] = await db.query(halaqatDistQuery, distParams);

        res.json({
            success: true,
            data: {
                counts: {
                    students: studentsCount[0].count,
                    teachers: teachersCount[0].count,
                    halaqat: halaqatCount[0].count,
                    activeStudents: activeStudents[0].count
                },
                attendance: {
                    today: {
                        total: todayAttendance[0].total,
                        present: todayAttendance[0].present,
                        percentage: todayAttendance[0].total > 0
                            ? ((todayAttendance[0].present / todayAttendance[0].total) * 100).toFixed(2)
                            : 0
                    },
                    thisMonth: {
                        total: monthAttendance[0].total,
                        present: monthAttendance[0].present,
                        percentage: monthAttendance[0].total > 0
                            ? ((monthAttendance[0].present / monthAttendance[0].total) * 100).toFixed(2)
                            : 0
                    }
                },
                recentStudents,
                recentViolations,
                halaqatDistribution
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب الإحصائيات'
        });
    }
};

// بيانات رسم بياني للحضور (آخر 30 يوم)
exports.getAttendanceChart = async (req, res) => {
    try {
        let query = `SELECT 
                    attendance_date,
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
                   FROM attendances a
                   WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`;
        const params = [];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            query += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he 
                JOIN halaqat h ON he.halaqa_id = h.id 
                WHERE he.student_id = a.student_id AND h.teacher_id = ? AND he.is_active = true
            )`;
            params.push(req.user.teacher_id);
        }

        query += ` GROUP BY attendance_date ORDER BY attendance_date ASC`;

        const [data] = await db.query(query, params);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get attendance chart error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات الحضور'
        });
    }
};

// بيانات رسم بياني للحفظ (آخر 6 أشهر)
exports.getMemorizationChart = async (req, res) => {
    try {
        let query = `SELECT 
                    year,
                    month,
                    COUNT(*) as records_count,
                    AVG(quality_rating) as avg_quality
                   FROM memorization m
                   WHERE ((year = YEAR(CURDATE()) AND month >= MONTH(CURDATE()) - 5)
                      OR (year = YEAR(CURDATE()) - 1 AND month > 12 - (6 - MONTH(CURDATE()))))`;
        const params = [];

        if (req.user && req.user.role_name === 'teacher' && req.user.teacher_id) {
            query += ` AND EXISTS (
                SELECT 1 FROM halaqa_enrollments he 
                JOIN halaqat h ON he.halaqa_id = h.id 
                WHERE he.student_id = m.student_id AND h.teacher_id = ? AND he.is_active = true
            )`;
            params.push(req.user.teacher_id);
        }

        query += ` GROUP BY year, month ORDER BY year ASC, month ASC`;

        const [data] = await db.query(query, params);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.error('Get memorization chart error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء جلب بيانات الحفظ'
        });
    }
};
