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
 * 653 - SWOT Analysis Generator
 * Generate SWOT (Strengths, Weaknesses, Opportunities, Threats) analyses
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'SWOT Analysis Generator', icon: '🔍' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const swotDB = {
        business: {
            strengths: ['Strong brand recognition', 'Experienced management team', 'Diversified revenue streams', 'Loyal customer base', 'Proprietary technology', 'Efficient supply chain', 'Strong financial position', 'Talented workforce', 'Market leadership position', 'Innovative culture'],
            weaknesses: ['Limited market presence', 'High operational costs', 'Dependence on key personnel', 'Outdated technology in some areas', 'Limited product range', 'Weak online presence', 'High employee turnover', 'Cash flow constraints', 'Lack of international experience', 'Slow decision-making process'],
            opportunities: ['Emerging markets', 'Digital transformation', 'Strategic partnerships', 'Product line expansion', 'E-commerce growth', 'Sustainability trends', 'Acquisition targets', 'New distribution channels', 'Government incentives', 'Changing consumer preferences'],
            threats: ['Increasing competition', 'Economic downturns', 'Regulatory changes', 'Supply chain disruptions', 'Technological disruption', 'Changing consumer behavior', 'Currency fluctuations', 'Talent shortage', 'Rising costs', 'Cybersecurity risks']
        },
        project: {
            strengths: ['Clear project objectives', 'Dedicated team', 'Adequate budget', 'Strong stakeholder support', 'Proven methodology', 'Available resources', 'Realistic timeline', 'Experienced project manager', 'Well-defined scope', 'Strong communication channels'],
            weaknesses: ['Tight deadlines', 'Limited resources', 'Complex dependencies', 'Unproven technology', 'Inexperienced team members', 'Scope creep risk', 'Multiple stakeholders', 'Communication gaps', 'Quality assurance challenges', 'Documentation gaps'],
            opportunities: ['Process improvements', 'Skill development for team', 'Cross-functional collaboration', 'Automation potential', 'Reusable components', 'Best practices establishment', 'Client relationship building', 'Innovation experimentation', 'Knowledge sharing', 'Future project pipeline'],
            threats: ['Scope changes', 'Budget overruns', 'Resource unavailability', 'Technical challenges', 'Stakeholder conflicts', 'Regulatory compliance', 'External dependencies', 'Market changes', 'Team burnout', 'Integration issues']
        },
        personal: {
            strengths: ['Strong work ethic', 'Adaptability', 'Communication skills', 'Problem-solving ability', 'Technical expertise', 'Leadership qualities', 'Creative thinking', 'Time management', 'Networking ability', 'Continuous learner'],
            weaknesses: ['Perfectionism', 'Difficulty saying no', 'Public speaking anxiety', 'Limited industry experience', 'Work-life balance struggles', 'Imposter syndrome', 'Delegation challenges', 'Overthinking decisions', 'Resistance to feedback', 'Procrastination tendencies'],
            opportunities: ['Professional development courses', 'Mentorship programs', 'Industry networking events', 'Side projects', 'Online learning platforms', 'Leadership roles', 'Cross-training opportunities', 'Conference attendance', 'Certification programs', 'Volunteer work'],
            threats: ['Industry disruption', 'Skill obsolescence', 'Economic instability', 'Health issues', 'Burnout risk', 'Increased competition', 'Workplace politics', 'Technology replacing roles', 'Age discrimination', 'Geographic limitations']
        }
    };

    function generateSWOT(topic) {
        const analysisId = `SWOT-${Date.now().toString(36).toUpperCase()}`;
        const topicLower = topic.toLowerCase();

        let category = 'business';
        for (const [key] of Object.entries(swotDB)) {
            if (topicLower.includes(key)) { category = key; break; }
        }

        const data = swotDB[category];
        const strengths = [...data.strengths].sort(() => Math.random() - 0.5).slice(0, 5);
        const weaknesses = [...data.weaknesses].sort(() => Math.random() - 0.5).slice(0, 5);
        const opportunities = [...data.opportunities].sort(() => Math.random() - 0.5).slice(0, 5);
        const threats = [...data.threats].sort(() => Math.random() - 0.5).slice(0, 5);

        let output = `SWOT ANALYSIS\n`;
        output += `${'═'.repeat(50)}\n`;
        output += `Subject: ${titleCase(topic)}\n`;
        output += `Category: ${titleCase(category)}\n`;
        output += `ID: ${analysisId}\n`;
        output += `${'═'.repeat(50)}\n\n`;

        output += `┌──────────────────────────────────────────────┐\n`;
        output += `│           SWOT ANALYSIS MATRIX              │\n`;
        output += `├────────────────────┬─────────────────────────┤\n`;
        output += `│  STRENGTHS (S)     │  WEAKNESSES (W)         │\n`;
        output += `│  [Internal/+ve]    │  [Internal/-ve]         │\n`;
        output += `├────────────────────┼─────────────────────────┤\n`;
        output += `│  OPPORTUNITIES (O) │  THREATS (T)            │\n`;
        output += `│  [External/+ve]    │  [External/-ve]         │\n`;
        output += `└────────────────────┴─────────────────────────┘\n\n`;

        output += `💪 STRENGTHS (Internal, Positive)\n`;
        output += `${'─'.repeat(50)}\n`;
        strengths.forEach((s, i) => output += `  ${i + 1}. ${s}\n`);

        output += `\n⚠️  WEAKNESSES (Internal, Negative)\n`;
        output += `${'─'.repeat(50)}\n`;
        weaknesses.forEach((w, i) => output += `  ${i + 1}. ${w}\n`);

        output += `\n🚀 OPPORTUNITIES (External, Positive)\n`;
        output += `${'─'.repeat(50)}\n`;
        opportunities.forEach((o, i) => output += `  ${i + 1}. ${o}\n`);

        output += `\n⚡ THREATS (External, Negative)\n`;
        output += `${'─'.repeat(50)}\n`;
        threats.forEach((t, i) => output += `  ${i + 1}. ${t}\n`);

        output += `\n${'─'.repeat(50)}\n`;
        output += `STRATEGIC RECOMMENDATIONS:\n`;
        output += `  S-O: Leverage strengths to maximize opportunities\n`;
        output += `  W-O: Address weaknesses to take advantage of opportunities\n`;
        output += `  S-T: Use strengths to minimize threats\n`;
        output += `  W-T: Defensive strategies for weaknesses and threats\n\n`;
        output += `${'═'.repeat(50)}\n`;
        output += `SWOT Analysis ID: ${analysisId}\n`;
        output += `End of Analysis - ${analysisId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Please enter a subject (e.g., "starting a business", "new project", "career change")'; return; }
        try {
            outputEl.textContent = generateSWOT(input);
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
