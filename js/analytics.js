/* ============================================
   SurgeRoot Analytics (GA4 + GTM Placeholders)
   ============================================ */

/*
 * SETUP INSTRUCTIONS:
 * 1. Replace 'G-XXXXXXXXXX' with your GA4 Measurement ID
 * 2. Replace 'GTM-XXXXXXX' with your Google Tag Manager ID
 * 3. These will only activate after cookie consent is given
 */

const GA4_ID = 'G-0C1NW7N2LF'; // GA4 Measurement ID
const GTM_ID = 'GTM-XXXXXXX'; // TODO: Replace with your GTM ID (optional)

// Initialize GA4
function initGA4() {
    if (!GA4_ID || GA4_ID === 'G-XXXXXXXXXX') {
        console.log('[SurgeRoot Analytics] GA4 not configured. Replace GA4_ID in analytics.js');
        return;
    }

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
    if (GTM_ID === 'GTM-XXXXXXX') {
        console.log('[SurgeRoot Analytics] GTM not configured. Replace GTM_ID in analytics.js');
        return;
    }

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

    console.log(`[SurgeRoot Analytics] Event: ${eventName}`, params);
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
