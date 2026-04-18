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
 * Probability Calculator
 * Calculate event probabilities
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Probability Calculator', icon: '🎲' });
    
    // Get elements
    const distTypeEl = $('#distributionType');
    const probModeEl = $('#probMode');
    
    // Input groups
    const distInputs = {
        normal: $('#normalInputs'),
        binomial: $('#binomialInputs'),
        poisson: $('#poissonInputs'),
        uniform: $('#uniformInputs')
    };

    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    
    const resultBox = $('#result');
    const outputEl = $('#output');
    const errorBox = $('#errorBox');
    const copyBtnGroup = $('#copyBtnGroup');

    // Toggle inputs
    distTypeEl.addEventListener('change', () => {
        const selected = distTypeEl.value;
        Object.keys(distInputs).forEach(key => {
            distInputs[key].style.display = (key === selected) ? 'block' : 'none';
        });
        
        // Adjust probability modes based on distribution (continuous vs discrete)
        const isContinuous = ['normal', 'uniform'].includes(selected);
        if (isContinuous) {
            // For continuous distributions, P(X=x) is 0
            Array.from(probModeEl.options).forEach(opt => {
                if (opt.value === 'equal') opt.disabled = true;
            });
            if (probModeEl.value === 'equal') probModeEl.value = 'lessEqual';
        } else {
            Array.from(probModeEl.options).forEach(opt => {
                opt.disabled = false;
            });
        }
    });

    // Math functions
    function erf(x) {
        // Abramowitz and Stegun approximation
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = (x < 0) ? -1 : 1;
        x = Math.abs(x);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    }

    function normalCDF(x, mean, std) {
        return 0.5 * (1 + erf((x - mean) / (std * Math.sqrt(2))));
    }

    function nCr(n, r) {
        if (r < 0 || r > n) return 0;
        if (r === 0 || r === n) return 1;
        if (r > n / 2) r = n - r;
        let res = 1;
        for (let i = 1; i <= r; i++) {
            res = res * (n - i + 1) / i;
        }
        return res;
    }

    function binomialPMF(k, n, p) {
        return nCr(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
    }

    function binomialCDF(k, n, p) {
        let sum = 0;
        for (let i = 0; i <= k; i++) sum += binomialPMF(i, n, p);
        return sum;
    }

    function factorial(n) {
        if (n < 2) return 1;
        let res = 1;
        for (let i = 2; i <= n; i++) res *= i;
        return res;
    }

    function poissonPMF(k, lambda) {
        return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
    }

    function poissonCDF(k, lambda) {
        let sum = 0;
        for (let i = 0; i <= k; i++) sum += poissonPMF(i, lambda);
        return sum;
    }

    function calculate() {
        const dist = distTypeEl.value;
        const mode = probModeEl.value;
        
        errorBox.style.display = 'none';
        resultBox.style.display = 'none';
        copyBtnGroup.style.display = 'none';

        let prob = 0;
        let mean = 0;
        let variance = 0;
        let distName = '';
        let xVal = 0;

        try {
            if (dist === 'normal') {
                const mu = parseFloat($('#normMean').value);
                const sigma = parseFloat($('#normStd').value);
                xVal = parseFloat($('#normX').value);
                if (isNaN(mu) || isNaN(sigma) || isNaN(xVal) || sigma <= 0) {
                    showError('Please enter valid Normal parameters (σ > 0).');
                    return;
                }
                const cdf = normalCDF(xVal, mu, sigma);
                prob = (mode === 'lessEqual') ? cdf : (1 - cdf);
                mean = mu;
                variance = sigma * sigma;
                distName = `Normal Distribution (μ=${mu}, σ=${sigma})`;
            } else if (dist === 'binomial') {
                const n = parseInt($('#binN').value);
                const p = parseFloat($('#binP').value);
                xVal = parseInt($('#binK').value);
                if (isNaN(n) || isNaN(p) || isNaN(xVal) || n < 1 || p < 0 || p > 1 || xVal < 0 || xVal > n) {
                    showError('Please enter valid Binomial parameters (0 ≤ p ≤ 1, 0 ≤ k ≤ n).');
                    return;
                }
                if (mode === 'equal') prob = binomialPMF(xVal, n, p);
                else if (mode === 'lessEqual') prob = binomialCDF(xVal, n, p);
                else prob = 1 - binomialCDF(xVal, n, p);
                mean = n * p;
                variance = n * p * (1 - p);
                distName = `Binomial Distribution (n=${n}, p=${p})`;
            } else if (dist === 'poisson') {
                const lambda = parseFloat($('#poiLambda').value);
                xVal = parseInt($('#poiK').value);
                if (isNaN(lambda) || isNaN(xVal) || lambda <= 0 || xVal < 0) {
                    showError('Please enter valid Poisson parameters (λ > 0, k ≥ 0).');
                    return;
                }
                if (mode === 'equal') prob = poissonPMF(xVal, lambda);
                else if (mode === 'lessEqual') prob = poissonCDF(xVal, lambda);
                else prob = 1 - poissonCDF(xVal, lambda);
                mean = lambda;
                variance = lambda;
                distName = `Poisson Distribution (λ=${lambda})`;
            } else if (dist === 'uniform') {
                const a = parseFloat($('#uniA').value);
                const b = parseFloat($('#uniB').value);
                xVal = parseFloat($('#uniX').value);
                if (isNaN(a) || isNaN(b) || isNaN(xVal) || a >= b) {
                    showError('Please enter valid Uniform parameters (a < b).');
                    return;
                }
                let cdf = 0;
                if (xVal < a) cdf = 0;
                else if (xVal > b) cdf = 1;
                else cdf = (xVal - a) / (b - a);
                prob = (mode === 'lessEqual') ? cdf : (1 - cdf);
                mean = (a + b) / 2;
                variance = Math.pow(b - a, 2) / 12;
                distName = `Uniform Distribution [${a}, ${b}]`;
            }

            let modeLabel = '';
            if (mode === 'equal') modeLabel = `P(X = ${xVal})`;
            else if (mode === 'lessEqual') modeLabel = `P(X ≤ ${xVal})`;
            else modeLabel = `P(X > ${xVal})`;

            let html = `
                <div style="margin-bottom: 1rem;">
                    <div style="font-weight: bold; color: #2563eb; margin-bottom: 0.5rem;">${distName}</div>
                    <div style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">
                        ${modeLabel} = ${formatNumber(prob, 6)}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="p-3 bg-light rounded">
                            <div class="text-muted small">Mean</div>
                            <div class="font-weight-bold">${formatNumber(mean, 4)}</div>
                        </div>
                        <div class="p-3 bg-light rounded">
                            <div class="text-muted small">Variance</div>
                            <div class="font-weight-bold">${formatNumber(variance, 4)}</div>
                        </div>
                    </div>
                </div>
            `;

            outputEl.innerHTML = html;
            resultBox.style.display = 'block';
            copyBtnGroup.style.display = 'flex';
        } catch (error) {
            showError('Calculation error: ' + error.message);
        }
    }

    function showError(message) {
        errorBox.textContent = message;
        errorBox.style.display = 'block';
    }

    function clear() {
        $$('.dist-inputs input').forEach(input => {
            const defaultValue = input.getAttribute('value');
            input.value = defaultValue !== null ? defaultValue : '';
        });
        outputEl.innerHTML = '';
        resultBox.style.display = 'none';
        errorBox.style.display = 'none';
        copyBtnGroup.style.display = 'none';
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    copyBtn.addEventListener('click', () => {
        copyToClipboard(outputEl.innerText);
    });
});
