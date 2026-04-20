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
function formatNumber(num, decimals = 2) {
    if (isNaN(num) || num === null) return '0';
    return Number(num).toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// ========================================
// Tool Logic
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const radiusInput = $('#radius');
    const calculateBtn = $('#calculate-btn');
    const clearBtn = $('#clear-btn');
    const copyBtn = $('#copy-btn');

    const resVolume = $('#res-volume');
    const resSurfaceArea = $('#res-surface-area');
    const resCircumference = $('#res-circumference');
    const resDiameter = $('#res-diameter');

    function calculate() {
        const r = parseFloat(radiusInput.value);

        if (isNaN(r) || r < 0) {
            showToast('Please enter a valid positive radius');
            return;
        }

        const volume = (4/3) * Math.PI * Math.pow(r, 3);
        const surfaceArea = 4 * Math.PI * Math.pow(r, 2);
        const circumference = 2 * Math.PI * r;
        const diameter = 2 * r;

        resVolume.textContent = formatNumber(volume, 4) + ' units³';
        resSurfaceArea.textContent = formatNumber(surfaceArea, 4) + ' units²';
        resCircumference.textContent = formatNumber(circumference, 4) + ' units';
        resDiameter.textContent = formatNumber(diameter, 4) + ' units';
    }

    function clear() {
        radiusInput.value = '';
        resVolume.textContent = '-';
        resSurfaceArea.textContent = '-';
        resCircumference.textContent = '-';
        resDiameter.textContent = '-';
        radiusInput.focus();
    }

    function copyResults() {
        if (resVolume.textContent === '-') return;
        
        const text = `Sphere Results (Radius: ${radiusInput.value}):
Volume: ${resVolume.textContent}
Surface Area: ${resSurfaceArea.textContent}
Circumference: ${resCircumference.textContent}
Diameter: ${resDiameter.textContent}`;
        
        copyToClipboard(text);
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    copyBtn.addEventListener('click', copyResults);

    radiusInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
