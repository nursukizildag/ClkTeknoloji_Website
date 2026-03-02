const { neon } = require('@neondatabase/serverless');

// Cloudflare Dashboard'daki DATABASE_URL değerini buraya yapıştırıp lokalde test edebilirsiniz.
const DATABASE_URL = 'postgresql://neondb_owner:npg_esV7QGKmSF9v@ep-calm-sound-alwcgiuj-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function testConnection() {
    console.log('--- Veritabanı Bağlantı Testi ---');

    if (!DATABASE_URL || DATABASE_URL.includes('your-url-here')) {
        console.error('HATA: Lütfen test-db.js içindeki DATABASE_URL kısmına Neon bağlantı adresinizi yapıştırın.');
        return;
    }

    const sql = neon(DATABASE_URL);

    try {
        console.log('Bağlanılıyor...');
        const result = await sql`SELECT version()`;
        console.log('BAŞARILI: Veritabanına bağlanıldı.');
        console.log('Versiyon:', result[0].version);

        console.log('\nTablolar kontrol ediliyor...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;

        const tableNames = tables.map(t => t.table_name);
        console.log('Mevcut Tablolar:', tableNames.join(', ') || 'Hiç tablo bulunamadı!');

        if (tableNames.includes('products')) {
            const productCount = await sql`SELECT count(*) FROM products`;
            console.log('Ürün Sayısı:', productCount[0].count);
        } else {
            console.warn('UYARI: "products" tablosu bulunamadı! Lütfen "node setup-db.js" komutunu çalıştırın.');
        }

    } catch (error) {
        console.error('HATA: Bağlantı kurulamadı!');
        console.error('Detay:', error.message);
    }
}

testConnection();
