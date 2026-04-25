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
 * Ideal Weight Calculator
 * Devine, Robinson, and Miller formulas
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Ideal Weight Calculator', icon: '⚖️' });

    const genderMaleEl = $('#gender-male');
    const genderFemaleEl = $('#gender-female');
    const heightEl = $('#height');
    const unitEl = $('#unit');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    function calculate() {
        const heightStr = heightEl.value.trim();
        const isMale = genderMaleEl.checked;
        const isFemale = genderFemaleEl.checked;
        const unit = unitEl.value; // 'cm' or 'in'

        // Validate gender selection
        if (!isMale && !isFemale) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Please select a gender</p>';
            return;
        }

        // Validate height
        if (!heightStr) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Height is required</p>';
            return;
        }

        let heightCm = parseFloat(heightStr);
        if (isNaN(heightCm) || heightCm <= 0) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Height must be a positive number</p>';
            return;
        }

        // Convert to inches if in cm
        let heightIn = heightCm;
        if (unit === 'cm') {
            heightIn = heightCm / 2.54;
        }

        // Validate minimum height (must be over 5 feet = 60 inches)
        if (heightIn < 60) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Height must be at least 5 feet (60 inches / 152.4 cm) for these formulas</p>';
            return;
        }

        try {
            // Inches over 5 feet
            const over5ft = heightIn - 60;

            let devineKg, robinsonKg, millerKg;

            if (isMale) {
                // Devine: M = 50 + 2.3 * over5ft
                devineKg = 50 + 2.3 * over5ft;
                // Robinson: M = 52 + 1.9 * over5ft
                robinsonKg = 52 + 1.9 * over5ft;
                // Miller: M = 56.2 + 1.41 * over5ft
                millerKg = 56.2 + 1.41 * over5ft;
            } else {
                // Devine: F = 45.5 + 2.3 * over5ft
                devineKg = 45.5 + 2.3 * over5ft;
                // Robinson: F = 49 + 1.7 * over5ft
                robinsonKg = 49 + 1.7 * over5ft;
                // Miller: F = 53.1 + 1.36 * over5ft
                millerKg = 53.1 + 1.36 * over5ft;
            }

            // Convert kg to lbs (1 kg = 2.20462 lbs)
            const kgToLbs = 2.20462;
            const devineLbs = devineKg * kgToLbs;
            const robinsonLbs = robinsonKg * kgToLbs;
            const millerLbs = millerKg * kgToLbs;

            // Average across all formulas
            const avgKg = (devineKg + robinsonKg + millerKg) / 3;
            const avgLbs = avgKg * kgToLbs;

            const genderLabel = isMale ? 'Male' : 'Female';
            const heightDisplay = unit === 'cm'
                ? `${formatNumber(heightCm, 1)} cm`
                : `${formatNumber(heightIn, 1)} inches`;

            const formulas = [
                {
                    name: 'Devine',
                    year: '1974',
                    kg: devineKg,
                    lbs: devineLbs,
                    formula: isMale
                        ? `50 + 2.3 * ${formatNumber(over5ft, 1)}`
                        : `45.5 + 2.3 * ${formatNumber(over5ft, 1)}`,
                    color: '#22c55e'
                },
                {
                    name: 'Robinson',
                    year: '1983',
                    kg: robinsonKg,
                    lbs: robinsonLbs,
                    formula: isMale
                        ? `52 + 1.9 * ${formatNumber(over5ft, 1)}`
                        : `49 + 1.7 * ${formatNumber(over5ft, 1)}`,
                    color: '#3b82f6'
                },
                {
                    name: 'Miller',
                    year: '1983',
                    kg: millerKg,
                    lbs: millerLbs,
                    formula: isMale
                        ? `56.2 + 1.41 * ${formatNumber(over5ft, 1)}`
                        : `53.1 + 1.36 * ${formatNumber(over5ft, 1)}`,
                    color: '#8b5cf6'
                }
            ];

            const cards = formulas.map(f => `
                <div style="padding:0.75rem;background:#f9fafb;border-radius:0.5rem;border-left:3px solid ${f.color};">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">
                        <div>
                            <div style="font-weight:700;font-size:1rem;">${f.name}</div>
                            <div style="font-size:0.625rem;color:#9ca3af;">${f.year}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-family:monospace;font-size:0.75rem;color:#6b7280;">${f.formula}</div>
                        </div>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div style="font-size:1.25rem;font-weight:700;color:${f.color};">${formatNumber(f.kg, 1)} kg</div>
                        <div style="font-size:1.125rem;font-weight:600;color:#6b7280;">${formatNumber(f.lbs, 1)} lbs</div>
                    </div>
                </div>
            `).join('');

            outputEl.innerHTML = `
                <div style="text-align:center;margin-bottom:1rem;">
                    <div style="font-size:1rem;color:#6b7280;">${genderLabel} | Height: ${heightDisplay}</div>
                    <div style="font-size:0.75rem;color:#9ca3af;">Over 5ft: ${formatNumber(over5ft, 1)} inches</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:0.5rem;">
                    ${cards}
                </div>
                <div style="margin-top:1rem;padding:0.75rem;background:#eff6ff;border-radius:0.5rem;text-align:center;">
                    <div style="font-size:0.625rem;text-transform:uppercase;color:#6b7280;font-weight:600;">Average (All Formulas)</div>
                    <div style="font-size:1.5rem;font-weight:700;color:#3b82f6;margin-top:0.25rem;">${formatNumber(avgKg, 1)} kg / ${formatNumber(avgLbs, 1)} lbs</div>
                </div>
            `;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        genderMaleEl.checked = true;
        genderFemaleEl.checked = false;
        heightEl.value = '';
        unitEl.value = 'cm';
        outputEl.innerHTML = '<p style="color:#9ca3af;">Enter your gender and height to calculate ideal weight</p>';
        heightEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const height = heightEl.value;
            if (!height) return;
            
            const results = Array.from(outputEl.querySelectorAll('div > div > div > div:first-child'))
                .filter(el => el.textContent && !el.textContent.includes('|'))
                .map(el => {
                    const name = el.textContent;
                    const val = el.parentElement.nextElementSibling ? el.parentElement.nextElementSibling.textContent.trim() : '';
                    return val ? `${name}: ${val}` : '';
                }).filter(s => s).join('\n');
                
            const avg = outputEl.querySelector('div[style*="background:#eff6ff"] div:last-child')?.textContent || '';
            
            const text = `Ideal Weight Calculator\nHeight: ${height} ${unitEl.value}\n\n${results}\n\nAverage: ${avg}`;
            copyToClipboard(text);
        });
    }

    heightEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
