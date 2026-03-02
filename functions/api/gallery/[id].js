import { neon } from '@neondatabase/serverless';
import { isAuthenticated } from '../_shared/auth.js';

export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const { id } = params;

    const authed = await isAuthenticated(request, env);
    if (!authed) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!env.DATABASE_URL) {
        return Response.json({ error: "DATABASE_URL is missing" }, { status: 500 });
    }

    try {
        const sql = neon(env.DATABASE_URL);
        await sql`DELETE FROM gallery WHERE id = ${id}`;

        return Response.json({ success: true });
    } catch (e) {
        return Response.json({ error: e.message }, { status: 500 });
    }
}
