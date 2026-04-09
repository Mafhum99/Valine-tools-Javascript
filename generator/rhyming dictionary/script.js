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
 * Rhyming Dictionary
 * Find words that rhyme with input
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Rhyming Dictionary', icon: '\uD83C\uDFB6' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const countEl = $('#count');
    const rhymeTypeEl = $('#rhymeType');
    const findBtn = $('#find');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Common word groups organized by ending sounds
    const rhymeGroups = {
        'ight': ['light', 'night', 'right', 'sight', 'flight', 'fight', 'bright', 'might', 'tight', 'white', 'fright', 'plight', 'slight', 'knight', 'blight', 'delight', 'tonight', 'upright', 'insight', 'midnight', 'sunlight', 'moonlight', 'spotlight', 'starlight', 'daylight', 'firelight', 'candlelight', 'twilight', 'eyesight', 'foresight'],
        'ove': ['love', 'above', 'dove', 'glove', 'shove', 'thereof'],
        'ain': ['rain', 'pain', 'gain', 'train', 'brain', 'main', 'chain', 'plain', 'vain', 'drain', 'stain', 'grain', 'Spain', 'cane', 'lane', 'mane', 'plane', 'sane', 'wane', 'certain', 'mountain', 'fountain', 'captain', 'curtain', 'Britain', 'domain', 'remain', 'explain', 'obtain', 'sustain', 'contain', 'entertain', 'complain', 'refrain', 'campaign'],
        'ime': ['time', 'rhyme', 'climb', 'prime', 'mime', 'dime', 'crime', 'chime', 'lime', 'slime', 'sublime', 'paradigm', 'pastime', 'bedtime', 'meantime', 'sometime', 'overtime', 'anytime', 'lifetime', 'wintertime', 'springtime', 'summertime', 'maritime'],
        'eam': ['dream', 'stream', 'team', 'cream', 'beam', 'seem', 'steam', 'theme', 'extreme', 'scheme', 'supreme', 'redeem', 'esteem', 'gleam', 'scream', 'regime', 'mainstream', 'upstream', 'downstream', 'daydream', 'esteem'],
        'ear': ['hear', 'fear', 'near', 'dear', 'clear', 'year', 'tear', 'beer', 'cheer', 'appear', 'disappear', 'career', 'pioneer', 'atmosphere', 'everywhere', 'here', 'there', 'where', 'sincere', 'severe', 'steer', 'gear', 'peer', 'rear', 'sheer', 'smear', 'spear', 'weir', 'interfere', 'volunteer', 'engineer', 'cashier'],
        'ay': ['day', 'way', 'say', 'play', 'stay', 'away', 'today', 'may', 'pay', 'say', 'gray', 'pray', 'sway', 'clay', 'display', 'delay', 'relay', 'survey', 'obey', 'birthday', 'holiday', 'always', 'gateway', 'highway', 'railway', 'subway', 'pathway', 'hallway', 'driveway', 'runway', 'sideway', 'everyday', 'yesterday', 'midway', 'breakaway', 'getaway', 'hideaway', 'castaway', 'stowaway'],
        'all': ['fall', 'call', 'wall', 'all', 'tall', 'small', 'hall', 'ball', 'crawl', 'stall', 'recall', 'install', 'enthrall', 'overall', 'waterfall', 'windfall', 'downfall', 'freefall', 'baseball', 'football', 'basketball', 'snowball', 'fireball', 'payroll', 'paywall', 'townhall'],
        'ight': ['light', 'night', 'right', 'sight', 'might', 'fight', 'flight', 'tight', 'white', 'bright', 'slight', 'fright', 'knight', 'plight', 'blight', 'delight', 'tonight', 'insight', 'upright', 'midnight', 'sunlight', 'moonlight', 'starlight', 'spotlight', 'firelight', 'candlelight', 'twilight'],
        'ow': ['flow', 'grow', 'know', 'show', 'glow', 'slow', 'blow', 'snow', 'throw', 'below', 'bow', 'crow', 'row', 'sow', 'tow', 'bestow', 'overflow', 'undergo', 'hello', 'low', 'ago', 'so', 'no', 'go', 'do', 'who', 'you', 'through', 'too', 'two', 'new', 'few', 'blue', 'true', 'clue', 'drew', 'flew', 'grew', 'knew', 'threw', 'pursue', 'review', 'view', 'crew', 'due', 'issue', 'renew', 'stew', 'zoo', 'shoe'],
        'ing': ['sing', 'ring', 'king', 'thing', 'spring', 'string', 'wing', 'bring', 'swing', 'cling', 'sting', 'fling', 'fling', 'bling', 'sling', 'zing', 'everything', 'anything', 'something', 'nothing', 'morning', 'evening', 'during', 'feeling', 'meaning', 'seeing', 'being', 'living', 'giving', 'loving', 'hoping', 'dreaming', 'believing', 'running', 'coming', 'going', 'doing', 'making', 'taking', 'breaking', 'shaking', 'waking'],
        'ore': ['more', 'door', 'floor', 'store', 'core', 'before', 'explore', 'ignore', 'restore', 'pour', 'shore', 'score', 'snore', 'roar', 'adore', 'encore', 'outdoor', 'indoor', 'therefore', 'wherefore', 'galore', 'chore', 'bore', 'tore', 'wore', 'sore', 'lore', 'pore', 'soar', 'four', 'your', 'tour'],
        'ace': ['face', 'place', 'space', 'race', 'grace', 'trace', 'pace', 'base', 'case', 'chase', 'embrace', 'replace', 'erase', 'space', 'disgrace', 'workplace', 'database', 'sunspace', 'fireplace', 'marketplace', 'landscape', 'airspace', 'timeframe', 'name', 'fame', 'game', 'same', 'flame', 'frame', 'blame', 'shame', 'claim', 'aim', 'came', 'became', 'came'],
        'old': ['old', 'cold', 'hold', 'gold', 'bold', 'told', 'fold', 'sold', 'behold', 'mold', 'scold', 'unfold', 'withhold', 'controlled', 'enrolled', 'manifold'],
        'ine': ['fine', 'line', 'mine', 'wine', 'shine', 'design', 'divine', 'combine', 'define', 'decline', 'refine', 'outline', 'align', 'assign', 'shine', 'vine', 'pine', 'nine', 'dine', 'sign', 'twine', 'whine', 'brine', 'spine', 'mine', 'sublime', 'routine', 'magazine', 'machine', 'marine', 'serpentine', 'valentine', 'dolphin', 'within', 'begin'],
        'one': ['one', 'stone', 'alone', 'bone', 'tone', 'phone', 'zone', 'clone', 'known', 'grown', 'shown', 'thrown', 'blown', 'flown', 'grown', 'mown', 'sown', 'own', 'down', 'town', 'brown', 'crown', 'frown', 'drown', 'gown', 'renown', 'postpone', 'unknown', 'overgrown', 'bone', 'cone', 'hone', 'prone', 'drone', 'throne', 'crone', 'stone'],
        'ain': ['rain', 'pain', 'gain', 'main', 'brain', 'train', 'chain', 'plain', 'vain', 'drain', 'stain', 'grain', 'explain', 'remain', 'contain', 'obtain', 'maintain', 'entertain', 'sustain', 'complain', 'refrain', 'certain', 'mountain', 'fountain', 'captain', 'curtain', 'Britain', 'domain', 'campaign', 'Spain', 'terrain', 'champagne', 'cocaine'],
        'ell': ['tell', 'well', 'sell', 'bell', 'cell', 'fell', 'hell', 'shell', 'spell', 'swell', 'smell', 'dwell', 'yell', 'compel', 'expel', 'repel', 'dispel', 'farewell', 'as well', 'citadel', 'parallel', 'carousel', 'hotel', 'motel', 'novel'],
        'end': ['end', 'friend', 'send', 'spend', 'bend', 'lend', 'trend', 'blend', 'defend', 'depend', 'attend', 'extend', 'intend', 'pretend', 'recommend', 'amend', 'mend', 'transcend', 'weekend', 'boyfriend', 'girlfriend'],
        'eep': ['deep', 'sleep', 'keep', 'steep', 'creep', 'sweep', 'weep', 'leap', 'heap', 'sheep', 'cheap', 'peep', 'jeep', 'asleep'],
        'ood': ['good', 'wood', 'stood', 'could', 'should', 'would', 'hood', 'food', 'mood', 'brood', 'flood', 'childhood', 'neighborhood', 'likelihood', 'understood', 'misunderstood', 'fatherhood', 'motherhood', 'brotherhood', 'livelihood', 'adulthood', 'womanhood', 'manhood'],
        'ind': ['find', 'mind', 'kind', 'blind', 'behind', 'wind', 'bind', 'grind', 'remind', 'unwind', 'rewind', 'behind', 'mankind', 'humankind', 'behind', 'inclined', 'resigned', 'designed', 'combined', 'defined', 'declined', 'refined', 'aligned', 'assigned', 'divined', 'enshrined'],
        'art': ['heart', 'art', 'start', 'part', 'smart', 'cart', 'dart', 'chart', 'depart', 'apart', 'impart', 'restart', 'counterpart', 'sweetheart', 'upstart'],
        'ound': ['sound', 'found', 'round', 'ground', 'bound', 'around', 'beyond', 'profound', 'compound', 'surround', 'astound', 'abound', 'resound', 'mound', 'hound', 'wound', 'pound', 'astound', 'confound', 'expound', 'astound', 'surround', 'astound'],
        'eal': ['feel', 'real', 'deal', 'steal', 'meal', 'heal', 'seal', 'reveal', 'conceal', 'appeal', 'ideal', 'wheel', 'steel', 'kneel', 'peel', 'reveal', 'surreal', 'carnival', 'festival'],
        'urn': ['turn', 'burn', 'learn', 'yearn', 'earn', 'concern', 'return', 'discern', 'adjourn', 'spurn', 'urn', 'concern', 'return', 'in turn'],
        'ark': ['dark', 'park', 'mark', 'spark', 'bark', 'shark', 'stark', 'embark', 'remark', 'landmark', 'bookmark', 'hallmark', 'card', 'yard', 'hard', 'guard', 'regard', 'award', 'reward', 'forward', 'afterward', 'backward', 'upward', 'outward', 'inward', 'toward', 'onward', 'standard', 'guard', 'orchard', 'mustard', 'bastard'],
        'est': ['best', 'test', 'rest', 'west', 'nest', 'quest', 'guest', 'chest', 'crest', 'fest', 'invest', 'suggest', 'digest', 'protest', 'arrest', 'contest', 'request', 'manifest', 'harvest', 'honest', 'interest', 'forest', 'latest', 'greatest', 'finest', 'highest', 'brightest'],
        'ess': ['less', 'dress', 'guess', 'press', 'success', 'address', 'express', 'impress', 'progress', 'possess', 'confess', 'excess', 'stress', 'mess', 'chess', 'bless', 'guess', 'caress', 'profess', 'unless', 'nevertheless', 'regardless'],
        'ity': ['city', 'pity', 'beauty', 'duty', 'unity', 'society', 'community', 'university', 'authority', 'opportunity', 'ability', 'reality', 'quality', 'identity', 'security', 'majority', 'minority', 'activity', 'creativity', 'electricity', 'simplicity', 'divinity', 'vanity', 'sanity', 'humanity', 'personality', 'nationality', 'responsibility', 'possibility', 'flexibility', 'visibility', 'reliability'],
        'tion': ['action', 'station', 'nation', 'creation', 'information', 'education', 'attention', 'attention', 'attention', 'collection', 'connection', 'direction', 'election', 'emotion', 'expression', 'function', 'impression', 'intention', 'location', 'motion', 'operation', 'option', 'passion', 'permission', 'position', 'portion', 'presentation', 'production', 'profession', 'protection', 'question', 'reaction', 'recognition', 'relation', 'reduction', 'reflection', 'region', 'rejection', 'revolution', 'satisfaction', 'section', 'selection', 'sensation', 'situation', 'solution', 'suggestion', 'tradition'],
        'ment': ['moment', 'movement', 'document', 'argument', 'environment', 'government', 'development', 'improvement', 'investment', 'management', 'statement', 'agreement', 'equipment', 'employment', 'department', 'apartment', 'treatment', 'requirement', 'achievement', 'measurement', 'settlement', 'commitment', 'payment', 'judgment', 'punishment', 'replacement', 'arrangement', 'amusement', 'announcement', 'assignment', 'engagement', 'enjoyment', 'establishment', 'excitement', 'experiment', 'fundamental', 'instrument', 'sentiment'],
        'ance': ['dance', 'chance', 'romance', 'advance', 'enhance', 'glance', 'trance', 'stance', 'finance', 'appliance', 'circumstance', 'distance', 'resistance', 'assistance', 'acceptance', 'importance', 'performance', 'maintenance', 'guidance', 'ignorance', 'patience', 'presence', 'reference', 'relevance', 'tolerance', 'vigilance', 'ambulance', 'brilliance', 'elegance', 'existance', 'alliance'],
        'able': ['able', 'table', 'stable', 'cable', 'label', 'notable', 'capable', 'comfortable', 'considerable', 'remarkable', 'valuable', 'available', 'reasonable', 'reliable', 'probable', 'suitable', 'admirable', 'acceptable', 'predictable', 'inevitable', 'profitable', 'favorable', 'measurable', 'comparable', 'affordable', 'sustainable', 'unstable', 'disable', 'enable'],
        'ful': ['full', 'beautiful', 'wonderful', 'careful', 'helpful', 'powerful', 'useful', 'peaceful', 'hopeful', 'grateful', 'meaningful', 'mindful', 'painful', 'playful', 'skillful', 'successful', 'thoughtful', 'truthful', 'faithful', 'cheerful', 'fearful', 'harmful', 'respectful', 'restful', 'shameful', 'spiteful', 'wasteful', 'boastful', 'dutiful', 'eventful', 'fruitful', 'joyful'],
        'tion': ['action', 'station', 'creation', 'nation', 'education', 'information', 'attention', 'collection', 'direction', 'election', 'emotion', 'expression', 'function', 'impression', 'intention', 'location', 'motion', 'operation', 'option', 'passion', 'permission', 'position', 'portion', 'presentation', 'production', 'profession', 'protection', 'question', 'reaction', 'recognition', 'relation', 'reduction', 'reflection', 'revolution', 'satisfaction', 'section', 'selection', 'sensation', 'situation', 'solution', 'suggestion', 'tradition', 'tension', 'extension', 'intension', 'comprehension', 'dimension', 'suspension', 'expansion', 'invasion', 'occasion'],
        'ous': ['house', 'mouse', 'blouse', 'spouse', 'famous', 'enormous', 'various', 'serious', 'nervous', 'dangerous', 'generous', 'glorious', 'curious', 'obvious', 'previous', 'precious', 'delicious', 'ambitious', 'anxious', 'conscious', 'gracious', 'hilarious', 'hormonous', 'joyous', 'ludicrous', 'marvelous', 'mysterious', 'notorious', 'numerous', 'outrageous', 'poisonous', 'prosperous', 'ridiculous', 'spontaneous', 'tremendous', 'unanimous', 'vigorous', 'virtuous'],
        'ize': ['size', 'prize', 'rise', 'wise', 'eyes', 'lies', 'cries', 'dies', 'tries', 'flies', 'applies', 'denies', 'realize', 'recognize', 'organize', 'analyze', 'minimize', 'maximize', 'optimize', 'emphasize', 'prioritize', 'memorize', 'categorize', 'authorize', 'apologize', 'criticize', 'characterize', 'customize', 'finalize', 'monetize', 'summarize', 'stabilize', 'visualize', 'specialize'],
        'ify': ['identify', 'simplify', 'classify', 'verify', 'clarify', 'qualify', 'satisfy', 'justify', 'amplify', 'beautify', 'magnify', 'intensify', 'purify', 'rectify', 'specify', 'testify', 'terrify', 'notify', 'modify', 'exemplify', 'personify', 'solidify', 'unify', 'diversify', 'glorify', 'certify', 'electrify', 'fortify', 'liquify', 'nullify', 'ratify', 'signify', 'typify']
    };

    // Near rhyme mapping (similar sounds)
    const nearRhymeMap = {
        'ight': ['ite', 'ite', 'ite', 'ide', 'ite'],
        'ove': ['ove', 'ove', 'ove'],
        'ain': ['ane', 'ayne', 'ane', 'ain'],
        'ime': ['ime', 'ime', 'ime'],
        'eam': ['eam', 'eme', 'eam'],
        'ear': ['ere', 'eer', 'ear', 'air', 'ier'],
        'ow': ['oe', 'ough', 'oe', 'ow'],
        'all': ['al', 'awl', 'aul'],
        'ing': ['ing', 'ink', 'ing'],
        'ore': ['or', 'our', 'oar', 'ore'],
        'ace': ['ase', 'ace', 'ace'],
        'old': ['old', 'ould', 'ald'],
        'one': ['one', 'own', 'own'],
        'ell': ['el', 'ell', 'ell'],
        'end': ['end', 'ent', 'end'],
        'eep': ['eep', 'eep', 'eep'],
        'ood': ['ood', 'ood', 'ude'],
        'ind': ['ind', 'ind', 'ined'],
        'art': ['art', 'art', 'arte'],
        'ound': ['ound', 'ound', 'ound'],
        'eal': ['eal', 'eel', 'eal'],
        'urn': ['urn', 'urn', 'ern'],
        'ark': ['ark', 'arc', 'arke'],
        'est': ['est', 'est', 'est'],
        'ess': ['ess', 'ess', 'ess'],
        'ance': ['ance', 'ants', 'ants']
    };

    function getEndingSound(word) {
        word = word.toLowerCase().trim();

        // Check against known ending patterns (longest match first)
        const patterns = Object.keys(rhymeGroups).sort((a, b) => b.length - a.length);
        for (const pattern of patterns) {
            if (word.endsWith(pattern)) {
                return pattern;
            }
        }

        // Fallback: use last 2-3 characters
        if (word.length > 3) {
            return word.slice(-3);
        } else if (word.length > 1) {
            return word.slice(-2);
        }
        return word;
    }

    function findRhymes(word, type) {
        word = word.toLowerCase().trim();
        const ending = getEndingSound(word);
        const rhymes = new Set();

        if (rhymeGroups[ending]) {
            rhymeGroups[ending].forEach(w => {
                if (w !== word) rhymes.add(w);
            });
        }

        // For near rhymes, also check similar-sounding patterns
        if (type === 'near' && nearRhymeMap[ending]) {
            nearRhymeMap[ending].forEach(similar => {
                if (rhymeGroups[similar]) {
                    rhymeGroups[similar].forEach(w => {
                        if (w !== word) rhymes.add(w);
                    });
                }
            });
        }

        return Array.from(rhymes).sort();
    }

    function find() {
        const word = inputEl.value.trim();
        if (!word) {
            outputEl.textContent = 'Please enter a word';
            return;
        }

        const rhymes = findRhymes(word, rhymeTypeEl.value);

        if (rhymes.length > 0) {
            countEl.textContent = rhymes.length;
            outputEl.textContent = rhymes.join(', ');
        } else {
            countEl.textContent = '0';
            outputEl.textContent = `No rhymes found for "${word}". Try a different word or check spelling.`;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        countEl.textContent = '0';
        inputEl.focus();
    }

    findBtn.addEventListener('click', find);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') find();
    });
    inputEl.addEventListener('input', debounce(find, 500));
});
