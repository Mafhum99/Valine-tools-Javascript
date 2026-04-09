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
 * Mad Libs Generator - 618
 * Generate Mad Libs stories
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Mad Libs Generator', icon: '📖' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const wordBank = {
        adjective: ['gigantic', 'sparkly', 'invisible', 'mushy', 'squeaky', 'bouncy', 'smelly', 'frozen', 'glowing', 'wobbly', 'ancient', 'tiny', 'fierce', 'silly', 'mysterious', 'fluffy', 'rusty', 'magnetic', 'sticky', 'cosmic'],
        noun: ['elephant', 'spaceship', 'pancake', 'tornado', 'dinosaur', 'rainbow', 'volcano', 'pyramid', 'butterfly', 'waterfall', 'robot', 'castle', 'penguin', 'thunderstorm', 'mountain', 'telescope', 'lighthouse', 'submarine', 'treasure', 'dragon'],
        verb: ['danced', 'exploded', 'whispered', 'galloped', 'sprinted', 'melted', 'bounced', 'crashed', 'floated', 'screamed', 'giggled', 'tumbled', 'glowed', 'shattered', 'soared', 'crawled', 'spun', 'bubbled', 'rumbled', 'zoomed'],
        adverb: ['gracefully', 'violently', 'silently', 'enthusiastically', 'sleepily', 'dramatically', 'suspiciously', 'cheerfully', 'awkwardly', 'furiously', 'elegantly', 'clumsily', 'mysteriously', 'wildly', 'cautiously'],
        bodyPart: ['nose', 'elbow', 'knee', 'eyebrow', 'earlobe', 'bellybutton', 'toe', 'chin', 'shoulder', 'ankle'],
        animal: ['platypus', 'flamingo', 'hedgehog', 'octopus', 'chameleon', 'wombat', 'sloth', 'lemur', 'axolotl', 'narwhal'],
        food: ['pizza', 'spaghetti', 'marshmallow', 'pickle', 'donut', 'taco', 'waffle', 'sushi', 'cheeseburger', 'cupcake']
    };

    const storyTemplates = [
        {
            title: "A Day at the Zoo",
            template: (words) => `Today I went to the zoo. What a ${words[0]} day it was!
First, I saw a ${words[1]} that was ${words[2]} all over the place.
Then I watched a ${words[3]} ${words[4]} with a ${words[5]} ${words[6]}.
The zookeeper said the ${words[7]} likes to eat ${words[8]} for breakfast.
When I got home, my ${words[9]} was so tired I could barely stand!
What a ${words[10]} adventure!`,
            blanks: ['adjective', 'animal', 'adverb', 'animal', 'verb', 'adjective', 'noun', 'animal', 'food', 'bodyPart', 'adjective']
        },
        {
            title: "The Magic Recipe",
            title: "The Magic Recipe",
            template: (words) => `Once upon a time, there was a ${words[0]} chef who made the world's best ${words[1]}.
The secret ingredient? A ${words[2]} ${words[3]}!
Every morning, the chef would ${words[4]} into the kitchen and ${words[5]} the ${words[6]}.
"One pinch of ${words[7]} and a dash of ${words[8]}!" the chef would exclaim.
The customers would come from far and wide, ${words[9]} with excitement.
"It's the most ${words[10]} thing I've ever tasted!" they'd say.`,
            blanks: ['adjective', 'food', 'adjective', 'noun', 'verb', 'verb', 'noun', 'food', 'noun', 'adverb', 'adjective']
        },
        {
            title: "Space Adventure",
            template: (words) => `Captain ${words[0]} was on a mission to explore the ${words[1]} galaxy.
Their ${words[2]} ship could ${words[3]} through space at incredible speeds.
"We've found a ${words[4]} planet!" shouted the ${words[5]} crewmate.
The surface was covered in ${words[6]} ${words[7]} as far as the eye could see.
Suddenly, a ${words[8]} ${words[9]} appeared from behind a crater.
"Everyone stay ${words[10]}!" the captain ordered.`,
            blanks: ['noun', 'adjective', 'adjective', 'verb', 'adjective', 'adjective', 'adjective', 'noun', 'adjective', 'animal', 'adverb']
        },
        {
            title: "The School Day",
            template: (words) => `It was a ${words[0]} Monday morning when I arrived at school.
My teacher, Mrs. ${words[1]}, had planned a ${words[2]} activity.
"Today we're going to ${words[3]} with ${words[4]}!" she announced.
Everyone grabbed their ${words[5]} and began to work ${words[6]}.
Then the fire alarm went off! We all ${words[7]} outside in a ${words[8]} line.
Standing on the lawn, I noticed a ${words[9]} ${words[10]} in the parking lot.
This was the most ${words[11]} school day ever!`,
            blanks: ['adjective', 'noun', 'adjective', 'verb', 'noun', 'noun', 'adverb', 'verb', 'adjective', 'adjective', 'animal', 'adjective']
        },
        {
            title: "The Haunted House",
            template: (words) => `The old house at the end of ${words[0]} Street had been empty for years.
Last night, I heard a ${words[1]} noise coming from inside.
I ${words[2]} to the door and found it ${words[3]} open.
Inside, the walls were covered in ${words[4]} ${words[5]}.
A ${words[6]} ${words[7]} appeared at the top of the stairs!
It ${words[8]} ${words[9]} down the hallway.
I ran out as fast as I could, my ${words[10]} pounding the entire way!
But I still felt ${words[11]} about going back.`,
            blanks: ['noun', 'adjective', 'verb', 'adjective', 'adjective', 'noun', 'adjective', 'animal', 'verb', 'adverb', 'bodyPart', 'adjective']
        }
    ];

    function generateMadLibs(topic) {
        const madLibId = `ML-${Date.now().toString(36).toUpperCase()}`;
        const story = randomChoice(storyTemplates);

        // Generate random words for blanks
        const words = story.blanks.map(type => randomChoice(wordBank[type]));
        const storyText = story.template(words);

        let output = `MAD LIBS STORY\n`;
        output += `${'='.repeat(50)}\n`;
        output += `Title: ${story.title}\n`;
        output += `Theme: ${topic || 'Random'}\n`;
        output += `ID: ${madLibId}\n`;
        output += `${'='.repeat(50)}\n\n`;

        output += `FILLED-IN VERSION:\n`;
        output += `${'-'.repeat(40)}\n`;
        output += `${storyText}\n\n`;

        // Generate the fill-in-the-blanks version
        output += `FILL-IN-THE-BLANKS VERSION:\n`;
        output += `${'-'.repeat(40)}\n`;
        let blankTemplate = story.template;
        let blankIndex = 0;
        let blankOutput = '';
        for (const char of story.template.toString()) {
            blankOutput += char;
        }

        // Create the blank version
        blankOutput = story.template.toString().replace(/\$\{words\[\d+\]\}/g, (match) => {
            const num = parseInt(match.match(/\d+/)[0]);
            const type = story.blanks[num];
            return `______ (${type.toUpperCase()})`;
        });

        // Simpler approach - replace words with blanks
        const blankVersion = story.template.toString();
        output += `[Fill in the blanks with words from each category]\n\n`;
        story.blanks.forEach((type, i) => {
            output += `  ${i + 1}. ${type.toUpperCase()}: ________\n`;
        });
        output += `\n`;

        output += `${'-'.repeat(50)}\n`;
        output += `Mad Lib ID: ${madLibId}\n`;
        output += `End of Mad Libs - ${madLibId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        try {
            outputEl.textContent = generateMadLibs(input);
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
