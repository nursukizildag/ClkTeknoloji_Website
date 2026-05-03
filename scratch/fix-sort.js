const { neon } = require('@neondatabase/serverless');
const DATABASE_URL = 'postgresql://neondb_owner:npg_6Rf8mLiaGnyX@ep-still-sun-ana3ec38-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function fixSort() {
    try {
        const sql = neon(DATABASE_URL);
        console.log('Veriler alınıyor...');
        const products = await sql`SELECT id, name FROM products ORDER BY category, created_at ASC`;
        
        for (let i = 0; i < products.length; i++) {
            await sql`UPDATE products SET sort_order = ${i + 1} WHERE id = ${products[i].id}`;
            console.log(`Güncellendi: ${products[i].name} -> Sıra: ${i + 1}`);
        }
        console.log('✅ Sıralama başarıyla tamir edildi!');
    } catch (err) {
        console.error('Hata:', err.message);
    }
}

fixSort();
