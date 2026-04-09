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
 * Color Name Finder
 * Find closest CSS color name with distance
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Color Name Finder', icon: '\uD83D\uDD0E' });

    const colorInput = $('#colorInput');
    const findBtn = $('#find');
    const preview = $('#color-preview');
    const resultContent = $('#result-content');

    // CSS named colors
    const cssColors = {
        'aliceblue': [240,248,255], 'antiquewhite': [250,235,215], 'aqua': [0,255,255],
        'aquamarine': [127,255,212], 'azure': [240,255,255], 'beige': [245,245,220],
        'bisque': [255,228,196], 'black': [0,0,0], 'blanchedalmond': [255,235,205],
        'blue': [0,0,255], 'blueviolet': [138,43,226], 'brown': [165,42,42],
        'burlywood': [222,184,135], 'cadetblue': [95,158,160], 'chartreuse': [127,255,0],
        'chocolate': [210,105,30], 'coral': [255,127,80], 'cornflowerblue': [100,149,237],
        'cornsilk': [255,248,220], 'crimson': [220,20,60], 'cyan': [0,255,255],
        'darkblue': [0,0,139], 'darkcyan': [0,139,139], 'darkgoldenrod': [184,134,11],
        'darkgray': [169,169,169], 'darkgreen': [0,100,0], 'darkgrey': [169,169,169],
        'darkkhaki': [189,183,107], 'darkmagenta': [139,0,139], 'darkolivegreen': [85,107,47],
        'darkorange': [255,140,0], 'darkorchid': [153,50,204], 'darkred': [139,0,0],
        'darksalmon': [233,150,122], 'darkseagreen': [143,188,143], 'darkslateblue': [72,61,139],
        'darkslategray': [47,79,79], 'darkslategrey': [47,79,79], 'darkturquoise': [0,206,209],
        'darkviolet': [148,0,211], 'deeppink': [255,20,147], 'deepskyblue': [0,191,255],
        'dimgray': [105,105,105], 'dimgrey': [105,105,105], 'dodgerblue': [30,144,255],
        'firebrick': [178,34,34], 'floralwhite': [255,250,240], 'forestgreen': [34,139,34],
        'fuchsia': [255,0,255], 'gainsboro': [220,220,220], 'ghostwhite': [248,248,255],
        'gold': [255,215,0], 'goldenrod': [218,165,32], 'gray': [128,128,128],
        'green': [0,128,0], 'greenyellow': [173,255,47], 'grey': [128,128,128],
        'honeydew': [240,255,240], 'hotpink': [255,105,180], 'indianred': [205,92,92],
        'indigo': [75,0,130], 'ivory': [255,255,240], 'khaki': [240,230,140],
        'lavender': [230,230,250], 'lavenderblush': [255,240,245], 'lawngreen': [124,252,0],
        'lemonchiffon': [255,250,205], 'lightblue': [173,216,230], 'lightcoral': [240,128,128],
        'lightcyan': [224,255,255], 'lightgoldenrodyellow': [250,250,210], 'lightgray': [211,211,211],
        'lightgreen': [144,238,144], 'lightgrey': [211,211,211], 'lightpink': [255,182,193],
        'lightsalmon': [255,160,122], 'lightseagreen': [32,178,170], 'lightskyblue': [135,206,250],
        'lightslategray': [119,136,153], 'lightslategrey': [119,136,153], 'lightsteelblue': [176,196,222],
        'lightyellow': [255,255,224], 'lime': [0,255,0], 'limegreen': [50,205,50],
        'linen': [250,240,230], 'magenta': [255,0,255], 'maroon': [128,0,0],
        'mediumaquamarine': [102,205,170], 'mediumblue': [0,0,205], 'mediumorchid': [186,85,211],
        'mediumpurple': [147,112,219], 'mediumseagreen': [60,179,113], 'mediumslateblue': [123,104,238],
        'mediumspringgreen': [0,250,154], 'mediumturquoise': [72,209,204], 'mediumvioletred': [199,21,133],
        'midnightblue': [25,25,112], 'mintcream': [245,255,250], 'mistyrose': [255,228,225],
        'moccasin': [255,228,181], 'navajowhite': [255,222,173], 'navy': [0,0,128],
        'oldlace': [253,245,230], 'olive': [128,128,0], 'olivedrab': [107,142,35],
        'orange': [255,165,0], 'orangered': [255,69,0], 'orchid': [218,112,214],
        'palegoldenrod': [238,232,170], 'palegreen': [152,251,152], 'paleturquoise': [175,238,238],
        'palevioletred': [219,112,147], 'papayawhip': [255,239,213], 'peachpuff': [255,218,185],
        'peru': [205,133,63], 'pink': [255,192,203], 'plum': [221,160,221],
        'powderblue': [176,224,230], 'purple': [128,0,128], 'rebeccapurple': [102,51,153],
        'red': [255,0,0], 'rosybrown': [188,143,143], 'royalblue': [65,105,225],
        'saddlebrown': [139,69,19], 'salmon': [250,128,114], 'sandybrown': [244,164,96],
        'seagreen': [46,139,87], 'seashell': [255,245,238], 'sienna': [160,82,45],
        'silver': [192,192,192], 'skyblue': [135,206,235], 'slateblue': [106,90,205],
        'slategray': [112,128,144], 'slategrey': [112,128,144], 'snow': [255,250,250],
        'springgreen': [0,255,127], 'steelblue': [70,130,180], 'tan': [210,180,140],
        'teal': [0,128,128], 'thistle': [216,191,216], 'tomato': [255,99,71],
        'turquoise': [64,224,208], 'violet': [238,130,238], 'wheat': [245,222,179],
        'white': [255,255,255], 'whitesmoke': [245,245,245], 'yellow': [255,255,0],
        'yellowgreen': [154,205,50]
    };

    function colorDistance(r1, g1, b1, r2, g2, b2) {
        return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
    }

    function parseColor(input) {
        input = input.trim();
        // Try hex
        if (input.startsWith('#')) {
            let hex = input;
            if (hex.length === 4) {
                hex = '#' + hex[1]+hex[1] + hex[2]+hex[2] + hex[3]+hex[3];
            }
            return Color.hexToRgb(hex);
        }
        // Try rgb/rgba
        const rgbMatch = input.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (rgbMatch) {
            return { r: parseInt(rgbMatch[1]), g: parseInt(rgbMatch[2]), b: parseInt(rgbMatch[3]) };
        }
        // Try CSS color name
        const lower = input.toLowerCase().replace(/\s/g, '');
        if (cssColors[lower]) {
            const [r, g, b] = cssColors[lower];
            return { r, g, b };
        }
        return null;
    }

    function findClosest(r, g, b) {
        let closest = null;
        let minDist = Infinity;
        for (const [name, [cr, cg, cb]] of Object.entries(cssColors)) {
            const dist = colorDistance(r, g, b, cr, cg, cb);
            if (dist < minDist) {
                minDist = dist;
                closest = { name, rgb: [cr, cg, cb] };
            }
        }
        return { ...closest, distance: Math.round(minDist) };
    }

    function find() {
        const rgb = parseColor(colorInput.value);
        if (!rgb) {
            resultContent.innerHTML = '<p class="error">Invalid color. Enter HEX (#RRGGBB) or RGB (rgb(r,g,b)).</p>';
            return;
        }

        const hex = Color.rgbToHex(rgb.r, rgb.g, rgb.b).toUpperCase();
        const closest = findClosest(rgb.r, rgb.g, rgb.b);
        preview.style.backgroundColor = hex;

        resultContent.innerHTML = `
            <div class="result-grid">
                <div class="result-item">
                    <span class="result-item-label">Your Color</span>
                    <span class="result-item-value">${hex}</span>
                </div>
                <div class="result-item">
                    <span class="result-item-label">Closest CSS Name</span>
                    <span class="result-item-value" style="text-transform:capitalize;font-weight:700;">${closest.name}</span>
                </div>
                <div class="result-item">
                    <span class="result-item-label">Closest HEX</span>
                    <span class="result-item-value">${Color.rgbToHex(...closest.rgb).toUpperCase()}</span>
                </div>
                <div class="result-item">
                    <span class="result-item-label">Distance</span>
                    <span class="result-item-value">${closest.distance} (0=exact, max~442)</span>
                </div>
            </div>
            <div style="display:flex;gap:0.5rem;margin-top:0.75rem;">
                <div style="flex:1;text-align:center;">
                    <div style="width:100%;height:40px;border-radius:6px;background:${hex};border:1px solid #e5e7eb;"></div>
                    <small style="color:#6b7280;">Your color</small>
                </div>
                <div style="flex:1;text-align:center;">
                    <div style="width:100%;height:40px;border-radius:6px;background:${Color.rgbToHex(...closest.rgb)};border:1px solid #e5e7eb;"></div>
                    <small style="color:#6b7280;">${closest.name}</small>
                </div>
            </div>
        `;
    }

    findBtn.addEventListener('click', find);
    colorInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') find(); });
    find();
});
