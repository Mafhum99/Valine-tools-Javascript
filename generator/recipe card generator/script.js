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
 * Recipe Card Generator
 * Generate recipe cards
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Recipe Card Generator', icon: '📝' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const recipeTemplates = {
        pasta: (name) => `📋 ${name || 'Classic Pasta Dish'}

⏱ Prep Time: 15 minutes | Cook Time: 25 minutes | Serves: 4

🛒 Ingredients:
- 400g pasta of your choice
- 3 cloves garlic, minced
- 2 tbsp olive oil
- 1 can (400g) crushed tomatoes
- Fresh basil leaves
- Salt and pepper to taste
- Grated Parmesan cheese
- Red pepper flakes (optional)

👨‍🍳 Instructions:
1. Bring a large pot of salted water to a boil and cook pasta according to package directions.
2. While pasta cooks, heat olive oil in a large skillet over medium heat.
3. Add minced garlic and cook until fragrant, about 1 minute.
4. Pour in crushed tomatoes and season with salt, pepper, and red pepper flakes.
5. Simmer sauce for 15 minutes, stirring occasionally.
6. Drain pasta and toss with the sauce.
7. Serve topped with fresh basil and grated Parmesan.

💡 Tip: Reserve a cup of pasta water to thin the sauce if needed.`,

        salad: (name) => `📋 ${name || 'Fresh Garden Salad'}

⏱ Prep Time: 15 minutes | Serves: 4

🛒 Ingredients:
- 6 cups mixed greens
- 1 cup cherry tomatoes, halved
- 1 cucumber, sliced
- 1/2 red onion, thinly sliced
- 1/2 cup croutons
- 1/4 cup your favorite dressing
- Salt and pepper to taste

👨‍🍳 Instructions:
1. Wash and dry all greens thoroughly.
2. In a large bowl, combine mixed greens, tomatoes, cucumber, and red onion.
3. Toss with your favorite dressing just before serving.
4. Top with croutons and season with salt and pepper.
5. Serve immediately for the freshest taste.

💡 Tip: Keep dressing on the side until ready to serve to keep greens crisp.`,

        soup: (name) => `📋 ${name || 'Hearty Homemade Soup'}

⏱ Prep Time: 20 minutes | Cook Time: 40 minutes | Serves: 6

🛒 Ingredients:
- 2 tbsp olive oil
- 1 large onion, diced
- 3 cloves garlic, minced
- 2 carrots, diced
- 2 celery stalks, diced
- 1 can diced tomatoes
- 6 cups vegetable or chicken broth
- Fresh herbs (thyme, bay leaf)
- Salt and pepper to taste

👨‍🍳 Instructions:
1. Heat olive oil in a large pot over medium heat.
2. Add onion and cook until translucent, about 5 minutes.
3. Add garlic, carrots, and celery. Cook for another 5 minutes.
4. Pour in diced tomatoes and broth.
5. Add herbs, salt, and pepper.
6. Bring to a boil, then reduce heat and simmer for 30 minutes.
7. Remove bay leaf and serve hot with crusty bread.

💡 Tip: This soup tastes even better the next day as flavors meld together.`,

        dessert: (name) => `📋 ${name || 'Delicious Homemade Dessert'}

⏱ Prep Time: 20 minutes | Cook Time: 30 minutes | Serves: 8

🛒 Ingredients:
- 2 cups all-purpose flour
- 1 cup sugar
- 1/2 cup butter, softened
- 2 eggs
- 1 tsp vanilla extract
- 1 tsp baking powder
- 1/2 cup milk
- Pinch of salt

👨‍🍳 Instructions:
1. Preheat oven to 350°F (175°C).
2. Cream together butter and sugar until light and fluffy.
3. Beat in eggs one at a time, then add vanilla.
4. In a separate bowl, whisk flour, baking powder, and salt.
5. Alternate adding dry ingredients and milk to the butter mixture.
6. Pour into a greased baking dish.
7. Bake for 30 minutes or until a toothpick comes out clean.
8. Let cool before serving.

💡 Tip: Dust with powdered sugar or serve with fresh berries for an elegant finish.`,

        general: (name) => `📋 ${name || 'Recipe Card'}

⏱ Prep Time: __ minutes | Cook Time: __ minutes | Serves: __

🛒 Ingredients:
- [Add your ingredients here]
- [Specify quantities for each ingredient]
- [Include any seasonings or garnishes]

👨‍🍳 Instructions:
1. [First step of your recipe]
2. [Second step of your recipe]
3. [Continue with detailed instructions]
4. [Include cooking temperatures and times]
5. [Describe plating and serving suggestions]

💡 Tip: [Add your helpful cooking tip here]`
    };

    function calculate() {
        const input = inputEl.value.trim();

        if (!input) {
            outputEl.textContent = 'Please enter a recipe name (e.g., Spaghetti Bolognese, Caesar Salad)';
            return;
        }

        const lower = input.toLowerCase();
        let type = 'general';
        if (lower.includes('pasta') || lower.includes('spaghetti') || lower.includes('noodle') || lower.includes('macaroni')) type = 'pasta';
        else if (lower.includes('salad') || lower.includes('greens') || lower.includes('bowl')) type = 'salad';
        else if (lower.includes('soup') || lower.includes('stew') || lower.includes('broth') || lower.includes('chowder')) type = 'soup';
        else if (lower.includes('cake') || lower.includes('cookie') || lower.includes('pie') || lower.includes('brownie') || lower.includes('dessert') || lower.includes('pastry')) type = 'dessert';

        const result = recipeTemplates[type](input);
        outputEl.innerHTML = `<pre style="white-space:pre-wrap;font-family:inherit;">${result}</pre>`;
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
