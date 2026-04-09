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
 * World Building Generator - 616
 * Generate world building elements
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'World Building Generator', icon: '🌍' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const worldElements = {
        geography: [
            "A continent-sized crystal desert where sand is made of ground gemstones",
            "Floating islands connected by massive chain bridges over an endless abyss",
            "A forest where trees grow upside down, roots reaching skyward",
            "Mountains that sing when the wind passes through their crystalline caves",
            "An ocean with tides of liquid light that illuminate the coastline",
            "A valley perpetually shrouded in twilight between two mountain ranges",
            "Rivers that flow uphill due to magnetic anomalies in the bedrock",
            "A lake that reflects not the sky above, but a different world entirely",
            "Canyons carved with ancient writing visible only from above",
            "A tundra where the ice never melts and preserves ancient structures"
        ],
        culture: [
            "A society where knowledge is currency and libraries are banks",
            "People who communicate through intricate dance instead of speech",
            "A culture that celebrates the day of one's death as their true birthday",
            "An annual festival where all social roles are reversed for a week",
            "A tradition of gifting memories crystalized into small glass orbs",
            "A civilization where art is considered more valuable than gold",
            "A society governed by a council of the eldest living members",
            "A culture where names change with life achievements",
            "People who build their homes inside massive living organisms",
            "A civilization that measures time by the blooming of a specific flower"
        ],
        magic: [
            "Magic that can only be wielded through musical instruments",
            "A system where spells are woven into tattoos on the skin",
            "Power drawn from the emotions of those around the caster",
            "Magic that requires trading one memory for each spell cast",
            "A system where the caster's shadow performs the magic",
            "Sorcery powered by rare gemstones that eventually run out",
            "Magic that works only during specific phases of the moon",
            "A system where spells are cooked into food and consumed",
            "Power that comes from making and keeping binding promises",
            "Magic that requires two casters in perfect harmony to work"
        ],
        creatures: [
            "Phoenix-like creatures that are reborn as different species each time",
            "Massive turtles that carry entire ecosystems on their backs",
            "Creatures made of living shadow that serve as guardians",
            "Dragon-like beings that breathe crystallizing frost instead of fire",
            "Shapeshifters who can only take the form of things they've touched",
            "Enormous birds whose songs can heal or harm depending on intent",
            "Creatures that exist partially in this world and partially in another",
            "Insectoid beings that build cities from woven silk and resin",
            "Aquatic humanoids who can walk on land but slowly dry out",
            "Beings of pure light that can only be seen through reflections"
        ],
        history: [
            "A great war fought not over land, but over who controls time itself",
            "An ancient civilization that transcended physical form entirely",
            "A cataclysm that split the world into parallel overlapping realms",
            "A golden age ended when the source of all magic suddenly vanished",
            "An empire that fell not to invasion, but to collective amnesia",
            "A legendary hero whose actions accidentally caused the current crisis",
            "A prophecy that was misinterpreted for a thousand years",
            "A treaty between species that has held for millennia but is now breaking",
            "An artifact created at the dawn of time that is now awakening",
            "A forgotten technology that ancient people mistook for divine power"
        ],
        politics: [
            "A monarchy where the ruler is chosen by a sentient ancient sword",
            "A democracy where votes are cast through magical binding contracts",
            "A theocracy worshipping a god that may or may not actually exist",
            "A council of guilds where each controls an essential resource",
            "A realm divided by an ideological war between progress and tradition",
            "A peaceful union of kingdoms held together by a magical oath",
            "An underground resistance fighting against an apparently benevolent regime",
            "A trade federation where economic power translates to political power",
            "A society ruled by an AI that the population believes is a deity",
            "A fractured realm where each region operates under different laws of physics"
        ]
    };

    function generateWorld(topic) {
        const worldId = `WB-${Date.now().toString(36).toUpperCase()}`;

        const worldNames = ['Aethermoor', 'Eldoria', 'Zephyria', 'Umbralis', 'Luminar', 'Crystallis', 'Nocturne', 'Verdantis', 'Ignisia', 'Aquoria'];

        let output = `WORLD BUILDING ELEMENTS\n`;
        output += `${'='.repeat(50)}\n`;
        output += `World Theme: ${topic || 'Random'}\n`;
        output += `World Name: ${randomChoice(worldNames)}\n`;
        output += `ID: ${worldId}\n`;
        output += `${'='.repeat(50)}\n\n`;

        for (const [category, elements] of Object.entries(worldElements)) {
            output += `📍 ${category.toUpperCase()}\n`;
            output += `${'-'.repeat(40)}\n`;
            // Pick 2 random elements per category
            const shuffled = [...elements].sort(() => Math.random() - 0.5);
            shuffled.slice(0, 2).forEach((el, i) => {
                output += `  ${i + 1}. ${el}\n`;
            });
            output += `\n`;
        }

        // Generate connections between elements
        output += `${'-'.repeat(50)}\n`;
        output += `WORLD CONNECTIONS:\n`;
        output += `${'-'.repeat(50)}\n`;
        const connections = [
            "The magic system is directly influenced by the geography of the crystal desert",
            "The creatures are drawn to locations where ancient history events occurred",
            "Cultural practices evolved as a response to the unique magical properties",
            "Political factions formed around competing interpretations of historical events",
            "The geography shapes how different cultures developed their traditions",
            "Creatures play a central role in the political balance of power",
            "Historical events left magical residue that affects the landscape",
            "Cultural beliefs about creatures influence the political structure"
        ];
        const shuffledConnections = [...connections].sort(() => Math.random() - 0.5);
        shuffledConnections.slice(0, 4).forEach((conn, i) => {
            output += `  ${i + 1}. ${conn}\n`;
        });

        output += `\n${'-'.repeat(50)}\n`;
        output += `World ID: ${worldId}\n`;
        output += `End of World Building - ${worldId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        try {
            outputEl.textContent = generateWorld(input);
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
