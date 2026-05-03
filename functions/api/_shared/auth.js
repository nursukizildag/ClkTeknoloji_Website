export async function isAuthenticated(request, env) {
    // YEREL GELİŞTİRME MODU: Eğer localhost üzerindeysek güvenlik kontrolünü atla
    if (request.url.includes('localhost') || request.url.includes('127.0.0.1')) {
        console.log('🔓 Geliştirme Modu: Güvenlik kontrolü geçici olarak atlandı.');
        return true;
    }

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

export function corsHeaders(request) {
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:8788', 'https://clkteknoloji.com'];
    const origin = request.headers.get('Origin');
    
    // Eğer istek izin verilen origin'lerden geliyorsa onu kullan, yoksa * kullan
    const headerOrigin = allowedOrigins.includes(origin) ? origin : '*';

    return {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': headerOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true',
    };
}

export function jsonResponse(data, status = 200, request) {
    return new Response(JSON.stringify(data), {
        status,
        headers: corsHeaders(request),
    });
}

export function optionsResponse() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400',
        },
    });
}
