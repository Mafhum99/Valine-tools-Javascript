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
 * Grammar Checker
 * Check text for common grammar issues: double spaces, sentence capitalization, run-on sentences
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Grammar Checker', icon: '✅' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const checkBtn = $('#check');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    let correctedText = '';

    function checkGrammar(text) {
        const issues = [];
        correctedText = text;

        // 1. Double spaces
        const doubleSpaceRegex = /  +/g;
        let match;
        while ((match = doubleSpaceRegex.exec(text)) !== null) {
            issues.push({
                type: 'warning',
                message: `Double space found at position ${match.index}`,
                suggestion: 'Use a single space between words.'
            });
        }
        correctedText = correctedText.replace(doubleSpaceRegex, ' ');

        // 2. Sentence capitalization - sentences should start with uppercase
        const sentences = correctedText.split(/(?<=[.!?])\s+/);
        let capitalizedSentences = [];
        sentences.forEach((sentence, index) => {
            if (sentence.length > 0 && sentence[0] !== sentence[0].toUpperCase()) {
                issues.push({
                    type: 'error',
                    message: `Sentence "${sentence.substring(0, 30)}..." starts with lowercase`,
                    suggestion: `Capitalize: "${sentence[0].toUpperCase() + sentence.slice(1)}"`
                });
                capitalizedSentences.push(sentence[0].toUpperCase() + sentence.slice(1));
            } else {
                capitalizedSentences.push(sentence);
            }
        });
        correctedText = capitalizedSentences.join(' ');

        // 3. Lowercase "i" used as pronoun
        const lowercaseIRegex = /\bi\b/g;
        while ((match = lowercaseIRegex.exec(text)) !== null) {
            // Check if already capitalized
            if (text[match.index] === 'i') {
                issues.push({
                    type: 'error',
                    message: `Lowercase "i" at position ${match.index}`,
                    suggestion: 'Use uppercase "I" for the pronoun.'
                });
            }
        }
        correctedText = correctedText.replace(/\bi\b/g, 'I');

        // 4. Common typos / confusable words
        const commonErrors = [
            { regex: /\bteh\b/gi, correct: 'the', msg: '"teh" should be "the"' },
            { regex: /\brecieve\b/gi, correct: 'receive', msg: '"recieve" should be "receive"' },
            { regex: /\boccured\b/gi, correct: 'occurred', msg: '"occured" should be "occurred"' },
            { regex: /\bdefinately\b/gi, correct: 'definitely', msg: '"definately" should be "definitely"' },
            { regex: /\bseperate\b/gi, correct: 'separate', msg: '"seperate" should be "separate"' },
            { regex: /\boccurence\b/gi, correct: 'occurrence', msg: '"occurence" should be "occurrence"' },
            { regex: /\btheir\b(?=\s+(?:is|are|was|were|going|coming|being))/gi, correct: "they're", msg: '"their" might be "they\'re" here' },
            { regex: /\byour\b(?=\s+(?:right|wrong|going|coming|being|a |an |the ))/gi, correct: "you're", msg: '"your" might be "you\'re" here' },
            { regex: /\bits\b(?=\s+(?:a |an |the |very |not |been |been))/gi, correct: "it's", msg: '"its" might be "it\'s" here' },
            { regex: /\bthen\b(?=\s+(?:a |an |the |more |less))/gi, correct: 'than', msg: '"then" might be "than" here' },
        ];

        commonErrors.forEach(({ regex, correct, msg }) => {
            while ((match = regex.exec(text)) !== null) {
                issues.push({
                    type: 'error',
                    message: msg,
                    suggestion: `Replace with "${correct}"`
                });
            }
            correctedText = correctedText.replace(regex, correct);
        });

        // 5. Run-on sentences (sentences with too many clauses joined by commas)
        const sentenceList = correctedText.split(/[.!?]+/);
        sentenceList.forEach((sentence) => {
            const commaCount = (sentence.match(/,/g) || []).length;
            const wordCount = sentence.trim().split(/\s+/).filter(w => w).length;
            if (commaCount >= 4 && wordCount > 20) {
                issues.push({
                    type: 'warning',
                    message: `Possible run-on sentence (${wordCount} words, ${commaCount} commas)`,
                    suggestion: 'Consider breaking this into shorter sentences.'
                });
            }
        });

        // 6. Missing period at end
        const trimmed = correctedText.trim();
        if (trimmed.length > 0 && !/[.!?]$/.test(trimmed)) {
            issues.push({
                type: 'warning',
                message: 'Text does not end with punctuation',
                suggestion: 'Add a period, question mark, or exclamation point at the end.'
            });
            correctedText = trimmed + '.';
        }

        // 7. Multiple consecutive exclamation/question marks
        const multiPunctRegex = /([!?])\1{2,}/g;
        while ((match = multiPunctRegex.exec(text)) !== null) {
            issues.push({
                type: 'style',
                message: `Multiple consecutive punctuation: "${match[0]}"`,
                suggestion: 'Use a single punctuation mark for formal writing.'
            });
        }
        correctedText = correctedText.replace(multiPunctRegex, '$1');

        // 8. Space before punctuation
        const spaceBeforePunctRegex = /\s+([.,!?;:])/g;
        if (spaceBeforePunctRegex.test(text)) {
            issues.push({
                type: 'error',
                message: 'Space found before punctuation',
                suggestion: 'Remove spaces before punctuation marks.'
            });
        }
        correctedText = correctedText.replace(spaceBeforePunctRegex, '$1');

        return { issues, correctedText };
    }

    function check() {
        const input = inputEl.value.trim();

        if (!input) {
            outputEl.textContent = 'Please enter text to check';
            return;
        }

        try {
            const { issues, correctedText: corrected } = checkGrammar(input);

            if (issues.length === 0) {
                outputEl.innerHTML = '<div class="grammar-success">No grammar issues found. Your text looks good!</div>';
                return;
            }

            let html = `<div class="grammar-summary">Found ${issues.length} issue(s):</div>`;
            html += '<div class="grammar-issues">';
            issues.forEach((issue, i) => {
                const icon = issue.type === 'error' ? '🔴' : issue.type === 'warning' ? '🟡' : 'ℹ️';
                html += `<div class="grammar-issue">
                    <span class="issue-type">${icon} ${capitalize(issue.type)}</span>
                    <p class="issue-message">${issue.message}</p>
                    <p class="issue-suggestion">💡 ${issue.suggestion}</p>
                </div>`;
            });
            html += '</div>';

            html += '<div class="corrected-text">';
            html += '<h4>Corrected Text:</h4>';
            html += `<p>${escapeHtml(corrected)}</p>`;
            html += '</div>';

            outputEl.innerHTML = html;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        correctedText = '';
        inputEl.focus();
    }

    checkBtn.addEventListener('click', check);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            if (!correctedText) {
                showToast('No corrected text to copy');
                return;
            }
            copyToClipboard(correctedText);
        });
    }
});
