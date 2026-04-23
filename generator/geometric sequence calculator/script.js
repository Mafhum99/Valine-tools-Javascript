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
 * Geometric Sequence Calculator
 * Calculate geometric sequences, nth term, finite sum, and infinite sum
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Geometric Sequence Calculator', icon: '📐' });

    const firstTermEl = $('#first-term');
    const commonRatioEl = $('#common-ratio');
    const numTermsEl = $('#num-terms');
    const specificTermEl = $('#specific-term');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function calculate() {
        const aVal = firstTermEl.value;
        const rVal = commonRatioEl.value;
        const nVal = numTermsEl.value;
        const kVal = specificTermEl.value;

        if (aVal === '' || rVal === '') {
            outputEl.textContent = 'First term (a) and common ratio (r) are required';
            return;
        }

        const a = Number(aVal);
        const r = Number(rVal);

        if (isNaN(a) || isNaN(r)) {
            outputEl.textContent = 'First term and common ratio must be valid numbers';
            return;
        }

        let n = null;
        if (nVal !== '') {
            n = Number(nVal);
            if (!Number.isInteger(n) || n < 1) {
                outputEl.textContent = 'Number of terms must be a positive integer';
                return;
            }
            if (n > 1000) {
                outputEl.textContent = 'Number of terms must be <= 1000';
                return;
            }
        }

        let k = null;
        if (kVal !== '') {
            k = Number(kVal);
            if (!Number.isInteger(k) || k < 1) {
                outputEl.textContent = 'Specific term must be a positive integer';
                return;
            }
        }

        try {
            let html = '<div style="text-align:left;">';

            // Generate sequence terms (up to n, or default 10 if n not provided)
            const termsToGenerate = n || 10;
            const sequence = [];
            for (let i = 1; i <= termsToGenerate; i++) {
                sequence.push(a * Math.pow(r, i - 1));
            }

            // Display sequence
            let sequenceStr;
            if (termsToGenerate <= 50) {
                sequenceStr = sequence.map(v => formatNumber(v, 4)).join(', ');
            } else {
                const shown = sequence.slice(0, 25).map(v => formatNumber(v, 4)).join(', ');
                const tail = sequence.slice(-25).map(v => formatNumber(v, 4)).join(', ');
                sequenceStr = `${shown}, ... (${termsToGenerate - 50} terms omitted) ..., ${tail}`;
            }

            html += `
                <div style="margin-bottom:0.75rem;">
                    <div style="font-size:0.75rem;color:#6b7280;font-weight:600;text-transform:uppercase;">Sequence (first ${termsToGenerate} terms)</div>
                    <div style="font-size:0.875rem;word-break:break-word;line-height:1.6;">${sequenceStr}</div>
                </div>
            `;

            // specific term (k-th term)
            let resultParts = [`Geometric Sequence Results:`];
            resultParts.push(`Sequence: ${sequence.slice(0, 10).join(', ')}...`);

            if (k !== null) {
                const kthTerm = a * Math.pow(r, k - 1);
                resultParts.push(`k-th Term (a${k}): ${formatNumber(kthTerm, 4)}`);
                html += `
                    <div style="padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.75rem;color:#6b7280;">k-th Term (a<sub>${k}</sub>)</div>
                        <div style="font-weight:600;font-size:1.125rem;">${formatNumber(kthTerm, 4)}</div>
                    </div>
                `;
            }

            // n-th term (last term if n is provided)
            if (n !== null) {
                const nthTerm = a * Math.pow(r, n - 1);
                resultParts.push(`n-th Term (a${n}): ${formatNumber(nthTerm, 4)}`);
                html += `
                    <div style="padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.75rem;color:#6b7280;">n-th Term (a<sub>${n}</sub>)</div>
                        <div style="font-weight:600;font-size:1.125rem;">${formatNumber(nthTerm, 4)}</div>
                    </div>
                `;

                let sum;
                if (r === 1) sum = a * n;
                else sum = a * (1 - Math.pow(r, n)) / (1 - r);
                
                resultParts.push(`Sum of first ${n} terms: ${formatNumber(sum, 4)}`);
                html += `
                    <div style="padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.75rem;color:#6b7280;">Sum of First ${n} Terms (S<sub>${n}</sub>)</div>
                        <div style="font-weight:600;font-size:1.125rem;">${formatNumber(sum, 4)}</div>
                    </div>
                `;
            }

            // Infinite sum
            if (Math.abs(r) < 1) {
                const infiniteSum = a / (1 - r);
                resultParts.push(`Infinite Sum: ${formatNumber(infiniteSum, 4)} (Convergent)`);
                html += `
                    <div style="padding:0.5rem;background:#ecfdf5;border-radius:0.375rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.75rem;color:#065f46;font-weight:600;">Infinite Sum (S<sub>∞</sub>)</div>
                        <div style="font-weight:600;font-size:1.125rem;color:#065f46;">${formatNumber(infiniteSum, 4)}</div>
                        <div style="font-size:0.75rem;color:#065f46;margin-top:0.25rem;">Convergent (|r| &lt; 1)</div>
                    </div>
                `;
            } else {
                resultParts.push(`Infinite Sum: Divergent`);
                html += `
                    <div style="padding:0.5rem;background:#fef2f2;border-radius:0.375rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.75rem;color:#991b1b;font-weight:600;">Infinite Sum (S<sub>∞</sub>)</div>
                        <div style="font-weight:600;font-size:0.875rem;color:#991b1b;">Divergent (|r| ≥ 1)</div>
                    </div>
                `;
            }

            html += `
                <div style="font-size:0.75rem;color:#6b7280;margin-top:0.75rem;padding-top:0.5rem;border-top:1px solid #e5e7eb;">
                    <div style="margin-bottom:0.25rem;"><strong>Formulas:</strong></div>
                    <div>n-th term: a<sub>n</sub> = a × r<sup>(n-1)</sup></div>
                    <div>Sum (r ≠ 1): S<sub>n</sub> = a × (1 - r<sup>n</sup>) / (1 - r)</div>
                    <div>Infinite sum (|r| &lt; 1): S<sub>∞</sub> = a / (1 - r)</div>
                </div>
            `;

            html += '</div>';
            outputEl.innerHTML = html;
            outputEl.dataset.rawResult = resultParts.join('\n');
        } catch (error) {
            outputEl.innerHTML = `<span style="color:#ef4444;">Error: ${error.message}</span>`;
        }
    }

    function clear() {
        firstTermEl.value = '';
        commonRatioEl.value = '';
        numTermsEl.value = '';
        specificTermEl.value = '';
        outputEl.textContent = '-';
        delete outputEl.dataset.rawResult;
        firstTermEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = outputEl.dataset.rawResult || outputEl.textContent;
            if (textToCopy === '-') return;
            copyToClipboard(textToCopy);
        });
    }

    const allInputs = [firstTermEl, commonRatioEl, numTermsEl, specificTermEl];
    allInputs.forEach((input, index) => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calculate();
            } else if (e.key === 'ArrowDown' && index < allInputs.length - 1) {
                allInputs[index + 1].focus();
            }
        });
    });
});
