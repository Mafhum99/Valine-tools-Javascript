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
 * Readability Score
 * Calculate Flesch Reading Ease and other readability metrics
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Readability Score', icon: '📊' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');

    // Count syllables in a word
    function countSyllables(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length <= 3) return 1;

        // Remove silent e at end
        word = word.replace(/(?:[^laeio])e$/, '');

        // Count vowel groups
        const vowelGroups = word.match(/[aeiouy]+/g);
        const count = vowelGroups ? vowelGroups.length : 1;

        return Math.max(1, count);
    }

    function calculateReadability(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const words = text.match(/[a-zA-Z0-9']+/g) || [];
        const totalWords = words.length;
        const totalSentences = Math.max(1, sentences.length);

        if (totalWords === 0) {
            return null;
        }

        // Count syllables
        let totalSyllables = 0;
        let complexWords = 0; // words with 3+ syllables
        words.forEach(word => {
            const syllables = countSyllables(word);
            totalSyllables += syllables;
            if (syllables >= 3) complexWords++;
        });

        const avgWordsPerSentence = totalWords / totalSentences;
        const avgSyllablesPerWord = totalSyllables / totalWords;

        // Flesch Reading Ease
        // 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
        const fleschReadingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

        // Flesch-Kincaid Grade Level
        // 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
        const fleschKincaidGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;

        // Gunning Fog Index
        // 0.4 * ((words/sentences) + 100 * (complexWords/words))
        const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (complexWords / totalWords));

        // SMOG Index (simplified)
        // 1.0430 * sqrt(polysyllabic words * (30/sentences)) + 3.1291
        const smogIndex = totalSentences > 0
            ? 1.0430 * Math.sqrt(complexWords * (30 / totalSentences)) + 3.1291
            : 0;

        // Coleman-Liau Index (approximate, using characters)
        const totalChars = text.replace(/\s/g, '').length;
        const L = (totalChars / totalWords) * 100; // avg letters per 100 words
        const S = (totalSentences / totalWords) * 100; // avg sentences per 100 words
        const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

        // Automated Readability Index
        const characters = text.replace(/\s/g, '').length;
        const ari = 4.71 * (characters / totalWords) + 0.5 * (totalWords / totalSentences) - 21.43;

        // Get readability level description
        function getLevel(score) {
            if (score >= 90) return { level: 'Very Easy', description: 'Easily understood by 11-year-olds', color: '#22c55e' };
            if (score >= 80) return { level: 'Easy', description: 'Conversational English', color: '#84cc16' };
            if (score >= 70) return { level: 'Fairly Easy', description: 'Fairly easy to read', color: '#eab308' };
            if (score >= 60) return { level: 'Standard', description: 'Easily understood by 13-15 year olds', color: '#f59e0b' };
            if (score >= 50) return { level: 'Fairly Difficult', description: 'Best understood by college students', color: '#f97316' };
            if (score >= 30) return { level: 'Difficult', description: 'Best understood by graduates', color: '#ef4444' };
            return { level: 'Very Difficult', description: 'Best understood by university graduates', color: '#dc2626' };
        }

        const level = getLevel(Math.max(0, Math.min(100, fleschReadingEase)));

        return {
            totalWords,
            totalSentences,
            totalSyllables,
            complexWords,
            avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
            avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2),
            fleschReadingEase: fleschReadingEase.toFixed(1),
            fleschKincaidGrade: fleschKincaidGrade.toFixed(1),
            gunningFog: gunningFog.toFixed(1),
            smogIndex: smogIndex.toFixed(1),
            colemanLiau: colemanLiau.toFixed(1),
            ari: ari.toFixed(1),
            level
        };
    }

    function calculate() {
        const input = inputEl.value.trim();

        if (!input) {
            outputEl.textContent = 'Please enter text to analyze';
            return;
        }

        try {
            const stats = calculateReadability(input);

            if (!stats || stats.totalWords === 0) {
                outputEl.textContent = 'No valid text found. Please enter some text.';
                return;
            }

            const { level } = stats;

            let html = '<div class="readability-results">';

            // Main Flesch score
            html += `<div class="readability-main" style="border-left: 4px solid ${level.color}">
                <div class="readability-score" style="color: ${level.color}">${stats.fleschReadingEase}</div>
                <div class="readability-level" style="color: ${level.color}">${level.level}</div>
                <div class="readability-description">${level.description}</div>
            </div>`;

            // Detailed metrics
            html += '<div class="readability-grid">';
            html += `<div class="metric-card">
                <div class="metric-value">${stats.fleschKincaidGrade}</div>
                <div class="metric-label">Flesch-Kincaid Grade</div>
            </div>`;
            html += `<div class="metric-card">
                <div class="metric-value">${stats.gunningFog}</div>
                <div class="metric-label">Gunning Fog Index</div>
            </div>`;
            html += `<div class="metric-card">
                <div class="metric-value">${stats.smogIndex}</div>
                <div class="metric-label">SMOG Index</div>
            </div>`;
            html += `<div class="metric-card">
                <div class="metric-value">${stats.colemanLiau}</div>
                <div class="metric-label">Coleman-Liau Index</div>
            </div>`;
            html += `<div class="metric-card">
                <div class="metric-value">${stats.ari}</div>
                <div class="metric-label">Automated Readability</div>
            </div>`;
            html += '</div>';

            // Text statistics
            html += '<div class="text-stats">';
            html += '<h4>Text Statistics</h4>';
            html += `<div class="stat-row"><span>Words:</span><strong>${stats.totalWords}</strong></div>`;
            html += `<div class="stat-row"><span>Sentences:</span><strong>${stats.totalSentences}</strong></div>`;
            html += `<div class="stat-row"><span>Total Syllables:</span><strong>${stats.totalSyllables}</strong></div>`;
            html += `<div class="stat-row"><span>Complex Words (3+ syllables):</span><strong>${stats.complexWords}</strong></div>`;
            html += `<div class="stat-row"><span>Avg Words/Sentence:</span><strong>${stats.avgWordsPerSentence}</strong></div>`;
            html += `<div class="stat-row"><span>Avg Syllables/Word:</span><strong>${stats.avgSyllablesPerWord}</strong></div>`;
            html += '</div>';

            html += '</div>';

            outputEl.innerHTML = html;
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
});
