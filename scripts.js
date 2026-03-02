/**
 * CLK Teknoloji — Modern Modüler JavaScript
 * ============================================
 * - SPA navigasyon
 * - Carousel (hero slider)
 * - Announcement band rotasyonu (localStorage bağlantılı)
 * - Section sıralama (API-ready)
 * - Desktop dropdown menü
 * - Mobil hamburger menü
 * - Scroll animasyonları (Intersection Observer)
 * - Scroll-to-top
 * - 2. El Cihazlar sayfası (localStorage bağlantılı)
 * - Galeri bağlantısı (localStorage)
 * - WhatsApp mesaj entegrasyonu
 */

// ============================================
// STATE
// ============================================
const state = {
    currentSection: 'home',
    currentSlide: 0,
    slideInterval: null,
    menuOpen: false,
    announcementIndex: 0,
    announcementInterval: null,
    announcementDuration: 4000 // default
};

// Section hierarchy for breadcrumb generation
const sectionHierarchy = {
    home: { title: 'Anasayfa', parent: null },
    about: { title: 'Hakkımızda', parent: 'Kurumsal' },
    team: { title: 'Ekibimiz', parent: 'Kurumsal' },
    products: { title: 'Ürün Satışı', parent: 'Hizmetler' },
    secondhand: { title: '2. El Cihazlar', parent: 'Hizmetler' },
    service: { title: 'Teknik Servis', parent: 'Hizmetler' },
    watches: { title: 'Saat', parent: 'Hizmetler' },
    gallery: { title: 'FotoGaleri', parent: null },
    contact: { title: 'İletişim', parent: null }
};

// WhatsApp number
const WHATSAPP_NUMBER = '+905071561515';

// DOM references
const elements = {};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    initCarousel();
    initAccordions();
    initAnnouncementBand();
    initScrollAnimations();
    initScrollEffects();
    loadSectionOrder();
    loadGallery();
    loadSecondHandProducts();
    initWhatsAppContactForm();
    handleInitialHash();
});

// ============================================
// DOM ELEMENT REFERENCES
// ============================================
function initElements() {
    elements.header = document.getElementById('site-header');
    elements.hamburger = document.getElementById('hamburger-btn');
    elements.mobileMenu = document.getElementById('mobile-menu');
    elements.breadcrumb = document.getElementById('breadcrumb');
    elements.mainContent = document.getElementById('main-content');
    elements.scrollTopBtn = document.getElementById('scroll-top-btn');
    elements.announcementSlider = document.getElementById('announcement-slider');
    elements.announcementCta = document.getElementById('announcement-cta');
    elements.announcementPrev = document.getElementById('announcement-prev');
    elements.announcementNext = document.getElementById('announcement-next');

    // Carousel elements
    elements.carousel = document.getElementById('hero-carousel');
    if (elements.carousel) {
        elements.slides = elements.carousel.querySelectorAll('.carousel-slide');
        elements.indicators = elements.carousel.querySelectorAll('.indicator');
        elements.prevBtn = elements.carousel.querySelector('.carousel-control.prev');
        elements.nextBtn = elements.carousel.querySelector('.carousel-control.next');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    // Hamburger (mobile)
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', toggleMenu);
    }

    // Mobile submenu toggles
    document.querySelectorAll('.submenu-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => toggleSubmenu(toggle));
    });

    // Navigation links (mobile)
    document.querySelectorAll('.mobile-menu-overlay .nav-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = link.dataset.section;
            if (section) {
                e.preventDefault();
                navigateToSection(section);
                closeMenu();
            }
        });
    });

    // Desktop dropdown links
    document.querySelectorAll('.dropdown-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = link.dataset.section;
            if (section) {
                e.preventDefault();
                navigateToSection(section);
            }
        });
    });

    // Desktop direct links
    document.querySelectorAll('.desktop-link[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = link.dataset.section;
            if (section) {
                e.preventDefault();
                navigateToSection(section);
            }
        });
    });

    // Footer links
    document.querySelectorAll('.footer-menu a[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = link.dataset.section;
            if (section) {
                e.preventDefault();
                navigateToSection(section);
            }
        });
    });

    // Scroll to top
    if (elements.scrollTopBtn) {
        elements.scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Scroll listener for header shadow + scroll-top button
    window.addEventListener('scroll', handleScroll);

    // Hash change (back/forward)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash && sectionHierarchy[hash]) {
            navigateToSection(hash);
        }
    });

    // Announcement arrows
    if (elements.announcementPrev) {
        elements.announcementPrev.addEventListener('click', () => {
            changeAnnouncement(-1);
        });
    }
    if (elements.announcementNext) {
        elements.announcementNext.addEventListener('click', () => {
            changeAnnouncement(1);
        });
    }
}

// ============================================
// MOBILE MENU
// ============================================
function toggleMenu() {
    state.menuOpen = !state.menuOpen;
    elements.hamburger.classList.toggle('active', state.menuOpen);
    elements.mobileMenu.classList.toggle('active', state.menuOpen);
    elements.hamburger.setAttribute('aria-expanded', state.menuOpen);
    document.body.style.overflow = state.menuOpen ? 'hidden' : '';
}

function closeMenu() {
    state.menuOpen = false;
    elements.hamburger.classList.remove('active');
    elements.mobileMenu.classList.remove('active');
    elements.hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function toggleSubmenu(toggle) {
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !isExpanded);
    const submenu = toggle.nextElementSibling;
    if (submenu) submenu.classList.toggle('active');
}

// ============================================
// SECTION NAVIGATION (SPA)
// ============================================
function navigateToSection(sectionId) {
    if (!sectionHierarchy[sectionId]) return;

    // Hide all sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));

    // Show target
    const target = document.getElementById(sectionId);
    if (target) {
        target.classList.add('active');
        state.currentSection = sectionId;
        window.location.hash = sectionId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        updateBreadcrumb(sectionId);
        closeMenu();

        // Re-trigger scroll reveal for visible elements
        setTimeout(() => {
            document.querySelectorAll('.reveal-on-scroll').forEach(el => {
                if (isElementInViewport(el)) {
                    el.classList.add('revealed');
                }
            });
        }, 300);

        // Restart carousel if home
        if (sectionId === 'home') {
            startCarousel();
            startAnnouncementBand();
        } else {
            stopCarousel();
            stopAnnouncementBand();
        }

        // Load 2. el products when switching to that page
        if (sectionId === 'secondhand') {
            loadSecondHandProducts();
        }

        // Load main products when switching to that page
        if (sectionId === 'products') {
            loadMainProducts();
        }

        // Load gallery when switching to that page
        if (sectionId === 'gallery') {
            loadGallery();
        }
    }
}

function handleInitialHash() {
    const hash = window.location.hash.substring(1);
    if (hash && sectionHierarchy[hash]) {
        navigateToSection(hash);
    } else {
        navigateToSection('home');
    }
}

// ============================================
// BREADCRUMB
// ============================================
function updateBreadcrumb(sectionId) {
    if (!elements.breadcrumb) return;

    if (sectionId === 'home') {
        elements.breadcrumb.classList.remove('active');
        elements.breadcrumb.innerHTML = '';
        return;
    }

    const section = sectionHierarchy[sectionId];
    if (!section) return;

    elements.breadcrumb.classList.add('active');

    let items = `<li><a href="#home" onclick="navigateToSection('home'); return false;">Anasayfa</a></li>`;

    if (section.parent) {
        items += `<li><span class="current">${section.parent}</span></li>`;
    }

    items += `<li><span class="current">${section.title}</span></li>`;

    elements.breadcrumb.innerHTML = `<ol>${items}</ol>`;
}

// ============================================
// CAROUSEL
// ============================================
function initCarousel() {
    if (!elements.carousel || !elements.slides || elements.slides.length === 0) return;

    // Control buttons
    if (elements.prevBtn) {
        elements.prevBtn.addEventListener('click', () => changeSlide(-1));
    }
    if (elements.nextBtn) {
        elements.nextBtn.addEventListener('click', () => changeSlide(1));
    }

    // Indicators
    if (elements.indicators) {
        elements.indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                goToSlide(parseInt(indicator.dataset.slide));
            });
        });
    }

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    elements.carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    elements.carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            changeSlide(diff > 0 ? 1 : -1);
        }
    }, { passive: true });

    // Auto-play
    startCarousel();

    // Pause on hover
    elements.carousel.addEventListener('mouseenter', stopCarousel);
    elements.carousel.addEventListener('mouseleave', startCarousel);
}

function changeSlide(direction) {
    const totalSlides = elements.slides.length;
    state.currentSlide = (state.currentSlide + direction + totalSlides) % totalSlides;
    updateCarousel();
    stopCarousel();
    startCarousel();
}

function goToSlide(index) {
    state.currentSlide = index;
    updateCarousel();
    stopCarousel();
    startCarousel();
}

function updateCarousel() {
    if (!elements.slides) return;

    elements.slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === state.currentSlide);
    });

    if (elements.indicators) {
        elements.indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === state.currentSlide);
        });
    }
}

function startCarousel() {
    stopCarousel();
    state.slideInterval = setInterval(() => changeSlide(1), 6000);
}

function stopCarousel() {
    if (state.slideInterval) {
        clearInterval(state.slideInterval);
        state.slideInterval = null;
    }
}

// ============================================
// ACCORDION
// ============================================
function initAccordions() {
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', () => {
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            header.setAttribute('aria-expanded', !isExpanded);
            const content = header.nextElementSibling;
            if (content) content.classList.toggle('active');
        });
    });
}

// ============================================
// ANNOUNCEMENT BAND (localStorage bağlantılı)
// ============================================
function initAnnouncementBand() {
    if (!elements.announcementSlider) return;

    // Try to load announcements from admin panel (localStorage)
    loadAnnouncementsFromStorage();

    startAnnouncementBand();
}

function loadAnnouncementsFromStorage() {
    const band = document.getElementById('announcement-band');
    try {
        const saved = localStorage.getItem('clk_admin_announcements');

        let announcements = [];
        if (saved) {
            announcements = JSON.parse(saved);
        }

        if (!Array.isArray(announcements) || announcements.length === 0) {
            // Hide the announcement band if empty
            if (band) band.style.display = 'none';
            document.documentElement.style.setProperty('--announcement-height', '0px');
            return;
        }

        // Show the announcement band if there are announcements
        if (band) band.style.display = 'block';
        document.documentElement.style.setProperty('--announcement-height', '52px');

        // Replace default announcement items with admin ones
        elements.announcementSlider.innerHTML = announcements.map((a, i) => `
            <div class="announcement-item ${i === 0 ? 'active' : ''}" data-duration="${a.duration || 4}" data-link="${a.link || 'products'}">
                <span class="announcement-badge">${a.badge}</span>
                <span class="announcement-text">${a.text}</span>
            </div>
        `).join('');

        state.announcementIndex = 0;

        // Set the first announcement's link and duration
        updateAnnouncementCta();

    } catch (e) {
        console.warn('Could not load announcements from storage:', e);
        if (band) band.style.display = 'none';
        document.documentElement.style.setProperty('--announcement-height', '0px');
    }
}

function updateAnnouncementCta() {
    const items = elements.announcementSlider.querySelectorAll('.announcement-item');
    if (items.length === 0 || !elements.announcementCta) return;

    const currentItem = items[state.announcementIndex];
    const link = currentItem?.dataset?.link || 'products';

    elements.announcementCta.href = `#${link}`;
    elements.announcementCta.onclick = function () {
        navigateToSection(link);
        return false;
    };
}

function startAnnouncementBand() {
    stopAnnouncementBand();

    // Get duration for current announcement
    const items = elements.announcementSlider?.querySelectorAll('.announcement-item');
    if (!items || items.length === 0) return;

    const currentItem = items[state.announcementIndex];
    const duration = (parseInt(currentItem?.dataset?.duration) || 4) * 1000;

    state.announcementInterval = setInterval(rotateAnnouncement, duration);
}

function stopAnnouncementBand() {
    if (state.announcementInterval) {
        clearInterval(state.announcementInterval);
        state.announcementInterval = null;
    }
}

function rotateAnnouncement() {
    if (!elements.announcementSlider) return;

    const items = elements.announcementSlider.querySelectorAll('.announcement-item');
    if (items.length === 0) return;

    items[state.announcementIndex].classList.remove('active');
    state.announcementIndex = (state.announcementIndex + 1) % items.length;
    items[state.announcementIndex].classList.add('active');

    updateAnnouncementCta();

    // Restart with new duration
    stopAnnouncementBand();
    startAnnouncementBand();
}

function changeAnnouncement(direction) {
    if (!elements.announcementSlider) return;

    const items = elements.announcementSlider.querySelectorAll('.announcement-item');
    if (items.length === 0) return;

    items[state.announcementIndex].classList.remove('active');
    state.announcementIndex = (state.announcementIndex + direction + items.length) % items.length;
    items[state.announcementIndex].classList.add('active');

    updateAnnouncementCta();

    // Restart timer
    stopAnnouncementBand();
    startAnnouncementBand();
}

// ============================================
// GALLERY (localStorage bağlantılı)
// ============================================
function loadGallery() {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    try {
        const saved = localStorage.getItem('clk_admin_gallery');
        if (!saved) return;

        const gallery = JSON.parse(saved);
        if (!Array.isArray(gallery) || gallery.length === 0) return;

        grid.innerHTML = gallery.map(photo => `
            <div class="gallery-item glass-card">
                <img src="${photo.image}" alt="${photo.title || 'Fotoğraf'}" loading="lazy" onclick="openGalleryLightbox('${photo.image}', '${photo.title || ''}')">
            </div>
        `).join('');
    } catch (e) {
        console.warn('Could not load gallery:', e);
    }
}

// Simple lightbox for gallery
function openGalleryLightbox(src, title) {
    const existing = document.querySelector('.gallery-lightbox');
    if (existing) existing.remove();

    const lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-overlay" onclick="this.parentElement.remove()"></div>
        <div class="lightbox-content">
            <img src="${src}" alt="${title}">
            ${title ? `<p class="lightbox-title">${title}</p>` : ''}
            <button class="lightbox-close" onclick="this.closest('.gallery-lightbox').remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.body.appendChild(lightbox);
}

// ============================================
// 2. EL CİHAZLAR (localStorage bağlantılı)
// ============================================
function loadSecondHandProducts() {
    const grid = document.getElementById('secondhand-grid');
    const parallaxBg = document.getElementById('secondhand-parallax');
    if (!grid) return;

    // Load parallax background
    try {
        const bgImage = localStorage.getItem('clk_secondhand_bg');
        if (bgImage && parallaxBg) {
            parallaxBg.style.backgroundImage = `url(${bgImage})`;
            parallaxBg.classList.add('has-image');
        }
    } catch (e) { /* ignore */ }

    // Load products
    try {
        const saved = localStorage.getItem('clk_admin_products');
        if (!saved) return;

        const allProducts = JSON.parse(saved);
        const secondHandProducts = allProducts.filter(p => p.condition === 'ikinci-el');

        if (secondHandProducts.length === 0) return;

        grid.innerHTML = secondHandProducts.map(p => `
            <div class="secondhand-card glass-card" style="position: relative;">
                ${p.code ? `<span class="product-item-code" style="position: absolute; top: 10px; right: 10px; background: rgba(37, 99, 235, 0.9); color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; z-index: 2;">Kod: ${p.code}</span>` : ''}
                <div class="secondhand-card-image">
                    ${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : '<div class="no-image-placeholder"><i class="fas fa-mobile-alt"></i></div>'}
                    ${p.condition === 'ikinci-el' ? '<span class="condition-badge">2. El</span>' : ''}
                </div>
                <div class="secondhand-card-body">
                    <h3 class="secondhand-card-title">${p.name}</h3>
                    ${p.brand ? `<span class="secondhand-brand"><i class="fas fa-tag"></i> ${p.brand}</span>` : ''}
                    ${p.description ? `<p class="secondhand-desc">${p.description}</p>` : ''}
                    ${p.price ? `<div class="secondhand-price">₺${Number(p.price).toLocaleString('tr-TR')}</div>` : ''}
                    <a href="${getWhatsAppUrl(p.name, p.brand, p.code)}" target="_blank" class="btn btn-whatsapp-sm">
                        <i class="fab fa-whatsapp"></i> Mesaj At
                    </a>
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.warn('Could not load second-hand products:', e);
    }
}

// ============================================
// ANA ÜRÜNLER (localStorage bağlantılı)
// ============================================
function loadMainProducts() {
    try {
        const saved = localStorage.getItem('clk_admin_products');
        if (!saved) return;

        const allProducts = JSON.parse(saved);

        // Kategori container'ları
        const containers = {
            'telefon': document.getElementById('products-telefon'),
            'bilgisayar': document.getElementById('products-bilgisayar'),
            'saat': document.getElementById('products-saat'),
            'aksesuar': document.getElementById('products-aksesuar')
        };

        // Her kategori için container'ı temizle
        Object.values(containers).forEach(container => {
            if (container) container.innerHTML = '';
        });

        // 2. El OLMAYAN ürünleri filtrele ve kategorilere dağıt
        const mainProducts = allProducts.filter(p => p.condition !== 'ikinci-el');

        mainProducts.forEach(p => {
            const container = containers[p.category];
            if (!container) return; // Geçersiz kategori ise atla

            const productHtml = `
                <div class="product-item glass-card product-card-hover" style="position: relative;">
                    ${p.code ? `<span class="product-item-code" style="position: absolute; top: 10px; right: 10px; background: rgba(37, 99, 235, 0.9); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600; z-index: 2; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">Kod: ${p.code}</span>` : ''}
                    <div class="product-item-image">
                        ${p.image ? `<img src="${p.image}" alt="${p.name}" loading="lazy">` : '<div class="no-image-placeholder"><i class="fas fa-box"></i></div>'}
                        ${p.description ? `<div class="product-item-desc-overlay"><p>${p.description}</p></div>` : ''}
                    </div>
                    <div class="product-item-details">
                        <h3 class="product-item-title">${p.name}</h3>
                        ${p.brand ? `<span class="product-item-brand"><i class="fas fa-tag"></i> ${p.brand}</span>` : ''}
                        ${p.price ? `<div class="product-item-price">₺${Number(p.price).toLocaleString('tr-TR')}</div>` : ''}
                        <a href="${getWhatsAppUrl(p.name, p.brand, p.code)}" target="_blank" class="btn btn-whatsapp-sm mt-3" style="width: 100%; justify-content: center; font-size: 0.85rem; padding: 6px;">
                            <i class="fab fa-whatsapp"></i> Mesaj At
                        </a>
                    </div>
                </div>
            `;
            container.innerHTML += productHtml;
        });

        // Boş kategorilere uyarı mesajı ekle
        Object.keys(containers).forEach(key => {
            const container = containers[key];
            if (container && container.innerHTML.trim() === '') {
                container.innerHTML = `<div class="empty-category-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #a0aec0; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">Bu kategoride henüz ürün bulunmamaktadır.</div>`;
            }
        });

    } catch (e) {
        console.warn('Could not load main products:', e);
    }
}

// ============================================
// WHATSAPP MESAJ
// ============================================
function getWhatsAppUrl(productName, brand, code) {
    const brandText = brand ? ` (${brand})` : '';
    const codeText = code ? ` [Kod: ${code}]` : '';
    const message = encodeURIComponent(`Merhaba,${codeText} ${productName}${brandText} hakkında bilgi almak istiyorum.`);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}

function sendWhatsAppMessage(productName, brand, code) {
    window.open(getWhatsAppUrl(productName, brand, code), '_blank');
}

function initWhatsAppContactForm() {
    const form = document.getElementById('whatsapp-contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('wp-name')?.value || '';
        const subject = document.getElementById('wp-subject')?.value || 'Genel Bilgi';
        const messageText = document.getElementById('wp-message')?.value || '';

        let fullMessage = `Merhaba, ben ${name}.`;
        fullMessage += `\nKonu: ${subject}`;
        if (messageText) {
            fullMessage += `\n\n${messageText}`;
        }

        const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;

        // Önce tabı aç
        window.open(url, '_blank');

        // Formu temizle (yeni sekme açıldıktan hemen sonra temizlenmesi için form reset'i kullanıyoruz)
        // Eğer hemen temizlenmezse diye ufak bir timeout ekliyoruz
        setTimeout(() => {
            if (form) form.reset();
        }, 100);
    });
}

// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom > 0
    );
}

// ============================================
// SCROLL EFFECTS (Header shadow, scroll-top, parallax)
// ============================================
function initScrollEffects() {
    handleScroll(); // initial state
}

function handleScroll() {
    const scrollY = window.scrollY;

    // Header shadow on scroll
    if (elements.header) {
        elements.header.classList.toggle('scrolled', scrollY > 50);
    }

    // Scroll to top button
    if (elements.scrollTopBtn) {
        elements.scrollTopBtn.classList.toggle('visible', scrollY > 400);
    }

    // Parallax effect for 2nd hand page
    const parallaxBg = document.getElementById('secondhand-parallax');
    if (parallaxBg && parallaxBg.classList.contains('has-image')) {
        const offset = scrollY * 0.3;
        parallaxBg.style.backgroundPositionY = `${offset}px`;
    }
}

// ============================================
// SECTION ORDERING (API-Ready)
// ============================================
function loadSectionOrder() {
    const saved = localStorage.getItem('clk_section_order');
    if (saved) {
        try {
            const order = JSON.parse(saved);
            reorderSections(order);
        } catch (e) {
            console.warn('Section order parse error:', e);
        }
    }
}

function reorderSections(order) {
    const homeSection = document.getElementById('home');
    if (!homeSection) return;

    const sections = homeSection.querySelectorAll('.home-section[data-section-id]');
    if (sections.length === 0) return;

    const sortedOrder = order
        .sort((a, b) => a.order - b.order)
        .map(item => item.sectionId);

    const footer = homeSection.querySelector('.footer-section');

    sortedOrder.forEach(id => {
        const section = homeSection.querySelector(`.home-section[data-section-id="${id}"]`);
        if (section && footer) {
            homeSection.insertBefore(section, footer);
        }
    });
}

// Make functions globally accessible
window.navigateToSection = navigateToSection;
window.openGalleryLightbox = openGalleryLightbox;
window.sendWhatsAppMessage = sendWhatsAppMessage;

// Console log
console.log('CLK Teknoloji — Modern Site Initialized');
