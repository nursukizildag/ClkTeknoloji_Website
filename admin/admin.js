
// --- CORE API FETCH ---
async function apiFetch(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Bir hata oluştu');
    }
    return res.json();
}

function showToast(message, type = 'error', timeout = 2200) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, timeout);
}

function showConfirm(message) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const text = document.getElementById('confirm-message');
        const okBtn = document.getElementById('confirm-ok');
        const cancelBtn = document.getElementById('confirm-cancel');
        if (!modal || !text || !okBtn || !cancelBtn) {
            resolve(window.confirm(message));
            return;
        }

        text.textContent = message;
        modal.style.display = 'flex';

        const cleanup = (result) => {
            modal.style.display = 'none';
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            resolve(result);
        };

        const onOk = () => cleanup(true);
        const onCancel = () => cleanup(false);

        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
    });
}

// --- APP STATE ---
let cachedProducts = [];
let cachedSettings = null;
let cachedAnalytics = null;

const SPEC_FIELDS = [
    'Pil',
    'RAM',
    'Depolama',
    'Ekran',
    'Kamera',
    'Islemci',
    'Renk',
    'Garanti',
    'Kutu Durumu',
    'Model',
    'Seri'
];

// --- PAGE NAVIGATION ---
function switchPage(pageId) {
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');

    const navBtn = document.querySelector(`button[onclick="switchPage('${pageId}')"]`);
    if (navBtn) navBtn.classList.add('active');

    const titles = { 'dashboard': 'Dashboard', 'products': 'Ürün Yönetimi', 'visits': 'Ziyaretler', 'settings': 'Ayarlar' };
    document.getElementById('current-page-title').textContent = titles[pageId] || 'Panel';

    if (pageId === 'dashboard') renderDashboardStats(cachedProducts);
    if (pageId === 'products') renderProducts(cachedProducts);
    if (pageId === 'visits') {
        if (cachedAnalytics) {
            renderAnalytics(cachedAnalytics);
        } else {
            loadAnalytics();
        }
    }
    if (pageId === 'settings' && !cachedSettings) loadSettings();
}

// --- DATA LOADING ---
async function refreshAllData() {
    try {
        const products = await apiFetch('/api/products');
        cachedProducts = products;
        
        renderDashboardStats(products);
        renderProducts(products);
        loadAnalytics();
    } catch (err) {
        console.error('Veri yüklenme hatası:', err.message);
    }
}

function renderDashboardStats(products = []) {
    if (!Array.isArray(products)) products = [];
    document.getElementById('stat-total-products').textContent = products.length;
    document.getElementById('stat-featured-products').textContent = products.filter(p => p.is_featured).length;

    
    const recentList = document.getElementById('recent-products-list');
    if (recentList) {
        recentList.innerHTML = products.slice(0, 5).map(p => `
            <tr>
                <td><img src="${p.image || '../assets/img/no-image.jpg'}" class="product-img-sm"></td>
                <td><strong>${p.name}</strong></td>
                <td>₺${p.price ? Number(p.price).toLocaleString() : '0'}</td>
                <td><span class="badge badge-gray">${(p.type || 'Cihaz').toUpperCase()}</span></td>
            </tr>
        `).join('');
    }
}

function renderProducts(products = []) {
    if (!Array.isArray(products)) products = [];
    const containers = {
        telefon: document.getElementById('list-telefon'),
        bilgisayar: document.getElementById('list-bilgisayar'),
        saat: document.getElementById('list-saat')
    };
    
    Object.values(containers).forEach(c => { if(c) c.innerHTML = ''; });
    
    products.forEach(p => {
        const cat = (p.category || 'telefon').toLowerCase();
        const list = containers[cat];
        if (!list) return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td style="width: 80px;">
                <div class="sort-controls">
                    <button class="btn-sort" onclick="moveProduct('${p.id}', 'up')"><i class="fas fa-chevron-up"></i></button>
                    <button class="btn-sort" onclick="moveProduct('${p.id}', 'down')"><i class="fas fa-chevron-down"></i></button>
                </div>
            </td>
            <td><img src="${p.image || '../assets/img/no-image.jpg'}" class="product-img-sm"></td>
            <td><strong>${p.name || 'İsimsiz Ürün'}</strong></td>
            <td>₺${p.price ? Number(p.price).toLocaleString() : '0'}</td>
            <td>${(p.condition || 'sifir') === 'sifir' ? 'Sıfır' : '2. El'}</td>
            <td>
                <button class="btn-star ${p.is_featured ? 'active' : ''}" onclick="toggleFeatured('${p.id}')">
                    <i class="${p.is_featured ? 'fas' : 'far'} fa-star"></i>
                </button>
            </td>
            <td>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-sm btn-ghost" onclick="openProductModal('${p.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p.id}')"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        `;
        list.appendChild(row);
    });
}

// --- ANALYTICS ---
async function loadAnalytics() {
    try {
        const data = await apiFetch('/api/analytics?days=30');
        cachedAnalytics = data;
        renderAnalytics(data);
    } catch (err) {
        console.error('Ziyaret verisi yüklenemedi:', err.message);
    }
}

function renderAnalytics(data) {
    if (!data || !Array.isArray(data.series)) return;

    const totalEl = document.getElementById('stat-total-visits');
    if (totalEl) totalEl.textContent = data.total || 0;

    const rangeEl = document.getElementById('visits-range');
    const totalTextEl = document.getElementById('visits-total');
    if (rangeEl && data.series.length > 0) {
        const first = data.series[0].date;
        const last = data.series[data.series.length - 1].date;
        rangeEl.textContent = `${first} - ${last}`;
    }
    if (totalTextEl) totalTextEl.textContent = `Toplam: ${data.total || 0}`;

    drawVisitsChart(data.series);
}

function drawVisitsChart(series) {
    const canvas = document.getElementById('visits-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth || canvas.width;
    const height = canvas.clientHeight || canvas.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, width, height);

    const padding = 28;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(1, ...series.map(s => s.count || 0));
    const barGap = 8;
    const barWidth = series.length > 0
        ? (chartWidth - barGap * (series.length - 1)) / series.length
        : chartWidth;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding + 0.5);
    ctx.lineTo(width - padding, height - padding + 0.5);
    ctx.stroke();

    series.forEach((point, index) => {
        const value = point.count || 0;
        const barHeight = (value / maxValue) * chartHeight;
        const x = padding + index * (barWidth + barGap);
        const y = height - padding - barHeight;

        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x, y, Math.max(2, barWidth), barHeight);
    });
}

// --- SETTINGS ---
async function loadSettings() {
    try {
        const settings = await apiFetch('/api/settings');
        cachedSettings = settings || {};
        populateSettingsForm(cachedSettings);
    } catch (err) {
        console.error('Ayarlar yüklenemedi:', err.message);
    }
}

function populateSettingsForm(settings) {
    const form = document.getElementById('settings-form');
    if (!form) return;
    form.elements['site_title'].value = settings.site_title || '';
    form.elements['whatsapp_number'].value = settings.whatsapp_number || '';
    form.elements['contact_email'].value = settings.contact_email || '';
    form.elements['contact_address'].value = settings.contact_address || '';
    form.elements['about_short'].value = settings.about_short || '';
}

function collectSettingsForm() {
    const form = document.getElementById('settings-form');
    return {
        site_title: form.elements['site_title'].value.trim(),
        whatsapp_number: form.elements['whatsapp_number'].value.trim(),
        contact_email: form.elements['contact_email'].value.trim(),
        contact_address: form.elements['contact_address'].value.trim(),
        about_short: form.elements['about_short'].value.trim()
    };
}

async function saveSettings() {
    const btn = document.getElementById('settings-save');
    const status = document.getElementById('settings-status');
    try {
        btn.disabled = true;
        btn.textContent = 'Kaydediliyor...';
        const data = collectSettingsForm();
        await apiFetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        cachedSettings = data;
        if (status) {
            status.style.display = 'inline';
            setTimeout(() => { status.style.display = 'none'; }, 1500);
        }
    } catch (err) {
        showToast('Hata: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Kaydet';
    }
}

function initSettingsHandlers() {
    const btn = document.getElementById('settings-save');
    if (btn) btn.addEventListener('click', saveSettings);
}

// --- MODAL & FORM ---
// --- MODAL & FORM ---
let currentProductImages = [];

function openProductModal(id = null) {
    const modalContainer = document.getElementById('modal-container');
    const form = document.getElementById('product-form');
    const specsContainer = document.getElementById('specs-container');
    
    form.reset();
    form.elements['id'].value = '';
    currentProductImages = [];
    renderAdminGallery();
    
    specsContainer.innerHTML = '';
    renderSpecFields({});
    
    if (id) {
        const p = cachedProducts.find(x => x.id === id);
        if (p) {
            form.elements['id'].value = p.id;
            form.elements['name'].value = p.name || '';
            form.elements['price'].value = p.price || '';
            form.elements['category'].value = p.category || 'telefon';
            form.elements['type'].value = p.type || 'cihaz';
            form.elements['condition'].value = p.condition || 'sifir';
            form.elements['is_featured'].checked = !!p.is_featured;
            form.elements['description'].value = p.description || '';
            
            // Görselleri yükle
            if (p.images && Array.isArray(p.images)) {
                currentProductImages = [...p.images];
            } else if (p.image) {
                currentProductImages = [p.image];
            }
            renderAdminGallery();

            if (p.specs && typeof p.specs === 'object') {
                renderSpecFields(p.specs);
            }
        }
    }

    modalContainer.style.display = 'flex';
}

function renderAdminGallery() {
    const gallery = document.getElementById('image-gallery-admin');
    if (!gallery) return;
    gallery.innerHTML = currentProductImages.map((img, idx) => `
        <div class="image-item-admin">
            <img src="${img}">
            <button type="button" class="btn-remove" onclick="removeImage(${idx})"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

function removeImage(idx) {
    currentProductImages.splice(idx, 1);
    renderAdminGallery();
}

function renderSpecFields(specs = {}) {
    const container = document.getElementById('specs-container');
    if (!container) return;
    container.innerHTML = '';

    SPEC_FIELDS.forEach((label) => {
        const value = specs[label] || '';
        const checked = value !== '';
        const row = document.createElement('div');
        row.className = 'spec-row';
        row.innerHTML = `
            <input type="checkbox" class="spec-check" ${checked ? 'checked' : ''}>
            <span class="spec-label">${label}</span>
            <input type="text" class="spec-val" placeholder="Değer" value="${value}">
        `;

        const checkbox = row.querySelector('.spec-check');
        const input = row.querySelector('.spec-val');
        input.disabled = !checked;

        checkbox.addEventListener('change', () => {
            const enabled = checkbox.checked;
            input.disabled = !enabled;
            if (!enabled) input.value = '';
        });

        container.appendChild(row);
    });
}

function closeModal() {
    document.getElementById('modal-container').style.display = 'none';
}

async function saveProduct() {
    const btn = document.getElementById('product-form-submit');
    const form = document.getElementById('product-form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    data.is_featured = form.elements['is_featured'].checked;
    
    const specs = {};
    document.querySelectorAll('.spec-row').forEach(row => {
        const key = row.querySelector('.spec-label')?.textContent?.trim();
        const checked = row.querySelector('.spec-check')?.checked;
        const val = row.querySelector('.spec-val')?.value?.trim();
        if (checked && key && val) specs[key] = val;
    });
    data.specs = specs;
    
    // Görselleri ayarla
    data.images = currentProductImages;
    data.image = currentProductImages.length > 0 ? currentProductImages[0] : '';
    
    const id = data.id;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/products/${id}` : '/api/products';
    
    try {
        btn.disabled = true;
        btn.innerHTML = 'Kaydediliyor...';
        await apiFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        closeModal();
        await refreshAllData();
    } catch (err) {
        showToast('Hata: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Kaydet';
    }
}

// --- IMAGE UPLOAD ---
async function handleImageUpload(input) {
    const files = Array.from(input.files);
    if (files.length === 0) return;

    for (const file of files) {
        await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let w = img.width, h = img.height;
                    if (w > 800) { h *= 800/w; w = 800; }
                    canvas.width = w; canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    const base64 = canvas.toDataURL('image/jpeg', 0.7);
                    currentProductImages.push(base64);
                    renderAdminGallery();
                    resolve();
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    input.value = ''; // Inputu temizle ki aynı dosyayı tekrar seçebilsin
}

// --- OPERATIONS ---
async function moveProduct(id, direction) {
    try {
        await apiFetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ move: direction }) });
        refreshAllData();
    } catch (err) { showToast(err.message, 'error'); }
}

async function toggleFeatured(id) {
    try {
        await apiFetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toggle_featured: true }) });
        refreshAllData();
    } catch (err) { showToast(err.message, 'error'); }
}

async function deleteProduct(id) {
    const ok = await showConfirm('Emin misiniz?');
    if (!ok) return;
    try {
        await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
        refreshAllData();
    } catch (err) { showToast(err.message, 'error'); }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    refreshAllData();
    loadSettings();
    initSettingsHandlers();
    window.addEventListener('resize', () => {
        if (cachedAnalytics) renderAnalytics(cachedAnalytics);
    });
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '/login.html';
    });
});

window.switchPage = switchPage;
window.openProductModal = openProductModal;
window.closeModal = closeModal;
window.saveProduct = saveProduct;
window.handleImageUpload = handleImageUpload;
window.moveProduct = moveProduct;
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;
