// ============================================
// STATE & CONSTANTS
// ============================================
const state = {
    currentSection: 'home',
    menuOpen: false
};

const DEFAULT_WHATSAPP_NUMBER = '+905071561515';

function normalizeWhatsApp(number) {
    return String(number || '').replace(/[^0-9]/g, '');
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    handleInitialHash();
    initScrollAnimations();
    initScrollEffects();
});

// ============================================
// EVENT LISTENERS
// ============================================
function initEventListeners() {
    const hamburger = document.getElementById('hamburger-btn');
    if (hamburger) hamburger.addEventListener('click', toggleMenu);

    // Navigation links
    document.querySelectorAll('[data-section]').forEach(link => {
        link.addEventListener('click', (e) => {
            const section = link.dataset.section;
            if (section) {
                e.preventDefault();
                navigateToSection(section);
            }
        });
    });

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.substring(1);
        if (hash) navigateToSection(hash);
    });

    // WhatsApp Form
    const form = document.getElementById('whatsapp-contact-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('wp-name')?.value || '';
            const subject = document.getElementById('wp-subject')?.value || 'Genel Bilgi';
            const message = document.getElementById('wp-message')?.value || '';
            const fullMessage = `Merhaba, ben ${name}.\nKonu: ${subject}\n\n${message}`;
            const link = window.buildWhatsAppLink
                ? window.buildWhatsAppLink(fullMessage)
                : `https://wa.me/${normalizeWhatsApp(DEFAULT_WHATSAPP_NUMBER)}?text=${encodeURIComponent(fullMessage)}`;
            window.open(link, '_blank');
        });
    }

    // Service Tracking Redirect
    const serviceForms = document.querySelectorAll('.service-form');
    serviceForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('input');
            if (input && input.value.trim()) {
                const code = input.value.trim();
                const trackUrl = `https://serviscep.com/track?code=${encodeURIComponent(code)}`;
                window.location.href = trackUrl;
            }
        });
    });
}

// ============================================
// NAVIGATION
// ============================================
function toggleMenu() {
    state.menuOpen = !state.menuOpen;
    document.getElementById('hamburger-btn').classList.toggle('active', state.menuOpen);
    document.getElementById('mobile-menu').classList.toggle('active', state.menuOpen);
    document.body.style.overflow = state.menuOpen ? 'hidden' : '';
}

function closeMenu() {
    state.menuOpen = false;
    document.getElementById('hamburger-btn').classList.remove('active');
    document.getElementById('mobile-menu').classList.remove('active');
    document.body.style.overflow = '';
}

function navigateToSection(sectionId) {
    const sections = document.querySelectorAll('.page-section');
    const target = document.getElementById(sectionId);
    
    if (target) {
        sections.forEach(s => s.classList.remove('active'));
        target.classList.add('active');
        window.location.hash = sectionId;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeMenu();
        
        // Update active link
        document.querySelectorAll('.desktop-link').forEach(link => {
            link.classList.toggle('active', link.dataset.section === sectionId);
        });
    }
}

function handleInitialHash() {
    const hash = window.location.hash.substring(1);
    navigateToSection(hash || 'home');
}

// ============================================
// SCROLL EFFECTS
// ============================================
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('revealed');
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
}

function handleScroll() {
    const scrollY = window.scrollY;
    const header = document.getElementById('site-header');
    if (header) header.classList.toggle('scrolled', scrollY > 50);
    
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) scrollTopBtn.classList.toggle('visible', scrollY > 400);
}

// Make globally accessible
window.navigateToSection = navigateToSection;
