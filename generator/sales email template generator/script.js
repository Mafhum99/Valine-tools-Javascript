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
 * Sales Email Template Generator
 * Generate sales email templates
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Sales Email Template Generator', icon: '💼' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateSalesEmails(product) {
        const productName = titleCase(product);
        let output = `SALES EMAIL TEMPLATES: ${productName.toUpperCase()}\n`;
        output += `${'='.repeat(55)}\n\n`;

        const emails = [
            {
                stage: 'Initial Outreach',
                subject: `A better way to handle ${productName.toLowerCase()}`,
                body: `Hi [First Name],\n\nI came across [Company] and noticed you're [relevant observation].\n\nIf ${productName.toLowerCase()} is part of your daily operations, I wanted to share something that might interest you.\n\n${productName} helps teams like yours:\n\n- Save 10+ hours per week on routine tasks\n- Reduce errors and rework by 85%\n- Scale operations without adding headcount\n\nWe're trusted by 10,000+ professionals, including teams at [Notable Company 1] and [Notable Company 2].\n\nWould you be open to a brief 10-minute conversation to see if this could be a fit?\n\nBest,\n[Your Name]\n[Your Title]\n[Calendar Link]`
            },
            {
                stage: 'Value Proposition',
                subject: `Here's what ${productName} can do for [Company]`,
                body: `Hi [First Name],\n\nFollowing up on my last email — I wanted to share something specific.\n\nWe recently ran the numbers on what ${productName.toLowerCase()} could mean for a company like [Company]:\n\nBased on your team size of approximately [X] people:\n\n- Estimated time savings: [X] hours per week\n- Estimated cost savings: $[X] per month\n- ROI timeline: [X] weeks\n\nThese aren't guesses — they're based on actual results from similar companies.\n\nI'd love to walk you through the specifics for your team. Got 15 minutes this week?\n\n[Calendar Link]\n\nBest,\n[Your Name]`
            },
            {
                stage: 'Case Study / Social Proof',
                subject: `How [Similar Company] saved $50K with ${productName}`,
                body: `Hi [First Name],\n\n[Similar Company] was in the same position as [Company] — struggling with ${productName.toLowerCase()} and looking for a better solution.\n\nHere's what happened after they switched to ${productName}:\n\nBefore ${productName}:\n- Manual processes eating up 20+ hours/week\n- Error rate of 15% requiring rework\n- Team frustrated with outdated tools\n\nAfter ${productName}:\n- Automated workflows saved 18 hours/week\n- Error rate dropped to 2%\n- Team satisfaction scores up 40%\n- ROI achieved in just 6 weeks\n\n"We should have made the switch a year ago." — [Name], [Title] at [Similar Company]\n\nWant the full case study? I can send it over — just reply "send it."\n\nBest,\n[Your Name]`
            },
            {
                stage: 'Objection Handling',
                subject: `Addressing common concerns about ${productName}`,
                body: `Hi [First Name],\n\nI know evaluating a new tool like ${productName} raises questions. Here are the ones I hear most often:\n\n"I don't have time to learn a new tool."\n${productName} is designed to be intuitive. Most teams are productive within their first day. Plus, we provide free onboarding support.\n\n"It's probably too expensive."\nOur customers average an ROI of 5x within the first quarter. The tool literally pays for itself.\n\n"We already have something in place."\nThat's actually great — it means you recognize the need. Many of our customers switched from [Competitor] because they wanted [key differentiator].\n\n"What if it doesn't work for us?"\nWe offer a 30-day money-back guarantee. Zero risk.\n\nStill curious? Let's talk.\n\n[Calendar Link]\n\nBest,\n[Your Name]`
            },
            {
                stage: 'Urgency / Close',
                subject: `Last call: ${productName} offer ends this week`,
                body: `Hi [First Name],\n\nI don't want you to miss out.\n\nThe [discount/special offer] we discussed for ${productName} expires on [date].\n\nAfter that, pricing goes back to standard rates.\n\nHere's what you'd be getting:\n\n- Full access to all ${productName} features\n- Priority onboarding and support\n- [Bonus feature or resource]\n- Team seats for up to [X] users\n\nAll at [discount]% off.\n\n[Secure Your Discount]\n\nI genuinely believe ${productName} can transform how [Company] handles things. And I'd hate for pricing to be the reason you miss out.\n\nQuestions? I'm just a reply away.\n\nBest,\n[Your Name]\n[Your Title]`
            },
            {
                stage: 'Break-Up Email',
                subject: `Should I close your file?`,
                body: `Hi [First Name],\n\nI've reached out a few times about ${productName}, and I haven't heard back.\n\nI'm assuming one of three things:\n\n1. You're all set — great, glad you found a solution.\n2. The timing isn't right — I get it. Want me to circle back next quarter?\n3. My emails are buried in a busy inbox — if this IS relevant, just reply and I'll make it easy.\n\nEither way, I'll stop reaching out after this.\n\nBut if ${productName.toLowerCase()} is something you'd like to explore down the road, you always know where to find me.\n\nWishing you and [Company] all the best.\n\nRegards,\n[Your Name]\n[Your Title]\n\nP.S. If someone else on your team owns this, a quick intro would be much appreciated.`
            }
        ];

        emails.forEach((email, i) => {
            output += `EMAIL ${i + 1}: ${email.stage}\n`;
            output += `${'-'.repeat(email.stage.length + 8)}\n`;
            output += `Subject: ${email.subject}\n\n`;
            output += `BODY:\n${email.body}\n`;
            output += `\n${'='.repeat(55)}\n\n`;
        });

        output += `SALES EMAIL BEST PRACTICES\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `- Personalize every email with company and role-specific details\n`;
        output += `- Lead with value, not your product's features\n`;
        output += `- Keep emails under 150 words for higher response rates\n`;
        output += `- Space emails 3-4 business days apart\n`;
        output += `- Always have a single, clear CTA\n`;
        output += `- Track reply rates, not just open rates\n`;
        output += `- Aim for 6-8 touchpoints before marking as unresponsive\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter a product or service to sell';
            return;
        }
        try {
            outputEl.textContent = generateSalesEmails(input);
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
