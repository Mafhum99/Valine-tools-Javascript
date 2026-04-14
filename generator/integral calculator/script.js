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
 * Integral Calculator
 * Definite integrals via Simpson's Rule; indefinite integrals via symbolic rules
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Integral Calculator', icon: '∫' });

    const fxEl = $('#fx');
    const modeEl = $('#mode');
    const boundAEl = $('#bound-a');
    const boundBEl = $('#bound-b');
    const nEl = $('#n-intervals');
    const definiteSection = $('#definite-section');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    // Toggle definite/indefinite sections
    function updateMode() {
        if (modeEl.value === 'definite') {
            definiteSection.style.display = 'block';
        } else {
            definiteSection.style.display = 'none';
        }
    }

    modeEl.addEventListener('change', updateMode);

    // Safe function parser: converts user input like "x^2 + 3*x" to a safe evaluable function
    function parseFunction(expr) {
        // Sanitize: only allow safe characters and math functions
        const sanitized = expr
            .replace(/\s+/g, '')
            .replace(/\^/g, '**')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/asin\(/g, 'Math.asin(')
            .replace(/acos\(/g, 'Math.acos(')
            .replace(/atan\(/g, 'Math.atan(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/exp\(/g, 'Math.exp(')
            .replace(/pi/g, `(${Math.PI})`)
            .replace(/(?<![a-zA-Z])e(?![a-zA-Z(])/g, `(${Math.E})`)
            .replace(/floor\(/g, 'Math.floor(')
            .replace(/ceil\(/g, 'Math.ceil(')
            .replace(/round\(/g, 'Math.round(')
            .replace(/pow\(/g, 'Math.pow(');

        // Check for dangerous patterns
        if (/[;{}[\]`$&|]/.test(sanitized)) {
            throw new Error('Expression contains disallowed characters');
        }
        if (/window|document|eval|fetch|alert|import|require|process|global/.test(sanitized)) {
            throw new Error('Expression contains disallowed keywords');
        }

        return function(x) {
            // Build a function using only Math and the variable x
            const fn = new Function('x', `return (${sanitized});`);
            return fn(x);
        };
    }

    // Simpson's Rule for definite integration
    // integral ≈ (h/3) * [f(a) + 4*f(a+h) + 2*f(a+2h) + 4*f(a+3h) + ... + f(b)]
    function simpsonsRule(f, a, b, n) {
        // n must be even
        if (n % 2 !== 0) n += 1;

        const h = (b - a) / n;
        let sum = f(a) + f(b);

        for (let i = 1; i < n; i++) {
            const x = a + i * h;
            const coeff = (i % 2 === 0) ? 2 : 4;
            sum += coeff * f(x);
        }

        return (h / 3) * sum;
    }

    // Symbolic indefinite integration rules for common functions
    function symbolicIntegrate(expr) {
        const cleaned = expr.replace(/\s+/g, '');
        const lower = cleaned.toLowerCase();

        // Direct pattern matching for common forms
        const rules = [
            // Power rule: x^n => x^(n+1)/(n+1)
            { pattern: /^x\^(-?\d+(?:\.\d+)?)$/, apply: (m) => {
                const n = parseFloat(m[1]);
                if (n === -1) return 'ln|x| + C';
                const np1 = n + 1;
                return `(x^${np1})/${np1} + C`;
            }},
            // Simple x => x^2/2
            { pattern: /^x$/, apply: () => '(x^2)/2 + C' },
            // Constant: k => k*x
            { pattern: /^(-?\d+(?:\.\d+)?)$/, apply: (m) => `${m[1]}*x + C` },
            // k*x => k*x^2/2
            { pattern: /^(-?\d+(?:\.\d+)?)\*x$/, apply: (m) => {
                const k = parseFloat(m[1]);
                return `${formatNumber(k / 2, 4)}*x^2 + C`;
            }},
            // sin(x) => -cos(x)
            { pattern: /^sin\(x\)$/, apply: () => '-cos(x) + C' },
            // cos(x) => sin(x)
            { pattern: /^cos\(x\)$/, apply: () => 'sin(x) + C' },
            // tan(x) => -ln|cos(x)|
            { pattern: /^tan\(x\)$/, apply: () => '-ln|cos(x)| + C' },
            // e^x => e^x
            { pattern: /^e\^x$/, apply: () => 'e^x + C' },
            // exp(x) => e^x
            { pattern: /^exp\(x\)$/, apply: () => 'e^x + C' },
            // 1/x or x^(-1) => ln|x|
            { pattern: /^(?:1\/x|x\^-1)$/, apply: () => 'ln|x| + C' },
            // sqrt(x) => (2/3)*x^(3/2)
            { pattern: /^sqrt\(x\)$/, apply: () => '(2/3)*x^(3/2) + C' },
            // ln(x) => x*ln(x) - x
            { pattern: /^ln\(x\)$/, apply: () => 'x*ln(x) - x + C' },
            // log(x) => (x*ln(x) - x)/ln(10)
            { pattern: /^log\(x\)$/, apply: () => '(x*ln(x) - x)/ln(10) + C' },
            // sec^2(x) => tan(x)
            { pattern: /^sec\^2\(x\)$/, apply: () => 'tan(x) + C' },
            // csc^2(x) => -cot(x)
            { pattern: /^csc\^2\(x\)$/, apply: () => '-cot(x) + C' },
            // sec(x)*tan(x) => sec(x)
            { pattern: /^sec\(x\)\*tan\(x\)$/, apply: () => 'sec(x) + C' },
            // csc(x)*cot(x) => -csc(x)
            { pattern: /^csc\(x\)\*cot\(x\)$/, apply: () => '-csc(x) + C' },
            // 1/(1+x^2) => atan(x)
            { pattern: /^1\/\(1\+x\^2\)$/, apply: () => 'atan(x) + C' },
            // 1/sqrt(1-x^2) => asin(x)
            { pattern: /^1\/sqrt\(1-x\^2\)$/, apply: () => 'asin(x) + C' },
            // a^x => a^x/ln(a)
            { pattern: /^(\d+(?:\.\d+)?)\^x$/, apply: (m) => {
                const a = parseFloat(m[1]);
                if (a <= 0) throw new Error('Base must be positive');
                return `${m[1]}^x/ln(${m[1]}) + C`;
            }},
        ];

        for (const rule of rules) {
            const match = lower.match(rule.pattern);
            if (match) {
                return rule.apply(match);
            }
        }

        // Try to handle simple polynomial terms like ax^n
        const polyMatch = lower.match(/^(-?\d+(?:\.\d+)?)\*x\^(-?\d+(?:\.\d+)?)$/);
        if (polyMatch) {
            const a = parseFloat(polyMatch[1]);
            const n = parseFloat(polyMatch[2]);
            if (n === -1) return `${formatNumber(a)}*ln|x| + C`;
            const np1 = n + 1;
            const coeff = a / np1;
            return `${formatNumber(coeff, 4)}*x^${np1} + C`;
        }

        // Try sum of terms (simple case: split by + or - keeping operator)
        const terms = cleaned.match(/[+-]?[^+-]+/g);
        if (terms && terms.length > 1) {
            const integratedTerms = [];
            for (const term of terms) {
                const trimmed = term.replace(/^\+/, '');
                try {
                    const result = symbolicIntegrate(trimmed);
                    if (result) {
                        integratedTerms.push(result.replace(/\s*\+\s*C\s*$/, ''));
                    } else {
                        return null;
                    }
                } catch {
                    return null;
                }
            }
            if (integratedTerms.length > 0) {
                return integratedTerms.join(' + ') + ' + C';
            }
        }

        return null; // No rule matched
    }

    function calculate() {
        const expr = fxEl.value.trim();
        if (!expr) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Please enter a function f(x)</p>';
            return;
        }

        if (modeEl.value === 'definite') {
            // Definite integral
            const aStr = boundAEl.value.trim();
            const bStr = boundBEl.value.trim();
            const nStr = nEl.value.trim();

            if (!aStr || !bStr) {
                outputEl.innerHTML = '<p style="color:#ef4444;">Both bounds a and b are required</p>';
                return;
            }

            const a = parseFloat(aStr);
            const b = parseFloat(bStr);
            const n = nStr ? parseInt(nStr) : 100;

            if (isNaN(a) || isNaN(b)) {
                outputEl.innerHTML = '<p style="color:#ef4444;">Bounds must be valid numbers</p>';
                return;
            }
            if (isNaN(n) || n < 2) {
                outputEl.innerHTML = '<p style="color:#ef4444;">Number of intervals must be >= 2</p>';
                return;
            }
            if (a === b) {
                outputEl.innerHTML = '<p style="color:#ef4444;">Bounds must be different (a cannot equal b)</p>';
                return;
            }

            try {
                const f = parseFunction(expr);

                // Test evaluation at endpoints
                const fa = f(a);
                const fb = f(b);
                if (!isFinite(fa) || !isFinite(fb)) {
                    outputEl.innerHTML = '<p style="color:#ef4444;">Function is undefined at one or both bounds</p>';
                    return;
                }

                const result = simpsonsRule(f, a, b, n);

                if (!isFinite(result)) {
                    outputEl.innerHTML = '<p style="color:#ef4444;">Integral diverges or function is not integrable over this interval</p>';
                    return;
                }

                // Verify with a higher n for accuracy estimate
                const resultFine = simpsonsRule(f, a, b, n * 2);
                const error = Math.abs(resultFine - result);

                outputEl.innerHTML = `
                    <div style="text-align:center;margin-bottom:1rem;">
                        <div style="font-size:0.75rem;color:#6b7280;font-family:monospace;">∫[${formatNumber(a, 4)}, ${formatNumber(b, 4)}] ${expr} dx</div>
                        <div style="font-size:2rem;font-weight:700;color:#22c55e;margin-top:0.5rem;">${formatNumber(result, 8)}</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;text-align:center;">
                        <div style="padding:0.75rem;background:#f3f4f6;border-radius:0.375rem;">
                            <div style="font-size:0.625rem;text-transform:uppercase;color:#6b7280;font-weight:600;">Intervals</div>
                            <div style="font-weight:600;font-size:1.125rem;margin-top:0.25rem;">${n}</div>
                        </div>
                        <div style="padding:0.75rem;background:#f3f4f6;border-radius:0.375rem;">
                            <div style="font-size:0.625rem;text-transform:uppercase;color:#6b7280;font-weight:600;">Method</div>
                            <div style="font-weight:600;font-size:0.875rem;margin-top:0.25rem;">Simpson's Rule</div>
                        </div>
                        <div style="padding:0.75rem;background:#f3f4f6;border-radius:0.375rem;">
                            <div style="font-size:0.625rem;text-transform:uppercase;color:#6b7280;font-weight:600;">Est. Error</div>
                            <div style="font-weight:600;font-size:0.875rem;margin-top:0.25rem;color:${error < 1e-6 ? '#22c55e' : '#f59e0b'};">${error < 1e-10 ? '< 1e-10' : formatNumber(error, 10)}</div>
                        </div>
                    </div>
                `;
            } catch (error) {
                outputEl.innerHTML = `<p style="color:#ef4444;">Error parsing function: ${error.message}</p>`;
            }
        } else {
            // Indefinite integral
            try {
                const result = symbolicIntegrate(expr);

                if (result) {
                    outputEl.innerHTML = `
                        <div style="text-align:center;">
                            <div style="font-size:0.75rem;color:#6b7280;font-family:monospace;">∫ ${expr} dx</div>
                            <div style="font-size:1.5rem;font-weight:700;color:#3b82f6;margin-top:0.75rem;font-family:monospace;word-break:break-all;">${result}</div>
                            <div style="font-size:0.75rem;color:#9ca3af;margin-top:0.5rem;">+ C is the constant of integration</div>
                        </div>
                    `;
                } else {
                    outputEl.innerHTML = `
                        <div style="text-align:center;">
                            <div style="font-size:0.75rem;color:#6b7280;font-family:monospace;">∫ ${expr} dx</div>
                            <p style="color:#f59e0b;margin-top:0.75rem;">No symbolic rule found for this function. Try definite mode for numerical integration.</p>
                            <div style="margin-top:0.75rem;padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;font-size:0.75rem;text-align:left;">
                                <div style="font-weight:600;margin-bottom:0.25rem;">Supported forms:</div>
                                x^n, sin(x), cos(x), tan(x), e^x, sqrt(x), ln(x), 1/x, sec^2(x), csc^2(x), sec(x)*tan(x), csc(x)*cot(x), 1/(1+x^2), 1/sqrt(1-x^2), a^x
                            </div>
                        </div>
                    `;
                }
            } catch (error) {
                outputEl.innerHTML = `<p style="color:#ef4444;">Error: ${error.message}</p>`;
            }
        }
    }

    function clear() {
        fxEl.value = '';
        modeEl.value = 'definite';
        boundAEl.value = '';
        boundBEl.value = '';
        nEl.value = '';
        definiteSection.style.display = 'block';
        outputEl.innerHTML = '<p style="color:#9ca3af;">Enter f(x) and choose a mode</p>';
        fxEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = `Integral Calculator\nf(x) = ${fxEl.value}\nMode: ${modeEl.value}\n${outputEl.textContent}`;
            copyToClipboard(text);
        });
    }

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
