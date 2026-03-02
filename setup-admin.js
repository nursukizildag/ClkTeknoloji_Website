/**
 * CLK Teknoloji — Admin Şifre Hash Oluşturucu
 * =============================================
 * Bu script, admin paneli için şifre hash'i oluşturur.
 * Çıktıyı Cloudflare KV'ye (ADMIN_AUTH namespace) yapıştırın.
 * 
 * Kullanım:
 *   node setup-admin.js
 * 
 * Sonra çıkan JSON değerini Cloudflare Dashboard'da KV'ye ekleyin.
 */

const crypto = require('crypto');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function sha256(message) {
    return crypto.createHash('sha256').update(message).digest('hex');
}

console.log('');
console.log('╔═══════════════════════════════════════════════╗');
console.log('║  CLK Teknoloji — Admin Şifre Hash Oluşturucu  ║');
console.log('╚═══════════════════════════════════════════════╝');
console.log('');

rl.question('Admin kullanıcı adı (varsayılan: admin): ', (username) => {
    username = username.trim() || 'admin';

    rl.question('Admin şifresi: ', (password) => {
        if (!password || password.length < 6) {
            console.log('\n❌ Şifre en az 6 karakter olmalıdır!');
            rl.close();
            return;
        }

        const passwordHash = sha256(password);

        const kvValue = JSON.stringify({
            username: username,
            password_hash: passwordHash
        }, null, 2);

        console.log('\n' + '═'.repeat(50));
        console.log('✅ Hash başarıyla oluşturuldu!\n');
        console.log('📋 Aşağıdaki değeri Cloudflare KV\'ye ekleyin:');
        console.log('   Key (Anahtar): admin_credentials');
        console.log('   Value (Değer):');
        console.log('');
        console.log(kvValue);
        console.log('');
        console.log('═'.repeat(50));
        console.log('');
        console.log('📌 Cloudflare Dashboard Adımları:');
        console.log('   1. dash.cloudflare.com → Workers & Pages → KV');
        console.log('   2. "ADMIN_AUTH" namespace oluşturun');
        console.log('   3. Yukarıdaki key-value çiftini ekleyin');
        console.log('   4. Pages projenize KV binding ekleyin:');
        console.log('      Settings → Functions → KV namespace bindings');
        console.log('      Variable name: ADMIN_AUTH');
        console.log('      KV namespace: ADMIN_AUTH');
        console.log('');

        rl.close();
    });
});
