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
 * Customer Journey Map Generator
 * Generate customer journey maps from business descriptions
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Customer Journey Map Generator', icon: '🗺️' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateJourneyMap(business) {
        const businessName = titleCase(business);
        let output = `CUSTOMER JOURNEY MAP: ${businessName.toUpperCase()}\n`;
        output += `${'='.repeat(55)}\n\n`;

        const stages = [
            {
                name: 'Awareness',
                description: 'Customer discovers the need and learns about the brand',
                actions: [
                    'Searches online for solutions',
                    'Sees social media ad or post',
                    'Hears recommendation from a friend',
                    `Encounters ${businessName} content while browsing`
                ],
                touchpoints: ['Google search results', 'Social media feeds', 'Blog articles', 'Word of mouth'],
                emotions: 'Curious, exploring options',
                painPoints: ['Information overload', 'Too many choices to evaluate', 'Unclear value proposition'],
                opportunities: ['SEO optimization', 'Clear messaging on landing pages', 'Engaging social content']
            },
            {
                name: 'Consideration',
                description: 'Customer evaluates options and compares alternatives',
                actions: [
                    `Visits the ${businessName} website`,
                    'Reads reviews and testimonials',
                    'Compares features and pricing',
                    'Signs up for a free trial or demo'
                ],
                touchpoints: ['Website', 'Review sites', 'Comparison pages', 'Email newsletter'],
                emotions: 'Interested but cautious, weighing pros and cons',
                painPoints: ['Complex pricing structure', 'Missing feature information', 'Slow website loading'],
                opportunities: ['Transparent pricing page', 'Case studies and social proof', 'Interactive product demo']
            },
            {
                name: 'Decision',
                description: 'Customer makes the purchase decision',
                actions: [
                    'Creates an account',
                    'Selects a plan or product',
                    'Enters payment information',
                    'Completes the purchase'
                ],
                touchpoints: ['Checkout page', 'Payment gateway', 'Confirmation email'],
                emotions: 'Hopeful, slightly anxious about the commitment',
                painPoints: ['Lengthy checkout process', 'Unexpected fees at checkout', 'Lack of payment options'],
                opportunities: ['Streamlined checkout flow', 'Money-back guarantee display', 'Multiple payment methods']
            },
            {
                name: 'Onboarding',
                description: 'Customer gets started with the product or service',
                actions: [
                    'Receives welcome email',
                    'Completes initial setup',
                    'Explores key features',
                    'Reaches the first "aha" moment'
                ],
                touchpoints: ['Welcome email', 'Setup wizard', 'Tutorial videos', 'Help center'],
                emotions: 'Excited, eager to see results',
                painPoints: ['Confusing setup process', 'Lack of guidance', 'Overwhelming number of features'],
                opportunities: ['Guided onboarding flow', 'Quick-start checklist', 'In-app tutorials and tooltips']
            },
            {
                name: 'Retention',
                description: 'Customer becomes a regular, satisfied user',
                actions: [
                    `Uses ${businessName} regularly as part of routine`,
                    'Discovers advanced features',
                    'Contacts support when needed',
                    'Provides feedback through surveys'
                ],
                touchpoints: ['Product interface', 'Customer support', 'Feedback surveys', 'Community forum'],
                emotions: 'Satisfied, becoming loyal',
                painPoints: ['Feature requests ignored', 'Inconsistent support quality', 'Lack of new features'],
                opportunities: ['Proactive check-ins', 'Feature update announcements', 'Loyalty rewards program']
            },
            {
                name: 'Advocacy',
                description: 'Customer recommends the brand to others',
                actions: [
                    `Recommends ${businessName} to colleagues`,
                    'Leaves positive reviews',
                    'Shares experiences on social media',
                    'Participates in referral programs'
                ],
                touchpoints: ['Referral program', 'Review platforms', 'Social media', 'Community events'],
                emotions: 'Enthusiastic, proud of their choice',
                painPoints: ['No easy way to refer others', 'Lack of recognition for advocacy'],
                opportunities: ['Referral incentives', 'Customer spotlight features', 'Exclusive advocate community']
            }
        ];

        stages.forEach((stage, i) => {
            output += `STAGE ${i + 1}: ${stage.name.toUpperCase()}\n`;
            output += `${'-'.repeat(40)}\n`;
            output += `Description: ${stage.description}\n\n`;
            output += `Customer Actions:\n`;
            stage.actions.forEach(a => output += `  - ${a}\n`);
            output += `\nTouchpoints: ${stage.touchpoints.join(', ')}\n`;
            output += `\nEmotional State: ${stage.emotions}\n`;
            output += `\nPain Points:\n`;
            stage.painPoints.forEach(p => output += `  - ${p}\n`);
            output += `\nOpportunities:\n`;
            stage.opportunities.forEach(o => output += `  - ${o}\n`);
            output += `\n${'='.repeat(55)}\n\n`;
        });

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter a business or product name';
            return;
        }
        try {
            outputEl.textContent = generateJourneyMap(input);
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
