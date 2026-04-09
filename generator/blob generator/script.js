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
 * Blob Generator
 * Generate organic blob SVG shapes
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Blob Generator', icon: '' });

    const blobSize = $('#blob-size');
    const blobComplexity = $('#blob-complexity');
    const blobRandomness = $('#blob-randomness');
    const blobSmoothness = $('#blob-smoothness');
    const blobColor = $('#blob-color');
    const blobColorText = $('#blob-color-text');
    const blobColor2 = $('#blob-color-2');
    const blobColor2Text = $('#blob-color-2-text');
    const blobUseGradient = $('#blob-use-gradient');
    const svgPreview = $('#svg-preview');
    const svgCode = $('#svg-code');
    const copyBtn = $('#copy');
    const randomizeBtn = $('#randomize');
    const downloadBtn = $('#download');

    function isValidHex(hex) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    }

    function syncColor(pickerEl, textEl) {
        textEl.value = pickerEl.value;
        generateBlob();
    }

    function syncTextToPicker(textEl, pickerEl) {
        let val = textEl.value.trim();
        if (!val.startsWith('#')) val = '#' + val;
        if (isValidHex(val)) {
            pickerEl.value = val;
            generateBlob();
        }
    }

    // Simple seeded random for reproducibility within a call
    function seededRandom(seed) {
        let s = seed;
        return function() {
            s = (s * 9301 + 49297) % 233280;
            return s / 233280;
        };
    }

    function generateBlobPath(size, complexity, randomness, smoothness, rng) {
        const cx = size / 2;
        const cy = size / 2;
        const baseRadius = size * 0.35;
        const points = [];

        // Generate points around a circle with random offsets
        for (let i = 0; i < complexity; i++) {
            const angle = (i / complexity) * 2 * Math.PI - Math.PI / 2;
            const randomOffset = 1 + (rng() - 0.5) * 2 * (randomness / 100);
            const radius = baseRadius * randomOffset;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            points.push({ x, y, angle });
        }

        // Generate smooth path using cubic bezier curves
        let d = '';
        const n = points.length;

        // Start at midpoint between last and first point
        const firstMidX = (points[n - 1].x + points[0].x) / 2;
        const firstMidY = (points[n - 1].y + points[0].y) / 2;
        d = `M ${firstMidX.toFixed(2)} ${firstMidY.toFixed(2)}`;

        for (let i = 0; i < n; i++) {
            const p0 = points[i];
            const p1 = points[(i + 1) % n];
            const midX = (p0.x + p1.x) / 2;
            const midY = (p0.y + p1.y) / 2;

            // Control point distance based on smoothness
            const dist = Math.sqrt(
                Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2)
            );
            const cpOffset = dist * smoothness * 0.5;

            // Direction from p0 to midpoint
            const dx = midX - p0.x;
            const dy = midY - p0.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;

            const cpx = p0.x + (dx / len) * cpOffset;
            const cpy = p0.y + (dy / len) * cpOffset;

            d += ` Q ${p0.x.toFixed(2)} ${p0.y.toFixed(2)} ${midX.toFixed(2)} ${midY.toFixed(2)}`;
        }

        d += ' Z';
        return d;
    }

    let currentPathD = '';
    let currentSeed = Date.now();

    function generateBlob() {
        try {
            const size = Math.max(50, parseInt(blobSize.value) || 200);
            const complexity = Math.max(4, Math.min(16, parseInt(blobComplexity.value) || 8));
            const randomness = Math.max(10, Math.min(100, parseInt(blobRandomness.value) || 50));
            const smoothness = Math.max(0.1, Math.min(1, parseFloat(blobSmoothness.value) || 0.5));
            const color1 = blobColor.value;
            const color2 = blobColor2.value;
            const useGradient = blobUseGradient.value === 'gradient';

            $('#blob-complexity-value').textContent = complexity;
            $('#blob-randomness-value').textContent = randomness + '%';
            $('#blob-smoothness-value').textContent = smoothness;

            const rng = seededRandom(currentSeed);
            const pathD = generateBlobPath(size, complexity, randomness, smoothness, rng);
            currentPathD = pathD;

            let defs = '';
            let fillAttr = '';

            if (useGradient) {
                defs = `\n  <defs>\n    <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="${color1}" />\n      <stop offset="100%" stop-color="${color2}" />\n    </linearGradient>\n  </defs>`;
                fillAttr = 'fill="url(#blobGrad)"';
            } else {
                fillAttr = `fill="${color1}"`;
            }

            const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${defs}\n  <path d="${pathD}" ${fillAttr} />\n</svg>`;

            svgPreview.innerHTML = svg;
            svgCode.textContent = svg;
        } catch (error) {
            svgCode.textContent = 'Error: ' + error.message;
        }
    }

    function randomize() {
        currentSeed = Date.now();
        generateBlob();
    }

    function downloadSVG() {
        const svgContent = svgCode.textContent;
        if (!svgContent || svgContent.startsWith('Error')) return;

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'blob.svg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('SVG downloaded successfully!');
    }

    // Event listeners
    [blobSize, blobComplexity, blobRandomness, blobSmoothness].forEach(el => {
        el.addEventListener('input', generateBlob);
    });

    blobUseGradient.addEventListener('change', generateBlob);

    blobColor.addEventListener('input', () => syncColor(blobColor, blobColorText));
    blobColorText.addEventListener('input', () => syncTextToPicker(blobColorText, blobColor));
    blobColor2.addEventListener('input', () => syncColor(blobColor2, blobColor2Text));
    blobColor2Text.addEventListener('input', () => syncTextToPicker(blobColor2Text, blobColor2));

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(svgCode.textContent));
    }

    if (randomizeBtn) {
        randomizeBtn.addEventListener('click', randomize);
    }

    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadSVG);
    }

    generateBlob();
});
