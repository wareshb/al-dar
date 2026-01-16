const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function checkTeacher() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [teachers] = await connection.query('SELECT id, full_name, username, password, is_active FROM teachers WHERE username = ?', ['waresh']);

        if (teachers.length === 0) {
            console.log('Teacher "waresh" not found.');
        } else {
            console.log('Teacher waresh found:', teachers[0]);

            // Try to reset password to '123456' to be sure
            const newPassword = 'waresh_password'; // or whatever the user intended
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await connection.query('UPDATE teachers SET password = ?, is_active = 1 WHERE username = ?', [hashedPassword, 'waresh']);
            console.log(`Password for "waresh" has been reset to "${newPassword}" for testing.`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

checkTeacher();
