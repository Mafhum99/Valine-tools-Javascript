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
 * Transition Word Checker
 * Check for transition words usage
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Transition Word Checker', icon: '\uD83D\uDD1C' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const checkBtn = $('#check');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Comprehensive transition word lists by category
    const transitionWords = {
        'Addition': [
            'additionally', 'moreover', 'furthermore', 'also', 'besides', 'in addition',
            'as well as', 'not only', 'but also', 'equally', 'similarly', 'likewise',
            'too', 'along with', 'together with', 'coupled with', 'in the same way',
            'correspondingly', 'complementarily', 'in like manner', 'on top of that',
            'another', 'first', 'second', 'third', 'next', 'finally', 'lastly'
        ],
        'Contrast': [
            'however', 'nevertheless', 'nonetheless', 'on the other hand', 'conversely',
            'in contrast', 'on the contrary', 'although', 'even though', 'though',
            'despite', 'in spite of', 'regardless', 'yet', 'but', 'still', 'whereas',
            'while', 'whilst', 'alternatively', 'otherwise', 'instead', 'rather',
            'notwithstanding', 'unlike', 'contrarily', 'alternatively', 'but then',
            'on the flip side', 'be that as it may', 'then again', 'having said that',
            'even so', 'all the same', 'at the same time'
        ],
        'Cause/Effect': [
            'therefore', 'consequently', 'as a result', 'thus', 'hence', 'accordingly',
            'so', 'because', 'since', 'for this reason', 'due to', 'owing to',
            'as a consequence', 'subsequently', 'thereby', 'in effect', 'for that reason',
            'then', 'eventually', 'in turn', 'causing', 'leads to', 'resulting in',
            'follows that', 'this means', 'which means', 'this suggests', 'implies that'
        ],
        'Time/Sequence': [
            'first', 'firstly', 'second', 'secondly', 'third', 'thirdly', 'next',
            'then', 'after', 'afterward', 'afterwards', 'before', 'meanwhile',
            'simultaneously', 'finally', 'eventually', 'ultimately', 'now',
            'soon', 'later', 'previously', 'formerly', 'originally', 'currently',
            'presently', 'recently', 'initially', 'subsequently', 'thereafter',
            'until', 'since', 'during', 'while', 'whilst', 'as soon as',
            'in the meantime', 'at the same time', 'from then on', 'in due time',
            'once', 'when', 'whenever', 'by the time', 'earlier', 'latter'
        ],
        'Example/Illustration': [
            'for example', 'for instance', 'such as', 'namely', 'that is', 'in other words',
            'specifically', 'to illustrate', 'in particular', 'particularly',
            'as an illustration', 'like', 'including', 'consider', 'take the case of',
            'to demonstrate', 'in this case', 'an example of', 'this shows',
            'this demonstrates', 'as evidence', 'notably', 'chiefly', 'especially',
            'in this regard', 'to clarify', 'by way of illustration', 'case in point'
        ],
        'Emphasis': [
            'indeed', 'certainly', 'undoubtedly', 'clearly', 'obviously', 'evidently',
            'without a doubt', 'definitely', 'absolutely', 'undeniably', 'above all',
            'most importantly', 'in fact', 'as a matter of fact', 'actually',
            'in particular', 'especially', 'notably', 'significantly', 'remarkably',
            'unquestionably', 'beyond doubt', 'surely', 'truly', 'in truth',
            'to be sure', 'of course', 'no doubt', 'it is clear that'
        ],
        'Conclusion/Summary': [
            'in conclusion', 'to conclude', 'to sum up', 'in summary', 'overall',
            'all in all', 'in brief', 'briefly', 'to summarize', 'on the whole',
            'in short', 'in a nutshell', 'in essence', 'all things considered',
            'taking everything into account', 'as has been noted', 'given these points',
            'as shown above', 'as demonstrated above', 'in the final analysis',
            'on balance', 'by and large', 'for the most part', 'in the end',
            'finally', 'ultimately', 'in closing', 'to wrap up'
        ],
        'Comparison': [
            'similarly', 'likewise', 'in the same way', 'equally', 'just as',
            'in like manner', 'correspondingly', 'by the same token', 'comparably',
            'in comparison', 'by comparison', 'by contrast', 'compared to',
            'in parallel', 'along the same lines', 'with equal validity'
        ],
        'Condition': [
            'if', 'unless', 'provided that', 'assuming that', 'in case',
            'as long as', 'on condition that', 'whether', 'even if',
            'only if', 'in the event that', 'supposing that', 'given that',
            'granted that', 'assuming', 'should', 'in case of', 'barring'
        ]
    };

    // Flatten all transition words
    const allTransitionWords = new Set();
    Object.values(transitionWords).forEach(words => {
        words.forEach(w => allTransitionWords.add(w.toLowerCase()));
    });

    function analyzeTransitions(text) {
        const lowerText = text.toLowerCase();
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const totalSentences = sentences.length;
        const words = text.match(/\b\w+\b/g) || [];
        const totalWords = words.length;

        const found = [];
        const categoryCounts = {};

        // Check for multi-word transitions first, then single words
        const sortedTransitions = [...allTransitionWords].sort((a, b) => b.length - a.length);

        for (const transition of sortedTransitions) {
            const regex = new RegExp('\\b' + transition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            let match;
            while ((match = regex.exec(lowerText)) !== null) {
                // Find which category this belongs to
                for (const [category, words] of Object.entries(transitionWords)) {
                    if (words.includes(transition)) {
                        found.push({
                            word: transition,
                            category: category,
                            position: match.index,
                            context: getContext(text, match.index, transition.length)
                        });
                        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                        break;
                    }
                }
            }
        }

        // Calculate coverage
        const sentencesWithTransitions = new Set();
        found.forEach(f => {
            const sentIdx = getSentenceIndex(sentences, f.position);
            sentencesWithTransitions.add(sentIdx);
        });

        const transitionDensity = totalWords > 0 ? (found.length / totalWords) * 100 : 0;
        const sentenceCoverage = totalSentences > 0 ? (sentencesWithTransitions.size / totalSentences) * 100 : 0;

        return {
            found,
            totalCount: found.length,
            categories: categoryCounts,
            totalSentences,
            sentencesWithTransitions: sentencesWithTransitions.size,
            sentenceCoverage,
            transitionDensity,
            totalWords
        };
    }

    function getContext(text, position, length, contextSize = 30) {
        const start = Math.max(0, position - contextSize);
        const end = Math.min(text.length, position + length + contextSize);
        let context = text.substring(start, end);
        if (start > 0) context = '...' + context;
        if (end < text.length) context = context + '...';
        return context;
    }

    function getSentenceIndex(sentences, position) {
        let charCount = 0;
        for (let i = 0; i < sentences.length; i++) {
            charCount += sentences[i].length;
            if (position < charCount) return i;
        }
        return sentences.length - 1;
    }

    function check() {
        const text = inputEl.value;
        if (!text.trim()) {
            outputEl.textContent = 'Please enter text to analyze';
            return;
        }

        try {
            const analysis = analyzeTransitions(text);

            if (analysis.totalCount === 0) {
                outputEl.textContent = `NO TRANSITION WORDS FOUND\n\nYour text does not contain any common transition words. Consider adding some to improve flow and readability.\n\nSuggested transition words to add:\n- Addition: additionally, moreover, furthermore\n- Contrast: however, nevertheless, on the other hand\n- Cause/Effect: therefore, consequently, as a result\n- Example: for example, for instance, such as\n- Time: meanwhile, subsequently, finally`;
                return;
            }

            const coverageScore = analysis.sentenceCoverage;
            const verdict = coverageScore >= 60 ? '\u2705 EXCELLENT - Great use of transitions' :
                           coverageScore >= 40 ? '\u2705 GOOD - Adequate transition usage' :
                           coverageScore >= 20 ? '\u26A0\uFE0F FAIR - Could use more transitions' :
                           '\u274C POOR - Very few transition words';

            let result = `TRANSITION WORD ANALYSIS\n${'─'.repeat(45)}\n\n`;
            result += `Total transition words found: ${analysis.totalCount}\n`;
            result += `Sentences with transitions: ${analysis.sentencesWithTransitions}/${analysis.totalSentences} (${analysis.sentenceCoverage.toFixed(1)}%)\n`;
            result += `Transition density: ${analysis.transitionDensity.toFixed(2)}%\n`;
            result += `Verdict: ${verdict}\n\n`;

            result += `BY CATEGORY:\n${'─'.repeat(45)}\n`;
            const sortedCategories = Object.entries(analysis.categories).sort((a, b) => b[1] - a[1]);
            sortedCategories.forEach(([category, count]) => {
                const bar = '\u2588'.repeat(Math.min(count * 2, 20));
                result += `  ${category.padEnd(25)} ${count.toString().padStart(3)} ${bar}\n`;
            });

            result += `\nFOUND TRANSITION WORDS:\n${'─'.repeat(45)}\n`;
            // Group by category
            const byCategory = {};
            analysis.found.forEach(f => {
                if (!byCategory[f.category]) byCategory[f.category] = [];
                byCategory[f.category].push(f);
            });

            for (const [category, items] of Object.entries(byCategory)) {
                result += `\n${category}:\n`;
                const unique = [...new Set(items.map(i => i.word))];
                result += `  ${unique.join(', ')}\n`;
            }

            // Recommendations
            result += `\n\nRECOMMENDATIONS:\n${'─'.repeat(45)}\n`;
            if (analysis.sentenceCoverage < 40) {
                result += `- Add more transition words to improve flow\n`;
                result += `- Aim for at least 40% of sentences to have a transition\n`;
            }

            const missingCategories = Object.keys(transitionWords).filter(cat => !analysis.categories[cat]);
            if (missingCategories.length > 0 && missingCategories.length < Object.keys(transitionWords).length) {
                result += `- Consider adding: ${missingCategories.slice(0, 3).join(', ')}\n`;
            }

            if (analysis.sentenceCoverage >= 80) {
                result += `- Transition usage is very high. Make sure they're not overused.\n`;
            }

            if (analysis.transitionDensity > 5) {
                result += `- High transition density. Some may be unnecessary.\n`;
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
