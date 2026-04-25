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
// Copy to Clipboard
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        return true;
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
        return true;
    }
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) {
        toast = createElement('div', {
            id: 'toast-notification',
            style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, duration);
}

// ========================================
// Number Formatting
// ========================================
function formatNumber(num, decimals = 4) {
    if (isNaN(num) || num === null) return '0';
    if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';
    return Number(num).toFixed(decimals).replace(/\.?0+$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// TOOL LOGIC BELOW
// ========================================

/**
 * Law of Cosines Calculator
 * Find missing sides or angles using c² = a² + b² - 2ab·cos(C)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Law of Cosines Calculator', icon: '📐' });

    const modeEl = $('#mode');
    const sideAEl = $('#side-a');
    const sideBEl = $('#side-b');
    const angleCEl = $('#angle-c');
    const sideCEl = $('#side-c');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    const angleCContainer = angleCEl.closest('.form-group');
    const sideCContainer = sideCEl.closest('.form-group');

    function updateFields() {
        const mode = modeEl.value;
        if (mode === 'find-side') {
            angleCContainer.style.display = 'block';
            sideCContainer.style.display = 'none';
        } else {
            angleCContainer.style.display = 'none';
            sideCContainer.style.display = 'block';
        }
    }

    modeEl.addEventListener('change', updateFields);
    updateFields();

    function calculate() {
        const mode = modeEl.value;
        const a = parseFloat(sideAEl.value);
        const b = parseFloat(sideBEl.value);

        if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Sides a and b must be positive numbers</p>';
            return;
        }

        try {
            if (mode === 'find-side') {
                const angleDeg = parseFloat(angleCEl.value);
                if (isNaN(angleDeg) || angleDeg <= 0 || angleDeg >= 180) {
                    throw new Error('Angle C must be between 0 and 180 degrees');
                }
                const angleRad = angleDeg * Math.PI / 180;
                const c2 = a * a + b * b - 2 * a * b * Math.cos(angleRad);
                const c = Math.sqrt(c2);
                
                outputEl.innerHTML = `
                    <div style="text-align:center;">
                        <div style="font-size:0.875rem;color:#6b7280;margin-bottom:0.5rem;">For a=${a}, b=${b}, C=${angleDeg}°</div>
                        <div style="font-size:1.5rem;font-weight:700;color:#2563eb;">Side c = ${formatNumber(c, 6)}</div>
                        <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.5rem;">c² = ${formatNumber(c2, 6)}</div>
                    </div>
                `;
            } else {
                const c = parseFloat(sideCEl.value);
                if (isNaN(c) || c <= 0) {
                    throw new Error('Side c must be a positive number');
                }
                // Triangle inequality check
                if (a + b <= c || a + c <= b || b + c <= a) {
                    throw new Error('Triangle inequality violated: These sides cannot form a triangle');
                }
                
                const cosC = (a * a + b * b - c * c) / (2 * a * b);
                const angleRad = Math.acos(cosC);
                const angleDeg = angleRad * 180 / Math.PI;
                
                outputEl.innerHTML = `
                    <div style="text-align:center;">
                        <div style="font-size:0.875rem;color:#6b7280;margin-bottom:0.5rem;">For a=${a}, b=${b}, c=${c}</div>
                        <div style="font-size:1.5rem;font-weight:700;color:#2563eb;">Angle C = ${formatNumber(angleDeg, 4)}°</div>
                        <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.5rem;">${formatNumber(angleRad, 6)} radians</div>
                    </div>
                `;
            }
        } catch (error) {
            outputEl.innerHTML = `<p style="color:#ef4444;">${error.message}</p>`;
        }
    }

    function clear() {
        sideAEl.value = '';
        sideBEl.value = '';
        angleCEl.value = '';
        sideCEl.value = '';
        outputEl.innerHTML = '-';
        sideAEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = outputEl.innerText.trim();
            if (text === '-') return;
            copyToClipboard(`Law of Cosines: ${text.split('\n')[1]}`);
        });
    }

    [sideAEl, sideBEl, angleCEl, sideCEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
