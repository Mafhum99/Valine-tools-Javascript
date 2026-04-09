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
 * Meal Plan Generator
 * Generate meal plans
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Meal Plan Generator', icon: '🍽️' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const mealPlans = {
        balanced: {
            title: 'Balanced Daily Meal Plan (~2000 cal)',
            meals: {
                breakfast: ['Greek yogurt parfait with granola and berries (350 cal)', 'Oatmeal with banana, walnuts, and honey (400 cal)', 'Whole wheat toast with avocado and poached eggs (380 cal)'],
                snack1: ['Apple with 2 tbsp almond butter (200 cal)', 'Trail mix (1/4 cup) (170 cal)', 'Carrot sticks with hummus (150 cal)'],
                lunch: ['Grilled chicken salad with quinoa and vinaigrette (450 cal)', 'Turkey and avocado wrap with side salad (480 cal)', 'Lentil soup with whole grain bread (420 cal)'],
                snack2: ['Protein shake with banana (200 cal)', 'Greek yogurt (150 cal)', 'Handful of mixed nuts (180 cal)'],
                dinner: ['Baked salmon with roasted vegetables and brown rice (500 cal)', 'Chicken stir-fry with vegetables and jasmine rice (480 cal)', 'Lean beef with sweet potato and steamed broccoli (520 cal)']
            }
        },
        vegetarian: {
            title: 'Vegetarian Daily Meal Plan (~1800 cal)',
            meals: {
                breakfast: ['Veggie omelette with spinach, mushrooms, and cheese (320 cal)', 'Smoothie bowl with granola, fruits, and chia seeds (350 cal)', 'Overnight oats with peanut butter and banana (380 cal)'],
                snack1: ['Mixed fruit salad (120 cal)', 'Veggie sticks with guacamole (180 cal)', 'Edamame with sea salt (150 cal)'],
                lunch: ['Black bean and sweet potato burrito bowl (450 cal)', 'Caprese sandwich with tomato soup (430 cal)', 'Chickpea curry with basmati rice (460 cal)'],
                snack2: ['Hummus with pita bread (200 cal)', 'Cheese and whole grain crackers (220 cal)', 'Dark chocolate squares (150 cal)'],
                dinner: ['Eggplant parmesan with side salad (420 cal)', 'Vegetable pad thai with tofu (480 cal)', 'Mushroom and spinach risotto (450 cal)']
            }
        },
        highprotein: {
            title: 'High-Protein Daily Meal Plan (~2200 cal)',
            meals: {
                breakfast: ['Egg white omelette with turkey and spinach (350 cal)', 'Protein pancakes with Greek yogurt and berries (420 cal)', 'Cottage cheese bowl with nuts and fruit (350 cal)'],
                snack1: ['Protein bar (200 cal)', 'Hard-boiled eggs x2 (140 cal)', 'Beef jerky (1/4 cup) (120 cal)'],
                lunch: ['Grilled chicken breast with brown rice and vegetables (520 cal)', 'Tuna salad sandwich on whole wheat (480 cal)', 'Turkey meatballs with zucchini noodles (450 cal)'],
                snack2: ['Whey protein shake (150 cal)', 'Cottage cheese with pineapple (180 cal)', 'Turkey roll-ups with cheese (200 cal)'],
                dinner: ['Grilled steak with baked potato and asparagus (580 cal)', 'Baked chicken thighs with quinoa and roasted veggies (520 cal)', 'Grilled shrimp with garlic pasta and salad (540 cal)']
            }
        },
        lowcarb: {
            title: 'Low-Carb Daily Meal Plan (~1600 cal)',
            meals: {
                breakfast: ['Scrambled eggs with bacon and avocado (400 cal)', 'Smoked salmon with cream cheese on cucumber slices (300 cal)', 'Bulletproof coffee with almond flour muffin (350 cal)'],
                snack1: ['Celery with cream cheese (100 cal)', 'Cheese cubes (150 cal)', 'Pork rinds with guacamole (180 cal)'],
                lunch: ['Grilled chicken Caesar salad (no croutons) (400 cal)', 'Lettuce wrap burgers with side of coleslaw (450 cal)', 'Cauliflower crust pizza (380 cal)'],
                snack2: ['Celery with almond butter (170 cal)', 'Olives and feta cheese (160 cal)', 'Sugar-free jello (50 cal)'],
                dinner: ['Grilled salmon with asparagus and cauliflower mash (480 cal)', 'Zucchini noodles with bolognese sauce (420 cal)', 'Baked chicken with roasted Brussels sprouts (450 cal)']
            }
        },
        general: {
            title: 'General Daily Meal Plan (~1800 cal)',
            meals: {
                breakfast: ['Toast with peanut butter and banana slices (350 cal)', 'Cereal with milk and fresh berries (320 cal)', 'Breakfast burrito with eggs and salsa (400 cal)'],
                snack1: ['Fresh fruit (100 cal)', 'Yogurt (120 cal)', 'Granola bar (150 cal)'],
                lunch: ['Chicken and rice bowl (450 cal)', 'Pasta salad with vegetables (400 cal)', 'Soup and sandwich combo (420 cal)'],
                snack2: ['Nuts and dried fruit (180 cal)', 'Veggie platter with dip (130 cal)', 'Crackers with cheese (160 cal)'],
                dinner: ['Grilled fish with vegetables and potatoes (480 cal)', 'Stir-fried noodles with vegetables (420 cal)', 'Roasted chicken with stuffing and green beans (500 cal)']
            }
        }
    };

    function calculate() {
        const input = inputEl.value.trim().toLowerCase();

        let type = 'general';
        if (input.includes('vegetarian') || input.includes('vegan') || input.includes('plant') || input.includes('meatless')) type = 'vegetarian';
        else if (input.includes('protein') || input.includes('muscle') || input.includes('gain') || input.includes('bulk')) type = 'highprotein';
        else if (input.includes('low carb') || input.includes('lowcarb') || input.includes('keto') || input.includes('cut')) type = 'lowcarb';
        else if (input.includes('balanc') || input.includes('health') || input.includes('normal') || input.includes('standard')) type = 'balanced';

        const plan = mealPlans[type];
        let output = `<h3>${plan.title}</h3>\n`;

        const mealNames = { breakfast: '🌅 Breakfast', snack1: '🍎 Morning Snack', lunch: '☀️ Lunch', snack2: '🍌 Afternoon Snack', dinner: '🌙 Dinner' };

        Object.entries(plan.meals).forEach(([key, options]) => {
            output += `\n<strong>${mealNames[key]}</strong> (choose one)\n`;
            options.forEach((opt, i) => {
                output += `  ${i + 1}. ${opt}\n`;
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
