const db = require('../config/db');

// إحصائيات لوحة التحكم
exports.getDashboardStats = async (req, res) => {
    try {
        // عدد الطلاب
        const [studentsCount] = await db.query(`SELECT COUNT(*) as count FROM students`);

        // عدد المعلمين
        const [teachersCount] = await db.query(`SELECT COUNT(*) as count FROM teachers`);

        // عدد الحلقات
        const [halaqatCount] = await db.query(`SELECT COUNT(*) as count FROM halaqat`);

        // عدد الطلاب النشطين في الحلقات
        const [activeStudents] = await db.query(
            `SELECT COUNT(DISTINCT student_id) as count 
       FROM halaqa_enrollments 
       WHERE is_active = true`
        );

        // نسبة الحضور اليوم
        const today = new Date().toISOString().split('T')[0];
        const [todayAttendance] = await db.query(
            `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendances 
       WHERE attendance_date = ?`,
            [today]
        );

        // نسبة الحضور هذا الشهر
        const [monthAttendance] = await db.query(
            `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present
       FROM attendances 
       WHERE YEAR(attendance_date) = YEAR(CURDATE()) 
       AND MONTH(attendance_date) = MONTH(CURDATE())`
        );

        // آخر المسجلين
        const [recentStudents] = await db.query(
            `SELECT id, full_name, registration_date, phone 
       FROM students 
       ORDER BY registration_date DESC 
       LIMIT 5`
        );

        // آخر المخالفات
        const [recentViolations] = await db.query(
            `SELECT v.*, s.full_name as student_name
       FROM violations v
       LEFT JOIN students s ON v.student_id = s.id
       ORDER BY v.violation_date DESC 
       LIMIT 5`
        );

        // توزيع الطلاب على الحلقات
        const [halaqatDistribution] = await db.query(
            `SELECT h.name, 
        COUNT(he.student_id) as students_count,
        t.full_name as teacher_name
       FROM halaqat h
       LEFT JOIN halaqa_enrollments he ON h.id = he.halaqa_id AND he.is_active = true
       LEFT JOIN teachers t ON h.teacher_id = t.id
       GROUP BY h.id, h.name, t.full_name
       ORDER BY students_count DESC`
        );

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
        const [data] = await db.query(
            `SELECT 
        attendance_date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent
       FROM attendances
       WHERE attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY attendance_date
       ORDER BY attendance_date ASC`
        );

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
        const [data] = await db.query(
            `SELECT 
        year,
        month,
        COUNT(*) as records_count,
        AVG(quality_rating) as avg_quality
       FROM memorization
       WHERE (year = YEAR(CURDATE()) AND month >= MONTH(CURDATE()) - 5)
          OR (year = YEAR(CURDATE()) - 1 AND month > 12 - (6 - MONTH(CURDATE())))
       GROUP BY year, month
       ORDER BY year ASC, month ASC`
        );

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
