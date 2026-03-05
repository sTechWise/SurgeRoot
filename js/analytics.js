/* ============================================
   SurgeRoot Analytics (GA4 + GTM Integration)
   ============================================ */

const GA4_ID = 'G-0C1NW7N2LF'; // GA4 Measurement ID
const GTM_ID = 'GTM-566W72F3';

// Initialize GA4
function initGA4() {
    if (!GA4_ID || GA4_ID === 'G-XXXXXXXXXX') return;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA4_ID);
}

// Initialize GTM
function initGTM() {
    if (!GTM_ID || GTM_ID === 'GTM-XXXXXXX') return;

    window.dataLayer = window.dataLayer || [];
    (function (w, d, s, l, i) {
        w[l] = w[l] || [];
        w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        var f = d.getElementsByTagName(s)[0],
            j = d.createElement(s),
            dl = l !== 'dataLayer' ? '&l=' + l : '';
        j.async = true;
        j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
        f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', GTM_ID);

    // Div wrap for noscript compliant insertion
    const noscript = document.createElement('noscript');
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${GTM_ID}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);
    document.body.insertBefore(noscript, document.body.firstChild);
}

// Track custom events
window.trackEvent = function (eventName, params = {}) {
    // GA4
    if (window.gtag) {
        window.gtag('event', eventName, params);
    }

    // GTM dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        ...params
    });


};

// Supply chain specific events
window.trackSupplyChainEvent = function (action) {
    const eventMap = {
        'home_references': 'supply_chain_cta_home_primary',
        'download_checklist': 'supply_chain_download_checklist',
        'howwework_references': 'supply_chain_cta_howwework_primary',
        'brand_permission': 'supply_chain_request_brand_permission',
    };
    const eventName = eventMap[action] || action;
    window.trackEvent(eventName, { section: 'supply_chain' });
};

// Bind analytics clicks cleanly for CSP
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-analytics-action]').forEach(el => {
        el.addEventListener('click', () => {
            if (window.trackSupplyChainEvent) {
                window.trackSupplyChainEvent(el.getAttribute('data-analytics-action'));
            }
        });
    });
});

// Initialize analytics (called after cookie consent)
window.initAnalytics = function () {
    const consent = localStorage.getItem('surgeroot-cookie-consent');
    if (consent === 'accepted') {
        initGA4();
        initGTM();
    }
};

// Auto-init if already consented
document.addEventListener('DOMContentLoaded', () => {
    const consent = localStorage.getItem('surgeroot-cookie-consent');
    if (consent === 'accepted') {
        window.initAnalytics();
    }
});
