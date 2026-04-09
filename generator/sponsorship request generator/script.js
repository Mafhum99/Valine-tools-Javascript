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
 * Sponsorship Request Generator
 * Generate sponsorship request letters
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Sponsorship Request Generator', icon: '💰' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateSponsorshipRequest(event) {
        const eventName = titleCase(event);
        const date = new Date();
        let output = `SPONSORSHIP REQUEST: ${eventName.toUpperCase()}\n`;
        output += `${'='.repeat(55)}\n\n`;

        output += `[Your Organization Letterhead]\n`;
        output += `[Date]\n\n`;
        output += `[Sponsor Contact Name]\n`;
        output += `[Title]\n`;
        output += `[Company Name]\n`;
        output += `[Address]\n\n`;

        output += `Dear [Sponsor Contact Name],\n\n`;

        output += `RE: Sponsorship Opportunity — ${eventName}\n\n`;

        output += `INTRODUCTION\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `On behalf of [Organization], I am writing to invite [Company Name] to become a sponsor for ${eventName}, taking place on [Event Date] at [Venue/Location].\n\n`;
        output += `This [annual/inaugural] event brings together [estimated attendees] professionals, thought leaders, and decision-makers from across the ${event.toLowerCase()} industry for a day of [learning/networking/innovation].\n\n`;

        output += `ABOUT THE EVENT\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `Event: ${eventName}\n`;
        output += `Date: [Event Date]\n`;
        output += `Location: [Venue, City]\n`;
        output += `Expected Attendance: [X]+ professionals\n`;
        output += `Demographics:\n`;
        output += `  - [X]% C-Suite / VP Level\n`;
        output += `  - [X]% Director / Manager Level\n`;
        output += `  - [X]% Individual Contributors\n`;
        output += `  - Average household income: $[X]\n`;
        output += `  - Industries: [List top 5 industries]\n\n`;

        output += `WHY [COMPANY NAME]?\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `We specifically want to partner with [Company Name] because of your leadership in [relevant area]. Your commitment to [company value] aligns perfectly with the mission of ${eventName}.\n\n`;
        output += `This is an opportunity to position your brand directly in front of a highly engaged, decision-making audience that actively seeks solutions like yours.\n\n`;

        output += `SPONSORSHIP PACKAGES\n`;
        output += `${'-'.repeat(30)}\n\n`;

        const packages = [
            {
                tier: 'Platinum Sponsor — $[X,000]',
                benefits: [
                    'Exclusive title sponsorship ("${eventName} presented by [Company Name]")',
                    'Keynote speaking slot (15 minutes)',
                    'Premium exhibition booth (20x20)',
                    'Logo on all event materials (banners, programs, website)',
                    'Dedicated social media posts (5 posts across platforms)',
                    'Complimentary tickets for your team (10 passes)',
                    'Attendee list with contact information (opt-in)',
                    'Post-event analytics report'
                ]
            },
            {
                tier: 'Gold Sponsor — $[X,000]',
                benefits: [
                    'Panel discussion participation',
                    'Standard exhibition booth (10x10)',
                    'Logo on event signage and digital materials',
                    'Social media recognition (3 posts)',
                    'Complimentary tickets (5 passes)',
                    'Opportunity to include branded item in attendee swag bag'
                ]
            },
            {
                tier: 'Silver Sponsor — $[X,000]',
                benefits: [
                    'Logo on event website and program',
                    'Social media mention (1 post)',
                    'Complimentary tickets (2 passes)',
                    'Opportunity to display marketing materials at venue'
                ]
            },
            {
                tier: 'Custom Partnership',
                benefits: [
                    'We\'re happy to create a tailored package that meets your specific marketing goals and budget. Let\'s have a conversation about what works best for [Company Name].'
                ]
            }
        ];

        packages.forEach(pkg => {
            output += `${pkg.tier}\n`;
            output += `Includes:\n`;
            pkg.benefits.forEach(b => output += `  - ${b}\n`);
            output += '\n';
        });

        output += `ROI FOR SPONSORS\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `Previous sponsors have reported:\n`;
        output += `- Average of [X] qualified leads per event\n`;
        output += `- [X]% brand awareness lift among attendees\n`;
        output += `- [X] social media impressions during event period\n`;
        output += `- [X]% of attendees made purchasing decision within 90 days post-event\n\n`;

        output += `NEXT STEPS\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `I would welcome the opportunity to discuss this sponsorship opportunity with you in more detail. I'll follow up next week to see if you have any questions.\n\n`;
        output += `In the meantime, please feel free to reach me at [phone] or [email].\n\n`;
        output += `Thank you for considering this opportunity. We would be honored to have [Company Name] as a sponsor for ${eventName}.\n\n`;
        output += `Sincerely,\n\n`;
        output += `[Your Name]\n`;
        output += `[Your Title]\n`;
        output += `[Organization]\n`;
        output += `[Phone Number]\n`;
        output += `[Email Address]`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter an event or initiative name';
            return;
        }
        try {
            outputEl.textContent = generateSponsorshipRequest(input);
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
