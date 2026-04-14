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
 * Matrix Multiplication Calculator
 * Matrix A: M×P, Matrix B: P×N with size selectors
 * Validation: cols of A = rows of B
 * C[i][j] = Σ(A[i][k] × B[k][j])
 * Show matrices A, B, and result C in grid format
 * Optional: show step for one element
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Matrix Multiplication Calculator', icon: '✖️' });

    const toolContent = $('#tool-content');
    if (!toolContent) return;

    let rowsA = parseInt(Storage.get('mult-rowsA', '3'));
    let colsA = parseInt(Storage.get('mult-colsA', '3')); // must equal rowsB
    let colsB = parseInt(Storage.get('mult-colsB', '3'));
    let matrixAInputs = [];
    let matrixBInputs = [];

    // ---- Build UI ----
    function buildUI() {
        toolContent.innerHTML = '';

        // Size selectors row
        const sizeRow = createElement('div', {
            style: 'display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.75rem;margin-bottom:1rem;'
        });

        // Matrix A size
        const sizeAGroup = createElement('div', { className: 'form-group' });
        sizeAGroup.appendChild(createElement('label', { className: 'form-label', textContent: 'Matrix A (rows × cols)' }));
        const aRowSelect = createElement('select', { className: 'form-select', id: 'a-rows' });
        const aColSelect = createElement('select', { className: 'form-select', id: 'a-cols' });
        [1, 2, 3, 4, 5].forEach(n => {
            const o1 = createElement('option', { value: String(n), textContent: String(n) });
            const o2 = createElement('option', { value: String(n), textContent: String(n) });
            if (n === rowsA) o1.selected = true;
            if (n === colsA) o2.selected = true;
            aRowSelect.appendChild(o1);
            aColSelect.appendChild(o2);
        });
        const aSizeRow = createElement('div', { style: 'display:flex;gap:0.5rem;align-items:center;' });
        aSizeRow.appendChild(aRowSelect);
        aSizeRow.appendChild(createElement('span', { textContent: '×', style: 'font-weight:700;color:#6b7280;' }));
        aSizeRow.appendChild(aColSelect);
        sizeAGroup.appendChild(aSizeRow);
        sizeRow.appendChild(sizeAGroup);

        // Matrix B size
        const sizeBGroup = createElement('div', { className: 'form-group' });
        sizeBGroup.appendChild(createElement('label', { className: 'form-label', textContent: 'Matrix B (rows × cols)' }));
        const bRowSelect = createElement('select', { className: 'form-select', id: 'b-rows', disabled: true });
        const bColSelect = createElement('select', { className: 'form-select', id: 'b-cols' });
        [1, 2, 3, 4, 5].forEach(n => {
            const o1 = createElement('option', { value: String(n), textContent: String(n) });
            const o2 = createElement('option', { value: String(n), textContent: String(n) });
            if (n === colsA) o1.selected = true;
            if (n === colsB) o2.selected = true;
            bRowSelect.appendChild(o1);
            bColSelect.appendChild(o2);
        });
        const bSizeRow = createElement('div', { style: 'display:flex;gap:0.5rem;align-items:center;' });
        bSizeRow.appendChild(bRowSelect);
        bSizeRow.appendChild(createElement('span', { textContent: '×', style: 'font-weight:700;color:#6b7280;' }));
        bSizeRow.appendChild(bColSelect);
        sizeBGroup.appendChild(bSizeRow);
        sizeRow.appendChild(sizeBGroup);

        // Result size display
        const resultSizeGroup = createElement('div', { className: 'form-group' });
        resultSizeGroup.appendChild(createElement('label', { className: 'form-label', textContent: 'Result C' }));
        const resultSizeDisplay = createElement('div', {
            id: 'result-size',
            textContent: `${rowsA} × ${colsB}`,
            style: 'padding:0.75rem;background:#dbeafe;border-radius:0.375rem;text-align:center;font-weight:700;color:#1d4ed8;font-size:1.25rem;'
        });
        resultSizeGroup.appendChild(resultSizeDisplay);
        sizeRow.appendChild(resultSizeGroup);

        toolContent.appendChild(sizeRow);

        // Matrix A grid
        const aContainer = createElement('div', { id: 'matrix-a-container' });
        aContainer.appendChild(createElement('div', {
            style: 'font-weight:700;color:#2563eb;margin-bottom:0.5rem;',
            textContent: 'Matrix A'
        }));
        aContainer.appendChild(buildMatrixGrid(rowsA, colsA, 'A'));
        toolContent.appendChild(aContainer);

        // Multiplication symbol
        toolContent.appendChild(createElement('div', {
            textContent: '×',
            style: 'text-align:center;font-size:1.5rem;font-weight:700;color:#6b7280;margin:0.5rem 0;'
        }));

        // Matrix B grid
        const bContainer = createElement('div', { id: 'matrix-b-container' });
        bContainer.appendChild(createElement('div', {
            style: 'font-weight:700;color:#7c3aed;margin-bottom:0.5rem;',
            textContent: 'Matrix B'
        }));
        bContainer.appendChild(buildMatrixGrid(colsA, colsB, 'B'));
        toolContent.appendChild(bContainer);

        // Buttons
        const btnGroup = createElement('div', { className: 'btn-group' });
        const calcBtn = createElement('button', { id: 'calculate', className: 'btn btn-primary btn-block', textContent: 'Multiply' });
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

    function buildMatrixGrid(rows, cols, name) {
        const container = createElement('div', {});
        const grid = createElement('div', { className: `matrix-grid-${name.toLowerCase()}` });
        grid.style.cssText = `display:grid;grid-template-columns:repeat(${cols},1fr);gap:0.5rem;max-width:${Math.min(cols * 90, 450)}px;margin:0.5rem auto 1rem;`;

        const inputs = [];
        for (let i = 0; i < rows; i++) {
            inputs[i] = [];
            for (let j = 0; j < cols; j++) {
                const defaultVal = (name === 'A' && i === j) ? '1' : '0';
                const input = createElement('input', {
                    type: 'number',
                    className: `matrix-cell-${name.toLowerCase()}`,
                    value: defaultVal,
                    style: 'width:100%;padding:0.5rem;border:2px solid #e5e7eb;border-radius:0.375rem;text-align:center;font-size:1rem;font-family:monospace;transition:border-color 0.2s;',
                    'data-row': String(i),
                    'data-col': String(j)
                });
                input.addEventListener('focus', () => { input.style.borderColor = '#2563eb'; input.select(); });
                input.addEventListener('blur', () => { input.style.borderColor = '#e5e7eb'; });
                grid.appendChild(input);
                inputs[i][j] = input;
            }
        }
        container.appendChild(grid);

        if (name === 'A') matrixAInputs = inputs;
        else matrixBInputs = inputs;

        return container;
    }

    function readMatrix(inputs, rows, cols) {
        const matrix = [];
        for (let i = 0; i < rows; i++) {
            matrix[i] = [];
            for (let j = 0; j < cols; j++) {
                const val = parseFloat(inputs[i][j].value);
                if (isNaN(val)) {
                    throw new Error(`Invalid number at row ${i + 1}, column ${j + 1}`);
                }
                matrix[i][j] = val;
            }
        }
        return matrix;
    }

    // ---- Math functions ----
    function multiplyMatrices(a, b, rowsA, colsA, colsB) {
        const result = [];
        for (let i = 0; i < rowsA; i++) {
            result[i] = [];
            for (let j = 0; j < colsB; j++) {
                let sum = 0;
                for (let k = 0; k < colsA; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    function elementStep(a, b, row, col, sharedDim) {
        const terms = [];
        let sum = 0;
        for (let k = 0; k < sharedDim; k++) {
            terms.push(`${fmt(a[row][k])} × ${fmt(b[k][col])} = ${fmt(a[row][k] * b[k][col])}`);
            sum += a[row][k] * b[k][col];
        }
        return `C[${row + 1}][${col + 1}] = ${terms.join(' + ')} = ${fmt(sum)}`;
    }

    function fmt(v) {
        if (Number.isInteger(v)) return String(v);
        return parseFloat(v.toFixed(6)).toString();
    }

    function renderMatrixGrid(matrix, label, color) {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const wrapper = createElement('div', { style: 'margin:1rem 0;' });
        wrapper.appendChild(createElement('div', {
            style: `font-weight:700;color:${color};margin-bottom:0.5rem;`,
            textContent: label
        }));
        const grid = createElement('div', {
            style: `display:grid;grid-template-columns:repeat(${cols},1fr);gap:0.5rem;max-width:${Math.min(cols * 90, 450)}px;`
        });
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
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
        const p = colsA; // shared dimension
        let matrixA, matrixB;
        try {
            matrixA = readMatrix(matrixAInputs, rowsA, p);
            matrixB = readMatrix(matrixBInputs, p, colsB);
        } catch (e) {
            $('#output').innerHTML = `<span style="color:#ef4444;">${e.message}</span>`;
            return;
        }

        // Validate: cols of A == rows of B
        if (colsA !== p) {
            $('#output').innerHTML = `<span style="color:#ef4444;">Error: Columns of A (${colsA}) must equal rows of B (${p})</span>`;
            return;
        }

        const result = multiplyMatrices(matrixA, matrixB, rowsA, p, colsB);

        const output = $('#output');
        output.innerHTML = '';

        output.appendChild(createElement('div', {
            style: 'font-size:1rem;font-weight:700;color:#2563eb;margin-bottom:0.5rem;',
            textContent: `C = A × B  [${rowsA}×${p}] × [${p}×${colsB}] = [${rowsA}×${colsB}]`
        }));

        output.appendChild(renderMatrixGrid(result, 'Result Matrix C:', '#2563eb'));

        // Show step for C[1][1]
        if (rowsA > 0 && colsB > 0) {
            const stepDiv = createElement('div', {
                style: 'margin-top:1rem;padding:0.75rem;background:#f9fafb;border-radius:0.375rem;border:1px solid #e5e7eb;white-space:pre-wrap;font-family:monospace;font-size:0.875rem;line-height:1.7;'
            });
            stepDiv.appendChild(createElement('div', {
                style: 'font-weight:700;color:#374151;margin-bottom:0.5rem;',
                textContent: 'Example step — element C[1][1]:'
            }));
            stepDiv.appendChild(createElement('div', {
                textContent: elementStep(matrixA, matrixB, 0, 0, p)
            }));
            output.appendChild(stepDiv);
        }
    }

    function clearAll() {
        for (let i = 0; i < rowsA; i++) {
            for (let j = 0; j < colsA; j++) {
                matrixAInputs[i][j].value = (i === j) ? '1' : '0';
            }
        }
        for (let i = 0; i < colsA; i++) {
            for (let j = 0; j < colsB; j++) {
                matrixBInputs[i][j].value = (i === j) ? '1' : '0';
            }
        }
        $('#output').textContent = '-';
    }

    function updateSizes() {
        rowsA = parseInt($('#a-rows').value);
        colsA = parseInt($('#a-cols').value);
        colsB = parseInt($('#b-cols').value);

        Storage.set('mult-rowsA', String(rowsA));
        Storage.set('mult-colsA', String(colsA));
        Storage.set('mult-colsB', String(colsB));

        // Update B rows display
        $('#b-rows').value = String(colsA);

        // Update result size
        const resultSize = $('#result-size');
        if (resultSize) resultSize.textContent = `${rowsA} × ${colsB}`;

        // Rebuild grids
        const aContainer = $('#matrix-a-container');
        if (aContainer) {
            const label = aContainer.querySelector('div');
            aContainer.innerHTML = '';
            if (label) aContainer.appendChild(label);
            aContainer.appendChild(buildMatrixGrid(rowsA, colsA, 'A'));
        }

        const bContainer = $('#matrix-b-container');
        if (bContainer) {
            const label = bContainer.querySelector('div');
            bContainer.innerHTML = '';
            if (label) bContainer.appendChild(label);
            bContainer.appendChild(buildMatrixGrid(colsA, colsB, 'B'));
        }

        $('#output').textContent = '-';
    }

    function bindEvents() {
        $('#a-rows').addEventListener('change', updateSizes);
        $('#a-cols').addEventListener('change', updateSizes);
        $('#b-cols').addEventListener('change', updateSizes);

        $('#calculate').addEventListener('click', calculate);
        $('#clear').addEventListener('click', clearAll);
        $('#copy').addEventListener('click', () => {
            const text = $('#output').textContent;
            if (text && text !== '-') copyToClipboard(text);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.target.classList.contains('matrix-cell-a') || e.target.classList.contains('matrix-cell-b'))) {
                calculate();
            }
        });
    }

    buildUI();
});
