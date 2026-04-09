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
 * Hero Section Generator
 * Generate hero sections
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Hero Section Generator', icon: '\u{1f31f}' });

    const titleEl = $('#heroTitle');
    const subtitleEl = $('#heroSubtitle');
    const ctaEl = $('#heroCTA');
    const bgColorEl = $('#heroBgColor');
    const textColorEl = $('#heroTextColor');
    const accentColorEl = $('#heroAccentColor');
    const heightEl = $('#heroHeight');
    const styleEl = $('#heroStyle');
    const previewEl = $('#heroPreview');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    let currentCode = '';

    function darkenColor(hex, amount) {
        hex = hex.replace('#', '');
        const r = Math.max(0, parseInt(hex.substring(0, 2), 16) - amount);
        const g = Math.max(0, parseInt(hex.substring(2, 4), 16) - amount);
        const b = Math.max(0, parseInt(hex.substring(4, 6), 16) - amount);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    function generateHeroHTML(title, subtitle, cta, bgColor, textColor, accentColor, height, style) {
        let layoutStyle = '';
        let contentStyle = '';
        let innerHTML = '';

        const ctaHTML = cta ? `<a href="#" class="hero-cta">${cta}</a>` : '';

        switch (style) {
            case 'left':
                layoutStyle = `display:flex;align-items:flex-start;justify-content:flex-start;text-align:left;padding:60px;`;
                contentStyle = `max-width:600px;`;
                innerHTML = `<div class="hero-content" style="${contentStyle}">\n      <h1 class="hero-title">${title}</h1>\n      <p class="hero-subtitle">${subtitle}</p>\n      ${ctaHTML}\n    </div>`;
                break;
            case 'split':
                layoutStyle = `display:flex;align-items:center;justify-content:space-between;padding:40px 60px;gap:40px;`;
                innerHTML = `<div class="hero-content" style="flex:1;text-align:left;">\n      <h1 class="hero-title">${title}</h1>\n      <p class="hero-subtitle">${subtitle}</p>\n      ${ctaHTML}\n    </div>\n    <div class="hero-visual" style="flex:1;height:300px;background:rgba(255,255,255,0.05);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:48px;opacity:0.3;">&#x1f680;</div>`;
                break;
            default:
                layoutStyle = `display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 20px;`;
                innerHTML = `<div class="hero-content">\n      <h1 class="hero-title">${title}</h1>\n      <p class="hero-subtitle">${subtitle}</p>\n      ${ctaHTML}\n    </div>`;
        }

        const html = `<section class="hero" style="background:${bgColor};color:${textColor};min-height:${height}px;${layoutStyle}font-family:Arial,sans-serif;">\n  ${innerHTML}\n</section>`;

        const css = `.hero {
  background: ${bgColor};
  color: ${textColor};
  min-height: ${height}px;
  font-family: Arial, sans-serif;
  ${layoutStyle.replace(/;/g, ';\n  ')}
}

.hero-title {
  font-size: 48px;
  font-weight: 800;
  line-height: 1.1;
  margin: 0 0 16px;
}

.hero-subtitle {
  font-size: 20px;
  line-height: 1.5;
  margin: 0 0 32px;
  opacity: 0.85;
}

.hero-cta {
  display: inline-block;
  padding: 14px 32px;
  background: ${accentColor};
  color: #fff;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  transition: background 0.2s;
}

.hero-cta:hover {
  background: ${darkenColor(accentColor, 20)};
}`;

        return { html, css };
    }

    function generate() {
        try {
            const title = titleEl.value.trim() || 'Hero Title';
            const subtitle = subtitleEl.value.trim() || 'Hero subtitle';
            const cta = ctaEl.value.trim();
            const bgColor = bgColorEl.value;
            const textColor = textColorEl.value;
            const accentColor = accentColorEl.value;
            const height = parseInt(heightEl.value) || 500;
            const style = styleEl.value;

            const result = generateHeroHTML(title, subtitle, cta, bgColor, textColor, accentColor, height, style);
            currentCode = `<!-- HTML -->\n${result.html}\n\n/* CSS */\n${result.css}`;

            const scale = Math.min(1, 500 / 800);
            previewEl.innerHTML = `<div style="overflow:auto;"><div style="transform:scale(${scale});transform-origin:top left;">${result.html}</div></div>`;
            outputEl.textContent = currentCode;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
            previewEl.innerHTML = '<p class="text-muted">Failed to generate hero section.</p>';
        }
    }

    function clear() {
        titleEl.value = 'Build Something Amazing';
        subtitleEl.value = 'The best platform for your needs';
        ctaEl.value = 'Get Started';
        bgColorEl.value = '#0f172a';
        textColorEl.value = '#ffffff';
        accentColorEl.value = '#3b82f6';
        heightEl.value = 500;
        $('#heroHeightValue').textContent = '500';
        styleEl.value = 'center';
        previewEl.innerHTML = '';
        outputEl.textContent = '-';
        currentCode = '';
    }

    heightEl.addEventListener('input', () => { $('#heroHeightValue').textContent = heightEl.value; });

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (currentCode) copyToClipboard(currentCode);
        });
    }

    [titleEl, subtitleEl, ctaEl, bgColorEl, textColorEl, accentColorEl, styleEl].forEach(el => el.addEventListener('change', generate));
    titleEl.addEventListener('input', generate);
    subtitleEl.addEventListener('input', generate);
});
