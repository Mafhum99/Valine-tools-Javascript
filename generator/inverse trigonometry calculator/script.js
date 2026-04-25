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
function formatNumber(num, decimals = 6) {
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
 * Inverse Trigonometry Calculator
 * Calculate arcsin, arccos, arctan, etc.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Inverse Trigonometry Calculator', icon: '🔄' });

    const inputValEl = $('#input-value');
    const functionEl = $('#function');
    const unitEl = $('#unit');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    function calculate() {
        const valStr = inputValEl.value.trim();
        if (valStr === '') {
            outputEl.innerHTML = '<p style="color:#ef4444;">Please enter a value</p>';
            return;
        }

        const x = parseFloat(valStr);
        const func = functionEl.value;
        const unit = unitEl.value;

        if (isNaN(x)) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Invalid number entered</p>';
            return;
        }

        // Domain validation
        if ((func === 'arcsin' || func === 'arccos') && (x < -1 || x > 1)) {
            outputEl.innerHTML = `<p style="color:#ef4444;">Domain Error: ${func} requires input in range [-1, 1]</p>`;
            return;
        }

        try {
            let resultRad;
            switch (func) {
                case 'arcsin': resultRad = Math.asin(x); break;
                case 'arccos': resultRad = Math.acos(x); break;
                case 'arctan': resultRad = Math.atan(x); break;
                case 'arccsc': resultRad = Math.asin(1/x); break;
                case 'arcsec': resultRad = Math.acos(1/x); break;
                case 'arccot': resultRad = Math.atan(1/x); break;
                default: resultRad = 0;
            }

            if (isNaN(resultRad)) {
                outputEl.innerHTML = '<p style="color:#ef4444;">Undefined result</p>';
                return;
            }

            const resultDeg = resultRad * (180 / Math.PI);
            
            const displayValue = unit === 'radians' 
                ? `${formatNumber(resultRad, 8)} rad`
                : `${formatNumber(resultDeg, 4)}°`;

            const funcLabels = {
                arcsin: 'arcsin(x)',
                arccos: 'arccos(x)',
                arctan: 'arctan(x)',
                arccsc: 'arccsc(x)',
                arcsec: 'arcsec(x)',
                arccot: 'arccot(x)'
            };

            outputEl.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:0.875rem;color:#6b7280;margin-bottom:0.5rem;">${funcLabels[func]} for x = ${x}</div>
                    <div style="font-size:2rem;font-weight:700;color:#2563eb;">${displayValue}</div>
                    <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.5rem;">
                        ${unit === 'radians' ? `${formatNumber(resultDeg, 4)}°` : `${formatNumber(resultRad, 8)} rad`}
                    </div>
                </div>
            `;
        } catch (error) {
            outputEl.innerHTML = `<p style="color:#ef4444;">Error: ${error.message}</p>`;
        }
    }

    function clear() {
        inputValEl.value = '';
        outputEl.innerHTML = '-';
        inputValEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const resultText = outputEl.innerText.split('\n').join(' ').trim();
            if (resultText === '-') return;
            copyToClipboard(`Inverse Trig: ${resultText}`);
        });
    }

    inputValEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
