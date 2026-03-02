import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { env } = context;

    if (!env.DATABASE_URL) {
        return new Response(JSON.stringify({ error: "DATABASE_URL is missing" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
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
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    const authed = await isAuthenticated(request, env);
    if (!authed) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    if (!env.DATABASE_URL) {
        return new Response(JSON.stringify({ error: "DATABASE_URL is missing" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        const sql = neon(env.DATABASE_URL);
        const data = await request.json();

        const result = await sql`
            INSERT INTO carousel_images (id, title, image, target_page, sort_order)
            VALUES (${data.id}, ${data.title || ''}, ${data.image || ''}, ${data.target_page || 'home'}, ${data.sort_order || 0})
            RETURNING *
        `;

        return new Response(JSON.stringify({ success: true, item: result[0] }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Max-Age': '86400'
        }
    });
}
