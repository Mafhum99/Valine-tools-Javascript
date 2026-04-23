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
 * Grade Calculator
 * Calculate weighted grade with letter grade and per-assignment breakdown
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Grade Calculator', icon: '📊' });

    const assignmentsContainer = $('#assignments-container');
    const addRowBtn = $('#add-row');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');
    const weightSummaryEl = $('#weight-summary');

    let rowCounter = 0;

    // Create a new assignment row
    function createRow(name = '', score = '', maxScore = '100', weight = '') {
        rowCounter++;
        const rowId = `row-${rowCounter}`;

        const row = createElement('div', { class: 'assignment-row', id: rowId, style: 'display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;' });

        const nameInput = createElement('input', {
            type: 'text',
            placeholder: 'Assignment name',
            value: name,
            class: 'assignment-name',
            style: 'flex:2;min-width:120px;padding:0.5rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;'
        });

        const scoreInput = createElement('input', {
            type: 'number',
            placeholder: 'Score',
            value: score,
            min: '0',
            class: 'assignment-score',
            style: 'flex:1;min-width:80px;padding:0.5rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;'
        });

        const maxScoreInput = createElement('input', {
            type: 'number',
            placeholder: 'Max',
            value: maxScore,
            min: '1',
            class: 'assignment-max',
            style: 'flex:1;min-width:80px;padding:0.5rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;'
        });

        const weightInput = createElement('input', {
            type: 'number',
            placeholder: 'Weight %',
            value: weight,
            min: '0',
            max: '100',
            class: 'assignment-weight',
            style: 'flex:1;min-width:80px;padding:0.5rem;border:1px solid #d1d5db;border-radius:0.375rem;font-size:0.875rem;'
        });

        const removeBtn = createElement('button', {
            type: 'button',
            class: 'remove-row',
            style: 'background:#ef4444;color:#fff;border:none;border-radius:0.375rem;padding:0.5rem 0.75rem;cursor:pointer;font-size:0.875rem;line-height:1;',
            textContent: 'Remove'
        });

        row.appendChild(nameInput);
        row.appendChild(scoreInput);
        row.appendChild(maxScoreInput);
        row.appendChild(weightInput);
        row.appendChild(removeBtn);

        removeBtn.addEventListener('click', () => {
            const rows = $$('.assignment-row');
            if (rows.length <= 1) {
                showToast('At least 1 assignment is required');
                return;
            }
            row.remove();
            updateRemoveButtons();
        });

        return row;
    }

    // Update remove button visibility (disable if only 1 row)
    function updateRemoveButtons() {
        const rows = $$('.assignment-row');
        const removeBtns = $$('.remove-row');
        removeBtns.forEach(btn => {
            btn.style.opacity = rows.length <= 1 ? '0.5' : '1';
            btn.style.pointerEvents = rows.length <= 1 ? 'none' : 'auto';
        });
    }

    // Add row button handler
    addRowBtn.addEventListener('click', () => {
        assignmentsContainer.appendChild(createRow());
        updateRemoveButtons();
        // Focus the name field of the new row
        const newRow = assignmentsContainer.lastElementChild;
        const nameInput = newRow.querySelector('.assignment-name');
        if (nameInput) nameInput.focus();
    });

    // Calculate weighted grade
    function calculate() {
        const rows = $$('.assignment-row');

        if (rows.length === 0) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Add at least 1 assignment</p>';
            return;
        }

        let totalWeight = 0;
        let weightedSum = 0;
        let breakdown = [];
        let errors = [];

        rows.forEach((row, index) => {
            const name = row.querySelector('.assignment-name').value.trim() || `Assignment ${index + 1}`;
            const scoreStr = row.querySelector('.assignment-score').value.trim();
            const maxStr = row.querySelector('.assignment-max').value.trim();
            const weightStr = row.querySelector('.assignment-weight').value.trim();

            if (!scoreStr) {
                errors.push(`"${name}" score is required`);
                return;
            }
            if (!weightStr) {
                errors.push(`"${name}" weight is required`);
                return;
            }

            const score = parseFloat(scoreStr);
            const maxScore = parseFloat(maxStr) || 100;
            const weight = parseFloat(weightStr);

            if (isNaN(score) || score < 0) {
                errors.push(`"${name}" score must be >= 0`);
                return;
            }
            if (isNaN(maxScore) || maxScore <= 0) {
                errors.push(`"${name}" max score must be > 0`);
                return;
            }
            if (score > maxScore) {
                errors.push(`"${name}" score (${score}) cannot exceed max score (${maxScore})`);
                return;
            }
            if (isNaN(weight) || weight < 0) {
                errors.push(`"${name}" weight must be >= 0`);
                return;
            }

            totalWeight += weight;
            const pct = (score / maxScore) * 100;
            const contribution = pct * (weight / 100);
            weightedSum += contribution;

            breakdown.push({
                name,
                score,
                maxScore,
                weight,
                pct,
                contribution
            });
        });

        if (errors.length > 0) {
            outputEl.innerHTML = errors.map(e => `<p style="color:#ef4444;">${e}</p>`).join('');
            return;
        }

        // Validate weights sum to approximately 100
        const weightDiff = Math.abs(totalWeight - 100);
        if (weightDiff > 0.5) {
            outputEl.innerHTML = `<p style="color:#ef4444;">Weights must sum to approximately 100% (currently ${formatNumber(totalWeight, 1)}%). Difference: ${formatNumber(weightDiff, 1)}%</p>`;
            return;
        }

        // Determine letter grade
        let letterGrade, gradeColor;
        if (weightedSum >= 90) { letterGrade = 'A'; gradeColor = '#22c55e'; }
        else if (weightedSum >= 80) { letterGrade = 'B'; gradeColor = '#3b82f6'; }
        else if (weightedSum >= 70) { letterGrade = 'C'; gradeColor = '#f59e0b'; }
        else if (weightedSum >= 60) { letterGrade = 'D'; gradeColor = '#f97316'; }
        else { letterGrade = 'F'; gradeColor = '#ef4444'; }

        // Build raw text for copying
        let rawText = `Grade Calculator Results:\n`;
        rawText += `Final Weighted Grade: ${formatNumber(weightedSum, 1)}%\n`;
        rawText += `Letter Grade: ${letterGrade}\n\n`;
        rawText += `Breakdown:\n`;
        breakdown.forEach(b => {
            rawText += `- ${b.name}: ${formatNumber(b.score, 1)}/${formatNumber(b.maxScore, 1)} (${formatNumber(b.pct, 1)}%) - Weight: ${formatNumber(b.weight, 1)}%\n`;
        });

        // Build breakdown rows
        const breakdownRows = breakdown.map(b =>
            `<tr style="border-bottom:1px solid #e5e7eb;">
                <td style="padding:0.5rem;font-size:0.875rem;">${b.name}</td>
                <td style="padding:0.5rem;font-size:0.875rem;text-align:center;">${formatNumber(b.score, 1)} / ${formatNumber(b.maxScore, 1)}</td>
                <td style="padding:0.5rem;font-size:0.875rem;text-align:center;">${formatNumber(b.pct, 1)}%</td>
                <td style="padding:0.5rem;font-size:0.875rem;text-align:center;">${formatNumber(b.weight, 1)}%</td>
                <td style="padding:0.5rem;font-size:0.875rem;text-align:center;color:${b.contribution >= 0 ? '#22c55e' : '#ef4444'};">${formatNumber(b.contribution, 2)}%</td>
            </tr>`
        ).join('');

        outputEl.innerHTML = `
            <div style="text-align:center;margin-bottom:1rem;">
                <div style="font-size:2.5rem;font-weight:700;color:${gradeColor};">${formatNumber(weightedSum, 1)}%</div>
                <div style="font-size:1.25rem;font-weight:700;color:${gradeColor};margin-top:0.25rem;">Grade: ${letterGrade}</div>
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="background:#f3f4f6;">
                            <th style="padding:0.5rem;font-size:0.75rem;text-transform:uppercase;text-align:left;color:#6b7280;">Assignment</th>
                            <th style="padding:0.5rem;font-size:0.75rem;text-transform:uppercase;text-align:center;color:#6b7280;">Score</th>
                            <th style="padding:0.5rem;font-size:0.75rem;text-transform:uppercase;text-align:center;color:#6b7280;">%</th>
                            <th style="padding:0.5rem;font-size:0.75rem;text-transform:uppercase;text-align:center;color:#6b7280;">Weight</th>
                            <th style="padding:0.5rem;font-size:0.75rem;text-transform:uppercase;text-align:center;color:#6b7280;">Contrib.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${breakdownRows}
                    </tbody>
                </table>
            </div>
        `;
        outputEl.dataset.rawResult = rawText;

        if (weightSummaryEl) {
            weightSummaryEl.textContent = `Total weight: ${formatNumber(totalWeight, 1)}%`;
        }
    }

    function clear() {
        assignmentsContainer.innerHTML = '';
        rowCounter = 0;
        assignmentsContainer.appendChild(createRow());
        updateRemoveButtons();
        outputEl.innerHTML = '<p style="color:#9ca3af;">Enter your assignment grades and click Calculate</p>';
        delete outputEl.dataset.rawResult;
        if (weightSummaryEl) weightSummaryEl.textContent = '';
    }

    // Initialize with one row
    assignmentsContainer.appendChild(createRow());
    updateRemoveButtons();

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const textToCopy = outputEl.dataset.rawResult || outputEl.textContent;
            if (textToCopy === '-') return;
            copyToClipboard(textToCopy);
        });
    }

    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
