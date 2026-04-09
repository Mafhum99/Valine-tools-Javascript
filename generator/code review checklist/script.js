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
 * 675 - Code Review Checklist
 * Generate code review checklists
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Code Review Checklist', icon: '🔍' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateCodeReview(input) {
        const reviewId = `CR-${Date.now().toString(36).toUpperCase()}`;
        const parts = input.split(',').map(p => p.trim()).filter(p => p);
        const feature = parts[0] || 'General code review';
        const language = parts[1] || 'General';

        let output = `CODE REVIEW CHECKLIST\n`;
        output += `${'═'.repeat(60)}\n`;
        output += `Feature/PR: ${titleCase(feature)}\n`;
        output += `Language: ${language}\n`;
        output += `ID: ${reviewId}\n`;
        output += `Date: ${new Date().toLocaleDateString()}\n`;
        output += `Reviewer: [Your Name]\n`;
        output += `${'═'.repeat(60)}\n\n`;

        // 1. Functionality
        output += `1️⃣  FUNCTIONALITY\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Does the code do what it's supposed to do?\n`;
        output += `  [ ] Are all requirements met?\n`;
        output += `  [ ] Are edge cases handled? (empty input, null, errors)\n`;
        output += `  [ ] Is error handling adequate and appropriate?\n`;
        output += `  [ ] Are there any logic errors or bugs?\n`;
        output += `  [ ] Does it handle failure modes gracefully?\n`;
        output += `  [ ] Are there any race conditions or concurrency issues?\n\n`;

        // 2. Code Quality
        output += `2️⃣  CODE QUALITY\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Is the code clear and readable?\n`;
        output += `  [ ] Are naming conventions consistent and descriptive?\n`;
        output += `  [ ] Is the code DRY (no unnecessary duplication)?\n`;
        output += `  [ ] Is the code appropriately modular and separated?\n`;
        output += `  [ ] Are functions/methods reasonably sized?\n`;
        output += `  [ ] Is complexity minimized?\n`;
        output += `  [ ] Are there appropriate comments for non-obvious code?\n`;
        output += `  [ ] Is the code consistent with project style?\n\n`;

        // 3. Security
        output += `3️⃣  SECURITY\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Is user input validated and sanitized?\n`;
        output += `  [ ] Are there any SQL/NoSQL injection vulnerabilities?\n`;
        output += `  [ ] Are there any XSS vulnerabilities?\n`;
        output += `  [ ] Are authentication and authorization checks in place?\n`;
        output += `  [ ] Are secrets/credentials properly managed (not hardcoded)?\n`;
        output += `  [ ] Is sensitive data encrypted at rest and in transit?\n`;
        output += `  [ ] Are API endpoints protected appropriately?\n`;
        output += `  [ ] Is there any information leakage in error messages?\n\n`;

        // 4. Performance
        output += `4️⃣  PERFORMANCE\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Are database queries optimized?\n`;
        output += `  [ ] Is there appropriate indexing on queried fields?\n`;
        output += `  [ ] Are there any N+1 query problems?\n`;
        output += `  [ ] Is caching used appropriately?\n`;
        output += `  [ ] Are large datasets handled efficiently?\n`;
        output += `  [ ] Is memory usage reasonable?\n`;
        output += `  [ ] Are there any obvious bottlenecks?\n`;
        output += `  [ ] Is async processing used where appropriate?\n\n`;

        // 5. Testing
        output += `5️⃣  TESTING\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Are unit tests included for new/changed code?\n`;
        output += `  [ ] Do tests cover edge cases and error paths?\n`;
        output += `  [ ] Are test names descriptive and meaningful?\n`;
        output += `  [ ] Do all tests pass?\n`;
        output += `  [ ] Is test coverage maintained or improved?\n`;
        output += `  [ ] Are integration tests included where needed?\n`;
        output += `  [ ] Are mocks/stubs used appropriately in tests?\n\n`;

        // 6. Documentation
        output += `6️⃣  DOCUMENTATION\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Is the README updated (if applicable)?\n`;
        output += `  [ ] Are API changes documented?\n`;
        output += `  [ ] Are complex algorithms explained?\n`;
        output += `  [ ] Are public APIs documented?\n`;
        output += `  [ ] Are configuration changes documented?\n`;
        output += `  [ ] Are deployment/operational procedures updated?\n\n`;

        // 7. Maintainability
        output += `7️⃣  MAINTAINABILITY\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Will this code be easy to modify in the future?\n`;
        output += `  [ ] Are dependencies reasonable (no unnecessary additions)?\n`;
        output += `  [ ] Is there appropriate logging for debugging?\n`;
        output += `  [ ] Are configuration values externalized?\n`;
        output += `  [ ] Are magic numbers/strings replaced with constants?\n`;
        output += `  [ ] Is the code testable (proper separation of concerns)?\n\n`;

        // 8. Compatibility
        output += `8️⃣  COMPATIBILITY\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Is it backwards compatible?\n`;
        output += `  [ ] Are deprecation paths provided (if applicable)?\n`;
        output += `  [ ] Does it work across supported browsers/platforms?\n`;
        output += `  [ ] Are API version changes handled?\n`;
        output += `  [ ] Does it work with current dependency versions?\n\n`;

        // 9. Architecture
        output += `9️⃣  ARCHITECTURE\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `  [ ] Does the change fit the existing architecture?\n`;
        output += `  [ ] Are design patterns used appropriately?\n`;
        output += `  [ ] Is there tight coupling that should be loosened?\n`;
        output += `  [ ] Are interfaces/contracts well-defined?\n`;
        output += `  [ ] Would this scale for future requirements?\n\n`;

        // Summary
        output += `${'═'.repeat(60)}\n`;
        output += `REVIEW SUMMARY\n`;
        output += `${'═'.repeat(60)}\n\n`;
        output += `Overall Assessment:\n`;
        output += `  [ ] ✅ Approved - Ready to merge\n`;
        output += `  [ ] 🟡 Approved with minor suggestions (non-blocking)\n`;
        output += `  [ ] 🟠 Changes requested - Please address before merge\n`;
        output += `  [ ] 🔴 Major issues - Significant rework needed\n\n`;

        output += `Key Findings:\n`;
        output += `  1. [Most important observation]\n`;
        output += `  2. [Second most important]\n`;
        output += `  3. [Third observation]\n\n`;

        output += `Suggestions:\n`;
        output += `  1. [Actionable suggestion]\n`;
        output += `  2. [Actionable suggestion]\n\n`;

        output += `Reviewer: _________________  Date: _____________\n\n`;

        output += `${'─'.repeat(60)}\n`;
        output += `REVIEW TIPS:\n`;
        output += `  - Review for understanding before critiquing\n`;
        output += `  - Be constructive and specific in feedback\n`;
        output += `  - Praise good code, not just problems\n`;
        output += `  - Ask questions rather than making demands\n`;
        output += `  - Limit reviews to 200-400 lines at a time\n`;
        output += `  - Take breaks during long reviews\n\n`;
        output += `${'═'.repeat(60)}\n`;
        output += `Code Review ID: ${reviewId}\n`;
        output += `End of Review Checklist - ${reviewId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Enter feature name and language (e.g., "User authentication module, TypeScript" or "Payment API")'; return; }
        try {
            outputEl.textContent = generateCodeReview(input);
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
