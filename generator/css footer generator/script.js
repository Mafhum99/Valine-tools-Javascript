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
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch { return defaultValue; }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch { return false; }
    },
    remove(key) { localStorage.removeItem(key); },
    clear() { localStorage.clear(); }
};

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
    return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

function formatPercent(value, decimals = 2) {
    return formatNumber(value * 100, decimals) + '%';
}

// ========================================
// Math Utilities
// ========================================
function percentage(part, whole) { return (part / whole) * 100; }
function percentageOf(percent, whole) { return (percent / 100) * whole; }
function percentageChange(oldValue, newValue) { return ((newValue - oldValue) / Math.abs(oldValue)) * 100; }
function clamp(value, min, max) { return Math.min(Math.max(value, min), max); }
function lerp(start, end, t) { return start + (end - start) * t; }
function mapRange(value, inMin, inMax, outMin, outMax) { return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin; }

// ========================================
// String Utilities
// ========================================
function slugify(text) {
    return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').trim();
}
function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function titleCase(str) { return str.toLowerCase().replace(/\b\w/g, capitalize); }
function camelCase(str) { return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()); }
function snakeCase(str) { return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.join('_').toLowerCase() || str.toLowerCase(); }
function kebabCase(str) { return str.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)?.join('-').toLowerCase() || str.toLowerCase(); }

// ========================================
// Date Utilities
// ========================================
function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    return format.replace('YYYY', d.getFullYear()).replace('MM', String(d.getMonth() + 1).padStart(2, '0')).replace('DD', String(d.getDate()).padStart(2, '0')).replace('HH', String(d.getHours()).padStart(2, '0')).replace('mm', String(d.getMinutes()).padStart(2, '0')).replace('ss', String(d.getSeconds()).padStart(2, '0'));
}
function daysBetween(date1, date2) { const oneDay = 24 * 60 * 60 * 1000; return Math.round(Math.abs((date1 - date2) / oneDay)); }
function addDays(date, days) { const result = new Date(date); result.setDate(result.getDate() + days); return result; }

// ========================================
// Color Utilities
// ========================================
const Color = {
    rgbToHex(r, g, b) { return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join(''); },
    hexToRgb(hex) { const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex); return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null; },
    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        if (max === min) { h = s = 0; }
        else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: h * 360, s: s * 100, l: l * 100 };
    },
    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;
        if (s === 0) { r = g = b = l; }
        else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1; if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1/3);
        }
        return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
    },
    random() { return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'); }
};

// ========================================
// Random Utilities
// ========================================
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, decimals = 2) { return Number((Math.random() * (max - min) + min).toFixed(decimals)); }
function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomString(length = 10, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789') {
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ========================================
// Debounce & Throttle
// ========================================
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) { func.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); }
    };
}

// ========================================
// Validation
// ========================================
function isEmail(str) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); }
function isURL(str) { try { new URL(str); return true; } catch { return false; } }
function isNumber(str) { return !isNaN(str) && !isNaN(parseFloat(str)); }

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
 * CSS Footer Generator
 * Generate footer HTML and CSS
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSS Footer Generator', icon: '\u{1F447}' });

    const bgColor = $('#bgColor');
    const bgColorText = $('#bgColorText');
    const textColor = $('#textColor');
    const textColorText = $('#textColorText');
    const columns = $('#columns');
    const preview = $('#preview');
    const output = $('#output');
    const generateBtn = $('#generateBtn');
    const clearBtn = $('#clearBtn');
    const copyBtn = $('#copyBtn');

    let styleEl = null;

    function syncColor() {
        bgColor.addEventListener('input', () => { bgColorText.value = bgColor.value; });
        bgColorText.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(bgColorText.value)) bgColor.value = bgColorText.value;
        });
        textColor.addEventListener('input', () => { textColorText.value = textColor.value; });
        textColorText.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(textColorText.value)) textColor.value = textColorText.value;
        });
    }

    function generate() {
        const bg = bgColor.value;
        const tc = textColor.value;
        const cols = columns.value.split(',').map(c => c.trim()).filter(c => c);

        if (styleEl) { styleEl.remove(); styleEl = null; }
        styleEl = document.createElement('style');

        const linksHTML = cols.map(col => {
            const items = ['Link 1', 'Link 2', 'Link 3'].map(l => `<li><a href="#">${l}</a></li>`).join('');
            return `<div class="footer-col-gen"><h4>${col}</h4><ul>${items}</ul></div>`;
        }).join('\n            ');

        styleEl.textContent = `
            .footer-gen { background: ${bg}; padding: 3rem 2rem; border-radius: var(--radius); }
            .footer-cols-gen { display: grid; grid-template-columns: repeat(${cols.length}, 1fr); gap: 2rem; margin-bottom: 2rem; }
            .footer-col-gen h4 { color: white; margin: 0 0 1rem; font-size: 1rem; }
            .footer-col-gen ul { list-style: none; padding: 0; margin: 0; }
            .footer-col-gen ul li { margin-bottom: 0.5rem; }
            .footer-col-gen a { color: ${tc}; text-decoration: none; font-size: 0.875rem; }
            .footer-col-gen a:hover { color: white; }
            .footer-copy-gen { color: ${tc}; text-align: center; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.875rem; }
        `;
        document.head.appendChild(styleEl);

        preview.innerHTML = `
            <div class="footer-cols-gen">${linksHTML}</div>
            <div class="footer-copy-gen">&copy; 2025 Your Company. All rights reserved.</div>
        `;
        preview.className = 'footer-gen';

        const colsCSS = cols.map(col => {
            return `<div class="footer-col">\n        <h4>${col}</h4>\n        <ul>\n            <li><a href="#">Link 1</a></li>\n            <li><a href="#">Link 2</a></li>\n            <li><a href="#">Link 3</a></li>\n        </ul>\n    </div>`;
        }).join('\n    ');

        const css = `/* HTML */
<footer class="footer">
    <div class="footer-cols">
    ${colsCSS}
    </div>
    <div class="footer-copy">&copy; 2025 Your Company. All rights reserved.</div>
</footer>

/* CSS */
.footer {
    background: ${bg};
    padding: 3rem 2rem;
}

.footer-cols {
    display: grid;
    grid-template-columns: repeat(${cols.length}, 1fr);
    gap: 2rem;
    margin-bottom: 2rem;
}

.footer-col h4 {
    color: white;
    margin: 0 0 1rem;
    font-size: 1rem;
}

.footer-col ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.footer-col ul li {
    margin-bottom: 0.5rem;
}

.footer-col a {
    color: ${tc};
    text-decoration: none;
    font-size: 0.875rem;
}

.footer-col a:hover {
    color: white;
}

.footer-copy {
    color: ${tc};
    text-align: center;
    padding-top: 2rem;
    border-top: 1px solid rgba(255,255,255,0.1);
    font-size: 0.875rem;
}`;
        output.textContent = css;
    }

    function clear() {
        bgColor.value = '#1f2937'; bgColorText.value = '#1f2937';
        textColor.value = '#9ca3af'; textColorText.value = '#9ca3af';
        columns.value = 'Company, Product, Support';
        if (styleEl) { styleEl.remove(); styleEl = null; }
        preview.innerHTML = '';
        preview.className = '';
        output.textContent = '-';
    }

    syncColor();
    [bgColor, bgColorText, textColor, textColorText, columns].forEach(el => {
        el.addEventListener('input', generate);
    });

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (output.textContent !== '-') copyToClipboard(output.textContent);
        });
    }

    generate();
});
