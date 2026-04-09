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
 * Sentiment Analysis Tool
 * Sentiment analysis (positive/negative/neutral score)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Sentiment Analysis Tool', icon: '\uD83D\uDCC8' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const analyzeBtn = $('#analyze');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Sentiment lexicon with scores (-3 to +3)
    const sentimentLexicon = {
        // Strong positive (+3)
        'amazing': 3, 'brilliant': 3, 'excellent': 3, 'extraordinary': 3, 'fantastic': 3,
        'incredible': 3, 'magnificent': 3, 'outstanding': 3, 'phenomenal': 3, 'spectacular': 3,
        'superb': 3, 'terrific': 3, 'wonderful': 3, 'best': 3, 'exceptional': 3, 'masterpiece': 3,
        // Moderate positive (+2)
        'awesome': 2, 'beautiful': 2, 'delightful': 2, 'enjoyable': 2, 'fabulous': 2,
        'great': 2, 'impressive': 2, 'love': 2, 'lovely': 2, 'marvelous': 2,
        'perfect': 2, 'remarkable': 2, 'splendid': 2, 'superior': 2, 'victorious': 2,
        'happy': 2, 'joy': 2, 'joyful': 2, 'excited': 2, 'exciting': 2, 'thrilled': 2,
        'glad': 2, 'pleased': 2, 'cheerful': 2, 'grateful': 2, 'gratitude': 2,
        // Mild positive (+1)
        'good': 1, 'nice': 1, 'fine': 1, 'pleasant': 1, 'positive': 1, 'satisfactory': 1,
        'acceptable': 1, 'adequate': 1, 'agreeable': 1, 'comfortable': 1, 'decent': 1,
        'fair': 1, 'favorable': 1, 'fortunate': 1, 'friendly': 1, 'gentle': 1,
        'hope': 1, 'hopeful': 1, 'kind': 1, 'lucky': 1, 'optimistic': 1,
        'peaceful': 1, 'prosperous': 1, 'safe': 1, 'secure': 1, 'success': 1,
        'successful': 1, 'support': 1, 'supportive': 1, 'sweet': 1, 'thankful': 1,
        'trust': 1, 'warm': 1, 'welcome': 1, 'win': 1, 'worth': 1, 'benefit': 1,
        'blessing': 1, 'bright': 1, 'calm': 1, 'celebration': 1, 'charm': 1,
        'clever': 1, 'cool': 1, 'creative': 1, 'dream': 1, 'easy': 1, 'elegant': 1,
        'encourage': 1, 'enjoy': 1, 'fun': 1, 'generous': 1, 'genuine': 1,
        'grace': 1, 'harmony': 1, 'healing': 1, 'healthy': 1, 'helpful': 1,
        'honest': 1, 'honor': 1, 'ideal': 1, 'inspire': 1, 'inspiration': 1,
        'integrity': 1, 'interest': 1, 'laugh': 1, 'meaningful': 1, 'merit': 1,
        'opportunity': 1, 'paradise': 1, 'praise': 1, 'promise': 1, 'proud': 1,
        'quality': 1, 'respected': 1, 'reward': 1, 'satisfaction': 1, 'smart': 1,
        'smooth': 1, 'solid': 1, 'special': 1, 'strong': 1, 'talent': 1, 'treasure': 1,
        'triumph': 1, 'truth': 1, 'unique': 1, 'valuable': 1, 'virtue': 1, 'vitality': 1,
        // Neutral (0)
        'about': 0, 'after': 0, 'again': 0, 'also': 0, 'any': 0, 'are': 0,
        'as': 0, 'at': 0, 'be': 0, 'been': 0, 'but': 0, 'by': 0, 'can': 0,
        'come': 0, 'could': 0, 'do': 0, 'does': 0, 'each': 0, 'either': 0,
        'even': 0, 'for': 0, 'from': 0, 'get': 0, 'go': 0, 'had': 0,
        'has': 0, 'have': 0, 'he': 0, 'her': 0, 'here': 0, 'him': 0,
        'his': 0, 'how': 0, 'however': 0, 'i': 0, 'if': 0, 'in': 0,
        'into': 0, 'is': 0, 'it': 0, 'its': 0, 'just': 0, 'let': 0,
        'like': 0, 'make': 0, 'many': 0, 'me': 0, 'more': 0, 'most': 0,
        'my': 0, 'neither': 0, 'no': 0, 'not': 0, 'of': 0, 'on': 0,
        'one': 0, 'only': 0, 'or': 0, 'other': 0, 'our': 0, 'out': 0,
        'over': 0, 'own': 0, 'say': 0, 'see': 0, 'she': 0, 'so': 0,
        'some': 0, 'such': 0, 'than': 0, 'that': 0, 'the': 0, 'their': 0,
        'them': 0, 'then': 0, 'there': 0, 'these': 0, 'they': 0, 'this': 0,
        'those': 0, 'through': 0, 'to': 0, 'too': 0, 'two': 0, 'up': 0,
        'us': 0, 'use': 0, 'was': 0, 'we': 0, 'what': 0, 'when': 0,
        'where': 0, 'which': 0, 'while': 0, 'who': 0, 'whom': 0, 'why': 0,
        'will': 0, 'with': 0, 'would': 0, 'yet': 0, 'you': 0, 'your': 0,
        // Mild negative (-1)
        'annoying': -1, 'anxious': -1, 'awkward': -1, 'boring': -1, 'cheap': -1,
        'cold': -1, 'complicated': -1, 'concern': -1, 'confused': -1, 'confusing': -1,
        'costly': -1, 'crude': -1, 'damage': -1, 'delay': -1, 'dense': -1,
        'difficult': -1, 'disappoint': -1, 'doubt': -1, 'dry': -1, 'dull': -1,
        'embarrass': -1, 'error': -1, 'exhaust': -1, 'expensive': -1, 'fragile': -1,
        'frustrate': -1, 'guilt': -1, 'hard': -1, 'harsh': -1, 'hate': -1,
        'heavy': -1, 'hesitate': -1, 'hostile': -1, 'humble': -1, 'hurt': -1,
        'ignore': -1, 'impatient': -1, 'imperfect': -1, 'inconvenient': -1, 'inferior': -1,
        'insecure': -1, 'insignificant': -1, 'insult': -1, 'interruption': -1, 'irritate': -1,
        'jealous': -1, 'lazy': -1, 'limit': -1, 'lonely': -1, 'loose': -1,
        'loud': -1, 'mediocre': -1, 'mild': -1, 'minor': -1, 'mislead': -1,
        'mistake': -1, 'moody': -1, 'nagging': -1, 'naive': -1, 'narrow': -1,
        'neglect': -1, 'nervous': -1, 'noise': -1, 'odd': -1, 'pain': -1,
        'perplex': -1, 'pessimistic': -1, 'petty': -1, 'plain': -1, 'poor': -1,
        'precarious': -1, 'problem': -1, 'questionable': -1, 'rare': -1, 'reckless': -1,
        'reluctant': -1, 'ridiculous': -1, 'rigid': -1, 'rough': -1, 'rude': -1,
        'sad': -1, 'scare': -1, 'selfish': -1, 'severe': -1, 'shallow': -1,
        'shame': -1, 'sharp': -1, 'shock': -1, 'shortage': -1, 'sick': -1,
        'silent': -1, 'simple': -1, 'slight': -1, 'slow': -1, 'small': -1,
        'sour': -1, 'spite': -1, 'stale': -1, 'stark': -1, 'steep': -1,
        'sticky': -1, 'stiff': -1, 'strange': -1, 'strict': -1, 'stubborn': -1,
        'stupid': -1, 'subdued': -1, 'subtle': -1, 'suffer': -1, 'superficial': -1,
        'suspicious': -1, 'tense': -1, 'terrible': -1, 'tiresome': -1, 'tough': -1,
        'troublesome': -1, 'ugly': -1, 'uncomfortable': -1, 'unfair': -1, 'unfortunate': -1,
        'unhappy': -1, 'unhealthy': -1, 'unjust': -1, 'unlucky': -1, 'unnecessary': -1,
        'unpleasant': -1, 'unsafe': -1, 'unsatisfactory': -1, 'unstable': -1, 'unsure': -1,
        'upset': -1, 'urgent': -1, 'useless': -1, 'vague': -1, 'vanity': -1,
        'vain': -1, 'violent': -1, 'volatile': -1, 'vulnerable': -1, 'waste': -1,
        'weak': -1, 'weary': -1, 'weird': -1, 'wet': -1, 'wild': -1,
        'wilt': -1, 'wither': -1, 'woeful': -1, 'worn': -1, 'worried': -1,
        'worry': -1, 'worse': -1, 'worthless': -1, 'wrong': -1,
        // Moderate negative (-2)
        'aggressive': -2, 'angry': -2, 'bitter': -2, 'brutal': -2, 'catastrophe': -2,
        'chaos': -2, 'contempt': -2, 'crisis': -2, 'cruel': -2, 'danger': -2,
        'dangerous': -2, 'deadly': -2, 'defeat': -2, 'deficit': -2, 'depressed': -2,
        'depression': -2, 'despair': -2, 'destroy': -2, 'destruction': -2, 'devastate': -2,
        'disaster': -2, 'disgust': -2, 'dismay': -2, 'dreadful': -2, 'enemy': -2,
        'evacuate': -2, 'fear': -2, 'fearful': -2, 'furious': -2, 'gloom': -2,
        'grave': -2, 'grief': -2, 'grievous': -2, 'guilty': -2, 'horrendous': -2,
        'horrible': -2, 'horror': -2, 'humiliate': -2, 'humiliation': -2, 'inflict': -2,
        'injure': -2, 'injury': -2, 'insane': -2, 'insulting': -2, 'intense': -2,
        'intimidate': -2, 'irate': -2, 'irritating': -2, 'loathing': -2, 'lose': -2,
        'loss': -2, 'menace': -2, 'mourn': -2, 'nasty': -2, 'nightmare': -2,
        'offend': -2, 'oppression': -2, 'outbreak': -2, 'outrage': -2, 'overwhelm': -2,
        'painful': -2, 'panic': -2, 'pathetic': -2, 'persecute': -2, 'plague': -2,
        'poison': -2, 'pollute': -2, 'predator': -2, 'punish': -2, 'rejection': -2,
        'ruin': -2, 'sadden': -2, 'scandal': -2, 'scream': -2, 'severe': -2,
        'shatter': -2, 'sorrow': -2, 'sorrowful': -2, 'spiteful': -2, 'stigma': -2,
        'strain': -2, 'stress': -2, 'suicide': -2, 'terrible': -2, 'threat': -2,
        'torment': -2, 'tragedy': -2, 'tragic': -2, 'trauma': -2, 'turmoil': -2,
        'unbearable': -2, 'unforgiving': -2, 'unhappy': -2, 'unrest': -2, 'upheaval': -2,
        'vengeance': -2, 'vicious': -2, 'victim': -2, 'vilify': -2, 'violent': -2,
        'war': -2, 'weep': -2, 'wicked': -2, 'worse': -2, 'wound': -2,
        'wrath': -2, 'wreck': -2, 'yell': -2,
        // Strong negative (-3)
        'abhor': -3, 'abhorrent': -3, 'abysmal': -3, 'agony': -3, 'atrocious': -3,
        'awful': -3, 'barbaric': -3, 'catastrophic': -3, 'contemptible': -3, 'corrupt': -3,
        'corruption': -3, 'damn': -3, 'damning': -3, 'devastating': -3, 'diabolical': -3,
        'disastrous': -3, 'disgusting': -3, 'dreadful': -3, 'evil': -3, 'execrable': -3,
        'fatality': -3, 'fearful': -3, 'ghastly': -3, 'grotesque': -3, 'hateful': -3,
        'heinous': -3, 'hell': -3, 'hideous': -3, 'horrendous': -3, 'horrendous': -3,
        'horrid': -3, 'horrific': -3, 'horror': -3, 'hostile': -3, 'horrifying': -3,
        'inhuman': -3, 'inhumane': -3, 'loathsome': -3, 'macabre': -3, 'malevolent': -3,
        'malicious': -3, 'massacre': -3, 'murder': -3, 'nefarious': -3, 'obscene': -3,
        'odious': -3, 'oppressive': -3, 'pathetic': -3, 'pernicious': -3, 'repellent': -3,
        'repulsive': -3, 'revolting': -3, 'revulsion': -3, 'sabotage': -3, 'scathing': -3,
        'scorn': -3, 'scornful': -3, 'sinister': -3, 'spite': -3, 'terrible': -3,
        'terrifying': -3, 'threatening': -3, 'torment': -3, 'tormenting': -3, 'tragic': -3,
        'treacherous': -3, 'ugly': -3, 'unthinkable': -3, 'vile': -3, 'villainous': -3,
        'villain': -3, 'wicked': -3, 'worst': -3
    };

    const negationWords = new Set(['not', "n't", 'no', 'never', 'neither', 'nor', 'hardly', 'barely', 'scarcely', 'seldom', 'rarely', "don't", "doesn't", "didn't", "won't", "wouldn't", "shouldn't", "couldn't", "can't", "cannot", "isn't", "aren't", "wasn't", "weren't"]);

    function analyzeSentiment(text) {
        const words = text.toLowerCase().match(/\b[\w']+\b/g) || [];
        const totalWords = words.length;

        if (totalWords === 0) return null;

        let totalScore = 0;
        let posWords = [], negWords = [];
        let wordScores = [];

        for (let i = 0; i < words.length; i++) {
            const word = words[i];
            const baseScore = sentimentLexicon[word] || 0;

            if (baseScore === 0) continue;

            // Check for negation (within 3 words before)
            let isNegated = false;
            for (let j = Math.max(0, i - 3); j < i; j++) {
                if (negationWords.has(words[j]) || words[j] === "n't") {
                    isNegated = true;
                    break;
                }
            }

            const finalScore = isNegated ? -baseScore : baseScore;
            totalScore += finalScore;

            if (finalScore > 0) {
                posWords.push({ word, score: finalScore });
            } else if (finalScore < 0) {
                negWords.push({ word, score: finalScore });
            }

            wordScores.push({ word, original: baseScore, final: finalScore, negated: isNegated });
        }

        // Normalize to -100 to +100 scale
        const maxPossible = totalWords * 3;
        const normalizedScore = maxPossible > 0 ? (totalScore / maxPossible) * 100 : 0;

        // Determine sentiment
        let sentiment;
        if (normalizedScore > 20) sentiment = 'positive';
        else if (normalizedScore < -20) sentiment = 'negative';
        else sentiment = 'neutral';

        // Confidence
        const scoredWords = posWords.length + negWords.length;
        const coverage = totalWords > 0 ? (scoredWords / totalWords) * 100 : 0;
        const confidence = Math.min(100, coverage * 5 + Math.abs(normalizedScore));

        return {
            sentiment,
            score: normalizedScore,
            totalScore,
            totalWords,
            scoredWords,
            coverage,
            confidence,
            positiveWords: posWords,
            negativeWords: negWords,
            allScores: wordScores
        };
    }

    function analyze() {
        const text = inputEl.value;
        if (!text.trim()) {
            outputEl.textContent = 'Please enter text to analyze';
            return;
        }

        try {
            const result = analyzeSentiment(text);
            if (!result) {
                outputEl.textContent = 'No words to analyze';
                return;
            }

            const scoreDisplay = result.score >= 0 ? `+${result.score.toFixed(1)}` : result.score.toFixed(1);
            const emoji = result.sentiment === 'positive' ? '\u2764\uFE0F' : result.sentiment === 'negative' ? '\u2764\uFE0F\u200D\u2764\uFE0F\u200D\u2764\uFE0F' : '\u2764\uFE0F\u200D\u2764\uFE0F';

            let output = `${emoji} SENTIMENT: ${result.sentiment.toUpperCase()}\n`;
            output += `Score: ${scoreDisplay} / 100\n`;
            output += `Confidence: ${result.confidence.toFixed(1)}%\n\n`;

            // Visual bar
            const barPos = Math.max(0, Math.min(40, Math.round(((result.score + 100) / 200) * 40)));
            const bar = '\u2591'.repeat(barPos) + '\u2588' + '\u2591'.repeat(40 - barPos - 1);
            output += `Negative <---[ ${bar} ]---> Positive\n\n`;

            output += `STATISTICS:\n`;
            output += `  Total words: ${result.totalWords}\n`;
            output += `  Sentiment words found: ${result.scoredWords} (${result.coverage.toFixed(1)}%)\n`;
            output += `  Positive words: ${result.positiveWords.length}\n`;
            output += `  Negative words: ${result.negativeWords.length}\n\n`;

            if (result.positiveWords.length > 0) {
                output += `POSITIVE WORDS:\n`;
                output += result.positiveWords.map(w => `  +${w.score} "${w.word}"`).join('\n') + '\n\n';
            }

            if (result.negativeWords.length > 0) {
                output += `NEGATIVE WORDS:\n`;
                output += result.negativeWords.map(w => `  ${w.score} "${w.word}"`).join('\n') + '\n\n';
            }

            // Sentence-level breakdown
            const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
            if (sentences.length > 1 && sentences.length <= 20) {
                output += `SENTENCE-BY-SENTENCE:\n`;
                sentences.forEach((s, i) => {
                    const sResult = analyzeSentiment(s);
                    if (sResult) {
                        const sScore = sResult.score >= 0 ? `+${sResult.score.toFixed(0)}` : sResult.score.toFixed(0);
                        const sEmoji = sResult.sentiment === 'positive' ? '\u2764\uFE0F' : sResult.sentiment === 'negative' ? '\u2764\uFE0F\u200D\u2764\uFE0F\u200D\u2764\uFE0F' : '\u25CB';
                        output += `  ${sEmoji} [${sScore}] ${s.trim().substring(0, 60)}${s.trim().length > 60 ? '...' : ''}\n`;
                    }
                });
            }

            outputEl.textContent = output;
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
