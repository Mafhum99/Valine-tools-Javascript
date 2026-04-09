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
 * 536 - Bold Text Generator
 * Generates bold text using Unicode mathematical bold characters
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Bold Text Generator', icon: '𝗕' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const boldMap = {
        'A': '\uD835\uDC00', 'B': '\uD835\uDC01', 'C': '\uD835\uDC02', 'D': '\uD835\uDC03',
        'E': '\uD835\uDC04', 'F': '\uD835\uDC05', 'G': '\uD835\uDC06', 'H': '\uD835\uDC07',
        'I': '\uD835\uDC08', 'J': '\uD835\uDC09', 'K': '\uD835\uDC0A', 'L': '\uD835\uDC0B',
        'M': '\uD835\uDC0C', 'N': '\uD835\uDC0D', 'O': '\uD835\uDC0E', 'P': '\uD835\uDC0F',
        'Q': '\uD835\uDC10', 'R': '\uD835\uDC11', 'S': '\uD835\uDC12', 'T': '\uD835\uDC13',
        'U': '\uD835\uDC14', 'V': '\uD835\uDC15', 'W': '\uD835\uDC16', 'X': '\uD835\uDC17',
        'Y': '\uD835\uDC18', 'Z': '\uD835\uDC19',
        'a': '\uD835\uDC1A', 'b': '\uD835\uDC1B', 'c': '\uD835\uDC1C', 'd': '\uD835\uDC1D',
        'e': '\uD835\uDC1E', 'f': '\uD835\uDC1F', 'g': '\uD835\uDC20', 'h': '\uD835\uDC21',
        'i': '\uD835\uDC22', 'j': '\uD835\uDC23', 'k': '\uD835\uDC24', 'l': '\uD835\uDC25',
        'm': '\uD835\uDC26', 'n': '\uD835\uDC27', 'o': '\uD835\uDC28', 'p': '\uD835\uDC29',
        'q': '\uD835\uDC2A', 'r': '\uD835\uDC2B', 's': '\uD835\uDC2C', 't': '\uD835\uDC2D',
        'u': '\uD835\uDC2E', 'v': '\uD835\uDC2F', 'w': '\uD835\uDC30', 'x': '\uD835\uDC31',
        'y': '\uD835\uDC32', 'z': '\uD835\uDC33',
        '0': '\uD835\uDFCE', '1': '\uD835\uDFCF', '2': '\uD835\uDFD0', '3': '\uD835\uDFD1',
        '4': '\uD835\uDFD2', '5': '\uD835\uDFD3', '6': '\uD835\uDFD4', '7': '\uD835\uDFD5',
        '8': '\uD835\uDFD6', '9': '\uD835\uDFD7'
    };

    function toBold(text) {
        return text.split('').map(char => boldMap[char] || char).join('');
    }

    // Sans-serif bold
    const boldSansMap = {
        'A': '\uD835\uDE00', 'B': '\uD835\uDE01', 'C': '\uD835\uDE02', 'D': '\uD835\uDE03',
        'E': '\uD835\uDE04', 'F': '\uD835\uDE05', 'G': '\uD835\uDE06', 'H': '\uD835\uDE07',
        'I': '\uD835\uDE08', 'J': '\uD835\uDE09', 'K': '\uD835\uDE0A', 'L': '\uD835\uDE0B',
        'M': '\uD835\uDE0C', 'N': '\uD835\uDE0D', 'O': '\uD835\uDE0E', 'P': '\uD835\uDE0F',
        'Q': '\uD835\uDE10', 'R': '\uD835\uDE11', 'S': '\uD835\uDE12', 'T': '\uD835\uDE13',
        'U': '\uD835\uDE14', 'V': '\uD835\uDE15', 'W': '\uD835\uDE16', 'X': '\uD835\uDE17',
        'Y': '\uD835\uDE18', 'Z': '\uD835\uDE19',
        'a': '\uD835\uDE1A', 'b': '\uD835\uDE1B', 'c': '\uD835\uDE1C', 'd': '\uD835\uDE1D',
        'e': '\uD835\uDE1E', 'f': '\uD835\uDE1F', 'g': '\uD835\uDE20', 'h': '\uD835\uDE21',
        'i': '\uD835\uDE22', 'j': '\uD835\uDE23', 'k': '\uD835\uDE24', 'l': '\uD835\uDE25',
        'm': '\uD835\uDE26', 'n': '\uD835\uDE27', 'o': '\uD835\uDE28', 'p': '\uD835\uDE29',
        'q': '\uD835\uDE2A', 'r': '\uD835\uDE2B', 's': '\uD835\uDE2C', 't': '\uD835\uDE2D',
        'u': '\uD835\uDE2E', 'v': '\uD835\uDE2F', 'w': '\uD835\uDE30', 'x': '\uD835\uDE31',
        'y': '\uD835\uDE32', 'z': '\uD835\uDE33'
    };

    function toBoldSans(text) {
        return text.split('').map(char => boldSansMap[char] || char).join('');
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter text'; return; }

        try {
            let output = '═══ Bold Text (Serif) ═══\n\n';
            output += toBold(input);
            output += '\n\n═══ Bold Text (Sans-serif) ═══\n\n';
            output += toBoldSans(input);
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
