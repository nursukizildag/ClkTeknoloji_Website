const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

async function setupNewDatabase() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL env is missing');
    }

    const sql = neon(DATABASE_URL);

    try {
        console.log('🚀 Yeni veritabanı şeması oluşturuluyor (İzole Yapı)...');

        // 1. Yeni Ürünler Tablosu (Gelişmiş Şema)
        await sql`
            CREATE TABLE IF NOT EXISTS products (
                id VARCHAR(100) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                brand VARCHAR(100),
                category VARCHAR(50) NOT NULL,
                condition VARCHAR(50) DEFAULT 'sifir',
                price DECIMAL(10, 2),
                description TEXT,
                image TEXT,
                images JSONB DEFAULT '[]',
                specs JSONB DEFAULT '{}',
                is_featured BOOLEAN DEFAULT false,
                sort_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // 2. Yeni Servis Kayıtları Tablosu
        await sql`
            CREATE TABLE IF NOT EXISTS service_records (
                id VARCHAR(100) PRIMARY KEY,
                service_code VARCHAR(20) UNIQUE NOT NULL,
                customer_name VARCHAR(255) NOT NULL,
                customer_phone VARCHAR(20),
                customer_email VARCHAR(255),
                device_info VARCHAR(255),
                device_problem TEXT,
                device_status VARCHAR(50) DEFAULT 'alindi',
                admin_note TEXT,
                estimated_cost DECIMAL(10, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // 3. Yeni Site Ayarları Tablosu
        await sql`
            CREATE TABLE IF NOT EXISTS site_settings (
                key VARCHAR(100) PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;

        // Varsayılan Ayarları Ekle
        await sql`INSERT INTO site_settings (key, value) VALUES ('site_title', 'CLK Teknoloji'), ('whatsapp_number', '+905071561515') ON CONFLICT DO NOTHING`;

        console.log('✅ Yeni veritabanı başarıyla yapılandırıldı.');
        
    } catch (error) {
        console.error('❌ Veritabanı kurulum hatası:', error.message);
    }
}

setupNewDatabase();
