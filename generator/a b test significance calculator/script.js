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
// A/B Test Significance Calculator
// Calculates conversion rates, lift, and statistical significance using z-test
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'A/B Test Significance Calculator', icon: '\u{1F9EA}' });

    const visitorsAEl = $('#visitors_a');
    const conversionsAEl = $('#conversions_a');
    const visitorsBEl = $('#visitors_b');
    const conversionsBEl = $('#conversions_b');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Normal CDF approximation (Abramowitz and Stegun)
    function normalCdf(x) {
        const a1 = 0.254829592;
        const a2 = -0.284496736;
        const a3 = 1.421413741;
        const a4 = -1.453152027;
        const a5 = 1.061405429;
        const p = 0.3275911;
        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2);
        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
        return 0.5 * (1.0 + sign * y);
    }

    function calculate() {
        try {
            const visA = parseFloat(visitorsAEl.value);
            const convA = parseFloat(conversionsAEl.value);
            const visB = parseFloat(visitorsBEl.value);
            const convB = parseFloat(conversionsBEl.value);

            if (isNaN(visA) || isNaN(convA) || isNaN(visB) || isNaN(convB)) {
                outputEl.textContent = 'Please enter valid numbers';
                return;
            }

            if (visA <= 0 || visB <= 0) {
                outputEl.textContent = 'Visitor counts must be greater than 0';
                return;
            }

            if (convA < 0 || convB < 0) {
                outputEl.textContent = 'Conversions cannot be negative';
                return;
            }

            if (convA > visA || convB > visB) {
                outputEl.textContent = 'Conversions cannot exceed visitors';
                return;
            }

            // Conversion rates
            const rateA = (convA / visA) * 100;
            const rateB = (convB / visB) * 100;

            // Lift
            let lift = 0;
            if (rateA > 0) {
                lift = ((rateB - rateA) / rateA) * 100;
            }

            // Z-test for two proportions
            const pA = convA / visA;
            const pB = convB / visB;
            const pPool = (convA + convB) / (visA + visB);

            let z = 0;
            let pValue = 1;

            if (pPool > 0 && pPool < 1) {
                const se = Math.sqrt(pPool * (1 - pPool) * (1 / visA + 1 / visB));
                if (se > 0) {
                    z = (pB - pA) / se;
                    pValue = 2 * (1 - normalCdf(Math.abs(z)));
                }
            }

            const isSignificant = pValue < 0.05;
            const isHighlySignificant = pValue < 0.01;

            let significanceText = '';
            let recommendation = '';

            if (isHighlySignificant) {
                significanceText = '✅ Highly Statistically Significant (p < 0.01)';
                recommendation = rateB > rateA
                    ? 'Variant B performs significantly better. Strong evidence to implement.'
                    : 'Variant A performs significantly better. Stick with the original.';
            } else if (isSignificant) {
                significanceText = '✅ Statistically Significant (p < 0.05)';
                recommendation = rateB > rateA
                    ? 'Variant B performs significantly better. Consider implementing.'
                    : 'Variant A performs significantly better. Do not switch to B.';
            } else {
                significanceText = '❌ Not Statistically Significant (p > 0.05)';
                recommendation = 'Results are not conclusive. Run the test longer or increase sample size.';
            }

            outputEl.innerHTML = `
                <div style="text-align:left;">
                    <div style="margin-bottom:0.75rem;">
                        <div style="font-size:0.75rem;color:#6b7280;font-weight:600;text-transform:uppercase;margin-bottom:0.5rem;">Conversion Rates</div>
                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;">
                            <div style="padding:0.5rem;background:#f0f9ff;border-radius:0.375rem;text-align:center;">
                                <div style="font-size:0.625rem;color:#6b7280;text-transform:uppercase;">Variant A</div>
                                <div style="font-size:1.25rem;font-weight:700;color:#3b82f6;">${formatNumber(rateA, 2)}%</div>
                                <div style="font-size:0.625rem;color:#6b7280;">${convA} / ${visA}</div>
                            </div>
                            <div style="padding:0.5rem;background:#fef3c7;border-radius:0.375rem;text-align:center;">
                                <div style="font-size:0.625rem;color:#6b7280;text-transform:uppercase;">Variant B</div>
                                <div style="font-size:1.25rem;font-weight:700;color:#f59e0b;">${formatNumber(rateB, 2)}%</div>
                                <div style="font-size:0.625rem;color:#6b7280;">${convB} / ${visB}</div>
                            </div>
                        </div>
                    </div>

                    <div style="padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;margin-bottom:0.5rem;text-align:center;">
                        <div style="font-size:0.625rem;color:#6b7280;font-weight:600;">Lift</div>
                        <div style="font-size:1.125rem;font-weight:700;color:${lift >= 0 ? '#22c55e' : '#ef4444'};">
                            ${lift >= 0 ? '+' : ''}${formatNumber(lift, 2)}%
                        </div>
                    </div>

                    <div style="padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.625rem;color:#6b7280;font-weight:600;">Statistical Test (Z-Test)</div>
                        <div style="display:flex;justify-content:space-between;margin-top:0.25rem;">
                            <span style="font-size:0.75rem;">Z-Score:</span>
                            <span style="font-weight:600;">${formatNumber(z, 4)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-top:0.25rem;">
                            <span style="font-size:0.75rem;">P-Value:</span>
                            <span style="font-weight:600;">${formatNumber(pValue, 4)}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-top:0.25rem;">
                            <span style="font-size:0.75rem;">Significance (95%):</span>
                            <span style="font-weight:600;">${isSignificant ? '✅ Yes' : '❌ No'}</span>
                        </div>
                    </div>

                    <div style="padding:0.75rem;background:${isSignificant ? '#dcfce7' : '#fee2e2'};border-radius:0.375rem;text-align:center;">
                        <div style="font-weight:700;font-size:0.875rem;color:${isSignificant ? '#16a34a' : '#dc2626'};">${significanceText}</div>
                        <div style="font-size:0.75rem;color:#6b7280;margin-top:0.25rem;">${recommendation}</div>
                    </div>
                </div>
            `;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        visitorsAEl.value = '';
        conversionsAEl.value = '';
        visitorsBEl.value = '';
        conversionsBEl.value = '';
        outputEl.textContent = '-';
        visitorsAEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    [visitorsAEl, conversionsAEl, visitorsBEl, conversionsBEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
