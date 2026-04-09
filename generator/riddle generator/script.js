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
 * Riddle Generator - 620
 * Generate riddles and brain teasers
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Riddle Generator', icon: '🧩' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const riddles = {
        classic: [
            { riddle: "I have cities, but no houses live there. I have mountains, but no trees grow there. I have water, but no fish swim there. What am I?", answer: "A map" },
            { riddle: "I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?", answer: "An echo" },
            { riddle: "The more you take, the more you leave behind. What am I?", answer: "Footsteps" },
            { riddle: "I have keys but no locks. I have space but no room. You can enter but can't go inside. What am I?", answer: "A keyboard" },
            { riddle: "What can travel around the world while staying in a corner?", answer: "A postage stamp" },
            { riddle: "I am not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?", answer: "Fire" },
            { riddle: "What has a head and a tail but no body?", answer: "A coin" },
            { riddle: "I can be cracked, made, told, and played. What am I?", answer: "A joke" },
            { riddle: "What has hands but can't clap?", answer: "A clock" },
            { riddle: "I am always hungry and will die if not fed, but whatever I touch will soon turn red. What am I?", answer: "Fire" }
        ],
        wordplay: [
            { riddle: "What word is spelled wrong in every dictionary?", answer: "The word 'wrong'" },
            { riddle: "What five-letter word becomes shorter when you add two letters to it?", answer: "Short" },
            { riddle: "What word contains all 26 letters?", answer: "Alphabet" },
            { riddle: "What begins with T, ends with T, and has T in it?", answer: "A teapot" },
            { riddle: "What word becomes its opposite when you add 'un' to it?", answer: "Any word that becomes its opposite with 'un' — like 'done' becomes 'undone'" },
            { riddle: "I am a word. If you pronounce me right, I'm wrong. If you pronounce me wrong, I'm right. What word am I?", answer: "Wrong" },
            { riddle: "What 8-letter word can have a letter removed and still make a word? Keep removing letters and it keeps making words.", answer: "Starting -> staring -> string -> sting -> sing -> sin -> in -> I" },
            { riddle: "What word is always pronounced incorrectly?", answer: "Incorrectly" }
        ],
        logic: [
            { riddle: "A man is looking at a photograph of someone. His friend asks, 'Who is it?' The man replies: 'Brothers and sisters, I have none. But that man's father is my father's son.' Who is in the photograph?", answer: "His son" },
            { riddle: "You see a boat filled with people. It has not sunk, but when you look again you don't see a single person on the boat. Why?", answer: "All the people were married" },
            { riddle: "What has to be broken before you can use it?", answer: "An egg" },
            { riddle: "I'm tall when I'm young and short when I'm old. What am I?", answer: "A candle" },
            { riddle: "A farmer has 17 sheep. All but 9 run away. How many sheep does the farmer have?", answer: "9 (all BUT 9 ran away)" },
            { riddle: "What can you catch but not throw?", answer: "A cold" },
            { riddle: "What goes up but never comes down?", answer: "Your age" },
            { riddle: "What gets wetter the more it dries?", answer: "A towel" }
        ],
        lateral: [
            { riddle: "A woman shoots her husband. Then she holds him under water for 5 minutes. Next, she hangs him. But 5 minutes later they both go out together and enjoy a wonderful dinner. How is this possible?", answer: "She's a photographer. She took a picture, developed it in chemicals, and hung it to dry." },
            { riddle: "How can you drop a raw egg onto a concrete floor without cracking it?", answer: "Concrete floors are very hard to crack. The egg will crack, but the concrete won't." },
            { riddle: "A man pushes his car to a hotel and tells the owner he's bankrupt. Why?", answer: "He's playing Monopoly" },
            { riddle: "What can you hold in your right hand but never in your left hand?", answer: "Your left hand" },
            { riddle: "If two's company and three's a crowd, what are four and five?", answer: "Nine" },
            { riddle: "What goes through cities and fields but never moves?", answer: "A road" },
            { riddle: "I have branches, but no fruit, trunk, or leaves. What am I?", answer: "A bank" },
            { riddle: "What can fill a room but takes up no space?", answer: "Light" }
        ]
    };

    function generateRiddles(topic) {
        const riddleId = `RID-${Date.now().toString(36).toUpperCase()}`;
        const categories = Object.keys(riddles);
        const count = 5;

        let output = `RIDDLES & BRAIN TEASERS\n`;
        output += `${'='.repeat(50)}\n`;
        output += `Theme: ${topic || 'Mixed'}\n`;
        output += `ID: ${riddleId}\n`;
        output += `${'='.repeat(50)}\n\n`;

        for (let i = 0; i < count; i++) {
            const category = categories[i % categories.length];
            const riddle = randomChoice(riddles[category]);

            output += `RIDDLE ${i + 1} [${category.toUpperCase()}]\n`;
            output += `${'-'.repeat(40)}\n`;
            output += `Q: ${riddle.riddle}\n\n`;
            output += `A: ${riddle.answer}\n\n`;
        }

        // Generate a custom riddle based on topic
        if (topic) {
            output += `CUSTOM RIDDLE FOR "${topic.toUpperCase()}":\n`;
            output += `${'-'.repeat(40)}\n`;
            const customRiddles = [
                { r: `I am associated with ${topic}, yet I am not ${topic}. I am sought but rarely found. I change with time but remain the same. What am I?`, a: "The truth about " + topic },
                { r: `People argue about ${topic}, yet no one truly understands it. The more you study it, the less you know. What is it?`, a: topic },
                { r: `I can make ${topic} seem impossible, or make the impossible seem like ${topic}. I exist in every mind but look different in each. What am I?`, a: "Perspective" }
            ];
            const custom = randomChoice(customRiddles);
            output += `Q: ${custom.r}\n\n`;
            output += `A: ${custom.a}\n\n`;
        }

        output += `${'-'.repeat(50)}\n`;
        output += `Riddle ID: ${riddleId}\n`;
        output += `End of Riddles - ${riddleId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        try {
            outputEl.textContent = generateRiddles(input);
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
