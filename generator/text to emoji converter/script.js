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
 * Text to Emoji Converter
 * Convert words to corresponding emojis
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Text to Emoji Converter', icon: '😀' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const WORD_TO_EMOJI = {
        'love': '❤️', 'heart': '❤️', 'happy': '😊', 'smile': '😊', 'laugh': '😂',
        'cry': '😢', 'sad': '😢', 'angry': '😠', 'mad': '😠', 'fire': '🔥',
        'hot': '🔥', 'cool': '😎', 'star': '⭐', 'stars': '✨', 'sparkle': '✨',
        'sparkles': '✨', 'sun': '☀️', 'moon': '🌙', 'cloud': '☁️', 'rain': '🌧️',
        'snow': '❄️', 'wind': '💨', 'water': '💧', 'drop': '💧', 'wave': '🌊',
        'ocean': '🌊', 'sea': '🌊', 'tree': '🌳', 'flower': '🌸', 'rose': '🌹',
        'plant': '🌱', 'leaf': '🍃', 'earth': '🌍', 'world': '🌍', 'globe': '🌍',
        'dog': '🐕', 'cat': '🐈', 'bird': '🐦', 'fish': '🐟', 'bug': '🐛',
        'butterfly': '🦋', 'bee': '🐝', 'horse': '🐴', 'rabbit': '🐰', 'bear': '🐻',
        'lion': '🦁', 'tiger': '🐯', 'elephant': '🐘', 'monkey': '🐒', 'snake': '🐍',
        'turtle': '🐢', 'frog': '🐸', 'chicken': '🐔', 'pig': '🐷', 'cow': '🐄',
        'sheep': '🐑', 'wolf': '🐺', 'fox': '🦊', 'unicorn': '🦄', 'dragon': '🐉',
        'apple': '🍎', 'banana': '🍌', 'orange': '🍊', 'grape': '🍇', 'watermelon': '🍉',
        'strawberry': '🍓', 'cherry': '🍒', 'peach': '🍑', 'lemon': '🍋', 'pear': '🍐',
        'pizza': '🍕', 'burger': '🍔', 'fries': '🍟', 'hotdog': '🌭', 'taco': '🌮',
        'burrito': '🌯', 'sushi': '🍣', 'cake': '🎂', 'cookie': '🍪', 'chocolate': '🍫',
        'candy': '🍬', 'icecream': '🍦', 'ice cream': '🍦', 'coffee': '☕', 'tea': '🍵',
        'beer': '🍺', 'wine': '🍷', 'cheers': '🥂', 'drink': '🥤', 'milk': '🥛',
        'bread': '🍞', 'cheese': '🧀', 'egg': '🥚', 'rice': '🍚', 'noodle': '🍜',
        'house': '🏠', 'home': '🏠', 'school': '🏫', 'hospital': '🏥', 'store': '🏪',
        'bank': '🏦', 'church': '⛪', 'castle': '🏰', 'bridge': '🌉', 'tent': '⛺',
        'car': '🚗', 'bus': '🚌', 'train': '🚂', 'plane': '✈️', 'airplane': '✈️',
        'rocket': '🚀', 'bike': '🚲', 'bicycle': '🚲', 'ship': '🚢', 'boat': '⛵',
        'taxi': '🚕', 'ambulance': '🚑', 'truck': '🚛', 'helicopter': '🚁',
        'phone': '📱', 'computer': '💻', 'laptop': '💻', 'keyboard': '⌨️', 'mouse': '🖱️',
        'screen': '🖥️', 'camera': '📷', 'video': '🎥', 'movie': '🎬', 'film': '🎬',
        'music': '🎵', 'song': '🎶', 'guitar': '🎸', 'piano': '🎹', 'drum': '🥁',
        'game': '🎮', 'play': '🎭', 'art': '🎨', 'paint': '🎨', 'book': '📚',
        'read': '📖', 'write': '✍️', 'pencil': '✏️', 'pen': '🖊️', 'paper': '📄',
        'money': '💰', 'dollar': '💵', 'coin': '🪙', 'credit': '💳', 'gift': '🎁',
        'present': '🎁', 'party': '🎉', 'celebrate': '🎊', 'birthday': '🎂',
        'wedding': '💒', 'ring': '💍', 'crown': '👑', 'trophy': '🏆', 'medal': '🏅',
        'flag': '🏳️', 'bomb': '💣', 'gun': '🔫', 'sword': '⚔️', 'shield': '🛡️',
        'key': '🔑', 'lock': '🔒', 'unlock': '🔓', 'toolbox': '🧰', 'wrench': '🔧',
        'hammer': '🔨', 'screwdriver': '🪛', 'scissors': '✂️', 'pin': '📌',
        'clock': '🕐', 'watch': '⌚', 'time': '⏰', 'alarm': '⏰', 'calendar': '📅',
        'day': '☀️', 'night': '🌙', 'morning': '🌅', 'evening': '🌆',
        'good': '👍', 'bad': '👎', 'thumbs up': '👍', 'thumbs down': '👎',
        'ok': '👌', 'yes': '✅', 'no': '❌', 'check': '✅', 'cross': '❌',
        'plus': '➕', 'minus': '➖', 'multiply': '✖️', 'divide': '➗',
        'question': '❓', 'answer': '💡', 'idea': '💡', 'light': '💡', 'bulb': '💡',
        'warning': '⚠️', 'danger': '⚠️', 'error': '❌', 'success': '✅',
        'important': '❗', 'note': '📝', 'memo': '📝', 'email': '📧', 'letter': '✉️',
        'package': '📦', 'box': '📦', 'mail': '📬', 'post': '📮',
        'king': '👑', 'queen': '👸', 'prince': '🤴', 'princess': '👸',
        'man': '👨', 'woman': '👩', 'boy': '👦', 'girl': '👧', 'baby': '👶',
        'family': '👨‍👩‍👧‍👦', 'people': '👥', 'team': '👥', 'group': '👥',
        'hand': '🤚', 'wave': '👋', 'clap': '👏', 'pray': '🙏', 'point': '👆',
        'eye': '👁️', 'eyes': '👀', 'brain': '🧠', 'mouth': '👄', 'ear': '👂',
        'nose': '👃', 'foot': '🦶', 'leg': '🦵', 'arm': '💪', 'muscle': '💪',
        'strong': '💪', 'weak': '😰', 'tired': '😴', 'sleep': '😴', 'dream': '💭',
        'think': '🤔', 'know': '🧠', 'learn': '📚', 'teach': '👨‍🏫', 'study': '📖',
        'work': '💼', 'job': '💼', 'office': '🏢', 'business': '💼', 'meeting': '🤝',
        'hello': '👋', 'hi': '👋', 'hey': '👋', 'bye': '👋', 'goodbye': '👋',
        'welcome': '🙌', 'thanks': '🙏', 'thank you': '🙏', 'sorry': '😔',
        'please': '🙏', 'help': '🆘', 'stop': '🛑', 'go': '🟢', 'wait': '⏳',
        'fast': '⚡', 'slow': '🐌', 'big': '🐘', 'small': '🤏', 'new': '🆕',
        'old': '👴', 'young': '👶', 'beautiful': '😍', 'pretty': '😊', 'ugly': '👹',
        'funny': '😂', 'weird': '🤪', 'crazy': '🤪', 'sick': '🤒', 'sick ill': '🤒',
        'dead': '💀', 'skull': '💀', 'ghost': '👻', 'alien': '👽', 'robot': '🤖',
        'poop': '💩', 'clown': '🤡', 'devil': '😈', 'angel': '👼',
        'power': '💪', 'energy': '⚡', 'electric': '⚡', 'electricity': '⚡',
        'lightning': '⚡', 'thunder': '⛈️', 'storm': '⛈️', 'tornado': '🌪️',
        'hurricane': '🌀', 'flood': '🌊', 'earthquake': '💥', 'volcano': '🌋',
        'mountain': '⛰️', 'hill': '🏔️', 'desert': '🏜️', 'island': '🏝️',
        'beach': '🏖️', 'camp': '⛺', 'camping': '⛺', 'hike': '🥾', 'run': '🏃',
        'walk': '🚶', 'swim': '🏊', 'jump': '🦘', 'fly': '🦅', 'drive': '🚗',
        'ride': '🚴', 'climb': '🧗', 'lift': '🏋️', 'sport': '⚽', 'football': '🏈',
        'soccer': '⚽', 'basketball': '🏀', 'baseball': '⚾', 'tennis': '🎾',
        'golf': '⏌', 'boxing': '🥊', 'fencing': '🤺', 'archery': '🏹',
        'win': '🏆', 'lose': '😞', 'fail': '❌', 'pass': '✅', 'test': '📝',
        'exam': '📝', 'grade': '📊', 'score': '💯', 'perfect': '💯', 'hundred': '💯',
        'number': '🔢', 'math': '🔢', 'science': '🔬', 'lab': '🔬', 'experiment': '🧪',
        'chemistry': '🧪', 'biology': '🧬', 'dna': '🧬', 'atom': '⚛️', 'space': '🚀',
        'galaxy': '🌌', 'planet': '🪐', 'saturn': '🪐', 'mars': '🔴', 'comet': '☄️',
        'milkyway': '🌌', 'milky way': '🌌', 'universe': '🌌', 'infinity': '♾️',
        'peace': '☮️', 'war': '⚔️', 'fight': '🥊', 'attack': '💥', 'explode': '💥',
        'boom': '💥', 'crash': '💥', 'break': '💔', 'fix': '🔧', 'build': '🏗️',
        'create': '✨', 'make': '🛠️', 'destroy': '💣', 'kill': '💀', 'die': '💀',
        'live': '🌟', 'life': '🌟', 'birth': '👶', 'grow': '🌱', 'change': '🔄',
        'move': '🔄', 'turn': '🔄', 'spin': '🌀', 'circle': '⭕', 'square': '🔲',
        'triangle': '🔺', 'diamond': '💎', 'gem': '💎', 'crystal': '💎',
        'gold': '🥇', 'silver': '🥈', 'bronze': '🥉', 'iron': '⛓️',
        'red': '🔴', 'blue': '🔵', 'green': '🟢', 'yellow': '🟡', 'purple': '🟣',
        'pink': '💗', 'black': '⬛', 'white': '⬜', 'brown': '🟤',
        'rainbow': '🌈', 'magic': '🪄', 'witch': '🧙', 'wizard': '🧙',
        'fairy': '🧚', 'vampire': '🧛', 'zombie': '🧟', 'mummy': '🧟',
        'ninja': '🥷', 'pirate': '🏴‍☠️', 'knight': '🤺', 'princess': '👸',
        'christmas': '🎄', 'halloween': '🎃', 'easter': '🐣', 'newyear': '🎆',
        'new year': '🎆', 'valentine': '💝', 'mother': '👩‍👧', 'father': '👨‍👧',
        'mom': '👩', 'dad': '👨', 'brother': '👦', 'sister': '👧',
        'friend': '🤝', 'enemy': '👹', 'hero': '🦸', 'villain': '🦹',
        'kingdom': '🏰', 'empire': '🏰', 'nation': '🏳️', 'country': '🌍',
        'city': '🏙️', 'town': '🏘️', 'village': '🏘️', 'street': '🛣️',
        'road': '🛣️', 'highway': '🛣️', 'path': '🛤️', 'railway': '🛤️',
        'airport': '🛫', 'station': '🚉', 'park': '🏞️', 'zoo': '🦁',
        'garden': '🌻', 'farm': '🌾', 'factory': '🏭', 'lab': '🔬',
        'library': '📚', 'museum': '🏛️', 'theater': '🎭', 'stadium': '🏟️',
        'hotel': '🏨', 'restaurant': '🍽️', 'cafe': '☕', 'bar': '🍸',
        'club': '🎵', 'church': '⛪', 'mosque': '🕌', 'temple': '🛕', 'synagogue': '🕍',
        'internet': '🌐', 'web': '🕸️', 'network': '🌐', 'wifi': '📶',
        'signal': '📶', 'battery': '🔋', 'plug': '🔌', 'power': '⚡',
        'search': '🔍', 'find': '🔍', 'look': '👀', 'see': '👁️', 'watch': '👀',
        'hear': '👂', 'listen': '🎧', 'sound': '🔊', 'loud': '📢', 'quiet': '🤫',
        'speak': '🗣️', 'talk': '💬', 'chat': '💬', 'say': '🗨️', 'tell': '📣',
        'shout': '📣', 'whisper': '🤫', 'sing': '🎤', 'dance': '💃',
        'run fast': '🏃', 'eat': '🍽️', 'hungry': '🤤', 'thirsty': '🥵',
        'full': '🫃', 'yummy': '😋', 'delicious': '😋', 'tasty': '😋',
        'gross': '🤢', 'disgusting': '🤮', 'vomit': '🤮', 'sneeze': '🤧',
        'cold': '🥶', 'warm': '🥵', 'cool temp': '😎',
        'luck': '🍀', 'lucky': '🍀', 'four leaf clover': '🍀',
        'money bag': '💰', 'rich': '🤑', 'poor': '😰',
        'safe': '🔒', 'secure': '🛡️', 'protect': '🛡️', 'guard': '💂',
        'police': '👮', 'doctor': '👨‍⚕️', 'nurse': '👩‍⚕️', 'teacher': '👨‍🏫',
        'chef': '👨‍🍳', 'cook': '👨‍🍳', 'farmer': '👨‍🌾', 'builder': '👷',
        'scientist': '👨‍🔬', 'artist': '👨‍🎨', 'singer': '👨‍🎤', 'actor': '🎭',
        'detective': '🕵️', 'spy': '🕵️', 'pilot': '👨‍✈️', 'astronaut': '👨‍🚀',
        'firefighter': '👨‍🚒', 'soldier': '💂', 'judge': '👨‍⚖️', 'lawyer': '👨‍⚖️',
        '100': '💯', 'check mark': '✅', 'cross mark': '❌', 'warning sign': '⚠️',
        'recycle': '♻️', 'biohazard': '☣️', 'radioactive': '☢️',
        'yinyang': '☯️', 'om': '🕉️', 'cross religion': '✝️', 'star david': '✡️',
        'wheel': '☸️', 'peace symbol': '☮️',
        'male': '♂️', 'female': '♀️', 'transgender': '⚧️',
        'medical': '⚕️', 'scales': '⚖️', 'alembic': '⚗️',
        'telescope': '🔭', 'microscope': '🔬', 'crystal ball': '🔮',
        'abacus': '🧮', 'compass': '🧭', 'extinguisher': '🧯',
        'toolbox': '🧰', 'magnet': '🧲', 'luggage': '🧳',
        'umbrella': '☂️', 'parasol': '⛱️',
        'first place': '🥇', '2nd': '🥈', '3rd': '🥉',
        'trophy': '🏆', 'medal': '🏅', 'ribbon': '🎗️',
        'ticket': '🎫', 'admission': '🎟️',
        'dart': '🎯', 'target': '🎯', 'goal': '🎯',
        'puzzle': '🧩', 'game piece': '🎲', 'dice': '🎲',
        'chess': '♟️', 'joker': '🃏', 'mahjong': '🀄',
        'playing cards': '🎴',
        'inbox': '📥', 'outbox': '📤', 'scroll': '📜',
        'page': '📄', 'newspaper': '📰', 'bookmark': '🔖',
        'label': '🏷️', 'moneybag': '💰', 'yen': '💴', 'euro': '💶', 'pound': '💷',
        'credit card': '💳', 'receipt': '🧾', 'chart': '📊', 'graph': '📈',
        'bar chart': '📊', 'pushpin': '📌', 'round pushpin': '📍',
        'straight ruler': '📏', 'triangular ruler': '📐',
        'card index': '📇', 'file folder': '📁', 'open folder': '📂',
        'wastebasket': '🗑️', 'card file': '🗃️', 'file cabinet': '🗄️',
        'notepad': '🗒️', 'spiral calendar': '🗓️',
        'ballot': '🗳️',
        'magnifying glass': '🔍', 'mag right': '🔎',
        'candle': '🕯️', 'firecracker': '🧨', 'balloon': '🎈',
        'confetti': '🎊', 'confetti ball': '🎊', 'tanabata tree': '🎋',
        'bamboo': '🎍', 'dolls': '🎎', 'carp streamer': '🎏',
        'wind chime': '🎐', 'moon viewing': '🎑', 'red envelope': '🧧',
        'ribbon': '🎀', 'wrapped gift': '🎁', 'reminder': '🎗️',
        'jack o lantern': '🎃',
        'smiling': '😊', 'grinning': '😀', 'grin': '😁', 'joy': '😂',
        'rofl': '🤣', 'rolling': '🤣', 'partying': '🥳', 'woozy': '🥴',
        'hot face': '🥵', 'cold face': '🥶', 'nauseated': '🤢', 'vomiting': '🤮',
        'sneezing': '🤧', 'dizzy': '😵', 'exploding': '🤯', 'cowboy': '🤠',
        'nerd': '🤓', 'geek': '🤓', 'sunglasses': '😎', 'star struck': '🤩',
        'saluting': '🫡', 'melting': '🫠', 'winking': '😉', 'blushing': '😊',
        'innocent': '😇', 'thinking': '🤔', 'face palm': '🤦', 'shrug': '🤷',
        'zipper': '🤐', 'raised eyebrow': '🤨', 'neutral': '😐',
        'expressionless': '😑', 'no mouth': '😶', 'smirk': '😏', 'grimacing': '😬',
        'lying': '🤥', 'relieved': '😌', 'pensive': '😔', 'sleepy': '😪',
        'drooling': '🤤', 'sleeping': '😴', 'coma': '😷', 'thermometer': '🤒',
        'bandage': '🤕', 'nauseous': '🤢', 'angry face': '😡', 'cursing': '🤬',
        'smiling imp': '😈', 'angry imp': '👿', 'skull crossbones': '☠️',
        'pile of poo': '💩', 'joker face': '🃏'
    };

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter text to convert'; return; }
        try {
            const lowerInput = input.toLowerCase();
            let result = input;

            // Try to match multi-word phrases first (sorted by length desc)
            const sortedPhrases = Object.keys(WORD_TO_EMOJI).sort((a, b) => b.length - a.length);

            // Replace words with emojis
            const words = result.split(/(\s+|[.,!?;:\-])/);
            const converted = words.map(word => {
                const lower = word.toLowerCase().trim();
                if (!lower) return word;
                if (WORD_TO_EMOJI[lower]) return WORD_TO_EMOJI[lower];
                return word;
            });

            outputEl.textContent = converted.join('');
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
