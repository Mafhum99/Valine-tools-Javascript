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
 * Heron's Formula Calculator
 * Calculate triangle area from three side lengths
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: "Heron's Formula Calculator", icon: '📐' });

    const sideAEl = $('#side-a');
    const sideBEl = $('#side-b');
    const sideCEl = $('#side-c');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    // Validate triangle inequality theorem
    function validateTriangle(a, b, c) {
        const errors = [];
        if (a + b <= c) errors.push(`Side a (${formatNumber(a)}) + Side b (${formatNumber(b)}) must be greater than Side c (${formatNumber(c)})`);
        if (a + c <= b) errors.push(`Side a (${formatNumber(a)}) + Side c (${formatNumber(c)}) must be greater than Side b (${formatNumber(b)})`);
        if (b + c <= a) errors.push(`Side b (${formatNumber(b)}) + Side c (${formatNumber(c)}) must be greater than Side a (${formatNumber(a)})`);
        return errors;
    }

    function calculate() {
        const aStr = sideAEl.value.trim();
        const bStr = sideBEl.value.trim();
        const cStr = sideCEl.value.trim();

        if (!aStr || !bStr || !cStr) {
            outputEl.innerHTML = '<p style="color:#ef4444;">All three side lengths are required</p>';
            return;
        }

        const a = parseFloat(aStr);
        const b = parseFloat(bStr);
        const c = parseFloat(cStr);

        if (isNaN(a) || isNaN(b) || isNaN(c)) {
            outputEl.innerHTML = '<p style="color:#ef4444;">All side lengths must be valid numbers</p>';
            return;
        }

        if (a <= 0 || b <= 0 || c <= 0) {
            outputEl.innerHTML = '<p style="color:#ef4444;">All side lengths must be greater than zero</p>';
            return;
        }

        // Validate triangle inequality
        const errors = validateTriangle(a, b, c);
        if (errors.length > 0) {
            outputEl.innerHTML = errors.map(e => `<p style="color:#ef4444;">${e}</p>`).join('');
            return;
        }

        try {
            // Heron's formula: s = (a+b+c)/2, Area = sqrt(s*(s-a)*(s-b)*(s-c))
            const s = (a + b + c) / 2;
            const radicand = s * (s - a) * (s - b) * (s - c);

            if (radicand < 0) {
                outputEl.innerHTML = '<p style="color:#ef4444;">Invalid triangle: the given sides cannot form a real triangle</p>';
                return;
            }

            const area = Math.sqrt(radicand);

            // Additional properties
            const perimeter = a + b + c;

            // Calculate angles using law of cosines
            const angleA = Math.acos((b * b + c * c - a * a) / (2 * b * c)) * (180 / Math.PI);
            const angleB = Math.acos((a * a + c * c - b * b) / (2 * a * c)) * (180 / Math.PI);
            const angleC = Math.acos((a * a + b * b - c * c) / (2 * a * b)) * (180 / Math.PI);

            outputEl.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:2.5rem;font-weight:700;color:#22c55e;">${formatNumber(area, 4)}</div>
                    <div style="font-size:0.875rem;color:#6b7280;margin-top:0.25rem;">Area (square units)</div>

                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-top:1rem;text-align:left;">
                        <div style="padding:0.75rem;background:#f3f4f6;border-radius:0.375rem;">
                            <div style="font-size:0.625rem;text-transform:uppercase;color:#6b7280;font-weight:600;">Semi-perimeter (s)</div>
                            <div style="font-weight:600;font-size:1.125rem;margin-top:0.25rem;">${formatNumber(s, 4)}</div>
                        </div>
                        <div style="padding:0.75rem;background:#f3f4f6;border-radius:0.375rem;">
                            <div style="font-size:0.625rem;text-transform:uppercase;color:#6b7280;font-weight:600;">Perimeter</div>
                            <div style="font-weight:600;font-size:1.125rem;margin-top:0.25rem;">${formatNumber(perimeter, 4)}</div>
                        </div>
                    </div>

                    <div style="margin-top:1rem;padding:0.75rem;background:#f3f4f6;border-radius:0.375rem;text-align:left;">
                        <div style="font-size:0.625rem;text-transform:uppercase;color:#6b7280;font-weight:600;margin-bottom:0.5rem;">Sides</div>
                        <div style="display:flex;gap:1rem;font-size:0.875rem;">
                            <span>a = ${formatNumber(a, 4)}</span>
                            <span>b = ${formatNumber(b, 4)}</span>
                            <span>c = ${formatNumber(c, 4)}</span>
                        </div>
                    </div>

                    <div style="margin-top:1rem;padding:0.75rem;background:#f3f4f6;border-radius:0.375rem;text-align:left;">
                        <div style="font-size:0.625rem;text-transform:uppercase;color:#6b7280;font-weight:600;margin-bottom:0.5rem;">Angles</div>
                        <div style="display:flex;gap:1rem;font-size:0.875rem;">
                            <span>A = ${formatNumber(angleA, 2)}deg</span>
                            <span>B = ${formatNumber(angleB, 2)}deg</span>
                            <span>C = ${formatNumber(angleC, 2)}deg</span>
                        </div>
                    </div>

                    <div style="margin-top:1rem;padding:0.75rem;background:#eff6ff;border-radius:0.375rem;text-align:left;font-family:monospace;font-size:0.75rem;">
                        <div style="color:#6b7280;font-weight:600;margin-bottom:0.25rem;">Formula</div>
                        s = (a + b + c) / 2 = ${formatNumber(s, 4)}<br>
                        Area = sqrt(s * (s-a) * (s-b) * (s-c))<br>
                        Area = sqrt(${formatNumber(s, 4)} * ${formatNumber(s-a, 4)} * ${formatNumber(s-b, 4)} * ${formatNumber(s-c, 4)})<br>
                        Area = sqrt(${formatNumber(radicand, 6)}) = ${formatNumber(area, 4)}
                    </div>
                </div>
            `;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        sideAEl.value = '';
        sideBEl.value = '';
        sideCEl.value = '';
        outputEl.innerHTML = '<p style="color:#9ca3af;">Enter the three side lengths and click Calculate</p>';
        sideAEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = `Heron's Formula Calculator\nSide a: ${sideAEl.value}\nSide b: ${sideBEl.value}\nSide c: ${sideCEl.value}\n${outputEl.textContent}`;
            copyToClipboard(text);
        });
    }

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
