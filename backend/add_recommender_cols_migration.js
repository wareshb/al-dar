const db = require('./config/db');

const runMigration = async () => {
    try {
        console.log('Starting migration to add recommender contact columns...');

        // Check if columns exist first (optional but good practice, doing simple ADD COLUMN IF NOT EXISTS logic via catch or specific check is better but for this environment direct ADD is usually fine if we assume they don't exist)
        // MySQL 8.0+ supports IF NOT EXISTS in ADD COLUMN. MariaDB (likely used here) usually does too. 
        // We'll try to add them. If they exist, it might error, so we can wrap in try/catch or just let it fail if already done.

        const alterQuery = `
            ALTER TABLE students
            ADD COLUMN recommender_phone_1 varchar(20) DEFAULT NULL AFTER recommender_job_1,
            ADD COLUMN recommender_address_1 text DEFAULT NULL AFTER recommender_phone_1,
            ADD COLUMN recommender_phone_2 varchar(20) DEFAULT NULL AFTER recommender_job_2,
            ADD COLUMN recommender_address_2 text DEFAULT NULL AFTER recommender_phone_2;
        `;

        await db.query(alterQuery);

        console.log('Successfully added recommender contact columns to students table.');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Columns already exist. Skipping migration.');
            process.exit(0);
        }
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
