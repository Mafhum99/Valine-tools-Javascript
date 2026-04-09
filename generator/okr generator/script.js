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
 * 662 - OKR Generator
 * Generate Objectives and Key Results
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'OKR Generator', icon: '🎯' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const okrDB = {
        product: {
            objectives: [
                'Deliver a product experience that users love',
                'Build product features that drive real user engagement',
                'Create a seamless onboarding experience',
                'Increase product adoption across all user segments',
                'Establish product-market fit in a new segment'
            ],
            keyResults: [
                'Increase Daily Active Users from X to Y',
                'Achieve NPS score of X or higher',
                'Reduce time-to-first-value to under X minutes',
                'Increase feature adoption rate by X%',
                'Reduce churn rate from X% to Y%',
                'Achieve X% user activation within first 7 days',
                'Increase session duration by X%',
                'Ship X major features this quarter',
                'Achieve X% task completion rate',
                'Reduce support tickets per user by X%'
            ]
        },
        growth: {
            objectives: [
                'Accelerate user acquisition across key markets',
                'Build a scalable growth engine',
                'Expand our market presence significantly',
                'Create viral growth loops',
                'Establish market leadership in our category'
            ],
            keyResults: [
                'Increase sign-ups from X to Y per month',
                'Achieve X% month-over-month growth',
                'Reduce customer acquisition cost to $X',
                'Increase referral rate to X% of new users',
                'Grow organic traffic by X%',
                'Launch in X new markets',
                'Achieve X% conversion rate from trial to paid',
                'Generate X qualified leads per month',
                'Increase website visitors to X per month',
                'Grow social media following to X followers'
            ]
        },
        team: {
            objectives: [
                'Build a world-class team culture',
                'Create an environment where everyone thrives',
                'Develop the next generation of leaders',
                'Foster a culture of continuous improvement',
                'Build the best team in our industry'
            ],
            keyResults: [
                'Achieve employee satisfaction score of X/10',
                'Reduce time-to-hire to X days',
                'Increase internal promotion rate to X%',
                'Maintain voluntary turnover below X%',
                'Complete X hours of training per employee',
                'Achieve X% participation in feedback programs',
                'Fill X open positions this quarter',
                'Implement X new team processes',
                'Achieve X% attendance at team events',
                'Launch X professional development programs'
            ]
        },
        revenue: {
            objectives: [
                'Drive significant revenue growth',
                'Build a predictable and scalable revenue engine',
                'Maximize customer lifetime value',
                'Diversify and strengthen revenue streams',
                'Achieve sustainable profitability'
            ],
            keyResults: [
                'Increase MRR from $X to $Y',
                'Achieve X% quarter-over-quarter revenue growth',
                'Increase average deal size from $X to $Y',
                'Reduce sales cycle from X to Y days',
                'Achieve X% renewal rate',
                'Generate $X in upsell revenue',
                'Increase LTV:CAC ratio to X:1',
                'Achieve gross margin of X%',
                'Close X new enterprise deals',
                'Expand revenue in existing accounts by X%'
            ]
        },
        customer: {
            objectives: [
                'Deliver an exceptional customer experience',
                'Become the most customer-centric organization',
                'Build deep, lasting customer relationships',
                'Turn customers into passionate advocates',
                'Set the industry standard for customer success'
            ],
            keyResults: [
                'Increase NPS from X to Y',
                'Reduce average response time to X hours',
                'Achieve customer satisfaction score of X%',
                'Reduce churn rate to below X%',
                'Increase customer retention to X%',
                'Resolve X% of tickets on first contact',
                'Achieve X% customer health score',
                'Generate X customer case studies',
                'Increase review ratings to X+ stars',
                'Reduce escalation rate by X%'
            ]
        }
    };

    function generateOKR(input) {
        const okrId = `OKR-${Date.now().toString(36).toUpperCase()}`;
        const parts = input.split(',').map(p => p.trim()).filter(p => p);
        const area = parts[0] || 'product';
        const timeframe = parts[1] || 'Q1 2026';

        const areaLower = area.toLowerCase();
        let category = 'product';
        for (const [key] of Object.entries(okrDB)) {
            if (areaLower.includes(key)) { category = key; break; }
        }

        const data = okrDB[category];
        const objective = randomChoice(data.objectives);
        const keyResults = [...data.keyResults].sort(() => Math.random() - 0.5).slice(0, 4);

        let output = `OKR GENERATOR\n`;
        output += `${'═'.repeat(60)}\n`;
        output += `Area: ${titleCase(area)}\n`;
        output += `Timeframe: ${timeframe}\n`;
        output += `ID: ${okrId}\n`;
        output += `${'═'.repeat(60)}\n\n`;

        output += `OBJECTIVE\n`;
        output += `${'─'.repeat(60)}\n`;
        output += `${objective}\n\n`;

        output += `KEY RESULTS\n`;
        output += `${'─'.repeat(60)}\n`;
        keyResults.forEach((kr, i) => {
            output += `  KR${i + 1}: ${kr}\n`;
        });

        output += `\n${'─'.repeat(60)}\n`;
        output += `ADDITIONAL OKR SETS\n`;
        output += `${'─'.repeat(60)}\n\n`;

        // Generate 2 more OKR sets
        for (let s = 0; s < 2; s++) {
            const obj = randomChoice(data.objectives);
            const krs = [...data.keyResults].sort(() => Math.random() - 0.5).slice(0, 4);

            output += `OKR SET ${s + 2}\n`;
            output += `Objective: ${obj}\n`;
            krs.forEach((kr, i) => {
                output += `  KR${i + 1}: ${kr}\n`;
            });
            output += `\n`;
        }

        output += `${'─'.repeat(60)}\n`;
        output += `OKR BEST PRACTICES:\n`;
        output += `  1. Objectives should be ambitious and qualitative\n`;
        output += `  2. Key Results must be measurable and time-bound\n`;
        output += `  3. 3-5 Key Results per Objective is ideal\n`;
        output += `  4. Replace "X" with specific target numbers\n`;
        output += `  5. Review progress weekly, grade quarterly\n`;
        output += `  6. 70% achievement = success (stretch goals!)\n`;
        output += `  7. Keep OKRs visible and discuss regularly\n\n`;
        output += `${'═'.repeat(60)}\n`;
        output += `OKR ID: ${okrId}\n`;
        output += `End of OKRs - ${okrId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Enter focus area and timeframe (e.g., "product, Q2 2026" or "growth team, H1")\n\nAreas: product, growth, team, revenue, customer'; return; }
        try {
            outputEl.textContent = generateOKR(input);
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

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }

    inputEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
