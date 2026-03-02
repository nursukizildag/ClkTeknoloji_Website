import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestPut(context) {
    const { request, env, params } = context;
    const id = params.id;

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
            return new Response(JSON.stringify({ error: "Product not found" }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        return new Response(JSON.stringify({ success: true, product: result[0] }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        console.error("DB Update Error:", e);
        return new Response(JSON.stringify({ error: e.message }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    }
}

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const id = params.id;

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

        const result = await sql`
            DELETE FROM products WHERE id = ${id} RETURNING id
        `;

        if (result.length === 0) {
            return new Response(JSON.stringify({ error: "Product not found" }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }

        return new Response(JSON.stringify({ success: true, deleted_id: id }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        });
    } catch (e) {
        console.error("DB Delete Error:", e);
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
