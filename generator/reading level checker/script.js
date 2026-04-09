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
 * Reading Level Checker
 * Check reading level (grade level from complexity)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Reading Level Checker', icon: '\uD83C\uDF93' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const checkBtn = $('#check');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function countSyllables2(word) {
        word = word.toLowerCase().replace(/[^a-z]/g, '');
        if (word.length <= 2) return 1;

        let count = 0;
        const vowels = 'aeiouy';
        let prevWasVowel = false;

        for (let i = 0; i < word.length; i++) {
            const isVowel = vowels.includes(word[i]);
            if (isVowel && !prevWasVowel) {
                count++;
            }
            prevWasVowel = isVowel;
        }

        // Adjust for silent e
        if (word.endsWith('e') && !word.endsWith('le')) {
            count = Math.max(1, count - 1);
        }

        return Math.max(1, count);
    }

    function calculateReadingLevel(text) {
        // Count words
        const words = text.match(/\b\w+\b/g) || [];
        const wordCount = words.length;

        if (wordCount < 10) return null;

        // Count sentences
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const sentenceCount = Math.max(1, sentences.length);

        // Count syllables
        let totalSyllables = 0;
        let complexWords = 0; // words with 3+ syllables

        words.forEach(word => {
            const syl = countSyllables2(word);
            totalSyllables += syl;
            if (syl >= 3) complexWords++;
        });

        // Average syllables per word
        const avgSyllablesPerWord = totalSyllables / wordCount;

        // Average words per sentence
        const avgWordsPerSentence = wordCount / sentenceCount;

        // Flesch Reading Ease
        const fleschEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * (totalSyllables / wordCount));

        // Flesch-Kincaid Grade Level
        const fleschKincaid = (0.39 * avgWordsPerSentence) + (11.8 * (totalSyllables / wordCount)) - 15.59;

        // Gunning Fog Index
        const complexWordRatio = complexWords / wordCount;
        const gunningFog = 0.4 * (avgWordsPerSentence + 100 * complexWordRatio);

        // Coleman-Liau Index
        const letters = text.replace(/[^a-zA-Z]/g, '').length;
        const L = (letters / wordCount) * 100;
        const S = (sentenceCount / wordCount) * 100;
        const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

        // SMOG Index
        const smog = 1.0430 * Math.sqrt(complexWords * (30 / sentenceCount)) + 3.1291;

        // Automated Readability Index
        const characters = text.replace(/\s/g, '').length;
        const ari = (4.71 * (characters / wordCount)) + (0.5 * (wordCount / sentenceCount)) - 21.43;

        return {
            wordCount,
            sentenceCount,
            avgWordsPerSentence: avgWordsPerSentence.toFixed(1),
            avgSyllablesPerWord: avgSyllablesPerWord.toFixed(2),
            complexWords,
            complexWordPercentage: ((complexWords / wordCount) * 100).toFixed(1),
            fleschEase: fleschEase.toFixed(1),
            fleschKincaid: fleschKincaid.toFixed(1),
            gunningFog: gunningFog.toFixed(1),
            colemanLiau: colemanLiau.toFixed(1),
            smog: smog.toFixed(1),
            ari: ari.toFixed(1),
            avgGradeLevel: ((parseFloat(fleschKincaid) + parseFloat(gunningFog) + parseFloat(colemanLiau) + parseFloat(ari)) / 4).toFixed(1)
        };
    }

    function getReadingLevelDescription(gradeLevel) {
        const grade = parseFloat(gradeLevel);
        if (grade <= 5) return 'Elementary - Very easy to read';
        if (grade <= 8) return 'Middle School - Easy to read';
        if (grade <= 10) return 'High School - Fairly easy to read';
        if (grade <= 12) return 'High School - Standard reading level';
        if (grade <= 14) return 'College - Fairly difficult';
        if (grade <= 16) return 'College Graduate - Difficult';
        return 'Professional/Expert - Very difficult';
    }

    function getFleschDescription(score) {
        const s = parseFloat(score);
        if (s >= 90) return 'Very Easy (5th grade)';
        if (s >= 80) return 'Easy (6th grade)';
        if (s >= 70) return 'Fairly Easy (7th grade)';
        if (s >= 60) return 'Standard (8th-9th grade)';
        if (s >= 50) return 'Fairly Difficult (10th-12th grade)';
        if (s >= 30) return 'Difficult (College)';
        return 'Very Difficult (College Graduate)';
    }

    function check() {
        const text = inputEl.value;
        if (!text.trim()) {
            outputEl.textContent = 'Please enter text to analyze';
            return;
        }

        try {
            const stats = calculateReadingLevel(text);
            if (!stats) {
                outputEl.textContent = 'Please enter more text (at least 10 words)';
                return;
            }

            const gradeLevel = stats.avgGradeLevel;
            const levelDesc = getReadingLevelDescription(gradeLevel);

            let result = `READING LEVEL: Grade ${gradeLevel}\n${levelDesc}\n${'─'.repeat(45)}\n\n`;

            result += `FLESCH READING EASE: ${stats.fleschEase}/100\n`;
            result += `  ${getFleschDescription(stats.fleschEase)}\n\n`;

            result += `GRADE LEVEL SCORES:\n`;
            result += `  Flesch-Kincaid:    Grade ${stats.fleschKincaid}\n`;
            result += `  Gunning Fog:       Grade ${stats.gunningFog}\n`;
            result += `  Coleman-Liau:      Grade ${stats.colemanLiau}\n`;
            result += `  SMOG:              Grade ${stats.smog}\n`;
            result += `  ARI:               Grade ${stats.ari}\n`;
            result += `  Average:           Grade ${stats.avgGradeLevel}\n\n`;

            result += `TEXT STATISTICS:\n`;
            result += `  Words: ${stats.wordCount}\n`;
            result += `  Sentences: ${stats.sentenceCount}\n`;
            result += `  Avg words/sentence: ${stats.avgWordsPerSentence}\n`;
            result += `  Avg syllables/word: ${stats.avgSyllablesPerWord}\n`;
            result += `  Complex words (3+ syllables): ${stats.complexWords} (${stats.complexWordPercentage}%)\n\n`;

            result += `RECOMMENDATIONS:\n`;
            if (parseFloat(stats.avgWordsPerSentence) > 25) {
                result += `- Consider shortening sentences (avg: ${stats.avgWordsPerSentence} words)\n`;
            }
            if (parseFloat(stats.complexWordPercentage) > 15) {
                result += `- Reduce complex words (currently: ${stats.complexWordPercentage}%)\n`;
            }
            if (parseFloat(stats.avgGradeLevel) > 12) {
                result += `- Text may be too complex for general audience\n`;
            }
            if (parseFloat(stats.fleschEase) < 50) {
                result += `- Low readability score. Simplify language where possible.\n`;
            }
            if (parseFloat(stats.avgWordsPerSentence) <= 25 && parseFloat(stats.complexWordPercentage) <= 15) {
                result += `- Text is well-structured for general reading.\n`;
            }

            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    checkBtn.addEventListener('click', check);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('input', debounce(check, 600));
});
