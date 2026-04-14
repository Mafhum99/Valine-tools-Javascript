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
 * Gamma Function Calculator
 * Calculate the Gamma function Γ(n) using the Lanczos approximation.
 * Definition: Γ(n) = ∫(0 to ∞) t^(n-1) × e^(-t) dt
 * Property: For positive integers, Γ(n) = (n-1)!
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Gamma Function Calculator', icon: 'Γ' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Lanczos approximation coefficients (g=7, 15 terms)
    // These coefficients provide high precision for the gamma function
    const LANCZOS_G = 7;
    const LANCZOS_COEFF = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7
    ];

    /**
     * Compute the Gamma function using the Lanczos approximation.
     * Γ(z) = sqrt(2π) × (z + g - 0.5)^(z - 0.5) × e^(-(z+g-0.5)) × A_g(z)
     * where A_g(z) is a sum of coefficients.
     *
     * @param {number} z - The input value (must not be 0 or a negative integer)
     * @returns {number} The gamma function value Γ(z)
     */
    function gamma(z) {
        // Handle reflection for negative values
        // Γ(z) × Γ(1-z) = π / sin(πz)
        if (z < 0.5) {
            return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
        }

        // Shift z for Lanczos
        z -= 1;

        // Compute the Lanczos sum A_g(z)
        let x = LANCZOS_COEFF[0];
        for (let i = 1; i < LANCZOS_COEFF.length; i++) {
            x += LANCZOS_COEFF[i] / (z + i);
        }

        // Compute t = z + g + 0.5
        const t = z + LANCZOS_G + 0.5;

        // Γ(z+1) = sqrt(2π) × t^(z+0.5) × e^(-t) × A_g(z)
        return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
    }

    /**
     * Format large numbers with scientific notation when appropriate.
     */
    function formatGammaValue(value) {
        if (!isFinite(value)) {
            return 'Infinity';
        }

        const absValue = Math.abs(value);

        // Use scientific notation for very large or very small numbers
        if (absValue >= 1e15 || (absValue < 1e-10 && absValue > 0)) {
            return value.toExponential(10);
        }

        // Determine decimal places based on magnitude
        if (absValue >= 1e6) {
            return formatNumber(value, 4);
        } else if (absValue >= 1000) {
            return formatNumber(value, 6);
        } else if (absValue >= 1) {
            return formatNumber(value, 10);
        } else {
            return formatNumber(value, 12);
        }
    }

    /**
     * Check if a number is effectively an integer (within floating-point tolerance).
     */
    function isInteger(n) {
        return Math.abs(n - Math.round(n)) < 1e-10;
    }

    /**
     * Compute factorial iteratively for positive integers.
     */
    function factorial(n) {
        if (n < 0) return NaN;
        if (n === 0 || n === 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    /**
     * Main calculation function.
     */
    function calculate() {
        const inputVal = inputEl.value.trim();

        if (!inputVal) {
            outputEl.textContent = 'Please enter a value';
            return;
        }

        const n = parseFloat(inputVal);

        if (isNaN(n)) {
            outputEl.textContent = 'Error: Please enter a valid number';
            return;
        }

        // Check range bounds
        if (n <= -100 || n >= 200) {
            outputEl.textContent = 'Error: Input must be in range -100 < n < 200';
            return;
        }

        // Check for poles (non-positive integers: 0, -1, -2, ...)
        if (isInteger(n) && n <= 0) {
            const intN = Math.round(n);
            outputEl.innerHTML = `<strong>Γ(${intN})</strong> is undefined (pole)\n\nThe Gamma function has poles at all non-positive integers: 0, -1, -2, -3, ...\n\nAs n approaches ${intN}, |Γ(n)| → ∞`;
            return;
        }

        try {
            const result = gamma(n);
            const roundedN = isInteger(n) ? Math.round(n) : n;

            // Build output
            let output = '';

            // Main result
            output += `Γ(${roundedN}) = ${formatGammaValue(result)}\n\n`;

            // Definition reference
            output += `Definition: Γ(n) = ∫(0 to ∞) t^(n-1) × e^(-t) dt\n`;
            output += `Γ(${roundedN}) = ∫(0 to ∞) t^${roundedN - 1} × e^(-t) dt\n\n`;

            // Factorial equivalence for positive integers
            if (isInteger(n) && n > 0) {
                const intN = Math.round(n);
                const factVal = intN - 1;
                const factResult = factorial(factVal);

                output += `Factorial Equivalence:\n`;
                output += `Γ(${intN}) = (${intN - 1})! = ${formatNumber(factResult)}\n\n`;
                output += `Since ${intN} is a positive integer, Γ(${intN}) = (${intN} - 1)!`;

                // Add the actual factorial expansion for small integers
                if (factVal <= 20 && factVal > 0) {
                    const factors = [];
                    for (let i = factVal; i >= 1; i--) {
                        factors.push(i);
                    }
                    output += ` = ${factors.join(' × ')}`;
                }
            } else if (n > 0) {
                // For non-integer positive values, show relation to nearest integers
                const floorN = Math.floor(n);
                const ceilN = Math.ceil(n);
                if (floorN !== ceilN) {
                    output += `Note: Γ(${n}) is between Γ(${floorN}) = ${formatGammaValue(gamma(floorN))} and Γ(${ceilN}) = ${formatGammaValue(gamma(ceilN))}`;
                }
            } else {
                // For negative non-integer values
                output += `Note: The Gamma function is defined for negative non-integer values via reflection.`;
            }

            outputEl.textContent = output;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    /**
     * Clear function.
     */
    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    // Enter key support
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculate();
        }
    });
});
