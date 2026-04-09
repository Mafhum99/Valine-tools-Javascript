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
 * Plagiarism Checker
 * Check text similarity percentage (basic plagiarism check)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Plagiarism Checker', icon: '\uD83D\uDD0E' });

    const text1El = $('#text1');
    const text2El = $('#text2');
    const outputEl = $('#output');
    const methodEl = $('#method');
    const checkBtn = $('#check');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function getNgrams(text, n = 3) {
        const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w);
        const ngrams = new Set();
        for (let i = 0; i <= words.length - n; i++) {
            ngrams.add(words.slice(i, i + n).join(' '));
        }
        return ngrams;
    }

    function ngramSimilarity(text1, text2) {
        const ngrams1 = getNgrams(text1, 3);
        const ngrams2 = getNgrams(text2, 3);

        if (ngrams1.size === 0 || ngrams2.size === 0) return { similarity: 0, matches: 0, total: 0 };

        let matches = 0;
        const matchedNgrams = [];

        for (const ngram of ngrams1) {
            if (ngrams2.has(ngram)) {
                matches++;
                matchedNgrams.push(ngram);
            }
        }

        const union = new Set([...ngrams1, ...ngrams2]);
        const similarity = (matches / union.size) * 100;

        return {
            similarity,
            matches,
            total: union.size,
            matchedNgrams: matchedNgrams.slice(0, 10)
        };
    }

    function wordMatchSimilarity(text1, text2) {
        const words1 = new Set(text1.toLowerCase().match(/\b\w+\b/g) || []);
        const words2 = new Set(text2.toLowerCase().match(/\b\w+\b/g) || []);

        if (words1.size === 0 || words2.size === 0) return { similarity: 0, matches: 0, total: 0 };

        let matches = 0;
        const matchedWords = [];

        for (const word of words1) {
            if (words2.has(word)) {
                matches++;
                matchedWords.push(word);
            }
        }

        const union = new Set([...words1, ...words2]);
        const similarity = (matches / union.size) * 100;

        return { similarity, matches, total: union.size, matchedWords: matchedWords.slice(0, 20) };
    }

    function lcsSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().match(/\b\w+\b/g) || [];
        const words2 = text2.toLowerCase().match(/\b\w+\b/g) || [];

        if (words1.length === 0 || words2.length === 0) return { similarity: 0, lcsLength: 0 };

        // Optimized LCS using arrays
        const m = words1.length;
        const n = words2.length;

        // Use two rows to save memory
        let prev = new Array(n + 1).fill(0);
        let curr = new Array(n + 1).fill(0);

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (words1[i - 1] === words2[j - 1]) {
                    curr[j] = prev[j - 1] + 1;
                } else {
                    curr[j] = Math.max(prev[j], curr[j - 1]);
                }
            }
            [prev, curr] = [curr, prev];
        }

        const lcsLength = prev[n];
        const maxLen = Math.max(m, n);
        const similarity = maxLen > 0 ? (lcsLength / maxLen) * 100 : 0;

        return { similarity, lcsLength, total1: m, total2: n };
    }

    function check() {
        const text1 = text1El.value;
        const text2 = text2El.value;

        if (!text1.trim() || !text2.trim()) {
            outputEl.textContent = 'Please enter both texts to compare';
            return;
        }

        try {
            const method = methodEl.value;
            let result;

            if (method === 'ngram') {
                result = ngramSimilarity(text1, text2);
                result = formatNgramResult(result);
            } else if (method === 'word') {
                result = wordMatchSimilarity(text1, text2);
                result = formatWordResult(result);
            } else {
                result = lcsSimilarity(text1, text2);
                result = formatLcsResult(result);
            }

            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function formatNgramResult(result) {
        const sim = result.similarity.toFixed(1);
        const verdict = getVerdict(parseFloat(sim));

        return `Similarity Score: ${sim}%\n${verdict}\n${'─'.repeat(40)}\n\nMatching 3-word phrases: ${result.matches}\nTotal unique phrases: ${result.total}\n\nSample matching phrases:\n${(result.matchedNgrams || []).map((p, i) => `  ${i + 1}. "${p}"`).join('\n')}\n\n${getInterpretation(parseFloat(sim))}`;
    }

    function formatWordResult(result) {
        const sim = result.similarity.toFixed(1);
        const verdict = getVerdict(parseFloat(sim));

        return `Similarity Score: ${sim}%\n${verdict}\n${'─'.repeat(40)}\n\nMatching words: ${result.matches}\nTotal unique words: ${result.total}\n\nSample matching words:\n${(result.matchedWords || []).map((w, i) => `  ${i + 1}. "${w}"`).join('\n')}\n\n${getInterpretation(parseFloat(sim))}`;
    }

    function formatLcsResult(result) {
        const sim = result.similarity.toFixed(1);
        const verdict = getVerdict(parseFloat(sim));

        return `Similarity Score: ${sim}%\n${verdict}\n${'─'.repeat(40)}\n\nLongest common sequence: ${result.lcsLength} words\nText A: ${result.total1} words\nText B: ${result.total2} words\n\n${getInterpretation(parseFloat(sim))}`;
    }

    function getVerdict(similarity) {
        if (similarity >= 80) return '\u26A0\uFE0F VERY HIGH - Almost identical';
        if (similarity >= 60) return '\u26A0\uFE0F HIGH - Likely plagiarized';
        if (similarity >= 40) return '\u26A0\uFE0F MODERATE - Significant overlap';
        if (similarity >= 20) return '\u2705 LOW - Some common phrases';
        return '\u2705 VERY LOW - Mostly original';
    }

    function getInterpretation(similarity) {
        if (similarity >= 80) return 'Interpretation: The texts are nearly identical. This strongly suggests direct copying or plagiarism.';
        if (similarity >= 60) return 'Interpretation: High similarity detected. Significant portions appear to be copied or closely paraphrased.';
        if (similarity >= 40) return 'Interpretation: Moderate similarity. There is substantial overlap in vocabulary and phrasing. Review recommended.';
        if (similarity >= 20) return 'Interpretation: Some common vocabulary and phrases. This could be normal for texts on the same topic.';
        return 'Interpretation: Very low similarity. The texts appear to be largely independent.';
    }

    function clear() {
        text1El.value = '';
        text2El.value = '';
        outputEl.textContent = '-';
        text1El.focus();
    }

    checkBtn.addEventListener('click', check);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }
});
