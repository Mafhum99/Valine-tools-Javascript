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

function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
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
 * Laplace Transform Calculator
 * Simple table-based lookup for common transforms
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Laplace Transform Calculator', icon: '📈' });

    const functionEl = $('#function');
    const paramAEl = $('#param-a');
    const paramNEl = $('#param-n');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    const paramAContainer = paramAEl.closest('.form-group');
    const paramNContainer = paramNEl.closest('.form-group');

    function updateFields() {
        const func = functionEl.value;
        // Show/hide params based on selection
        paramAContainer.style.display = (['eat', 'sinat', 'cosat', 'sinhat', 'coshat'].includes(func)) ? 'block' : 'none';
        paramNContainer.style.display = (func === 'tn') ? 'block' : 'none';
    }

    functionEl.addEventListener('change', updateFields);
    updateFields();

    function calculate() {
        const func = functionEl.value;
        const a = parseFloat(paramAEl.value);
        const n = parseInt(paramNEl.value);

        let ft = '';
        let Fs = '';

        try {
            switch (func) {
                case '1':
                    ft = '1';
                    Fs = '1/s';
                    break;
                case 't':
                    ft = 't';
                    Fs = '1/s²';
                    break;
                case 'tn':
                    if (isNaN(n) || n < 0) throw new Error('n must be a non-negative integer');
                    ft = `t^${n}`;
                    Fs = `${factorial(n)} / s^${n + 1}`;
                    break;
                case 'eat':
                    if (isNaN(a)) throw new Error('Parameter a is required');
                    ft = `e^(${formatNumber(a)}t)`;
                    Fs = `1 / (s - ${formatNumber(a)})`;
                    break;
                case 'sinat':
                    if (isNaN(a)) throw new Error('Parameter a is required');
                    ft = `sin(${formatNumber(a)}t)`;
                    Fs = `${formatNumber(a)} / (s² + ${formatNumber(a * a)})`;
                    break;
                case 'cosat':
                    if (isNaN(a)) throw new Error('Parameter a is required');
                    ft = `cos(${formatNumber(a)}t)`;
                    Fs = `s / (s² + ${formatNumber(a * a)})`;
                    break;
                case 'sinhat':
                    if (isNaN(a)) throw new Error('Parameter a is required');
                    ft = `sinh(${formatNumber(a)}t)`;
                    Fs = `${formatNumber(a)} / (s² - ${formatNumber(a * a)})`;
                    break;
                case 'coshat':
                    if (isNaN(a)) throw new Error('Parameter a is required');
                    ft = `cosh(${formatNumber(a)}t)`;
                    Fs = `s / (s² - ${formatNumber(a * a)})`;
                    break;
            }

            outputEl.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:0.875rem;color:#6b7280;margin-bottom:0.5rem;">L{ ${ft} }</div>
                    <div style="font-size:1.5rem;font-weight:700;color:#2563eb;font-family:serif;">F(s) = ${Fs}</div>
                    <div style="font-size:0.75rem;color:#9ca3af;margin-top:1rem;text-align:left;padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;">
                        <strong>Note:</strong> s > ${(['eat', 'sinhat', 'coshat'].includes(func)) ? (isNaN(a) ? 'a' : Math.abs(a)) : '0'}
                    </div>
                </div>
            `;
        } catch (error) {
            outputEl.innerHTML = `<p style="color:#ef4444;">${error.message}</p>`;
        }
    }

    function clear() {
        paramAEl.value = '';
        paramNEl.value = '';
        outputEl.innerHTML = '-';
        functionEl.value = '1';
        updateFields();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = outputEl.innerText.trim();
            if (text === '-') return;
            copyToClipboard(`Laplace Transform: ${text.split('\n')[1]}`);
        });
    }

    [paramAEl, paramNEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
