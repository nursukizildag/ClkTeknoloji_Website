import { neon } from '@neondatabase/serverless';
import { isAuthenticated, jsonResponse, optionsResponse } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    try {
        const sql = neon(env.DATABASE_URL);
        const url = new URL(request.url);
        const featured = url.searchParams.get('featured');
        const category = url.searchParams.get('category');

        let products;
        if (featured === 'true') {
            products = await sql`SELECT * FROM products WHERE is_featured = true ORDER BY sort_order ASC, created_at DESC`;
        } else if (category) {
            products = await sql`SELECT * FROM products WHERE category = ${category} ORDER BY sort_order ASC, created_at DESC`;
        } else {
            products = await sql`SELECT * FROM products ORDER BY sort_order ASC, created_at DESC`;
        }

        return jsonResponse(products, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    if (!(await isAuthenticated(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, request);

    try {
        const sql = neon(env.DATABASE_URL);
        const data = await request.json();

        // En yüksek sıra numarasını bul
        const maxSort = await sql`SELECT MAX(sort_order) as max_val FROM products`;
        const nextSort = (maxSort[0].max_val || 0) + 1;

        const result = await sql`
            INSERT INTO products (id, name, brand, category, condition, price, description, image, images, specs, is_featured, sort_order)
            VALUES (
                ${data.id || 'prod_' + Date.now()},
                ${data.name}, ${data.brand || ''}, ${data.category}, ${data.condition || 'sifir'},
                ${data.price || null}, ${data.description || ''}, ${data.image || ''},
                ${JSON.stringify(data.images || [])}::jsonb, ${JSON.stringify(data.specs || {})}::jsonb,
                ${data.is_featured || false}, ${nextSort}
            )
            RETURNING *
        `;

        return jsonResponse({ success: true, product: result[0] }, 201, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestOptions() { return optionsResponse(); }
