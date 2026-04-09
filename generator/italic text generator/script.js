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
 * 537 - Italic Text Generator
 * Generates italic text using Unicode mathematical italic characters
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Italic Text Generator', icon: '𝐼' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const italicMap = {
        'A': '\uD835\uDC34', 'B': '\uD835\uDC35', 'C': '\uD835\uDC36', 'D': '\uD835\uDC37',
        'E': '\uD835\uDC38', 'F': '\uD835\uDC39', 'G': '\uD835\uDC3A', 'H': '\uD835\uDC3B',
        'I': '\uD835\uDC3C', 'J': '\uD835\uDC3D', 'K': '\uD835\uDC3E', 'L': '\uD835\uDC3F',
        'M': '\uD835\uDC40', 'N': '\uD835\uDC41', 'O': '\uD835\uDC42', 'P': '\uD835\uDC43',
        'Q': '\uD835\uDC44', 'R': '\uD835\uDC45', 'S': '\uD835\uDC46', 'T': '\uD835\uDC47',
        'U': '\uD835\uDC48', 'V': '\uD835\uDC49', 'W': '\uD835\uDC4A', 'X': '\uD835\uDC4B',
        'Y': '\uD835\uDC4C', 'Z': '\uD835\uDC4D',
        'a': '\uD835\uDC4E', 'b': '\uD835\uDC4F', 'c': '\uD835\uDC50', 'd': '\uD835\uDC51',
        'e': '\uD835\uDC52', 'f': '\uD835\uDC53', 'g': '\uD835\uDC54', 'h': '\uD835\uDC55',
        'i': '\uD835\uDC56', 'j': '\uD835\uDC57', 'k': '\uD835\uDC58', 'l': '\uD835\uDC59',
        'm': '\uD835\uDC5A', 'n': '\uD835\uDC5B', 'o': '\uD835\uDC5C', 'p': '\uD835\uDC5D',
        'q': '\uD835\uDC5E', 'r': '\uD835\uDC5F', 's': '\uD835\uDC60', 't': '\uD835\uDC61',
        'u': '\uD835\uDC62', 'v': '\uD835\uDC63', 'w': '\uD835\uDC64', 'x': '\uD835\uDC65',
        'y': '\uD835\uDC66', 'z': '\uD835\uDC67'
    };

    function toItalic(text) {
        return text.split('').map(char => italicMap[char] || char).join('');
    }

    // Bold italic
    const boldItalicMap = {
        'A': '\uD835\uDC68', 'B': '\uD835\uDC69', 'C': '\uD835\uDC6A', 'D': '\uD835\uDC6B',
        'E': '\uD835\uDC6C', 'F': '\uD835\uDC6D', 'G': '\uD835\uDC6E', 'H': '\uD835\uDC6F',
        'I': '\uD835\uDC70', 'J': '\uD835\uDC71', 'K': '\uD835\uDC72', 'L': '\uD835\uDC73',
        'M': '\uD835\uDC74', 'N': '\uD835\uDC75', 'O': '\uD835\uDC76', 'P': '\uD835\uDC77',
        'Q': '\uD835\uDC78', 'R': '\uD835\uDC79', 'S': '\uD835\uDC7A', 'T': '\uD835\uDC7B',
        'U': '\uD835\uDC7C', 'V': '\uD835\uDC7D', 'W': '\uD835\uDC7E', 'X': '\uD835\uDC7F',
        'Y': '\uD835\uDC80', 'Z': '\uD835\uDC81',
        'a': '\uD835\uDC82', 'b': '\uD835\uDC83', 'c': '\uD835\uDC84', 'd': '\uD835\uDC85',
        'e': '\uD835\uDC86', 'f': '\uD835\uDC87', 'g': '\uD835\uDC88', 'h': '\uD835\uDC89',
        'i': '\uD835\uDC8A', 'j': '\uD835\uDC8B', 'k': '\uD835\uDC8C', 'l': '\uD835\uDC8D',
        'm': '\uD835\uDC8E', 'n': '\uD835\uDC8F', 'o': '\uD835\uDC90', 'p': '\uD835\uDC91',
        'q': '\uD835\uDC92', 'r': '\uD835\uDC93', 's': '\uD835\uDC94', 't': '\uD835\uDC95',
        'u': '\uD835\uDC96', 'v': '\uD835\uDC97', 'w': '\uD835\uDC98', 'x': '\uD835\uDC99',
        'y': '\uD835\uDC9A', 'z': '\uD835\uDC9B'
    };

    function toBoldItalic(text) {
        return text.split('').map(char => boldItalicMap[char] || char).join('');
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter text'; return; }

        try {
            let output = '═══ Italic Text ═══\n\n';
            output += toItalic(input);
            output += '\n\n═══ Bold Italic Text ═══\n\n';
            output += toBoldItalic(input);
            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clearAll() { inputEl.value = ''; outputEl.textContent = '-'; inputEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); calculate(); } });
});
