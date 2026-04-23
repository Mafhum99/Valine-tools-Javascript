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
 * Solve ODEs using Euler's method
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: "Euler's Method Calculator", icon: '📈' });
    
    // Get elements
    const odeFuncEl = $('#ode-func');
    const initCondEl = $('#init-cond');
    const startTimeEl = $('#start-time');
    const endTimeEl = $('#end-time');
    const stepSizeEl = $('#step-size');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function parseFunction(funcStr) {
        try {
            // Support common math functions in the input
            let jsExpr = funcStr.replace(/\b(sin|cos|tan|exp|log|sqrt|abs|pow|PI|E)\b/gi, (match) => {
                return `Math.${match.charAt(0).toUpperCase()}${match.slice(1).toLowerCase()}`;
            })
            .replace(/\bpi\b/gi, 'Math.PI')
            .replace(/\be\b/gi, 'Math.E')
            .replace(/\^/g, '**')
            .replace(/(\d)([ty])/gi, '$1*$2')
            .replace(/([ty])(\d)/gi, '$1*$2')
            .replace(/([)])([ty])/gi, '$1*$2')
            .replace(/([ty])([(])/gi, '$1*$2');
            
            return new Function('t', 'y', `return ${jsExpr};`);
        } catch (e) {
            return null;
        }
    }

    function eulerMethod(f, t0, y0, h, steps) {
        const results = [[t0, y0]];
        let t = t0, y = y0;
        for (let i = 1; i <= steps; i++) {
            y = y + h * f(t, y);
            t = t0 + i * h;
            results.push([t, y]);
        }
        return results;
    }

    // Main calculation function
    function calculate() {
        const funcStr = odeFuncEl.value.trim();
        const y0 = parseFloat(initCondEl.value);
        const t0 = parseFloat(startTimeEl.value);
        const t1 = parseFloat(endTimeEl.value);
        const h = parseFloat(stepSizeEl.value);

        if (!funcStr) {
            outputEl.textContent = 'Please enter an ODE function';
            return;
        }
        if (isNaN(y0)) {
            outputEl.textContent = 'Please enter a valid initial condition';
            return;
        }
        if (isNaN(t0) || isNaN(t1)) {
            outputEl.textContent = 'Please enter valid time bounds';
            return;
        }
        if (t0 >= t1) {
            outputEl.textContent = 'Error: Start time must be less than end time';
            return;
        }
        if (isNaN(h) || h <= 0) {
            outputEl.textContent = 'Error: Step size must be positive';
            return;
        }

        const f = parseFunction(funcStr);
        if (!f) {
            outputEl.textContent = 'Error: Invalid function syntax. Use format like: -2*t*y or t+y';
            return;
        }

        const steps = Math.floor((t1 - t0) / h);
        if (steps > 1000) {
            outputEl.textContent = 'Error: Too many steps (> 1000). Please increase step size.';
            return;
        }

        let results;
        try {
            results = eulerMethod(f, t0, y0, h, steps);
        } catch (e) {
            outputEl.textContent = 'Error during calculation: ' + e.message;
            return;
        }

        let output = `Method: Euler's Method\nODE: dy/dt = ${funcStr}\nInitial: y(${t0}) = ${y0}\n\n`;
        output += 't\t\ty(t)\n';
        output += '─'.repeat(40) + '\n';
        results.forEach(([t, y]) => {
            output += `${t.toFixed(4)}\t${y.toFixed(6)}\n`;
        });

        outputEl.textContent = output;
        outputEl.dataset.rawResult = output;
    }
    
    // Clear function
    function clear() {
        odeFuncEl.value = '';
        initCondEl.value = '';
        startTimeEl.value = '0';
        endTimeEl.value = '1';
        stepSizeEl.value = '0.1';
        outputEl.textContent = '-';
        delete outputEl.dataset.rawResult;
        odeFuncEl.focus();
    }
    
    // Event listeners
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = outputEl.dataset.rawResult || outputEl.textContent;
            if (textToCopy === '-') return;
            copyToClipboard(textToCopy);
        });
    }
    
    // Enter key support
    [odeFuncEl, initCondEl, startTimeEl, endTimeEl, stepSizeEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
