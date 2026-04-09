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
 * Parallel Line Calculator
 * Find the equation of a line parallel to a given line through a point
 * Key property: Parallel lines have the same slope (m₁ = m₂)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Parallel Line Calculator', icon: '📐' });

    const lineInputModeEl = $('#lineInputMode');
    const origSlopeEl = $('#origSlope');
    const origInterceptEl = $('#origIntercept');
    const stdAEl = $('#stdA');
    const stdBEl = $('#stdB');
    const stdCEl = $('#stdC');
    const lx1El = $('#lx1');
    const ly1El = $('#ly1');
    const lx2El = $('#lx2');
    const ly2El = $('#ly2');
    const pxEl = $('#px');
    const pyEl = $('#py');

    const slopeinterceptMode = $('#slopeintercept-mode');
    const standardMode = $('#standard-mode');
    const twopointsMode = $('#twopoints-mode');

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
        slopeinterceptMode.classList.add('hidden');
        standardMode.classList.add('hidden');
        twopointsMode.classList.add('hidden');

        switch (lineInputModeEl.value) {
            case 'slopeintercept':
                slopeinterceptMode.classList.remove('hidden');
                break;
            case 'standard':
                standardMode.classList.remove('hidden');
                break;
            case 'twopoints':
                twopointsMode.classList.remove('hidden');
                break;
        }
    }

    function buildParallelLineResult(m, isVertical, verticalX, px, py, origLineStr) {
        let steps = '';

        steps += 'Original line:\n';
        steps += `  ${origLineStr}\n\n`;

        steps += `Point for parallel line: (${formatNum(px)}, ${formatNum(py)})\n\n`;

        if (isVertical) {
            steps += 'Key property: Parallel lines have the same slope\n\n';
            steps += 'Result:\n';
            steps += '  The original line is VERTICAL (undefined slope)\n';
            steps += `  Parallel line equation: x = ${formatNum(verticalX)}\n`;
            steps += `  All points on this line have x = ${formatNum(verticalX)}`;
            return steps;
        }

        const newB = py - m * px;

        steps += 'Key property: Parallel lines have the same slope\n';
        steps += `  m_parallel = m_original = ${formatNum(m)}\n\n`;

        steps += 'Calculate new y-intercept:\n';
        steps += `  b = y₀ - m × x₀\n`;
        steps += `  b = ${formatNum(py)} - ${formatNum(m)} × ${formatNum(px)}\n`;
        steps += `  b = ${formatNum(py)} - ${formatNum(m * px)}\n`;
        steps += `  b = ${formatNum(newB)}\n\n`;

        steps += 'Result:\n';

        // Slope-intercept form
        if (m === 0) {
            steps += `  Slope-intercept: y = ${formatNum(newB)}\n`;
        } else if (newB === 0) {
            steps += `  Slope-intercept: y = ${formatNum(m)}x\n`;
        } else {
            steps += `  Slope-intercept: y = ${formatNum(m)}x ${formatSignedNum(newB)}\n`;
        }

        // Standard form: -mx + y = b => -mx*den + y*den = b*den
        const mFrac = toFraction(m);
        const bFrac = toFraction(newB);
        if (mFrac && bFrac) {
            const lcm = lcmOf(mFrac.den, bFrac.den);
            let A = Math.round(-m * lcm);
            let B = Math.round(1 * lcm);
            let C = Math.round(newB * lcm);
            if (A < 0) { A = -A; B = -B; C = -C; }
            else if (A === 0 && B < 0) { B = -B; C = -C; }

            let stdForm = '';
            if (A !== 0) stdForm += (A === 1 ? '' : A === -1 ? '-' : A) + 'x ';
            if (B !== 0) stdForm += (B === 1 ? '' : B === -1 ? '-' : B) + 'y ';
            stdForm = stdForm.trim() + ` = ${C}`;
            steps += `  Standard form: ${stdForm}`;
        }

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
                return { num: sign * num, den };
            }
        }
        return null;
    }

    function lcmOf(a, b) {
        return Math.abs(a * b) / gcdOf(a, b);
    }

    function gcdOf(a, b) {
        a = Math.abs(a); b = Math.abs(b);
        while (b) { [a, b] = [b, a % b]; }
        return a;
    }

    function calculate() {
        const px = parseFloat(pxEl.value);
        const py = parseFloat(pyEl.value);

        if (isNaN(px) || isNaN(py)) {
            outputEl.textContent = 'Error: Please enter valid coordinates for the point.';
            return;
        }

        let m, origLineStr, isVertical = false, verticalX = 0;

        switch (lineInputModeEl.value) {
            case 'slopeintercept': {
                m = parseFloat(origSlopeEl.value);
                const b = parseFloat(origInterceptEl.value);
                if (isNaN(m) || isNaN(b)) {
                    outputEl.textContent = 'Error: Please enter valid slope and y-intercept.';
                    return;
                }
                origLineStr = `y = ${formatNum(m)}x ${formatSignedNum(b)}`;
                break;
            }
            case 'standard': {
                const A = parseFloat(stdAEl.value);
                const B = parseFloat(stdBEl.value);
                const C = parseFloat(stdCEl.value);
                if (isNaN(A) || isNaN(B) || isNaN(C)) {
                    outputEl.textContent = 'Error: Please enter valid values for A, B, and C.';
                    return;
                }
                if (A === 0 && B === 0) {
                    outputEl.textContent = 'Error: A and B cannot both be zero in standard form.';
                    return;
                }
                origLineStr = `${formatNum(A)}x ${formatSignedNum(B)}y = ${formatNum(C)}`;

                if (B === 0) {
                    // Vertical line: Ax = C => x = C/A
                    isVertical = true;
                    verticalX = C / A;
                    m = 0; // placeholder
                    break;
                }
                m = -A / B;
                break;
            }
            case 'twopoints': {
                const lx1 = parseFloat(lx1El.value);
                const ly1 = parseFloat(ly1El.value);
                const lx2 = parseFloat(lx2El.value);
                const ly2 = parseFloat(ly2El.value);
                if ([lx1, ly1, lx2, ly2].some(isNaN)) {
                    outputEl.textContent = 'Error: Please enter valid coordinates for both points.';
                    return;
                }
                if (lx1 === lx2 && ly1 === ly2) {
                    outputEl.textContent = 'Error: The two points are identical.';
                    return;
                }

                const dx = lx2 - lx1;
                const dy = ly2 - ly1;

                origLineStr = `Through (${formatNum(lx1)}, ${formatNum(ly1)}) and (${formatNum(lx2)}, ${formatNum(ly2)})`;

                if (dx === 0) {
                    isVertical = true;
                    verticalX = lx1;
                    m = 0; // placeholder
                    break;
                }
                m = dy / dx;
                break;
            }
        }

        outputEl.textContent = buildParallelLineResult(m, isVertical, verticalX, px, py, origLineStr);
    }

    function clear() {
        origSlopeEl.value = '';
        origInterceptEl.value = '';
        stdAEl.value = '';
        stdBEl.value = '';
        stdCEl.value = '';
        lx1El.value = '';
        ly1El.value = '';
        lx2El.value = '';
        ly2El.value = '';
        pxEl.value = '';
        pyEl.value = '';
        outputEl.textContent = '-';
        origSlopeEl.focus();
    }

    lineInputModeEl.addEventListener('change', updateMode);
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    [origSlopeEl, origInterceptEl, stdAEl, stdBEl, stdCEl, lx1El, ly1El, lx2El, ly2El, pxEl, pyEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
