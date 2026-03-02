const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_esV7QGKmSF9v@ep-calm-sound-alwcgiuj-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function setup() {
    const sql = neon(DATABASE_URL);

    try {
        console.log('Creating products table...');
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                brand VARCHAR(100),
                category VARCHAR(50),
                condition VARCHAR(50),
                price DECIMAL(10, 2),
                code VARCHAR(20),
                description TEXT,
                image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Products table created successfully.');

        console.log('Creating announcements table...');
        await sql`
            CREATE TABLE IF NOT EXISTS announcements (
                id VARCHAR(100) PRIMARY KEY,
                badge VARCHAR(50),
                text TEXT,
                duration INTEGER DEFAULT 4,
                link VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Announcements table created successfully.');

        console.log('Creating gallery table...');
        await sql`
            CREATE TABLE IF NOT EXISTS gallery (
                id VARCHAR(100) PRIMARY KEY,
                title VARCHAR(255),
                image TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        console.log('Gallery table created successfully.');

        console.log('Database setup complete.');
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

setup();
