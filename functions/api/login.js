/**
 * Login API Endpoint — POST /api/login
 * ========================================
 * Kullanıcı adı ve şifreyi KV'deki hash ile karşılaştırır.
 * Başarılıysa oturum token'ı oluşturup cookie olarak set eder.
 */

export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS headers
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': new URL(request.url).origin,
    };

    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Kullanıcı adı ve şifre gerekli.'
            }), { status: 400, headers: corsHeaders });
        }

        // KV'den kayıtlı kimlik bilgilerini al
        const storedCreds = await env.ADMIN_AUTH.get('admin_credentials', 'json');

        if (!storedCreds) {
            console.error('KV\'de admin_credentials bulunamadı!');
            return new Response(JSON.stringify({
                success: false,
                message: 'Sistem yapılandırması eksik. Lütfen yöneticiyle iletişime geçin.'
            }), { status: 500, headers: corsHeaders });
        }

        // Şifreyi SHA-256 ile hashle
        const passwordHash = await sha256(password);

        // Kimlik bilgilerini kontrol et
        if (storedCreds.username === username && storedCreds.password_hash === passwordHash) {
            // Başarılı giriş — oturum token'ı oluştur
            const sessionToken = crypto.randomUUID();

            // Oturumu KV'ye kaydet (24 saat geçerli)
            await env.ADMIN_AUTH.put(
                `session:${sessionToken}`,
                JSON.stringify({
                    username,
                    created: Date.now(),
                    ip: request.headers.get('CF-Connecting-IP') || 'unknown'
                }),
                { expirationTtl: 86400 } // 24 saat
            );

            // Cookie ile oturum token'ını gönder
            return new Response(JSON.stringify({
                success: true,
                message: 'Giriş başarılı!'
            }), {
                status: 200,
                headers: {
                    ...corsHeaders,
                    'Set-Cookie': `admin_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
                }
            });
        }

        // Başarısız giriş
        return new Response(JSON.stringify({
            success: false,
            message: 'Geçersiz kullanıcı adı veya şifre.'
        }), { status: 401, headers: corsHeaders });

    } catch (err) {
        console.error('Login hatası:', err);
        return new Response(JSON.stringify({
            success: false,
            message: 'Sunucu hatası oluştu.'
        }), { status: 500, headers: corsHeaders });
    }
}

// OPTIONS (CORS preflight)
export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': new URL(context.request.url).origin,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}

/**
 * SHA-256 hash fonksiyonu (Web Crypto API)
 */
async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
