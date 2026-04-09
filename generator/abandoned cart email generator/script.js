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
// Abandoned Cart Email Generator
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Abandoned Cart Email Generator', icon: '🛒' });

    const input = $('#input');
    const output = $('#output');
    const actionBtn = $('#action-btn');
    const clearBtn = $('#clear-btn');
    const copyBtn = $('#copy-btn');

    function generateAbandonedCartEmails(store) {
        const storeName = titleCase(store);
        let output = `ABANDONED CART EMAIL SEQUENCE: ${storeName.toUpperCase()}\n`;
        output += `${'='.repeat(55)}\n\n`;

        const emails = [
            {
                email: 1,
                timing: 'Send 1 hour after abandonment',
                subject: `You left something behind...`,
                previewText: `Your cart is waiting for you`,
                body: `Hi [First Name],\n\nWe noticed you left some items in your ${storeName} cart.\n\nGood news: we saved them for you.\n\nYour cart contains:\n[Product Name] — [Price]\n\nThese items are popular and tend to sell out fast, so we'd recommend completing your purchase soon.\n\n[Return to Cart]\n\nNeed help? Our team is here to answer any questions.\n\nSee you soon,\nThe ${storeName} Team\n\nP.S. Free shipping on orders over [threshold]!`
            },
            {
                email: 2,
                timing: 'Send 24 hours after abandonment',
                subject: `Still thinking about it, [First Name]?`,
                previewText: `Your favorites are almost gone`,
                body: `Hi [First Name],\n\nJust a friendly reminder — the items in your ${storeName} cart are still waiting.\n\nWe get it. Sometimes you need a little time to think things over.\n\nBut here's what you should know:\n\n- Your cart is reserved for the next 24 hours\n- Items are selling fast (only [X] left in stock)\n- We offer free returns if something isn't right\n- Our customer support team is available 24/7\n\nStill not sure? Here's what other customers love about these items:\n\n[Customer Review 1]\n[Customer Review 2]\n\n[Complete Your Purchase]\n\nNo pressure — just don't want you to miss out.\n\nBest,\nThe ${storeName} Team`
            },
            {
                email: 3,
                timing: 'Send 48 hours after abandonment',
                subject: `Here's 10% off to finish your order`,
                previewText: `A little something to help you decide`,
                body: `Hi [First Name],\n\nWe really want you to experience ${storeName}.\n\nSo here's a little something to sweeten the deal:\n\nUse code COMEBACK10 at checkout for 10% off your entire order.\n\n[Apply Discount & Checkout]\n\nThis code expires in 48 hours, so don't wait too long.\n\nWhat you're getting:\n- Premium quality products\n- Free shipping on orders over [threshold]\n- 30-day hassle-free returns\n- Dedicated customer support\n\nWe're confident you'll love everything about your ${storeName} experience.\n\nHappy shopping,\nThe ${storeName} Team\n\nP.S. This is your last reminder — your cart will expire soon!`
            },
            {
                email: 4,
                timing: 'Send 7 days after abandonment',
                subject: `Last chance: Your cart is expiring`,
                previewText: `Final notice before your items are released`,
                body: `Hi [First Name],\n\nThis is the last we'll bug you about your cart.\n\nIn a few hours, the items will be released back to our general inventory.\n\nIf you still want them:\n\n[One Last Chance to Checkout]\n\nIf not, no worries at all. We'll be here with fresh arrivals and new deals.\n\nEither way, thanks for considering ${storeName}.\n\nWarm regards,\nThe ${storeName} Team\n\nP.S. Follow us on social media for exclusive drops and flash sales @${slugify(storeName)}`
            }
        ];

        emails.forEach((email) => {
            output += `EMAIL ${email.email}: ${email.timing}\n`;
            output += `${'-'.repeat(45)}\n`;
            output += `Subject: ${email.subject}\n`;
            output += `Preview Text: ${email.previewText}\n\n`;
            output += `BODY:\n${email.body}\n`;
            output += `\n${'='.repeat(55)}\n\n`;
        });

        output += `ABANDONED CART STRATEGY TIPS\n`;
        output += `${'-'.repeat(30)}\n`;
        output += `- 70% of carts are abandoned — recovery emails can recover 10-15%\n`;
        output += `- First email should be helpful, not pushy\n`;
        output += `- Include product images and direct checkout links\n`;
        output += `- Offer discount in email 3 or 4 only (not too early)\n`;
        output += `- Segment by cart value: higher carts may need more nurturing\n`;
        output += `- A/B test subject lines, send times, and discount amounts\n`;

        return output;
    }

    actionBtn?.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) {
            output.textContent = 'Please enter a store or brand name';
            return;
        }
        try {
            output.textContent = generateAbandonedCartEmails(value);
        } catch (error) {
            output.textContent = 'Error: ' + error.message;
        }
    });

    clearBtn?.addEventListener('click', () => {
        input.value = '';
        output.textContent = '-';
        input.focus();
    });

    copyBtn?.addEventListener('click', () => {
        if (output.textContent && output.textContent !== '-') {
            copyToClipboard(output.textContent);
        }
    });

    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') actionBtn?.click();
    });
});
