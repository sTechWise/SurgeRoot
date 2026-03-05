/**
 * SurgeRoot Distributor Portal
 * supabaseClient.auth — Passwordless OTP (Email Code) Login
 */

// Supabase configuration
const SUPABASE_URL = 'https://ganrxuyamblwchzeoghm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_nw0PvgFh30mZXCrtTtOJpw_YG06n3wj';

let supabaseClient;
let pendingEmail = ''; // Stores email between OTP steps

// Initialize Supabase client
function initSupabase() {
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
    }
    return false;
}


// ---- SESSION MANAGEMENT ----
async function checkSession() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            showDashboard({
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            });
        } else {
            showLogin();
        }
    } catch (err) {
        showLogin();
    }
}

function setupAuthListener() {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
            showLogin();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            showDashboard({
                email: session.user.email,
                name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            });
        }
    });
}

// ---- STEP 1: EMAIL → SEND OTP ----
function initLoginForm() {
    const form = document.getElementById('portal-login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        hideSuccess();

        const email = document.getElementById('login-email').value.trim().toLowerCase();
        if (!email) {
            showError('Please enter your email address.');
            return;
        }

        const submitBtn = form.querySelector('[type="submit"]');
        setButtonLoading(submitBtn, true, 'Sending code…');

        try {
            if (!supabaseClient) throw new Error('Authentication service unavailable.');

            const { error } = await supabaseClient.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: false, // Only existing/whitelisted users
                },
            });

            if (error) {
                // Supabase returns "Signups not allowed" for non-existing users
                if (error.message.includes('Signups not allowed') || error.message.includes('not allowed')) {
                    showError('This email is not registered for portal access. Please contact us at sales@surgeroot.com to apply.');
                } else {
                    showError(error.message || 'Something went wrong. Please try again.');
                }
                return;
            }

            // Success — move to OTP step
            pendingEmail = email;
            document.getElementById('otp-sent-email').textContent = email;
            form.style.display = 'none';
            document.getElementById('portal-otp-form').style.display = '';
            showSuccess('Verification code sent! Check your email inbox.');

        } catch (err) {
            showError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setButtonLoading(submitBtn, false, 'Send Login Code');
        }
    });
}

// ---- STEP 2: VERIFY OTP CODE ----
function initOtpForm() {
    const form = document.getElementById('portal-otp-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideError();
        hideSuccess();

        const otp = document.getElementById('login-otp').value.trim();
        if (!otp || otp.length !== 6) {
            showError('Please enter the 6-digit verification code from your email.');
            return;
        }

        const submitBtn = form.querySelector('[type="submit"]');
        setButtonLoading(submitBtn, true, 'Verifying…');

        try {
            if (!supabaseClient) throw new Error('Authentication service unavailable.');

            const { data, error } = await supabaseClient.auth.verifyOtp({
                email: pendingEmail,
                token: otp,
                type: 'email',
            });

            if (error) {
                showError('Invalid or expired code. Please check and try again.');
                return;
            }

            if (data.session) {
                hideError();
                showDashboard({
                    email: data.user.email,
                    name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                });
            }
        } catch (err) {
            showError(err.message || 'Verification failed. Please try again.');
        } finally {
            setButtonLoading(submitBtn, false, 'Verify & Sign In');
        }
    });
}

// ---- OTP BACK BUTTON ----
function initOtpBackBtn() {
    const btn = document.getElementById('otp-back-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        document.getElementById('portal-otp-form').style.display = 'none';
        document.getElementById('portal-login-form').style.display = '';
        hideError();
        hideSuccess();
        pendingEmail = '';
    });
}

// ---- UI HELPERS ----
function showError(msg) {
    const el = document.getElementById('login-error');
    const textEl = document.getElementById('login-error-text');
    if (el && textEl) {
        textEl.textContent = msg;
        el.style.display = 'flex';
        el.classList.add('shake');
        setTimeout(() => el.classList.remove('shake'), 600);
    }
    hideSuccess();
}

function hideError() {
    const el = document.getElementById('login-error');
    if (el) el.style.display = 'none';
}

function showSuccess(msg) {
    const el = document.getElementById('login-success');
    const textEl = document.getElementById('login-success-text');
    if (el && textEl) {
        textEl.textContent = msg;
        el.style.display = 'flex';
    }
}

function hideSuccess() {
    const el = document.getElementById('login-success');
    if (el) el.style.display = 'none';
}

function setButtonLoading(btn, loading, defaultText) {
    if (!btn) return;
    if (loading) {
        btn.disabled = true;
        btn.textContent = defaultText || 'Loading…';
        btn.style.opacity = '0.7';
    } else {
        btn.disabled = false;
        btn.textContent = defaultText || 'Submit';
        btn.style.opacity = '';
    }
}

// ---- VIEW SWITCHING ----
function showLogin() {
    const loginView = document.getElementById('portal-login-view');
    const dashView = document.getElementById('portal-dashboard-view');
    if (loginView) loginView.style.display = '';
    if (dashView) dashView.style.display = 'none';

    // Update header utility buttons
    const headerLinks = document.querySelectorAll('.header__actions a[href="/portal.html"], .header__actions-mobile a[href="/portal.html"], .header__actions a[href="#"], .header__actions-mobile a[href="#"]');
    headerLinks.forEach(link => {
        link.textContent = 'Distributor Login';
        link.href = '/portal.html';
    });

    // Reset to email step
    const emailForm = document.getElementById('portal-login-form');
    const otpForm = document.getElementById('portal-otp-form');
    if (emailForm) emailForm.style.display = '';
    if (otpForm) otpForm.style.display = 'none';
}

function showDashboard(user) {
    const loginView = document.getElementById('portal-login-view');
    const dashView = document.getElementById('portal-dashboard-view');
    if (loginView) loginView.style.display = 'none';
    if (dashView) dashView.style.display = '';

    // Update header utility buttons
    const headerLinks = document.querySelectorAll('.header__actions a[href="/portal.html"], .header__actions-mobile a[href="/portal.html"]');
    headerLinks.forEach(link => {
        link.textContent = 'Dashboard';
        link.href = '#';
    });

    const nameEl = document.getElementById('portal-user-name');
    if (nameEl) nameEl.textContent = user.name || user.email;
}

// ---- LOGOUT ----
function initLogout() {
    const btn = document.getElementById('portal-logout-btn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
        if (supabaseClient) {
            await supabaseClient.auth.signOut();
        }
        showLogin();
        const form = document.getElementById('portal-login-form');
        if (form) form.reset();
        const otpForm = document.getElementById('portal-otp-form');
        if (otpForm) otpForm.reset();
        pendingEmail = '';
    });
}

// ---- TABS ----
function initTabs() {
    const tabs = document.querySelectorAll('[data-portal-tab]');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-portal-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.portal-panel').forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`panel-${target}`);
            if (panel) panel.classList.add('active');
        });
    });
}

// ---- INVENTORY SYNC ----
function createSyncSvg(cls) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    if (cls) svg.setAttribute('class', cls);
    const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('points', '23 4 23 10 17 10');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M20.49 15a9 9 0 1 1-2.12-9.36L23 10');
    svg.appendChild(polyline);
    svg.appendChild(path);
    return svg;
}

function initInventorySync() {
    const btn = document.getElementById('sync-inventory-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
        btn.disabled = true;
        btn.textContent = '';
        btn.appendChild(createSyncSvg('spin'));
        btn.appendChild(document.createTextNode(' Syncing...'));

        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = '';
            btn.appendChild(createSyncSvg());
            btn.appendChild(document.createTextNode(' Sync Now'));

            const timestamp = btn.closest('.portal-card')?.querySelector('span');
            if (timestamp) timestamp.textContent = 'Last sync: just now';

            const card = btn.closest('.portal-card');
            if (card) {
                card.style.borderColor = 'var(--color-accent)';
                setTimeout(() => card.style.borderColor = '', 2000);
            }
        }, 1500);
    });
}

// Add animations
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

// ---- INIT (must be at bottom, after all function definitions) ----
initLoginForm();
initOtpForm();
initOtpBackBtn();
initTabs();
initLogout();
initInventorySync();

// Async Supabase work
(async function () {
    const supabaseReady = initSupabase();
    if (supabaseReady) {
        await checkSession();
        setupAuthListener();
    } else {
        showLogin();
        showError('Authentication service is temporarily unavailable. Please try again later.');
    }
})();

