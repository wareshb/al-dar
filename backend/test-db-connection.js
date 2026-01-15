const promisePool = require('./config/db');

async function testConnection() {
    try {
        const [rows] = await promisePool.query('SELECT 1 + 1 AS result');
        console.log('--- Database Connection Test ---');
        console.log('✅ Connection successful!');
        console.log('Result of SELECT 1 + 1:', rows[0].result);
        process.exit(0);
    } catch (error) {
        console.error('--- Database Connection Test ---');
        console.error('❌ Connection failed!');
        console.error('Error detail:', error.message);
        process.exit(1);
    }
}

testConnection();
