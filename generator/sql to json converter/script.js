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
 * SQL to JSON Converter
 * Parse SQL SELECT queries and represent as JSON structure
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'SQL to JSON Converter', icon: '\u{1F504}' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const convertBtn = $('#convert');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function tokenize(sql) {
        const tokens = [];
        let i = 0;

        while (i < sql.length) {
            if (/\s/.test(sql[i])) {
                let ws = '';
                while (i < sql.length && /\s/.test(sql[i])) { ws += sql[i]; i++; }
                tokens.push({ type: 'ws', value: ws });
                continue;
            }

            if (sql[i] === "'") {
                let str = "'";
                i++;
                while (i < sql.length) {
                    if (sql[i] === "'" && i + 1 < sql.length && sql[i + 1] === "'") { str += "''"; i += 2; }
                    else if (sql[i] === "'") { str += "'"; i++; break; }
                    else { str += sql[i]; i++; }
                }
                tokens.push({ type: 'string', value: str });
                continue;
            }

            if (sql[i] === '`') {
                let ident = '`';
                i++;
                while (i < sql.length && sql[i] !== '`') { ident += sql[i]; i++; }
                if (i < sql.length) { ident += '`'; i++; }
                tokens.push({ type: 'ident', value: ident });
                continue;
            }

            if (/[0-9]/.test(sql[i])) {
                let num = '';
                while (i < sql.length && /[0-9.eE+\-]/.test(sql[i])) { num += sql[i]; i++; }
                tokens.push({ type: 'number', value: num });
                continue;
            }

            if ('(),;*<>!=+-/'.includes(sql[i])) {
                if ((sql[i] === '<' || sql[i] === '>') && i + 1 < sql.length && sql[i + 1] === '=') {
                    tokens.push({ type: 'op', value: sql[i] + sql[i + 1] }); i += 2;
                } else if (sql[i] === '!' && i + 1 < sql.length && sql[i + 1] === '=') {
                    tokens.push({ type: 'op', value: '!=' }); i += 2;
                } else if (sql[i] === '<' && i + 1 < sql.length && sql[i + 1] === '>') {
                    tokens.push({ type: 'op', value: '<>' }); i += 2;
                } else {
                    tokens.push({ type: 'punct', value: sql[i] }); i++;
                }
                continue;
            }

            if (/[a-zA-Z_@#]/.test(sql[i])) {
                let word = '';
                while (i < sql.length && /[a-zA-Z0-9_@#.]/.test(sql[i])) { word += sql[i]; i++; }
                tokens.push({ type: 'word', value: word });
                continue;
            }

            tokens.push({ type: 'other', value: sql[i] }); i++;
        }

        return tokens;
    }

    function skipWs(tokens, i) {
        while (i < tokens.length && tokens[i].type === 'ws') i++;
        return i;
    }

    function readWordsUntil(tokens, start, stopWords) {
        const words = [];
        let i = skipWs(tokens, start);
        while (i < tokens.length) {
            if (tokens[i].type === 'ws') { i++; continue; }
            if (tokens[i].type === 'word') {
                const w = tokens[i].value;
                if (stopWords.includes(w.toLowerCase())) break;
                words.push(w);
                i++;
            } else if (tokens[i].type === 'punct' && tokens[i].value === '*') {
                words.push('*');
                i++;
            } else if (tokens[i].type === 'ident') {
                words.push(tokens[i].value);
                i++;
            } else {
                break;
            }
        }
        return { words, next: i };
    }

    function readCondition(tokens, start) {
        let parts = [];
        let i = skipWs(tokens, start);
        let depth = 0;

        while (i < tokens.length) {
            if (tokens[i].type === 'ws') { i++; continue; }

            if (tokens[i].type === 'word') {
                const w = tokens[i].value.toLowerCase();
                if (depth === 0 && (w === 'order' || w === 'group' || w === 'limit' || w === 'having')) break;
            }

            if (tokens[i].type === 'punct' && tokens[i].value === '(') depth++;
            if (tokens[i].type === 'punct' && tokens[i].value === ')') depth = Math.max(0, depth - 1);

            parts.push(tokens[i].value);
            i++;
        }

        return { condition: parts.join(' '), next: i };
    }

    function parseOrderBy(tokens, start) {
        let i = skipWs(tokens, start);
        // Skip 'order' and 'by'
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'order') i++;
        i = skipWs(tokens, start);
        // Actually advance past 'order by'
        i = start;
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'order') i++;
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'by') i++;

        const columns = [];
        let current = { column: '' };
        i = skipWs(tokens, i);

        while (i < tokens.length) {
            if (tokens[i].type === 'ws') { i++; continue; }
            if (tokens[i].type === 'word') {
                const w = tokens[i].value.toLowerCase();
                if (w === 'limit' || w === 'offset' || w === 'group' || w === 'having' || w === 'where') break;
                if (w === 'asc' || w === 'desc') {
                    current.direction = tokens[i].value.toUpperCase();
                    i++;
                } else if (w === 'order') {
                    // Start of another order by? Unlikely but handle
                    break;
                } else if (w === ',') {
                    if (current.column) columns.push(current);
                    current = { column: '' };
                    i++;
                } else {
                    if (current.column) {
                        current.column += ' ' + tokens[i].value;
                    } else {
                        current.column = tokens[i].value;
                    }
                    i++;
                }
                continue;
            }
            if (tokens[i].type === 'punct' && tokens[i].value === ',') {
                if (current.column) columns.push(current);
                current = { column: '' };
                i++;
                continue;
            }
            if (current.column) current.column += ' ' + tokens[i].value;
            i++;
        }

        if (current.column) columns.push(current);
        return columns;
    }

    function parseGroupBy(tokens, start) {
        let i = start;
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'group') i++;
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'by') i++;

        const columns = [];
        i = skipWs(tokens, i);

        while (i < tokens.length) {
            if (tokens[i].type === 'ws') { i++; continue; }
            if (tokens[i].type === 'word') {
                const w = tokens[i].value.toLowerCase();
                if (w === 'having' || w === 'order' || w === 'limit') break;
                columns.push(tokens[i].value);
                i++;
            } else if (tokens[i].type === 'punct' && tokens[i].value === ',') {
                i++;
            } else {
                i++;
            }
        }

        return columns;
    }

    function parseSQL(sql) {
        const tokens = tokenize(sql);
        const result = {
            type: 'select',
            columns: [],
            table: '',
            alias: null,
            where: null,
            orderBy: [],
            groupBy: [],
            limit: null,
            offset: null
        };

        let i = skipWs(tokens, 0);

        // Verify it starts with SELECT
        if (i >= tokens.length || tokens[i].type !== 'word' || tokens[i].value.toLowerCase() !== 'select') {
            throw new Error('Only SELECT statements are supported');
        }
        i++;

        // Check for DISTINCT
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'distinct') {
            result.distinct = true;
            i++;
            i = skipWs(tokens, i);
        }

        // Read columns until FROM
        let colResult = readWordsUntil(tokens, i, ['from']);
        result.columns = colResult.words;
        i = colResult.next;

        // FROM
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'from') {
            i++;
            i = skipWs(tokens, i);
            if (i < tokens.length && tokens[i].type === 'word') {
                result.table = tokens[i].value;
                i++;
                // Check for alias
                i = skipWs(tokens, i);
                if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'as') {
                    i++;
                    i = skipWs(tokens, i);
                    if (i < tokens.length && tokens[i].type === 'word') {
                        result.alias = tokens[i].value;
                        i++;
                    }
                } else if (i < tokens.length && tokens[i].type === 'word') {
                    // Could be alias or next keyword
                    const w = tokens[i].value.toLowerCase();
                    if (w !== 'where' && w !== 'order' && w !== 'group' && w !== 'limit' && w !== 'join' && w !== 'on') {
                        result.alias = tokens[i].value;
                        i++;
                    }
                }
            }
        }

        // Handle JOINs (basic)
        i = skipWs(tokens, i);
        const joinKeywords = ['join', 'inner', 'left', 'right', 'full', 'cross'];
        while (i < tokens.length && tokens[i].type === 'word') {
            const w = tokens[i].value.toLowerCase();
            if (!joinKeywords.includes(w)) break;

            let joinType = 'join';
            if (w === 'inner' || w === 'left' || w === 'right' || w === 'full' || w === 'cross') {
                joinType = w;
                i++;
                i = skipWs(tokens, i);
                if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'join') {
                    joinType += ' join';
                    i++;
                }
            }

            i = skipWs(tokens, i);
            let joinedTable = '';
            if (i < tokens.length && tokens[i].type === 'word') {
                joinedTable = tokens[i].value;
                i++;
            }

            i = skipWs(tokens, i);
            let joinedAlias = null;
            if (i < tokens.length && tokens[i].type === 'word') {
                const w2 = tokens[i].value.toLowerCase();
                if (w2 !== 'on' && w2 !== 'where') {
                    joinedAlias = tokens[i].value;
                    i++;
                }
            }

            i = skipWs(tokens, i);
            let onCondition = '';
            if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'on') {
                i++;
                const condResult = readCondition(tokens, i);
                onCondition = condResult.condition;
                i = condResult.next;
            }

            if (!result.joins) result.joins = [];
            result.joins.push({
                type: joinType,
                table: joinedTable,
                alias: joinedAlias,
                on: onCondition
            });
        }

        // WHERE
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'where') {
            i++;
            const condResult = readCondition(tokens, i);
            result.where = condResult.condition;
            i = condResult.next;
        }

        // GROUP BY
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'group') {
            const nextToken = skipWs(tokens, i + 1);
            if (nextToken < tokens.length && tokens[nextToken].type === 'word' && tokens[nextToken].value.toLowerCase() === 'by') {
                result.groupBy = parseGroupBy(tokens, i);
                // Advance past group by
                i = nextToken + 1;
                while (i < tokens.length) {
                    if (tokens[i].type === 'word') {
                        const w = tokens[i].value.toLowerCase();
                        if (w === 'having' || w === 'order' || w === 'limit') break;
                    }
                    i++;
                }
            }
        }

        // HAVING (just capture as string)
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'having') {
            i++;
            const condResult = readCondition(tokens, i);
            result.having = condResult.condition;
            i = condResult.next;
        }

        // ORDER BY
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'order') {
            const nextToken = skipWs(tokens, i + 1);
            if (nextToken < tokens.length && tokens[nextToken].type === 'word' && tokens[nextToken].value.toLowerCase() === 'by') {
                result.orderBy = parseOrderBy(tokens, i);
                // Advance
                i = nextToken + 1;
                while (i < tokens.length) {
                    if (tokens[i].type === 'word') {
                        const w = tokens[i].value.toLowerCase();
                        if (w === 'limit' || w === 'offset') break;
                    }
                    i++;
                }
            }
        }

        // LIMIT
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'limit') {
            i++;
            i = skipWs(tokens, i);
            if (i < tokens.length && tokens[i].type === 'number') {
                result.limit = parseInt(tokens[i].value);
                i++;
            }
        }

        // OFFSET
        i = skipWs(tokens, i);
        if (i < tokens.length && tokens[i].type === 'word' && tokens[i].value.toLowerCase() === 'offset') {
            i++;
            i = skipWs(tokens, i);
            if (i < tokens.length && tokens[i].type === 'number') {
                result.offset = parseInt(tokens[i].value);
                i++;
            }
        }

        return result;
    }

    function convert() {
        const input = inputEl.value.trim();
        if (!input) {
            outputEl.textContent = 'Please enter a SQL query';
            return;
        }

        try {
            const parsed = parseSQL(input);
            outputEl.textContent = JSON.stringify(parsed, null, 2);
        } catch (e) {
            outputEl.textContent = '\u274C Error: ' + e.message;
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
