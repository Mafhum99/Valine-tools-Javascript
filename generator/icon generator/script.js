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
 * Icon Generator
 * Generate simple SVG icons
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Icon Generator', icon: '\u{2b50}' });

    const iconTypeEl = $('#iconType');
    const iconSizeEl = $('#iconSize');
    const iconSizeValueEl = $('#iconSizeValue');
    const iconColorEl = $('#iconColor');
    const iconStrokeWidthEl = $('#iconStrokeWidth');
    const iconStrokeWidthValueEl = $('#iconStrokeWidthValue');
    const iconBgColorEl = $('#iconBgColor');
    const previewEl = $('#iconPreview');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    let currentSVG = '';

    function getIconPath(type, strokeWidth) {
        const paths = {
            home: `<path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
            search: `<circle cx="11" cy="11" r="7" stroke="COLOR" stroke-width="WIDTH" fill="none"/><path d="M21 21l-4.35-4.35" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/>`,
            user: `<circle cx="12" cy="8" r="4" stroke="COLOR" stroke-width="WIDTH" fill="none"/><path d="M20 21a8 8 0 10-16 0" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round"/>`,
            settings: `<circle cx="12" cy="12" r="3" stroke="COLOR" stroke-width="WIDTH" fill="none"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="COLOR" stroke-width="WIDTH" fill="none"/>`,
            heart: `<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
            star: `<polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linejoin="round"/>`,
            check: `<polyline points="20 6 9 17 4 12" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
            close: `<line x1="18" y1="6" x2="6" y2="18" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/>`,
            menu: `<line x1="3" y1="6" x2="21" y2="6" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/><line x1="3" y1="12" x2="21" y2="12" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/><line x1="3" y1="18" x2="21" y2="18" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/>`,
            arrow: `<line x1="5" y1="12" x2="19" y2="12" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/><polyline points="12 5 19 12 12 19" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
            download: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="7 10 12 15 17 10" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="15" x2="12" y2="3" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/>`,
            upload: `<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="17 8 12 3 7 8" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/><line x1="12" y1="3" x2="12" y2="15" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/>`,
            play: `<polygon points="5 3 19 12 5 21 5 3" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linejoin="round"/>`,
            pause: `<rect x="6" y="4" width="4" height="16" stroke="COLOR" stroke-width="WIDTH" fill="none" rx="1"/><rect x="14" y="4" width="4" height="16" stroke="COLOR" stroke-width="WIDTH" fill="none" rx="1"/>`,
            mail: `<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/><polyline points="22,6 12,13 2,6" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
            phone: `<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
            location: `<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="10" r="3" stroke="COLOR" stroke-width="WIDTH" fill="none"/>`,
            calendar: `<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="COLOR" stroke-width="WIDTH" fill="none"/><line x1="16" y1="2" x2="16" y2="6" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="COLOR" stroke-width="WIDTH" stroke-linecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="COLOR" stroke-width="WIDTH"/>`,
            camera: `<path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="13" r="4" stroke="COLOR" stroke-width="WIDTH" fill="none"/>`,
            lock: `<rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="COLOR" stroke-width="WIDTH" fill="none"/><path d="M7 11V7a5 5 0 0110 0v4" stroke="COLOR" stroke-width="WIDTH" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="16" r="1" fill="COLOR"/>`
        };

        let path = paths[type] || paths.home;
        path = path.replace(/COLOR/g, '$ICON_COLOR$').replace(/WIDTH/g, '$STROKE_WIDTH$');
        return path;
    }

    function generateSVG(type, size, color, strokeWidth) {
        const viewBox = '0 0 24 24';
        const iconPath = getIconPath(type, strokeWidth);
        const filledPath = iconPath.replace(/\$ICON_COLOR\$/g, color).replace(/\$STROKE_WIDTH\$/g, strokeWidth);

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${size}" fill="none">
  ${filledPath}
</svg>`;
    }

    function generate() {
        try {
            const type = iconTypeEl.value;
            const size = parseInt(iconSizeEl.value) || 48;
            const color = iconColorEl.value;
            const strokeWidth = parseFloat(iconStrokeWidthEl.value) || 2;
            const bgColor = iconBgColorEl.value;

            currentSVG = generateSVG(type, size, color, strokeWidth);
            previewEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:100px;padding:20px;background:${bgColor};border-radius:8px;">${currentSVG}</div>`;
            outputEl.textContent = currentSVG;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
            previewEl.innerHTML = '<p class="text-muted">Failed to generate icon.</p>';
        }
    }

    function clear() {
        iconTypeEl.value = 'home';
        iconSizeEl.value = 48;
        iconSizeValueEl.textContent = '48';
        iconColorEl.value = '#2563eb';
        iconStrokeWidthEl.value = 2;
        iconStrokeWidthValueEl.textContent = '2';
        iconBgColorEl.value = '#f8fafc';
        previewEl.innerHTML = '';
        outputEl.textContent = '-';
        currentSVG = '';
    }

    iconSizeEl.addEventListener('input', () => { iconSizeValueEl.textContent = iconSizeEl.value; });
    iconStrokeWidthEl.addEventListener('input', () => { iconStrokeWidthValueEl.textContent = iconStrokeWidthEl.value; });

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (currentSVG) copyToClipboard(currentSVG);
        });
    }

    [iconTypeEl, iconColorEl, iconBgColorEl].forEach(el => el.addEventListener('change', generate));
});
