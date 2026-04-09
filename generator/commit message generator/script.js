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
 * 673 - Commit Message Generator
 * Generate conventional commit messages
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Commit Message Generator', icon: '💬' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const commitTypes = {
        feat: { emoji: '✨', description: 'A new feature', example: 'feat: add user authentication endpoint' },
        fix: { emoji: '🐛', description: 'A bug fix', example: 'fix: resolve null pointer in payment processing' },
        docs: { emoji: '📝', description: 'Documentation changes', example: 'docs: update API reference with new parameters' },
        style: { emoji: '💄', description: 'Code style changes (formatting, semicolons, etc)', example: 'style: format code with prettier rules' },
        refactor: { emoji: '♻️', description: 'Code refactoring', example: 'refactor: extract validation logic into separate module' },
        perf: { emoji: '⚡', description: 'Performance improvements', example: 'perf: optimize database query reducing load time by 40%' },
        test: { emoji: '🧪', description: 'Adding or updating tests', example: 'test: add integration tests for user registration flow' },
        build: { emoji: '📦', description: 'Build system or external dependencies', example: 'build: upgrade webpack from v4 to v5' },
        ci: { emoji: '🔧', description: 'CI/CD configuration changes', example: 'ci: add automated deployment to staging environment' },
        chore: { emoji: '🔨', description: 'Other changes that don\'t modify src or tests', example: 'chore: update .gitignore with IDE files' },
        revert: { emoji: '⏪', description: 'Reverting a previous commit', example: 'revert: revert commit abc123 (caused regression)' },
        security: { emoji: '🔒', description: 'Security-related changes', example: 'security: patch XSS vulnerability in comment rendering' }
    };

    const scopes = ['auth', 'api', 'ui', 'db', 'core', 'utils', 'config', 'tests', 'docs', 'build', 'deploy', 'user', 'payment', 'notification', 'search', 'upload'];

    function generateCommitMessages(input) {
        const commitId = `CM-${Date.now().toString(36).toUpperCase()}`;
        const parts = input.split(',').map(p => p.trim()).filter(p => p);
        const change = parts[0] || 'general code changes';
        const scope = parts[1] || '';
        const isBreaking = parts[2] || false;

        let output = `COMMIT MESSAGE GENERATOR\n`;
        output += `${'═'.repeat(60)}\n`;
        output += `Change: ${change}\n`;
        output += `ID: ${commitId}\n`;
        output += `${'═'.repeat(60)}\n\n`;

        output += `CONVENTIONAL COMMIT MESSAGES\n`;
        output += `${'═'.repeat(60)}\n\n`;

        // Determine relevant types based on input
        const changeLower = change.toLowerCase();
        let relevantTypes = [];

        if (changeLower.includes('feature') || changeLower.includes('add') || changeLower.includes('new') || changeLower.includes('implement')) {
            relevantTypes.push('feat');
        }
        if (changeLower.includes('fix') || changeLower.includes('bug') || changeLower.includes('resolve') || changeLower.includes('patch') || changeLower.includes('repair')) {
            relevantTypes.push('fix');
        }
        if (changeLower.includes('doc') || changeLower.includes('readme') || changeLower.includes('comment')) {
            relevantTypes.push('docs');
        }
        if (changeLower.includes('refactor') || changeLower.includes('restructure') || changeLower.includes('reorganize') || changeLower.includes('clean')) {
            relevantTypes.push('refactor');
        }
        if (changeLower.includes('perf') || changeLower.includes('optim') || changeLower.includes('faster') || changeLower.includes('speed') || changeLower.includes('improve')) {
            relevantTypes.push('perf');
        }
        if (changeLower.includes('test') || changeLower.includes('spec')) {
            relevantTypes.push('test');
        }
        if (changeLower.includes('security') || changeLower.includes('vuln') || changeLower.includes('patch')) {
            relevantTypes.push('security');
        }
        if (changeLower.includes('style') || changeLower.includes('format') || changeLower.includes('lint')) {
            relevantTypes.push('style');
        }
        if (changeLower.includes('build') || changeLower.includes('depend') || changeLower.includes('upgrade') || changeLower.includes('package')) {
            relevantTypes.push('build');
        }
        if (changeLower.includes('ci') || changeLower.includes('pipeline') || changeLower.includes('deploy')) {
            relevantTypes.push('ci');
        }

        // Default: suggest multiple options
        if (!relevantTypes.length) {
            relevantTypes = ['feat', 'fix', 'refactor', 'chore', 'perf', 'docs'];
        }

        const breakingChar = isBreaking ? '!' : '';

        output += `RECOMMENDED COMMIT MESSAGES\n`;
        output += `${'─'.repeat(60)}\n\n`;

        relevantTypes.forEach((type, i) => {
            const info = commitTypes[type];
            const scopeStr = scope ? `(${scope})` : '';
            const subject = change.charAt(0).toLowerCase() + change.slice(1);
            const breakingNote = isBreaking ? '\n\nBREAKING CHANGE: This change may require migration or configuration updates.' : '';

            output += `${i + 1}. ${info.emoji} ${type}${scopeStr}${breakingChar}: ${subject}\n`;
            output += `   Type: ${info.description}\n`;
            output += `   Format: Conventional Commits 1.0.0\n\n`;
        });

        output += `${'─'.repeat(60)}\n`;
        output += `DETAILED COMMIT TEMPLATE\n`;
        output += `${'─'.repeat(60)}\n\n`;

        const primaryType = relevantTypes[0];
        const primaryInfo = commitTypes[primaryType];
        const scopeStr = scope ? `(${scope})` : '';
        const subject = change.charAt(0).toLowerCase() + change.slice(1);

        output += `${primaryInfo.emoji} ${primaryType}${scopeStr}${breakingChar}: ${subject}\n\n`;
        output += `More detailed description of the change:\n`;
        output += `- What was changed and why\n`;
        output += `- Any relevant context or background\n`;
        output += `- How this affects users/system\n\n`;
        output += `Closes #[issue-number]\n`;
        output += `Refs #[related-issue-number]${breakingNote}\n`;

        output += `\n${'─'.repeat(60)}\n`;
        output += `COMMIT TYPE REFERENCE\n`;
        output += `${'─'.repeat(60)}\n`;
        Object.entries(commitTypes).forEach(([type, info]) => {
            output += `  ${info.emoji} ${type.padEnd(12)} - ${info.description}\n`;
            output += `     Example: ${info.example}\n\n`;
        });

        output += `${'─'.repeat(60)}\n`;
        output += `CONVENTIONAL COMMITS FORMAT:\n`;
        output += `  <type>[optional scope]: <description>\n\n`;
        output += `  [optional body]\n\n`;
        output += `  [optional footer(s)]\n\n`;
        output += `RULES:\n`;
        output += `  - Use imperative mood ("add" not "added")\n`;
        output += `  - Don't capitalize the first letter\n`;
        output += `  - No period at the end\n`;
        output += `  - Keep subject line under 72 characters\n`;
        output += `  - Reference issue numbers when applicable\n\n`;

        output += `COMMON SCOPES:\n`;
        output += `  ${scopes.join(' | ')}\n\n`;

        output += `${'═'.repeat(60)}\n`;
        output += `Commit Message ID: ${commitId}\n`;
        output += `End of Commit Messages - ${commitId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Describe your change (e.g., "Add user login feature, auth" or "Fix memory leak in parser")'; return; }
        try {
            outputEl.textContent = generateCommitMessages(input);
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
