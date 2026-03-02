import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestPut(context) {
    const { request, env, params } = context;
    const id = params.id;

    // Auth Check
    const authed = await isAuthenticated(request, env);
    if (!authed) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!env.DATABASE_URL) {
        return Response.json({ error: "DATABASE_URL is missing" }, { status: 500 });
    }

    try {
        const sql = neon(env.DATABASE_URL);
        const data = await request.json();

        const result = await sql`
            UPDATE products 
            SET name = ${data.name || ''}, 
                brand = ${data.brand || ''}, 
                category = ${data.category || ''}, 
                condition = ${data.condition || ''}, 
                price = ${data.price || null}, 
                code = ${data.code || ''}, 
                description = ${data.description || ''}, 
                image = ${data.image || ''},
                specs = ${JSON.stringify(data.specs || {})}
            WHERE id = ${id}
            RETURNING *
        `;

        if (result.length === 0) {
            return Response.json({ error: "Product not found" }, { status: 404 });
        }

        return Response.json({ success: true, product: result[0] });
    } catch (e) {
        console.error("DB Update Error:", e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const id = params.id;

    // Auth Check
    const authed = await isAuthenticated(request, env);
    if (!authed) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!env.DATABASE_URL) {
        return Response.json({ error: "DATABASE_URL is missing" }, { status: 500 });
    }

    try {
        const sql = neon(env.DATABASE_URL);

        const result = await sql`
            DELETE FROM products WHERE id = ${id} RETURNING id
        `;

        if (result.length === 0) {
            return Response.json({ error: "Product not found" }, { status: 404 });
        }

        return Response.json({ success: true, deleted_id: id });
    } catch (e) {
        console.error("DB Delete Error:", e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}
