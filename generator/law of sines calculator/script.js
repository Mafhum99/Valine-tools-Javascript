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
    children.forEach(child => { if (typeof child === 'string') el.appendChild(document.createTextNode(child)); else if (child instanceof Node) el.appendChild(child); });
    return el;
}
const Storage = {
    get(key, defaultValue = null) { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } catch { return defaultValue; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
    remove(key) { localStorage.removeItem(key); }, clear() { localStorage.clear(); }
};
async function copyToClipboard(text) {
    try { await navigator.clipboard.writeText(text); showToast('Copied to clipboard!'); return true; }
    catch { const textarea = document.createElement('textarea'); textarea.value = text; textarea.style.position = 'fixed'; textarea.style.opacity = '0'; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea); showToast('Copied to clipboard!'); return true; }
}
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) { toast = createElement('div', { id: 'toast-notification', style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);' }); document.body.appendChild(toast); }
    toast.textContent = message; toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(100px)'; }, duration);
}
function formatNumber(num, decimals = 2) { if (isNaN(num) || num === null) return '0'; return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function initTool(toolInfo) { if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`; }

// ========================================
// TOOL LOGIC BELOW
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Law of Sines Calculator', icon: '📏' });

    const modeEl = $('#mode');
    const sideAEl = $('#side-a'), sideBEl = $('#side-b'), sideCEl = $('#side-c');
    const angleAEl = $('#angle-a'), angleBEl = $('#angle-b'), angleCEl = $('#angle-c');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function updateInputs() {
        const mode = modeEl.value;
        if (mode === 'find-side') {
            sideAEl.parentElement.style.display = 'block'; angleAEl.parentElement.style.display = 'block';
            sideBEl.parentElement.style.display = 'block'; angleBEl.parentElement.style.display = 'block';
            sideCEl.parentElement.style.display = 'none'; angleCEl.parentElement.style.display = 'none';
        } else if (mode === 'find-angle') {
            sideAEl.parentElement.style.display = 'block'; angleAEl.parentElement.style.display = 'none';
            sideBEl.parentElement.style.display = 'block'; angleBEl.parentElement.style.display = 'block';
            sideCEl.parentElement.style.display = 'none'; angleCEl.parentElement.style.display = 'block';
        } else { // SSA ambiguous case
            sideAEl.parentElement.style.display = 'block'; angleAEl.parentElement.style.display = 'none';
            sideBEl.parentElement.style.display = 'block'; angleBEl.parentElement.style.display = 'block';
            sideCEl.parentElement.style.display = 'block'; angleCEl.parentElement.style.display = 'none';
        }
    }

    modeEl.addEventListener('change', updateInputs);
    updateInputs();

    function calculate() {
        const mode = modeEl.value;

        if (mode === 'find-side') {
            const a = parseFloat(sideAEl.value), A = parseFloat(angleAEl.value);
            const B = parseFloat(angleBEl.value);
            if (isNaN(a) || isNaN(A) || isNaN(B)) { outputEl.textContent = 'Error: Please fill in all fields'; return; }
            if (a <= 0) { outputEl.textContent = 'Error: Side must be positive'; return; }
            if (A <= 0 || B <= 0 || A + B >= 180) { outputEl.textContent = 'Error: Angles must be positive and sum < 180°'; return; }
            const C = 180 - A - B;
            const ratio = a / Math.sin(A * Math.PI / 180);
            const b = ratio * Math.sin(B * Math.PI / 180);
            const c = ratio * Math.sin(C * Math.PI / 180);

            let html = `<div class="result-main">Side b = <strong>${formatNumber(b, 4)}</strong>, Side c = <strong>${formatNumber(c, 4)}</strong></div>`;
            html += `<div class="result-detail">Angle C: ${formatNumber(C, 4)}°</div>`;
            html += `<div class="result-detail">Perimeter: ${formatNumber(a + b + c, 4)}</div>`;
            const s = (a + b + c) / 2; const area = Math.sqrt(Math.max(0, s * (s-a) * (s-b) * (s-c)));
            html += `<div class="result-detail">Area: ${formatNumber(area, 4)}</div>`;
            outputEl.innerHTML = html;
        } else if (mode === 'find-angle') {
            const a = parseFloat(sideAEl.value), b = parseFloat(sideBEl.value);
            const B = parseFloat(angleBEl.value);
            if (isNaN(a) || isNaN(b) || isNaN(B)) { outputEl.textContent = 'Error: Please fill in all fields'; return; }
            if (a <= 0 || b <= 0) { outputEl.textContent = 'Error: Sides must be positive'; return; }
            if (B <= 0 || B >= 180) { outputEl.textContent = 'Error: Angle must be between 0° and 180°'; return; }
            const sinA = a * Math.sin(B * Math.PI / 180) / b;
            if (Math.abs(sinA) > 1) { outputEl.textContent = 'Error: No solution exists (sin(A) > 1)'; return; }
            const A = Math.asin(sinA) * 180 / Math.PI;
            const C = 180 - A - B;
            const ratio = a / Math.sin(A * Math.PI / 180);
            const c = ratio * Math.sin(C * Math.PI / 180);

            let html = `<div class="result-main">Angle A = <strong>${formatNumber(A, 4)}°</strong></div>`;
            html += `<div class="result-detail">Angle C: ${formatNumber(C, 4)}°, Side c: ${formatNumber(c, 4)}</div>`;
            outputEl.innerHTML = html;
        } else { // SSA - ambiguous case
            const a = parseFloat(sideAEl.value), b = parseFloat(sideBEl.value);
            const B = parseFloat(angleBEl.value);
            if (isNaN(a) || isNaN(b) || isNaN(B)) { outputEl.textContent = 'Error: Please fill in all fields'; return; }
            if (a <= 0 || b <= 0) { outputEl.textContent = 'Error: Sides must be positive'; return; }
            if (B <= 0 || B >= 180) { outputEl.textContent = 'Error: Angle must be between 0° and 180°'; return; }
            const sinA = a * Math.sin(B * Math.PI / 180) / b;

            let html = '';
            if (Math.abs(sinA) > 1) {
                html = `<div class="result-main"><strong>No solution</strong> - sin(A) > 1</div>`;
            } else if (Math.abs(sinA - 1) < 1e-10) {
                const A = 90; const C = 180 - A - B;
                const ratio = a / Math.sin(A * Math.PI / 180); const c = ratio * Math.sin(C * Math.PI / 180);
                html = `<div class="result-main"><strong>One solution (right triangle)</strong></div>`;
                html += `<div class="result-detail">A = 90°, C = ${formatNumber(C, 4)}°, c = ${formatNumber(c, 4)}</div>`;
            } else {
                const A1 = Math.asin(sinA) * 180 / Math.PI;
                const A2 = 180 - A1;
                html = `<div class="result-main"><strong>SSA Ambiguous Case</strong></div>`;
                html += `<div class="result-detail">sin(A) = ${formatNumber(sinA, 6)}</div>`;
                const C1 = 180 - A1 - B;
                html += `<div class="result-detail">Solution 1: A = ${formatNumber(A1, 4)}°, C = ${formatNumber(C1, 4)}°</div>`;
                if (A2 + B < 180) {
                    const C2 = 180 - A2 - B;
                    html += `<div class="result-detail">Solution 2: A = ${formatNumber(A2, 4)}°, C = ${formatNumber(C2, 4)}°</div>`;
                } else {
                    html += `<div class="result-detail">Solution 2: A2 + B ≥ 180°, no second solution</div>`;
                }
            }
            outputEl.innerHTML = html;
        }
    }

    function clear() {
        sideAEl.value = ''; sideBEl.value = ''; sideCEl.value = '';
        angleAEl.value = ''; angleBEl.value = ''; angleCEl.value = '';
        outputEl.textContent = '-'; updateInputs();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
});
