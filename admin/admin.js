
// --- CORE API FETCH ---
async function apiFetch(url, options = {}) {
    const res = await fetch(url, options);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Bir hata oluştu');
    }
    return res.json();
}

// --- APP STATE ---
let cachedProducts = [];
let cachedSettings = null;

// --- PAGE NAVIGATION ---
function switchPage(pageId) {
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');

    const navBtn = document.querySelector(`button[onclick="switchPage('${pageId}')"]`);
    if (navBtn) navBtn.classList.add('active');

    const titles = { 'dashboard': 'Dashboard', 'products': 'Ürün Yönetimi', 'settings': 'Ayarlar' };
    document.getElementById('current-page-title').textContent = titles[pageId] || 'Panel';

    if (pageId === 'dashboard') renderDashboardStats(cachedProducts);
    if (pageId === 'products') renderProducts(cachedProducts);
    if (pageId === 'settings' && !cachedSettings) loadSettings();
}

// --- DATA LOADING ---
async function refreshAllData() {
    try {
        const products = await apiFetch('/api/products');
        cachedProducts = products;
        
        renderDashboardStats(products);
        renderProducts(products);
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
        alert('Hata: ' + err.message);
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
function openProductModal(id = null) {
    const modalContainer = document.getElementById('modal-container');
    const form = document.getElementById('product-form');
    const previewContainer = document.getElementById('image-preview');
    const specsContainer = document.getElementById('specs-container');
    
    form.reset();
    form.elements['id'].value = '';
    previewContainer.innerHTML = '+ Görsel Yükle';
    document.getElementById('product-image-data').value = '';
    specsContainer.innerHTML = '';
    
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
            
            if (p.image) {
                previewContainer.innerHTML = `<img src="${p.image}" style="width:100%;height:100%;object-fit:contain;">`;
                document.getElementById('product-image-data').value = p.image;
            }
            if (p.specs && typeof p.specs === 'object') {
                Object.entries(p.specs).forEach(([k, v]) => addSpecRow(k, v));
            }
        }
    }

    modalContainer.style.display = 'flex';
}

function addSpecRow(key = '', value = '') {
    const container = document.getElementById('specs-container');
    const row = document.createElement('div');
    row.className = 'spec-row';
    row.innerHTML = `
        <input type="text" placeholder="Özellik" class="spec-key" value="${key}">
        <input type="text" placeholder="Değer" class="spec-val" value="${value}">
        <button type="button" class="btn-remove" onclick="this.parentElement.remove()">&times;</button>
    `;
    container.appendChild(row);
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
        const k = row.querySelector('.spec-key').value.trim();
        const v = row.querySelector('.spec-val').value.trim();
        if (k) specs[k] = v;
    });
    data.specs = specs;
    
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
        alert('Hata: ' + err.message);
    } finally {
        btn.disabled = false;
        btn.innerHTML = 'Kaydet';
    }
}

// --- IMAGE UPLOAD ---
function handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;
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
            document.getElementById('image-preview').innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:contain;">`;
            document.getElementById('product-image-data').value = base64;
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// --- OPERATIONS ---
async function moveProduct(id, direction) {
    try {
        await apiFetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ move: direction }) });
        refreshAllData();
    } catch (err) { alert(err.message); }
}

async function toggleFeatured(id) {
    try {
        await apiFetch(`/api/products/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toggle_featured: true }) });
        refreshAllData();
    } catch (err) { alert(err.message); }
}

async function deleteProduct(id) {
    if (!confirm('Emin misiniz?')) return;
    try {
        await apiFetch(`/api/products/${id}`, { method: 'DELETE' });
        refreshAllData();
    } catch (err) { alert(err.message); }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    refreshAllData();
    loadSettings();
    initSettingsHandlers();
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = '/login.html';
    });
});

window.switchPage = switchPage;
window.openProductModal = openProductModal;
window.closeModal = closeModal;
window.saveProduct = saveProduct;
window.addSpecRow = addSpecRow;
window.handleImageUpload = handleImageUpload;
window.moveProduct = moveProduct;
window.toggleFeatured = toggleFeatured;
window.deleteProduct = deleteProduct;
