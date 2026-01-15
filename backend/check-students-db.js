const db = require('./config/db');

async function checkTable() {
    try {
        const [columns] = await db.query('DESCRIBE students');
        console.log('Columns in students table:');
        columns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error checking table:', error.message);
        process.exit(1);
    }
}

checkTable();
