const mysql = require('mysql2');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// إنشاء Connection Pool لأداء أفضل
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// تحويل إلى Promise-based API
const promisePool = pool.promise();

// اختبار الاتصال
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err.message);
    return;
  }
  console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  connection.release();
});

module.exports = promisePool;
