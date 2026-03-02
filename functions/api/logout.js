/**
 * Logout API Endpoint — POST /api/logout
 * =========================================
 * Oturum cookie'sini siler ve KV'den oturumu temizler.
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        // Cookie'den oturum token'ını al
        const cookieHeader = request.headers.get('Cookie') || '';
        const sessionToken = getCookieValue(cookieHeader, 'admin_session');

        // KV'den oturumu sil
        if (sessionToken) {
            try {
                await env.ADMIN_AUTH.delete(`session:${sessionToken}`);
            } catch (e) {
                console.error('KV oturum silme hatası:', e);
            }
        }

        // Cookie'yi sil ve login sayfasına yönlendir
        return new Response(JSON.stringify({
            success: true,
            message: 'Çıkış yapıldı.'
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Set-Cookie': 'admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
            }
        });
    } catch (err) {
        console.error('Logout hatası:', err);
        return new Response(JSON.stringify({
            success: false,
            message: 'Çıkış yapılırken hata oluştu.'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
}

function getCookieValue(cookieHeader, name) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
}
