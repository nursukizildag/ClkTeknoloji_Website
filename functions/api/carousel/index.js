import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { env } = context;

    if (!env.DATABASE_URL) {
        return Response.json({ error: "DATABASE_URL is missing" }, { status: 500 });
    }

    try {
        const sql = neon(env.DATABASE_URL);
        const images = await sql`SELECT * FROM carousel_images ORDER BY sort_order ASC, created_at DESC`;

        return new Response(JSON.stringify(images), {
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
            INSERT INTO carousel_images (id, title, image, sort_order)
            VALUES (${data.id}, ${data.title || ''}, ${data.image || ''}, ${data.sort_order || 0})
            RETURNING *
        `;

        return Response.json({ success: true, item: result[0] });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
