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
 * Email Campaign Generator
 * Generate email campaign sequences from topic descriptions
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Email Campaign Generator', icon: '📧' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateEmailCampaign(topic) {
        const topicTitle = titleCase(topic);
        let output = `EMAIL CAMPAIGN: ${topicTitle.toUpperCase()}\n`;
        output += `${'='.repeat(55)}\n\n`;

        const emails = [
            {
                day: 'Day 1 - Welcome / Introduction',
                subject: `Welcome to ${topicTitle}! Here's what to expect`,
                previewText: `Your journey to better ${topicTitle.toLowerCase()} starts now`,
                body: `Hi [First Name],\n\nWelcome aboard! We're thrilled to have you here.\n\nOver the next few days, we're going to show you exactly how ${topicTitle} can transform the way you work.\n\nHere's what you can look forward to:\n\n1. A quick walkthrough of the key features\n2. Pro tips from our power users\n3. Real results from people just like you\n4. A special offer just for new members\n\nFor now, here are three things you can do right now:\n\n- Complete your profile setup (takes 2 minutes)\n- Explore the dashboard\n- Check out our getting started guide\n\nNeed help? Just hit reply. Our team reads every email.\n\nHere's to your success,\nThe ${topicTitle} Team\n\nP.S. Keep an eye on your inbox tomorrow for our #1 tip.`
            },
            {
                day: 'Day 3 - Value / Education',
                subject: `The #1 mistake people make with ${topicTitle}`,
                previewText: `Avoid this common pitfall and see better results`,
                body: `Hi [First Name],\n\nHere's something most people don't realize about ${topicTitle.toLowerCase()}...\n\nThe biggest mistake we see? Not taking advantage of automation from day one.\n\nHere's the thing: ${topicTitle} was designed to save you time. But if you're still doing things manually, you're leaving results on the table.\n\nTry this instead:\n\n1. Go to Settings > Automation\n2. Enable the recommended workflows\n3. Customize the triggers to match your process\n\nThat's it. You'll instantly save 5-10 hours per week.\n\nOur users who set up automation in their first week see 3x better results than those who don't.\n\nWant a full walkthrough? [Watch the 5-minute demo]\n\nBest,\nThe ${topicTitle} Team`
            },
            {
                day: 'Day 5 - Social Proof',
                subject: `How Sarah saved 15 hours/week with ${topicTitle}`,
                previewText: `Real story, real results`,
                body: `Hi [First Name],\n\nLet me tell you about Sarah.\n\nShe's an operations manager at a mid-size company, and before ${topicTitle}, she was spending 20+ hours a week just on routine tasks.\n\nSound familiar?\n\nAfter switching to ${topicTitle}:\n\n\u2705 Cut routine task time from 20 hours to 5 hours\n\u2705 Reduced errors by 85%\n\u2705 Got promoted within 6 months\n\n"{{topicTitle}} gave me my evenings and weekends back," Sarah says. "I can actually focus on strategy instead of busywork."\n\nSarah isn't an exception. She's the rule.\n\nReady to write your own success story?\n\n[Get Started with ${topicTitle}]\n\nCheers,\nThe ${topicTitle} Team`
            },
            {
                day: 'Day 7 - Offer / Conversion',
                subject: `Last chance: Your ${topicTitle} offer expires soon`,
                previewText: `Don't miss out on this exclusive deal`,
                body: `Hi [First Name],\n\nQuick heads up: the special offer we mentioned when you signed up expires in 48 hours.\n\nHere's what you get:\n\n- Full access to all ${topicTitle} features\n- Priority support for 30 days\n- Exclusive templates and resources\n- Team collaboration tools for up to 5 users\n\nAll at [discount]% off the regular price.\n\nAfter [date], this offer won't be available again.\n\n[Claim Your Discount Now]\n\nNo risk. Cancel anytime. 30-day money-back guarantee.\n\nSee you inside,\nThe ${topicTitle} Team\n\nP.S. Still have questions? Reply to this email and we'll sort it out personally.`
            },
            {
                day: 'Day 10 - Re-engagement',
                subject: `Did you see this, [First Name]?`,
                previewText: `We noticed you haven't been active lately`,
                body: `Hi [First Name],\n\nWe noticed you haven't been as active lately, and we wanted to check in.\n\nIs there something we can help with?\n\nMaybe you:\n- Got busy with other priorities\n- Ran into a technical issue\n- Aren't sure where to start\n- Need a feature we don't have yet\n\nWhatever it is, we want to help.\n\nHere are some quick resources:\n\n- Help Center: [link]\n- Video Tutorials: [link]\n- Live Chat: Available 24/7\n\nOr just reply to this email and tell us what's on your mind. A real person will get back to you within a few hours.\n\nWe built ${topicTitle} for people like you, and we'd hate to see you miss out.\n\nWarm regards,\nThe ${topicTitle} Team`
            }
        ];

        emails.forEach((email, i) => {
            output += `EMAIL ${i + 1}: ${email.day}\n`;
            output += `${'-'.repeat(45)}\n`;
            output += `Subject: ${email.subject}\n`;
            output += `Preview Text: ${email.previewText}\n\n`;
            output += `BODY:\n${email.body}\n`;
            output += `\n${'='.repeat(55)}\n\n`;
        });

        output += `CAMPAIGN SETTINGS\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `- Send frequency: Every 2-3 days\n`;
        output += `- Best send time: Tuesday-Thursday, 10 AM - 2 PM\n`;
        output += `- Segment: New subscribers who signed up in last 30 days\n`;
        output += `- Goal: Convert free users to paid subscribers\n`;
        output += `- A/B test: Subject lines and CTA button text\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter a topic or product for email campaign';
            return;
        }
        try {
            outputEl.textContent = generateEmailCampaign(input);
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
