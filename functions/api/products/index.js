import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { env } = context;

    if (!env.DATABASE_URL) {
        return Response.json({ error: "DATABASE_URL environment variable is missing" }, { status: 500 });
    }

    try {
        const sql = neon(env.DATABASE_URL);
        const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;

        // Return products as JSON application
        return new Response(JSON.stringify(products), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

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

        // Using neon to insert
        const result = await sql`
            INSERT INTO products (id, name, brand, category, condition, price, code, description, image)
            VALUES (${data.id}, ${data.name || ''}, ${data.brand || ''}, ${data.category || ''}, ${data.condition || ''}, ${data.price || null}, ${data.code || ''}, ${data.description || ''}, ${data.image || ''})
            RETURNING *
        `;

        return Response.json({ success: true, product: result[0] });
    } catch (e) {
        console.error("DB Insert Error:", e);
        return Response.json({ error: e.message }, { status: 500 });
    }
}
