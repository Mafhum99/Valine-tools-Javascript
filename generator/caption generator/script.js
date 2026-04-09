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
 * Caption Generator
 * Generate captions for social media
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Caption Generator', icon: '\uD83D\uDCAC' });

    // Get elements
    const descriptionEl = $('#description');
    const captionStyleEl = $('#caption-style');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateCaptions(description, style) {
        const captions = [];
        const desc = description || 'this moment';

        switch (style) {
            case 'short':
                captions.push('Living for ' + desc + '. \u2728');
                captions.push('Good vibes only. ' + desc + ' \uD83D\uDCAB');
                captions.push('This is what ' + desc + ' looks like. \uD83D\uDC4C');
                captions.push('Capturing ' + desc + ' one moment at a time. \uD83D\uDCF8');
                captions.push('Just ' + desc + ' kind of day. \u2764\uFE0F');
                captions.push(desc + ' - that is the vibe. \u2728');
                captions.push('All about ' + desc + ' today. \uD83C\uDF1F');
                break;

            case 'engaging':
                captions.push('What do you think about ' + desc + '? Drop your thoughts below! \uD83D\uDC47');
                captions.push('Tell me I am not the only one who loves ' + desc + '! Who else relates? \uD83D\uDE4B');
                captions.push('Hot take: ' + desc + ' is underrated. Agree or disagree? Let us debate below. \uD83D\uDD25');
                captions.push('Question for my followers: What is your favorite thing about ' + desc + '? I want to hear everything! \uD83D\uDCAC');
                captions.push('Tag someone who needs to see ' + desc + ' right now. \uD83D\uDC47\uD83D\uDC95');
                captions.push('Would you rather experience ' + desc + ' or keep scrolling? Be honest. \uD83D\uDE09');
                captions.push('On a scale of 1 to 10, how much do you love ' + desc + '? I am at an 11. \uD83D\uDE0D');
                break;

            case 'inspirational':
                captions.push('Remember: ' + desc + ' is not just a moment, it is a reminder of what is possible when you believe in yourself. \u2728');
                captions.push('Every day brings new opportunities. Today, ' + desc + ' is my reason to keep pushing forward. Keep going, you have got this. \uD83D\uDCAB');
                captions.push('They said it could not be done. ' + desc + ' is proof that with determination, anything is possible. Dream big. \uD83C\uDF1F');
                captions.push('Life is too short to wait for the perfect moment. Create it. ' + desc + ' is my reminder to seize the day. \u2764\uFE0F');
                captions.push('The best is yet to come. ' + desc + ' is just the beginning of something beautiful. Trust the process. \uD83D\uDD4A\uFE0F');
                captions.push('Believe in the power of ' + desc + '. Great things happen to those who never give up. \uD83D\uDCAA');
                captions.push('Behind every success story is someone who chose ' + desc + ' over comfort. Choose growth. \uD83C\uDF31');
                break;

            case 'funny':
                captions.push('Me pretending I have ' + desc + ' all figured out: \uD83D\uDE0E\nReality: \uD83D\uDE35');
                captions.push('If ' + desc + ' was a person, I would marry it. Sorry, no further comments. \uD83D\uDE02');
                captions.push('My therapist said I need to talk more about ' + desc + '. So here we are. \uD83E\uDD14');
                captions.push('POV: You just discovered ' + desc + ' and now it is your entire personality. No regrets. \uD83D\uDE05');
                captions.push('I am not saying ' + desc + ' changed my life... but I am not NOT saying that either. \uD83E\uDD37');
                captions.push('Current relationship status: committed to ' + desc + '. Send help. Or don not. I am fine here. \uD83D\uDE02');
                captions.push('Breaking: Local person spends way too much time thinking about ' + desc + '. More at 11. \uD83D\uDCF0');
                break;

            case 'minimalist':
                captions.push(desc + '.');
                captions.push('\u2022 ' + desc + ' \u2022');
                captions.push('... ' + desc);
                captions.push(desc + ' \u2014 that is it.');
                captions.push('simply ' + desc);
                captions.push(desc + '. \u2728');
                captions.push('just ' + desc);
                break;

            default:
                captions.push(desc + ' \u2728');
                captions.push('Loving ' + desc + ' \u2764\uFE0F');
                captions.push(desc + ' vibes \uD83D\uDCAB');
        }

        return captions;
    }

    function generateCaptionsFn() {
        const description = descriptionEl.value.trim();
        const style = captionStyleEl.value;

        if (!description) {
            outputEl.textContent = 'Please enter a description of your image or content.';
            return;
        }

        try {
            const captions = generateCaptions(description, style);

            let result = 'CAPTION OPTIONS\n';
            result += 'Style: ' + style.charAt(0).toUpperCase() + style.slice(1) + '\n';
            result += '='.repeat(50) + '\n\n';

            captions.forEach((caption, idx) => {
                result += (idx + 1) + '. ' + caption + '\n\n';
            });

            result += '='.repeat(50) + '\n';
            result += 'Tip: Add relevant hashtags to increase reach and engagement.';

            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    // Clear function
    function clear() {
        descriptionEl.value = '';
        outputEl.textContent = '-';
        descriptionEl.focus();
    }

    // Event listeners
    generateBtn.addEventListener('click', generateCaptionsFn);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }
});
