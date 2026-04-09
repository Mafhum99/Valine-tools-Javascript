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
 * Pickup Line Generator - 624
 * Generate pickup lines
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Pickup Line Generator', icon: '💘' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const pickupLines = {
        cheesy: [
            "Are you a magician? Because whenever I look at you, everyone else disappears.",
            "Do you have a map? Because I just got lost in your eyes.",
            "Are you a parking ticket? Because you've got FINE written all over you.",
            "Is your name Google? Because you have everything I've been searching for.",
            "Are you a time traveler? Because I can see you in my future.",
            "Do you believe in love at first sight, or should I walk by again?",
            "If you were a vegetable, you'd be a cute-cumber!",
            "Are you WiFi? Because I'm feeling a connection.",
            "Is your dad a baker? Because you're a cutie pie!",
            "If beauty were time, you'd be an eternity."
        ],
        funny: [
            "Are you a bank loan? Because you have my interest.",
            "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
            "Are you a campfire? Because you're hot and I want s'more.",
            "If you were a chicken, you'd be impeccable.",
            "Are you my appendix? Because I have a gut feeling I should take you out.",
            "Do you like Star Wars? Because Yoda one for me!",
            "Are you a light switch? Because you turn me on.",
            "I'm no organ donor, but I'd happily give you my heart.",
            "Are you a broom? Because you just swept me off my feet.",
            "If you were a burger at McDonald's, you'd be the McGorgeous."
        ],
        clever: [
            "Are you a 90-degree angle? Because you're looking right!",
            "You must be the square root of -1, because you can't be real.",
            "Are you a carbon sample? Because I want to date you.",
            "You must be a high test score, because I'm not smart enough for you.",
            "Are you made of copper and tellurium? Because you're Cu-Te.",
            "If you were a triangle, you'd be acute one.",
            "Are you a non-linear operator? Because you're transforming my space.",
            "You must be the speed of light, because time stops when I look at you.",
            "Are you a singularity? Because your attraction is infinite.",
            "If beauty were a crime, you'd be serving a life sentence."
        ],
        nerdy: [
            "Are you a keyboard? Because you're just my type.",
            "You must be compiled, because you're error-free and gorgeous.",
            "Are you a router? Because you're giving me connectivity.",
            "My love for you is like the square of pi — it goes on forever.",
            "Are you a software update? Because I keep putting this off.",
            "You're like a well-written algorithm — perfectly optimized for my heart.",
            "Are you a database? Because you've got everything I'm querying for.",
            "If I were an OS, you'd be my favorite application.",
            "Are you a function? Because you return exactly what I need.",
            "My heart for you is like an infinite loop — it never breaks."
        ],
        smooth: [
            "I was wondering if you had an extra heart, because mine was just stolen.",
            "I'm not a photographer, but I can definitely picture us together.",
            "They say nothing lasts forever — so will you be my nothing?",
            "I'd never play hard to get with you. I'd play hard to forget everyone else.",
            "If I could rearrange the alphabet, I'd put U and I together.",
            "I don't need a compass — my heart already points to you.",
            "I was going to say something really smooth, but you left me speechless.",
            "They told me to follow my dreams, so here I am talking to you.",
            "I'm not usually this forward, but something about you makes me brave.",
            "I don't know your name yet, but I'm pretty sure it's beautiful."
        ]
    };

    function generatePickupLines(topic) {
        const lineId = `PL-${Date.now().toString(36).toUpperCase()}`;
        const count = 8;

        let category = null;
        if (topic) {
            const topicLower = topic.toLowerCase();
            for (const [key] of Object.entries(pickupLines)) {
                if (topicLower.includes(key)) { category = key; break; }
            }
        }

        let output = `PICKUP LINE GENERATOR\n`;
        output += `${'='.repeat(50)}\n`;
        output += `Style: ${category || 'Mixed'}\n`;
        output += `Theme: ${topic || 'General'}\n`;
        output += `ID: ${lineId}\n`;
        output += `${'='.repeat(50)}\n\n`;

        const categories = category ? [category] : Object.keys(pickupLines);
        const usedLines = new Set();

        for (let i = 0; i < count; i++) {
            const cat = categories[i % categories.length];
            let line;
            let attempts = 0;
            do {
                line = randomChoice(pickupLines[cat]);
                attempts++;
            } while (usedLines.has(line) && attempts < 100);
            usedLines.add(line);

            output += `LINE ${i + 1} [${cat.toUpperCase()}]\n`;
            output += `${'-'.repeat(40)}\n`;
            output += `"${line}"\n\n`;
        }

        output += `${'-'.repeat(50)}\n`;
        output += `💡 TIP: Delivery is everything! Be confident and respectful.\n\n`;
        output += `${'-'.repeat(50)}\n`;
        output += `Pickup Line ID: ${lineId}\n`;
        output += `End of Pickup Lines - ${lineId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        try {
            outputEl.textContent = generatePickupLines(input);
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
