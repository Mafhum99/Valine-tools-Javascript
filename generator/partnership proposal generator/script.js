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
 * Partnership Proposal Generator
 * Generate partnership proposals
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Partnership Proposal Generator', icon: '🤝' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generatePartnershipProposal(topic) {
        const topicTitle = titleCase(topic);
        const date = new Date();
        const dateStr = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        let output = `PARTNERSHIP PROPOSAL: ${topicTitle.toUpperCase()}\n`;
        output += `Date: ${dateStr}\n`;
        output += `${'='.repeat(55)}\n\n`;

        output += `1. EXECUTIVE SUMMARY\n`;
        output += `${'-'.repeat(30)}\n\n`;
        output += `This proposal outlines a mutually beneficial partnership between [Your Company] and [Partner Company] centered around ${topicTitle.toLowerCase()}.\n\n`;
        output += `By combining our [your strength] with your [partner strength], we can create significant value for both organizations and our shared audience.\n\n`;

        output += `2. PARTNERSHIP OBJECTIVES\n`;
        output += `${'-'.repeat(30)}\n\n`;
        output += `Primary Goals:\n`;
        output += `- Expand market reach and visibility in the ${topicTitle.toLowerCase()} space\n`;
        output += `- Leverage combined expertise to deliver superior value to customers\n`;
        output += `- Generate new revenue streams for both organizations\n`;
        output += `- Build a long-term strategic relationship in the ${topicTitle.toLowerCase()} ecosystem\n\n`;

        output += `3. PARTNERSHIP MODEL\n`;
        output += `${'-'.repeat(30)}\n\n`;
        output += `We propose the following partnership structure:\n\n`;

        const models = [
            { name: 'Referral Partnership', desc: `Each party refers clients who need ${topicTitle.toLowerCase()} services to the other, with a [X]% referral fee for each successful introduction.` },
            { name: 'Co-Marketing Partnership', desc: `Joint webinars, blog posts, and events focused on ${topicTitle.toLowerCase()} topics, sharing audiences and marketing costs.` },
            { name: 'Integration Partnership', desc: `Technical integration between our platforms to provide seamless ${topicTitle.toLowerCase()} workflows for shared customers.` },
            { name: 'Reseller Partnership', desc: `[Partner Company] resells our ${topicTitle.toLowerCase()} solution under agreed terms, earning [X]% margin on each sale.` }
        ];

        models.forEach((model, i) => {
            output += `Option ${i + 1}: ${model.name}\n`;
            output += `${model.desc}\n\n`;
        });

        output += `4. VALUE PROPOSITION\n`;
        output += `${'-'.repeat(30)}\n\n`;
        output += `What [Partner Company] Gets:\n`;
        output += `- Access to our audience of [X]+ active users interested in ${topicTitle.toLowerCase()}\n`;
        output += `- Additional revenue stream with minimal overhead\n`;
        output += `- Enhanced service offering for existing clients\n`;
        output += `- Co-branded marketing materials and joint campaigns\n\n`;
        output += `What [Your Company] Gets:\n`;
        output += `- Access to [Partner Company]'s established reputation in ${topicTitle.toLowerCase()}\n`;
        output += `- Qualified leads from your existing client base\n`;
        output += `- Industry expertise and market insights\n`;
        output += `- Shared marketing costs and expanded reach\n\n`;

        output += `5. IMPLEMENTATION PLAN\n`;
        output += `${'-'.repeat(30)}\n\n`;
        output += `Phase 1 — Foundation (Weeks 1-2):\n`;
        output += `- Sign partnership agreement\n`;
        output += `- Assign partnership managers from both sides\n`;
        output += `- Set up tracking and reporting systems\n\n`;
        output += `Phase 2 — Launch (Weeks 3-4):\n`;
        output += `- Joint announcement via email and social media\n`;
        output += `- Launch co-branded landing page for ${topicTitle.toLowerCase()}\n`;
        output += `- Train both teams on referral/partner process\n\n`;
        output += `Phase 3 — Growth (Months 2-6):\n`;
        output += `- Launch first co-marketing campaign\n`;
        output += `- Monthly performance reviews and optimization\n`;
        output += `- Explore additional partnership opportunities\n\n`;

        output += `6. FINANCIAL TERMS\n`;
        output += `${'-'.repeat(30)}\n\n`;
        output += `Proposed Revenue Share:\n`;
        output += `- Referral commissions: [X]% of first-year contract value\n`;
        output += `- Co-marketing budget split: 50/50\n`;
        output += `- Revenue split for joint products: [X]/[X]\n\n`;
        output += `Minimum Commitment: [X] referred clients per quarter\n`;
        output += `Contract Term: 12 months with automatic renewal\n`;
        output += `Termination: 30 days written notice\n\n`;

        output += `7. SUCCESS METRICS\n`;
        output += `${'-'.repeat(30)}\n\n`;
        output += `We'll track and report the following metrics monthly:\n`;
        output += `- Number of referrals exchanged\n`;
        output += `- Revenue generated through partnership\n`;
        output += `- Customer satisfaction scores\n`;
        output += `- Marketing campaign performance\n`;
        output += `- ROI for both parties\n\n`;

        output += `8. NEXT STEPS\n`;
        output += `${'-'.repeat(30)}\n\n`;
        output += `1. Review and discuss this proposal\n`;
        output += `2. Schedule a partnership alignment meeting\n`;
        output += `3. Finalize terms and sign agreement\n`;
        output += `4. Begin Phase 1 implementation\n\n`;
        output += `We're excited about the possibility of working together and believe this partnership can be transformative for both organizations in the ${topicTitle.toLowerCase()} space.\n\n`;
        output += `Please reach out with any questions or suggested modifications.\n\n`;
        output += `Warm regards,\n`;
        output += `[Your Name]\n`;
        output += `[Your Title]\n`;
        output += `[Your Company]\n`;
        output += `[Contact Information]`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter a partnership topic or area';
            return;
        }
        try {
            outputEl.textContent = generatePartnershipProposal(input);
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
