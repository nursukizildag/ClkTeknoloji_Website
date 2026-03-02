import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const { id } = params;

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
        await sql`DELETE FROM carousel_images WHERE id = ${id}`;

        return new Response(JSON.stringify({ success: true }), {
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
