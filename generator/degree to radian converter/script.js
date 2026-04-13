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
 * Degree to Radian Converter
 * Convert degrees to radians
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Degree to Radian Converter', icon: '🔄' });

    // Get elements
    const degreesEl = $('#degrees');
    const radiansEl = $('#radians');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Find fraction representation of a decimal with respect to π
    function findPiFraction(value) {
        // Common fractions
        const fractions = [
            { num: 0, den: 1, label: '0' },
            { num: 1, den: 6, label: 'π/6' },
            { num: 1, den: 4, label: 'π/4' },
            { num: 1, den: 3, label: 'π/3' },
            { num: 1, den: 2, label: 'π/2' },
            { num: 2, den: 3, label: '2π/3' },
            { num: 3, den: 4, label: '3π/4' },
            { num: 5, den: 6, label: '5π/6' },
            { num: 1, den: 1, label: 'π' },
            { num: 7, den: 6, label: '7π/6' },
            { num: 5, den: 4, label: '5π/4' },
            { num: 4, den: 3, label: '4π/3' },
            { num: 3, den: 2, label: '3π/2' },
            { num: 5, den: 3, label: '5π/3' },
            { num: 7, den: 4, label: '7π/4' },
            { num: 11, den: 6, label: '11π/6' },
            { num: 2, den: 1, label: '2π' },
        ];

        for (const frac of fractions) {
            const expected = (frac.num / frac.den) * Math.PI;
            if (Math.abs(value - expected) < 1e-10) {
                return frac.label;
            }
        }

        // For non-standard values, show as multiple of π
        const multiple = value / Math.PI;
        if (Math.abs(multiple - Math.round(multiple)) < 1e-10) {
            return `${Math.round(multiple)}π`;
        }

        // Try to find a simple fraction
        for (let den = 2; den <= 12; den++) {
            const num = Math.round(value * den / Math.PI);
            if (Math.abs(value - (num / den) * Math.PI) < 1e-10) {
                if (num === 0) return '0';
                if (num === 1 && den === 1) return 'π';
                if (den === 1) return `${num}π`;
                if (num === 1) return `π/${den}`;
                return `${num}π/${den}`;
            }
        }

        return null;
    }

    // Main conversion function - bidirectional
    function convert(source) {
        let degrees, radians;

        if (source === 'degrees') {
            const deg = parseFloat(degreesEl.value.trim());
            if (isNaN(deg)) {
                outputEl.innerHTML = '<span style="color: #ef4444;">Please enter a valid number for degrees</span>';
                return;
            }
            degrees = deg;
            radians = degrees * (Math.PI / 180);
            radiansEl.value = formatNumber(radians, 6);
        } else {
            const rad = parseFloat(radiansEl.value.trim());
            if (isNaN(rad)) {
                outputEl.innerHTML = '<span style="color: #ef4444;">Please enter a valid number for radians</span>';
                return;
            }
            radians = rad;
            degrees = radians * (180 / Math.PI);
            degreesEl.value = formatNumber(degrees, 6);
        }

        const piFraction = findPiFraction(radians);

        let piFractionDisplay = '';
        if (piFraction) {
            piFractionDisplay = `<br><strong>In terms of π:</strong> ${piFraction}`;
        }

        outputEl.innerHTML = `
            <div style="text-align: left; line-height: 1.8;">
                <strong>🔄 Conversion Results:</strong><br>
                <strong>Degrees:</strong> ${formatNumber(degrees, 6)}°<br>
                <strong>Radians:</strong> ${formatNumber(radians, 6)} rad${piFractionDisplay}<br>
                <br>
                <strong>Formulas:</strong><br>
                radians = degrees × (π / 180)<br>
                degrees = radians × (180 / π)
            </div>
        `;
    }

    // Clear function
    function clear() {
        degreesEl.value = '';
        radiansEl.value = '';
        outputEl.textContent = '-';
        degreesEl.focus();
    }

    // Event listeners
    calculateBtn.addEventListener('click', () => {
        // Determine which field has input
        const hasDegrees = degreesEl.value.trim() !== '';
        const hasRadians = radiansEl.value.trim() !== '';

        if (!hasDegrees && !hasRadians) {
            outputEl.innerHTML = '<span style="color: #ef4444;">Please enter a value in either degrees or radians</span>';
            return;
        }

        // Prefer degrees if both are filled
        convert(hasDegrees ? 'degrees' : 'radians');
    });

    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    // Enter key support
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            const hasDegrees = degreesEl.value.trim() !== '';
            const hasRadians = radiansEl.value.trim() !== '';
            if (!hasDegrees && !hasRadians) {
                outputEl.innerHTML = '<span style="color: #ef4444;">Please enter a value in either degrees or radians</span>';
                return;
            }
            convert(hasDegrees ? 'degrees' : 'radians');
        }
    };
    degreesEl.addEventListener('keypress', handleEnter);
    radiansEl.addEventListener('keypress', handleEnter);

    // Auto-convert on input change
    degreesEl.addEventListener('input', () => {
        if (degreesEl.value.trim()) {
            convert('degrees');
        }
    });
    radiansEl.addEventListener('input', () => {
        if (radiansEl.value.trim()) {
            convert('radians');
        }
    });
});
