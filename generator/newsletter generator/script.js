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
 * Newsletter Generator
 * Generate newsletter content from topic descriptions
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Newsletter Generator', icon: '📰' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateNewsletter(topic) {
        const topicTitle = titleCase(topic);
        const date = new Date();
        const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        let output = `NEWSLETTER: ${topicTitle.toUpperCase()}\n`;
        output += `Issue Date: ${dateStr}\n`;
        output += `${'='.repeat(55)}\n\n`;

        output += `--- HEADER ---\n`;
        output += `The ${topicTitle} Weekly\n`;
        output += `Issue #${randomInt(1, 52)} | ${dateStr}\n\n`;

        output += `--- OPENING / EDIT'S NOTE ---\n\n`;
        output += `Hi [First Name],\n\n`;
        output += `Welcome to this week's edition of The ${topicTitle} Weekly — your go-to source for everything ${topicTitle.toLowerCase()}.\n\n`;
        output += `This week, we're diving into some exciting updates, practical tips, and a story that I think you'll find really valuable.\n\n`;
        output += `Let's get into it.\n\n`;

        output += `--- SECTION 1: Featured Article ---\n\n`;
        output += `HEADLINE: The Future of ${topicTitle}: 5 Trends Shaping 2025\n\n`;
        output += `We've been tracking the ${topicTitle.toLowerCase()} landscape closely, and five major trends are emerging that will define how professionals approach ${topicTitle.toLowerCase()} this year.\n\n`;
        output += `1. AI-Powered Automation: Tools are getting smarter, handling complex ${topicTitle.toLowerCase()} tasks that used to require human intervention.\n\n`;
        output += `2. Integration-First Approach: The best ${topicTitle.toLowerCase()} solutions now connect seamlessly with your existing tech stack.\n\n`;
        output += `3. Data-Driven Decision Making: Real-time analytics are becoming the standard, not the exception.\n\n`;
        output += `4. Mobile-First Workflows: With remote work here to stay, ${topicTitle.toLowerCase()} on mobile is no longer optional.\n\n`;
        output += `5. Collaboration at Scale: Teams are demanding better ways to work together on ${topicTitle.toLowerCase()} projects.\n\n`;
        output += `[Read the full article]\n\n`;

        output += `--- SECTION 2: Quick Tips ---\n\n`;
        output += `HEADLINE: 3 ${capitalize(topicTitle)} Tips You Can Use Today\n\n`;
        output += `Tip #1: Automate Your Daily Review\nSet aside 15 minutes each morning to review your ${topicTitle.toLowerCase()} metrics. The data patterns you'll spot will inform every decision you make that day.\n\n`;
        output += `Tip #2: Use Templates for Repetitive Tasks\nCreate standardized templates for your most common ${topicTitle.toLowerCase()} workflows. You'll save hours every week and reduce errors.\n\n`;
        output += `Tip #3: Schedule Weekly Team Syncs\nA quick 30-minute meeting about ${topicTitle.toLowerCase()} priorities keeps everyone aligned and prevents costly miscommunication.\n\n`;

        output += `--- SECTION 3: Tool/Resource Spotlight ---\n\n`;
        output += `HEADLINE: This Week's Must-Have ${topicTitle} Resource\n\n`;
        output += `We're spotlighting a resource that's been getting incredible feedback from the ${topicTitle.toLowerCase()} community.\n\n`;
        output += `Whether you're a beginner or a seasoned pro, this resource will level up your ${topicTitle.toLowerCase()} game.\n\n`;
        output += `What makes it great:\n- Practical, actionable advice\n- Based on real-world case studies\n- Free to access and use\n\n`;
        output += `[Check it out here]\n\n`;

        output += `--- SECTION 4: Community Corner ---\n\n`;
        output += `HEADLINE: From Our ${topicTitle} Community\n\n`;
        output += `"This newsletter has become my Monday morning essential. The tips alone have saved our team 10+ hours a week." — Alex M.\n\n`;
        output += `Have a ${topicTitle.toLowerCase()} win you'd like to share? Reply to this email — we might feature it in next week's issue!\n\n`;

        output += `--- CLOSING / CTA ---\n\n`;
        output += `That's a wrap for this week!\n\n`;
        output += `If you found this valuable, forward it to a colleague who'd benefit. And if someone forwarded this to you, [subscribe here] to get next week's issue directly.\n\n`;
        output += `Until next time, keep pushing the boundaries of what's possible with ${topicTitle}.\n\n`;
        output += `Best,\n[Your Name]\nEditor, The ${topicTitle} Weekly\n\n`;

        output += `--- P.S. ---\n\n`;
        output += `P.S. We're working on something big for next week's issue. You won't want to miss it.\n\n`;

        output += `NEWSLETTER METADATA\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `Estimated read time: 5-7 minutes\n`;
        output += `Recommended send time: Tuesday, 10 AM\n`;
        output += `Target open rate: 25%+\n`;
        output += `Target click rate: 3%+\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter a newsletter topic or theme';
            return;
        }
        try {
            outputEl.textContent = generateNewsletter(input);
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
