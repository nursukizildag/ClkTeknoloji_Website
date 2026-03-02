/**
 * Login API Endpoint — POST /api/login
 * ========================================
 * Kullanıcı adı ve şifreyi KV'deki hash ile karşılaştırır.
 * Başarılıysa oturum token'ı oluşturup cookie olarak set eder.
 */

// Teşhis için GET metodu eklendi
export async function onRequestGet(context) {
    const { env } = context;

    // KV bağlantısını test et
    const hasKV = !!env.ADMIN_AUTH;
    let testValue = "okunamadı";
    let error = null;

    if (hasKV) {
        try {
            testValue = await env.ADMIN_AUTH.get('admin_credentials', 'json') ? "bağlantı başarılı, veri var" : "bağlantı başarılı, veri yok";
        } catch (e) {
            error = e.message;
        }
    }

    return new Response(JSON.stringify({
        status: "Diagnostic Mode",
        kv_binding_exists: hasKV,
        kv_test_result: testValue,
        error: error,
        env_keys: Object.keys(env)
    }, null, 2), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;

    // CORS headers
    const corsHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': new URL(request.url).origin,
    };

    try {
        if (!env.ADMIN_AUTH) {
            throw new Error("ADMIN_AUTH KV namespace is not bound to this Function!");
        }

        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Kullanıcı adı ve şifre gerekli.'
            }), { status: 400, headers: corsHeaders });
        }

        // KV'den kayıtlı kimlik bilgilerini al
        let storedCreds;
        try {
            storedCreds = await env.ADMIN_AUTH.get('admin_credentials', 'json');
        } catch (e) {
            throw new Error("Girdiğiniz ayarlar okunurken KV hatası oluştu: " + e.message);
        }

        if (!storedCreds) {
            console.error('KV\'de admin_credentials bulunamadı!');
            return new Response(JSON.stringify({
                success: false,
                message: 'Sistem yapılandırması eksik (admin_credentials bulunamadı). Cloudflare KV ayarlarını kontrol edin.'
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
        console.error('Login Hatası (Detaylı):', err);
        return new Response(JSON.stringify({
            success: false,
            error_details: err.message,
            message: 'Sunucu hatası: ' + err.message
        }), { status: 500, headers: corsHeaders });
    }
}

// OPTIONS (CORS preflight)
export async function onRequestOptions(context) {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': new URL(context.request.url).origin,
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
