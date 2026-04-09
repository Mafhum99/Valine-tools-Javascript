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
 * Circle Equation Calculator
 * Find the equation of a circle from center & radius or from three points
 * Standard form: (x - h)² + (y - k)² = r²
 * General form: x² + y² + Dx + Ey + F = 0
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Circle Equation Calculator', icon: '📐' });

    const calcModeEl = $('#calcMode');
    const cxEl = $('#cx');
    const cyEl = $('#cy');
    const radiusEl = $('#radius');
    const x1El = $('#x1');
    const y1El = $('#y1');
    const x2El = $('#x2');
    const y2El = $('#y2');
    const x3El = $('#x3');
    const y3El = $('#y3');
    const centerRadiusMode = $('#centerradius-mode');
    const threePointsMode = $('#threepoints-mode');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function formatNum(n) {
        if (Number.isInteger(n)) return n.toString();
        return parseFloat(n.toFixed(6)).toString();
    }

    function formatSignedNum(n) {
        return n >= 0 ? '+ ' + formatNum(n) : '- ' + formatNum(Math.abs(n));
    }

    function updateMode() {
        if (calcModeEl.value === 'centerradius') {
            centerRadiusMode.classList.remove('hidden');
            threePointsMode.classList.add('hidden');
        } else {
            centerRadiusMode.classList.add('hidden');
            threePointsMode.classList.remove('hidden');
        }
    }

    function buildCircleEquation(h, k, r, steps) {
        const rSquared = r * r;

        // Standard form
        let standardForm = '';
        if (h === 0 && k === 0) {
            standardForm = `x² + y² = ${formatNum(rSquared)}`;
        } else {
            const hStr = h === 0 ? 'x' : `(x ${formatSignedNum(-h)})`;
            const kStr = k === 0 ? 'y' : `(y ${formatSignedNum(-k)})`;
            standardForm = `${hStr}² + ${kStr}² = ${formatNum(rSquared)}`;
        }

        // General form: x² + y² - 2hx - 2ky + (h² + k² - r²) = 0
        const D = -2 * h;
        const E = -2 * k;
        const F = h * h + k * k - rSquared;

        let generalForm = 'x² + y²';
        if (D !== 0) generalForm += ` ${formatSignedNum(D)}x`;
        if (E !== 0) generalForm += ` ${formatSignedNum(E)}y`;
        if (F !== 0) generalForm += ` ${formatSignedNum(F)}`;
        generalForm += ' = 0';

        // Properties
        const diameter = 2 * r;
        const circumference = 2 * Math.PI * r;
        const area = Math.PI * rSquared;

        steps += 'Standard Form:\n';
        steps += `  ${standardForm}\n\n`;

        steps += 'General Form:\n';
        steps += `  ${generalForm}\n\n`;

        steps += `  Where: D = ${formatNum(D)}, E = ${formatNum(E)}, F = ${formatNum(F)}\n\n`;

        steps += 'Circle Properties:\n';
        steps += `  Center: (${formatNum(h)}, ${formatNum(k)})\n`;
        steps += `  Radius: ${formatNum(r)}\n`;
        steps += `  Diameter: ${formatNum(diameter)}\n`;
        steps += `  Circumference: ${formatNum(circumference)}\n`;
        steps += `  Area: ${formatNum(area)}\n\n`;

        // Key points
        steps += 'Key Points on Circle:\n';
        steps += `  Right:  (${formatNum(h + r)}, ${formatNum(k)})\n`;
        steps += `  Left:   (${formatNum(h - r)}, ${formatNum(k)})\n`;
        steps += `  Top:    (${formatNum(h)}, ${formatNum(k + r)})\n`;
        steps += `  Bottom: (${formatNum(h)}, ${formatNum(k - r)})`;

        return steps;
    }

    function calculateCenterRadius() {
        const h = parseFloat(cxEl.value);
        const k = parseFloat(cyEl.value);
        const r = parseFloat(radiusEl.value);

        if ([h, k, r].some(isNaN)) {
            outputEl.textContent = 'Error: Please enter valid values for center and radius.';
            return;
        }

        if (r <= 0) {
            outputEl.textContent = 'Error: Radius must be positive.';
            return;
        }

        let steps = '';
        steps += 'Given:\n';
        steps += `  Center (h, k) = (${formatNum(h)}, ${formatNum(k)})\n`;
        steps += `  Radius r = ${formatNum(r)}\n\n`;

        steps += 'Standard Form Formula:\n';
        steps += '  (x - h)² + (y - k)² = r²\n\n';

        steps += 'Step 1: Calculate r²\n';
        steps += `  r² = (${formatNum(r)})² = ${formatNum(r * r)}\n\n`;

        steps += 'Step 2: Substitute into standard form\n';

        steps = buildCircleEquation(h, k, r, steps);

        outputEl.textContent = steps;
    }

    function calculateThreePoints() {
        const x1 = parseFloat(x1El.value);
        const y1 = parseFloat(y1El.value);
        const x2 = parseFloat(x2El.value);
        const y2 = parseFloat(y2El.value);
        const x3 = parseFloat(x3El.value);
        const y3 = parseFloat(y3El.value);

        if ([x1, y1, x2, y2, x3, y3].some(isNaN)) {
            outputEl.textContent = 'Error: Please enter valid coordinates for all three points.';
            return;
        }

        // Check for collinear points using the area of the triangle
        const area2 = x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2);

        if (Math.abs(area2) < 1e-10) {
            outputEl.textContent = 'Error: The three points are collinear. No unique circle can be determined.\n\nThe points lie on a straight line.';
            return;
        }

        // Use the circumcircle formula
        // D = 2 * (x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2))
        const D = 2 * (x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2));

        // Center coordinates:
        // h = [(x1²+y1²)(y2-y3) + (x2²+y2²)(y3-y1) + (x3²+y3²)(y1-y2)] / D
        // k = [(x1²+y1²)(x3-x2) + (x2²+y2²)(x1-x3) + (x3²+y3²)(x2-x1)] / D
        const d1sq = x1 * x1 + y1 * y1;
        const d2sq = x2 * x2 + y2 * y2;
        const d3sq = x3 * x3 + y3 * y3;

        const h = (d1sq * (y2 - y3) + d2sq * (y3 - y1) + d3sq * (y1 - y2)) / D;
        const k = (d1sq * (x3 - x2) + d2sq * (x1 - x3) + d3sq * (x2 - x1)) / D;

        // Radius = distance from center to any of the three points
        const r = Math.sqrt((x1 - h) ** 2 + (y1 - k) ** 2);

        // Verify with all three points
        const r1 = Math.sqrt((x1 - h) ** 2 + (y1 - k) ** 2);
        const r2 = Math.sqrt((x2 - h) ** 2 + (y2 - k) ** 2);
        const r3 = Math.sqrt((x3 - h) ** 2 + (y3 - k) ** 2);

        let steps = '';
        steps += 'Given:\n';
        steps += `  Point 1: (${formatNum(x1)}, ${formatNum(y1)})\n`;
        steps += `  Point 2: (${formatNum(x2)}, ${formatNum(y2)})\n`;
        steps += `  Point 3: (${formatNum(x3)}, ${formatNum(y3)})\n\n`;

        steps += 'Method: Circumcircle of triangle\n\n';

        steps += 'Step 1: Calculate the denominator (2 × area factor)\n';
        steps += `  D = 2 × [x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)]\n`;
        steps += `  D = 2 × [${formatNum(x1)}(${formatNum(y2 - y3)}) + ${formatNum(x2)}(${formatNum(y3 - y1)}) + ${formatNum(x3)}(${formatNum(y1 - y2)})]\n`;
        steps += `  D = ${formatNum(D)}\n\n`;

        steps += 'Step 2: Calculate center coordinates\n';
        steps += `  h = ${formatNum(h)}\n`;
        steps += `  k = ${formatNum(k)}\n\n`;

        steps += 'Step 3: Calculate radius\n';
        steps += `  r = distance from center to Point 1\n`;
        steps += `  r = √[(${formatNum(x1)} - ${formatNum(h)})² + (${formatNum(y1)} - ${formatNum(k)})²]\n`;
        steps += `  r = ${formatNum(r)}\n\n`;

        steps += 'Verification:\n';
        steps += `  Distance to P₁: ${formatNum(r1)}\n`;
        steps += `  Distance to P₂: ${formatNum(r2)}\n`;
        steps += `  Distance to P₃: ${formatNum(r3)}\n`;
        steps += `  All equal: ${Math.abs(r1 - r2) < 1e-6 && Math.abs(r2 - r3) < 1e-6 ? 'Yes' : 'No'}\n\n`;

        steps = buildCircleEquation(h, k, r, steps);

        outputEl.textContent = steps;
    }

    function calculate() {
        if (calcModeEl.value === 'centerradius') {
            calculateCenterRadius();
        } else {
            calculateThreePoints();
        }
    }

    function clear() {
        cxEl.value = '';
        cyEl.value = '';
        radiusEl.value = '';
        x1El.value = '';
        y1El.value = '';
        x2El.value = '';
        y2El.value = '';
        x3El.value = '';
        y3El.value = '';
        outputEl.textContent = '-';
        cxEl.focus();
    }

    calcModeEl.addEventListener('change', updateMode);
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    [cxEl, cyEl, radiusEl, x1El, y1El, x2El, y2El, x3El, y3El].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
