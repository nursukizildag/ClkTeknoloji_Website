import { neon } from '@neondatabase/serverless';
import { jsonResponse } from './_shared/auth.js';

export async function onRequestGet(context) {
    const { env, request } = context;
    try {
        const sql = neon(env.DATABASE_URL);
        
        // Test verisi ekle
        const testId = 'test-' + Date.now();
        const result = await sql`
            INSERT INTO products (id, name, category, price, description)
            VALUES (${testId}, 'Test Ürünü', 'test', 99.99, 'Bu bir bağlantı testidir.')
            RETURNING *
        `;

        return jsonResponse({
            success: true,
            message: 'Neon DB Bağlantısı Başarılı! Test verisi yazıldı.',
            data: result[0]
        }, 200, request);
    } catch (e) {
        return jsonResponse({
            success: false,
            message: 'Bağlantı Hatası: ' + e.message
        }, 500, request);
    }
}
