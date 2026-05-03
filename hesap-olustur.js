/**
 * CLK Teknoloji — Admin Hesabı Oluşturma Yardımcısı
 * ------------------------------------------------
 * Bu script, login olabilmen için gerekli olan şifre hash'ini üretir.
 */

const crypto = require('crypto');

// --- AYARLAR ---
const username = 'admin';
const password = 'clk2024admin'; // Şifren bu!

function generateCredentials() {
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    
    const credentials = {
        username: username,
        password_hash: passwordHash
    };

    console.log('\n================================================');
    console.log('🚀 CLK TEKNOLOJİ ADMIN GİRİŞ BİLGİLERİ');
    console.log('================================================');
    console.log(`👤 Kullanıcı Adı: ${username}`);
    console.log(`🔑 Şifre:        ${password}`);
    console.log('------------------------------------------------');
    console.log('\n☁️  CLOUDFLARE KV AYARI (admin_credentials anahtarı için):');
    console.log(JSON.stringify(credentials, null, 2));
    console.log('\n================================================');
}

generateCredentials();
