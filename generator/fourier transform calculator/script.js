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
 * Fourier Transform Calculator
 * Calculate discrete Fourier transform (DFT)
 * DFT: X(k) = Σ(n=0 to N-1) x(n) × e^(-2πikn/N)
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Fourier Transform Calculator', icon: '📊' });

    // Get elements
    const inputEl = $('#input');
    const samplingRateEl = $('#samplingRate');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // ========================================
    // Parse input signal
    // ========================================
    function parseInput(str) {
        return str.split(',').map(s => s.trim()).filter(s => s !== '').map(Number);
    }

    // ========================================
    // Format complex number
    // ========================================
    function fmtComplex(real, imag, decimals = 4) {
        const r = formatNumber(real, decimals);
        const i = formatNumber(Math.abs(imag), decimals);
        const sign = imag >= 0 ? '+' : '-';
        return `${r} ${sign} ${i}i`;
    }

    // ========================================
    // Compute DFT
    // X(k) = Σ(n=0 to N-1) x(n) × e^(-2πikn/N)
    //      = Σ(n=0 to N-1) x(n) × [cos(2πkn/N) - i×sin(2πkn/N)]
    // ========================================
    function computeDFT(signal, N) {
        const result = [];
        const twoPi = 2 * Math.PI;

        for (let k = 0; k < N; k++) {
            let realSum = 0;
            let imagSum = 0;

            for (let n = 0; n < N; n++) {
                const angle = twoPi * k * n / N;
                realSum += signal[n] * Math.cos(angle);
                imagSum += signal[n] * (-Math.sin(angle));
            }

            result.push({ real: realSum, imag: imagSum });
        }

        return result;
    }

    // ========================================
    // Compute magnitude
    // ========================================
    function magnitude(real, imag) {
        return Math.sqrt(real * real + imag * imag);
    }

    // ========================================
    // Compute phase (in radians and degrees)
    // ========================================
    function phase(real, imag) {
        return Math.atan2(imag, real);
    }

    // ========================================
    // Main calculation function
    // ========================================
    function calculate() {
        const rawInput = inputEl.value.trim();
        const rawSamplingRate = samplingRateEl.value.trim();

        // Validate input signal
        if (!rawInput) {
            outputEl.textContent = 'Please enter an input signal (comma-separated numbers).';
            return;
        }

        const signal = parseInput(rawInput);

        if (signal.length === 0) {
            outputEl.textContent = 'No valid numbers found in the input signal.';
            return;
        }

        if (signal.some(isNaN)) {
            outputEl.textContent = 'Error: Invalid value in input signal. Please enter only numbers separated by commas.';
            return;
        }

        const N = signal.length;

        if (N < 2) {
            outputEl.textContent = 'Error: Input signal must have at least 2 values (N >= 2).';
            return;
        }

        // Validate sampling rate
        let samplingRate = 1;
        if (rawSamplingRate !== '') {
            samplingRate = parseFloat(rawSamplingRate);
            if (isNaN(samplingRate) || samplingRate <= 0) {
                outputEl.textContent = 'Error: Sampling rate must be a positive number.';
                return;
            }
        }

        // Compute DFT
        const dftResult = computeDFT(signal, N);

        // Calculate frequency resolution
        const freqResolution = samplingRate / N;

        // Build output
        let result = '';
        result += 'Discrete Fourier Transform (DFT)\n';
        result += '='.repeat(45) + '\n\n';
        result += `Input Signal: [${signal.join(', ')}]\n`;
        result += `Signal Length (N): ${N}\n`;
        result += `Sampling Rate (Fs): ${samplingRate} Hz\n`;
        result += `Frequency Resolution: ${formatNumber(freqResolution, 6)} Hz\n`;
        result += `\nFormula: X(k) = Σ(n=0 to N-1) x(n) × e^(-2πikn/N)\n`;

        result += '\n' + '-'.repeat(45) + '\n';
        result += 'Frequency Components:\n';
        result += '-'.repeat(45) + '\n\n';

        for (let k = 0; k < N; k++) {
            const freq = k * freqResolution;
            const { real, imag } = dftResult[k];
            const mag = magnitude(real, imag);
            const phaseRad = phase(real, imag);
            const phaseDeg = phaseRad * (180 / Math.PI);

            result += `Bin k=${k}:\n`;
            result += `  Frequency: ${formatNumber(freq, 6)} Hz\n`;
            result += `  Complex:   ${fmtComplex(real, imag)}\n`;
            result += `  Magnitude: ${formatNumber(mag)}\n`;
            result += `  Phase:     ${formatNumber(phaseRad)} rad (${formatNumber(phaseDeg)}°)\n`;
            result += '\n';
        }

        // Summary table
        result += '-'.repeat(45) + '\n';
        result += 'Summary:\n';
        result += '-'.repeat(45) + '\n\n';
        result += `  k  |  Frequency(Hz)  |  Magnitude  |  Phase(rad)\n`;
        result += `  ${'-'.repeat(50)}\n`;

        for (let k = 0; k < N; k++) {
            const freq = k * freqResolution;
            const { real, imag } = dftResult[k];
            const mag = magnitude(real, imag);
            const phaseRad = phase(real, imag);
            result += `  ${k.toString().padStart(2)} |  ${formatNumber(freq, 6).padStart(13)}  |  ${formatNumber(mag).padStart(9)}  |  ${formatNumber(phaseRad).padStart(9)}\n`;
        }

        // DC and Nyquist info
        result += '\n' + '-'.repeat(45) + '\n';
        result += 'Notes:\n';
        result += '-'.repeat(45) + '\n';
        result += `  DC Component (k=0): ${formatNumber(magnitude(dftResult[0].real, dftResult[0].imag))}\n`;

        if (N % 2 === 0) {
            const nyquistIdx = N / 2;
            result += `  Nyquist (k=${nyquistIdx}): ${formatNumber(magnitude(dftResult[nyquistIdx].real, dftResult[nyquistIdx].imag))} at ${formatNumber(samplingRate / 2, 6)} Hz\n`;
        }

        result += `  Max Magnitude: Bin k=${dftResult.reduce((maxIdx, entry, idx, arr) => magnitude(entry.real, entry.imag) > magnitude(arr[maxIdx].real, arr[maxIdx].imag) ? idx : maxIdx, 0)}, value = ${formatNumber(Math.max(...dftResult.map(e => magnitude(e.real, e.imag))))}\n`;

        outputEl.textContent = result;
    }

    // ========================================
    // Clear function
    // ========================================
    function clear() {
        inputEl.value = '';
        samplingRateEl.value = '1';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    // ========================================
    // Event listeners
    // ========================================
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    // Enter key support
    const handleEnter = (e) => {
        if (e.key === 'Enter') calculate();
    };
    inputEl.addEventListener('keypress', handleEnter);
    samplingRateEl.addEventListener('keypress', handleEnter);
});
