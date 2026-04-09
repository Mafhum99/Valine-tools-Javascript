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
 * Workout Plan Generator
 * Generate personalized workout plans
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Workout Plan Generator', icon: '🏋️' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const workouts = {
        beginner: {
            title: 'Beginner Full-Body Workout',
            warmup: ['5 min brisk walk or light jog', 'Arm circles (30 sec)', 'Leg swings (30 sec each)', 'Torso twists (30 sec)'],
            exercises: [
                { name: 'Bodyweight squats', sets: '3 sets of 12 reps', rest: '60 sec rest' },
                { name: 'Push-ups (knee or wall)', sets: '3 sets of 8-10 reps', rest: '60 sec rest' },
                { name: 'Walking lunges', sets: '3 sets of 10 per leg', rest: '60 sec rest' },
                { name: 'Plank hold', sets: '3 sets of 20-30 seconds', rest: '45 sec rest' },
                { name: 'Glute bridges', sets: '3 sets of 15 reps', rest: '45 sec rest' },
                { name: 'Bird-dog', sets: '3 sets of 10 per side', rest: '45 sec rest' }
            ],
            cooldown: ['5 min slow walk', 'Hamstring stretch (30 sec each)', 'Quad stretch (30 sec each)', 'Chest stretch (30 sec)']
        },
        intermediate: {
            title: 'Intermediate Upper/Lower Split',
            warmup: ['5 min dynamic warmup', 'Band pull-aparts (15 reps)', 'Hip circles (10 each direction)', 'Jumping jacks (30 sec)'],
            exercises: [
                { name: 'Barbell squats', sets: '4 sets of 8-10 reps', rest: '90 sec rest' },
                { name: 'Dumbbell bench press', sets: '4 sets of 8-10 reps', rest: '90 sec rest' },
                { name: 'Romanian deadlifts', sets: '3 sets of 10 reps', rest: '90 sec rest' },
                { name: 'Bent-over rows', sets: '4 sets of 8-10 reps', rest: '90 sec rest' },
                { name: 'Overhead press', sets: '3 sets of 10 reps', rest: '60 sec rest' },
                { name: 'Cable crunches', sets: '3 sets of 15 reps', rest: '45 sec rest' },
                { name: 'Calf raises', sets: '3 sets of 15 reps', rest: '45 sec rest' }
            ],
            cooldown: ['5 min light cycling', 'Full-body stretching routine', 'Foam roll major muscle groups']
        },
        advanced: {
            title: 'Advanced Push/Pull/Legs',
            warmup: ['5 min rowing machine', 'Dynamic stretching circuit', 'Activation: band walks (10 each)', 'Warm-up sets of first exercise'],
            exercises: [
                { name: 'Barbell back squats', sets: '5 sets of 5 reps', rest: '2-3 min rest' },
                { name: 'Weighted pull-ups', sets: '4 sets of 6-8 reps', rest: '2 min rest' },
                { name: 'Barbell bench press', sets: '5 sets of 5 reps', rest: '2-3 min rest' },
                { name: 'Barbell deadlifts', sets: '3 sets of 5 reps', rest: '3 min rest' },
                { name: 'Dumbbell shoulder press', sets: '4 sets of 8 reps', rest: '90 sec rest' },
                { name: 'Bulgarian split squats', sets: '3 sets of 10 per leg', rest: '90 sec rest' },
                { name: 'Hanging leg raises', sets: '4 sets of 12 reps', rest: '60 sec rest' },
                { name: 'Barbell curls', sets: '3 sets of 10 reps', rest: '60 sec rest' },
                { name: 'Tricep dips (weighted)', sets: '3 sets of 10 reps', rest: '60 sec rest' }
            ],
            cooldown: ['10 min light cardio', 'Deep stretching (10 min)', 'Foam rolling session']
        },
        cardio: {
            title: 'Cardio & HIIT Workout',
            warmup: ['5 min light jog', 'High knees (30 sec)', 'Butt kicks (30 sec)', 'Side shuffles (30 sec)'],
            exercises: [
                { name: 'Burpees', sets: '30 sec work / 15 sec rest x 8 rounds', rest: '60 sec between exercises' },
                { name: 'Mountain climbers', sets: '30 sec work / 15 sec rest x 8 rounds', rest: '60 sec between exercises' },
                { name: 'Jump squats', sets: '30 sec work / 15 sec rest x 8 rounds', rest: '60 sec between exercises' },
                { name: 'High knees sprint', sets: '30 sec work / 15 sec rest x 8 rounds', rest: '60 sec between exercises' },
                { name: 'Box jumps or step-ups', sets: '30 sec work / 15 sec rest x 8 rounds', rest: '60 sec between exercises' },
                { name: 'Bicycle crunches', sets: '30 sec work / 15 sec rest x 8 rounds', rest: '60 sec between exercises' }
            ],
            cooldown: ['5 min slow walk', 'Full-body stretching', 'Deep breathing exercises']
        },
        yoga: {
            title: 'Yoga & Flexibility Session',
            warmup: ['5 min deep breathing', 'Cat-cow stretches (1 min)', 'Child\'s pose (1 min)', 'Neck rolls (30 sec each direction)'],
            exercises: [
                { name: 'Sun salutation A', sets: '5 rounds', rest: 'Flow at your own pace' },
                { name: 'Warrior I & II', sets: 'Hold 30 sec each side', rest: 'Rest in child\'s pose between sides' },
                { name: 'Triangle pose', sets: 'Hold 30 sec each side', rest: 'Breathe deeply' },
                { name: 'Tree pose', sets: 'Hold 30 sec each leg', rest: 'Focus on balance' },
                { name: 'Downward dog', sets: 'Hold 45 sec', rest: 'Rest in child\'s pose' },
                { name: 'Pigeon pose', sets: 'Hold 1 min each side', rest: 'Breathe into the stretch' },
                { name: 'Seated forward fold', sets: 'Hold 1 min', rest: 'Let gravity deepen the stretch' },
                { name: 'Savasana', sets: '5 min', rest: 'Complete relaxation' }
            ],
            cooldown: ['Gentle spinal twists (1 min each)', 'Corpse pose for 3-5 minutes', 'Gratitude reflection']
        }
    };

    function calculate() {
        const input = inputEl.value.trim().toLowerCase();

        let type = 'beginner';
        if (input.includes('intermediate') || input.includes('medium') || input.includes('moderate')) type = 'intermediate';
        else if (input.includes('advanced') || input.includes('hard') || input.includes('intense') || input.includes('expert')) type = 'advanced';
        else if (input.includes('cardio') || input.includes('hiit') || input.includes('run') || input.includes('endurance') || input.includes('fat')) type = 'cardio';
        else if (input.includes('yoga') || input.includes('flexib') || input.includes('stretch') || input.includes('calm') || input.includes('relax')) type = 'yoga';
        else if (input.includes('beginner') || input.includes('easy') || input.includes('start') || input.includes('new')) type = 'beginner';

        const plan = workouts[type];
        let output = `<h3>${plan.title}</h3>\n`;

        output += `<strong>Warm-Up</strong>\n`;
        plan.warmup.forEach(w => output += `• ${w}\n`);

        output += `\n<strong>Main Workout</strong>\n`;
        plan.exercises.forEach((ex, i) => {
            output += `${i + 1}. ${ex.name} — ${ex.sets} (${ex.rest})\n`;
        });

        output += `\n<strong>Cool-Down</strong>\n`;
        plan.cooldown.forEach(c => output += `• ${c}\n`);

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
