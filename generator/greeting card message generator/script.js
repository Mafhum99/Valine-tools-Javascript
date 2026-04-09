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
 * Greeting Card Message Generator - 609
 * Generate greeting card messages
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Greeting Card Message Generator', icon: '🎉' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const messages = {
        birthday: [
            "Wishing you a day filled with happiness and a year filled with joy. Happy Birthday!",
            "May your birthday be as special as you are. Here's to another year of amazing adventures!",
            "Happy Birthday! May this special day bring you endless joy and cherished memories.",
            "On your birthday, I wish you health, happiness, and all the success you deserve!",
            "Another year older, another year wiser, and another year more wonderful. Happy Birthday!",
            "May your birthday overflow with love, laughter, and everything that makes you happiest.",
            "Sending you warm wishes on your birthday. May this year be your best one yet!"
        ],
        thank_you: [
            "Thank you from the bottom of my heart for your kindness and generosity.",
            "Your thoughtfulness means the world to me. Thank you so much!",
            "I am truly grateful for everything you do. Thank you for being wonderful!",
            "Words cannot express how thankful I am for your support and friendship.",
            "Thank you for being such an important part of my life. Your kindness is a gift.",
            "With sincere gratitude and heartfelt appreciation - Thank you!"
        ],
        congratulations: [
            "Congratulations on your well-deserved success! Your hard work has truly paid off.",
            "Warmest congratulations on this remarkable achievement. You should be so proud!",
            "Your dedication and perseverance have led to this wonderful moment. Congratulations!",
            "Congratulations! This is just the beginning of something even greater.",
            "What an incredible accomplishment! Congratulations on reaching this milestone.",
            "Cheers to your success! Congratulations on this well-earned achievement."
        ],
        sympathy: [
            "Thinking of you during this difficult time. My heartfelt condolences.",
            "May you find comfort and peace during this sorrowful time. You are in my thoughts.",
            "Sending you love and strength. Please know that I am here for you.",
            "With deepest sympathy and warmest thoughts during this difficult time.",
            "May cherished memories bring you comfort. My heart goes out to you.",
            "Words may not ease the pain, but please know you are surrounded by love and care."
        ],
        get_well: [
            "Wishing you a speedy recovery! May each day bring you closer to full health.",
            "Sending healing thoughts your way. Get well soon!",
            "May you feel stronger with each passing day. Wishing you a quick recovery!",
            "Thinking of you and wishing you wellness. Get well soon!",
            "Rest, recover, and come back stronger. We're all rooting for you!",
            "Sending you warm wishes for good health and a speedy recovery."
        ],
        new_year: [
            "Happy New Year! May this year bring you joy, success, and endless possibilities.",
            "Wishing you a wonderful New Year filled with new hopes and new dreams!",
            "May the New Year bring you closer to all your dreams. Happy New Year!",
            "Here's to a fresh start and a bright future. Happy New Year!",
            "New year, new opportunities, new adventures. Wishing you the best in the coming year!",
            "May this New Year be filled with peace, prosperity, and happiness for you and your family."
        ],
        holiday: [
            "Wishing you a season filled with warmth, love, and joyful moments.",
            "May the holiday spirit fill your heart with peace and your home with happiness.",
            "Sending you warmest wishes for a wonderful holiday season!",
            "May this holiday season bring you blessings, laughter, and time with loved ones.",
            "Happy Holidays! May your days be merry and bright.",
            "Wishing you peace, love, and joy this holiday season and always."
        ],
        default: [
            "Sending you warm wishes and heartfelt thoughts on this special occasion.",
            "May this moment be filled with joy, love, and beautiful memories.",
            "Thinking of you and sending my warmest wishes your way.",
            "Wishing you all the happiness in the world on this wonderful occasion.",
            "May your day be as extraordinary as you are. Sending my best wishes!",
            "Here's to celebrating this special moment together. My warmest wishes to you!"
        ]
    };

    function generateGreeting(text) {
        const parts = text.split(',').map(s => s.trim()).filter(Boolean);
        const occasion = (parts[0] || '').toLowerCase();
        const recipient = parts[1] || 'Dear Friend';
        const sender = parts[2] || 'With Love';

        let category = 'default';
        for (const [key] of Object.entries(messages)) {
            if (key !== 'default' && occasion.includes(key)) {
                category = key;
                break;
            }
        }

        const icons = {
            birthday: '🎂', thank_you: '🙏', congratulations: '🎊',
            sympathy: '🕊️', get_well: '🌸', new_year: '🎆',
            holiday: '🎄', default: '💌'
        };

        const icon = icons[category] || '💌';
        const msgId = `GRT-${Date.now().toString(36).toUpperCase()}`;
        const chosenMessage = randomChoice(messages[category]);

        let card = `${icon} GREETING CARD MESSAGE ${icon}\n`;
        card += `${'='.repeat(40)}\n\n`;
        card += `Dear ${recipient},\n\n`;
        card += `${chosenMessage}\n\n`;
        card += `${'~'.repeat(30)}\n`;
        card += `With warmest regards,\n`;
        card += `${sender}\n`;
        card += `${'~'.repeat(30)}\n\n`;
        card += `Message ID: ${msgId}\n`;
        card += `Occasion: ${occasion || 'General'}\n`;
        card += `${'='.repeat(40)}\n`;

        // Generate additional options
        card += `\nALTERNATIVE MESSAGES:\n`;
        card += `${'-'.repeat(40)}\n`;
        const shuffled = [...messages[category]].sort(() => Math.random() - 0.5);
        shuffled.slice(0, 3).forEach((msg, i) => {
            card += `\nOption ${i + 1}:\n${msg}\n`;
        });

        return card;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter: Occasion, Recipient, Sender (comma-separated)';
            return;
        }
        try {
            outputEl.textContent = generateGreeting(input);
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

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
