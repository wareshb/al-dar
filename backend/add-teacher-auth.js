const db = require('./config/db');

async function addTeacherAuth() {
    try {
        console.log('--- Updating teachers table for authentication ---');

        const queries = [
            'ALTER TABLE teachers ADD COLUMN username VARCHAR(50) AFTER full_name',
            'ALTER TABLE teachers ADD COLUMN password VARCHAR(255) AFTER username',
            'ALTER TABLE teachers ADD UNIQUE INDEX idx_teacher_username (username)'
        ];

        for (const query of queries) {
            try {
                await db.query(query);
                console.log(`✅ Executed: ${query}`);
            } catch (err) {
                if (err.code === 'ER_DUP_COLUMN_NAME' || err.code === 'ER_DUP_KEYNAME') {
                    console.log(`ℹ️ Already exists, skipping: ${query.substring(0, 50)}...`);
                } else {
                    console.error(`❌ Error executing query: ${query}`);
                    throw err;
                }
            }
        }

        console.log('✅ Teachers table updated successfully with auth fields!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        process.exit(1);
    }
}

addTeacherAuth();
