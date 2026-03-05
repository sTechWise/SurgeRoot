/* ============================================
   SurgeRoot Main JS
   ============================================ */

// Mobile nav toggle
function initNav() {
    const hamburger = document.querySelector('.header__hamburger');
    const links = document.querySelector('.header__links');
    if (!hamburger || !links) return;

    hamburger.addEventListener('click', () => {
        const isOpen = links.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        hamburger.querySelectorAll('span').forEach((line, i) => {
            if (isOpen) {
                if (i === 0) line.style.transform = 'rotate(45deg) translate(5px, 5px)';
                if (i === 1) line.style.opacity = '0';
                if (i === 2) line.style.transform = 'rotate(-45deg) translate(5px, -5px)';
            } else {
                line.style.transform = '';
                line.style.opacity = '';
            }
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header__nav') && !e.target.closest('.header__hamburger')) {
            links.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.querySelectorAll('span').forEach(line => {
                line.style.transform = '';
                line.style.opacity = '';
            });
        }
    });
}

// Header scroll shadow
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
}

// Cookie consent banner
function initCookieBanner() {
    const banner = document.querySelector('.cookie-banner');
    if (!banner) return;

    const consent = localStorage.getItem('surgeroot-cookie-consent');
    if (!consent) {
        banner.classList.add('active');
    }

    banner.querySelector('[data-cookie-accept]')?.addEventListener('click', () => {
        localStorage.setItem('surgeroot-cookie-consent', 'accepted');
        banner.classList.remove('active');
        // Initialize analytics after consent
        if (window.initAnalytics) window.initAnalytics();
    });

    banner.querySelector('[data-cookie-decline]')?.addEventListener('click', () => {
        localStorage.setItem('surgeroot-cookie-consent', 'declined');
        banner.classList.remove('active');
    });
}

// Accordion / collapsible
function initAccordion() {
    document.querySelectorAll('.accordion__trigger').forEach(trigger => {
        trigger.addEventListener('click', () => {
            const expanded = trigger.getAttribute('aria-expanded') === 'true';
            const content = document.getElementById(trigger.getAttribute('aria-controls'));
            if (!content) return;

            trigger.setAttribute('aria-expanded', !expanded);
            if (!expanded) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0';
            }
        });
    });
}

// Modal
function initModals() {
    document.querySelectorAll('[data-modal-open]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = btn.getAttribute('data-modal-open');
            const modal = document.getElementById(modalId);
            if (!modal) return;

            modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Pre-fill purpose if specified
            const prefill = btn.getAttribute('data-modal-prefill');
            if (prefill) {
                const purposeField = modal.querySelector('[name="purpose"]');
                if (purposeField) purposeField.value = prefill;

                const subjectField = modal.querySelector('[name="subject"]');
                if (subjectField) subjectField.value = prefill;
            }

            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input, textarea, select');
                if (firstInput) firstInput.focus();
            }, 100);
        });
    });

    document.querySelectorAll('[data-modal-close]').forEach(btn => {
        btn.addEventListener('click', () => {
            const modal = btn.closest('.modal-backdrop');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) {
                backdrop.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-backdrop.active').forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

// Form tabs
function initFormTabs() {
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab-target');
            const parent = tab.closest('.form-tabs')?.parentElement;
            if (!parent) return;

            parent.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
            parent.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            const panel = parent.querySelector(`#${target}`);
            if (panel) panel.classList.add('active');
        });
    });
}

// Active nav link
function initActiveNav() {
    const currentPath = window.location.pathname.replace(/\/$/, '').replace(/\.html$/, '');
    document.querySelectorAll('.header__links a:not(.btn)').forEach(link => {
        const linkPath = new URL(link.href).pathname.replace(/\/$/, '').replace(/\.html$/, '');
        if (currentPath === linkPath || (currentPath === '' && linkPath === '/') || (currentPath === '/' && linkPath === '/')) {
            link.classList.add('active');
        }
    });
}

// Hero background slideshow
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero__slide');
    if (slides.length < 2) return;
    let current = 0;
    setInterval(() => {
        slides[current].classList.remove('hero__slide--active');
        current = (current + 1) % slides.length;
        slides[current].classList.add('hero__slide--active');
    }, 6000);
}

// Initialize all
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initHeaderScroll();
    initCookieBanner();
    initAccordion();
    initModals();
    initFormTabs();
    initActiveNav();
    initHeroSlideshow();
});
