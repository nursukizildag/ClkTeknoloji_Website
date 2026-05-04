import { neon } from '@neondatabase/serverless';
import { isAuthenticated, jsonResponse, optionsResponse } from '../_shared/auth.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const sql = neon(env.DATABASE_URL);
        await sql`
            INSERT INTO page_visits (visit_date, visit_count, updated_at)
            VALUES (CURRENT_DATE, 1, NOW())
            ON CONFLICT (visit_date)
            DO UPDATE SET visit_count = page_visits.visit_count + 1, updated_at = NOW()
        `;

        return jsonResponse({ success: true }, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestGet(context) {
    const { request, env } = context;
    if (!(await isAuthenticated(request, env))) return jsonResponse({ error: 'Unauthorized' }, 401, request);

    try {
        const url = new URL(request.url);
        const daysRaw = parseInt(url.searchParams.get('days') || '14', 10);
        const days = Number.isFinite(daysRaw) ? Math.min(Math.max(daysRaw, 1), 90) : 14;

        const sql = neon(env.DATABASE_URL);
        const totalResult = await sql`SELECT COALESCE(SUM(visit_count), 0) AS total FROM page_visits`;
        const rows = await sql`
            SELECT visit_date, visit_count
            FROM page_visits
            ORDER BY visit_date DESC
            LIMIT ${days}
        `;

        const series = rows
            .map((row) => ({
                date: row.visit_date instanceof Date
                    ? row.visit_date.toISOString().slice(0, 10)
                    : String(row.visit_date),
                count: Number(row.visit_count || 0)
            }))
            .reverse();

        return jsonResponse({
            total: Number(totalResult[0]?.total || 0),
            series
        }, 200, request);
    } catch (e) {
        return jsonResponse({ error: e.message }, 500, request);
    }
}

export async function onRequestOptions() { return optionsResponse(); }
