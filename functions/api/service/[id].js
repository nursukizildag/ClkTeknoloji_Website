import { neon } from '@neondatabase/serverless';
import { isAuthenticated, jsonResponse, optionsResponse } from '../_shared/auth.js';

export async function onRequestPut(context) {
    const { request, env } = context;
    if (!(await isAuthenticated(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, request);

    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();

    try {
        const sql = neon(env.DATABASE_URL);
        const data = await request.json();

        const result = await sql`
            UPDATE service_records SET
                customer_name = ${data.customer_name}, customer_phone = ${data.customer_phone || ''},
                customer_email = ${data.customer_email || ''}, device_info = ${data.device_info || ''},
                device_problem = ${data.device_problem || ''}, device_status = ${data.device_status || 'alindi'},
                admin_note = ${data.admin_note || ''}, estimated_cost = ${data.estimated_cost || null},
                updated_at = NOW()
            WHERE id = ${id} RETURNING *
        `;

        if (result.length === 0) return jsonResponse({ error: 'Not found' }, 404, request);
        return jsonResponse({ success: true, record: result[0] }, 200, request);
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
        await sql`DELETE FROM service_records WHERE id = ${id}`;
        return jsonResponse({ success: true }, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestOptions() { return optionsResponse(); }
