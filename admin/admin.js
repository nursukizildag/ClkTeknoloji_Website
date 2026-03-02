/**
 * CLK Teknoloji — Admin Panel JavaScript
 * ============================================
 * - Sidebar page navigation
 * - Product CRUD (localStorage) with brand field
 * - Announcement CRUD (localStorage) with duration & link
 * - Section ordering (drag & drop + localStorage)
 * - Gallery management (localStorage + FileReader)
 * - 2. El background management
 * - File upload preview
 * 
 * NOT: Tüm veriler localStorage'da tutulur.
 * Backend (C# API) hazır olduğunda fetch() çağrıları aktif edilecek.
 */

// ============================================
// DATA KEYS
// ============================================
const STORAGE_KEYS = {
    products: 'clk_admin_products',
    announcements: 'clk_admin_announcements',
    sectionOrder: 'clk_section_order', // Same key used by main site
    gallery: 'clk_admin_gallery',
    secondhandBg: 'clk_secondhand_bg'
};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initLogout();
    initSidebar();
    initProducts();
    initAnnouncements();
    initSectionOrdering();
    initGallery();
    initCarousel();
    initSecondHand();
    updateDashboardStats();
});

// ============================================
// LOGOUT / AUTH
// ============================================
function initLogout() {
    const logoutBtns = document.querySelectorAll('#btn-logout, #btn-logout-topbar');
    logoutBtns.forEach(btn => {
        if (!btn) return;
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!confirm('Çıkış yapmak istediğinize emin misiniz?')) return;

            try {
                await fetch('/api/logout', { method: 'POST' });
            } catch (err) {
                console.error('Logout hatası:', err);
            }
            window.location.href = '/login.html';
        });
    });
}

// ============================================
// SIDEBAR NAVIGATION
// ============================================
function initSidebar() {
    const links = document.querySelectorAll('.sidebar-link[data-page]');
    const pages = document.querySelectorAll('.admin-page');
    const title = document.getElementById('topbar-title');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    const pageTitles = {
        dashboard: 'Dashboard',
        products: 'Ürün Yönetimi',
        announcements: 'Duyurular / Kampanya',
        secondhand: '2. El Cihazlar',
        carousel: 'Giriş Slider / Arka Plan',
        sections: 'Bölüm Sıralama',
        gallery: 'FotoGaleri'
    };

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;

            // Active states
            links.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            pages.forEach(p => p.classList.remove('active'));
            const target = document.getElementById(`page-${page}`);
            if (target) target.classList.add('active');

            if (title) title.textContent = pageTitles[page] || 'Dashboard';

            // Close sidebar on mobile
            if (sidebar) sidebar.classList.remove('open');

            // Refresh lists when switching
            if (page === 'secondhand') renderSecondHandProducts();
            if (page === 'carousel') renderCarousel();
        });
    });

    // Mobile toggle
    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================
function initProducts() {
    console.log("Initializing Product Manager...");
    const addBtn = document.getElementById('btn-add-product');
    const cancelBtn = document.getElementById('btn-cancel-product');
    const form = document.getElementById('product-form');
    const addForm = document.getElementById('product-add-form');
    const uploadArea = document.getElementById('product-upload-area');
    const fileInput = document.getElementById('product-image');
    const preview = document.getElementById('product-preview');

    if (addBtn && form) {
        addBtn.onclick = (e) => {
            e.preventDefault();
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        };
    }

    if (cancelBtn && form) {
        cancelBtn.onclick = (e) => {
            e.preventDefault();
            form.style.display = 'none';
            addForm.reset();
            document.getElementById('edit-product-id').value = '';
            document.getElementById('product-form-title').textContent = 'Yeni Ürün Ekle';
            if (preview) preview.innerHTML = '';
        };
    }

    // File upload
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#2563eb';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                showImagePreview(fileInput.files[0], preview);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                showImagePreview(fileInput.files[0], preview);
            }
        });
    }

    // Submit form
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const editId = document.getElementById('edit-product-id').value;
                const category = document.getElementById('product-category').value;

                // Fotoğrafı sıkıştır (veritabanı alanını idareli kullanmak için)
                let imageData = preview ? (preview.querySelector('img')?.src || null) : null;
                if (imageData && imageData.length > 500000) {
                    imageData = compressImage(imageData);
                }

                const product = {
                    id: editId ? editId : Date.now().toString(), // IDs should be strings since PG schema uses VARCHAR for ID
                    name: document.getElementById('product-name').value,
                    brand: document.getElementById('product-brand').value,
                    category: category,
                    price: document.getElementById('product-price').value,
                    condition: document.getElementById('product-condition').value,
                    description: document.getElementById('product-desc').value,
                    image: imageData
                };

                const saveBtn = addForm.querySelector('button[type="submit"]');
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
                saveBtn.disabled = true;

                if (editId) {
                    // Orijinal ürünü bul
                    const existingProduct = window.currentAdminProducts?.find(p => p.id === product.id);
                    product.code = existingProduct?.code || generateProductCode(category);
                    if (!product.image && existingProduct?.image) {
                        product.image = existingProduct.image; // resim değişmediyse eskisini tut
                    }
                } else {
                    product.code = generateProductCode(category);
                }

                const endpoint = editId ? `/api/products/${product.id}` : '/api/products';
                const method = editId ? 'PUT' : 'POST';

                const response = await fetch(endpoint, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product)
                });

                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;

                if (!response.ok) {
                    const errObj = await response.json();
                    throw new Error(errObj.error || `Server fault: ${response.status}`);
                }

                showNotification(editId ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!', 'success');

                // Reset form
                addForm.reset();
                document.getElementById('edit-product-id').value = '';
                document.getElementById('product-form-title').textContent = 'Yeni Ürün Ekle';
                if (preview) preview.innerHTML = '';
                form.style.display = 'none';

                renderProducts();
            } catch (err) {
                console.error('Ürün kaydetme hatası:', err);
                showNotification('Ürün kaydedilirken bir hata oluştu: ' + err.message, 'error');
                const saveBtn = addForm.querySelector('button[type="submit"]');
                if (saveBtn) {
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Kaydet';
                    saveBtn.disabled = false;
                }
            }
        });
    }

    renderProducts();
}

window.currentAdminProducts = [];

async function renderProducts() {
    const tbody = document.getElementById('products-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr class="empty-row"><td colspan="8"><i class="fas fa-spinner fa-spin"></i> Ürünler yükleniyor...</td></tr>';

    let products = [];
    try {
        const response = await fetch('/api/products');
        if (response.ok) {
            products = await response.json();
            window.currentAdminProducts = products;
        } else {
            console.error("API error", response.status);
            throw new Error(`API Hatası: ${response.status}`);
        }
    } catch (err) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8" style="color: #ef4444;">Ürünler yüklenemedi. Veritabanı bağlantınızı kontrol edin.</td></tr>';
        return;
    }

    if (products.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="8">Henüz ürün eklenmedi.</td></tr>';
        updateDashboardStats();
        return;
    }

    const categoryNames = {
        telefon: '📱 Telefon',
        bilgisayar: '💻 Bilgisayar',
        saat: '⌚ Saat',
        aksesuar: '🎧 Aksesuar'
    };

    const categoryOrder = ['telefon', 'bilgisayar', 'saat', 'aksesuar', 'ikinci-el'];
    let html = '';

    const groupedProducts = {};
    categoryOrder.forEach(cat => groupedProducts[cat] = []);

    products.forEach((p, originalIndex) => {
        const cat = p.category || 'diger';
        if (!groupedProducts[cat]) groupedProducts[cat] = [];
        groupedProducts[cat].push({ ...p, originalIndex });
    });

    categoryOrder.concat(Object.keys(groupedProducts).filter(k => !categoryOrder.includes(k))).forEach(cat => {
        if (groupedProducts[cat].length > 0) {
            const catName = categoryNames[cat] || (cat === 'ikinci-el' ? '🔥 2. El Cihazlar' : cat.toUpperCase());
            html += `<tr class="category-header-row"><td colspan="8">${catName} Kategorisi</td></tr>`;

            groupedProducts[cat].forEach(p => {
                html += `
                <tr data-index="${p.originalIndex}" class="draggable-row">
                    <td class="drag-handle" style="cursor: grab; color: #a0aec0; text-align: center;"><i class="fas fa-grip-vertical"></i></td>
                    <td>${p.image ? `<img src="${p.image}" alt="${p.name}">` : '<span style="color:#64748b">—</span>'}</td>
                    <td>
                        <strong>${p.name}</strong><br>
                        <span style="font-size: 0.8rem; color: #a0aec0; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; display: inline-block; margin-top: 4px;">Kod: ${p.code || 'Yok'}</span>
                    </td>
                    <td>${p.brand || '—'}</td>
                    <td>${categoryNames[p.category] || p.category}</td>
                    <td>${p.price ? `₺${Number(p.price).toLocaleString('tr-TR')}` : '—'}</td>
                    <td>${p.condition === 'ikinci-el' ? '<span style="color:#e8872a">2. El</span>' : 'Sıfır'}</td>
                    <td style="white-space: nowrap;">
                        <button class="btn-admin btn-admin-primary btn-admin-sm" onclick="editProduct('${p.id}')" style="margin-right: 5px;" title="Düzenle">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteProduct('${p.id}')" title="Sil">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
                `;
            });
        }
    });

    tbody.innerHTML = html;
    updateDashboardStats();

    // Sürükle-bırak olaylarını ekle
    const rows = tbody.querySelectorAll('.draggable-row');
    let draggables = Array.from(rows);

    draggables.forEach(row => {
        row.setAttribute('draggable', 'true');

        row.addEventListener('dragstart', function (e) {
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.getAttribute('data-index'));
            this.classList.add('dragging');
            setTimeout(() => this.style.opacity = '0.5', 0);
        });

        row.addEventListener('dragover', function (e) {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            const targetRow = e.target.closest('tr');
            if (targetRow && targetRow !== row) {
                targetRow.classList.add('drag-over');
            }
        });

        row.addEventListener('dragleave', function (e) {
            this.classList.remove('drag-over');
        });

        row.addEventListener('drop', function (e) {
            e.preventDefault();
            showNotification('Sürükle-bırak özelliği veritabanı sürümünde henüz desteklenmiyor.', 'error');
        });

        row.addEventListener('dragend', function () {
            this.classList.remove('dragging');
            this.style.opacity = '1';
            draggables.forEach(r => r.classList.remove('drag-over'));
        });
    });
}

async function deleteProduct(id) {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`/api/products/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errObj = await response.json();
            throw new Error(errObj.error || `HTTP error ${response.status}`);
        }

        showNotification('Ürün silindi.', 'success');
        renderProducts();
    } catch (err) {
        console.error('Ürün silme hatası:', err);
        showNotification('Ürün silinirken bir hata oluştu: ' + err.message, 'error');
    }
}

// ============================================
// ANNOUNCEMENT MANAGEMENT
// ============================================
function initAnnouncements() {
    const addBtn = document.getElementById('btn-add-announcement');
    const cancelBtn = document.getElementById('btn-cancel-announcement');
    const form = document.getElementById('announcement-form');
    const addForm = document.getElementById('announcement-add-form');

    if (addBtn && form) {
        addBtn.addEventListener('click', () => {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (cancelBtn && form) {
        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none';
            addForm.reset();
        });
    }

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const announcement = {
                id: Date.now().toString(),
                badge: document.getElementById('ann-badge').value,
                text: document.getElementById('ann-text').value,
                duration: parseInt(document.getElementById('ann-duration').value) || 4,
                link: document.getElementById('ann-link').value || 'products'
            };

            try {
                const response = await fetch('/api/announcements', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(announcement)
                });

                if (!response.ok) throw new Error('Duyuru kaydedilemedi');

                addForm.reset();
                form.style.display = 'none';

                renderAnnouncements();
                updateDashboardStats();
                showNotification('Duyuru başarıyla kaydedildi!', 'success');
            } catch (err) {
                console.error(err);
                showNotification('Hata: ' + err.message, 'error');
            }
        });
    }

    renderAnnouncements();
}

async function renderAnnouncements() {
    const list = document.getElementById('announcements-list');
    if (!list) return;

    list.innerHTML = '<p class="empty-message"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</p>';

    try {
        const response = await fetch('/api/announcements');
        if (!response.ok) throw new Error('Duyurular yüklenemedi');
        const announcements = await response.json();

        if (announcements.length === 0) {
            list.innerHTML = '<p class="empty-message">Henüz duyuru eklenmedi.</p>';
            return;
        }

        const linkNames = {
            products: 'Ürünler',
            secondhand: '2. El Cihazlar',
            service: 'Teknik Servis',
            watches: 'Saat',
            contact: 'İletişim',
            gallery: 'FotoGaleri'
        };

        list.innerHTML = announcements.map(a => `
            <div class="announcement-card">
                <span class="announcement-card-badge">${a.badge}</span>
                <span class="announcement-card-text">${a.text}</span>
                <div class="announcement-card-meta">
                    <span class="meta-tag"><i class="fas fa-clock"></i> ${a.duration || 4}sn</span>
                    <span class="meta-tag"><i class="fas fa-link"></i> ${linkNames[a.link] || 'Ürünler'}</span>
                </div>
                <div class="announcement-card-actions">
                    <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteAnnouncement('${a.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        updateDashboardStats();
    } catch (err) {
        list.innerHTML = '<p class="empty-message" style="color:#ef4444;">Duyurular yüklenirken hata oluştu.</p>';
    }
}

async function deleteAnnouncement(id) {
    if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Duyuru silinemedi');

        renderAnnouncements();
        updateDashboardStats();
        showNotification('Duyuru silindi.', 'success');
    } catch (err) {
        showNotification('Hata: ' + err.message, 'error');
    }
}

// ============================================
// SECTION ORDERING (Drag & Drop)
// ============================================
function initSectionOrdering() {
    const container = document.getElementById('sortable-sections');
    const saveBtn = document.getElementById('btn-save-order');

    if (!container) return;

    const items = container.querySelectorAll('.sortable-item');
    let draggedItem = null;

    items.forEach(item => {
        item.addEventListener('dragstart', (e) => {
            draggedItem = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            draggedItem = null;
            container.querySelectorAll('.sortable-item').forEach(i => i.classList.remove('drag-over'));
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            if (item !== draggedItem) {
                item.classList.add('drag-over');
            }
        });

        item.addEventListener('dragleave', () => {
            item.classList.remove('drag-over');
        });

        item.addEventListener('drop', (e) => {
            e.preventDefault();
            item.classList.remove('drag-over');
            if (draggedItem && draggedItem !== item) {
                const allItems = [...container.querySelectorAll('.sortable-item')];
                const fromIdx = allItems.indexOf(draggedItem);
                const toIdx = allItems.indexOf(item);

                if (fromIdx < toIdx) {
                    container.insertBefore(draggedItem, item.nextSibling);
                } else {
                    container.insertBefore(draggedItem, item);
                }
            }
        });
    });

    // Save button
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const currentItems = container.querySelectorAll('.sortable-item');
            const order = [];
            currentItems.forEach((item, index) => {
                order.push({
                    sectionId: item.dataset.sectionId,
                    order: index + 1
                });
            });

            saveToStorage(STORAGE_KEYS.sectionOrder, order);
            showNotification('Bölüm sırası başarıyla kaydedildi!', 'success');
        });
    }
}

// ============================================
// GALLERY MANAGEMENT
// ============================================
function initGallery() {
    const addBtn = document.getElementById('btn-add-gallery');
    const cancelBtn = document.getElementById('btn-cancel-gallery');
    const form = document.getElementById('gallery-form');
    const addForm = document.getElementById('gallery-add-form');
    const uploadArea = document.getElementById('gallery-upload-area');
    const fileInput = document.getElementById('gallery-image');
    const preview = document.getElementById('gallery-preview');

    if (addBtn && form) {
        addBtn.addEventListener('click', () => {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
    }

    if (cancelBtn && form) {
        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none';
            addForm.reset();
            if (preview) preview.innerHTML = '';
        });
    }

    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#2563eb';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                showImagePreview(fileInput.files[0], preview);
            }
        });

        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                showImagePreview(fileInput.files[0], preview);
            }
        });
    }

    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Sıkıştırılmamış resim verisi (veya compressImage ile sıkıştırılmış)
            let imageData = preview.querySelector('img')?.src || null;
            if (imageData && imageData.length > 500000) {
                imageData = compressImage(imageData);
            }

            const photo = {
                id: Date.now().toString(),
                title: document.getElementById('gallery-title').value || 'Fotoğraf',
                image: imageData
            };

            if (!photo.image) {
                alert('Lütfen bir fotoğraf seçin.');
                return;
            }

            try {
                const response = await fetch('/api/gallery', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(photo)
                });

                if (!response.ok) throw new Error('Fotoğraf yüklenemedi');

                addForm.reset();
                preview.innerHTML = '';
                form.style.display = 'none';

                renderGallery();
                updateDashboardStats();
                showNotification('Fotoğraf başarıyla yüklendi!', 'success');
            } catch (err) {
                console.error(err);
                showNotification('Hata: ' + err.message, 'error');
            }
        });
    }

    renderGallery();
}

async function renderGallery() {
    const grid = document.getElementById('gallery-admin-grid');
    if (!grid) return;

    grid.innerHTML = '<p class="empty-message"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</p>';

    try {
        const response = await fetch('/api/gallery');
        if (!response.ok) throw new Error('Galeri yüklenemedi');
        const gallery = await response.json();

        if (gallery.length === 0) {
            grid.innerHTML = '<p class="empty-message">Henüz fotoğraf yüklenmedi.</p>';
            return;
        }

        grid.innerHTML = gallery.map(photo => `
            <div class="gallery-admin-item">
                <img src="${photo.image}" alt="${photo.title}">
                <button class="gallery-delete" onclick="deleteGalleryItem('${photo.id}')" title="Sil">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        updateDashboardStats();
    } catch (err) {
        grid.innerHTML = '<p class="empty-message" style="color:#ef4444;">Galeri yüklenirken hata oluştu.</p>';
    }
}

async function deleteGalleryItem(id) {
    if (!confirm('Bu fotoğrafı silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Fotoğraf silinemedi');

        renderGallery();
        updateDashboardStats();
        showNotification('Fotoğraf silindi.', 'success');
    } catch (err) {
        showNotification('Hata: ' + err.message, 'error');
    }
}

// ============================================
// 2. EL CİHAZLAR MANAGEMENT
// ============================================
function initSecondHand() {
    console.log("Initializing Second Hand Manager...");
    const addBtn = document.getElementById('btn-add-secondhand');
    const cancelBtn = document.getElementById('btn-cancel-secondhand');
    const form = document.getElementById('secondhand-form');
    const addForm = document.getElementById('secondhand-add-form');
    const uploadArea = document.getElementById('sh-upload-area');
    const fileInput = document.getElementById('sh-image');
    const preview = document.getElementById('sh-preview');

    if (addBtn && form) {
        addBtn.addEventListener('click', () => {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
            document.getElementById('secondhand-form-title').innerHTML = '<i class="fas fa-recycle"></i> Yeni 2. El Ürün Ekle';
            document.getElementById('edit-secondhand-id').value = '';
            if (addForm) addForm.reset();
            if (preview) preview.innerHTML = '';
        });
    }

    if (cancelBtn && form) {
        cancelBtn.addEventListener('click', () => {
            form.style.display = 'none';
            if (addForm) addForm.reset();
            document.getElementById('edit-secondhand-id').value = '';
            if (preview) preview.innerHTML = '';
        });
    }

    // File upload
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                showImagePreview(fileInput.files[0], preview);
            }
        });
    }

    // Submit form
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            try {
                const editId = document.getElementById('edit-secondhand-id').value;
                const category = document.getElementById('sh-category').value;

                let imageData = preview ? (preview.querySelector('img')?.src || null) : null;
                if (imageData && imageData.length > 500000) {
                    imageData = compressImage(imageData);
                }

                const specs = {
                    storage: document.getElementById('sh-storage').value || '',
                    ram: document.getElementById('sh-ram').value || '',
                    battery: document.getElementById('sh-battery').value || '',
                    screen: document.getElementById('sh-screen').value || '',
                    processor: document.getElementById('sh-processor').value || '',
                    color: document.getElementById('sh-color').value || ''
                };

                const product = {
                    id: editId ? editId : Date.now().toString(),
                    name: document.getElementById('sh-name').value,
                    brand: document.getElementById('sh-brand').value,
                    category: category,
                    condition: 'ikinci-el',
                    price: document.getElementById('sh-price').value || 0,
                    description: document.getElementById('sh-desc').value,
                    image: imageData,
                    specs: specs
                };

                const saveBtn = addForm.querySelector('button[type="submit"]');
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
                saveBtn.disabled = true;

                if (editId) {
                    const existing = window.currentSecondHandProducts?.find(p => p.id === editId);
                    product.code = existing?.code || generateProductCode(category);
                    if (!product.image && existing?.image) {
                        product.image = existing.image;
                    }
                } else {
                    product.code = generateProductCode(category);
                }

                const endpoint = editId ? `/api/products/${product.id}` : '/api/products';
                const method = editId ? 'PUT' : 'POST';

                const response = await fetch(endpoint, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product)
                });

                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;

                if (!response.ok) {
                    const errObj = await response.json();
                    throw new Error(errObj.error || `Server fault: ${response.status}`);
                }

                showNotification(editId ? '2. El ürün güncellendi!' : '2. El ürün eklendi!', 'success');

                addForm.reset();
                document.getElementById('edit-secondhand-id').value = '';
                if (preview) preview.innerHTML = '';
                form.style.display = 'none';

                renderSecondHandProducts();
                updateDashboardStats();
            } catch (err) {
                console.error('2. El ürün kaydetme hatası:', err);
                showNotification('Hata: ' + err.message, 'error');
                const saveBtn = addForm.querySelector('button[type="submit"]');
                if (saveBtn) {
                    saveBtn.innerHTML = '<i class="fas fa-save"></i> Kaydet';
                    saveBtn.disabled = false;
                }
            }
        });
    }

    renderSecondHandProducts();
}

window.currentSecondHandProducts = [];

async function renderSecondHandProducts() {
    const listTelefon = document.getElementById('secondhand-list-telefon');
    const listBilgisayar = document.getElementById('secondhand-list-bilgisayar');
    if (!listTelefon || !listBilgisayar) return;

    listTelefon.innerHTML = '<p class="empty-message"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</p>';
    listBilgisayar.innerHTML = '<p class="empty-message"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</p>';

    try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('API hatası');
        const allProducts = await response.json();
        const products = allProducts.filter(p => p.condition === 'ikinci-el');
        window.currentSecondHandProducts = products;

        const telefons = products.filter(p => p.category === 'telefon');
        const bilgisayars = products.filter(p => p.category === 'bilgisayar');

        renderItems(telefons, listTelefon, 'Henüz 2. El telefon eklenmedi.');
        renderItems(bilgisayars, listBilgisayar, 'Henüz 2. El bilgisayar eklenmedi.');

    } catch (err) {
        listTelefon.innerHTML = '<p class="empty-message" style="color:#ef4444;">Hata oluştu.</p>';
        listBilgisayar.innerHTML = '<p class="empty-message" style="color:#ef4444;">Hata oluştu.</p>';
    }

    function renderItems(items, container, emptyMsg) {
        if (items.length === 0) {
            container.innerHTML = `<p class="empty-message">${emptyMsg}</p>`;
            return;
        }

        container.innerHTML = items.map(p => {
            const specs = (typeof p.specs === 'string' ? JSON.parse(p.specs || '{}') : p.specs) || {};
            const specItems = [
                specs.storage ? `<span class="sh-spec-tag"><i class="fas fa-hdd"></i> ${specs.storage}</span>` : '',
                specs.ram ? `<span class="sh-spec-tag"><i class="fas fa-memory"></i> ${specs.ram}</span>` : ''
            ].filter(Boolean).join('');

            return `
            <div class="secondhand-admin-card-list">
                <div class="sh-card-preview">
                    ${p.image ? `<img src="${p.image}" alt="${p.name}">` : '<div class="no-image-sm"><i class="fas fa-image"></i></div>'}
                </div>
                <div class="sh-card-details">
                    <strong>${p.name}</strong>
                    <div class="sh-specs-compact">${specItems}</div>
                    ${p.price && Number(p.price) > 0 ? `<span class="price-badge-sm">₺${Number(p.price).toLocaleString('tr-TR')}</span>` : '<span class="price-badge-sm" style="color: #9ca3af; background: rgba(156, 163, 175, 0.1);">Fiyat Belirtilmemiş</span>'}
                </div>
                <div class="sh-card-actions">
                    <button class="btn-admin-icon" onclick="editSecondHand('${p.id}')" title="Düzenle">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-admin-icon danger" onclick="deleteSecondHand('${p.id}')" title="Sil">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            `;
        }).join('');
    }
}

function editSecondHand(id) {
    const product = window.currentSecondHandProducts?.find(p => p.id === id);
    if (!product) return showNotification('Ürün bulunamadı!', 'error');

    const specs = (typeof product.specs === 'string' ? JSON.parse(product.specs || '{}') : product.specs) || {};

    document.getElementById('edit-secondhand-id').value = product.id;
    document.getElementById('sh-name').value = product.name || '';
    document.getElementById('sh-brand').value = product.brand || '';
    document.getElementById('sh-category').value = product.category || '';
    document.getElementById('sh-price').value = product.price || '';
    document.getElementById('sh-desc').value = product.description || '';
    document.getElementById('sh-storage').value = specs.storage || '';
    document.getElementById('sh-ram').value = specs.ram || '';
    document.getElementById('sh-battery').value = specs.battery || '';
    document.getElementById('sh-screen').value = specs.screen || '';
    document.getElementById('sh-processor').value = specs.processor || '';
    document.getElementById('sh-color').value = specs.color || '';

    const preview = document.getElementById('sh-preview');
    if (preview && product.image) {
        preview.innerHTML = `<img src="${product.image}" alt="Preview" style="max-width:100%; height:100%; object-fit:cover;">`;
    } else if (preview) {
        preview.innerHTML = '';
    }

    document.getElementById('secondhand-form-title').innerHTML = '<i class="fas fa-edit"></i> 2. El Ürün Düzenle: ' + (product.code || product.name);
    const form = document.getElementById('secondhand-form');
    if (form) {
        form.style.display = 'block';
        form.scrollIntoView({ behavior: 'smooth' });
    }
}

async function deleteSecondHand(id) {
    if (!confirm('Bu 2. El ürünü silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Ürün silinemedi');

        renderSecondHandProducts();
        updateDashboardStats();
        showNotification('2. El ürün silindi.', 'success');
    } catch (err) {
        showNotification('Hata: ' + err.message, 'error');
    }
}

// ============================================
// CAROUSEL MANAGEMENT
// ============================================
// ============================================
// CAROUSEL MANAGEMENT
// ============================================
function initCarousel() {
    console.log("Initializing Carousel Manager...");
    const addBtn = document.getElementById('btn-add-carousel');
    const cancelBtn = document.getElementById('btn-cancel-carousel');
    const form = document.getElementById('carousel-form');
    const addForm = document.getElementById('carousel-add-form');
    const uploadArea = document.getElementById('carousel-upload-area');
    const fileInput = document.getElementById('carousel-image');
    const preview = document.getElementById('carousel-preview');

    if (addBtn && form) {
        addBtn.onclick = () => {
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        };
    }

    if (cancelBtn && form) {
        cancelBtn.onclick = () => {
            form.style.display = 'none';
            if (addForm) addForm.reset();
            if (preview) preview.innerHTML = '';
        };
    }

    // File upload
    if (uploadArea && fileInput) {
        uploadArea.onclick = () => fileInput.click();
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                showImagePreview(fileInput.files[0], preview);
            }
        });
    }

    // Submit
    if (addForm) {
        addForm.onsubmit = async (e) => {
            e.preventDefault();

            let imageData = preview?.querySelector('img')?.src || null;
            if (!imageData) {
                alert('Lütfen bir fotoğraf seçin.');
                return;
            }
            if (imageData.length > 500000) {
                imageData = compressImage(imageData);
            }

            const item = {
                id: Date.now().toString(),
                title: document.getElementById('carousel-title').value || '',
                target_page: document.getElementById('carousel-target').value,
                image: imageData
            };

            try {
                const response = await fetch('/api/carousel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });

                if (!response.ok) throw new Error('Carousel fotoğrafı yüklenemedi');

                addForm.reset();
                if (preview) preview.innerHTML = '';
                form.style.display = 'none';

                renderCarousel();
                showNotification('Fotoğraf başarıyla yüklendi!', 'success');
            } catch (err) {
                showNotification('Hata: ' + err.message, 'error');
            }
        };
    }

    renderCarousel();
}

async function renderCarousel() {
    const grid = document.getElementById('carousel-admin-grid');
    if (!grid) return;

    grid.innerHTML = '<p class="empty-message"><i class="fas fa-spinner fa-spin"></i> Yükleniyor...</p>';

    try {
        const response = await fetch('/api/carousel');
        if (!response.ok) throw new Error('Carousel yüklenemedi');
        const images = await response.json();

        if (images.length === 0) {
            grid.innerHTML = '<p class="empty-message">Henüz fotoğraf eklenmedi.</p>';
            return;
        }

        const pageLabels = {
            home: 'Anasayfa Hero',
            secondhand: '2. El Arkaplan',
            service: 'Teknik Servis'
        };

        grid.innerHTML = images.map(img => `
            <div class="gallery-admin-item">
                <img src="${img.image}" alt="${img.title || 'Carousel'}">
                <div class="carousel-item-overlay">
                    <span class="page-badge">${pageLabels[img.target_page] || img.target_page}</span>
                    <button class="gallery-delete" onclick="deleteCarouselImage('${img.id}')" title="Sil">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = '<p class="empty-message" style="color:#ef4444;">Yüklenirken hata oluştu.</p>';
    }
}

async function deleteCarouselImage(id) {
    if (!confirm('Bu carousel fotoğrafını silmek istediğinize emin misiniz?')) return;

    try {
        const response = await fetch(`/api/carousel/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Fotoğraf silinemedi');

        renderCarousel();
        showNotification('Carousel fotoğrafı silindi.', 'success');
    } catch (err) {
        showNotification('Hata: ' + err.message, 'error');
    }
}


// ============================================
// DASHBOARD STATS
// ============================================
async function updateDashboardStats() {
    try {
        const [prodRes, annRes, galRes] = await Promise.all([
            fetch('/api/products'),
            fetch('/api/announcements'),
            fetch('/api/gallery')
        ]);

        const products = prodRes.ok ? await prodRes.json() : [];
        const announcements = annRes.ok ? await annRes.json() : [];
        const gallery = galRes.ok ? await galRes.json() : [];

        const statProducts = document.getElementById('stat-products');
        const statAnnouncements = document.getElementById('stat-announcements');
        const statGallery = document.getElementById('stat-gallery');

        if (statProducts) statProducts.textContent = products.length;
        if (statAnnouncements) statAnnouncements.textContent = announcements.length;
        if (statGallery) statGallery.textContent = gallery.length;
    } catch (err) {
        console.error('Stats update error:', err);
    }
}

// ============================================
// UTILITIES
// ============================================
function getFromStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
        return [];
    }
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (err) {
        console.error('localStorage kaydetme hatası:', err);
        if (err.name === 'QuotaExceededError' || err.code === 22) {
            showNotification('Depolama alanı dolu! Lütfen bazı ürünleri veya fotoğrafları silin.', 'error');
        } else {
            showNotification('Veri kaydedilirken bir hata oluştu: ' + err.message, 'error');
        }
        return false;
    }
}

// Büyük resimleri sıkıştır (localStorage limiti için)
function compressImage(base64Str) {
    try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = base64Str;

        const maxSize = 800;
        let width = img.naturalWidth || img.width || maxSize;
        let height = img.naturalHeight || img.height || maxSize;

        if (width > maxSize || height > maxSize) {
            if (width > height) {
                height = Math.round(height * maxSize / width);
                width = maxSize;
            } else {
                width = Math.round(width * maxSize / height);
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', 0.7);
    } catch (err) {
        console.error('Resim sıkıştırma hatası:', err);
        return base64Str;
    }
}

function showImagePreview(file, container) {
    if (!container) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        container.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 14px 24px;
        border-radius: 10px;
        font-size: 0.9rem;
        font-weight: 500;
        color: #fff;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Ürün Kodu Üretici
function generateProductCode(category) {
    const prefixMap = {
        'telefon': 'TE',
        'bilgisayar': 'BI',
        'saat': 'SA',
        'aksesuar': 'AK',
        'ikinci-el': '2E'
    };
    const prefix = prefixMap[category] || 'UR';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${randomNum}`;
}

// Ürün Düzenleme
function editProduct(id) {
    try {
        const product = window.currentAdminProducts?.find(p => p.id === id);
        if (!product) {
            showNotification('Ürün bulunamadı!', 'error');
            return;
        }

        // Formu doldur
        const editIdField = document.getElementById('edit-product-id');
        const nameField = document.getElementById('product-name');
        const brandField = document.getElementById('product-brand');
        const categoryField = document.getElementById('product-category');
        const priceField = document.getElementById('product-price');
        const conditionField = document.getElementById('product-condition');
        const descField = document.getElementById('product-desc');
        const formTitle = document.getElementById('product-form-title');
        const productForm = document.getElementById('product-form');
        const preview = document.getElementById('product-preview');

        if (editIdField) editIdField.value = product.id;
        if (nameField) nameField.value = product.name || '';
        if (brandField) brandField.value = product.brand || '';
        if (categoryField) categoryField.value = product.category || '';
        if (priceField) priceField.value = product.price || '';
        if (conditionField) conditionField.value = product.condition || 'sifir';
        if (descField) descField.value = product.description || '';

        // Fotoğraf önizleme
        if (preview) {
            if (product.image) {
                preview.innerHTML = `<img src="${product.image}" alt="Preview" style="max-width:100%; height:100%; object-fit:cover;">`;
            } else {
                preview.innerHTML = '';
            }
        }

        if (formTitle) formTitle.textContent = 'Ürün Düzenle: ' + (product.code || product.name);
        if (productForm) {
            productForm.style.display = 'block';
            productForm.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (err) {
        console.error('Ürün düzenleme hatası:', err);
        showNotification('Ürün düzenlenirken bir hata oluştu: ' + err.message, 'error');
    }
}

// Make functions globally accessible
window.deleteProduct = deleteProduct;
window.deleteAnnouncement = deleteAnnouncement;
window.deleteGalleryItem = deleteGalleryItem;
window.editProduct = editProduct;
window.deleteSecondHand = deleteSecondHand;
window.editSecondHand = editSecondHand;
window.deleteCarouselImage = deleteCarouselImage;
window.renderCarousel = renderCarousel;
window.editSecondHand = editSecondHand;
window.deleteSecondHand = deleteSecondHand;
window.deleteCarouselImage = deleteCarouselImage;
