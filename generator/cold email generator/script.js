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
 * Cold Email Generator
 * Generate cold outreach emails
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Cold Email Generator', icon: '❄️' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateColdEmails(topic) {
        const topicTitle = titleCase(topic);
        let output = `COLD EMAIL TEMPLATES: ${topicTitle.toUpperCase()}\n`;
        output += `${'='.repeat(55)}\n\n`;

        const emails = [
            {
                approach: 'Problem-Agitate-Solve',
                subject: `Quick question about your ${topicTitle.toLowerCase()} process`,
                body: `Hi [First Name],\n\nI noticed that [Company] is [relevant observation about their company].\n\nMost [role] I talk to tell me that ${topicTitle.toLowerCase()} is one of their biggest time-sinks. They're spending hours on tasks that could be automated, and it's costing them [specific metric] every month.\n\nSound familiar?\n\nWe help companies like yours streamline ${topicTitle.toLowerCase()} with a platform that:\n\n- Cuts processing time by up to 60%\n- Reduces errors by 85%\n- Pays for itself within the first month\n\nCompanies like [Similar Company 1] and [Similar Company 2] are already seeing these results.\n\nWould you be open to a quick 10-minute call this week to see if this could work for [Company]?\n\nBest,\n[Your Name]\n[Your Title]\n[Company]\n[Calendar Link]\n\nP.S. No pitch deck. No demo. Just an honest conversation about whether we can help.`
            },
            {
                approach: 'Short & Direct',
                subject: `${topicTitle} — worth a conversation?`,
                body: `Hi [First Name],\n\nI'll keep this brief.\n\nWe built a tool that helps teams handle ${topicTitle.toLowerCase()} faster and with fewer headaches.\n\n- 10,000+ users already onboard\n- Average time savings: 10+ hours/week\n- 4.9/5 satisfaction rating\n\nWorth a 10-minute chat to see if it's a fit for [Company]?\n\nHere's my calendar: [link]\n\nBest,\n[Your Name]\n[Your Title]`
            },
            {
                approach: 'Value-First / Insight Sharing',
                subject: `An idea for improving ${topicTitle.toLowerCase()} at [Company]`,
                body: `Hi [First Name],\n\nI was researching how companies approach ${topicTitle.toLowerCase()}, and [Company] came up.\n\nBased on what I've seen, there's a quick win you might be able to implement right away:\n\n[Share a specific, actionable insight relevant to their company]\n\nWe've helped [Number] companies implement this exact improvement, and the average result was [specific metric].\n\nIf you're curious about what else is possible, I'd be happy to share a few more ideas. No strings attached.\n\nOpen to a brief conversation?\n\nBest,\n[Your Name]\n[Your Title]\n[Company]`
            },
            {
                approach: 'Referral / Mutual Connection',
                subject: `[Mutual Connection] suggested I reach out`,
                body: `Hi [First Name],\n\n[Mutual Connection] suggested I get in touch.\n\nWe recently helped them improve their ${topicTitle.toLowerCase()} workflow, and they thought the same approach might be valuable for [Company].\n\nSpecifically, we helped them:\n- [Result 1]\n- [Result 2]\n- [Result 3]\n\nI'd love to explore if we can do something similar for you.\n\nAre you available for a quick call on [Day] or [Day]?\n\nBest,\n[Your Name]\n[Your Title]\n\nP.S. Thanks, [Mutual Connection], for the introduction!`
            },
            {
                approach: 'Competitor / Social Proof',
                subject: `How [Competitor] improved their ${topicTitle.toLowerCase()}`,
                body: `Hi [First Name],\n\n[Competitor/Similar Company] recently transformed how they handle ${topicTitle.toLowerCase()}.\n\nThe results?\n- 45% reduction in processing time\n- 3x more output from the same team size\n- ROI achieved within 6 weeks\n\nThey did it by switching to a more modern approach — and I think [Company] could see similar results.\n\nI've put together a quick case study that breaks down exactly what they did. Want me to send it over?\n\nNo call needed. No demo required. Just useful information.\n\nReply "yes" and I'll share it.\n\nBest,\n[Your Name]\n[Your Title]`
            }
        ];

        emails.forEach((email, i) => {
            output += `TEMPLATE ${i + 1}: ${email.approach}\n`;
            output += `${'-'.repeat(email.approach.length + 10)}\n`;
            output += `Subject: ${email.subject}\n\n`;
            output += `BODY:\n${email.body}\n`;
            output += `\n${'='.repeat(55)}\n\n`;
        });

        output += `COLD EMAIL BEST PRACTICES\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `- Keep it under 150 words — busy people skim\n`;
        output += `- Personalize the first line; show you've done research\n`;
        output += `- One clear CTA — don't ask for multiple things\n`;
        output += `- Ask for a small commitment (10 min call, not 30 min demo)\n`;
        output += `- Send Tuesday-Thursday, 9-11 AM or 2-4 PM for best open rates\n`;
        output += `- Follow up 2-3 times if you don't get a response\n`;
        output += `- Always include an easy out — "if this isn't relevant, no worries"\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter a product, service, or outreach topic';
            return;
        }
        try {
            outputEl.textContent = generateColdEmails(input);
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
