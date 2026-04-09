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
 * Tone Analyzer
 * Analyze tone (formal, casual, positive, negative)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Tone Analyzer', icon: '\uD83C\uDFAD' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const analyzeBtn = $('#analyze');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const positiveWords = new Set([
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'beautiful',
        'brilliant', 'best', 'better', 'love', 'lovely', 'happy', 'joy', 'joyful', 'delightful',
        'pleasant', 'superb', 'outstanding', 'perfect', 'marvelous', 'splendid', 'terrific',
        'fabulous', 'magnificent', 'remarkable', 'incredible', 'phenomenal', 'exceptional',
        'glorious', 'sublime', 'radiant', 'charming', 'enchanting', 'fascinating', 'impressive',
        'inspiring', 'motivating', 'encouraging', 'promising', 'refreshing', 'rewarding',
        'satisfying', 'stimulating', 'thrilling', 'uplifting', 'vibrant', 'winning', 'worth',
        'yes', 'agree', 'support', 'approve', 'admire', 'appreciate', 'thank', 'thanks',
        'welcome', 'congratulations', 'celebrate', 'success', 'triumph', 'victory', 'achieve',
        'accomplish', 'benefit', 'blessing', 'bright', 'clever', 'cool', 'creative', 'desirable',
        'easy', 'elegant', 'enjoy', 'exciting', 'favorable', 'fortunate', 'friendly', 'fun',
        'generous', 'gentle', 'genuine', 'glad', 'graceful', 'grateful', 'harmony', 'healing',
        'healthy', 'helpful', 'honest', 'hope', 'humor', 'ideal', 'imagine', 'important',
        'innovation', 'kind', 'laugh', 'lucky', 'magnificent', 'nice', 'noble', 'optimal',
        'optimistic', 'paradise', 'peaceful', 'polished', 'positive', 'powerful', 'pretty',
        'proud', 'quality', 'remarkable', 'respected', 'safe', 'secure', 'smart', 'smooth',
        'special', 'strong', 'stunning', 'sweet', 'talented', 'tender', 'thankful', 'top',
        'tremendous', 'trust', 'unique', 'valuable', 'valued', 'victorious', 'virtuous',
        'warm', 'wealthy', 'well', 'win', 'wisdom', 'wow', 'yeah', 'yummy', 'zest', 'zeal'
    ]);

    const negativeWords = new Set([
        'bad', 'terrible', 'horrible', 'awful', 'worst', 'poor', 'ugly', 'hate', 'hated',
        'disgusting', 'dreadful', 'miserable', 'painful', 'sad', 'sadness', 'sorrow', 'grief',
        'angry', 'furious', 'annoyed', 'irritated', 'frustrated', 'disappointed', 'disappointing',
        'depressed', 'depressing', 'miserable', 'miserably', 'unhappy', 'upset', 'disturbed',
        'distressed', 'disturbing', 'fear', 'fearful', 'afraid', 'scared', 'terrified',
        'anxious', 'worried', 'nervous', 'stress', 'stressful', 'tension', 'tense', 'troubled',
        'troubling', 'violent', 'aggressive', 'hostile', 'bitter', 'brutal', 'cruel',
        'dangerous', 'deadly', 'destructive', 'disastrous', 'disease', 'evil', 'fail',
        'failure', 'false', 'fault', 'greedy', 'guilt', 'harm', 'harmful', 'harsh',
        'heavy', 'hell', 'hurt', 'ignoring', 'ill', 'impatient', 'impossible', 'incompetent',
        'inferior', 'insecure', 'insult', 'interrupt', 'irate', 'jealous', 'judgmental',
        'kill', 'liar', 'lie', 'loathing', 'lonely', 'loss', 'lost', 'mad', 'malice',
        'mean', 'menace', 'mess', 'mistake', 'mock', 'naughty', 'nasty', 'neglect',
        'nightmare', 'no', 'not', 'never', 'none', 'nothing', 'nowhere', 'obnoxious',
        'offend', 'oppressive', 'outrage', 'panic', 'pathetic', 'pessimistic', 'petty',
        'poison', 'poor', 'punish', 'ridiculous', 'rude', 'ruin', 'scandal', 'selfish',
        'severe', 'shame', 'shock', 'shocking', 'sick', 'sin', 'slap', 'sluggish', 'snub',
        'spite', 'stink', 'stupid', 'suffer', 'suffering', 'terrible', 'terrifying',
        'threat', 'thwart', 'tragedy', 'tragic', 'trauma', 'ugly', 'unbearable', 'uncomfortable',
        'unfair', 'unfortunate', 'unhappy', 'unhealthy', 'unjust', 'unlucky', 'unpleasant',
        'upset', 'useless', 'vex', 'victim', 'vicious', 'villain', 'vomit', 'waste',
        'weak', 'weep', 'wicked', 'worry', 'worse', 'wretched', 'wrong', 'yell'
    ]);

    const formalWords = new Set([
        'furthermore', 'moreover', 'nevertheless', 'notwithstanding', 'consequently',
        'accordingly', 'therefore', 'thus', 'hence', 'herein', 'wherein', 'thereof',
        'aforementioned', 'hereafter', 'heretofore', 'whereby', 'pursuant', 'pursuant to',
        'inasmuch', 'hitherto', 'whereupon', 'herewith', 'thereupon', 'commence',
        'endeavor', 'ascertain', 'demonstrate', 'facilitate', 'implement', 'utilize',
        'subsequently', 'approximately', 'sufficient', 'necessitate', 'constitute',
        'endeavor', 'expeditiously', 'henceforth', 'notwithstanding', 'pertaining',
        'regarding', 'respecting', 'vis-a-vis', 'in accordance with', 'with regard to',
        'in reference to', 'in relation to', 'with respect to', 'in connection with',
        'on behalf of', 'prior to', 'subsequent to', 'in lieu of', 'in lieu',
        'aforementioned', 'aforesaid', 'hereinafter', 'hereinbefore', 'wherefore',
        'whereas', 'whilst', 'amongst', 'shall', 'may not', 'must not', 'should',
        'would', 'could', 'might', 'ought to', 'it is', 'one must', 'it appears',
        'it seems', 'it is evident', 'it is apparent', 'it is clear', 'moreover'
    ]);

    const casualWords = new Set([
        'gonna', 'wanna', 'gotta', 'ain\'t', 'dont', 'dont', 'cant', 'wont', 'shouldnt',
        'wouldnt', 'couldnt', 'didnt', 'doesnt', 'wasnt', 'werent', 'hasnt', 'havent',
        'hadnt', 'isnt', 'arent', 'im', 'youre', 'theyre', 'were', 'hes', 'shes', 'its',
        'thats', 'whats', 'heres', 'whos', 'lets', 'thats', 'its', 'dont', 'cant',
        'wont', 'dont', 'dont', 'hey', 'hi', 'hello', 'yeah', 'yep', 'nope', 'yep',
        'cool', 'ok', 'okay', 'sure', 'whatever', 'anyway', 'anyways', 'like', 'stuff',
        'things', 'stuff', 'things', 'kinda', 'sorta', 'pretty', 'really', 'totally',
        'basically', 'literally', 'seriously', 'honestly', 'actually', 'obviously',
        'apparently', 'probably', 'maybe', 'perhaps', 'guess', 'suppose', 'think',
        'feel', 'look', 'see', 'get', 'got', 'gotta', 'gonna', 'wanna', 'gimme',
        'lemme', 'dunno', 'cause', 'cuz', 'coz', 'cos', 'yeah', 'yep', 'yup', 'nah',
        'nope', 'uh', 'um', 'uhh', 'hmm', 'well', 'so', 'then', 'now', 'here', 'there'
    ]);

    function analyzeTone(text) {
        const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];
        const totalWords = words.length;

        if (totalWords === 0) return null;

        // Positive/Negative analysis
        let posCount = 0, negCount = 0;
        words.forEach(w => {
            if (positiveWords.has(w)) posCount++;
            if (negativeWords.has(w)) negCount++;
        });

        const posScore = (posCount / totalWords) * 100;
        const negScore = (negCount / totalWords) * 100;

        // Formal/Casual analysis
        let formalCount = 0, casualCount = 0;
        words.forEach(w => {
            if (formalWords.has(w)) formalCount++;
            if (casualWords.has(w)) casualCount++;
        });

        // Check for contractions (casual indicator)
        const contractions = (text.match(/'\w+/g) || []).length;
        const contractionRate = (contractions / totalWords) * 100;

        // Check for exclamation marks (emotional intensity)
        const exclamations = (text.match(/!/g) || []).length;
        const exclamationRate = (exclamations / totalWords) * 100;

        // Check for question marks
        const questions = (text.match(/\?/g) || []).length;

        // Average sentence length
        const sentences = text.split(/[.!?]+/).filter(s => s.trim());
        const avgSentenceLength = sentences.length > 0 ? totalWords / sentences.length : totalWords;

        // Determine primary tone
        let polarity = 'neutral';
        if (posScore > negScore && posScore > 2) polarity = 'positive';
        else if (negScore > posScore && negScore > 2) polarity = 'negative';

        let register = 'neutral';
        const formalityScore = (formalCount / totalWords) * 100;
        const casualScore = ((casualCount + contractionRate) / totalWords) * 100;
        if (formalityScore > casualScore && formalityScore > 1) register = 'formal';
        else if (casualScore > formalityScore && casualScore > 2) register = 'casual';

        // Emotional intensity
        let intensity = 'moderate';
        if (exclamationRate > 2 || (posScore + negScore) > 10) intensity = 'high';
        else if ((posScore + negScore) < 2) intensity = 'low';

        return {
            polarity, posScore, negScore, posCount, negCount, totalWords,
            register, formalityScore, casualScore, casualCount, formalCount,
            intensity, exclamationRate, questions, avgSentenceLength, sentences: sentences.length
        };
    }

    function analyze() {
        const text = inputEl.value;
        if (!text.trim()) {
            outputEl.textContent = 'Please enter text to analyze';
            return;
        }

        try {
            const analysis = analyzeTone(text);
            if (!analysis) {
                outputEl.textContent = 'No words to analyze';
                return;
            }

            let result = '';

            // Polarity
            result += `POLARITY: ${analysis.polarity.toUpperCase()}\n`;
            result += `  Positive: ${analysis.posScore.toFixed(1)}% (${analysis.posCount} words)\n`;
            result += `  Negative: ${analysis.negScore.toFixed(1)}% (${analysis.negCount} words)\n\n`;

            // Register
            result += `REGISTER: ${analysis.register.toUpperCase()}\n`;
            result += `  Formality: ${analysis.formalityScore.toFixed(1)}%\n`;
            result += `  Casualness: ${analysis.casualScore.toFixed(1)}%\n\n`;

            // Intensity
            result += `EMOTIONAL INTENSITY: ${analysis.intensity.toUpperCase()}\n`;
            result += `  Exclamation marks: ${Math.round(analysis.exclamationRate * 10)} per 1000 words\n\n`;

            // Stats
            result += `STATISTICS:\n`;
            result += `  Total words: ${analysis.totalWords}\n`;
            result += `  Sentences: ${analysis.sentences}\n`;
            result += `  Avg sentence length: ${analysis.avgSentenceLength.toFixed(1)} words\n`;
            result += `  Questions: ${analysis.questions}\n\n`;

            // Summary
            result += `SUMMARY:\n`;
            result += `  The text is ${analysis.polarity}, ${analysis.register}, with ${analysis.intensity} emotional intensity.\n`;
            result += `  Average sentence length: ${analysis.avgSentenceLength.toFixed(1)} words (${analysis.avgSentenceLength > 25 ? 'complex' : analysis.avgSentenceLength > 15 ? 'moderate' : 'simple'})`;

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

    analyzeBtn.addEventListener('click', analyze);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('input', debounce(analyze, 600));
});
