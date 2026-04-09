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
 * CSS Pattern Generator
 * Generate CSS background patterns
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'CSS Pattern Generator', icon: '\u{1F3B2}' });

    const patternType = $('#patternType');
    const color1 = $('#color1');
    const color1Text = $('#color1Text');
    const color2 = $('#color2');
    const color2Text = $('#color2Text');
    const size = $('#size');
    const sizeVal = $('#sizeVal');
    const preview = $('#preview');
    const output = $('#output');
    const generateBtn = $('#generateBtn');
    const clearBtn = $('#clearBtn');
    const copyBtn = $('#copyBtn');

    function syncColor(colorInput, textInput) {
        colorInput.addEventListener('input', () => { textInput.value = colorInput.value; });
        textInput.addEventListener('input', () => {
            if (/^#[0-9A-Fa-f]{6}$/.test(textInput.value)) colorInput.value = textInput.value;
        });
    }

    function generate() {
        const type = patternType.value;
        const c1 = color1.value;
        const c2 = color2.value;
        const s = size.value;

        sizeVal.textContent = s + 'px';

        let background = '';

        if (type === 'stripes') {
            background = `repeating-linear-gradient(45deg, ${c1}, ${c1} ${s}px, ${c2} ${s}px, ${c2} ${s * 2}px)`;
        } else if (type === 'dots') {
            background = `radial-gradient(circle, ${c1} ${s/5}px, transparent ${s/5}px) 0 0 / ${s}px ${s}px, radial-gradient(circle, ${c1} ${s/5}px, transparent ${s/5}px) ${s/2}px ${s/2}px / ${s}px ${s}px`;
            background = c2 + ', ' + background;
            background = `background-color: ${c2};\nbackground-image: radial-gradient(circle, ${c1} ${s/5}px, transparent ${s/5}px), radial-gradient(circle, ${c1} ${s/5}px, transparent ${s/5}px);\nbackground-size: ${s}px ${s}px;\nbackground-position: 0 0, ${s/2}px ${s/2}px;`;
        } else if (type === 'checkers') {
            background = `linear-gradient(45deg, ${c1} 25%, transparent 25%), linear-gradient(-45deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c1} 75%), linear-gradient(-45deg, transparent 75%, ${c1} 75%)`;
            background = `${c2};\nbackground-image: linear-gradient(45deg, ${c1} 25%, transparent 25%), linear-gradient(-45deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c1} 75%), linear-gradient(-45deg, transparent 75%, ${c1} 75%);\nbackground-size: ${s}px ${s}px;\nbackground-position: 0 0, 0 ${s/2}px, ${s/2}px ${-s/2}px, ${-s/2}px 0px;`;
        } else {
            background = `linear-gradient(135deg, ${c1} 25%, transparent 25%) -${s}px 0, linear-gradient(225deg, ${c1} 25%, transparent 25%) -${s}px 0, linear-gradient(315deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, ${c1} 25%, transparent 25%)`;
            background = `${c2};\nbackground-image: linear-gradient(135deg, ${c1} 25%, transparent 25%), linear-gradient(225deg, ${c1} 25%, transparent 25%), linear-gradient(315deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, ${c1} 25%, transparent 25%);\nbackground-size: ${s}px ${s}px;\nbackground-color: ${c2};`;
        }

        preview.style.background = '';
        if (type === 'stripes') {
            preview.style.backgroundImage = `repeating-linear-gradient(45deg, ${c1}, ${c1} ${s}px, ${c2} ${s}px, ${c2} ${s * 2}px)`;
        } else if (type === 'dots') {
            preview.style.backgroundColor = c2;
            preview.style.backgroundImage = `radial-gradient(circle, ${c1} ${s/5}px, transparent ${s/5}px), radial-gradient(circle, ${c1} ${s/5}px, transparent ${s/5}px)`;
            preview.style.backgroundSize = `${s}px ${s}px`;
            preview.style.backgroundPosition = `0 0, ${s/2}px ${s/2}px`;
        } else if (type === 'checkers') {
            preview.style.backgroundColor = c2;
            preview.style.backgroundImage = `linear-gradient(45deg, ${c1} 25%, transparent 25%), linear-gradient(-45deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, transparent 75%, ${c1} 75%), linear-gradient(-45deg, transparent 75%, ${c1} 75%)`;
            preview.style.backgroundSize = `${s}px ${s}px`;
            preview.style.backgroundPosition = `0 0, 0 ${s/2}px, ${s/2}px ${-s/2}px, ${-s/2}px 0px`;
        } else {
            preview.style.backgroundColor = c2;
            preview.style.backgroundImage = `linear-gradient(135deg, ${c1} 25%, transparent 25%), linear-gradient(225deg, ${c1} 25%, transparent 25%), linear-gradient(315deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, ${c1} 25%, transparent 25%)`;
            preview.style.backgroundSize = `${s}px ${s}px`;
        }

        let css;
        if (type === 'stripes') {
            css = `background: repeating-linear-gradient(\n    45deg,\n    ${c1},\n    ${c1} ${s}px,\n    ${c2} ${s}px,\n    ${c2} ${s * 2}px\n);`;
        } else if (type === 'dots') {
            css = `background-color: ${c2};\nbackground-image:\n    radial-gradient(circle, ${c1} ${Math.round(s/5)}px, transparent ${Math.round(s/5)}px),\n    radial-gradient(circle, ${c1} ${Math.round(s/5)}px, transparent ${Math.round(s/5)}px);\nbackground-size: ${s}px ${s}px;\nbackground-position: 0 0, ${s/2}px ${s/2}px;`;
        } else if (type === 'checkers') {
            css = `background-color: ${c2};\nbackground-image:\n    linear-gradient(45deg, ${c1} 25%, transparent 25%),\n    linear-gradient(-45deg, ${c1} 25%, transparent 25%),\n    linear-gradient(45deg, transparent 75%, ${c1} 75%),\n    linear-gradient(-45deg, transparent 75%, ${c1} 75%);\nbackground-size: ${s}px ${s}px;\nbackground-position: 0 0, 0 ${s/2}px, ${s/2}px ${-s/2}px, ${-s/2}px 0px;`;
        } else {
            css = `background-color: ${c2};\nbackground-image:\n    linear-gradient(135deg, ${c1} 25%, transparent 25%),\n    linear-gradient(225deg, ${c1} 25%, transparent 25%),\n    linear-gradient(315deg, ${c1} 25%, transparent 25%),\n    linear-gradient(45deg, ${c1} 25%, transparent 25%);\nbackground-size: ${s}px ${s}px;`;
        }

        output.textContent = css;
    }

    function clear() {
        patternType.value = 'stripes';
        color1.value = '#2563eb'; color1Text.value = '#2563eb';
        color2.value = '#ffffff'; color2Text.value = '#ffffff';
        size.value = 20; sizeVal.textContent = '20px';
        preview.removeAttribute('style');
        output.textContent = '-';
    }

    syncColor(color1, color1Text);
    syncColor(color2, color2Text);
    [color1, color1Text, color2, color2Text, size].forEach(el => el.addEventListener('input', generate));
    patternType.addEventListener('change', generate);

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (output.textContent !== '-') copyToClipboard(output.textContent);
        });
    }

    generate();
});
