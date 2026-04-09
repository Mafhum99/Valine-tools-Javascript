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
 * 501 - Headline Analyzer
 * Analyzes headline effectiveness based on length, word choice, sentiment, and structure
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Headline Analyzer', icon: '📰' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const powerWords = ['secret', 'proven', 'ultimate', 'essential', 'powerful', 'incredible', 'amazing', 'revolutionary', 'breakthrough', 'exclusive', 'free', 'new', 'best', 'top', 'easy', 'simple', 'fast', 'guaranteed', 'complete', 'step-by-step'];
    const emotionalWords = ['love', 'hate', 'fear', 'anger', 'joy', 'surprise', 'trust', 'anticipation', 'sadness', 'disgust', 'happy', 'sad', 'angry', 'excited', 'worried', 'hopeful', 'proud', 'grateful', 'inspired', 'motivated'];
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should'];
    const uncommonWords = ['unusual', 'rare', 'unique', 'extraordinary', 'exceptional', 'remarkable', 'outstanding', 'phenomenal', 'mind-blowing', 'game-changing', 'cutting-edge', 'innovative', 'unprecedented', 'extraordinary'];

    function analyzeHeadline(headline) {
        if (!headline.trim()) return 'Please enter a headline to analyze.';

        const words = headline.trim().split(/\s+/);
        const wordCount = words.length;
        const charCount = headline.length;
        const lowerHeadline = headline.toLowerCase();

        // Length score (ideal: 6-12 words)
        let lengthScore = 0;
        if (wordCount >= 6 && wordCount <= 12) lengthScore = 100;
        else if (wordCount >= 4 && wordCount <= 14) lengthScore = 70;
        else if (wordCount >= 2 && wordCount <= 16) lengthScore = 40;
        else lengthScore = 20;

        // Power words score
        const foundPowerWords = powerWords.filter(w => lowerHeadline.includes(w));
        const powerScore = Math.min(foundPowerWords.length * 25, 100);

        // Emotional words score
        const foundEmotionalWords = emotionalWords.filter(w => lowerHeadline.includes(w));
        const emotionalScore = Math.min(foundEmotionalWords.length * 25, 100);

        // Common vs uncommon word balance
        const uncommonFound = uncommonWords.filter(w => lowerHeadline.includes(w));
        const uncommonScore = Math.min(uncommonFound.length * 30, 100);

        // First/last word impact (first and last 3 words matter most)
        const firstThreeWords = words.slice(0, 3).join(' ').toLowerCase();
        const lastThreeWords = words.slice(-3).join(' ').toLowerCase();
        const firstLastScore = (powerWords.some(w => firstThreeWords.includes(w)) || emotionalWords.some(w => firstThreeWords.includes(w)) ? 50 : 0) +
                               (powerWords.some(w => lastThreeWords.includes(w)) || emotionalWords.some(w => lastThreeWords.includes(w)) ? 50 : 0);

        // Capitalization score (title case is ideal)
        const titleCaseWords = words.filter(w => w[0] === w[0].toUpperCase() && w.length > 1);
        const capitalizationScore = Math.min((titleCaseWords.length / Math.max(wordCount, 1)) * 100, 100);

        // Number presence (numbers boost engagement)
        const hasNumber = /\d/.test(headline);
        const numberBonus = hasNumber ? 20 : 0;

        // Question mark
        const isQuestion = headline.includes('?');
        const questionBonus = isQuestion ? 10 : 0;

        // Overall score
        const overallScore = Math.round(
            (lengthScore * 0.2) +
            (powerScore * 0.2) +
            (emotionalScore * 0.15) +
            (uncommonScore * 0.1) +
            (firstLastScore * 0.15) +
            (capitalizationScore * 0.1) +
            numberBonus +
            questionBonus
        );

        const clampedScore = Math.min(Math.max(overallScore, 0), 100);

        let rating = 'Poor';
        let ratingEmoji = '🔴';
        if (clampedScore >= 80) { rating = 'Excellent'; ratingEmoji = '🟢'; }
        else if (clampedScore >= 60) { rating = 'Good'; ratingEmoji = '🟡'; }
        else if (clampedScore >= 40) { rating = 'Fair'; ratingEmoji = '🟠'; }

        // Sentiment analysis (simple)
        const positiveWords = ['best', 'top', 'great', 'amazing', 'awesome', 'fantastic', 'excellent', 'wonderful', 'perfect', 'love', 'beautiful', 'incredible', 'outstanding', 'superb', 'brilliant'];
        const negativeWords = ['worst', 'terrible', 'awful', 'horrible', 'bad', 'ugly', 'hate', 'poor', 'mediocre', 'disappointing', 'failure', 'mistake'];
        const posCount = positiveWords.filter(w => lowerHeadline.includes(w)).length;
        const negCount = negativeWords.filter(w => lowerHeadline.includes(w)).length;
        let sentiment = 'Neutral';
        if (posCount > negCount) sentiment = 'Positive';
        else if (negCount > posCount) sentiment = 'Negative';

        let result = `${ratingEmoji} Score: ${clampedScore}/100 (${rating})\n\n`;
        result += `Word Count: ${wordCount} | Characters: ${charCount}\n`;
        result += `Sentiment: ${sentiment}\n\n`;
        result += `--- Breakdown ---\n`;
        result += `Length: ${lengthScore}/100\n`;
        result += `Power Words: ${powerScore}/100 (${foundPowerWords.length > 0 ? foundPowerWords.join(', ') : 'none'})\n`;
        result += `Emotional Words: ${emotionalScore}/100 (${foundEmotionalWords.length > 0 ? foundEmotionalWords.join(', ') : 'none'})\n`;
        result += `Uncommon Words: ${uncommonScore}/100\n`;
        result += `First/Last Impact: ${firstLastScore}/100\n`;
        result += `Title Case: ${Math.round(capitalizationScore)}%\n`;
        if (hasNumber) result += `Contains Number: Yes (+20)\n`;
        if (isQuestion) result += `Is Question: Yes (+10)\n`;
        result += `\n--- Tips ---\n`;
        if (wordCount < 6) result += `- Add more words (aim for 6-12)\n`;
        if (foundPowerWords.length === 0) result += `- Add power words (ultimate, essential, proven)\n`;
        if (foundEmotionalWords.length === 0) result += `- Add emotional trigger words\n`;
        if (!hasNumber) result += `- Consider adding a number for specificity\n`;
        if (capitalizationScore < 60) result += `- Use title case for better impact\n`;

        return result;
    }

    function calculate() {
        const input = inputEl.value.trim();
        outputEl.textContent = input ? analyzeHeadline(input) : 'Please enter a headline';
    }

    function clearAll() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
