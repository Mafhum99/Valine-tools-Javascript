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
 * Euler's Method Calculator
 * Solve first-order ODEs numerically: y(n+1) = y(n) + h * f(t(n), y(n))
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: "Euler's Method Calculator", icon: '📊' });

    const odeFuncEl = $('#ode-func');
    const initCondEl = $('#init-cond');
    const startTimeEl = $('#start-time');
    const endTimeEl = $('#end-time');
    const stepSizeEl = $('#step-size');
    const outputEl = $('#output');
    const tableContainerEl = $('#table-container');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    /**
     * Parse a string representation of f(t, y) into a callable function.
     * Supports basic math operations and common functions (sin, cos, exp, log, sqrt, etc.)
     */
    function parseFunction(funcStr) {
        try {
            const sanitized = funcStr
                .replace(/sin/gi, 'Math.sin')
                .replace(/cos/gi, 'Math.cos')
                .replace(/tan/gi, 'Math.tan')
                .replace(/exp/gi, 'Math.exp')
                .replace(/log/gi, 'Math.log')
                .replace(/sqrt/gi, 'Math.sqrt')
                .replace(/abs/gi, 'Math.abs')
                .replace(/pi/gi, 'Math.PI')
                .replace(/e(?![a-zA-Z])/gi, 'Math.E')
                .replace(/\^/g, '**');

            // Test the function with sample values
            const testFn = new Function('t', 'y', `return ${sanitized};`);
            testFn(0, 0); // Quick validation

            return new Function('t', 'y', `return ${sanitized};`);
        } catch (e) {
            return null;
        }
    }

    /**
     * Apply Euler's method: y(n+1) = y(n) + h * f(t(n), y(n))
     */
    function eulerMethod(f, t0, y0, h, steps) {
        const results = [{ t: t0, y: y0, step: 0 }];
        let t = t0, y = y0;
        for (let i = 1; i <= steps; i++) {
            const slope = f(t, y);
            y = y + h * slope;
            t = t0 + i * h;
            results.push({ t, y, step: i, slope });
        }
        return results;
    }

    /**
     * Validate all inputs before calculation
     */
    function validateInputs(funcStr, y0, t0, t1, h) {
        if (!funcStr) {
            return 'Please enter an ODE function f(t, y)';
        }
        if (isNaN(y0)) {
            return 'Please enter a valid initial condition y₀';
        }
        if (isNaN(t0) || isNaN(t1)) {
            return 'Please enter valid time bounds';
        }
        if (t0 >= t1) {
            return 'Error: Start time (t₀) must be less than end time (t₁)';
        }
        if (isNaN(h) || h <= 0) {
            return 'Error: Step size (h) must be a positive number';
        }

        // Check if (t1 - t0) is divisible by h (with floating point tolerance)
        const range = t1 - t0;
        const steps = range / h;
        const tolerance = 1e-9;
        if (Math.abs(steps - Math.round(steps)) > tolerance) {
            const roundedSteps = Math.round(steps);
            const suggestedH = range / roundedSteps;
            return `Warning: (t₁ - t₀) is not evenly divisible by h. Steps: ${steps.toFixed(4)}. Use h = ${suggestedH.toPrecision(6)} for exactly ${roundedSteps} steps.`;
        }

        const f = parseFunction(funcStr);
        if (!f) {
            return 'Error: Invalid function syntax. Use format like: t + y, -2*y, t*y, sin(t) + y';
        }

        return null; // No errors
    }

    /**
     * Render results as an HTML table
     */
    function renderTable(results) {
        const table = createElement('table', { class: 'results-table' });
        const thead = createElement('thead');
        const headerRow = createElement('tr');

        ['Step', 't', 'f(t, y)', 'y'].forEach(text => {
            headerRow.appendChild(createElement('th', { textContent: text }));
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = createElement('tbody');
        results.forEach((row) => {
            const tr = createElement('tr');
            tr.appendChild(createElement('td', { textContent: row.step.toString() }));
            tr.appendChild(createElement('td', { textContent: row.t.toFixed(6) }));
            tr.appendChild(createElement('td', { textContent: row.slope !== undefined ? row.slope.toFixed(6) : '-' }));
            tr.appendChild(createElement('td', { textContent: row.y.toFixed(6) }));
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        return table;
    }

    /**
     * Format results as plain text for copy/display
     */
    function formatResultsText(funcStr, t0, y0, h, results) {
        let output = `Euler's Method Results\n`;
        output += `ODE: dy/dt = ${funcStr}\n`;
        output += `Initial: y(${t0}) = ${y0}\n`;
        output += `Step size (h): ${h}\n\n`;
        output += 'Step\tt\t\tf(t,y)\t\ty\n';
        output += '─'.repeat(55) + '\n';
        results.forEach((row) => {
            const slopeStr = row.slope !== undefined ? row.slope.toFixed(6) : '-';
            output += `${row.step}\t${row.t.toFixed(6)}\t${slopeStr}\t${row.y.toFixed(6)}\n`;
        });
        return output;
    }

    function calculate() {
        const funcStr = odeFuncEl.value.trim();
        const y0 = parseFloat(initCondEl.value);
        const t0 = parseFloat(startTimeEl.value);
        const t1 = parseFloat(endTimeEl.value);
        const h = parseFloat(stepSizeEl.value);

        // Validate inputs
        const error = validateInputs(funcStr, y0, t0, t1, h);
        if (error) {
            outputEl.textContent = error;
            tableContainerEl.innerHTML = '';
            return;
        }

        const f = parseFunction(funcStr);
        if (!f) {
            outputEl.textContent = 'Error: Unable to parse the function';
            tableContainerEl.innerHTML = '';
            return;
        }

        const range = t1 - t0;
        const steps = Math.round(range / h);

        let results;
        try {
            results = eulerMethod(f, t0, y0, h, steps);
        } catch (e) {
            outputEl.textContent = 'Error during calculation: ' + e.message;
            tableContainerEl.innerHTML = '';
            return;
        }

        // Render HTML table
        tableContainerEl.innerHTML = '';
        tableContainerEl.appendChild(renderTable(results));

        // Set text output for copy
        outputEl.textContent = formatResultsText(funcStr, t0, y0, h, results);
    }

    function clearAll() {
        odeFuncEl.value = '';
        initCondEl.value = '';
        startTimeEl.value = '0';
        endTimeEl.value = '1';
        stepSizeEl.value = '0.1';
        outputEl.textContent = '-';
        tableContainerEl.innerHTML = '';
        odeFuncEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = outputEl.textContent;
            if (text && text !== '-') {
                copyToClipboard(text);
            } else {
                showToast('Nothing to copy');
            }
        });
    }

    // Allow Enter key to trigger calculation
    $$('.form-input, .form-select').forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
