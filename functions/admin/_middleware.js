/**
 * Cloudflare Pages Middleware — Admin Koruma
 * =============================================
 * /admin/* altındaki TÜM istekleri kontrol eder.
 * Geçerli oturum cookie'si yoksa login sayfasına yönlendirir.
 * Statik dosyalar dahil (HTML, JS, CSS) HEPSİ korunur.
 */

export async function onRequest(context) {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // Cookie'den oturum token'ını al
    const cookieHeader = request.headers.get('Cookie') || '';
    const sessionToken = getCookieValue(cookieHeader, 'admin_session');

    // Token yoksa → login sayfasına yönlendir
    if (!sessionToken) {
        return Response.redirect(new URL('/login.html', request.url), 302);
    }

    // KV'den oturumu doğrula
    try {
        const session = await env.ADMIN_AUTH.get(`session:${sessionToken}`);
        if (!session) {
            // Geçersiz veya süresi dolmuş oturum → login'e yönlendir
            const response = Response.redirect(new URL('/login.html', request.url), 302);
            return new Response(response.body, {
                status: 302,
                headers: {
                    'Location': new URL('/login.html', request.url).toString(),
                    'Set-Cookie': 'admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
                }
            });
        }
    } catch (err) {
        console.error('Oturum doğrulama hatası:', err);
        return Response.redirect(new URL('/login.html', request.url), 302);
    }

    // Oturum geçerli → istek devam etsin
    return await next();
}

/**
 * Cookie header'ından belirli bir cookie değerini çıkarır
 */
function getCookieValue(cookieHeader, name) {
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? match[1] : null;
}
