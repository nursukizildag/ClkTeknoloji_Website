export async function onRequestPost(context) {
    const { request, env } = context;
    const cookieHeader = request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/admin_session=([^;]*)/);
    const token = match ? match[1] : null;

    if (token) {
        try { await env.ADMIN_AUTH.delete(`session:${token}`); } catch (e) {}
    }

    return new Response(JSON.stringify({ success: true }), {
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
        },
    });
}
