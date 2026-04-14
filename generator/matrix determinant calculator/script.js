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
 * Matrix Determinant Calculator
 * Size selector N×N (2–5), dynamic grid
 * 2×2: ad−bc; 3×3: Sarrus rule; NxN: cofactor expansion recursive
 * Shows steps for 2×2 and 3×3
 * Output: determinant value
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Matrix Determinant Calculator', icon: '🔢' });

    const toolContent = $('#tool-content');
    if (!toolContent) return;

    let currentSize = parseInt(Storage.get('det-matrix-size', '3'));
    let matrixInputs = [];

    // ---- Build UI ----
    function buildUI() {
        toolContent.innerHTML = '';

        const sizeGroup = createElement('div', { className: 'form-group' });
        const sizeLabel = createElement('label', { className: 'form-label', textContent: 'Matrix Size' });
        const sizeSelect = createElement('select', { className: 'form-select', id: 'matrix-size' });
        [2, 3, 4, 5].forEach(n => {
            const opt = createElement('option', { value: String(n), textContent: `${n}×${n}` });
            if (n === currentSize) opt.selected = true;
            sizeSelect.appendChild(opt);
        });
        sizeGroup.appendChild(sizeLabel);
        sizeGroup.appendChild(sizeSelect);
        toolContent.appendChild(sizeGroup);

        const matrixContainer = createElement('div', { id: 'matrix-container' });
        matrixContainer.appendChild(buildMatrixGrid(currentSize));
        toolContent.appendChild(matrixContainer);

        const btnGroup = createElement('div', { className: 'btn-group' });
        const calcBtn = createElement('button', { id: 'calculate', className: 'btn btn-primary btn-block', textContent: 'Calculate Determinant' });
        btnGroup.appendChild(calcBtn);
        toolContent.appendChild(btnGroup);

        const clearBtn = createElement('button', { id: 'clear', className: 'btn btn-secondary btn-block', textContent: 'Clear' });
        toolContent.appendChild(clearBtn);

        const resultBox = createElement('div', { className: 'result-box', id: 'result' });
        const resultLabel = createElement('div', { className: 'result-label', textContent: 'Result' });
        const outputEl = createElement('div', { id: 'output', textContent: '-' });
        resultBox.appendChild(resultLabel);
        resultBox.appendChild(outputEl);
        toolContent.appendChild(resultBox);

        const copyGroup = createElement('div', { className: 'btn-group' });
        const copyBtn = createElement('button', { id: 'copy', className: 'btn btn-secondary', textContent: '📋 Copy Result' });
        copyGroup.appendChild(copyBtn);
        toolContent.appendChild(copyGroup);

        bindEvents();
    }

    function buildMatrixGrid(n) {
        const container = createElement('div', { className: 'matrix-grid-container' });
        const grid = createElement('div', { className: 'matrix-grid', id: 'matrix-grid' });
        grid.style.cssText = `display:grid;grid-template-columns:repeat(${n},1fr);gap:0.5rem;max-width:${Math.min(n * 90, 450)}px;margin:1rem auto;`;

        matrixInputs = [];
        for (let i = 0; i < n; i++) {
            matrixInputs[i] = [];
            for (let j = 0; j < n; j++) {
                const input = createElement('input', {
                    type: 'number',
                    className: 'matrix-cell',
                    value: '0',
                    style: 'width:100%;padding:0.5rem;border:2px solid #e5e7eb;border-radius:0.375rem;text-align:center;font-size:1rem;font-family:monospace;transition:border-color 0.2s;',
                    'data-row': String(i),
                    'data-col': String(j)
                });
                input.addEventListener('focus', () => { input.style.borderColor = '#2563eb'; input.select(); });
                input.addEventListener('blur', () => { input.style.borderColor = '#e5e7eb'; });
                grid.appendChild(input);
                matrixInputs[i][j] = input;
            }
        }
        container.appendChild(grid);
        return container;
    }

    function readMatrix(n) {
        const matrix = [];
        for (let i = 0; i < n; i++) {
            matrix[i] = [];
            for (let j = 0; j < n; j++) {
                const val = parseFloat(matrixInputs[i][j].value);
                if (isNaN(val)) {
                    throw new Error(`Invalid number at row ${i + 1}, column ${j + 1}`);
                }
                matrix[i][j] = val;
            }
        }
        return matrix;
    }

    // ---- Determinant calculations ----
    function det2x2(m) {
        return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    }

    function det3x3(m) {
        return m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1])
             - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0])
             + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
    }

    function minor(matrix, row, col) {
        return matrix
            .filter((_, i) => i !== row)
            .map(r => r.filter((_, j) => j !== col));
    }

    function determinant(matrix) {
        const n = matrix.length;
        if (n === 1) return matrix[0][0];
        if (n === 2) return det2x2(matrix);
        let det = 0;
        for (let j = 0; j < n; j++) {
            det += Math.pow(-1, j) * matrix[0][j] * determinant(minor(matrix, 0, j));
        }
        return det;
    }

    function fmt(v) {
        if (Number.isInteger(v)) return String(v);
        return parseFloat(v.toFixed(6)).toString();
    }

    function steps2x2(m) {
        const a = m[0][0], b = m[0][1], c = m[1][0], d = m[1][1];
        const ad = a * d, bc = b * c, det = ad - bc;
        return [
            'Formula: det = ad − bc',
            '',
            `a = ${fmt(a)},  b = ${fmt(b)}`,
            `c = ${fmt(c)},  d = ${fmt(d)}`,
            '',
            `ad = ${fmt(a)} × ${fmt(d)} = ${fmt(ad)}`,
            `bc = ${fmt(b)} × ${fmt(c)} = ${fmt(bc)}`,
            '',
            `det = ${fmt(ad)} − ${fmt(bc)} = ${fmt(det)}`
        ].join('\n');
    }

    function steps3x3(m) {
        const lines = [];
        lines.push('Sarrus Rule (cofactor expansion along row 1):');
        lines.push('');
        lines.push('det = a₁₁(a₂₂a₃₃ − a₂₃a₃₂) − a₁₂(a₂₀a₃₃ − a₂₃a₃₀) + a₁₃(a₂₀a₃₂ − a₂₁a₃₀)');
        lines.push('');

        const a = m[0][0], b = m[0][1], c = m[0][2];
        const d = m[1][0], e = m[1][1], f = m[1][2];
        const g = m[2][0], h = m[2][1], i = m[2][2];

        const m11 = e * i - f * h;
        const m12 = d * i - f * g;
        const m13 = d * h - e * g;

        lines.push(`Cofactor of a₁₁: (${fmt(e)}×${fmt(i)}) − (${fmt(f)}×${fmt(h)}) = ${fmt(e*i)} − ${fmt(f*h)} = ${fmt(m11)}`);
        lines.push(`Cofactor of a₁₂: (${fmt(d)}×${fmt(i)}) − (${fmt(f)}×${fmt(g)}) = ${fmt(d*i)} − ${fmt(f*g)} = ${fmt(m12)}`);
        lines.push(`Cofactor of a₁₃: (${fmt(d)}×${fmt(h)}) − (${fmt(e)}×${fmt(g)}) = ${fmt(d*h)} − ${fmt(e*g)} = ${fmt(m13)}`);
        lines.push('');
        lines.push(`det = ${fmt(a)}×(${fmt(m11)}) − ${fmt(b)}×(${fmt(m12)}) + ${fmt(c)}×(${fmt(m13)})`);
        lines.push(`det = ${fmt(a * m11)} − ${fmt(b * m12)} + ${fmt(c * m13)}`);
        lines.push(`det = ${fmt(a * m11 - b * m12 + c * m13)}`);

        return lines.join('\n');
    }

    function calculate() {
        const n = currentSize;
        let matrix;
        try {
            matrix = readMatrix(n);
        } catch (e) {
            $('#output').innerHTML = `<span style="color:#ef4444;">${e.message}</span>`;
            return;
        }

        const det = determinant(matrix);
        const output = $('#output');

        if (n === 2) {
            output.textContent = `Determinant = ${fmt(det)}`;
            const stepsDiv = createElement('div', {
                style: 'margin-top:1rem;padding:0.75rem;background:#f9fafb;border-radius:0.375rem;border:1px solid #e5e7eb;white-space:pre-wrap;font-family:monospace;font-size:0.875rem;line-height:1.7;'
            });
            stepsDiv.textContent = steps2x2(matrix);
            output.appendChild(createElement('br'));
            output.appendChild(createElement('br'));
            output.appendChild(createElement('div', {
                style: 'font-weight:700;color:#374151;margin-bottom:0.5rem;',
                textContent: 'Steps:'
            }));
            output.appendChild(stepsDiv);
        } else if (n === 3) {
            output.textContent = `Determinant = ${fmt(det)}`;
            const stepsDiv = createElement('div', {
                style: 'margin-top:1rem;padding:0.75rem;background:#f9fafb;border-radius:0.375rem;border:1px solid #e5e7eb;white-space:pre-wrap;font-family:monospace;font-size:0.875rem;line-height:1.7;'
            });
            stepsDiv.textContent = steps3x3(matrix);
            output.appendChild(createElement('br'));
            output.appendChild(createElement('br'));
            output.appendChild(createElement('div', {
                style: 'font-weight:700;color:#374151;margin-bottom:0.5rem;',
                textContent: 'Steps:'
            }));
            output.appendChild(stepsDiv);
        } else {
            output.textContent = `Determinant = ${fmt(det)}\n(Method: cofactor expansion along first row)`;
        }
    }

    function clearAll() {
        for (let i = 0; i < currentSize; i++) {
            for (let j = 0; j < currentSize; j++) {
                matrixInputs[i][j].value = '0';
            }
        }
        $('#output').textContent = '-';
    }

    function bindEvents() {
        $('#matrix-size').addEventListener('change', (e) => {
            currentSize = parseInt(e.target.value);
            Storage.set('det-matrix-size', String(currentSize));
            const container = $('#matrix-container');
            if (container) container.replaceChild(buildMatrixGrid(currentSize), container.firstChild);
            $('#output').textContent = '-';
        });

        $('#calculate').addEventListener('click', calculate);
        $('#clear').addEventListener('click', clearAll);
        $('#copy').addEventListener('click', () => {
            const text = $('#output').textContent;
            if (text && text !== '-') copyToClipboard(text);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.classList.contains('matrix-cell')) {
                calculate();
            }
        });
    }

    buildUI();
});
