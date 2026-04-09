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
 * Shape Generator
 * Generate various CSS shapes
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Shape Generator', icon: '\u{1f537}' });

    const shapeTypeEl = $('#shapeType');
    const shapeWidthEl = $('#shapeWidth');
    const shapeHeightEl = $('#shapeHeight');
    const shapeColorEl = $('#shapeColor');
    const shapeBgColorEl = $('#shapeBgColor');
    const previewEl = $('#shapePreview');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    let currentCSS = '';

    function generateShapeCSS(type, width, height, color) {
        let css = '';
        const halfW = Math.round(width / 2);
        const halfH = Math.round(height / 2);

        switch (type) {
            case 'circle':
                const size = Math.min(width, height);
                css = `.circle {
  width: ${size}px;
  height: ${size}px;
  background: ${color};
  border-radius: 50%;
}`;
                break;

            case 'ellipse':
                css = `.ellipse {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
  border-radius: 50%;
}`;
                break;

            case 'square':
                const sqSize = Math.min(width, height);
                css = `.square {
  width: ${sqSize}px;
  height: ${sqSize}px;
  background: ${color};
}`;
                break;

            case 'rectangle':
                css = `.rectangle {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
}`;
                break;

            case 'diamond':
                css = `.diamond {
  width: ${halfW}px;
  height: ${halfH}px;
  background: ${color};
  transform: rotate(45deg);
  margin: ${Math.round(halfH / 2)}px;
}`;
                break;

            case 'parallelogram':
                css = `.parallelogram {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
  transform: skew(-20deg);
}`;
                break;

            case 'star':
                css = `/* 5-point star using clip-path */
.star {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}`;
                break;

            case 'heart':
                css = `/* Heart shape using SVG data URI */
.heart {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
  mask: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 88.9C25.7 71.1 0 50.7 0 31.1 0 13.9 13.9 0 31.1 0c10.5 0 18.5 5.2 18.9 5.6C50.4 5.2 58.4 0 68.9 0 86.1 0 100 13.9 100 31.1c0 19.6-25.7 40-50 57.8z'/></svg>") no-repeat center / contain;
  -webkit-mask: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 88.9C25.7 71.1 0 50.7 0 31.1 0 13.9 13.9 0 31.1 0c10.5 0 18.5 5.2 18.9 5.6C50.4 5.2 58.4 0 68.9 0 86.1 0 100 13.9 100 31.1c0 19.6-25.7 40-50 57.8z'/></svg>") no-repeat center / contain;
}`;
                break;

            case 'hexagon':
                css = `/* Hexagon using clip-path */
.hexagon {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
  clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
}`;
                break;

            case 'pentagon':
                css = `/* Pentagon using clip-path */
.pentagon {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
  clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);
}`;
                break;

            case 'octagon':
                css = `/* Octagon using clip-path */
.octagon {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
  clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
}`;
                break;

            case 'cross':
                css = `/* Cross/Plus shape using clip-path */
.cross {
  width: ${width}px;
  height: ${height}px;
  background: ${color};
  clip-path: polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%);
}`;
                break;

            default:
                css = `.shape {\n  width: ${width}px;\n  height: ${height}px;\n  background: ${color};\n}`;
        }

        return css;
    }

    function generate() {
        try {
            const type = shapeTypeEl.value;
            const width = parseInt(shapeWidthEl.value) || 100;
            const height = parseInt(shapeHeightEl.value) || 100;
            const color = shapeColorEl.value;
            const bgColor = shapeBgColorEl.value;

            currentCSS = generateShapeCSS(type, width, height, color);

            // Build preview element
            let previewHTML = '';
            const styleAttr = `background:${color};`;

            switch (type) {
                case 'circle': {
                    const size = Math.min(width, height);
                    previewHTML = `<div style="${styleAttr}width:${size}px;height:${size}px;border-radius:50%;"></div>`;
                    break;
                }
                case 'ellipse':
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;border-radius:50%;"></div>`;
                    break;
                case 'square': {
                    const sqSize = Math.min(width, height);
                    previewHTML = `<div style="${styleAttr}width:${sqSize}px;height:${sqSize}px;"></div>`;
                    break;
                }
                case 'rectangle':
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;"></div>`;
                    break;
                case 'diamond':
                    previewHTML = `<div style="${styleAttr}width:${Math.round(width / 2)}px;height:${Math.round(height / 2)}px;transform:rotate(45deg);margin:${Math.round(height / 4)}px;"></div>`;
                    break;
                case 'parallelogram':
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;transform:skew(-20deg);"></div>`;
                    break;
                case 'star':
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;clip-path:polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);"></div>`;
                    break;
                case 'hexagon':
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;clip-path:polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);"></div>`;
                    break;
                case 'pentagon':
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;clip-path:polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%);"></div>`;
                    break;
                case 'octagon':
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;clip-path:polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);"></div>`;
                    break;
                case 'cross':
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;clip-path:polygon(35% 0%, 65% 0%, 65% 35%, 100% 35%, 100% 65%, 65% 65%, 65% 100%, 35% 100%, 35% 65%, 0% 65%, 0% 35%, 35% 35%);"></div>`;
                    break;
                case 'heart':
                    previewHTML = `<svg width="${width}" height="${height}" viewBox="0 0 100 100"><path d="M50 88.9C25.7 71.1 0 50.7 0 31.1 0 13.9 13.9 0 31.1 0c10.5 0 18.5 5.2 18.9 5.6C50.4 5.2 58.4 0 68.9 0 86.1 0 100 13.9 100 31.1c0 19.6-25.7 40-50 57.8z" fill="${color}"/></svg>`;
                    break;
                default:
                    previewHTML = `<div style="${styleAttr}width:${width}px;height:${height}px;"></div>`;
            }

            previewEl.innerHTML = `<div style="background:${bgColor};padding:20px;display:flex;align-items:center;justify-content:center;min-height:150px;border-radius:8px;">${previewHTML}</div>`;
            outputEl.textContent = currentCSS;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
            previewEl.innerHTML = '<p class="text-muted">Failed to generate shape.</p>';
        }
    }

    function clear() {
        shapeTypeEl.value = 'circle';
        shapeWidthEl.value = 100;
        shapeHeightEl.value = 100;
        shapeColorEl.value = '#2563eb';
        shapeBgColorEl.value = '#f8fafc';
        previewEl.innerHTML = '';
        outputEl.textContent = '-';
        currentCSS = '';
    }

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (currentCSS) copyToClipboard(currentCSS);
        });
    }

    [shapeTypeEl, shapeColorEl, shapeBgColorEl].forEach(el => el.addEventListener('change', generate));
});
