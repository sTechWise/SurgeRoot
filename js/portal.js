/**
 * SurgeRoot Distributor Portal
 * Login system, dashboard tabs, inventory sync
 */

// Demo credentials (in production, this would be server-side auth)
const DEMO_ACCOUNTS = [
    { email: 'partner@surgeroot.com', password: 'SurgeRoot2026!', name: 'Partner Account' },
    { email: 'demo@surgeroot.com', password: 'demo123', name: 'Demo Distributor' },
    { email: 'admin@surgeroot.com', password: 'admin2026', name: 'MD AL AMIN' }
];

const SESSION_KEY = 'surgeroot_portal_session';

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initLogin();
    initTabs();
    initLogout();
    initPasswordToggle();
    initInventorySync();
});

// ---- SESSION MANAGEMENT ----
function checkSession() {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session && session.email) {
        showDashboard(session);
    } else {
        showLogin();
    }
}

function createSession(account) {
    const session = {
        email: account.email,
        name: account.name,
        loginTime: new Date().toISOString(),
        token: generateToken()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
}

function destroySession() {
    localStorage.removeItem(SESSION_KEY);
}

function generateToken() {
    return 'sr_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
}

// ---- LOGIN ----
function initLogin() {
    const form = document.getElementById('portal-login-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);

        if (account) {
            const session = createSession(account);
            hideLoginError();
            showDashboard(session);
        } else {
            showLoginError('Invalid email or password. Please try again.');
        }
    });
}

function showLoginError(msg) {
    const el = document.getElementById('login-error');
    const textEl = document.getElementById('login-error-text');
    if (el && textEl) {
        textEl.textContent = msg;
        el.style.display = 'flex';
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 600);
    }
}

function hideLoginError() {
    const el = document.getElementById('login-error');
    if (el) el.style.display = 'none';
}

// ---- VIEW SWITCHING ----
function showLogin() {
    const loginView = document.getElementById('portal-login-view');
    const dashView = document.getElementById('portal-dashboard-view');
    if (loginView) loginView.style.display = '';
    if (dashView) dashView.style.display = 'none';
}

function showDashboard(session) {
    const loginView = document.getElementById('portal-login-view');
    const dashView = document.getElementById('portal-dashboard-view');
    if (loginView) loginView.style.display = 'none';
    if (dashView) dashView.style.display = '';

    // Update user name
    const nameEl = document.getElementById('portal-user-name');
    if (nameEl) nameEl.textContent = session.name;
}

// ---- LOGOUT ----
function initLogout() {
    const btn = document.getElementById('portal-logout-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        destroySession();
        showLogin();
        // Reset form
        const form = document.getElementById('portal-login-form');
        if (form) form.reset();
    });
}

// ---- TABS ----
function initTabs() {
    const tabs = document.querySelectorAll('[data-portal-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-portal-tab');

            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Update active panel
            document.querySelectorAll('.portal-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`panel-${target}`);
            if (panel) panel.classList.add('active');
        });
    });
}

// ---- PASSWORD TOGGLE ----
function initPasswordToggle() {
    const toggle = document.querySelector('.password-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        const input = document.getElementById('login-password');
        if (input.type === 'password') {
            input.type = 'text';
            toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>';
        } else {
            input.type = 'password';
            toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
        }
    });
}

// ---- INVENTORY SYNC ----
function initInventorySync() {
    const btn = document.getElementById('sync-inventory-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        btn.disabled = true;
        btn.innerHTML = '<svg class="spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Syncing...';

        // Simulate sync
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Sync Now';

            // Update sync timestamp
            const timestamp = btn.closest('.portal-card').querySelector('[class=""]') || btn.parentElement.querySelector('span');
            if (timestamp) timestamp.textContent = 'Last sync: just now';

            // Show brief success feedback
            const card = btn.closest('.portal-card');
            if (card) {
                card.style.borderColor = 'var(--color-accent)';
                setTimeout(() => card.style.borderColor = '', 2000);
            }
        }, 1500);
    });
}

// Add spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    .shake { animation: shake 0.4s ease; }
`;
document.head.appendChild(style);
