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
 * Alliteration Generator
 * Generate alliterations (words starting with same letter)
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Alliteration Generator', icon: '\u2705' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const typeEl = $('#type');
    const countEl = $('#count');
    const resultCountEl = $('#resultCount');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const wordsByLetter = {
        'a': ['amber', 'ancient', 'azure', 'angry', 'awesome', 'alert', 'alive', 'alone', 'afraid', 'alright', 'anxious', 'eager', 'able', 'active', 'actual', 'afar', 'agile', 'agree', 'ahead', 'aid', 'aim', 'air', 'aisle', 'alike', 'aloud', 'also', 'always', 'angel', 'angelic', 'apart', 'appear', 'approach', 'argue', 'arise', 'army', 'aroma', 'arrow', 'artful', 'ashamed', 'ask', 'attract', 'autumn', 'avenue', 'award', 'aware', 'away', 'awesome', 'awful', 'awhile'],
        'b': ['brave', 'bold', 'bright', 'blue', 'bitter', 'bouncing', 'beautiful', 'big', 'broad', 'busy', 'best', 'better', 'beyond', 'before', 'began', 'being', 'behind', 'believe', 'below', 'beneath', 'beside', 'between', 'bit', 'bite', 'blank', 'blaze', 'bleak', 'blend', 'bless', 'blind', 'bliss', 'blow', 'bold', 'bone', 'book', 'born', 'borrow', 'both', 'bottle', 'bottom', 'bound', 'bow', 'box', 'branch', 'brass', 'bread', 'break', 'breath', 'breeze', 'brick', 'bridge', 'brief', 'brilliant', 'bring', 'brittle', 'broken', 'bronze', 'brown', 'brush', 'bubble', 'build', 'built', 'bunch', 'burn', 'burst', 'bury', 'bush', 'busy', 'but', 'butter', 'button', 'buzz'],
        'c': ['cool', 'calm', 'clear', 'clean', 'clever', 'cold', 'cosy', 'crimson', 'crystal', 'curious', 'careful', 'caring', 'charming', 'cheerful', 'chief', 'chilly', 'civil', 'classy', 'clean', 'clear', 'close', 'cloudy', 'coarse', 'coast', 'code', 'coin', 'collect', 'color', 'come', 'comfort', 'common', 'compare', 'compass', 'complex', 'compose', 'concept', 'concern', 'conduct', 'confirm', 'connect', 'consider', 'consist', 'consult', 'contain', 'content', 'continue', 'control', 'converse', 'cook', 'cool', 'copper', 'copy', 'corner', 'correct', 'cost', 'cotton', 'cough', 'could', 'count', 'course', 'cover', 'crack', 'craft', 'crash', 'crazy', 'cream', 'create', 'credit', 'creek', 'crew', 'crime', 'crisp', 'crop', 'cross', 'crowd', 'crown', 'crush', 'cry', 'cure', 'curl', 'current', 'curve', 'cut', 'cycle'],
        'd': ['dark', 'deep', 'delicate', 'dense', 'distant', 'divine', 'dry', 'dull', 'daily', 'damp', 'dangerous', 'daring', 'dear', 'decent', 'deaf', 'dear', 'death', 'debate', 'debt', 'decay', 'deceit', 'decide', 'declare', 'decline', 'decorate', 'decrease', 'deed', 'deem', 'defeat', 'defend', 'defer', 'define', 'defy', 'degree', 'delay', 'delete', 'deliver', 'demand', 'denial', 'depend', 'depict', 'deploy', 'depth', 'derive', 'describe', 'desert', 'deserve', 'design', 'desire', 'destroy', 'detail', 'detect', 'determine', 'develop', 'device', 'devise', 'devote', 'dialogue', 'differ', 'digest', 'digit', 'dilemma', 'direct', 'dirt', 'disagree', 'disarm', 'disclose', 'discount', 'discover', 'discuss', 'disease', 'disguise', 'dismiss', 'display', 'dispute', 'dissolve', 'distance', 'distinct', 'distinguish', 'distort', 'distract', 'distribute', 'disturb', 'ditch', 'dive', 'divide', 'divorce', 'dock', 'document', 'dodge', 'donate', 'door', 'double', 'doubt', 'draft', 'drag', 'drain', 'drama', 'dramatic', 'draw', 'dread', 'dream', 'dress', 'drift', 'drill', 'drink', 'drip', 'drive', 'drop', 'drown', 'drug', 'drum', 'dry', 'duck', 'dull', 'dumb', 'dump', 'during', 'dusk', 'dust', 'duty', 'dwell', 'dynamic'],
        'e': ['eager', 'early', 'earnest', 'easy', 'edgy', 'electric', 'elegant', 'empty', 'endless', 'energetic', 'enormous', 'elegant', 'eternal', 'every', 'evil', 'exact', 'eager', 'ear', 'earth', 'ease', 'east', 'eat', 'echo', 'edge', 'edit', 'educate', 'effect', 'effort', 'eight', 'either', 'eject', 'elaborate', 'elate', 'elbow', 'elder', 'elect', 'element', 'elevate', 'elicit', 'eliminate', 'elite', 'eloquent', 'embrace', 'emerge', 'emit', 'emotion', 'employ', 'empty', 'enable', 'enact', 'enclose', 'encode', 'encounter', 'end', 'endure', 'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlarge', 'enlist', 'ensure', 'enter', 'entertain', 'entitle', 'entry', 'envision', 'equal', 'equate', 'equip', 'era', 'erase', 'erect', 'error', 'escape', 'escort', 'essay', 'essence', 'establish', 'estate', 'esteem', 'estimate', 'etch', 'eternal', 'ethics', 'evaluate', 'evade', 'even', 'event', 'ever', 'every', 'evidence', 'evoke', 'evolve', 'exact', 'examine', 'example', 'exceed', 'excel', 'except', 'excess', 'exchange', 'excite', 'exclude', 'excuse', 'execute', 'exercise', 'exhaust', 'exhibit', 'exist', 'exit', 'expand', 'expect', 'expel', 'expert', 'explain', 'explode', 'explore', 'export', 'expose', 'express', 'extend', 'extent', 'exterior', 'external', 'extra', 'extract', 'extreme', 'eye'],
        'f': ['fair', 'fake', 'false', 'fancy', 'fast', 'fierce', 'fine', 'firm', 'first', 'flat', 'fleeting', 'fluent', 'fond', 'foolish', 'foreign', 'formal', 'former', 'frail', 'frank', 'free', 'fresh', 'friendly', 'full', 'faint', 'faith', 'fall', 'false', 'fame', 'famous', 'fan', 'fancy', 'far', 'fare', 'farm', 'farther', 'fashion', 'fast', 'fate', 'father', 'fathom', 'fault', 'favor', 'fear', 'feast', 'feat', 'feature', 'feed', 'feel', 'fellow', 'female', 'fence', 'few', 'fever', 'field', 'fierce', 'fifteen', 'fifth', 'fifty', 'fight', 'figure', 'file', 'fill', 'film', 'filter', 'final', 'finance', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'first', 'fish', 'fit', 'five', 'fix', 'flag', 'flame', 'flash', 'flat', 'flavor', 'flee', 'flesh', 'flew', 'flight', 'float', 'flock', 'flood', 'floor', 'flow', 'flower', 'fluid', 'fly', 'focus', 'fog', 'fold', 'follow', 'food', 'fool', 'foot', 'for', 'force', 'ford', 'forecast', 'forest', 'forever', 'forget', 'forgive', 'form', 'format', 'former', 'formula', 'fort', 'fortune', 'forty', 'forward', 'fossil', 'foster', 'fought', 'found', 'four', 'fourth', 'frame', 'fraud', 'free', 'freedom', 'freeze', 'french', 'frequent', 'fresh', 'friction', 'friend', 'fright', 'from', 'front', 'frost', 'fruit', 'fuel', 'fulfill', 'full', 'fun', 'function', 'fund', 'funeral', 'funny', 'fur', 'fury', 'future'],
        'g': ['gentle', 'ghostly', 'giant', 'glad', 'glorious', 'golden', 'good', 'gorgeous', 'grand', 'grateful', 'gray', 'great', 'green', 'grim', 'grand', 'gallant', 'gaping', 'garish', 'gaudy', 'gaunt', 'generous', 'genial', 'gentle', 'genuine', 'ghostly', 'giant', 'giddy', 'gifted', 'gigantic', 'gilded', 'ginger', 'giving', 'glaring', 'glazed', 'glib', 'global', 'gloomy', 'glorious', 'glowing', 'golden', 'good', 'gorgeous', 'gothic', 'graceful', 'gradual', 'grand', 'grateful', 'grave', 'gray', 'greedy', 'green', 'grey', 'grieving', 'grim', 'gross', 'grounded', 'growing', 'guarded', 'guilty', 'gutsy'],
        'h': ['happy', 'harsh', 'heavy', 'hidden', 'high', 'hollow', 'honest', 'hopeful', 'huge', 'humble', 'hungry', 'hasty', 'haunted', 'hallowed', 'handsome', 'harsh', 'hazardous', 'headstrong', 'healing', 'healthy', 'heartfelt', 'hearty', 'heavy', 'helpful', 'heroic', 'hidden', 'high', 'historic', 'hoarse', 'holy', 'homeless', 'hopeful', 'horrible', 'hot', 'huge', 'humble', 'humid', 'hungry', 'hush', 'hurt'],
        'i': ['icy', 'ideal', 'ill', 'immense', 'immortal', 'important', 'impossible', 'impressive', 'innocent', 'invisible', 'isolated', 'itchy', 'idolized', 'ignorant', 'ill-fated', 'imaginary', 'immature', 'immediate', 'immense', 'imminent', 'immortal', 'impartial', 'impatient', 'implicit', 'important', 'impossible', 'impressive', 'improper', 'inborn', 'inbred', 'incomplete', 'incredible', 'independent', 'indirect', 'inevitable', 'infamous', 'infinite', 'informal', 'inherent', 'initial', 'injured', 'innocent', 'insane', 'insecure', 'insignificant', 'instant', 'intact', 'intelligent', 'intense', 'interior', 'internal', 'intimate', 'invisible', 'involved'],
        'j': ['jolly', 'joyful', 'just', 'juvenile', 'jagged', 'jovial', 'jealous', 'joint', 'jubilant', 'judicious', 'juicy', 'jumbled', 'junior', 'jagged', 'jarring', 'jaunty', 'jazzy', 'jeering', 'jeopardous', 'joking', 'jovial', 'joyful', 'jubilant', 'judgmental', 'juicy', 'jumbled', 'jumping', 'jumpy', 'just', 'juvenile'],
        'k': ['keen', 'kind', 'kindly', 'knowing', 'knowledgeable', 'knotty', 'keen', 'key', 'khaki', 'kind', 'kindhearted', 'kindly', 'kinetic', 'keyed', 'kick', 'kid', 'kill', 'kind', 'king', 'kiss', 'kitchen', 'kite', 'kitty', 'knack', 'kneel', 'knew', 'knife', 'knight', 'knit', 'knob', 'knot', 'knock', 'know', 'knowledge'],
        'l': ['light', 'lonely', 'lost', 'loud', 'lovely', 'large', 'lazy', 'little', 'lucky', 'lame', 'late', 'lavish', 'leaden', 'lean', 'left', 'legal', 'legitimate', 'leisurely', 'lethal', 'liberal', 'light', 'like', 'likely', 'limited', 'linear', 'lingering', 'liquid', 'literate', 'little', 'lively', 'living', 'loathsome', 'local', 'lofty', 'lonely', 'long', 'loose', 'lopsided', 'loud', 'lovely', 'low', 'loyal', 'lucky', 'luminous', 'lunar', 'lush', 'luxurious'],
        'm': ['merry', 'mild', 'mysterious', 'mighty', 'magical', 'magnificent', 'major', 'meek', 'mellow', 'merciful', 'messy', 'modest', 'moody', 'mysterious', 'mystic', 'mad', 'magic', 'magnetic', 'main', 'make', 'male', 'malicious', 'manage', 'manly', 'manual', 'many', 'marble', 'marginal', 'marked', 'married', 'massive', 'master', 'material', 'mature', 'maximum', 'meager', 'meaningful', 'measurable', 'mechanical', 'medical', 'medium', 'meek', 'melancholy', 'melodic', 'melt', 'memorable', 'mental', 'merry', 'messy', 'metallic', 'mild', 'military', 'milky', 'miserable', 'miserly', 'modern', 'modest', 'moist', 'momentary', 'monetary', 'monthly', 'monstrous', 'moral', 'mortified', 'motionless', 'muddy', 'multiple', 'musical', 'mute', 'mutual', 'mysterious', 'mystic'],
        'n': ['narrow', 'nasty', 'neat', 'new', 'noble', 'noisy', 'normal', 'nervous', 'nimble', 'notable', 'naive', 'nameless', 'naked', 'narrow', 'nasal', 'nasty', 'national', 'natural', 'naughty', 'naval', 'navigable', 'near', 'nearby', 'neat', 'necessary', 'negative', 'neighboring', 'nervous', 'nestled', 'neutral', 'new', 'next', 'nice', 'nimble', 'nifty', 'nightly', 'noble', 'noisy', 'nominal', 'nonstop', 'normal', 'northern', 'nosy', 'notable', 'noted', 'novel', 'noxious', 'nuclear', 'numb', 'numerous', 'nutritious'],
        'o': ['old', 'odd', 'open', 'orange', 'outgoing', 'overjoyed', 'obedient', 'objective', 'obliging', 'obvious', 'obnoxious', 'obscene', 'obscure', 'observant', 'obsessed', 'obsolete', 'obstinate', 'obtuse', 'obvious', 'occasional', 'occupied', 'odd', 'offensive', 'official', 'old', 'ominous', 'open', 'opposite', 'optimistic', 'optional', 'orange', 'ordinary', 'organic', 'organized', 'original', 'ornery', 'ornate', 'outgoing', 'outrageous', 'outstanding', 'overjoyed', 'overt', 'overwhelming', 'own'],
        'p': ['peaceful', 'perfect', 'pink', 'playful', 'pleasant', 'proud', 'pale', 'petite', 'poor', 'pure', 'pale', 'pallid', 'paltry', 'panicky', 'panoramic', 'parallel', 'parched', 'passionate', 'pastel', 'pastoral', 'patient', 'patriotic', 'peaceful', 'peachy', 'pearly', 'pedantic', 'peerless', 'pensive', 'peppy', 'perfect', 'perky', 'petite', 'petrified', 'petty', 'phenomenal', 'philosophical', 'phobic', 'photogenic', 'physical', 'picturesque', 'piercing', 'pink', 'pious', 'pithy', 'pivotal', 'placid', 'plain', 'plane', 'plastic', 'plausible', 'playful', 'pleasant', 'pleased', 'pleasing', 'plucky', 'plump', 'plus', 'pocket', 'poetic', 'pointed', 'pointless', 'poised', 'polished', 'polite', 'political', 'poor', 'popular', 'portable', 'posh', 'positive', 'possible', 'potential', 'powerful', 'practical', 'precious', 'precise', 'premier', 'premium', 'present', 'presidential', 'pretty', 'priceless', 'prickly', 'prime', 'prim', 'principal', 'pristine', 'private', 'prized', 'productive', 'professional', 'profuse', 'profound', 'prominent', 'proper', 'proud', 'prudent', 'psychological', 'public', 'puffy', 'pumped', 'punctual', 'puny', 'pure', 'purple', 'purposeful', 'pushy', 'puzzled', 'pyrotechnic'],
        'q': ['quiet', 'quick', 'queer', 'questionable', 'quaint', 'qualified', 'quaint', 'queasy', 'queenly', 'quick', 'quiet', 'quirky', 'quixotic'],
        'r': ['rare', 'ready', 'real', 'red', 'rich', 'ripe', 'rough', 'round', 'royal', 'rude', 'ragged', 'rainy', 'rapid', 'rare', 'rational', 'raw', 'ready', 'real', 'realistic', 'reasonable', 'reassuring', 'rebel', 'recent', 'reckless', 'recondite', 'rectangular', 'red', 'regular', 'reliable', 'relieved', 'remarkable', 'remote', 'renewed', 'repulsive', 'resolute', 'resonant', 'respectful', 'responsible', 'restless', 'retired', 'rich', 'ridiculous', 'right', 'righteous', 'rigid', 'ripe', 'risky', 'ritzy', 'roasted', 'robust', 'rocky', 'romantic', 'roomy', 'rosy', 'rotten', 'rough', 'round', 'royal', 'rubber', 'rude', 'rugged', 'ruined', 'rumbling', 'rural', 'rustic', 'ruthless'],
        's': ['sweet', 'soft', 'silly', 'shiny', 'silent', 'sincere', 'slim', 'slow', 'sleek', 'sly', 'smooth', 'sparkling', 'spicy', 'splendid', 'stunning', 'sublime', 'sunny', 'super', 'scared', 'scarce', 'scary', 'scenic', 'secret', 'secure', 'selfish', 'separate', 'serious', 'shabby', 'shallow', 'sharp', 'sheer', 'short', 'shy', 'shabby', 'shadowy', 'shady', 'shallow', 'shameful', 'shapely', 'sharp', 'sheepish', 'shiny', 'shivering', 'shocking', 'short', 'showy', 'shrill', 'shy', 'sick', 'silent', 'silky', 'silly', 'simple', 'sinful', 'single', 'sizable', 'skilled', 'skillful', 'skinny', 'sleepy', 'slick', 'slim', 'slimy', 'slippery', 'sloppy', 'slow', 'small', 'smart', 'smelly', 'smiling', 'smoggy', 'smooth', 'snappy', 'sneaky', 'snobbish', 'soaked', 'soaring', 'soft', 'soggy', 'solemn', 'solid', 'solitary', 'some', 'sophisticated', 'sore', 'sorrowful', 'sound', 'sour', 'sparkling', 'sparse', 'specific', 'spicy', 'spiffy', 'spiky', 'spiritual', 'splendid', 'spontaneous', 'spotless', 'spotless', 'spry', 'square', 'squeaky', 'squealing', 'stable', 'stale', 'stark', 'starry', 'steel', 'steep', 'stereotyped', 'stern', 'sticky', 'stiff', 'still', 'stingy', 'stormy', 'straight', 'strange', 'strict', 'strong', 'stunning', 'stupendous', 'sturdy', 'subdued', 'substantial', 'subtle', 'successful', 'sudden', 'sugary', 'suitable', 'sunny', 'super', 'superficial', 'superior', 'supreme', 'sure', 'surprised', 'suspicious', 'swank', 'sweet', 'swift', 'symptomatic', 'synonymous', 'systematic'],
        't': ['tall', 'tender', 'tense', 'terrible', 'thick', 'thin', 'tiny', 'tired', 'tremendous', 'true', 'tame', 'tan', 'tart', 'tasty', 'tearful', 'technical', 'teeny', 'telling', 'temperamental', 'tender', 'tense', 'tenuous', 'terrible', 'terrific', 'tested', 'testy', 'thankful', 'theatrical', 'thick', 'thinkable', 'third', 'thirsty', 'thorny', 'thorough', 'thoughtful', 'thoughtless', 'thrifty', 'thrilling', 'tight', 'tidy', 'timely', 'tiny', 'tired', 'tolerant', 'top', 'tormented', 'total', 'tough', 'towering', 'toxic', 'traditional', 'tranquil', 'tragic', 'treasured', 'tremendous', 'tricky', 'trite', 'tropical', 'troubled', 'trusted', 'trustworthy', 'truthful', 'tumultuous', 'tuneful', 'turbulent', 'twin', 'twinkly', 'twin', 'twisted', 'typical'],
        'u': ['ugly', 'ultimate', 'unusual', 'upbeat', 'upset', 'used', 'unfortunate', 'unhappy', 'unhealthy', 'uniform', 'unique', 'united', 'universal', 'unknown', 'unlucky', 'unnatural', 'unpleasant', 'unreal', 'unripe', 'unruly', 'unselfish', 'unsightly', 'unusual', 'upbeat', 'uppity', 'upset', 'uptight', 'used', 'useful', 'useless', 'usual', 'utter', 'uttermost'],
        'v': ['vast', 'vivid', 'vital', 'victorious', 'valuable', 'various', 'vengeful', 'venomous', 'verdant', 'versed', 'vexed', 'vibrant', 'vicious', 'victorious', 'vigorous', 'villainous', 'violent', 'violet', 'virtual', 'virtuous', 'visible', 'vivacious', 'vivid', 'vocal', 'voiceless', 'void', 'volatile', 'volcanic', 'voluminous', 'vulnerable', 'warm', 'wary', 'wasteful', 'watery', 'weak', 'weary', 'welcome', 'well', 'wet', 'whimsical', 'white', 'whole', 'wicked', 'wide', 'wild', 'willing', 'windy', 'wiry', 'wise', 'witty', 'wonderful', 'wooden', 'wonderful', 'worried', 'worthless', 'worthy', 'wretched', 'wrong', 'young', 'yummy', 'zealous', 'zany', 'zesty'],
        'w': ['warm', 'wary', 'weak', 'wealthy', 'weary', 'wet', 'wild', 'wise', 'wonderful', 'wooden', 'worried', 'wretched', 'wide', 'witty', 'welcome', 'well', 'whimsical', 'white', 'whole', 'wicked', 'willing', 'windy', 'wiry', 'wonderful', 'worried', 'worthless', 'worthy', 'wretched', 'wrong'],
        'x': ['xenial', 'xenophobic', 'xeric', 'xyloid', 'xanthic'],
        'y': ['young', 'yellow', 'yielding', 'yummy', 'youthful', 'yearning', 'yawning', 'yearly', 'yawning', 'yearlong', 'yeasty', 'yellowish', 'yielding', 'yodeling', 'yokelish', 'young', 'youthful', 'yucky'],
        'z': ['zealous', 'zany', 'zesty', 'zippy', 'zero', 'zonal', 'zooming', 'zombie', 'zephyr', 'zigzag']
    };

    // Common alliterative phrases
    const phrases = {
        'a': ['achingly adorable', 'always amazing', 'astonishingly awesome', 'absolutely amazing', 'amazingly awesome', 'astonishingly attractive', 'adorably amusing', 'angrily arguing', 'always available', 'ambitiously attempting', 'artfully arranged', 'almost always', 'awfully anxious', 'amazingly adept', 'aggressively advancing'],
        'b': ['beautifully bold', 'bravely breaking', 'bouncing baby', 'bitterly betrayed', 'boldly blazing', 'bright and beautiful', 'briskly breeze', 'barely believable', 'blazing bright', 'bubbling brook', 'blushing bride', 'big and bold', 'busy buzzing', 'blindly believing', 'bitterly broken'],
        'c': ['crystal clear', 'cool calm', 'crazy chaotic', 'creeping cold', 'calm and collected', 'carefully crafted', 'courageously charging', 'cold cruel', 'completely confused', 'curiously captivating', 'cleverly concealed', 'constantly changing', 'curiously cute', 'chattering children', 'carefree child'],
        'd': ['dark and dreary', 'daringly different', 'deep dark', 'dangerous descent', 'deafening drums', 'drowsy dreams', 'delightfully daring', 'desperately depressed', 'divinely designed', 'daily duties', 'deadly dull', 'dancing daffodils', 'dreamily drifting', 'dutifully done', 'dramatically different'],
        'e': ['endlessly enchanting', 'ever eager', 'extraordinarily excellent', 'eternally enduring', 'eagerly exploring', 'elegantly executed', 'eminently eligible', 'ever evolving', 'exquisitely exquisite', 'entirely enchanted', 'endlessly entertaining', 'enchantingly elegant', 'ever efficient', 'exceedingly eager'],
        'f': ['fiercely faithful', 'faintly fragrant', 'fabulously famous', 'foolishly fancy', 'fully focused', 'fearfully frightened', 'freely flowing', 'frosty fog', 'flaming fury', 'freshly fallen', 'fluttering flags', 'fondly remembered', 'faithful friend', 'flickering flame', 'feverishly frantic'],
        'g': ['gleaming golden', 'gently glowing', 'gracefully gliding', 'grand and glorious', 'grimly grinning', 'gently gleaming', 'giggling girl', 'gallantly going', 'glistening gold', 'gratefully given', 'greatly gifted', 'gaily garlanded', 'gently gazing', 'growing green', 'gloriously good'],
        'h': ['happily humming', 'hopelessly helpless', 'honestly humble', 'heavily hanging', 'heartfelt hope', 'hauntingly beautiful', 'highly honored', 'humbly hoping', 'hastily hidden', 'helplessly hovering', 'heartily happy', 'honestly honorable', 'harmoniously humming', 'holy heaven', 'heroically helping'],
        'i': ['incredibly inspiring', 'intensely interesting', 'impossibly incredible', 'innocently ignorant', 'irresistibly inviting', 'incredibly important', 'intimately involved', 'impressively illustrated', 'intelligently interpreted', 'ideally imagined', 'infinitely interesting', 'insanely incredible', 'instantly ignited', 'irrevocably intertwined'],
        'j': ['joyfully jumping', 'jubilantly celebrating', 'just joking', 'joyfully jingling', 'jagged and jagged', 'jealously judging', 'jokingly jesting', 'jovially joking', 'jaggedly jutting', 'joyously jumping', 'justifiably jealous', 'jubilantly jumping', 'jauntily jogging', 'joyfully jubilant', 'jokingly joking'],
        'k': ['kindly keeping', 'keenly knowing', 'kissingly kind', 'knavishly known', 'kindheartedly caring', 'knowingly nodding', 'knightly known', 'kiddingly keeping', 'kindly kissing', 'keenly kind', 'kindly king', 'keeping knowledge', 'kaleidoscopic kingdom', 'knowing and kind'],
        'l': ['lovingly looking', 'laughing loudly', 'lightly laughing', 'luminously lovely', 'lazily lingering', 'loudly lamenting', 'lightly lingering', 'lusciously lovely', 'lonely looking', 'lost and lonely', 'lovely lingering', 'laughing lovers', 'limpidly luminous', 'languidly lingering', 'luminously light'],
        'm': ['merrily making', 'mystically magical', 'miserably miserable', 'marvelously mysterious', 'melancholy mood', 'moonlit meadow', 'murmuring murmurs', 'madly making', 'majestically magnificent', 'meekly making', 'misty morning', 'mysteriously magical', 'mightily motivated', 'melodically mellow', 'magnificently made'],
        'n': ['never neglecting', 'nicely noted', 'naturally nervous', 'neverending nightmare', 'newly named', 'nearly naked', 'nobly noted', 'never saying never', 'noticeably nervous', 'neatly nibbled', 'nervously navigating', 'narrowly navigating', 'nimbly moving', 'noisily noisy', 'noticeably noticeable'],
        'o': ['overwhelmingly optimistic', 'oddly oblivious', 'openly opposing', 'obviously outstanding', 'overjoyed and optimistic', 'once upon', 'only option', 'often observed', 'openly offered', 'outstandingly original', 'overwhelmingly overjoyed', 'ornately ornamented', 'offensively obvious', 'outwardly optimistic'],
        'p': ['perfectly peaceful', 'peacefully playing', 'painfully pathetic', 'positively perfect', 'properly placed', 'playfully prancing', 'powerfully potent', 'pleasantly pleased', 'purely passionate', 'perfectly planned', 'proudly prancing', 'patiently persisting', 'pale and pasty', 'persistently pursuing', 'poetically phrased'],
        'q': ['quietly questioning', 'quickly quitting', 'quaintly quiet', 'queerly questioning', 'queenly quiet', 'quietly queuing', 'quickly questioning', 'quintessentially quiet', 'quizzically questioning', 'quietly quaint'],
        'r': ['radiantly radiant', 'restlessly roaming', 'roughly roaming', 'romantically remembering', 'rugged and raw', 'rarely returning', 'readily ready', 'recklessly running', 'resolutely resisting', 'richly rewarding', 'radiant rainbow', 'ruthlessly ruling', 'rapidly running', 'rhythmically rocking', 'rosy red'],
        's': ['sweetly sleeping', 'silently slipping', 'softly singing', 'sadly sobbing', 'strangely silent', 'suddenly stopping', 'sweetly smiling', 'seriously stunning', 'simply stunning', 'subtly shifting', 'stunningly successful', 'sweetly serene', 'shimmering silver', 'slowly slipping', 'softly speaking'],
        't': ['truly touching', 'tenderly touching', 'tremendously tall', 'terribly terrified', 'tightly twisted', 'tender and true', 'thick and thin', 'totally transformed', 'tirelessly trying', 'tantalizingly tasty', 'tragically torn', 'tastefully trimmed', 'tenderly treasured', 'totally terrific', 'timidly touching'],
        'u': ['utterly unique', 'unusually unique', 'unbelievably unique', 'unexpectedly unlucky', 'uncommonly understanding', 'unfailingly upbeat', 'ultimately useful', 'undeniably unmatched', 'unmistakably unforgettable', 'unquestionably unmatched', 'understandably upset', 'unwaveringly unyielding', 'universally understood', 'unusually unassuming', 'utterly unbelievable'],
        'v': ['vividly vibrant', 'very victorious', 'violently vibrating', 'vastly various', 'virtually victorious', 'vigorously venturing', 'valiantly venturing', 'visibly vibrant', 'voraciously voracious', 'victoriously victorious', 'volubly vocal', 'viscerally vivid', 'very very', 'vividly varied', 'valiantly valiant'],
        'w': ['warmly welcoming', 'wildly wandering', 'whispering winds', 'wonderfully wicked', 'weary walking', 'wistfully watching', 'wildly wonderful', 'wearily waiting', 'wisely warning', 'wholeheartedly wanting', 'warmly wishing', 'willfully willing', 'whimsically wandering', 'wonderfully wonderful', 'watchfully waiting'],
        'x': ['xenially xenial', 'xeric xeric'],
        'y': ['youthfully yearning', 'yearningly youthful', 'yellow yonder', 'youthfully young', 'yawningly yawning', 'youthfully yours', 'yelling youthfully'],
        'z': ['zealously zinging', 'zestfully zapping', 'zippily zooming', 'zealously zoned', 'zestfully zealous', 'zany zooming']
    };

    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function generateAlliterations(letter, type, count) {
        letter = letter.toLowerCase().trim();
        const results = [];

        if (type === 'phrases' && phrases[letter]) {
            const available = [...phrases[letter]];
            const num = Math.min(count, available.length);
            // Shuffle and pick
            for (let i = 0; i < num; i++) {
                const idx = Math.floor(Math.random() * available.length);
                results.push(available.splice(idx, 1)[0]);
            }
        } else {
            const words = wordsByLetter[letter] || [];
            if (words.length === 0) {
                return ['No words found for this letter'];
            }

            if (type === 'words') {
                const available = [...words];
                const num = Math.min(count, available.length);
                for (let i = 0; i < num; i++) {
                    const idx = Math.floor(Math.random() * available.length);
                    results.push(available.splice(idx, 1)[0]);
                }
            } else {
                // Mixed: generate phrases using available words
                const available = [...words];
                for (let i = 0; i < count; i++) {
                    const w1 = pick(available);
                    const w2 = pick(available);
                    const adverb = pick(['ably', 'ly', 'ily', 'ously', 'ently']);
                    results.push(capitalize(w1 + ' ' + w2));
                }
            }
        }

        return results.length > 0 ? results : ['No results found for this letter'];
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function generate() {
        const letter = inputEl.value.trim();
        if (!letter) {
            outputEl.textContent = 'Please enter a starting letter';
            return;
        }

        const results = generateAlliterations(letter[0], typeEl.value, parseInt(countEl.value) || 10);
        resultCountEl.textContent = results.length;

        if (typeEl.value === 'words') {
            outputEl.textContent = results.join(', ');
        } else {
            outputEl.textContent = results.join('\n');
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        resultCountEl.textContent = '0';
        inputEl.focus();
    }

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('input', (e) => {
        e.target.value = e.target.value.slice(0, 1);
    });
    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generate();
    });
});
