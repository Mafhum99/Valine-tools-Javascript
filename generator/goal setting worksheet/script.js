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
 * Goal Setting Worksheet Generator
 * Generate goal worksheets
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Goal Setting Worksheet', icon: '🎯' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const goalFrameworks = {
        career: {
            title: 'Career Goals Worksheet',
            categories: [
                {
                    name: 'Short-Term Career Goals (3-6 months)',
                    prompts: [
                        'What skill do I want to develop in the next 3-6 months?',
                        'What professional certification or training can I complete?',
                        'How can I increase my visibility and impact at work?',
                        'What project can I lead or take ownership of?'
                    ]
                },
                {
                    name: 'Mid-Term Career Goals (6-12 months)',
                    prompts: [
                        'What position or role do I want to move toward?',
                        'What relationships or networks do I need to build?',
                        'What measurable impact do I want to make in my organization?',
                        'What is my plan for a raise or promotion?'
                    ]
                },
                {
                    name: 'Long-Term Career Goals (1-5 years)',
                    prompts: [
                        'Where do I see myself professionally in 5 years?',
                        'What leadership position do I aspire to?',
                        'Do I want to start my own business or advance in my current field?',
                        'What legacy do I want to leave in my career?'
                    ]
                },
                {
                    name: 'Action Steps',
                    prompts: [
                        'What is the ONE thing I can do this week toward my career goals?',
                        'Who can be my mentor or accountability partner?',
                        'What resources do I need, and how will I get them?',
                        'How will I measure my progress monthly?'
                    ]
                }
            ]
        },
        health: {
            title: 'Health & Fitness Goals Worksheet',
            categories: [
                {
                    name: 'Physical Health Goals',
                    prompts: [
                        'What is my target weight or body composition goal?',
                        'How many days per week will I exercise?',
                        'What specific fitness milestone do I want to achieve?',
                        'How will I improve my daily nutrition?'
                    ]
                },
                {
                    name: 'Mental Health Goals',
                    prompts: [
                        'What daily practice will I adopt for mental wellness?',
                        'How will I reduce stress in my daily routine?',
                        'What boundaries do I need to set for my well-being?',
                        'How many hours of sleep will I commit to each night?'
                    ]
                },
                {
                    name: 'Healthy Habits',
                    prompts: [
                        'What is one unhealthy habit I will replace this month?',
                        'How much water will I drink daily?',
                        'What healthy meal prep will I commit to each week?',
                        'How will I stay consistent when motivation fades?'
                    ]
                },
                {
                    name: 'Tracking & Accountability',
                    prompts: [
                        'How will I track my health metrics weekly?',
                        'Who can be my workout or accountability partner?',
                        'What rewards will I give myself for hitting milestones?',
                        'When will I review and adjust my goals?'
                    ]
                }
            ]
        },
        financial: {
            title: 'Financial Goals Worksheet',
            categories: [
                {
                    name: 'Savings Goals',
                    prompts: [
                        'What is my emergency fund target amount?',
                        'How much will I save each month?',
                        'What is my target for a major purchase (house, car, etc.)?',
                        'What is my retirement savings goal?'
                    ]
                },
                {
                    name: 'Debt Elimination',
                    prompts: [
                        'What is my total debt and interest rates?',
                        'Which debt will I pay off first (avalanche or snowball)?',
                        'How much extra can I pay toward debt each month?',
                        'What is my target date for being debt-free?'
                    ]
                },
                {
                    name: 'Income Growth',
                    prompts: [
                        'How can I increase my primary income this year?',
                        'What side income stream can I develop?',
                        'What investments can I make to grow my wealth?',
                        'What is my target annual income for the next 3 years?'
                    ]
                },
                {
                    name: 'Financial Habits',
                    prompts: [
                        'How will I track my spending each month?',
                        'What subscriptions or expenses can I eliminate?',
                        'How will I automate my savings and investments?',
                        'When will I review my financial plan each month?'
                    ]
                }
            ]
        },
        personal: {
            title: 'Personal Growth Goals Worksheet',
            categories: [
                {
                    name: 'Learning & Development',
                    prompts: [
                        'What book do I want to read this month?',
                        'What new skill or hobby do I want to learn?',
                        'What course or class can I enroll in?',
                        'How will I dedicate time to personal growth weekly?'
                    ]
                },
                {
                    name: 'Relationships',
                    prompts: [
                        'How will I strengthen my closest relationships?',
                        'What new connections do I want to build?',
                        'How can I be more present with my family and friends?',
                        'What relationship needs the most attention right now?'
                    ]
                },
                {
                    name: 'Personal Projects',
                    prompts: [
                        'What passion project have I been putting off?',
                        'What creative outlet do I want to explore?',
                        'What volunteer work or community service calls to me?',
                        'How will I make time for what truly matters to me?'
                    ]
                },
                {
                    name: 'Reflection & Mindfulness',
                    prompts: [
                        'What am I most grateful for in my life right now?',
                        'What limiting belief do I want to let go of?',
                        'How will I practice mindfulness daily?',
                        'What does my ideal life look like in 3 years?'
                    ]
                }
            ]
        },
        general: {
            title: 'Goal Setting Worksheet',
            categories: [
                {
                    name: 'What I Want to Achieve',
                    prompts: [
                        'What is my #1 goal for this quarter?',
                        'Why is this goal important to me?',
                        'How will achieving this goal change my life?',
                        'What would happen if I do not pursue this goal?'
                    ]
                },
                {
                    name: 'Breaking It Down',
                    prompts: [
                        'What are the 3-5 milestones to reach this goal?',
                        'What is the very first step I need to take?',
                        'What resources do I need to succeed?',
                        'What obstacles might I face, and how will I overcome them?'
                    ]
                },
                {
                    name: 'Timeline & Deadlines',
                    prompts: [
                        'When do I want to achieve this goal?',
                        'What will I accomplish in the first month?',
                        'What are my weekly check-in milestones?',
                        'How will I hold myself accountable?'
                    ]
                },
                {
                    name: 'Motivation & Rewards',
                    prompts: [
                        'How will I reward myself when I hit milestones?',
                        'Who can support and encourage me on this journey?',
                        'What quote or mantra will keep me motivated?',
                        'How will I celebrate when I achieve my goal?'
                    ]
                }
            ]
        }
    };

    function calculate() {
        const input = inputEl.value.trim().toLowerCase();

        let type = 'general';
        if (input.includes('career') || input.includes('job') || input.includes('work') || input.includes('profession')) type = 'career';
        else if (input.includes('health') || input.includes('fitness') || input.includes('weight') || input.includes('exercise')) type = 'health';
        else if (input.includes('financial') || input.includes('money') || input.includes('save') || input.includes('debt') || input.includes('invest')) type = 'financial';
        else if (input.includes('personal') || input.includes('growth') || input.includes('learn') || input.includes('mindful')) type = 'personal';

        const ws = goalFrameworks[type];
        let output = `<h3>${ws.title}</h3>\n`;

        ws.categories.forEach(cat => {
            output += `\n<strong>${cat.name}</strong>\n`;
            cat.prompts.forEach((p, i) => {
                output += `${i + 1}. ${p}\n   Answer: ________________________________\n\n`;
            });
        });

        outputEl.innerHTML = output;
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    inputEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
