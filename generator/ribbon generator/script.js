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
 * Ribbon Generator
 * Generate CSS ribbon badges
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Ribbon Generator', icon: '\u{1f380}' });

    const ribbonTextEl = $('#ribbonText');
    const ribbonPositionEl = $('#ribbonPosition');
    const ribbonColorEl = $('#ribbonColor');
    const ribbonTextColorEl = $('#ribbonTextColor');
    const ribbonFontSizeEl = $('#ribbonFontSize');
    const ribbonFontSizeValueEl = $('#ribbonFontSizeValue');
    const ribbonPaddingEl = $('#ribbonPadding');
    const ribbonPaddingValueEl = $('#ribbonPaddingValue');
    const ribbonStyleEl = $('#ribbonStyle');
    const previewEl = $('#ribbonPreview');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    let currentCSS = '';

    function generateRibbonCSS(text, position, color, textColor, fontSize, padding, style) {
        let css = '';
        const darkerColor = adjustColor(color, -30);

        if (style === 'corner') {
            let posCSS = '';
            switch (position) {
                case 'top-right':
                    posCSS = 'top: 20px; right: -35px; transform: rotate(45deg);';
                    break;
                case 'top-left':
                    posCSS = 'top: 20px; left: -35px; transform: rotate(-45deg);';
                    break;
                case 'bottom-right':
                    posCSS = 'bottom: 20px; right: -35px; transform: rotate(-45deg);';
                    break;
                case 'bottom-left':
                    posCSS = 'bottom: 20px; left: -35px; transform: rotate(45deg);';
                    break;
                case 'top-center':
                    posCSS = 'top: -10px; left: 50%; transform: translateX(-50%);';
                    break;
                case 'center':
                    posCSS = 'top: 50%; left: 50%; transform: translate(-50%, -50%);';
                    break;
            }

            css = `.ribbon {
  position: absolute;
  ${posCSS}
  background: ${color};
  color: ${textColor};
  padding: ${padding}px ${padding * 4}px;
  font-size: ${fontSize}px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  z-index: 1;
  white-space: nowrap;
}

/* Parent container needs: position: relative; overflow: hidden; */
.ribbon-container {
  position: relative;
  overflow: hidden;
}`;
        } else if (style === 'badge') {
            css = `.ribbon-badge {
  display: inline-block;
  background: ${color};
  color: ${textColor};
  padding: ${padding}px ${padding * 3}px;
  font-size: ${fontSize}px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2), inset 0 -2px 0 ${darkerColor};
  white-space: nowrap;
}`;
        } else { // folded
            css = `.ribbon-folded {
  position: relative;
  display: inline-block;
  background: ${color};
  color: ${textColor};
  padding: ${padding}px ${padding * 3}px ${padding}px ${padding * 2}px;
  font-size: ${fontSize}px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  white-space: nowrap;
}

.ribbon-folded::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -${padding}px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 0 ${padding}px ${padding}px;
  border-color: transparent transparent ${darkerColor} transparent;
}`;
        }

        return css;
    }

    function generatePreviewHTML(text, position, color, textColor, fontSize, padding, style) {
        let html = '';
        const darkerColor = adjustColor(color, -30);
        const containerStyle = 'position:relative;overflow:hidden;width:200px;height:120px;background:#f1f5f9;border-radius:8px;';

        if (style === 'corner') {
            let posCSS = '';
            switch (position) {
                case 'top-right': posCSS = 'top:20px;right:-35px;transform:rotate(45deg);'; break;
                case 'top-left': posCSS = 'top:20px;left:-35px;transform:rotate(-45deg);'; break;
                case 'bottom-right': posCSS = 'bottom:20px;right:-35px;transform:rotate(-45deg);'; break;
                case 'bottom-left': posCSS = 'bottom:20px;left:-35px;transform:rotate(45deg);'; break;
                case 'top-center': posCSS = 'top:-10px;left:50%;transform:translateX(-50%);'; break;
                case 'center': posCSS = 'top:50%;left:50%;transform:translate(-50%,-50%);'; break;
            }
            html = `<div style="${containerStyle}"><div style="position:absolute;${posCSS}background:${color};color:${textColor};padding:${padding}px ${padding * 4}px;font-size:${fontSize}px;font-weight:bold;text-transform:uppercase;box-shadow:0 2px 8px rgba(0,0,0,0.3);white-space:nowrap;">${text}</div></div>`;
        } else if (style === 'badge') {
            html = `<div style="display:flex;align-items:center;justify-content:center;min-height:80px;"><span style="display:inline-block;background:${color};color:${textColor};padding:${padding}px ${padding * 3}px;font-size:${fontSize}px;font-weight:bold;text-transform:uppercase;border-radius:4px;box-shadow:0 2px 4px rgba(0,0,0,0.2);">${text}</span></div>`;
        } else {
            html = `<div style="display:flex;align-items:center;justify-content:center;min-height:80px;"><span style="position:relative;display:inline-block;background:${color};color:${textColor};padding:${padding}px ${padding * 3}px ${padding}px ${padding * 2}px;font-size:${fontSize}px;font-weight:bold;text-transform:uppercase;"><span style="position:absolute;left:0;bottom:-${padding}px;width:0;height:0;border-style:solid;border-width:0 0 ${padding}px ${padding}px;border-color:transparent transparent ${darkerColor} transparent;"></span>${text}</span></div>`;
        }

        return html;
    }

    function adjustColor(hex, amount) {
        hex = hex.replace('#', '');
        let r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
        let g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
        let b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function generate() {
        try {
            const text = ribbonTextEl.value.trim() || 'SALE';
            const position = ribbonPositionEl.value;
            const color = ribbonColorEl.value;
            const textColor = ribbonTextColorEl.value;
            const fontSize = parseInt(ribbonFontSizeEl.value) || 14;
            const padding = parseInt(ribbonPaddingEl.value) || 10;
            const style = ribbonStyleEl.value;

            currentCSS = generateRibbonCSS(text, position, color, textColor, fontSize, padding, style);
            previewEl.innerHTML = generatePreviewHTML(text, position, color, textColor, fontSize, padding, style);
            outputEl.textContent = currentCSS;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
            previewEl.innerHTML = '<p class="text-muted">Failed to generate ribbon.</p>';
        }
    }

    function clear() {
        ribbonTextEl.value = 'SALE';
        ribbonPositionEl.value = 'top-right';
        ribbonColorEl.value = '#ef4444';
        ribbonTextColorEl.value = '#ffffff';
        ribbonFontSizeEl.value = 14;
        ribbonFontSizeValueEl.textContent = '14';
        ribbonPaddingEl.value = 10;
        ribbonPaddingValueEl.textContent = '10';
        ribbonStyleEl.value = 'corner';
        previewEl.innerHTML = '';
        outputEl.textContent = '-';
        currentCSS = '';
    }

    ribbonFontSizeEl.addEventListener('input', () => { ribbonFontSizeValueEl.textContent = ribbonFontSizeEl.value; });
    ribbonPaddingEl.addEventListener('input', () => { ribbonPaddingValueEl.textContent = ribbonPaddingEl.value; });

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (currentCSS) copyToClipboard(currentCSS);
        });
    }

    [ribbonTextEl, ribbonPositionEl, ribbonColorEl, ribbonTextColorEl, ribbonStyleEl].forEach(el => el.addEventListener('change', generate));
    ribbonTextEl.addEventListener('input', generate);
});
