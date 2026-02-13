
// State Management
const state = {
    currentSection: 'home',
    currentSlide: 0,
    slideInterval: null,
    menuOpen: false
};

// Section hierarchy for breadcrumb generation
const sectionHierarchy = {
    'home': { title: 'Anasayfa', parent: null },
    'about': { title: 'Hakkımızda', parent: 'Kurumsal' },
    'team': { title: 'Ekibimiz', parent: 'Kurumsal' },
    'gallery': { title: 'FotoGaleri', parent: null },
    'contact': { title: 'İletişim', parent: null },
    'products': { title: 'Ürün Satışı', parent: 'Hizmetler' },
    'service': { title: 'Teknik Servis', parent: 'Hizmetler' },
    'watches': { title: 'Saat', parent: 'Hizmetler' }
};

// DOM Elements
const elements = {
    hamburger: null,
    mobileMenuOverlay: null,
    navLinks: null,
    submenuToggles: null,
    carousel: null,
    carouselSlides: null,
    carouselPrev: null,
    carouselNext: null,
    carouselIndicators: null,
    pageSections: null,
    breadcrumb: null,
    accordionHeaders: null,
    contactForm: null
};


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEventListeners();
    initCarousel();
    initAccordions();
    initFormValidation();
    handleInitialHash();
});

// Initialize DOM element references
function initElements() {
    elements.hamburger = document.querySelector('.hamburger');
    elements.mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    elements.navLinks = document.querySelectorAll('.nav-link[data-section]');
    elements.submenuToggles = document.querySelectorAll('.submenu-toggle');
    elements.carousel = document.querySelector('#hero-carousel');
    elements.carouselSlides = document.querySelectorAll('.carousel-slide');
    elements.carouselPrev = document.querySelector('.carousel-control.prev');
    elements.carouselNext = document.querySelector('.carousel-control.next');
    elements.carouselIndicators = document.querySelectorAll('.indicator');
    elements.pageSections = document.querySelectorAll('.page-section');
    elements.breadcrumb = document.querySelector('.breadcrumb');
    elements.accordionHeaders = document.querySelectorAll('.accordion-header');
    elements.contactForm = document.querySelector('#contactForm');
}

// Navigation Menu Functions
function initEventListeners() {
    // Hamburger menu toggle
    if (elements.hamburger) {
        elements.hamburger.addEventListener('click', toggleMenu);
    }
    
    // Navigation links
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            navigateToSection(section);
            closeMenu();
        });
    });
    
    // Submenu toggles
    elements.submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleSubmenu(toggle);
        });
    });
    
    // Service circles on homepage
    const serviceCircles = document.querySelectorAll('.service-circle[data-section]');
    serviceCircles.forEach(circle => {
        circle.addEventListener('click', (e) => {
            e.preventDefault();
            const section = circle.getAttribute('data-section');
            navigateToSection(section);
        });
    });
    
    // Footer links
    const footerLinks = document.querySelectorAll('.footer-menu a[data-section]');
    footerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            navigateToSection(section);
        });
    });
}

function toggleMenu() {
    state.menuOpen = !state.menuOpen;
    elements.hamburger.classList.toggle('active');
    elements.mobileMenuOverlay.classList.toggle('active');
    elements.hamburger.setAttribute('aria-expanded', state.menuOpen);
}

function closeMenu() {
    state.menuOpen = false;
    elements.hamburger.classList.remove('active');
    elements.mobileMenuOverlay.classList.remove('active');
    elements.hamburger.setAttribute('aria-expanded', 'false');
}

function toggleSubmenu(toggle) {
    const submenu = toggle.nextElementSibling;
    const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
    
    toggle.setAttribute('aria-expanded', !isExpanded);
    submenu.classList.toggle('active');
}

// Section Navigation (SPA Behavior)
function navigateToSection(sectionId) {
    // Hide all sections
    elements.pageSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.querySelector(`#${sectionId}`);
    if (targetSection) {
        targetSection.classList.add('active');
        state.currentSection = sectionId;
        
        // Update breadcrumb
        updateBreadcrumb(sectionId);
        
        // Update URL hash
        window.location.hash = sectionId;
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Restart carousel if navigating to home
        if (sectionId === 'home') {
            startCarousel();
        } else {
            stopCarousel();
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

// Handle browser back/forward buttons
window.addEventListener('hashchange', () => {
    const hash = window.location.hash.substring(1);
    if (hash && sectionHierarchy[hash]) {
        navigateToSection(hash);
    }
});

// Breadcrumb Navigation
function updateBreadcrumb(sectionId) {
    if (sectionId === 'home') {
        elements.breadcrumb.classList.remove('active');
        elements.breadcrumb.innerHTML = '';
        return;
    }
    
    const sectionData = sectionHierarchy[sectionId];
    if (!sectionData) return;
    
    let breadcrumbHTML = '<ol>';
    breadcrumbHTML += '<li><a href="#anasayfa" data-section="home">Anasayfa</a></li>';
    
    if (sectionData.parent) {
        breadcrumbHTML += `<li><span>${sectionData.parent}</span></li>`;
    }
    
    breadcrumbHTML += `<li><span class="current">${sectionData.title}</span></li>`;
    breadcrumbHTML += '</ol>';
    
    elements.breadcrumb.innerHTML = breadcrumbHTML;
    elements.breadcrumb.classList.add('active');
    
    // Add click listeners to breadcrumb links
    const breadcrumbLinks = elements.breadcrumb.querySelectorAll('a[data-section]');
    breadcrumbLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            navigateToSection(section);
        });
    });
}

// Carousel Functions
function initCarousel() {
    if (!elements.carousel) return;
    
    // Previous button
    if (elements.carouselPrev) {
        elements.carouselPrev.addEventListener('click', () => {
            changeSlide(-1);
        });
    }
    
    // Next button
    if (elements.carouselNext) {
        elements.carouselNext.addEventListener('click', () => {
            changeSlide(1);
        });
    }
    
    // Indicators
    elements.carouselIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            goToSlide(index);
        });
    });
    
    // Pause on hover
    elements.carousel.addEventListener('mouseenter', () => {
        stopCarousel();
    });
    
    elements.carousel.addEventListener('mouseleave', () => {
        if (state.currentSection === 'home') {
            startCarousel();
        }
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    elements.carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    elements.carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (touchEndX < touchStartX - 50) {
            // Swipe left - next slide
            changeSlide(1);
        }
        if (touchEndX > touchStartX + 50) {
            // Swipe right - previous slide
            changeSlide(-1);
        }
    }
    
    // Start auto-advance
    startCarousel();
}

function changeSlide(direction) {
    state.currentSlide += direction;
    
    if (state.currentSlide >= elements.carouselSlides.length) {
        state.currentSlide = 0;
    }
    if (state.currentSlide < 0) {
        state.currentSlide = elements.carouselSlides.length - 1;
    }
    
    updateCarousel();
    if (state.currentSection === 'home') {
        startCarousel();
    }
}

function goToSlide(index) {
    state.currentSlide = index;
    updateCarousel();
}

function updateCarousel() {
    // Update slides
    elements.carouselSlides.forEach((slide, index) => {
        slide.classList.toggle('active', index === state.currentSlide);
    });
    
    // Update indicators
    elements.carouselIndicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === state.currentSlide);
    });
}

function startCarousel() {
    stopCarousel(); // Clear any existing interval
    state.slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000); // Auto-advance every 6 seconds
}

function stopCarousel() {
    if (state.slideInterval) {
        clearInterval(state.slideInterval);
        state.slideInterval = null;
    }
}

// Accordion Functions
function initAccordions() {
    elements.accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isExpanded = header.getAttribute('aria-expanded') === 'true';
            
            // Toggle aria-expanded
            header.setAttribute('aria-expanded', !isExpanded);
            
            // Toggle content visibility
            content.classList.toggle('active');
        });
    });
}

// Form Validation
function initFormValidation() {
    if (!elements.contactForm) return;
    
    elements.contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Clear previous errors
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.textContent = '');
        
        let isValid = true;
        
        // Validate name
        const nameInput = document.querySelector('#name');
        if (!nameInput.value.trim()) {
            document.querySelector('#nameError').textContent = 'Ad Soyad zorunludur';
            isValid = false;
        }
        
        // Validate email
        const emailInput = document.querySelector('#email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            document.querySelector('#emailError').textContent = 'Email zorunludur';
            isValid = false;
        } else if (!emailRegex.test(emailInput.value)) {
            document.querySelector('#emailError').textContent = 'Geçerli bir email adresi giriniz';
            isValid = false;
        }
        
        // Validate message
        const messageInput = document.querySelector('#message');
        if (!messageInput.value.trim()) {
            document.querySelector('#messageError').textContent = 'Mesaj zorunludur';
            isValid = false;
        }
        
        if (isValid) {
            // Form is valid - show success message
            alert('Mesajınız başarıyla gönderildi! (Bu bir demo uygulamasıdır, gerçek gönderim yapılmamaktadır.)');
            elements.contactForm.reset();
        }
    });
    
    // Real-time validation
    const formInputs = elements.contactForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('blur', () => {
            validateField(input);
        });
    });
}

function validateField(field) {
    const errorElement = document.querySelector(`#${field.id}Error`);
    if (!errorElement) return;
    
    errorElement.textContent = '';
    
    if (field.id === 'name' && !field.value.trim()) {
        errorElement.textContent = 'Ad Soyad zorunludur';
    }
    
    if (field.id === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!field.value.trim()) {
            errorElement.textContent = 'Email zorunludur';
        } else if (!emailRegex.test(field.value)) {
            errorElement.textContent = 'Geçerli bir email adresi giriniz';
        }
    }
    
    if (field.id === 'message' && !field.value.trim()) {
        errorElement.textContent = 'Mesaj zorunludur';
    }
}

// Utility Functions

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#' || href.startsWith('#')) {
            const section = this.getAttribute('data-section');
            if (section) {
                e.preventDefault();
            }
        }
    });
});

// Console log for debugging
console.log('CLK Teknoloji Website Initialized');
console.log('Current section:', state.currentSection);


