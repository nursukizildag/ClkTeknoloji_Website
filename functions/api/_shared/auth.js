export async function isAuthenticated(request, env) {
    const cookieHeader = request.headers.get('Cookie') || '';
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)admin_session=([^;]*)`));
    const sessionToken = match ? match[1] : null;

    if (!sessionToken) return false;

    try {
        const session = await env.ADMIN_AUTH.get(`session:${sessionToken}`);
        return !!session;
    } catch (err) {
        console.error('Session check error:', err);
        return false;
    }
}
