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
 * Passive Voice Detector
 * Detect passive voice sentences
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Passive Voice Detector', icon: '\uD83D\uDD13' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const checkBtn = $('#check');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Common "to be" verbs in various forms
    const toBeVerbs = ['am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', "'m", "'re", "'s"];

    // Common irregular past participles
    const irregularParticiples = new Set([
        'written', 'given', 'taken', 'broken', 'spoken', 'chosen', 'eaten', 'fallen',
        'forgotten', 'frozen', 'hidden', 'known', 'shown', 'stolen', 'sworn', 'thrown',
        'understood', 'awoken', 'beaten', 'become', 'begun', 'bent', 'bid', 'bound',
        'bitten', 'bled', 'blown', 'bred', 'brought', 'built', 'burnt', 'bought',
        'caught', 'clung', 'come', 'cost', 'crept', 'cut', 'dealt', 'dug', 'done',
        'drawn', 'dreamt', 'driven', 'drunk', 'flown', 'forbidden', 'fought', 'found',
        'forgiven', 'gotten', 'granted', 'grown', 'hung', 'heard', 'held', 'kept',
        'knelt', 'knit', 'laid', 'led', 'leapt', 'learnt', 'left', 'lent', 'let',
        'lain', 'lighted', 'lost', 'made', 'meant', 'met', 'paid', 'plead', 'proven',
        'put', 'quit', 'read', 'rid', 'ridden', 'rung', 'risen', 'run', 'said', 'seen',
        'sought', 'sold', 'sent', 'set', 'sewn', 'shaken', 'shone', 'shod', 'shot',
        'shrunk', 'shut', 'sung', 'sunk', 'sat', 'slept', 'slain', 'slid', 'slit',
        'smelt', 'sown', 'sown', 'sped', 'spent', 'spilt', 'spun', 'spit', 'split',
        'spoken', 'spread', 'sprung', 'stood', 'struck', 'strung', 'stuck', 'stung',
        'stunk', 'sworn', 'swept', 'swollen', 'swum', 'swung', 'taught', 'torn', 'told',
        'thought', 'thrived', 'thrown', 'thrust', 'trodden', 'understood', 'woken',
        'worn', 'woven', 'wept', 'wound', 'won', 'withheld', 'withstood', 'wrung',
        'been', 'bitten', 'born', 'bred', 'brought', 'built', 'burned', 'burst',
        'cast', 'caught', 'chosen', 'clung', 'cost', 'crept', 'cut', 'dealt',
        'dig', 'dived', 'drawn', 'dreamed', 'driven', 'drunk', 'eaten', 'fallen',
        'fed', 'felt', 'fled', 'flung', 'forbidden', 'forecast', 'foreseen',
        'forgotten', 'forgiven', 'forsaken', 'frozen', 'gotten', 'graven',
        'ground', 'grown', 'hewn', 'hid', 'hurt', 'inlaid', 'inset',
        'interwoven', 'kneelt', 'knelt', 'laid', 'led', 'left', 'lent',
        'let', 'light', 'lit', 'lost', 'made', 'meant', 'met', 'misled',
        'misspelt', 'mistaken', 'misunderstood', 'mown', 'offset', 'outgrown',
        'outdone', 'overcome', 'overdone', 'overdrawn', 'overflown', 'overgrown',
        'overheard', 'overlain', 'overlaid', 'overleapt', 'overpaid', 'overtaken',
        'overthrown', 'paid', 'partaken', 'pleaded', 'plucked', 'proven', 'put',
        'read', 'rebound', 'rebuilt', 'recast', 'redone', 'remade', 'repaid',
        'resold', 'respent', 'retaken', 'retold', 'rewritten', 'ridden', 'risen',
        'run', 'rung', 'sawn', 'said', 'seen', 'sought', 'sold', 'sent',
        'set', 'sewn', 'shaken', 'shaven', 'shorn', 'shed', 'shod', 'shoed',
        'shot', 'showed', 'shown', 'shrunk', 'shut', 'sighted', 'sung', 'sunk',
        'sat', 'slept', 'slain', 'slid', 'sling', 'slinked', 'slit', 'smelled',
        'smitten', 'sowed', 'sown', 'sowed', 'sped', 'spelled', 'spent', 'spilled',
        'spilt', 'spun', 'spit', 'spat', 'split', 'spoiled', 'spoilt', 'spread',
        'sprang', 'sprung', 'stood', 'staved', 'stolen', 'stuck', 'stung',
        'stunk', 'strewed', 'strewn', 'stridden', 'struck', 'strung', 'strove',
        'sworn', 'swept', 'swelled', 'swollen', 'swum', 'swung', 'taken',
        'taught', 'torn', 'told', 'thought', 'thrived', 'thrown', 'thrust',
        'trod', 'trodden', 'underlain', 'understood', 'undertaken', 'undergone',
        'unbent', 'unbound', 'undone', 'unwound', 'upheld', 'upset', 'waken',
        'worn', 'washed', 'waved', 'waxed', 'waxed', 'wended', 'wet',
        'won', 'wound', 'wove', 'woven', 'wrung'
    ]);

    // Function to check if a word is likely a past participle
    function isPastParticiple(word) {
        word = word.toLowerCase();

        // Check irregular participles
        if (irregularParticiples.has(word)) return true;

        // Regular participles typically end in -ed
        if (word.endsWith('ed') && word.length > 3) return true;
        if (word.endsWith('ied') && word.length > 4) return true;

        return false;
    }

    // Check if sentence contains passive construction
    function detectPassive(sentence) {
        const words = sentence.toLowerCase().replace(/[^\w\s']/g, '').split(/\s+/).filter(w => w);
        const passiveInstances = [];

        for (let i = 0; i < words.length - 1; i++) {
            const word = words[i];

            // Check if current word is a "to be" verb
            if (toBeVerbs.includes(word) || word.endsWith("'m") || word.endsWith("'re") || word.endsWith("'s")) {
                // Look ahead for past participle (within next 3 words)
                for (let j = i + 1; j < Math.min(i + 4, words.length); j++) {
                    // Skip adverbs and modifiers between be verb and participle
                    const nextWord = words[j];
                    if (['not', 'never', 'always', 'often', 'sometimes', 'usually', 'rarely',
                        'very', 'quite', 'rather', 'really', 'just', 'already', 'still',
                        'yet', 'even', 'also', 'only', 'probably', 'perhaps', 'maybe',
                        'certainly', 'definitely', 'obviously', 'clearly', 'evidently',
                        'apparently', 'seemingly', 'presumably', 'actually', 'indeed'].includes(nextWord)) {
                        continue;
                    }

                    if (isPastParticiple(nextWord)) {
                        passiveInstances.push({
                            beVerb: word,
                            participle: nextWord,
                            position: i,
                            phrase: words.slice(i, j + 1).join(' ')
                        });
                    }
                    break; // Only check the first non-adverb after be verb
                }
            }
        }

        return passiveInstances;
    }

    function check() {
        const text = inputEl.value;
        if (!text.trim()) {
            outputEl.textContent = 'Please enter text to analyze';
            return;
        }

        try {
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text.trim()];
            let totalSentences = 0;
            let passiveSentences = [];
            let totalPassiveInstances = 0;

            sentences.forEach(sentence => {
                const trimmed = sentence.trim();
                if (trimmed.length < 10) return; // Skip very short sentences

                totalSentences++;
                const passives = detectPassive(trimmed);

                if (passives.length > 0) {
                    totalPassiveInstances += passives.length;
                    passiveSentences.push({
                        sentence: trimmed,
                        passives: passives
                    });
                }
            });

            const passivePercentage = totalSentences > 0 ? ((passiveSentences.length / totalSentences) * 100).toFixed(1) : 0;
            const verdict = parseFloat(passivePercentage) > 25 ? '\u26A0\uFE0F HIGH - Too much passive voice' :
                           parseFloat(passivePercentage) > 10 ? '\u26A0\uFE0F MODERATE - Some passive voice detected' :
                           '\u2705 LOW - Good use of active voice';

            let result = `PASSIVE VOICE ANALYSIS\n${'─'.repeat(45)}\n\n`;
            result += `Total sentences: ${totalSentences}\n`;
            result += `Sentences with passive voice: ${passiveSentences.length}\n`;
            result += `Passive voice percentage: ${passivePercentage}%\n`;
            result += `Verdict: ${verdict}\n\n`;

            if (passiveSentences.length > 0) {
                result += `PASSIVE VOICE INSTANCES:\n${'─'.repeat(45)}\n\n`;

                passiveSentences.forEach((item, idx) => {
                    result += `${idx + 1}. "${item.sentence.substring(0, 100)}${item.sentence.length > 100 ? '...' : ''}"\n`;
                    item.passives.forEach(p => {
                        result += `   Passive: "${p.phrase}" (${p.beVerb} + ${p.participle})\n`;
                        // Suggest active rewrite
                        result += `   Tip: Try rewriting with the subject performing the action\n`;
                    });
                    result += '\n';
                });

                result += `TIPS FOR ACTIVE VOICE:\n`;
                result += `  1. Identify who/what is performing the action\n`;
                result += `  2. Make that the subject of the sentence\n`;
                result += `  3. Use a direct verb form\n`;
                result += `  4. Example: "The ball was thrown by John" -> "John threw the ball"\n`;
            } else {
                result += `\nNo passive voice detected. Great use of active voice!\n`;
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
