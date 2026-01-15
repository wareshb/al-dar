const db = require('../config/db');

// تقرير شامل عن جميع الطلاب
exports.getStudentsReport = async (req, res) => {
    try {
        const [students] = await db.query(
            `SELECT 
        s.*,
        h.name as halaqa_name,
        t.full_name as teacher_name,
        (SELECT COUNT(*) FROM attendances a WHERE a.student_id = s.id AND a.status = 'present') as present_count,
        (SELECT COUNT(*) FROM attendances a WHERE a.student_id = s.id AND a.status = 'absent') as absent_count,
        (SELECT COUNT(*) FROM memorization m WHERE m.student_id = s.id) as memorization_count,
        (SELECT COUNT(*) FROM violations v WHERE v.student_id = s.id) as violations_count
       FROM students s
       LEFT JOIN halaqa_enrollments he ON s.id = he.student_id AND he.is_active = true
       LEFT JOIN halaqat h ON he.halaqa_id = h.id
       LEFT JOIN teachers t ON h.teacher_id = t.id
       ORDER BY s.full_name ASC`
        );

        res.json({
            success: true,
            data: students,
            count: students.length
        });
    } catch (error) {
        console.error('Get students report error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء التقرير'
        });
    }
};

// تقرير الحضور
exports.getAttendanceReport = async (req, res) => {
    try {
        const { start_date, end_date, halaqa_id } = req.query;

        if (!start_date || !end_date) {
            return res.status(400).json({
                success: false,
                message: 'يرجى تحديد تاريخ البداية والنهاية'
            });
        }

        let query = `
      SELECT 
        s.id as student_id,
        s.full_name as student_name,
        h.name as halaqa_name,
        COUNT(a.id) as total_days,
        SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) as present_days,
        SUM(CASE WHEN a.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
        ROUND((SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) / COUNT(a.id)) * 100, 2) as attendance_percentage
      FROM students s
      LEFT JOIN attendances a ON s.id = a.student_id AND a.attendance_date BETWEEN ? AND ?
      LEFT JOIN halaqa_enrollments he ON s.id = he.student_id AND he.is_active = true
      LEFT JOIN halaqat h ON he.halaqa_id = h.id
    `;

        const params = [start_date, end_date];

        if (halaqa_id) {
            query += ` WHERE h.id = ?`;
            params.push(halaqa_id);
        }

        query += ` GROUP BY s.id, s.full_name, h.name
               HAVING total_days > 0
               ORDER BY s.full_name ASC`;

        const [report] = await db.query(query, params);

        res.json({
            success: true,
            data: report,
            count: report.length,
            period: { start_date, end_date }
        });
    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء تقرير الحضور'
        });
    }
};

// تقرير الحفظ
exports.getMemorizationReport = async (req, res) => {
    try {
        const { start_month, start_year, end_month, end_year } = req.query;

        let query = `
      SELECT 
        s.id as student_id,
        s.full_name as student_name,
        h.name as halaqa_name,
        COUNT(m.id) as total_records,
        AVG(m.quality_rating) as avg_quality,
        GROUP_CONCAT(
          CONCAT(sr1.name, ' (', m.start_ayah, ') - ', sr2.name, ' (', m.end_ayah, ')')
          ORDER BY m.year DESC, m.month DESC
          SEPARATOR ' | '
        ) as memorization_history
      FROM students s
      LEFT JOIN memorization m ON s.id = m.student_id
      LEFT JOIN surahs sr1 ON m.start_surah_id = sr1.id
      LEFT JOIN surahs sr2 ON m.end_surah_id = sr2.id
      LEFT JOIN halaqa_enrollments he ON s.id = he.student_id AND he.is_active = true
      LEFT JOIN halaqat h ON he.halaqa_id = h.id
    `;

        const params = [];

        if (start_month && start_year && end_month && end_year) {
            query += ` WHERE (m.year > ? OR (m.year = ? AND m.month >= ?))
                 AND (m.year < ? OR (m.year = ? AND m.month <= ?))`;
            params.push(start_year, start_year, start_month, end_year, end_year, end_month);
        }

        query += ` GROUP BY s.id, s.full_name, h.name
               HAVING total_records > 0
               ORDER BY total_records DESC, avg_quality DESC`;

        const [report] = await db.query(query, params);

        res.json({
            success: true,
            data: report,
            count: report.length
        });
    } catch (error) {
        console.error('Get memorization report error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناءإنشاء تقرير الحفظ'
        });
    }
};

// تقرير الحلقات
exports.getHalaqatReport = async (req, res) => {
    try {
        const [report] = await db.query(
            `SELECT 
        h.id,
        h.name,
        t.full_name as teacher_name,
        t.phone as teacher_phone,
        COUNT(DISTINCT he.student_id) as students_count,
        GROUP_CONCAT(DISTINCT
          CONCAT(
            CASE hs.day_of_week
              WHEN 0 THEN 'الأحد'
              WHEN 1 THEN 'الاثنين'
              WHEN 2 THEN 'الثلاثاء'
              WHEN 3 THEN 'الأربعاء'
              WHEN 4 THEN 'الخميس'
              WHEN 5 THEN 'الجمعة'
              WHEN 6 THEN 'السبت'
            END,
            ' ', TIME_FORMAT(hs.start_time, '%H:%i'), '-', TIME_FORMAT(hs.end_time, '%H:%i')
          )
          SEPARATOR ', '
        ) as schedule
       FROM halaqat h
       LEFT JOIN teachers t ON h.teacher_id = t.id
       LEFT JOIN halaqa_enrollments he ON h.id = he.halaqa_id AND he.is_active = true
       LEFT JOIN halaqa_schedules hs ON h.id = hs.halaqa_id
       GROUP BY h.id, h.name, t.full_name, t.phone
       ORDER BY h.name ASC`
        );

        res.json({
            success: true,
            data: report,
            count: report.length
        });
    } catch (error) {
        console.error('Get halaqat report error:', error);
        res.status(500).json({
            success: false,
            message: 'حدث خطأ أثناء إنشاء تقرير الحلقات'
        });
    }
};
