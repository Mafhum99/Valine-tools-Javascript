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
 * YAML to JSON Converter
 * Convert YAML data to JSON format
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'YAML to JSON Converter', icon: '\u{1F504}' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const convertBtn = $('#convertBtn');
    const clearBtn = $('#clearBtn');
    const copyBtn = $('#copyBtn');

    function yamlParseValue(value) {
        const trimmed = value.trim();
        if (trimmed === '' || trimmed === '~' || trimmed === 'null' || trimmed === 'Null' || trimmed === 'NULL') return null;
        if (trimmed === 'true' || trimmed === 'True' || trimmed === 'TRUE' || trimmed === 'yes' || trimmed === 'Yes' || trimmed === 'YES' || trimmed === 'on' || trimmed === 'On' || trimmed === 'ON') return true;
        if (trimmed === 'false' || trimmed === 'False' || trimmed === 'FALSE' || trimmed === 'no' || trimmed === 'No' || trimmed === 'NO' || trimmed === 'off' || trimmed === 'Off' || trimmed === 'OFF') return false;

        // Remove quotes
        if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
            return trimmed.slice(1, -1);
        }

        // Number
        if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
        if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);

        return trimmed;
    }

    function parseYaml(yamlStr) {
        const lines = yamlStr.split('\n');

        function getIndent(line) {
            const match = line.match(/^(\s*)/);
            return match ? match[1].length : 0;
        }

        function getContent(line) {
            return line.trim();
        }

        function parseBlock(startIdx, baseIndent) {
            const result = {};
            let i = startIdx;

            while (i < lines.length) {
                const line = lines[i];
                const trimmed = line.trim();

                // Skip empty lines and comments
                if (trimmed === '' || trimmed.startsWith('#')) {
                    i++;
                    continue;
                }

                const indent = getIndent(line);

                // If dedented, we're done with this block
                if (indent < baseIndent) break;

                // Array item at this level
                if (trimmed.startsWith('- ')) {
                    // This block is an array - re-parse as array
                    return parseArray(i - 1, indent);
                }

                // Key-value pair
                const colonIdx = trimmed.indexOf(':');
                if (colonIdx === -1) {
                    i++;
                    continue;
                }

                const key = trimmed.substring(0, colonIdx).trim();
                const afterColon = trimmed.substring(colonIdx + 1).trim();

                if (afterColon !== '') {
                    // Inline value
                    result[key] = yamlParseValue(afterColon);
                    i++;
                } else {
                    // Check next line for nested content
                    const nextIdx = i + 1;
                    // Find next non-empty line
                    let peek = nextIdx;
                    while (peek < lines.length && (lines[peek].trim() === '' || lines[peek].trim().startsWith('#'))) {
                        peek++;
                    }

                    if (peek < lines.length) {
                        const nextLine = lines[peek];
                        const nextIndent = getIndent(nextLine);
                        const nextContent = getContent(nextLine);

                        if (nextIndent > indent && nextContent.startsWith('- ')) {
                            // It's an array
                            result[key] = parseArray(peek, nextIndent);
                            // Find the end of the array block
                            let endIdx = peek;
                            while (endIdx < lines.length) {
                                const lt = lines[endIdx].trim();
                                if (lt !== '' && !lt.startsWith('#') && !lt.startsWith('- ')) {
                                    const li = getIndent(lines[endIdx]);
                                    if (li <= indent) break;
                                }
                                endIdx++;
                            }
                            i = endIdx;
                        } else if (nextIndent > indent) {
                            // It's a nested object
                            const parsed = parseBlock(peek, nextIndent);
                            result[key] = parsed;
                            // Advance past the nested block
                            let endIdx = peek;
                            while (endIdx < lines.length) {
                                const lt = lines[endIdx].trim();
                                if (lt !== '' && !lt.startsWith('#')) {
                                    const li = getIndent(lines[endIdx]);
                                    if (li <= indent) break;
                                }
                                endIdx++;
                            }
                            i = endIdx;
                        } else {
                            result[key] = null;
                            i = peek;
                        }
                    } else {
                        result[key] = null;
                        i++;
                    }
                }
            }

            return result;
        }

        function parseArray(startIdx, baseIndent) {
            const result = [];
            let i = startIdx;

            while (i < lines.length) {
                const line = lines[i];
                const trimmed = line.trim();

                if (trimmed === '' || trimmed.startsWith('#')) {
                    i++;
                    continue;
                }

                const indent = getIndent(line);
                if (indent < baseIndent) break;

                if (!trimmed.startsWith('- ')) {
                    // Not an array item at this indent level
                    break;
                }

                const afterDash = trimmed.substring(2).trim();

                if (afterDash === '' || afterDash === '|' || afterDash === '>') {
                    // Block scalar or nested object/array
                    const nextIdx = i + 1;
                    let peek = nextIdx;
                    while (peek < lines.length && (lines[peek].trim() === '' || lines[peek].trim().startsWith('#'))) {
                        peek++;
                    }

                    if (peek < lines.length) {
                        const nextIndent = getIndent(lines[peek]);
                        const nextContent = getContent(lines[peek]);

                        if (nextContent.startsWith('- ')) {
                            result.push(parseArray(peek, nextIndent));
                            let endIdx = peek;
                            while (endIdx < lines.length) {
                                const lt = lines[endIdx].trim();
                                if (lt !== '' && !lt.startsWith('#') && !lt.startsWith('- ')) {
                                    if (getIndent(lines[endIdx]) <= indent) break;
                                }
                                endIdx++;
                            }
                            i = endIdx;
                        } else if (nextContent.includes(':')) {
                            result.push(parseBlock(peek, nextIndent));
                            let endIdx = peek;
                            while (endIdx < lines.length) {
                                const lt = lines[endIdx].trim();
                                if (lt !== '' && !lt.startsWith('#')) {
                                    if (getIndent(lines[endIdx]) <= indent) break;
                                }
                                endIdx++;
                            }
                            i = endIdx;
                        } else {
                            result.push(yamlParseValue(nextContent));
                            i = peek + 1;
                        }
                    } else {
                        result.push(null);
                        i++;
                    }
                } else if (afterDash.includes(':')) {
                    // Inline object in array item: "- name: John"
                    // Collect the rest as an object
                    const objStr = afterDash;
                    // Parse this single object
                    const obj = {};
                    const kvIdx = objStr.indexOf(':');
                    const k = objStr.substring(0, kvIdx).trim();
                    const v = objStr.substring(kvIdx + 1).trim();
                    obj[k] = yamlParseValue(v);

                    // Check for more keys at the same indent + 2
                    const itemIndent = indent + 2;
                    let j = i + 1;
                    while (j < lines.length) {
                        const lt = lines[j].trim();
                        if (lt === '' || lt.startsWith('#') || lt.startsWith('- ')) break;
                        const li = getIndent(lines[j]);
                        if (li !== itemIndent) break;
                        if (lt.includes(':')) {
                            const ci = lt.indexOf(':');
                            const mk = lt.substring(0, ci).trim();
                            const mv = lt.substring(ci + 1).trim();
                            obj[mk] = yamlParseValue(mv);
                        }
                        j++;
                    }
                    result.push(obj);
                    i = j;
                } else {
                    // Simple value
                    result.push(yamlParseValue(afterDash));
                    i++;
                }
            }

            return result;
        }

        // Determine if root is array or object
        if (lines.length > 0) {
            let firstContent = 0;
            while (firstContent < lines.length && (lines[firstContent].trim() === '' || lines[firstContent].trim().startsWith('#'))) {
                firstContent++;
            }
            if (firstContent < lines.length && getContent(lines[firstContent]).startsWith('- ')) {
                return parseArray(firstContent, getIndent(lines[firstContent]));
            }
        }

        return parseBlock(0, 0);
    }

    function convert() {
        const raw = inputEl.value.trim();
        if (!raw) {
            outputEl.textContent = 'Please enter YAML to convert.';
            return;
        }
        try {
            const obj = parseYaml(raw);
            outputEl.textContent = JSON.stringify(obj, null, 2);
        } catch (e) {
            outputEl.textContent = '\u274C YAML parse error: ' + e.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    convertBtn.addEventListener('click', convert);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    }
});
