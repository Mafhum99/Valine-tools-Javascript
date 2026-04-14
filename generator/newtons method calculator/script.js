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
function mapRange(value, inMin, inMax, outMin, outMax) { return (value - inMin) * (outMax - inMin) / (inMax - inMin) + outMin; }

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
 * Newton's Method Calculator
 * Input: f(x) string, f'(x) string (or auto-numerical derivative)
 * Initial guess x₀, tolerance (default 1e-6), max iterations (default 100)
 * x(n+1) = x(n) − f(x(n))/f'(x(n))
 * Output: root found, iteration table (n, xₙ, f(xₙ), f'(xₙ), error)
 * Detect: convergent, divergent, f'(x)≈0 failure
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: "Newton's Method Calculator", icon: '📐' });

    // ---- Expression parser and evaluator ----
    const EPSILON = 1e-12;

    function preprocessExpression(expr) {
        let s = expr.trim();
        // Replace common math functions
        s = s.replace(/\bsin\b/g, 'Math.sin');
        s = s.replace(/\bcos\b/g, 'Math.cos');
        s = s.replace(/\btan\b/g, 'Math.tan');
        s = s.replace(/\basin\b/g, 'Math.asin');
        s = s.replace(/\bacos\b/g, 'Math.acos');
        s = s.replace(/\batan\b/g, 'Math.atan');
        s = s.replace(/\bsqrt\b/g, 'Math.sqrt');
        s = s.replace(/\bcbrt\b/g, 'Math.cbrt');
        s = s.replace(/\babs\b/g, 'Math.abs');
        s = s.replace(/\blog\b/g, 'Math.log');   // natural log
        s = s.replace(/\blog10\b/g, 'Math.log10');
        s = s.replace(/\blog2\b/g, 'Math.log2');
        s = s.replace(/\bexp\b/g, 'Math.exp');
        s = s.replace(/\bpi\b/gi, 'Math.PI');
        s = s.replace(/\be\b/g, 'Math.E');
        s = s.replace(/\bpow\b/g, 'Math.pow');
        s = s.replace(/\bfloor\b/g, 'Math.floor');
        s = s.replace(/\bceil\b/g, 'Math.ceil');
        s = s.replace(/\bround\b/g, 'Math.round');
        s = s.replace(/\bsign\b/g, 'Math.sign');

        // Handle implicit multiplication: 2x -> 2*x, x( -> x*(, )x -> )*x, )( -> )*(
        s = s.replace(/(\d)([a-zA-Z(])/g, '$1*$2');
        s = s.replace(/(\))(\()/g, '$1*$2');
        s = s.replace(/(\))([a-zA-Z])/g, '$1*$2');
        s = s.replace(/([a-zA-Z])(\()/g, (match, p1, p2) => {
            // Don't break Math.xxx( patterns
            if (p1 === 'h') return match; // skip Math
            return p1 + '*' + p2;
        });

        // Replace ^ with **
        s = s.replace(/\^/g, '**');

        return s;
    }

    function createFunction(expr) {
        const processed = preprocessExpression(expr);
        try {
            return new Function('x', `return (${processed});`);
        } catch (e) {
            throw new Error(`Invalid expression: ${expr}\nError: ${e.message}`);
        }
    }

    function numericalDerivative(fn, x, h = 1e-8) {
        return (fn(x + h) - fn(x - h)) / (2 * h);
    }

    function safeEval(fn, x) {
        try {
            const result = fn(x);
            if (typeof result !== 'number' || !isFinite(result)) {
                return NaN;
            }
            return result;
        } catch {
            return NaN;
        }
    }

    // ---- Newton's Method ----
    function newtonsMethod(fx, fpx, x0, tol, maxIter, useNumericalDeriv) {
        const iterations = [];
        let x = x0;
        let status = 'max_iter'; // convergent, divergent, zero_deriv, max_iter

        for (let n = 0; n <= maxIter; n++) {
            const fxVal = safeEval(fx, x);
            let fpxVal;

            if (useNumericalDeriv) {
                fpxVal = numericalDerivative(fx, x);
            } else {
                fpxVal = safeEval(fpx, x);
            }

            const entry = {
                n: n,
                xn: x,
                fx: fxVal,
                fpx: fpxVal,
                error: null
            };

            // Check if f(x) is NaN
            if (isNaN(fxVal)) {
                entry.error = Infinity;
                iterations.push(entry);
                status = 'divergent';
                break;
            }

            // Check if f'(x) ≈ 0
            if (Math.abs(fpxVal) < EPSILON) {
                entry.error = Infinity;
                iterations.push(entry);
                status = 'zero_deriv';
                break;
            }

            const xNew = x - fxVal / fpxVal;
            const error = Math.abs(xNew - x);
            entry.error = error;
            iterations.push(entry);

            // Check convergence
            if (n > 0 && error < tol) {
                x = xNew;
                status = 'convergent';
                break;
            }

            // Check divergence: if x is growing too large
            if (Math.abs(x) > 1e15 || (n > 0 && error > 1e10)) {
                status = 'divergent';
                break;
            }

            x = xNew;
        }

        return {
            iterations: iterations,
            status: status,
            root: (status === 'convergent') ? x : null,
            finalValue: safeEval(fx, x)
        };
    }

    // ---- UI Logic ----
    const funcInput = $('#func-input');
    const derivInput = $('#deriv-input');
    const initialGuessInput = $('#initial-guess');
    const toleranceInput = $('#tolerance');
    const maxIterInput = $('#max-iterations');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');
    const tableContainer = $('#iteration-table-container');

    function fmtNum(v, decimals = 8) {
        if (v === null || v === undefined || isNaN(v)) return 'NaN';
        if (!isFinite(v)) return (v > 0 ? '∞' : '-∞');
        if (Number.isInteger(v) && Math.abs(v) < 1e15) return String(v);
        return parseFloat(v.toFixed(decimals)).toString();
    }

    function fmtSci(v, decimals = 6) {
        if (v === null || v === undefined || isNaN(v)) return 'NaN';
        if (!isFinite(v)) return (v > 0 ? '∞' : '-∞');
        if (Math.abs(v) < 1e-4 && v !== 0) return v.toExponential(decimals);
        if (Math.abs(v) >= 1e10) return v.toExponential(decimals);
        return parseFloat(v.toFixed(decimals)).toString();
    }

    function calculate() {
        const funcExpr = funcInput.value.trim();
        const derivExpr = derivInput.value.trim();
        const x0 = parseFloat(initialGuessInput.value);
        const tolStr = toleranceInput.value.trim();
        const maxIter = parseInt(maxIterInput.value);

        // Validation
        if (!funcExpr) {
            outputEl.innerHTML = '<span style="color:#ef4444;">Please enter f(x)</span>';
            if (tableContainer) tableContainer.innerHTML = '';
            return;
        }

        if (isNaN(x0)) {
            outputEl.innerHTML = '<span style="color:#ef4444;">Invalid initial guess (x₀)</span>';
            if (tableContainer) tableContainer.innerHTML = '';
            return;
        }

        let tol;
        try {
            tol = parseFloat(tolStr);
            if (isNaN(tol) || tol <= 0) throw new Error();
        } catch {
            outputEl.innerHTML = '<span style="color:#ef4444;">Invalid tolerance value</span>';
            if (tableContainer) tableContainer.innerHTML = '';
            return;
        }

        if (isNaN(maxIter) || maxIter < 1) {
            outputEl.innerHTML = '<span style="color:#ef4444;">Invalid max iterations</span>';
            if (tableContainer) tableContainer.innerHTML = '';
            return;
        }

        // Parse functions
        let fx, fpx, useNumericalDeriv = false;
        try {
            fx = createFunction(funcExpr);
            // Test evaluation
            const testVal = safeEval(fx, x0);
            if (isNaN(testVal) && !isFinite(testVal)) {
                outputEl.innerHTML = '<span style="color:#ef4444;">f(x₀) is undefined at the initial guess. Try a different x₀.</span>';
                if (tableContainer) tableContainer.innerHTML = '';
                return;
            }
        } catch (e) {
            outputEl.innerHTML = `<span style="color:#ef4444;">Error in f(x): ${e.message}</span>`;
            if (tableContainer) tableContainer.innerHTML = '';
            return;
        }

        if (derivExpr) {
            try {
                fpx = createFunction(derivExpr);
                useNumericalDeriv = false;
            } catch (e) {
                outputEl.innerHTML = `<span style="color:#ef4444;">Error in f'(x): ${e.message}. Using numerical derivative instead.</span>`;
                fpx = null;
                useNumericalDeriv = true;
            }
        } else {
            useNumericalDeriv = true;
        }

        // Run Newton's method
        const result = newtonsMethod(fx, fpx || fx, x0, tol, maxIter, useNumericalDeriv);

        // Display result
        outputEl.innerHTML = '';

        const statusBadge = createElement('span', { className: `status-badge status-${result.status.replace('_', '-')}` });
        const statusLabels = {
            convergent: 'Converged',
            divergent: 'Divergent',
            zero_deriv: "f'(x) ≈ 0 — Failed",
            max_iter: 'Max iterations reached'
        };
        statusBadge.textContent = statusLabels[result.status] || result.status;
        outputEl.appendChild(statusBadge);

        if (result.status === 'convergent') {
            outputEl.appendChild(createElement('br'));
            outputEl.appendChild(createElement('br'));
            outputEl.appendChild(createElement('div', {
                style: 'font-size:1.25rem;font-weight:700;color:#16a34a;',
                textContent: `Root ≈ ${fmtNum(result.root, 10)}`
            }));
            outputEl.appendChild(createElement('div', {
                style: 'margin-top:0.5rem;color:#6b7280;',
                textContent: `f(root) = ${fmtSci(result.finalValue)}`
            }));
            outputEl.appendChild(createElement('div', {
                style: 'color:#6b7280;',
                textContent: `Iterations: ${result.iterations.length}  |  Tolerance: ${tol}  |  f'(x) method: ${useNumericalDeriv ? 'Numerical' : 'Analytical'}`
            }));
        } else if (result.status === 'zero_deriv') {
            outputEl.appendChild(createElement('br'));
            outputEl.appendChild(createElement('br'));
            const lastIter = result.iterations[result.iterations.length - 1];
            outputEl.appendChild(createElement('div', {
                style: 'color:#dc2626;',
                textContent: `f'(x) ≈ 0 at x = ${fmtNum(lastIter.xn)}. Newton's method cannot proceed.`
            }));
            outputEl.appendChild(createElement('div', {
                style: 'color:#6b7280;margin-top:0.5rem;',
                textContent: 'Try a different initial guess or provide a symbolic derivative.'
            }));
        } else if (result.status === 'divergent') {
            outputEl.appendChild(createElement('br'));
            outputEl.appendChild(createElement('br'));
            outputEl.appendChild(createElement('div', {
                style: 'color:#dc2626;',
                textContent: 'The method appears to be diverging.'
            }));
            outputEl.appendChild(createElement('div', {
                style: 'color:#6b7280;margin-top:0.5rem;',
                textContent: 'Try a different initial guess closer to the expected root.'
            }));
        } else {
            outputEl.appendChild(createElement('br'));
            outputEl.appendChild(createElement('br'));
            const lastIter = result.iterations[result.iterations.length - 1];
            outputEl.appendChild(createElement('div', {
                style: 'color:#d97706;',
                textContent: `Did not converge within ${maxIter} iterations.`
            }));
            outputEl.appendChild(createElement('div', {
                style: 'color:#6b7280;margin-top:0.5rem;',
                textContent: `Last x = ${fmtNum(lastIter.xn)}, f(x) = ${fmtSci(lastIter.fx)}, error = ${fmtSci(lastIter.error)}`
            }));
        }

        // Build iteration table
        if (result.iterations.length > 0) {
            if (tableContainer) {
                tableContainer.innerHTML = '';
                const wrapper = createElement('div', { className: 'iteration-table-container' });

                const table = createElement('table', { className: 'iteration-table' });

                // Header
                const thead = createElement('thead');
                const headerRow = createElement('tr');
                ['n', 'xₙ', 'f(xₙ)', "f'(xₙ)", '|xₙ₊₁ − xₙ|'].forEach(h => {
                    headerRow.appendChild(createElement('th', { textContent: h }));
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);

                // Body
                const tbody = createElement('tbody');
                result.iterations.forEach((iter, idx) => {
                    const row = createElement('tr');
                    const isLast = idx === result.iterations.length - 1;
                    if (isLast && result.status === 'convergent') row.className = 'converged-row';
                    if (isLast && (result.status === 'divergent' || result.status === 'zero_deriv')) row.className = 'diverged-row';

                    row.appendChild(createElement('td', { textContent: String(iter.n) }));
                    row.appendChild(createElement('td', { textContent: fmtSci(iter.xn) }));
                    row.appendChild(createElement('td', { textContent: fmtSci(iter.fx) }));
                    row.appendChild(createElement('td', { textContent: fmtSci(iter.fpx) }));
                    row.appendChild(createElement('td', {
                        textContent: iter.error !== null ? fmtSci(iter.error) : '—',
                        style: iter.error !== null && iter.error < tol ? 'color:#16a34a;font-weight:700;' : ''
                    }));
                    tbody.appendChild(row);
                });
                table.appendChild(tbody);
                wrapper.appendChild(table);
                tableContainer.appendChild(wrapper);
            }
        }

        // Save preferences
        Storage.set('newton-func', funcExpr);
        Storage.set('newton-deriv', derivExpr);
        Storage.set('newton-x0', String(x0));
        Storage.set('newton-tol', tolStr);
        Storage.set('newton-maxiter', String(maxIter));
    }

    function clearAll() {
        funcInput.value = '';
        derivInput.value = '';
        initialGuessInput.value = '1';
        toleranceInput.value = '1e-6';
        maxIterInput.value = '100';
        outputEl.textContent = '-';
        if (tableContainer) tableContainer.innerHTML = '';
        funcInput.focus();
    }

    // Load saved preferences
    const savedFunc = Storage.get('newton-func', '');
    const savedDeriv = Storage.get('newton-deriv', '');
    const savedX0 = Storage.get('newton-x0', '1');
    const savedTol = Storage.get('newton-tol', '1e-6');
    const savedMaxIter = Storage.get('newton-maxiter', '100');
    if (savedFunc) funcInput.value = savedFunc;
    if (savedDeriv) derivInput.value = savedDeriv;
    initialGuessInput.value = savedX0;
    toleranceInput.value = savedTol;
    maxIterInput.value = savedMaxIter;

    // Events
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    copyBtn.addEventListener('click', () => {
        const text = outputEl.textContent;
        if (text && text !== '-') copyToClipboard(text);
    });

    // Enter key support
    [funcInput, derivInput, initialGuessInput, toleranceInput, maxIterInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
