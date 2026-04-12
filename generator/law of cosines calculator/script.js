// ========================================
// DOM Helpers
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
        else el.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
    });
    return el;
}

// ========================================
// Storage Helpers (localStorage)
// ========================================
const Storage = {
    get(key, defaultValue = null) {
        try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; }
        catch { return defaultValue; }
    },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
    remove(key) { localStorage.removeItem(key); },
    clear() { localStorage.clear(); }
};

// ========================================
// Copy to Clipboard
// ========================================
async function copyToClipboard(text) {
    try { await navigator.clipboard.writeText(text); showToast('Copied to clipboard!'); return true; }
    catch {
        const textarea = document.createElement('textarea');
        textarea.value = text; textarea.style.position = 'fixed'; textarea.style.opacity = '0';
        document.body.appendChild(textarea); textarea.select(); document.execCommand('copy');
        document.body.removeChild(textarea); showToast('Copied to clipboard!'); return true;
    }
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) {
        toast = createElement('div', { id: 'toast-notification', style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);' });
        document.body.appendChild(toast);
    }
    toast.textContent = message; toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(100px)'; }, duration);
}

// ========================================
// Number Formatting
// ========================================
function formatNumber(num, decimals = 2) {
    if (isNaN(num) || num === null) return '0';
    return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ========================================
// Math Utilities
// ========================================
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }

// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// TOOL LOGIC BELOW
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Law of Cosines Calculator', icon: '📐' });

    const modeEl = $('#mode');
    const sideAEl = $('#side-a');
    const sideBEl = $('#side-b');
    const angleCEl = $('#angle-c');
    const sideCEl2 = $('#side-c');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function updateInputs() {
        const mode = modeEl.value;
        if (mode === 'find-side') {
            sideAEl.parentElement.style.display = 'block';
            sideBEl.parentElement.style.display = 'block';
            angleCEl.parentElement.style.display = 'block';
            sideCEl2.parentElement.style.display = 'none';
        } else {
            sideAEl.parentElement.style.display = 'block';
            sideBEl.parentElement.style.display = 'block';
            angleCEl.parentElement.style.display = 'none';
            sideCEl2.parentElement.style.display = 'block';
        }
    }

    modeEl.addEventListener('change', updateInputs);
    updateInputs();

    function calculate() {
        const mode = modeEl.value;

        if (mode === 'find-side') {
            const a = parseFloat(sideAEl.value);
            const b = parseFloat(sideBEl.value);
            const Cdeg = parseFloat(angleCEl.value);

            if (isNaN(a) || isNaN(b) || isNaN(Cdeg)) { outputEl.textContent = 'Error: Please fill in all fields'; return; }
            if (a <= 0 || b <= 0) { outputEl.textContent = 'Error: Sides must be positive'; return; }
            if (Cdeg <= 0 || Cdeg >= 180) { outputEl.textContent = 'Error: Angle must be between 0° and 180°'; return; }

            const C = Cdeg * Math.PI / 180;
            const c = Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(C));
            const s = (a + b + c) / 2;
            const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
            const A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI;
            const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI;

            let html = `<div class="result-main">Side c = <strong>${formatNumber(c, 4)}</strong></div>`;
            html += `<div class="result-detail">Side a: ${formatNumber(a, 4)}, Side b: ${formatNumber(b, 4)}</div>`;
            html += `<div class="result-detail">Angle A: ${formatNumber(A, 4)}°, Angle B: ${formatNumber(B, 4)}°</div>`;
            html += `<div class="result-detail">Perimeter: ${formatNumber(a + b + c, 4)}</div>`;
            html += `<div class="result-detail">Area: ${formatNumber(area, 4)}</div>`;
            outputEl.innerHTML = html;
        } else {
            const a = parseFloat(sideAEl.value);
            const b = parseFloat(sideBEl.value);
            const c = parseFloat(sideCEl2.value);

            if (isNaN(a) || isNaN(b) || isNaN(c)) { outputEl.textContent = 'Error: Please fill in all fields'; return; }
            if (a <= 0 || b <= 0 || c <= 0) { outputEl.textContent = 'Error: All sides must be positive'; return; }
            if (a + b <= c || a + c <= b || b + c <= a) { outputEl.textContent = 'Error: Invalid triangle - sum of any two sides must exceed the third'; return; }

            const C = Math.acos((a * a + b * b - c * c) / (2 * a * b)) * 180 / Math.PI;
            const A = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180 / Math.PI;
            const B = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180 / Math.PI;
            const s = (a + b + c) / 2;
            const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));

            let html = `<div class="result-main">Angle C = <strong>${formatNumber(C, 4)}°</strong></div>`;
            html += `<div class="result-detail">Angle A: ${formatNumber(A, 4)}°, Angle B: ${formatNumber(B, 4)}°</div>`;
            html += `<div class="result-detail">Side a: ${formatNumber(a, 4)}, Side b: ${formatNumber(b, 4)}, Side c: ${formatNumber(c, 4)}</div>`;
            html += `<div class="result-detail">Perimeter: ${formatNumber(a + b + c, 4)}</div>`;
            html += `<div class="result-detail">Area: ${formatNumber(area, 4)}</div>`;
            outputEl.innerHTML = html;
        }
    }

    function clear() {
        sideAEl.value = ''; sideBEl.value = ''; angleCEl.value = ''; sideCEl2.value = '';
        outputEl.textContent = '-'; updateInputs();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    [sideAEl, sideBEl, angleCEl, sideCEl2].forEach(el => el.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); }));
});
