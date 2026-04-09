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
 * 663 - KPI Dashboard Generator
 * Generate KPI dashboards and metrics templates
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'KPI Dashboard Generator', icon: '📊' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const kpiDB = {
        financial: {
            title: 'Financial KPIs',
            emoji: '💰',
            metrics: [
                { name: 'Monthly Recurring Revenue (MRR)', formula: 'Sum of all monthly subscription revenues', target: 'Track month-over-month growth' },
                { name: 'Annual Recurring Revenue (ARR)', formula: 'MRR × 12', target: 'Year-over-year growth of 2x+' },
                { name: 'Gross Margin', formula: '(Revenue - COGS) / Revenue × 100', target: '> 70% for SaaS, > 30% for retail' },
                { name: 'Customer Acquisition Cost (CAC)', formula: 'Total Sales & Marketing Cost / New Customers', target: 'Decreasing trend over time' },
                { name: 'Customer Lifetime Value (LTV)', formula: 'Avg Revenue per Customer × Gross Margin × Avg Lifespan', target: 'LTV:CAC ratio of 3:1 or higher' },
                { name: 'Burn Rate', formula: 'Cash spent per month', target: '18+ months runway' },
                { name: 'Revenue Growth Rate', formula: '(Current Revenue - Prior Revenue) / Prior Revenue × 100', target: '> 15% month-over-month' },
                { name: 'Cash Flow', formula: 'Cash In - Cash Out', target: 'Positive and growing' }
            ]
        },
        product: {
            title: 'Product KPIs',
            emoji: '📱',
            metrics: [
                { name: 'Daily Active Users (DAU)', formula: 'Unique users who engage daily', target: 'Growing trend' },
                { name: 'Monthly Active Users (MAU)', formula: 'Unique users who engage monthly', target: 'DAU/MAU ratio > 20%' },
                { name: 'User Retention Rate', formula: '((E - N) / S) × 100', target: '> 40% at Day 30' },
                { name: 'Churn Rate', formula: 'Lost Customers / Total Customers × 100', target: '< 5% monthly, < 20% annual' },
                { name: 'Feature Adoption Rate', formula: 'Users using feature / Total users × 100', target: '> 30% for key features' },
                { name: 'Net Promoter Score (NPS)', formula: '% Promoters - % Detractors', target: '> 50 (Excellent: > 70)' },
                { name: 'Time to First Value', formula: 'Time from signup to first meaningful action', target: '< 5 minutes' },
                { name: 'Task Completion Rate', formula: 'Successful tasks / Total attempts × 100', target: '> 90%' }
            ]
        },
        marketing: {
            title: 'Marketing KPIs',
            emoji: '📢',
            metrics: [
                { name: 'Website Traffic', formula: 'Total unique visitors per month', target: '20% month-over-month growth' },
                { name: 'Conversion Rate', formula: 'Conversions / Visitors × 100', target: '> 2% for web, > 5% for landing pages' },
                { name: 'Cost per Lead (CPL)', formula: 'Marketing spend / Number of leads', target: 'Decreasing over time' },
                { name: 'Lead-to-Customer Rate', formula: 'Customers from leads / Total leads × 100', target: '> 10%' },
                { name: 'Organic Traffic Growth', formula: 'Search engine traffic month-over-month', target: '15%+ month-over-month' },
                { name: 'Email Open Rate', formula: 'Emails opened / Emails sent × 100', target: '> 20% average' },
                { name: 'Social Media Engagement', formula: 'Likes + Comments + Shares / Followers × 100', target: '> 3% engagement rate' },
                { name: 'Return on Ad Spend (ROAS)', formula: 'Revenue from ads / Ad spend', target: '> 4:1 ratio' }
            ]
        },
        sales: {
            title: 'Sales KPIs',
            emoji: '🤝',
            metrics: [
                { name: 'Sales Revenue', formula: 'Total closed-won deal value', target: '100%+ of quota' },
                { name: 'Average Deal Size', formula: 'Total revenue / Number of deals', target: 'Increasing over time' },
                { name: 'Sales Cycle Length', formula: 'Average days from lead to close', target: '< 60 days (B2B), < 7 days (B2C)' },
                { name: 'Win Rate', formula: 'Won deals / Total opportunities × 100', target: '> 25%' },
                { name: 'Pipeline Coverage', formula: 'Pipeline value / Quota', target: '> 3x quota coverage' },
                { name: 'Quota Attainment', formula: 'Actual revenue / Quota × 100', target: '> 80% of reps at 100%+' },
                { name: 'Average Sales Price', formula: 'Total revenue / Units sold', target: 'Stable or increasing' },
                { name: 'Upsell/Cross-sell Rate', formula: 'Upsell revenue / Total revenue × 100', target: '> 20% of total revenue' }
            ]
        },
        customer: {
            title: 'Customer Success KPIs',
            emoji: '❤️',
            metrics: [
                { name: 'Customer Satisfaction (CSAT)', formula: 'Avg satisfaction rating (1-5 scale)', target: '> 4.2/5.0' },
                { name: 'Net Promoter Score (NPS)', formula: '% Promoters - % Detractors', target: '> 50' },
                { name: 'Customer Effort Score (CES)', formula: 'Avg effort rating (1-7 scale)', target: '< 2.5 (lower is better)' },
                { name: 'First Response Time', formula: 'Average time to first response', target: '< 2 hours' },
                { name: 'Resolution Time', formula: 'Average time to resolve issues', target: '< 24 hours' },
                { name: 'Customer Health Score', formula: 'Composite of usage, engagement, sentiment', target: '> 70% healthy' },
                { name: 'Renewal Rate', formula: 'Renewed contracts / Due for renewal × 100', target: '> 85%' },
                { name: 'Customer Expansion Revenue', formula: 'Revenue from existing customer growth', target: '> 20% of total revenue' }
            ]
        },
        team: {
            title: 'Team/HR KPIs',
            emoji: '👥',
            metrics: [
                { name: 'Employee Satisfaction (eNPS)', formula: '% Promoters - % Detractors (employee survey)', target: '> 40' },
                { name: 'Voluntary Turnover Rate', formula: 'Voluntary departures / Avg headcount × 100', target: '< 10% annually' },
                { name: 'Time to Hire', formula: 'Average days from posting to offer acceptance', target: '< 45 days' },
                { name: 'Revenue per Employee', formula: 'Total revenue / Total employees', target: 'Increasing over time' },
                { name: 'Training Hours per Employee', formula: 'Total training hours / Number of employees', target: '> 40 hours/year' },
                { name: 'Internal Promotion Rate', formula: 'Internal promotions / Total promotions × 100', target: '> 50%' },
                { name: 'Absenteeism Rate', formula: 'Absent days / Total workdays × 100', target: '< 2%' },
                { name: 'Diversity Metrics', formula: 'Representation across demographics', target: 'Reflective of talent pool' }
            ]
        }
    };

    function generateKPI(input) {
        const dashboardId = `KPI-${Date.now().toString(36).toUpperCase()}`;
        const parts = input.split(',').map(p => p.trim()).filter(p => p);
        const focus = parts[0] || 'product';
        const period = parts[1] || 'Q1 2026';

        const focusLower = focus.toLowerCase();
        let selectedCategories = [];
        for (const [key] of Object.entries(kpiDB)) {
            if (focusLower.includes(key)) { selectedCategories.push(key); break; }
        }
        if (!selectedCategories.length) {
            selectedCategories = Object.keys(kpiDB);
        }

        let output = `KPI DASHBOARD GENERATOR\n`;
        output += `${'═'.repeat(60)}\n`;
        output += `Focus Area: ${titleCase(focus)}\n`;
        output += `Reporting Period: ${period}\n`;
        output += `ID: ${dashboardId}\n`;
        output += `${'═'.repeat(60)}\n\n`;

        selectedCategories.forEach(catKey => {
            const cat = kpiDB[catKey];
            output += `${cat.emoji} ${cat.title.toUpperCase()}\n`;
            output += `${'═'.repeat(60)}\n\n`;

            output += `KPI                 | Target              | Actual | Status\n`;
            output += `${'─'.repeat(60)}\n`;

            cat.metrics.forEach(metric => {
                const paddedName = metric.name.padEnd(20);
                output += `${paddedName} | ${metric.target.padEnd(20)} | ______ | [ ] \n`;
            });

            output += `\n`;
        });

        output += `${'─'.repeat(60)}\n`;
        output += `DASHBOARD SETUP CHECKLIST:\n`;
        output += `  [ ] Define data sources for each KPI\n`;
        output += `  [ ] Set up automated tracking\n`;
        output += `  [ ] Establish baseline measurements\n`;
        output += `  [ ] Assign KPI owners\n`;
        output += `  [ ] Set review cadence (weekly/monthly)\n`;
        output += `  [ ] Create visual dashboards\n`;
        output += `  [ ] Define alert thresholds\n`;
        output += `  [ ] Document calculation methods\n\n`;
        output += `${'═'.repeat(60)}\n`;
        output += `KPI Dashboard ID: ${dashboardId}\n`;
        output += `End of Dashboard - ${dashboardId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Enter focus area and period (e.g., "product, Q1 2026" or "sales")\n\nAreas: financial, product, marketing, sales, customer, team'; return; }
        try {
            outputEl.textContent = generateKPI(input);
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
