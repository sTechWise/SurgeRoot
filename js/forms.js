/* ============================================
   SurgeRoot Form Validation & Handling
   Web3Forms Integration
   ============================================ */

const WEB3FORMS_URL = 'https://api.web3forms.com/submit';
const WEB3FORMS_KEY = '6b31127f-eebd-476a-aaa2-b604a7c8dc3c';

// Rate limiting - prevent spam submissions
const RATE_LIMIT_MS = 30000; // 30 seconds cooldown
let lastSubmitTime = 0;

function isRateLimited() {
    const now = Date.now();
    if (now - lastSubmitTime < RATE_LIMIT_MS) return true;
    lastSubmitTime = now;
    return false;
}

// Honeypot bot protection - bots fill hidden fields, humans don't
function injectHoneypot(form) {
    if (form.querySelector('[name="botcheck"]')) return;
    const honey = document.createElement('input');
    honey.type = 'text';
    honey.name = 'botcheck';
    honey.style.cssText = 'position:absolute;left:-9999px;opacity:0;height:0;width:0;';
    honey.tabIndex = -1;
    honey.autocomplete = 'off';
    form.appendChild(honey);
}

function isBotSubmission(form) {
    const honey = form.querySelector('[name="botcheck"]');
    return honey && honey.value.length > 0;
}

// Email domain validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function isBusinessEmail(email) {
    const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'];
    const domain = email.split('@')[1]?.toLowerCase();
    return !freeProviders.includes(domain);
}

// File validation
function isValidFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Only PDF files are allowed.' };
    }
    if (file.size > maxSize) {
        return { valid: false, error: 'File must be under 5MB.' };
    }
    return { valid: true };
}

// Show field error
function showError(field, message) {
    const group = field.closest('.form-group');
    if (!group) return;
    group.classList.add('has-error');
    field.classList.add('error');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }
}

// Clear field error
function clearError(field) {
    const group = field.closest('.form-group');
    if (!group) return;
    group.classList.remove('has-error');
    field.classList.remove('error');
    const errorEl = group.querySelector('.form-error');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
}

// Clear all errors in a form
function clearAllErrors(form) {
    form.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('has-error');
        const errorEl = group.querySelector('.form-error');
        if (errorEl) errorEl.style.display = 'none';
    });
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

// Set button loading state
function setButtonLoading(btn, loading) {
    if (!btn) return;
    if (loading) {
        btn.dataset.originalText = btn.textContent;
        btn.textContent = 'Sending…';
        btn.disabled = true;
        btn.style.opacity = '0.7';
    } else {
        btn.textContent = btn.dataset.originalText || 'Submit';
        btn.disabled = false;
        btn.style.opacity = '';
    }
}

// Show success message with ARIA
function showSuccess(form) {
    form.style.display = 'none';
    const success = form.parentElement.querySelector('.success-message');
    if (success) {
        success.setAttribute('role', 'status');
        success.setAttribute('aria-live', 'polite');
        success.classList.add('active');
    }
}

// Submit to Web3Forms
async function submitToWeb3Forms(formData, formSubject) {
    formData.append('access_key', WEB3FORMS_KEY);
    formData.append('subject', formSubject);
    formData.append('from_name', 'SurgeRoot Website');

    const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Submission failed. Please try again.');
    }
    return result;
}

// ---- PUBLIC CONTACT FORM ----
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    injectHoneypot(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isBotSubmission(form)) return;
        if (isRateLimited()) { alert('Please wait before submitting again.'); return; }
        clearAllErrors(form);

        let valid = true;

        // Full name
        const name = form.querySelector('[name="fullname"]');
        if (name && !name.value.trim()) {
            showError(name, 'Full name is required.');
            valid = false;
        }

        // Email
        const email = form.querySelector('[name="email"]');
        if (email && !email.value.trim()) {
            showError(email, 'Email is required.');
            valid = false;
        } else if (email && !isValidEmail(email.value)) {
            showError(email, 'Please enter a valid email address.');
            valid = false;
        }

        // Message
        const message = form.querySelector('[name="message"]');
        if (message && !message.value.trim()) {
            showError(message, 'Message is required.');
            valid = false;
        }

        if (!valid) return;

        const submitBtn = form.querySelector('[type="submit"]');
        setButtonLoading(submitBtn, true);

        try {
            const formData = new FormData(form);
            await submitToWeb3Forms(formData, 'New Contact from SurgeRoot Website');
            showSuccess(form);

            // Analytics event
            if (window.trackEvent) {
                window.trackEvent('contact_form_submit', {
                    purpose: form.querySelector('[name="purpose"]')?.value || 'General'
                });
            }
        } catch (err) {
            setButtonLoading(submitBtn, false);
            alert(err.message || 'Something went wrong. Please try again or email us directly at sales@surgeroot.com');
        }
    });

    // Real-time validation
    form.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('blur', () => {
            if (field.hasAttribute('required') && !field.value.trim()) {
                showError(field, `${field.previousElementSibling?.textContent?.replace(' *', '') || 'This field'} is required.`);
            } else {
                clearError(field);
            }
        });
    });
}

// ---- DISTRIBUTOR APPLICATION FORM ----
function initDistributorForm() {
    const form = document.getElementById('distributor-form');
    if (!form) return;
    injectHoneypot(form);

    const step1 = form.querySelector('#step-1');
    const step2 = form.querySelector('#step-2');
    const nextBtn = form.querySelector('[data-step-next]');
    const prevBtn = form.querySelector('[data-step-prev]');
    const indicators = form.querySelectorAll('.form-step-indicator');

    function goToStep(step) {
        if (step === 1) {
            step1?.classList.add('active');
            step2?.classList.remove('active');
            indicators[0]?.classList.add('active');
            indicators[0]?.classList.remove('completed');
            indicators[1]?.classList.remove('active');
        } else {
            step1?.classList.remove('active');
            step2?.classList.add('active');
            indicators[0]?.classList.remove('active');
            indicators[0]?.classList.add('completed');
            indicators[1]?.classList.add('active');
        }
    }

    // Validate step 1
    nextBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        clearAllErrors(form);
        let valid = true;

        const companyName = form.querySelector('[name="company_name"]');
        if (companyName && !companyName.value.trim()) {
            showError(companyName, 'Company name is required.');
            valid = false;
        }

        const businessEmail = form.querySelector('[name="business_email"]');
        if (businessEmail && !businessEmail.value.trim()) {
            showError(businessEmail, 'Business email is required.');
            valid = false;
        } else if (businessEmail && !isValidEmail(businessEmail.value)) {
            showError(businessEmail, 'Please enter a valid email address.');
            valid = false;
        } else if (businessEmail && !isBusinessEmail(businessEmail.value)) {
            showError(businessEmail, 'Please use a company email address (not Gmail/Hotmail).');
            valid = false;
        }

        const contactName = form.querySelector('[name="contact_name"]');
        if (contactName && !contactName.value.trim()) {
            showError(contactName, 'Contact name is required.');
            valid = false;
        }

        // File validations
        const resaleCert = form.querySelector('[name="resale_cert"]');
        if (resaleCert?.files?.[0]) {
            const result = isValidFile(resaleCert.files[0]);
            if (!result.valid) {
                showError(resaleCert, result.error);
                valid = false;
            }
        }

        const w9 = form.querySelector('[name="w9"]');
        if (w9?.files?.[0]) {
            const result = isValidFile(w9.files[0]);
            if (!result.valid) {
                showError(w9, result.error);
                valid = false;
            }
        }

        if (valid) goToStep(2);
    });

    prevBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        goToStep(1);
    });

    // Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isBotSubmission(form)) return;
        if (isRateLimited()) { alert('Please wait before submitting again.'); return; }
        clearAllErrors(form);
        let valid = true;

        const mapAgree = form.querySelector('[name="map_agree"]');
        if (mapAgree && !mapAgree.checked) {
            showError(mapAgree, 'You must agree to MAP and terms.');
            valid = false;
        }

        if (!valid) return;

        const submitBtn = form.querySelector('[type="submit"]');
        setButtonLoading(submitBtn, true);

        try {
            // Web3Forms does not support file uploads via fetch FormData for
            // PDF attachments. We send the text fields and note that documents
            // should be requested in follow-up.
            const formData = new FormData();
            formData.append('company_name', form.querySelector('[name="company_name"]')?.value || '');
            formData.append('business_email', form.querySelector('[name="business_email"]')?.value || '');
            formData.append('contact_name', form.querySelector('[name="contact_name"]')?.value || '');
            formData.append('phone', form.querySelector('[name="phone"]')?.value || '');
            formData.append('entity_type', form.querySelector('[name="entity_type"]')?.value || '');
            formData.append('marketplaces', form.querySelector('[name="marketplaces"]')?.value || '');
            formData.append('annual_revenue', form.querySelector('[name="annual_revenue"]')?.value || '');
            formData.append('product_interest', form.querySelector('[name="product_interest"]')?.value || '');
            formData.append('business_description', form.querySelector('[name="business_description"]')?.value || '');

            // Note about file attachments
            const hasResale = form.querySelector('[name="resale_cert"]')?.files?.[0];
            const hasW9 = form.querySelector('[name="w9"]')?.files?.[0];
            if (hasResale || hasW9) {
                formData.append('documents_note', 'Applicant attached documents — please follow up via email to request them.');
            }

            await submitToWeb3Forms(formData, 'New Distributor Application — SurgeRoot');
            showSuccess(form);

            if (window.trackEvent) {
                window.trackEvent('distributor_application_submit', {
                    company: form.querySelector('[name="company_name"]')?.value
                });
            }
        } catch (err) {
            setButtonLoading(submitBtn, false);
            alert(err.message || 'Something went wrong. Please try again or email us at sales@surgeroot.com');
        }
    });

    // File input display
    form.querySelectorAll('.form-file__input').forEach(input => {
        input.addEventListener('change', () => {
            const label = input.closest('.form-file')?.querySelector('.form-file__name');
            if (label && input.files[0]) {
                label.textContent = input.files[0].name;
            }
        });
    });
}

// ---- MODAL CONTACT FORM ----
function initModalForm() {
    const form = document.getElementById('modal-contact-form');
    if (!form) return;
    injectHoneypot(form);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isBotSubmission(form)) return;
        if (isRateLimited()) { alert('Please wait before submitting again.'); return; }
        clearAllErrors(form);
        let valid = true;

        const name = form.querySelector('[name="fullname"]');
        if (name && !name.value.trim()) {
            showError(name, 'Full name is required.');
            valid = false;
        }

        const email = form.querySelector('[name="email"]');
        if (email && !email.value.trim()) {
            showError(email, 'Email is required.');
            valid = false;
        } else if (email && !isValidEmail(email.value)) {
            showError(email, 'Please enter a valid email address.');
            valid = false;
        }

        const message = form.querySelector('[name="message"]');
        if (message && !message.value.trim()) {
            showError(message, 'Message is required.');
            valid = false;
        }

        if (!valid) return;

        const submitBtn = form.querySelector('[type="submit"]');
        setButtonLoading(submitBtn, true);

        try {
            const formData = new FormData(form);
            await submitToWeb3Forms(formData, 'Supply Chain Inquiry — SurgeRoot');
            showSuccess(form);

            if (window.trackEvent) {
                window.trackEvent('supply_chain_cta_submit', {
                    subject: form.querySelector('[name="subject"]')?.value || ''
                });
            }
        } catch (err) {
            setButtonLoading(submitBtn, false);
            alert(err.message || 'Something went wrong. Please try again or email us at sales@surgeroot.com');
        }
    });
}

// Initialize all forms
document.addEventListener('DOMContentLoaded', () => {
    initContactForm();
    initDistributorForm();
    initModalForm();
});
