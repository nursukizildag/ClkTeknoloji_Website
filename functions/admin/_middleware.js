export async function onRequest(context) {
    const { request, next, env } = context;
    const url = new URL(request.url);

    // Yerel geliştirme modunda kolaylık sağlamak için (localhost) kontrolü atlayabiliriz
    // Ancak gerçek yayında mutlaka kontrol edilmeli.
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    const cookieHeader = request.headers.get('Cookie') || '';
    const hasSession = cookieHeader.includes('admin_session=');

    // Giriş yapmamışsa ve yerelde değilse (veya yerelde de test etmek istiyorsan) login'e at
    if (!hasSession && !isLocal) {
        console.log('🚫 Yetkisiz erişim denemesi: Giriş sayfasına yönlendiriliyor.');
        return Response.redirect(new URL('/login.html', request.url), 302);
    }

    // Giriş yapmışsa veya yereldeyse devam et
    return next();
}
