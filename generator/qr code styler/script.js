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
 * QR Code Styler
 * Style QR codes with colors and shapes
 *
 * Uses a simplified data-to-pattern encoding for visual representation.
 * For production QR codes that scan, integrate a library like qrcode.js.
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'QR Code Styler', icon: '\u{1f3a8}' });

    const stylerQRInputEl = $('#stylerQRInput');
    const stylerPatternStyleEl = $('#stylerPatternStyle');
    const stylerModuleColorEl = $('#stylerModuleColor');
    const stylerBgColorEl = $('#stylerBgColor');
    const stylerFinderColorEl = $('#stylerFinderColor');
    const stylerModuleSizeEl = $('#stylerModuleSize');
    const stylerModuleSizeValueEl = $('#stylerModuleSizeValue');
    const stylerMarginEl = $('#stylerMargin');
    const stylerMarginValueEl = $('#stylerMarginValue');
    const previewEl = $('#qrPreview');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    let currentSVG = '';

    // Check if a position is part of the finder pattern area
    function isFinderArea(x, y, gridSize) {
        // Top-left finder
        if (x < 9 && y < 9) return true;
        // Top-right finder
        if (x >= gridSize - 8 && y < 9) return true;
        // Bottom-left finder
        if (x < 9 && y >= gridSize - 8) return true;
        return false;
    }

    function isTimingPattern(x, y) {
        return x === 6 || y === 6;
    }

    // QR Code finder pattern (7x7)
    function getFinderPatternRects(x, y, gridSize) {
        const rects = [];
        const offsets = [
            // Outer border (7x7)
            [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],
            [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],
            [0,1],[0,2],[0,3],[0,4],[0,5],
            [6,1],[6,2],[6,3],[6,4],[6,5],
            // Center 3x3
            [2,2],[3,2],[4,2],
            [2,3],[3,3],[4,3],
            [2,4],[3,4],[4,4]
        ];
        offsets.forEach(([dx, dy]) => {
            rects.push({ x: x + dx, y: y + dy });
        });
        return rects;
    }

    function getAlignmentPatternRects(cx, cy) {
        const rects = [];
        const offsets = [
            // Outer 5x5 border
            [0,-2],[1,-2],[2,-2],[3,-2],[4,-2],
            [0,2],[1,2],[2,2],[3,2],[4,2],
            [-2,-1],[-2,0],[-2,1],
            [2,-1],[2,0],[2,1],
            // Center
            [0,0]
        ];
        offsets.forEach(([dx, dy]) => {
            rects.push({ x: cx + dx, y: cy + dy });
        });
        return rects;
    }

    // Generate deterministic pattern from string
    function generateStyledPattern(str, gridSize) {
        const finderRects = [];
        const dataRects = [];

        // Finder patterns (3 corners)
        finderRects.push(...getFinderPatternRects(0, 0, gridSize));
        finderRects.push(...getFinderPatternRects(gridSize - 7, 0, gridSize));
        finderRects.push(...getFinderPatternRects(0, gridSize - 7, gridSize));

        // Timing patterns
        for (let i = 8; i < gridSize - 8; i++) {
            if (i % 2 === 0) {
                finderRects.push({ x: i, y: 6 });
                finderRects.push({ x: 6, y: i });
            }
        }

        // Alignment pattern
        if (gridSize >= 21) {
            const alignPos = Math.floor(gridSize / 2);
            finderRects.push(...getAlignmentPatternRects(alignPos, alignPos));
        }

        // Data area
        const hash = hashCode(str);
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (isFinderArea(x, y, gridSize)) continue;
                if (isTimingPattern(x, y)) continue;

                const val = simpleHash(hash, x, y);
                if (val % 3 !== 0) {
                    dataRects.push({ x, y });
                }
            }
        }

        return { finderRects, dataRects };
    }

    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash);
    }

    function simpleHash(seed, x, y) {
        let h = seed;
        h = Math.imul(h ^ x, 0x5bd1e995);
        h = Math.imul(h ^ y, 0x5bd1e995);
        return Math.abs(h);
    }

    function renderModule(x, y, moduleSize, style, color, borderRadius) {
        const px = x * moduleSize;
        const py = y * moduleSize;
        const size = moduleSize;

        switch (style) {
            case 'square':
                return `<rect x="${px}" y="${py}" width="${size}" height="${size}" fill="${color}"/>`;

            case 'rounded': {
                const r = size * borderRadius;
                return `<rect x="${px}" y="${py}" width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${color}"/>`;
            }

            case 'circle': {
                const cx = px + size / 2;
                const cy = py + size / 2;
                const radius = (size / 2) * 0.85;
                return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}"/>`;
            }

            case 'diamond': {
                const cx = px + size / 2;
                const cy = py + size / 2;
                const half = size / 2;
                return `<polygon points="${cx},${cy - half} ${cx + half},${cy} ${cx},${cy + half} ${cx - half},${cy}" fill="${color}"/>`;
            }

            default:
                return `<rect x="${px}" y="${py}" width="${size}" height="${size}" fill="${color}"/>`;
        }
    }

    function generateStyledQRCode(text, patternStyle, moduleSize, margin, moduleColor, bgColor, finderColor, borderRadius) {
        if (!text.trim()) {
            throw new Error('Please enter text or URL');
        }

        const textLen = text.length;
        let gridSize;
        if (textLen <= 10) gridSize = 21;
        else if (textLen <= 25) gridSize = 25;
        else if (textLen <= 50) gridSize = 29;
        else if (textLen <= 100) gridSize = 33;
        else gridSize = 37;

        if (gridSize % 4 !== 1) gridSize = gridSize + (4 - (gridSize % 4)) + 1;
        gridSize = Math.min(gridSize, 45);

        const { finderRects, dataRects } = generateStyledPattern(text, gridSize);
        const totalSize = (gridSize + margin * 2) * moduleSize;

        // Render finder modules
        let finderSVG = '';
        finderRects.forEach(r => {
            finderSVG += '    ' + renderModule(r.x + margin, r.y + margin, moduleSize, patternStyle, finderColor, borderRadius) + '\n';
        });

        // Render data modules
        let dataSVG = '';
        dataRects.forEach(r => {
            dataSVG += '    ' + renderModule(r.x + margin, r.y + margin, moduleSize, patternStyle, moduleColor, borderRadius) + '\n';
        });

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${totalSize}" height="${totalSize}">
  <rect width="${totalSize}" height="${totalSize}" fill="${bgColor}"/>
  <!-- Finder Patterns -->
  <g>
${finderSVG}  </g>
  <!-- Data Modules -->
  <g>
${dataSVG}  </g>
</svg>`;
    }

    function generate() {
        try {
            const text = stylerQRInputEl.value.trim();
            if (!text) {
                outputEl.textContent = 'Please enter text or URL';
                previewEl.innerHTML = '<p class="text-muted">No input provided.</p>';
                return;
            }

            const patternStyle = stylerPatternStyleEl.value;
            const moduleSize = parseInt(stylerModuleSizeEl.value) || 8;
            const margin = parseInt(stylerMarginEl.value) || 4;
            const moduleColor = stylerModuleColorEl.value;
            const bgColor = stylerBgColorEl.value;
            const finderColor = stylerFinderColorEl.value;
            const borderRadius = 0.3;

            currentSVG = generateStyledQRCode(text, patternStyle, moduleSize, margin, moduleColor, bgColor, finderColor, borderRadius);

            const previewModuleSize = Math.max(moduleSize, 6);
            const previewSVG = generateStyledQRCode(text, patternStyle, previewModuleSize, margin, moduleColor, bgColor, finderColor, borderRadius);
            previewEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;min-height:150px;padding:20px;background:#f1f5f9;border-radius:8px;">${previewSVG}</div>`;
            outputEl.textContent = currentSVG;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
            previewEl.innerHTML = '<p class="text-muted">Failed to generate styled QR code.</p>';
        }
    }

    function clear() {
        stylerQRInputEl.value = 'https://example.com';
        stylerPatternStyleEl.value = 'square';
        stylerModuleColorEl.value = '#2563eb';
        stylerBgColorEl.value = '#ffffff';
        stylerFinderColorEl.value = '#1e40af';
        stylerModuleSizeEl.value = 8;
        stylerModuleSizeValueEl.textContent = '8';
        stylerMarginEl.value = 4;
        stylerMarginValueEl.textContent = '4';
        previewEl.innerHTML = '';
        outputEl.textContent = '-';
        currentSVG = '';
    }

    stylerModuleSizeEl.addEventListener('input', () => { stylerModuleSizeValueEl.textContent = stylerModuleSizeEl.value; });
    stylerMarginEl.addEventListener('input', () => { stylerMarginValueEl.textContent = stylerMarginEl.value; });

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (currentSVG) copyToClipboard(currentSVG);
        });
    }

    stylerQRInputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generate();
    });

    [stylerPatternStyleEl, stylerModuleColorEl, stylerBgColorEl, stylerFinderColorEl].forEach(el => el.addEventListener('change', generate));
});
