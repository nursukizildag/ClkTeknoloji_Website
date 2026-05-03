const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = process.env.DATABASE_URL;

async function checkTables() {
    if (!DATABASE_URL) {
        throw new Error('DATABASE_URL env is missing');
    }

    const sql = neon(DATABASE_URL);

    try {
        console.log('🔍 Mevcut tablolar taranıyor...');
        const tables = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `;
        
        console.log('\n================================================');
        console.log('📦 VERİTABANINDAKİ MEVCUT TABLOLAR:');
        console.log('================================================');
        if (tables.length === 0) {
            console.log('❌ Hiç tablo bulunamadı!');
        } else {
            tables.forEach(t => console.log(`- ${t.table_name}`));
        }
        console.log('================================================\n');

    } catch (error) {
        console.error('❌ Bağlantı Hatası:', error.message);
    }
}

checkTables();
