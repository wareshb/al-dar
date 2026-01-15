# نظام دار البرهان لتعليم القرآن الكريم

نظام إدارة شامل لدار تحفيظ القرآن الكريم.

## البنية التقنية

### Backend
- **Node.js + Express**: خادم API
- **MySQL**: قاعدة بيانات
- **JWT**: نظام المصادقة
- **Multer**: رفع الملفات

### Frontend
- **React + Vite**: واجهة المستخدم
- **Ant Design**: مكتبة المكونات
- **Axios**: طلبات API
- **React Router**: التوجيه

## التنصيب والتشغيل

### 1. إعداد قاعدة البيانات
```bash
# تشغيل ملف SQL
mysql -u root -p < database/dar_db_enhanced.sql
```

### 2. إعداد Backend
```bash
cd backend
npm install
npm run dev
```
الخادم سيعمل على: http://localhost:5000

### 3. إعداد Frontend
```bash
cd frontend
npm install
npm run dev
```
الواجهة ستعمل على: http://localhost:3000

## الحسابات الافتراضية

- **Username**: admin
- **Password**: admin123

## الميزات الرئيسية

✅ نظام مصادقة محكم (JWT)  
✅ إدارة المعلمين والطلاب  
✅ إدارة الحلقات وجداولها  
✅ نظام الحضور اليومي  
✅ متابعة حفظ القرآن الكريم  
✅ إدارة المخالفات  
✅ لوحة تحكم بالإحصائيات  
✅ تقارير شاملة  
✅ رفع الصور  
✅ واجهة عربية كاملة (RTL)

## هيكل المشروع

```
Dar_Qurain/
├── backend/           # خادم Node.js
│   ├── config/       # إعدادات الاتصال
│   ├── controllers/  # منطق الأعمال
│   ├── routes/       # مسارات API
│   ├── middleware/   # Middleware
│   └── server.js     # نقطة البداية
│
├── frontend/          # تطبيق React
│   ├── src/
│   │   ├── components/  # المكونات
│   │   ├── pages/       # الصفحات
│   │   ├── services/    # خدمات API
│   │   └── App.jsx      # المكون الرئيسي
│   └── package.json
│
└── database/          # ملفات SQL
    └── dar_db_enhanced.sql
```

## API Endpoints

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `GET /api/auth/me` - بيانات المستخدم الحالي
- `POST /api/auth/change-password` - تغيير كلمة المرور

### المعلمون
- `GET /api/teachers` - قائمة المعلمين
- `GET /api/teachers/:id` - تفاصيل معلم
- `POST /api/teachers` - إضافة معلم
- `PUT /api/teachers/:id` - تحديث معلم
- `DELETE /api/teachers/:id` - حذف معلم

### الطلاب
- `GET /api/students` - قائمة الطلاب
- `GET /api/students/:id` - تفاصيل طالب
- `POST /api/students` - إضافة طالب
- `PUT /api/students/:id` - تحديث طالب
- `DELETE /api/students/:id` - حذف طالب

### الحلقات
- `GET /api/halaqat` - قائمة الحلقات
- `GET /api/halaqat/:id` - تفاصيل حلقة
- `POST /api/halaqat` - إنشاء حلقة
- `PUT /api/halaqat/:id` - تحديث حلقة
- `DELETE /api/halaqat/:id` - حذف حلقة
- `POST /api/halaqat/:id/enroll` - إضافة طلاب
- `PUT /api/halaqat/:id/schedules` - تحديث جدول الحلقة

### الحضور
- `POST /api/attendance` - تسجيل الحضور
- `GET /api/attendance/date/:date` - حضور تاريخ معين
- `GET /api/attendance/student/:id` - سجل حضور طالب
- `GET /api/attendance/report/absent` - تقرير الغياب

### الحفظ
- `GET /api/memorization/surahs` - قائمة السور
- `POST /api/memorization` - تسجيل حفظ
- `GET /api/memorization/student/:id` - سجل حفظ طالب
- `GET /api/memorization/month` - حفظ شهر معين

### المخالفات
- `GET /api/violations` - قائمة المخالفات
- `POST /api/violations` - إضافة مخالفة
- `PUT /api/violations/:id` - تحديث مخالفة
- `DELETE /api/violations/:id` - حذف مخالفة

### لوحة التحكم
- `GET /api/dashboard/stats` - الإحصائيات
- `GET /api/dashboard/charts/attendance` - رسم بياني للحضور
- `GET /api/dashboard/charts/memorization` - رسم بياني للحفظ

### التقارير
- `GET /api/reports/students` - تقرير شامل للطلاب
- `GET /api/reports/attendance` - تقرير الحضور
- `GET /api/reports/memorization` - تقرير الحفظ
- `GET /api/reports/halaqat` - تقرير الحلقات

### رفع الملفات
- `POST /api/upload/image` - رفع صورة
- `GET /api/upload/:filename` - جلب صورة
- `DELETE /api/upload/:filename` - حذف صورة

## المساهمة

تم تطوير هذا النظام بواسطة **Antigravity AI** لخدمة دور تحفيظ القرآن الكريم.

## الترخيص

جميع الحقوق محفوظة © 2024 دار البرهان
