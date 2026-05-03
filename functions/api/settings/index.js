import { neon } from '@neondatabase/serverless';
import { isAuthenticated, jsonResponse, optionsResponse } from '../_shared/auth.js';

export async function onRequestGet(context) {
    const { request, env } = context;

    try {
        const sql = neon(env.DATABASE_URL);
        const settings = await sql`SELECT * FROM site_settings`;
        const obj = {};
        settings.forEach(s => { obj[s.key] = s.value; });
        return jsonResponse(obj, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;
    if (!(await isAuthenticated(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, request);

    try {
        const sql = neon(env.DATABASE_URL);
        const data = await request.json();

        for (const [key, value] of Object.entries(data)) {
            await sql`
                INSERT INTO site_settings (key, value, updated_at) 
                VALUES (${key}, ${value}, NOW())
                ON CONFLICT (key) DO UPDATE SET value = ${value}, updated_at = NOW()
            `;
        }

        return jsonResponse({ success: true }, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestOptions() { return optionsResponse(); }
