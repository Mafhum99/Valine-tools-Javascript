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
 * Ellipse Equation Calculator
 * Find the equation of an ellipse from center and axis lengths
 * Standard form: (x-h)²/a² + (y-k)²/b² = 1 (horizontal) or (x-h)²/b² + (y-k)²/a² = 1 (vertical)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Ellipse Equation Calculator', icon: '📐' });

    const cxEl = $('#cx');
    const cyEl = $('#cy');
    const axisAEl = $('#axisA');
    const axisBEl = $('#axisB');
    const orientationEl = $('#orientation');
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

    function calculate() {
        const h = parseFloat(cxEl.value);
        const k = parseFloat(cyEl.value);
        const a = parseFloat(axisAEl.value);
        const b = parseFloat(axisBEl.value);

        if ([h, k, a, b].some(isNaN)) {
            outputEl.textContent = 'Error: Please enter valid values for center and axes.';
            return;
        }

        if (a <= 0 || b <= 0) {
            outputEl.textContent = 'Error: Both semi-major and semi-minor axes must be positive.';
            return;
        }

        // Determine orientation
        let orientation = orientationEl.value;
        let isHorizontal;

        if (orientation === 'auto') {
            isHorizontal = a >= b;
            orientation = isHorizontal ? 'horizontal' : 'vertical';
        } else {
            isHorizontal = orientation === 'horizontal';
        }

        let steps = '';
        steps += 'Given:\n';
        steps += `  Center (h, k) = (${formatNum(h)}, ${formatNum(k)})\n`;
        steps += `  Semi-major axis (a) = ${formatNum(a)}\n`;
        steps += `  Semi-minor axis (b) = ${formatNum(b)}\n`;
        steps += `  Orientation: ${orientation} major axis\n\n`;

        // Calculate properties
        const aSquared = a * a;
        const bSquared = b * b;

        // c = distance from center to each focus
        // For horizontal: c² = a² - b²
        // For vertical: c² = a² - b² (same formula, but c is along the vertical axis)
        const cSquared = aSquared - bSquared;
        const hasRealFoci = cSquared > 0;
        const c = hasRealFoci ? Math.sqrt(cSquared) : 0;

        // Eccentricity: e = c/a
        const eccentricity = hasRealFoci ? c / a : 0;

        // Latus rectum: LR = 2b²/a
        const latusRectum = 2 * bSquared / a;

        // Area = π × a × b
        const area = Math.PI * a * b;

        // Approximate circumference using Ramanujan's formula
        const p = 3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b));
        const circumference = Math.PI * p;

        steps += 'Calculated Values:\n';
        steps += `  a² = ${formatNum(aSquared)}\n`;
        steps += `  b² = ${formatNum(bSquared)}\n`;
        steps += `  c² = a² - b² = ${formatNum(aSquared)} - ${formatNum(bSquared)} = ${formatNum(cSquared)}\n`;

        if (hasRealFoci) {
            steps += `  c = √${formatNum(cSquared)} = ${formatNum(c)}\n`;
        } else if (cSquared === 0) {
            steps += `  c = 0 (this is a circle)\n`;
        } else {
            steps += `  c² < 0: No real foci (this should not happen for valid ellipse)\n`;
        }

        steps += `  Eccentricity (e) = c/a = ${formatNum(eccentricity)}\n`;
        steps += `  Latus rectum = 2b²/a = ${formatNum(latusRectum)}\n\n`;

        steps += 'Standard Form Equation:\n';

        if (isHorizontal) {
            // (x-h)²/a² + (y-k)²/b² = 1
            let eq = '';
            if (h === 0) eq += 'x²';
            else eq += `(x ${formatSignedNum(-h)})²`;
            eq += `/${formatNum(aSquared)} + `;
            if (k === 0) eq += 'y²';
            else eq += `(y ${formatSignedNum(-k)})²`;
            eq += `/${formatNum(bSquared)} = 1`;

            steps += `  ${eq}\n\n`;

            steps += `  Horizontal major axis:\n`;
            steps += `  Vertices: (${formatNum(h - a)}, ${formatNum(k)}) and (${formatNum(h + a)}, ${formatNum(k)})\n`;
            steps += `  Co-vertices: (${formatNum(h)}, ${formatNum(k - b)}) and (${formatNum(h)}, ${formatNum(k + b)})\n`;

            if (hasRealFoci) {
                steps += `  Foci: (${formatNum(h - c)}, ${formatNum(k)}) and (${formatNum(h + c)}, ${formatNum(k)})\n`;
            } else if (cSquared === 0) {
                steps += `  Foci: Both at center (circle)\n`;
            }

            steps += `  Major axis length: ${formatNum(2 * a)}\n`;
            steps += `  Minor axis length: ${formatNum(2 * b)}\n`;

        } else {
            // (x-h)²/b² + (y-k)²/a² = 1
            let eq = '';
            if (h === 0) eq += 'x²';
            else eq += `(x ${formatSignedNum(-h)})²`;
            eq += `/${formatNum(bSquared)} + `;
            if (k === 0) eq += 'y²';
            else eq += `(y ${formatSignedNum(-k)})²`;
            eq += `/${formatNum(aSquared)} = 1`;

            steps += `  ${eq}\n\n`;

            steps += `  Vertical major axis:\n`;
            steps += `  Vertices: (${formatNum(h)}, ${formatNum(k - a)}) and (${formatNum(h)}, ${formatNum(k + a)})\n`;
            steps += `  Co-vertices: (${formatNum(h - b)}, ${formatNum(k)}) and (${formatNum(h + b)}, ${formatNum(k)})\n`;

            if (hasRealFoci) {
                steps += `  Foci: (${formatNum(h)}, ${formatNum(k - c)}) and (${formatNum(h)}, ${formatNum(k + c)})\n`;
            } else if (cSquared === 0) {
                steps += `  Foci: Both at center (circle)\n`;
            }

            steps += `  Major axis length: ${formatNum(2 * a)}\n`;
            steps += `  Minor axis length: ${formatNum(2 * b)}\n`;
        }

        steps += '\nGeneral Form:\n';
        // Expand: (x-h)²/A + (y-k)²/B = 1 where A, B are the denominators
        // A(x-k)² + B(x-h)² = AB ... let me compute this properly
        // (x-h)²/a² + (y-k)²/b² = 1
        // b²(x-h)² + a²(y-k)² = a²b²
        // b²(x²-2hx+h²) + a²(y²-2ky+k²) = a²b²
        // b²x² - 2hb²x + h²b² + a²y² - 2ka²y + k²a² - a²b² = 0

        const A_coeff = isHorizontal ? bSquared : bSquared; // coeff of x² term is b² in both cases... no
        // Actually:
        // For horizontal: (x-h)²/a² + (y-k)²/b² = 1
        //   => b²(x-h)² + a²(y-k)² = a²b²
        //   => b²x² - 2hb²x + h²b² + a²y² - 2ka²y + k²a² - a²b² = 0
        //   => b²x² + a²y² - 2hb²x - 2ka²y + (h²b² + k²a² - a²b²) = 0

        const coeffX2 = bSquared;
        const coeffY2 = aSquared;
        const coeffX = -2 * h * bSquared;
        const coeffY = -2 * k * aSquared;
        const constant = h * h * bSquared + k * k * aSquared - aSquared * bSquared;

        let generalForm = '';
        if (coeffX2 !== 1) generalForm += formatNum(coeffX2);
        generalForm += 'x² ';

        if (coeffY2 !== 0) {
            if (coeffY2 !== 1) generalForm += formatSignedNum(coeffY2) + 'y²';
            else generalForm += '+ y²';
        }

        if (coeffX !== 0) generalForm += ` ${formatSignedNum(coeffX)}x`;
        if (coeffY !== 0) generalForm += ` ${formatSignedNum(coeffY)}y`;
        if (constant !== 0) generalForm += ` ${formatSignedNum(constant)}`;
        generalForm += ' = 0';

        steps += `  ${generalForm}\n\n`;

        steps += 'Ellipse Properties:\n';
        steps += `  Area: ${formatNum(area)}\n`;
        steps += `  Circumference (approx): ${formatNum(circumference)}`;

        outputEl.textContent = steps;
    }

    function clear() {
        cxEl.value = '';
        cyEl.value = '';
        axisAEl.value = '';
        axisBEl.value = '';
        orientationEl.value = 'auto';
        outputEl.textContent = '-';
        cxEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    [cxEl, cyEl, axisAEl, axisBEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
