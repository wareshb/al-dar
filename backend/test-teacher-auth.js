const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testTeacherAuth() {
    let connection;
    try {
        console.log('Connecting to database...');
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Testing Login with waresh...');
        const username = 'waresh';
        const password = 'waresh_password';

        console.log('\nTesting Login...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const loginData = await loginRes.json();

        if (loginData.success) {
            console.log('✅ Login successful for waresh!');
            const token = loginData.token;
            console.log('Token received.');
        } else {
            console.log('❌ Login FAILED for waresh!', loginData.message);
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

testTeacherAuth();
