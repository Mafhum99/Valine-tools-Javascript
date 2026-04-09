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
 * Thesaurus Lookup
 * Simple thesaurus with synonyms
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Thesaurus Lookup', icon: '\uD83D\uDCD6' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const lookupBtn = $('#lookup');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const thesaurus = {
        'happy': { synonyms: ['joyful', 'cheerful', 'delighted', 'pleased', 'content', 'glad', 'elated', 'ecstatic', 'thrilled', 'merry', 'blissful', 'jubilant', 'euphoric'], antonyms: ['sad', 'unhappy', 'miserable', 'depressed', 'sorrowful'] },
        'sad': { synonyms: ['unhappy', 'sorrowful', 'miserable', 'depressed', 'gloomy', 'melancholy', 'heartbroken', 'dejected', 'downcast', 'despondent', 'forlorn', 'woeful'], antonyms: ['happy', 'joyful', 'cheerful', 'glad'] },
        'big': { synonyms: ['large', 'huge', 'enormous', 'gigantic', 'massive', 'vast', 'immense', 'colossal', 'tremendous', 'substantial', 'considerable', 'grand', 'mammoth'], antonyms: ['small', 'tiny', 'little', 'miniature'] },
        'small': { synonyms: ['little', 'tiny', 'miniature', 'petite', 'compact', 'minute', 'diminutive', 'modest', 'slight', 'minor', 'pint-sized', 'microscopic'], antonyms: ['big', 'large', 'huge', 'enormous'] },
        'good': { synonyms: ['excellent', 'great', 'wonderful', 'fine', 'superior', 'outstanding', 'marvelous', 'superb', 'terrific', 'fantastic', 'splendid', 'exceptional', 'admirable'], antonyms: ['bad', 'poor', 'terrible', 'awful'] },
        'bad': { synonyms: ['terrible', 'awful', 'poor', 'dreadful', 'horrible', 'atrocious', 'abysmal', 'inferior', 'substandard', 'unsatisfactory', 'lousy', 'pathetic'], antonyms: ['good', 'excellent', 'great', 'wonderful'] },
        'fast': { synonyms: ['quick', 'rapid', 'swift', 'speedy', 'hasty', 'brisk', 'nimble', 'fleet', 'prompt', 'expeditious', 'accelerated', 'lightning'], antonyms: ['slow', 'sluggish', 'leisurely'] },
        'slow': { synonyms: ['sluggish', 'leisurely', 'gradual', 'unhurried', 'plodding', 'languid', 'lazy', 'tardy', 'dilatory', 'meandering', 'ponderous'], antonyms: ['fast', 'quick', 'rapid', 'swift'] },
        'beautiful': { synonyms: ['gorgeous', 'stunning', 'lovely', 'attractive', 'pretty', 'elegant', 'exquisite', 'magnificent', 'radiant', 'enchanting', 'breathtaking', 'alluring', 'charming'], antonyms: ['ugly', 'hideous', 'unsightly'] },
        'ugly': { synonyms: ['hideous', 'unsightly', 'unattractive', 'homely', 'grotesque', 'repulsive', 'ghastly', 'horrid', 'dreadful', 'foul', 'repugnant'], antonyms: ['beautiful', 'pretty', 'attractive'] },
        'smart': { synonyms: ['intelligent', 'clever', 'brilliant', 'wise', 'bright', 'sharp', 'astute', 'knowledgeable', 'ingenious', 'resourceful', 'perceptive', 'quick-witted'], antonyms: ['stupid', 'dumb', 'ignorant', 'foolish'] },
        'stupid': { synonyms: ['dumb', 'foolish', 'ignorant', 'unintelligent', 'dense', 'dim', 'slow', 'witless', 'brainless', 'idiotic', 'imbecilic', 'senseless'], antonyms: ['smart', 'intelligent', 'clever', 'brilliant'] },
        'strong': { synonyms: ['powerful', 'mighty', 'robust', 'sturdy', 'tough', 'forceful', 'vigorous', 'muscular', 'potent', 'formidable', 'resilient', 'hardy'], antonyms: ['weak', 'feeble', 'frail'] },
        'weak': { synonyms: ['feeble', 'frail', 'fragile', 'flimsy', 'delicate', 'powerless', 'faint', 'wimpy', 'puny', 'enfeebled', 'debilitated'], antonyms: ['strong', 'powerful', 'mighty', 'robust'] },
        'hot': { synonyms: ['warm', 'boiling', 'burning', 'scorching', 'blazing', 'fiery', 'sweltering', 'steamy', 'torrid', 'sizzling', 'blistering', 'sultry'], antonyms: ['cold', 'cool', 'freezing', 'chilly'] },
        'cold': { synonyms: ['cool', 'chilly', 'freezing', 'frigid', 'icy', 'frosty', 'biting', 'bleak', 'harsh', 'wintry', 'arctic', 'glacial', 'frozen'], antonyms: ['hot', 'warm', 'boiling'] },
        'old': { synonyms: ['ancient', 'aged', 'elderly', 'vintage', 'antique', 'archaic', 'mature', 'senior', 'timeworn', 'weathered', 'obsolete', 'bygone'], antonyms: ['young', 'new', 'modern'] },
        'young': { synonyms: ['youthful', 'juvenile', 'adolescent', 'immature', 'fresh', 'green', 'inexperienced', 'naive', 'newborn', 'infant', 'childish'], antonyms: ['old', 'aged', 'elderly', 'ancient'] },
        'new': { synonyms: ['modern', 'fresh', 'novel', 'recent', 'original', 'contemporary', 'current', 'latest', 'brand-new', 'state-of-the-art', 'innovative', 'revolutionary'], antonyms: ['old', 'ancient', 'used'] },
        'rich': { synonyms: ['wealthy', 'affluent', 'prosperous', 'well-off', 'opulent', 'loaded', 'moneyed', 'flush', 'lavish', 'luxurious', 'abundant', 'plentiful'], antonyms: ['poor', 'impoverished', 'broke'] },
        'poor': { synonyms: ['impoverished', 'needy', 'destitute', 'poverty-stricken', 'broke', 'penniless', 'indigent', 'disadvantaged', 'underprivileged', 'deprived'], antonyms: ['rich', 'wealthy', 'affluent'] },
        'important': { synonyms: ['significant', 'crucial', 'essential', 'vital', 'critical', 'major', 'key', 'fundamental', 'paramount', 'pivotal', 'consequential', 'momentous'], antonyms: ['unimportant', 'trivial', 'insignificant'] },
        'hard': { synonyms: ['difficult', 'challenging', 'demanding', 'tough', 'arduous', 'strenuous', 'rigorous', 'grueling', 'formidable', 'taxing', 'laborious'], antonyms: ['easy', 'simple', 'effortless'] },
        'easy': { synonyms: ['simple', 'effortless', 'straightforward', 'uncomplicated', 'elementary', 'basic', 'clear', 'plain', 'facile', 'painless', 'manageable'], antonyms: ['hard', 'difficult', 'challenging'] },
        'angry': { synonyms: ['furious', 'enraged', 'irate', 'livid', 'incensed', 'wrathful', 'indignant', 'annoyed', 'irritated', 'outraged', 'hostile', 'irate'], antonyms: ['calm', 'peaceful', 'pleased'] },
        'calm': { synonyms: ['peaceful', 'tranquil', 'serene', 'composed', 'relaxed', 'quiet', 'placid', 'still', 'collected', 'unperturbed', 'undisturbed', 'mellow'], antonyms: ['angry', 'agitated', 'nervous'] },
        'brave': { synonyms: ['courageous', 'fearless', 'bold', 'daring', 'valiant', 'heroic', 'intrepid', 'gallant', 'audacious', 'undaunted', 'plucky', 'valorous'], antonyms: ['cowardly', 'timid', 'fearful'] },
        'kind': { synonyms: ['caring', 'compassionate', 'generous', 'gentle', 'considerate', 'thoughtful', 'benevolent', 'warm', 'sympathetic', 'tender', 'helpful', 'loving'], antonyms: ['cruel', 'mean', 'unkind'] },
        'mean': { synonyms: ['cruel', 'unkind', 'nasty', 'vicious', 'malicious', 'spiteful', 'hostile', 'harsh', 'callous', 'cold-hearted', 'ruthless', 'heartless'], antonyms: ['kind', 'nice', 'generous'] },
        'funny': { synonyms: ['humorous', 'amusing', 'comical', 'hilarious', 'entertaining', 'witty', 'comedy', 'laughable', 'ridiculous', 'absurd', 'ludicrous', 'zany'], antonyms: ['serious', 'sad', 'boring'] },
        'serious': { synonyms: ['solemn', 'earnest', 'grave', 'earnest', 'somber', 'solemn', 'weighty', 'significant', 'important', 'stern', 'austere', 'thoughtful'], antonyms: ['funny', 'silly', 'trivial'] },
        'clean': { synonyms: ['spotless', 'pure', 'pristine', 'immaculate', 'tidy', 'neat', 'sparkling', 'sanitary', 'sterile', 'unsoiled', 'fresh', 'washed'], antonyms: ['dirty', 'filthy', 'messy'] },
        'dirty': { synonyms: ['filthy', 'soiled', 'unclean', 'grubby', 'grimy', 'muddy', 'stained', 'polluted', 'contaminated', 'squalid', 'messy', 'unwashed'], antonyms: ['clean', 'spotless', 'tidy'] },
        'love': { synonyms: ['adore', 'cherish', 'worship', 'admire', 'care for', 'dote on', 'fancy', 'desire', 'passion', 'devotion', 'affection', 'fondness', 'attachment'], antonyms: ['hate', 'despise', 'loathe'] },
        'hate': { synonyms: ['despise', 'loathe', 'detest', 'abhor', 'dislike', 'resent', 'scorn', 'contempt', 'aversion', 'animosity', 'hostility', 'enmity'], antonyms: ['love', 'adore', 'cherish'] },
        'like': { synonyms: ['enjoy', 'appreciate', 'admire', 'admire', 'fancy', 'relish', 'savor', 'approve', 'favor', 'prefer', 'admire', 'approve of'], antonyms: ['dislike', 'hate', 'despise'] },
        'think': { synonyms: ['consider', 'ponder', 'contemplate', 'reflect', 'deliberate', 'reason', 'muse', 'cogitate', 'ruminate', 'speculate', 'meditate', 'analyze'], antonyms: ['ignore', 'dismiss'] },
        'say': { synonyms: ['state', 'declare', 'express', 'utter', 'articulate', 'mention', 'remark', 'announce', 'proclaim', 'assert', 'verbalize', 'voice'], antonyms: ['conceal', 'hide'] },
        'go': { synonyms: ['proceed', 'move', 'travel', 'journey', 'venture', 'advance', 'depart', 'head', 'progress', 'trek', 'march', 'hasten'], antonyms: ['stay', 'stop', 'remain'] },
        'come': { synonyms: ['arrive', 'approach', 'reach', 'appear', 'emerge', 'enter', 'materialize', 'converge', 'assemble', 'gather', 'attend'], antonyms: ['leave', 'depart', 'go'] },
        'make': { synonyms: ['create', 'produce', 'construct', 'build', 'form', 'craft', 'fabricate', 'assemble', 'manufacture', 'generate', 'compose', 'design'], antonyms: ['destroy', 'break', 'ruin'] },
        'see': { synonyms: ['observe', 'notice', 'view', 'spot', 'witness', 'glimpse', 'perceive', 'discern', 'behold', 'gaze', 'survey', 'examine'], antonyms: ['overlook', 'miss', 'ignore'] },
        'know': { synonyms: ['understand', 'comprehend', 'realize', 'recognize', 'grasp', 'perceive', 'fathom', 'appreciate', 'acknowledge', 'discern', 'conceive'], antonyms: ['ignore', 'misunderstand'] },
        'want': { synonyms: ['desire', 'wish', 'crave', 'long for', 'yearn for', 'covet', 'need', 'seek', 'require', 'hope for', 'aspire to', 'hanker'], antonyms: ['reject', 'refuse', 'decline'] },
        'help': { synonyms: ['assist', 'aid', 'support', 'serve', 'facilitate', 'guide', 'encourage', 'comfort', 'relieve', 'benefit', 'promote', 'foster'], antonyms: ['hinder', 'obstruct', 'impede'] },
        'show': { synonyms: ['display', 'exhibit', 'present', 'demonstrate', 'reveal', 'illustrate', 'indicate', 'manifest', 'expose', 'uncover', 'prove', 'portray'], antonyms: ['hide', 'conceal', 'cover'] },
        'start': { synonyms: ['begin', 'commence', 'initiate', 'launch', 'open', 'originate', 'institute', 'establish', 'found', 'embark', 'trigger', 'set off'], antonyms: ['end', 'stop', 'finish'] },
        'end': { synonyms: ['finish', 'conclude', 'terminate', 'stop', 'cease', 'complete', 'close', 'halt', 'finalize', 'wrap up', 'culminate'], antonyms: ['start', 'begin', 'commence'] },
        'change': { synonyms: ['alter', 'modify', 'transform', 'convert', 'adapt', 'adjust', 'shift', 'vary', 'revise', 'amend', 'remodel', 'reshape'], antonyms: ['maintain', 'preserve', 'keep'] },
        'great': { synonyms: ['excellent', 'wonderful', 'fantastic', 'superb', 'magnificent', 'outstanding', 'remarkable', 'marvelous', 'splendid', 'exceptional', 'tremendous', 'terrific'], antonyms: ['terrible', 'awful', 'poor'] },
        'little': { synonyms: ['small', 'tiny', 'miniature', 'petite', 'compact', 'minor', 'slight', 'modest', 'diminutive', 'brief', 'short', 'limited'], antonyms: ['big', 'large', 'great'] },
        'long': { synonyms: ['extended', 'lengthy', 'prolonged', 'elongated', 'drawn-out', 'lasting', 'enduring', 'continuing', 'protracted', 'expansive', 'interminable'], antonyms: ['short', 'brief', 'brief'] },
        'short': { synonyms: ['brief', 'compact', 'concise', 'terse', 'curt', 'abbreviated', 'abbreviated', 'limited', 'little', 'small', 'miniature'], antonyms: ['long', 'extended', 'lengthy'] },
        'high': { synonyms: ['tall', 'elevated', 'lofty', 'towering', 'soaring', 'raised', 'uplifted', 'steep', 'sky-high', 'extreme', 'supreme', 'paramount'], antonyms: ['low', 'short', 'shallow'] },
        'low': { synonyms: ['short', 'shallow', 'modest', 'reduced', 'diminished', 'humble', 'inferior', 'deep', 'base', 'bottom', 'sunken', 'depressed'], antonyms: ['high', 'tall', 'elevated'] },
        'right': { synonyms: ['correct', 'proper', 'accurate', 'true', 'exact', 'appropriate', 'suitable', 'just', 'fair', 'valid', 'sound', 'legitimate'], antonyms: ['wrong', 'incorrect', 'false'] },
        'wrong': { synonyms: ['incorrect', 'false', 'erroneous', 'mistaken', 'inaccurate', 'improper', 'inappropriate', 'unjust', 'unfair', 'flawed', 'defective'], antonyms: ['right', 'correct', 'proper'] },
        'true': { synonyms: ['accurate', 'correct', 'genuine', 'real', 'authentic', 'valid', 'factual', 'actual', 'honest', 'faithful', 'reliable', 'verifiable'], antonyms: ['false', 'fake', 'untrue'] },
        'false': { synonyms: ['untrue', 'fake', 'incorrect', 'wrong', 'erroneous', 'inaccurate', 'bogus', 'phony', 'fraudulent', 'deceptive', 'counterfeit', 'sham'], antonyms: ['true', 'genuine', 'real'] },
        'full': { synonyms: ['complete', 'entire', 'total', 'whole', 'filled', 'packed', 'loaded', 'brimming', 'overflowing', 'replete', 'sated', 'stuffed'], antonyms: ['empty', 'hollow', 'vacant'] },
        'empty': { synonyms: ['vacant', 'hollow', 'void', 'blank', 'bare', 'clear', 'unoccupied', 'desolate', 'barren', 'hollow', 'unfilled', 'uninhabited'], antonyms: ['full', 'filled', 'packed'] },
        'run': { synonyms: ['sprint', 'dash', 'jog', 'race', 'rush', 'hurry', 'flee', 'gallop', 'bolt', 'scamper', 'trot', 'hasten'], antonyms: ['walk', 'stop', 'stand'] },
        'walk': { synonyms: ['stroll', 'amble', 'saunter', 'march', 'stride', 'trek', 'wander', 'ramble', 'trudge', 'hike', 'pace', 'step'], antonyms: ['run', 'sprint', 'rush'] },
        'talk': { synonyms: ['speak', 'converse', 'chat', 'discuss', 'communicate', 'dialogue', 'confer', 'consult', 'gossip', 'babble', 'prattle', 'jabber'], antonyms: ['listen', 'hear', 'silent'] },
        'quiet': { synonyms: ['silent', 'hushed', 'still', 'peaceful', 'calm', 'tranquil', 'muted', 'noiseless', 'soundless', 'mute', 'subdued', 'soft'], antonyms: ['loud', 'noisy', 'boisterous'] },
        'loud': { synonyms: ['noisy', 'boisterous', 'thunderous', 'deafening', 'blaring', 'clamorous', 'roaring', 'piercing', 'strident', 'vociferous', 'raucous', 'stentorian'], antonyms: ['quiet', 'soft', 'silent'] }
    };

    function lookup() {
        const word = inputEl.value.trim().toLowerCase();
        if (!word) {
            outputEl.textContent = 'Please enter a word to look up';
            return;
        }

        const entry = thesaurus[word];
        if (!entry) {
            // Try partial matching
            const partialMatches = Object.keys(thesaurus).filter(k => k.includes(word) || word.includes(k));
            if (partialMatches.length > 0) {
                let msg = `Word not found directly. Did you mean one of these?\n${partialMatches.slice(0, 5).join(', ')}\n\n`;
                const first = thesaurus[partialMatches[0]];
                if (first) {
                    msg += `Synonyms for "${partialMatches[0]}": ${first.synonyms.join(', ')}`;
                }
                outputEl.textContent = msg;
            } else {
                outputEl.textContent = `No synonyms found for "${word}".\n\nTry: happy, sad, big, small, good, bad, fast, slow, beautiful, ugly, smart, stupid, strong, weak, hot, cold, old, young, new, rich, poor, important, hard, easy, angry, calm, brave, kind, mean, funny, serious, clean, dirty, love, hate, think, know, want, help, show, start, end, change, great, little, long, short, high, low, right, wrong, true, false, full, empty, run, walk, talk, quiet, loud`;
            }
            return;
        }

        let result = `Word: ${word}\n\n`;
        result += `Synonyms:\n${entry.synonyms.join(', ')}\n\n`;
        if (entry.antonyms && entry.antonyms.length > 0) {
            result += `Antonyms:\n${entry.antonyms.join(', ')}`;
        }
        outputEl.textContent = result;
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    lookupBtn.addEventListener('click', lookup);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') lookup();
    });
    inputEl.addEventListener('input', debounce(lookup, 500));
});
