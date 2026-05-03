import { neon } from '@neondatabase/serverless';
import { isAuthenticated, jsonResponse, optionsResponse } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    try {
        const sql = neon(env.DATABASE_URL);
        const result = await sql`SELECT * FROM products WHERE id = ${id}`;
        if (result.length === 0) return jsonResponse({ error: 'Not found' }, 404, request);
        return jsonResponse(result[0], 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;
    if (!(await isAuthenticated(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, request);

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    try {
        const sql = neon(env.DATABASE_URL);
        const data = await request.json();

        // --- SIRALAMA DEĞİŞTİRME MANTIĞI ---
        if (data.move) {
            const current = await sql`SELECT id, category, sort_order FROM products WHERE id = ${id}`;
            if (current.length === 0) return jsonResponse({ error: 'Not found' }, 404, request);
            
            const curr = current[0];
            let neighbor;

            if (data.move === 'up') {
                neighbor = await sql`
                    SELECT id, sort_order FROM products 
                    WHERE category = ${curr.category} AND sort_order < ${curr.sort_order}
                    ORDER BY sort_order DESC LIMIT 1
                `;
            } else {
                neighbor = await sql`
                    SELECT id, sort_order FROM products 
                    WHERE category = ${curr.category} AND sort_order > ${curr.sort_order}
                    ORDER BY sort_order ASC LIMIT 1
                `;
            }

            if (neighbor.length > 0) {
                const nei = neighbor[0];
                // Swap sort_orders
                await sql`UPDATE products SET sort_order = ${nei.sort_order} WHERE id = ${curr.id}`;
                await sql`UPDATE products SET sort_order = ${curr.sort_order} WHERE id = ${nei.id}`;
                return jsonResponse({ success: true }, 200, request);
            }
            return jsonResponse({ success: true, message: 'Bound reached' }, 200, request);
        }

        // Toggle featured only
        if (data.toggle_featured !== undefined) {
            const result = await sql`
                UPDATE products SET is_featured = NOT is_featured, updated_at = NOW()
                WHERE id = ${id} RETURNING *
            `;
            return jsonResponse({ success: true, product: result[0] }, 200, request);
        }

        const result = await sql`
            UPDATE products SET
                name = ${data.name}, brand = ${data.brand || ''}, category = ${data.category},
                condition = ${data.condition || 'sifir'}, price = ${data.price || null},
                description = ${data.description || ''}, image = ${data.image || ''},
                images = ${JSON.stringify(data.images || [])}::jsonb, specs = ${JSON.stringify(data.specs || {})}::jsonb,
                is_featured = ${data.is_featured || false}, updated_at = NOW()
            WHERE id = ${id} RETURNING *
        `;

        if (result.length === 0) return jsonResponse({ error: 'Not found' }, 404, request);
        return jsonResponse({ success: true, product: result[0] }, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;
    if (!(await isAuthenticated(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, request);

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    try {
        const sql = neon(env.DATABASE_URL);
        await sql`DELETE FROM products WHERE id = ${id}`;
        return jsonResponse({ success: true }, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestOptions() { return optionsResponse(); }
