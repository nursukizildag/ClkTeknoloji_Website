import { neon } from '@neondatabase/serverless';
import { isAuthenticated, jsonResponse, optionsResponse } from '../_shared/auth.js';

function generateServiceCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SRV-';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
}

export async function onRequestGet(context) {
    const { request, env } = context;
    if (!(await isAuthenticated(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, request);

    try {
        const sql = neon(env.DATABASE_URL);
        const url = new URL(request.url);
        const status = url.searchParams.get('status');

        let records;
        if (status) {
            records = await sql`SELECT * FROM service_records WHERE device_status = ${status} ORDER BY created_at DESC`;
        } else {
            records = await sql`SELECT * FROM service_records ORDER BY created_at DESC`;
        }

        return jsonResponse(records, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;
    if (!(await isAuthenticated(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, request);

    try {
        const sql = neon(env.DATABASE_URL);
        const data = await request.json();
        const serviceCode = generateServiceCode();

        const result = await sql`
            INSERT INTO service_records (id, service_code, customer_name, customer_phone, customer_email, device_info, device_problem, device_status, admin_note, estimated_cost)
            VALUES (
                ${Date.now().toString()}, ${serviceCode},
                ${data.customer_name}, ${data.customer_phone || ''}, ${data.customer_email || ''},
                ${data.device_info || ''}, ${data.device_problem || ''},
                ${data.device_status || 'alindi'}, ${data.admin_note || ''}, ${data.estimated_cost || null}
            )
            RETURNING *
        `;

        return jsonResponse({ success: true, record: result[0] }, 201, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestOptions() { return optionsResponse(); }
