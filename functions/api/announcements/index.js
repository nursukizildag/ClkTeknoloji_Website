import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { env } = context;

    if (!env.DATABASE_URL) {
        return Response.json({ error: "DATABASE_URL is missing" }, { status: 500 });
    }

    try {
        const sql = neon(env.DATABASE_URL);
        const announcements = await sql`SELECT * FROM announcements ORDER BY created_at DESC`;

        return new Response(JSON.stringify(announcements), {
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
            INSERT INTO announcements (id, badge, text, duration, link)
            VALUES (${data.id}, ${data.badge || ''}, ${data.text || ''}, ${data.duration || 4}, ${data.link || 'products'})
            RETURNING *
        `;

        return Response.json({ success: true, announcement: result[0] });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
