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
 * Line Equation Calculator
 * Find the equation of a line from two points or from a point and slope
 * Forms: y = mx + b (slope-intercept), y - y₁ = m(x - x₁) (point-slope), Ax + By = C (standard)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Line Equation Calculator', icon: '📐' });

    const calcModeEl = $('#calcMode');
    const x1El = $('#x1');
    const y1El = $('#y1');
    const x2El = $('#x2');
    const y2El = $('#y2');
    const pxEl = $('#px');
    const pyEl = $('#py');
    const slopeEl = $('#slope');
    const twopointsMode = $('#twopoints-mode');
    const pointslopeMode = $('#pointslope-mode');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function formatNum(n) {
        if (Number.isInteger(n)) return n.toString();
        return parseFloat(n.toFixed(6)).toString();
    }

    function formatCoeff(n, variable) {
        if (n === 0) return '';
        if (n === 1) return variable;
        if (n === -1) return '-' + variable;
        return formatNum(n) + variable;
    }

    function formatSignedNum(n) {
        return n >= 0 ? '+ ' + formatNum(n) : '- ' + formatNum(Math.abs(n));
    }

    function updateMode() {
        if (calcModeEl.value === 'twopoints') {
            twopointsMode.classList.remove('hidden');
            pointslopeMode.classList.add('hidden');
        } else {
            twopointsMode.classList.add('hidden');
            pointslopeMode.classList.remove('hidden');
        }
    }

    function buildLineEquation(m, b, steps) {
        // Slope-intercept form
        if (m === 0) {
            steps += `  Slope-intercept: y = ${formatNum(b)}\n`;
        } else if (b === 0) {
            steps += `  Slope-intercept: y = ${formatNum(m)}x\n`;
        } else {
            steps += `  Slope-intercept: y = ${formatNum(m)}x ${formatSignedNum(b)}\n`;
        }

        // Standard form: Ax + By = C
        // From y = mx + b => -mx + y = b
        // To get integer coefficients, multiply by denominator
        let A = -m;
        let B = 1;
        let C = b;

        // Try to convert to integers if m and b are rational
        const mFrac = toFraction(m);
        const bFrac = toFraction(b);

        if (mFrac && bFrac) {
            const lcm = lcmOf(mFrac.den, bFrac.den);
            A = -m * lcm;
            B = 1 * lcm;
            C = b * lcm;

            // Make A positive if possible
            if (A < 0) { A = -A; B = -B; C = -C; }
            // Or make B positive if A is 0
            else if (A === 0 && B < 0) { B = -B; C = -C; }

            // Round to handle floating point errors
            A = Math.round(A);
            B = Math.round(B);
            C = Math.round(C);

            let stdForm = '';
            if (A !== 0) stdForm += formatCoeff(A, 'x') + ' ';
            if (B !== 0) stdForm += formatCoeff(B, 'y') + ' ';
            stdForm = stdForm.trim() + ` = ${formatNum(C)}`;
            steps += `  Standard form: ${stdForm}\n`;
        } else {
            A = Math.round(A * 1000000) / 1000000;
            C = Math.round(C * 1000000) / 1000000;
            steps += `  Standard form: ${formatNum(A)}x + y = ${formatNum(C)}\n`;
        }

        // Point-slope form using a reference point
        // Angle of inclination
        const angleDeg = Math.atan(m) * (180 / Math.PI);
        steps += `  Angle of inclination: ${formatNum(angleDeg)}°\n`;

        // x-intercept (where y = 0)
        if (m !== 0) {
            const xInt = -b / m;
            steps += `  x-intercept: (${formatNum(xInt)}, 0)\n`;
        } else {
            steps += `  x-intercept: None (horizontal line)\n`;
        }

        // y-intercept
        steps += `  y-intercept: (0, ${formatNum(b)})`;

        return steps;
    }

    function toFraction(decimal, tolerance = 1e-10) {
        if (Number.isInteger(decimal)) return { num: decimal, den: 1 };
        if (Math.abs(decimal) < tolerance) return { num: 0, den: 1 };

        const sign = decimal < 0 ? -1 : 1;
        decimal = Math.abs(decimal);

        for (let den = 1; den <= 10000; den++) {
            const num = Math.round(decimal * den);
            if (Math.abs(num / den - decimal) < tolerance) {
                return { num: sign * num, den: den };
            }
        }
        return null;
    }

    function lcmOf(a, b) {
        return Math.abs(a * b) / gcdOf(a, b);
    }

    function gcdOf(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);
        while (b) {
            [a, b] = [b, a % b];
        }
        return a;
    }

    function calculateTwoPoints() {
        const x1 = parseFloat(x1El.value);
        const y1 = parseFloat(y1El.value);
        const x2 = parseFloat(x2El.value);
        const y2 = parseFloat(y2El.value);

        if ([x1, y1, x2, y2].some(isNaN)) {
            outputEl.textContent = 'Error: Please enter valid coordinates for both points.';
            return;
        }

        // Check if points are the same
        if (x1 === x2 && y1 === y2) {
            outputEl.textContent = 'Error: The two points are identical. A unique line cannot be determined.';
            return;
        }

        const dx = x2 - x1;
        const dy = y2 - y1;

        // Check for vertical line
        if (dx === 0) {
            let steps = '';
            steps += 'Given:\n';
            steps += `  Point 1: (${formatNum(x1)}, ${formatNum(y1)})\n`;
            steps += `  Point 2: (${formatNum(x2)}, ${formatNum(y2)})\n\n`;

            steps += 'Formula:\n';
            steps += '  m = (y₂ - y₁) / (x₂ - x₁)\n\n';

            steps += 'Calculation:\n';
            steps += `  m = (${formatNum(y2)} - ${formatNum(y1)}) / (${formatNum(x2)} - ${formatNum(x1)})\n`;
            steps += `  m = ${formatNum(dy)} / 0\n\n`;

            steps += 'Result:\n';
            steps += '  This is a VERTICAL LINE (slope is undefined)\n';
            steps += `  Equation: x = ${formatNum(x1)}\n`;
            steps += `  Standard form: x = ${formatNum(x1)}\n`;
            steps += `  All points on this line have x = ${formatNum(x1)}`;

            outputEl.textContent = steps;
            return;
        }

        const m = dy / dx;
        const b = y1 - m * x1;

        // Check for horizontal line
        if (dy === 0) {
            let steps = '';
            steps += 'Given:\n';
            steps += `  Point 1: (${formatNum(x1)}, ${formatNum(y1)})\n`;
            steps += `  Point 2: (${formatNum(x2)}, ${formatNum(y2)})\n\n`;

            steps += 'Step 1: Calculate slope\n';
            steps += `  m = (${formatNum(y2)} - ${formatNum(y1)}) / (${formatNum(x2)} - ${formatNum(x1)})\n`;
            steps += `  m = 0 / ${formatNum(dx)} = 0\n\n`;

            steps += 'Step 2: Calculate y-intercept\n';
            steps += `  b = y₁ - m × x₁ = ${formatNum(y1)} - 0 × ${formatNum(x1)} = ${formatNum(y1)}\n\n`;

            steps += 'Result:\n';
            steps += '  This is a HORIZONTAL LINE (slope = 0)\n';
            steps += `  Slope-intercept: y = ${formatNum(b)}\n`;
            steps += `  Standard form: y = ${formatNum(b)}\n`;
            steps += `  All points on this line have y = ${formatNum(b)}`;

            outputEl.textContent = steps;
            return;
        }

        let steps = '';
        steps += 'Given:\n';
        steps += `  Point 1: (${formatNum(x1)}, ${formatNum(y1)})\n`;
        steps += `  Point 2: (${formatNum(x2)}, ${formatNum(y2)})\n\n`;

        steps += 'Step 1: Calculate slope\n';
        steps += `  m = (y₂ - y₁) / (x₂ - x₁)\n`;
        steps += `  m = (${formatNum(y2)} - ${formatNum(y1)}) / (${formatNum(x2)} - ${formatNum(x1)})\n`;
        steps += `  m = ${formatNum(dy)} / ${formatNum(dx)}\n`;
        steps += `  m = ${formatNum(m)}\n\n`;

        steps += 'Step 2: Calculate y-intercept\n';
        steps += `  b = y₁ - m × x₁\n`;
        steps += `  b = ${formatNum(y1)} - ${formatNum(m)} × ${formatNum(x1)}\n`;
        steps += `  b = ${formatNum(y1)} - ${formatNum(m * x1)}\n`;
        steps += `  b = ${formatNum(b)}\n\n`;

        steps += 'Result:\n';
        steps += buildLineEquation(m, b, '');

        outputEl.textContent = steps;
    }

    function calculatePointSlope() {
        const px = parseFloat(pxEl.value);
        const py = parseFloat(pyEl.value);
        const m = parseFloat(slopeEl.value);

        if ([px, py, m].some(isNaN)) {
            outputEl.textContent = 'Error: Please enter valid values for the point and slope.';
            return;
        }

        const b = py - m * px;

        let steps = '';
        steps += 'Given:\n';
        steps += `  Point: (${formatNum(px)}, ${formatNum(py)})\n`;
        steps += `  Slope (m): ${formatNum(m)}\n\n`;

        steps += 'Formula:\n';
        steps += '  y - y₁ = m(x - x₁)  (point-slope form)\n';
        steps += '  y = mx + b  (slope-intercept form)\n\n';

        steps += 'Step 1: Write point-slope form\n';
        steps += `  y - ${formatNum(py)} = ${formatNum(m)}(x - ${formatNum(px)})\n\n`;

        steps += 'Step 2: Calculate y-intercept\n';
        steps += `  b = y₁ - m × x₁\n`;
        steps += `  b = ${formatNum(py)} - ${formatNum(m)} × ${formatNum(px)}\n`;
        steps += `  b = ${formatNum(py)} - ${formatNum(m * px)}\n`;
        steps += `  b = ${formatNum(b)}\n\n`;

        steps += 'Result:\n';
        steps += buildLineEquation(m, b, '');

        outputEl.textContent = steps;
    }

    function calculate() {
        if (calcModeEl.value === 'twopoints') {
            calculateTwoPoints();
        } else {
            calculatePointSlope();
        }
    }

    function clear() {
        x1El.value = '';
        y1El.value = '';
        x2El.value = '';
        y2El.value = '';
        pxEl.value = '';
        pyEl.value = '';
        slopeEl.value = '';
        outputEl.textContent = '-';
        x1El.focus();
    }

    calcModeEl.addEventListener('change', updateMode);
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    [x1El, y1El, x2El, y2El, pxEl, pyEl, slopeEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
