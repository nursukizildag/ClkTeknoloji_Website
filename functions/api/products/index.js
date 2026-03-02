import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { env } = context;

    if (!env.DATABASE_URL) {
        return new Response(JSON.stringify({ error: "DATABASE_URL environment variable is missing" }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }

    try {
        const sql = neon(env.DATABASE_URL);
        const products = await sql`SELECT * FROM products ORDER BY created_at DESC`;

        return new Response(JSON.stringify(products), {
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

    // Auth Check
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

        // Using neon to insert
        const result = await sql`
            INSERT INTO products (id, name, brand, category, condition, price, code, description, image, specs)
            VALUES (${data.id}, ${data.name || ''}, ${data.brand || ''}, ${data.category || ''}, ${data.condition || ''}, ${data.price || null}, ${data.code || ''}, ${data.description || ''}, ${data.image || ''}, ${JSON.stringify(data.specs || {})})
            RETURNING *
        `;

        return new Response(JSON.stringify({ success: true, product: result[0] }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        console.error("DB Insert Error:", e);
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
