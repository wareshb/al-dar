const db = require('./config/db');

async function updateTeachersTable() {
    try {
        console.log('--- Updating teachers table schema ---');

        const queries = [
            'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS email VARCHAR(150)',
            'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS specialization VARCHAR(150)',
            'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_mujaz BOOLEAN DEFAULT FALSE',
            'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS current_job VARCHAR(150)',
            'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS qualification VARCHAR(150)',
            'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS staff_type ENUM("teacher", "admin", "both") DEFAULT "teacher"',
            'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS address TEXT',
            'ALTER TABLE teachers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE'
        ];

        for (const query of queries) {
            try {
                await db.query(query);
                console.log(`✅ Executed: ${query.substring(0, 50)}...`);
            } catch (err) {
                if (err.code === 'ER_DUP_COLUMN_NAME') {
                    console.log(`ℹ️ Column already exists, skipping...`);
                } else {
                    throw err;
                }
            }
        }

        console.log('✅ Teachers table updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        process.exit(1);
    }
}

updateTeachersTable();
