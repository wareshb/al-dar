const db = require('./config/db');

async function checkUsers() {
    try {
        console.log('--- Checking Roles ---');
        const [roles] = await db.query('SELECT * FROM roles');
        console.table(roles);

        console.log('\n--- Checking Admin User ---');
        const [users] = await db.query('SELECT id, username, full_name, role_id, is_active FROM users WHERE username = ?', ['admin']);
        if (users.length > 0) {
            console.table(users);
            console.log('User status is_active:', users[0].is_active);
        } else {
            console.log('❌ User "admin" NOT FOUND in database!');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking database:', error.message);
        process.exit(1);
    }
}

checkUsers();
