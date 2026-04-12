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
 * BMR Calculator
 * Calculate basal metabolic rate using Mifflin-St Jeor and Harris-Benedict formulas
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'BMR Calculator', icon: '🔥' });

    const ageEl = $('#age');
    const weightEl = $('#weight');
    const weightUnitEl = $('#weight-unit');
    const heightCmEl = $('#height-cm');
    const heightFtEl = $('#height-ft');
    const heightInEl = $('#height-in');
    const heightUnitEl = $('#height-unit');
    const heightMetricDiv = $('#height-metric');
    const heightImperialDiv = $('#height-imperial');
    const activityEl = $('#activity');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Toggle height input mode
    function updateHeightInput() {
        if (heightUnitEl.value === 'ft') {
            heightMetricDiv.style.display = 'none';
            heightImperialDiv.style.display = 'flex';
        } else {
            heightMetricDiv.style.display = 'flex';
            heightImperialDiv.style.display = 'none';
        }
    }

    heightUnitEl.addEventListener('change', updateHeightInput);

    function getGender() {
        return document.querySelector('input[name="gender"]:checked')?.value || 'male';
    }

    function calculate() {
        const ageVal = ageEl.value;
        const weightVal = weightEl.value;

        if (ageVal === '') {
            outputEl.textContent = 'Age is required';
            return;
        }
        if (weightVal === '') {
            outputEl.textContent = 'Weight is required';
            return;
        }

        const age = Number(ageVal);
        if (!Number.isInteger(age) || age < 15 || age > 100) {
            outputEl.textContent = 'Age must be an integer between 15 and 100';
            return;
        }

        let weightKg = Number(weightVal);
        if (isNaN(weightKg) || weightKg <= 0) {
            outputEl.textContent = 'Weight must be a positive number';
            return;
        }

        // Convert weight to kg
        if (weightUnitEl.value === 'lbs') {
            weightKg = weightKg * 0.453592;
        }

        if (weightKg >= 500) {
            outputEl.textContent = 'Weight must be less than 500 kg';
            return;
        }

        // Get height in cm
        let heightCm = 0;
        if (heightUnitEl.value === 'cm') {
            const heightCmVal = heightCmEl.value;
            if (heightCmVal === '') {
                outputEl.textContent = 'Height is required';
                return;
            }
            heightCm = Number(heightCmVal);
            if (isNaN(heightCm) || heightCm <= 0) {
                outputEl.textContent = 'Height must be a positive number';
                return;
            }
        } else {
            const ftVal = Number(heightFtEl.value);
            const inVal = Number(heightInEl.value);
            if (heightFtEl.value === '' && heightInEl.value === '') {
                outputEl.textContent = 'Height is required';
                return;
            }
            if ((heightFtEl.value !== '' && isNaN(ftVal)) || (heightInEl.value !== '' && isNaN(inVal))) {
                outputEl.textContent = 'Height values must be valid numbers';
                return;
            }
            const totalInches = ftVal * 12 + inVal;
            if (totalInches <= 0) {
                outputEl.textContent = 'Total height must be greater than 0';
                return;
            }
            heightCm = totalInches * 2.54;
        }

        if (heightCm >= 300) {
            outputEl.textContent = 'Height must be less than 300 cm';
            return;
        }

        try {
            const gender = getGender();
            const activityMultiplier = Number(activityEl.value);

            // Mifflin-St Jeor Equation
            let bmrMifflin;
            if (gender === 'male') {
                bmrMifflin = (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
            } else {
                bmrMifflin = (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
            }

            // Harris-Benedict Equation
            let bmrHarris;
            if (gender === 'male') {
                bmrHarris = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
            } else {
                bmrHarris = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
            }

            // Use Mifflin-St Jeor as primary (more accurate)
            const bmr = bmrMifflin;
            const tdee = bmr * activityMultiplier;

            // Calorie goals
            const weightLoss = tdee - 500;
            const maintenance = tdee;
            const weightGain = tdee + 500;

            // Activity label
            const activityLabel = activityEl.options[activityEl.selectedIndex].text;

            outputEl.innerHTML = `
                <div style="text-align:left;">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.75rem;">
                        <div style="padding:0.75rem;background:#f0f9ff;border-radius:0.375rem;text-align:center;border:2px solid #3b82f6;">
                            <div style="font-size:0.625rem;color:#6b7280;text-transform:uppercase;font-weight:600;">BMR (Mifflin-St Jeor)</div>
                            <div style="font-size:1.5rem;font-weight:700;color:#3b82f6;">${formatNumber(bmr, 0)}</div>
                            <div style="font-size:0.625rem;color:#6b7280;">cal/day</div>
                        </div>
                        <div style="padding:0.75rem;background:#fef3c7;border-radius:0.375rem;text-align:center;border:2px solid #f59e0b;">
                            <div style="font-size:0.625rem;color:#6b7280;text-transform:uppercase;font-weight:600;">TDEE</div>
                            <div style="font-size:1.5rem;font-weight:700;color:#f59e0b;">${formatNumber(tdee, 0)}</div>
                            <div style="font-size:0.625rem;color:#6b7280;">cal/day</div>
                        </div>
                    </div>

                    <div style="padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;margin-bottom:0.5rem;">
                        <div style="font-size:0.625rem;color:#6b7280;font-weight:600;">BMR (Harris-Benedict)</div>
                        <div style="font-weight:600;">${formatNumber(bmrHarris, 0)} cal/day</div>
                    </div>

                    <div style="padding:0.5rem;background:#f3f4f6;border-radius:0.375rem;margin-bottom:0.75rem;">
                        <div style="font-size:0.625rem;color:#6b7280;font-weight:600;">Activity Level</div>
                        <div style="font-size:0.875rem;">${activityLabel}</div>
                    </div>

                    <div style="font-size:0.75rem;color:#6b7280;font-weight:600;text-transform:uppercase;margin-bottom:0.5rem;">Daily Calorie Goals</div>
                    <div style="display:flex;flex-direction:column;gap:0.375rem;">
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;background:#dcfce7;border-radius:0.375rem;">
                            <span style="font-size:0.875rem;font-weight:600;color:#16a34a;">📉 Weight Loss</span>
                            <span style="font-weight:700;color:#16a34a;">${formatNumber(weightLoss, 0)} cal</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;background:#fef3c7;border-radius:0.375rem;">
                            <span style="font-size:0.875rem;font-weight:600;color:#ca8a04;">⚖️ Maintenance</span>
                            <span style="font-weight:700;color:#ca8a04;">${formatNumber(maintenance, 0)} cal</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:0.5rem 0.75rem;background:#fee2e2;border-radius:0.375rem;">
                            <span style="font-size:0.875rem;font-weight:600;color:#dc2626;">📈 Weight Gain</span>
                            <span style="font-weight:700;color:#dc2626;">${formatNumber(weightGain, 0)} cal</span>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        ageEl.value = '';
        weightEl.value = '';
        weightUnitEl.value = 'kg';
        heightCmEl.value = '';
        heightFtEl.value = '';
        heightInEl.value = '';
        heightUnitEl.value = 'cm';
        heightMetricDiv.style.display = 'flex';
        heightImperialDiv.style.display = 'none';
        activityEl.value = '1.55';
        document.querySelector('input[name="gender"][value="male"]').checked = true;
        outputEl.textContent = '-';
        ageEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    // Enter key support
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            calculate();
        }
    });
});
