import { neon } from '@neondatabase/serverless';
import { jsonResponse, optionsResponse } from '../_shared/auth.js';

// Public endpoint - no auth required
export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const code = url.searchParams.get('code');

    if (!code) return jsonResponse({ error: 'Servis kodu gerekli. Örnek: ?code=SRV-XXXXX' }, 400, request);

    try {
        const sql = neon(env.DATABASE_URL);
        const result = await sql`
            SELECT service_code, customer_name, device_info, device_status, created_at, updated_at 
            FROM service_records WHERE service_code = ${code.toUpperCase()}
        `;

        if (result.length === 0) return jsonResponse({ error: 'Bu servis koduyla kayıt bulunamadı.' }, 404, request);

        const statusLabels = {
            alindi: 'Cihaz Alındı',
            onarimda: 'Onarımda',
            tamamlandi: 'Tamamlandı',
            teslim_edildi: 'Teslim Edildi'
        };

        const record = result[0];
        return jsonResponse({
            service_code: record.service_code,
            customer_name: record.customer_name,
            device_info: record.device_info,
            status: record.device_status,
            status_label: statusLabels[record.device_status] || record.device_status,
            created_at: record.created_at,
            updated_at: record.updated_at
        }, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestOptions() { return optionsResponse(); }
