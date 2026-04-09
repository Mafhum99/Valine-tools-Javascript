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
 * Follow-Up Email Generator
 * Generate follow-up email templates
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Follow-Up Email Generator', icon: '📧' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateFollowUpEmails(context) {
        const ctx = titleCase(context);
        let output = `FOLLOW-UP EMAIL TEMPLATES: ${ctx.toUpperCase()}\n`;
        output += `${'='.repeat(55)}\n\n`;

        const emails = [
            {
                type: 'After a Meeting / Call',
                subject: `Great connecting today — next steps for ${ctx}`,
                body: `Hi [Name],\n\nIt was great speaking with you today about ${ctx.toLowerCase()}.\n\nAs promised, here's a quick summary of what we discussed:\n\nKey Points:\n- [Point 1 discussed]\n- [Point 2 discussed]\n- [Point 3 discussed]\n\nNext Steps:\n1. [Action item 1] — I'll handle this by [date]\n2. [Action item 2] — You mentioned you'd look into this\n3. [Action item 3] — We'll revisit this on our next call\n\nI've attached the resources we discussed: [attachments]\n\nOur next check-in is scheduled for [date/time]. Looking forward to continuing the conversation.\n\nBest regards,\n[Your Name]\n[Your Title]\n[Contact Information]`
            },
            {
                type: 'After Sending a Proposal',
                subject: `Following up on the ${ctx} proposal`,
                body: `Hi [Name],\n\nI wanted to follow up on the ${ctx.toLowerCase()} proposal I sent over on [date].\n\nHave you had a chance to review it? I'd love to hear your thoughts and answer any questions you might have.\n\nA few highlights worth noting:\n\n- The proposed timeline gets you to results within [timeframe]\n- Our pricing includes [key benefit]\n- We've built in flexibility to adjust scope as needed\n\nI'm available this week for a quick call if it would help to walk through anything together.\n\nWould [date/time] or [date/time] work for you?\n\nBest,\n[Your Name]\n[Your Title]`
            },
            {
                type: 'After No Response (First Follow-Up)',
                subject: `Re: ${ctx}`,
                body: `Hi [Name],\n\nJust bumping this to the top of your inbox.\n\nI know things get busy, so I wanted to follow up on my previous email about ${ctx.toLowerCase()}.\n\nQuick recap:\n\n[1-2 sentence summary of original message]\n\nNo rush — just didn't want this to get lost in the shuffle.\n\nBest,\n[Your Name]`
            },
            {
                type: 'After No Response (Second Follow-Up)',
                subject: `Last follow-up on ${ctx}`,
                body: `Hi [Name],\n\nI don't want to be that person who keeps flooding your inbox.\n\nThis will be my last follow-up about ${ctx.toLowerCase()}.\n\nIf now isn't the right time, I completely understand. Just let me know and I'll circle back in a few weeks.\n\nIf you're interested but haven't had time to review, here's the [link/document] again for easy access.\n\nEither way, I appreciate your time.\n\nBest,\n[Your Name]\n\nP.S. If someone else on your team would be better to connect with, I'd appreciate an intro.`
            },
            {
                type: 'After a Purchase / Onboarding',
                subject: `How's everything going with ${ctx}?`,
                body: `Hi [Name],\n\nNow that you've had a little time to get settled with ${ctx.toLowerCase()}, I wanted to check in.\n\nHow are things going so far?\n\nHere are a few resources that might be helpful:\n\n- Getting Started Guide: [link]\n- Video Tutorials: [link]\n- FAQ / Knowledge Base: [link]\n\nIf you have any questions, run into any issues, or just want to share your experience — I'd love to hear from you.\n\nYour satisfaction is our top priority, and we're here to help however we can.\n\nWarm regards,\n[Your Name]\nCustomer Success Team\n[Contact Information]`
            },
            {
                type: 'After an Event / Conference',
                subject: `Great meeting you at [Event] — let's stay connected`,
                body: `Hi [Name],\n\nIt was a pleasure meeting you at [Event] and chatting about ${ctx.toLowerCase()}.\n\nI really enjoyed our conversation about [specific topic discussed], and I'd love to continue the discussion.\n\nA few things I mentioned that I promised to share:\n\n- [Resource/link 1]\n- [Resource/link 2]\n- [Resource/link 3]\n\nWould you be open to a quick 15-minute call next week? I'd love to explore how we can [specific value proposition].\n\nHere's my calendar: [link] — pick whatever works best for you.\n\nLooking forward to staying in touch.\n\nBest,\n[Your Name]\n[Your Title]\n[LinkedIn Profile]`
            }
        ];

        emails.forEach((email, i) => {
            output += `TEMPLATE ${i + 1}: ${email.type}\n`;
            output += `${'-'.repeat(email.type.length + 10)}\n`;
            output += `Subject: ${email.subject}\n\n`;
            output += `BODY:\n${email.body}\n`;
            output += `\n${'='.repeat(55)}\n\n`;
        });

        output += `FOLLOW-UP BEST PRACTICES\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `- Wait 2-3 business days before first follow-up\n`;
        output += `- Keep follow-ups short and respectful of the recipient's time\n`;
        output += `- Always add value — don't just say "checking in"\n`;
        output += `- Limit to 3 follow-ups maximum before moving on\n`;
        output += `- Personalize each message; avoid copy-paste feel\n`;
        output += `- Include a clear next step or call to action\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter a context (e.g., meeting, proposal, event)';
            return;
        }
        try {
            outputEl.textContent = generateFollowUpEmails(input);
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
