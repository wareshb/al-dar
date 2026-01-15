const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// استيراد المسارات
const authRoutes = require('./routes/auth.routes');
const teachersRoutes = require('./routes/teachers.routes');
const studentsRoutes = require('./routes/students.routes');
const halaqatRoutes = require('./routes/halaqat.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const staffAttendanceRoutes = require('./routes/staffAttendance.routes');
const memorizationRoutes = require('./routes/memorization.routes');
const violationsRoutes = require('./routes/violations.routes');
const reportsRoutes = require('./routes/reports.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// خدمة الملفات الثابتة (الصور المرفوعة)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// المسارات الرئيسية
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teachersRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/halaqat', halaqatRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/staff-attendance', staffAttendanceRoutes);
app.use('/api/memorization', memorizationRoutes);
app.use('/api/violations', violationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// مسار الجذر
app.get('/', (req, res) => {
  res.json({
    message: 'مرحباً بكم في نظام دار البرهان لتعليم القرآن الكريم',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      teachers: '/api/teachers',
      students: '/api/students',
      halaqat: '/api/halaqat',
      attendance: '/api/attendance',
      staffAttendance: '/api/staff-attendance',
      memorization: '/api/memorization',
      violations: '/api/violations',
      reports: '/api/reports',
      dashboard: '/api/dashboard',
      upload: '/api/upload'
    }
  });
});

// معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
