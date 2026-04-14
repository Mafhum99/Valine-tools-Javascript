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
 * Matrix Transpose Calculator
 * Matrix M×N with dynamic grid
 * Aᵀ[i][j] = A[j][i]
 * Output: transposed matrix grid (N×M)
 * Show property: (Aᵀ)ᵀ = A
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Matrix Transpose Calculator', icon: '🔄' });

    const toolContent = $('#tool-content');
    if (!toolContent) return;

    let rows = parseInt(Storage.get('trans-rows', '3'));
    let cols = parseInt(Storage.get('trans-cols', '3'));
    let matrixInputs = [];

    // ---- Build UI ----
    function buildUI() {
        toolContent.innerHTML = '';

        // Size selectors row
        const sizeRow = createElement('div', {
            style: 'display:flex;gap:0.75rem;margin-bottom:1rem;align-items:flex-end;flex-wrap:wrap;'
        });

        const rowsGroup = createElement('div', { className: 'form-group', style: 'flex:1;min-width:120px;' });
        rowsGroup.appendChild(createElement('label', { className: 'form-label', textContent: 'Rows (M)' }));
        const rowsSelect = createElement('select', { className: 'form-select', id: 'matrix-rows' });
        [1, 2, 3, 4, 5, 6].forEach(n => {
            const opt = createElement('option', { value: String(n), textContent: String(n) });
            if (n === rows) opt.selected = true;
            rowsSelect.appendChild(opt);
        });
        rowsGroup.appendChild(rowsSelect);
        sizeRow.appendChild(rowsGroup);

        const colsGroup = createElement('div', { className: 'form-group', style: 'flex:1;min-width:120px;' });
        colsGroup.appendChild(createElement('label', { className: 'form-label', textContent: 'Columns (N)' }));
        const colsSelect = createElement('select', { className: 'form-select', id: 'matrix-cols' });
        [1, 2, 3, 4, 5, 6].forEach(n => {
            const opt = createElement('option', { value: String(n), textContent: String(n) });
            if (n === cols) opt.selected = true;
            colsSelect.appendChild(opt);
        });
        colsGroup.appendChild(colsSelect);
        sizeRow.appendChild(colsGroup);

        const dimDisplay = createElement('div', { className: 'form-group', style: 'flex:1;min-width:120px;' });
        dimDisplay.appendChild(createElement('label', { className: 'form-label', textContent: 'Dimensions' }));
        const dimText = createElement('div', {
            id: 'dim-display',
            textContent: `${rows}×${cols} → ${cols}×${rows}`,
            style: 'padding:0.75rem;background:#dbeafe;border-radius:0.375rem;text-align:center;font-weight:700;color:#1d4ed8;font-size:1rem;'
        });
        dimDisplay.appendChild(dimText);
        sizeRow.appendChild(dimDisplay);

        toolContent.appendChild(sizeRow);

        // Original matrix grid
        const matrixContainer = createElement('div', { id: 'matrix-container' });
        matrixContainer.appendChild(createElement('div', {
            style: 'font-weight:700;color:#2563eb;margin-bottom:0.5rem;',
            textContent: 'Original Matrix A'
        }));
        matrixContainer.appendChild(buildMatrixGrid(rows, cols));
        toolContent.appendChild(matrixContainer);

        // Buttons
        const btnGroup = createElement('div', { className: 'btn-group' });
        const calcBtn = createElement('button', { id: 'calculate', className: 'btn btn-primary btn-block', textContent: 'Calculate Transpose' });
        btnGroup.appendChild(calcBtn);
        toolContent.appendChild(btnGroup);

        const clearBtn = createElement('button', { id: 'clear', className: 'btn btn-secondary btn-block', textContent: 'Clear' });
        toolContent.appendChild(clearBtn);

        // Result box
        const resultBox = createElement('div', { className: 'result-box', id: 'result' });
        const resultLabel = createElement('div', { className: 'result-label', textContent: 'Result' });
        const outputEl = createElement('div', { id: 'output', textContent: '-' });
        resultBox.appendChild(resultLabel);
        resultBox.appendChild(outputEl);
        toolContent.appendChild(resultBox);

        // Copy button
        const copyGroup = createElement('div', { className: 'btn-group' });
        const copyBtn = createElement('button', { id: 'copy', className: 'btn btn-secondary', textContent: '📋 Copy Result' });
        copyGroup.appendChild(copyBtn);
        toolContent.appendChild(copyGroup);

        bindEvents();
    }

    function buildMatrixGrid(r, c) {
        const container = createElement('div', {});
        const grid = createElement('div', { className: 'matrix-grid' });
        grid.style.cssText = `display:grid;grid-template-columns:repeat(${c},1fr);gap:0.5rem;max-width:${Math.min(c * 90, 540)}px;margin:0.5rem auto 1rem;`;

        matrixInputs = [];
        for (let i = 0; i < r; i++) {
            matrixInputs[i] = [];
            for (let j = 0; j < c; j++) {
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

    function readMatrix(r, c) {
        const matrix = [];
        for (let i = 0; i < r; i++) {
            matrix[i] = [];
            for (let j = 0; j < c; j++) {
                const val = parseFloat(matrixInputs[i][j].value);
                if (isNaN(val)) {
                    throw new Error(`Invalid number at row ${i + 1}, column ${j + 1}`);
                }
                matrix[i][j] = val;
            }
        }
        return matrix;
    }

    // ---- Math functions ----
    function transpose(matrix) {
        const r = matrix.length;
        const c = matrix[0].length;
        const result = [];
        for (let j = 0; j < c; j++) {
            result[j] = [];
            for (let i = 0; i < r; i++) {
                result[j][i] = matrix[i][j];
            }
        }
        return result;
    }

    function fmt(v) {
        if (Number.isInteger(v)) return String(v);
        return parseFloat(v.toFixed(6)).toString();
    }

    function renderMatrixGrid(matrix, label, color) {
        const r = matrix.length;
        const c = matrix[0].length;
        const wrapper = createElement('div', { style: 'margin:1rem 0;' });
        wrapper.appendChild(createElement('div', {
            style: `font-weight:700;color:${color};margin-bottom:0.5rem;`,
            textContent: label
        }));
        const grid = createElement('div', {
            style: `display:grid;grid-template-columns:repeat(${c},1fr);gap:0.5rem;max-width:${Math.min(c * 90, 540)}px;`
        });
        for (let i = 0; i < r; i++) {
            for (let j = 0; j < c; j++) {
                const cell = createElement('div', {
                    className: 'matrix-cell',
                    textContent: fmt(matrix[i][j]),
                    style: 'padding:0.5rem;border:1px solid #e5e7eb;border-radius:0.375rem;text-align:center;font-family:monospace;font-size:0.875rem;background:#f9fafb;'
                });
                grid.appendChild(cell);
            }
        }
        wrapper.appendChild(grid);
        return wrapper;
    }

    function calculate() {
        let matrix;
        try {
            matrix = readMatrix(rows, cols);
        } catch (e) {
            $('#output').innerHTML = `<span style="color:#ef4444;">${e.message}</span>`;
            return;
        }

        const transposed = transpose(matrix);
        const doubleTransposed = transpose(transposed);

        const output = $('#output');
        output.innerHTML = '';

        output.appendChild(createElement('div', {
            style: 'font-size:1rem;font-weight:700;color:#2563eb;margin-bottom:0.5rem;',
            textContent: `Aᵀ  [${rows}×${cols}] → [${cols}×${rows}]`
        }));

        output.appendChild(renderMatrixGrid(transposed, 'Transposed Matrix Aᵀ:', '#7c3aed'));

        // Verify property: (Aᵀ)ᵀ = A
        let matches = true;
        for (let i = 0; i < rows && matches; i++) {
            for (let j = 0; j < cols && matches; j++) {
                if (Math.abs(doubleTransposed[i][j] - matrix[i][j]) > 1e-10) {
                    matches = false;
                }
            }
        }

        const propertyDiv = createElement('div', {
            style: `margin-top:1rem;padding:0.75rem;border-radius:0.375rem;border:1px solid ${matches ? '#bbf7d0' : '#fecaca'};background:${matches ? '#f0fdf4' : '#fef2f2'};`
        });
        if (matches) {
            propertyDiv.appendChild(createElement('div', {
                style: 'color:#16a34a;font-weight:700;',
                textContent: '✓ Property verified: (Aᵀ)ᵀ = A'
            }));
            propertyDiv.appendChild(createElement('div', {
                style: 'color:#16a34a;font-size:0.875rem;margin-top:0.25rem;',
                textContent: 'Transposing twice returns the original matrix.'
            }));
        } else {
            propertyDiv.appendChild(createElement('div', {
                style: 'color:#dc2626;font-weight:700;',
                textContent: '✗ Property check failed — this should not happen!'
            }));
        }
        output.appendChild(propertyDiv);
    }

    function clearAll() {
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                matrixInputs[i][j].value = '0';
            }
        }
        $('#output').textContent = '-';
    }

    function updateSizes() {
        rows = parseInt($('#matrix-rows').value);
        cols = parseInt($('#matrix-cols').value);

        Storage.set('trans-rows', String(rows));
        Storage.set('trans-cols', String(cols));

        const dimText = $('#dim-display');
        if (dimText) dimText.textContent = `${rows}×${cols} → ${cols}×${rows}`;

        const container = $('#matrix-container');
        if (container) {
            const label = container.querySelector('div');
            container.innerHTML = '';
            if (label) container.appendChild(label);
            container.appendChild(buildMatrixGrid(rows, cols));
        }

        $('#output').textContent = '-';
    }

    function bindEvents() {
        $('#matrix-rows').addEventListener('change', updateSizes);
        $('#matrix-cols').addEventListener('change', updateSizes);

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
