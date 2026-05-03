import { corsHeaders } from './_shared/auth.js';

async function sha256(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const headers = { ...corsHeaders(request) };

    try {
        if (!env.ADMIN_AUTH) throw new Error('ADMIN_AUTH KV namespace not bound');

        const { username, password } = await request.json();
        if (!username || !password) {
            return new Response(JSON.stringify({ success: false, message: 'Kullanıcı adı ve şifre gerekli.' }), { status: 400, headers });
        }

        let storedCreds = await env.ADMIN_AUTH.get('admin_credentials', 'json');
        
        // YEREL MOD: Eğer KV boşsa (ilk kurulum), varsayılan bilgileri kabul et
        if (!storedCreds && (request.url.includes('localhost') || request.url.includes('127.0.0.1'))) {
            console.log('⚠️ Yerel ortam tespiti: Varsayılan admin bilgileri kullanılıyor.');
            storedCreds = {
                username: 'clk',
                password_hash: '2878ed7042508d29ce8a38a89401f850aeff1ace4646d35f58e9f854c5fd17a9' // clk2357
            };
        }

        if (!storedCreds) {
            return new Response(JSON.stringify({ success: false, message: 'Sistem yapılandırması eksik (KV admin_credentials bulunamadı).' }), { status: 500, headers });
        }

        const passwordHash = await sha256(password);

        if (storedCreds.username === username && storedCreds.password_hash === passwordHash) {
            const sessionToken = crypto.randomUUID();
            await env.ADMIN_AUTH.put(
                `session:${sessionToken}`,
                JSON.stringify({ username, created: Date.now() }),
                { expirationTtl: 86400 }
            );

            return new Response(JSON.stringify({ success: true, message: 'Giriş başarılı!' }), {
                status: 200,
                headers: {
                    ...headers,
                    'Set-Cookie': `admin_session=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
                },
            });
        }

        return new Response(JSON.stringify({ success: false, message: 'Geçersiz kullanıcı adı veya şifre.' }), { status: 401, headers });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500, headers });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
