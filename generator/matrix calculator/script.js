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
// Matrix Math Logic
// ========================================
const MatrixMath = {
    add(a, b) {
        return a.map((row, i) => row.map((val, j) => val + b[i][j]));
    },
    subtract(a, b) {
        return a.map((row, i) => row.map((val, j) => val - b[i][j]));
    },
    multiply(a, b) {
        const result = Array(a.length).fill(0).map(() => Array(b[0].length).fill(0));
        for (let i = 0; i < a.length; i++) {
            for (let j = 0; j < b[0].length; j++) {
                for (let k = 0; k < a[0].length; k++) {
                    result[i][j] += a[i][k] * b[k][j];
                }
            }
        }
        return result;
    },
    transpose(a) {
        return a[0].map((_, colIndex) => a.map(row => row[colIndex]));
    },
    scalarMultiply(a, k) {
        return a.map(row => row.map(val => val * k));
    },
    determinant(m) {
        if (m.length === 1) return m[0][0];
        if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
        let det = 0;
        for (let i = 0; i < m[0].length; i++) {
            det += Math.pow(-1, i) * m[0][i] * this.determinant(this.minor(m, 0, i));
        }
        return det;
    },
    minor(m, row, col) {
        return m.filter((_, i) => i !== row).map(r => r.filter((_, j) => j !== col));
    },
    inverse(m) {
        const det = this.determinant(m);
        if (det === 0) throw new Error('Matrix is singular (determinant is 0) and cannot be inversed.');
        const size = m.length;
        if (size === 1) return [[1 / det]];
        const adjugate = m.map((row, i) => 
            row.map((_, j) => Math.pow(-1, i + j) * this.determinant(this.minor(m, i, j)))
        );
        return this.transpose(adjugate).map(row => row.map(val => val / det));
    }
};

// ========================================
// Tool Logic
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const matrixSizeSelect = $('#matrix-size');
    const operationSelect = $('#operation');
    const matrixAGrid = $('#matrix-a-grid');
    const matrixBGrid = $('#matrix-b-grid');
    const matrixBInputs = $('#matrix-b-inputs');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const outputEl = $('#output');
    const copyBtn = $('#copy');

    function createGrid(container, size, prefix) {
        container.innerHTML = '';
        container.style.gridTemplateColumns = `repeat(${size}, auto)`;
        container.style.justifyContent = 'center';
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const input = createElement('input', {
                    type: 'number',
                    className: 'matrix-input',
                    id: `${prefix}-${i}-${j}`,
                    value: '0',
                    step: 'any'
                });
                container.appendChild(input);
            }
        }
    }

    function getMatrixValues(prefix, size) {
        const matrix = [];
        for (let i = 0; i < size; i++) {
            const row = [];
            for (let j = 0; j < size; j++) {
                const val = parseFloat($(`#${prefix}-${i}-${j}`).value) || 0;
                row.push(val);
            }
            matrix.push(row);
        }
        return matrix;
    }

    function renderMatrix(matrix) {
        if (typeof matrix === 'number') return matrix.toString();
        
        const grid = createElement('div', { 
            className: 'matrix-display',
            style: `grid-template-columns: repeat(${matrix[0].length}, auto)`
        });
        
        matrix.forEach(row => {
            row.forEach(val => {
                grid.appendChild(createElement('div', { 
                    className: 'matrix-cell',
                    textContent: Number.isInteger(val) ? val.toString() : val.toFixed(2)
                }));
            });
        });
        
        const container = createElement('div', { className: 'matrix-result-container' });
        container.appendChild(grid);
        return container.innerHTML;
    }

    function updateGrids() {
        const size = parseInt(matrixSizeSelect.value);
        createGrid(matrixAGrid, size, 'a');
        createGrid(matrixBGrid, size, 'b');
    }

    function updateVisibility() {
        const op = operationSelect.value;
        if (op === 'transpose-a' || op === 'determinant-a' || op === 'inverse-a' || op === 'scalar') {
            matrixBInputs.classList.add('hidden');
        } else {
            matrixBInputs.classList.remove('hidden');
        }
    }

    matrixSizeSelect.addEventListener('change', updateGrids);
    operationSelect.addEventListener('change', updateVisibility);

    calculateBtn.addEventListener('click', () => {
        const size = parseInt(matrixSizeSelect.value);
        const op = operationSelect.value;
        const a = getMatrixValues('a', size);
        
        try {
            let result;
            let outputTitle = '';
            
            switch (op) {
                case 'add':
                    result = MatrixMath.add(a, getMatrixValues('b', size));
                    outputTitle = 'A + B =';
                    break;
                case 'subtract':
                    result = MatrixMath.subtract(a, getMatrixValues('b', size));
                    outputTitle = 'A - B =';
                    break;
                case 'multiply':
                    result = MatrixMath.multiply(a, getMatrixValues('b', size));
                    outputTitle = 'A x B =';
                    break;
                case 'transpose-a':
                    result = MatrixMath.transpose(a);
                    outputTitle = 'Transpose(A) =';
                    break;
                case 'transpose-b':
                    result = MatrixMath.transpose(getMatrixValues('b', size));
                    outputTitle = 'Transpose(B) =';
                    break;
                case 'determinant-a':
                    result = MatrixMath.determinant(a);
                    outputTitle = 'det(A) =';
                    break;
                case 'inverse-a':
                    result = MatrixMath.inverse(a);
                    outputTitle = 'A⁻¹ =';
                    break;
                case 'scalar':
                    const k = parseFloat(prompt('Enter scalar value (k):', '1')) || 0;
                    result = MatrixMath.scalarMultiply(a, k);
                    outputTitle = `${k} x A =`;
                    break;
            }
            
            outputEl.innerHTML = `<div style="margin-bottom:0.5rem; font-weight:bold;">${outputTitle}</div>` + renderMatrix(result);
        } catch (error) {
            outputEl.innerHTML = `<span style="color:var(--danger)">${error.message}</span>`;
        }
    });

    clearBtn.addEventListener('click', () => {
        updateGrids();
        outputEl.textContent = '-';
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    // Initial load
    updateGrids();
    updateVisibility();
});
