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
 * Journal Prompt Generator
 * Generate journal prompts
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Journal Prompt Generator', icon: '📓' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const prompts = {
        selfdiscovery: [
            'What are three core values that guide my decisions, and how do they show up in my daily life?',
            'If I could describe my ideal day from morning to night, what would it look like?',
            'What is a belief I held five years ago that I no longer believe? What changed?',
            'What parts of myself am I still trying to understand?',
            'When do I feel most authentically myself, and what conditions create that feeling?',
            'What would I do if I knew nobody would judge me?',
            'What story do I tell myself about who I am, and is it still true?',
            'What am I avoiding that I know I need to face?'
        ],
        gratitude: [
            'List 10 small things that brought you joy this week.',
            'Who is someone in your life you are grateful for, and why?',
            'What is a challenge you faced that you are now thankful for because of what it taught you?',
            'What abilities or talents do you have that you are grateful for?',
            'Describe a place that makes you feel peaceful and why you are grateful for it.',
            'What is something mundane that you use every day but rarely appreciate?',
            'Write about a stranger who made a positive impact on your day.',
            'What opportunities have opened up for you in the past year that you are thankful for?'
        ],
        creativity: [
            'If you could master any creative skill overnight, what would it be and what would you create first?',
            'Describe the world through the eyes of your favorite color.',
            'Write a letter to your future self about the creative projects you want to complete.',
            'If your life were a book, what would the current chapter be titled?',
            'Imagine you have no limitations. What is the most ambitious creative project you would undertake?',
            'What does your perfect creative space look like? Describe every detail.',
            'If you could collaborate with any artist, writer, or creator, who would it be and what would you make together?',
            'Write about an idea that excites you so much you cannot stop thinking about it.'
        ],
        reflection: [
            'What is the most important lesson you learned this year?',
            'Looking back at the past month, what are you most proud of?',
            'What habit or behavior would you like to leave behind, and what will you replace it with?',
            'Describe a moment recently when you felt truly at peace.',
            'What conversation has been on your mind that you need to have?',
            'How have you changed in the last year, and what caused that change?',
            'What is something you used to worry about that no longer bothers you?',
            'If you could give your past self one piece of advice, what would it be?'
        ],
        goals: [
            'What does success look like to you one year from now? Be specific.',
            'What is one goal you have been putting off, and what is the smallest step you can take today?',
            'If you could only accomplish three things this year, what would they be and why?',
            'What fears are holding you back from pursuing your biggest goal?',
            'Describe your ideal life five years from now in vivid detail.',
            'What resources or support do you need to reach your next milestone?',
            'Who do you need to become to achieve the goals you have set?',
            'What would you attempt if you knew you could not fail?'
        ],
        general: [
            'What is on your mind right now that you have not put into words yet?',
            'Describe your current mood using only metaphors.',
            'What is a question you wish someone would ask you?',
            'Write about a memory that always makes you smile.',
            'If today were repeated every day for a year, what would you want to change about it?',
            'What are you carrying that you are ready to put down?',
            'Describe the person you are becoming.',
            'What would you tell your best friend if they were in your exact situation right now?'
        ]
    };

    function calculate() {
        const input = inputEl.value.trim().toLowerCase();

        let type = 'general';
        if (input.includes('self') || input.includes('discover') || input.includes('identity') || input.includes('who am i')) type = 'selfdiscovery';
        else if (input.includes('gratitud') || input.includes('thankful') || input.includes('bless') || input.includes('appreciate')) type = 'gratitude';
        else if (input.includes('creat') || input.includes('imagine') || input.includes('art') || input.includes('write')) type = 'creativity';
        else if (input.includes('reflect') || input.includes('look back') || input.includes('review') || input.includes('past')) type = 'reflection';
        else if (input.includes('goal') || input.includes('future') || input.includes('ambition') || input.includes('achieve')) type = 'goals';

        const pool = prompts[type];
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const count = Math.min(5, shuffled.length);
        const results = shuffled.slice(0, count).map((p, i) => `${i + 1}. ${p}`);

        const title = type === 'selfdiscovery' ? 'Self-Discovery Journal Prompts' : type === 'gratitude' ? 'Gratitude Journal Prompts' : type === 'creativity' ? 'Creative Journal Prompts' : type === 'reflection' ? 'Reflection Journal Prompts' : type === 'goals' ? 'Goal-Oriented Journal Prompts' : 'Journal Prompts';
        outputEl.innerHTML = `<h3>${title}</h3>\n${results.join('\n\n')}`;
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
