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
 * Twitter Thread Generator
 * Split long text into tweet threads
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Twitter Thread Generator', icon: '\uD83D\uDC26' });

    // Get elements
    const topicEl = $('#topic');
    const contentDetailsEl = $('#content-details');
    const threadToneEl = $('#thread-tone');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function truncateToCharLimit(text, limit) {
        if (text.length <= limit) return text;
        const truncated = text.substring(0, limit - 3);
        const lastSpace = truncated.lastIndexOf(' ');
        return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }

    function generateThread(topic, points, tone) {
        const tweets = [];
        const maxTweetLength = 280;

        // Hook tweet
        let hook;
        switch (tone) {
            case 'informative':
                hook = `A thread on ${topic}:\n\nHere is what you need to know about this important topic.`;
                break;
            case 'engaging':
                hook = `Let's talk about ${topic}.\n\nI've put together a thread breaking down everything you need to know. Here we go:`;
                break;
            case 'storytelling':
                hook = `I used to know very little about ${topic}.\n\nThen I did the research. Here is what I discovered (a thread):`;
                break;
            default:
                hook = `Here's what everyone should know about ${topic}:\n\n(Thread)`;
        }
        tweets.push(truncateToCharLimit(hook, maxTweetLength));

        // Content tweets
        if (points.length > 0) {
            points.forEach((point, idx) => {
                let tweet;
                switch (tone) {
                    case 'informative':
                        tweet = `Point ${idx + 1}: ${point}\n\nThis is an important consideration when thinking about ${topic}.`;
                        break;
                    case 'engaging':
                        tweet = `${idx + 1}/ ${point}\n\nWhat do you think about this? It's one of the most interesting aspects of ${topic}.`;
                        break;
                    case 'storytelling':
                        tweet = `${idx + 1}/ When I dug into ${topic}, I found: ${point}\n\nThis was a real eye-opener for me.`;
                        break;
                    default:
                        tweet = `${idx + 1}/ ${point}`;
                }
                tweets.push(truncateToCharLimit(tweet, maxTweetLength));
            });
        } else {
            // Generate generic points if none provided
            const genericPoints = [
                `Understanding ${topic} starts with knowing the fundamentals. The core concepts are essential for anyone looking to get involved.`,
                `The current landscape of ${topic} is evolving rapidly. Staying informed is key to making smart decisions.`,
                `One of the biggest challenges with ${topic} is separating facts from noise. Focus on credible sources and verified information.`,
                `Looking ahead, ${topic} will only become more relevant. Those who invest time in learning now will have a significant advantage.`
            ];

            genericPoints.forEach((point, idx) => {
                let tweet;
                switch (tone) {
                    case 'engaging':
                        tweet = `${idx + 1}/ ${point}\n\nThoughts on this?`;
                        break;
                    case 'storytelling':
                        tweet = `${idx + 1}/ ${point}\n\nThis really changed my perspective on ${topic}.`;
                        break;
                    default:
                        tweet = `${idx + 1}/ ${point}`;
                }
                tweets.push(truncateToCharLimit(tweet, maxTweetLength));
            });
        }

        // Closing tweet
        let closing;
        switch (tone) {
            case 'informative':
                closing = `That covers the essentials of ${topic}.\n\nFollow for more informative threads on topics that matter.`;
                break;
            case 'engaging':
                closing = `And that's a wrap on ${topic}!\n\nWhat did I miss? Reply with your thoughts below. Let's discuss!`;
                break;
            case 'storytelling':
                closing = `My journey learning about ${topic} continues.\n\nIf you found this thread helpful, share it and follow for more.`;
                break;
            default:
                closing = `Thanks for reading this thread on ${topic}.\n\nFollow for more content like this.`;
        }
        tweets.push(truncateToCharLimit(closing, maxTweetLength));

        return tweets;
    }

    function generateThreadFn() {
        const topic = topicEl.value.trim();
        const contentDetails = contentDetailsEl.value.trim();
        const tone = threadToneEl.value;

        if (!topic) {
            outputEl.textContent = 'Please enter a topic for the thread.';
            return;
        }

        try {
            const points = contentDetails
                ? contentDetails.split('\n').map((p) => p.trim()).filter((p) => p.length > 0)
                : [];

            const tweets = generateThread(topic, points, tone);

            let result = 'TWITTER THREAD\n';
            result += '='.repeat(50) + '\n\n';

            tweets.forEach((tweet, idx) => {
                result += 'Tweet ' + (idx + 1) + '/' + tweets.length + ':\n';
                result += '-'.repeat(30) + '\n';
                result += tweet + '\n\n';

                if (tweet.length > 280) {
                    result += '[WARNING: This tweet exceeds 280 characters]\n\n';
                }

                result += '='.repeat(30) + '\n\n';
            });

            result += 'Total tweets: ' + tweets.length + '\n';
            result += 'Tip: Copy each tweet individually and post in sequence.';

            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    // Clear function
    function clear() {
        topicEl.value = '';
        contentDetailsEl.value = '';
        outputEl.textContent = '-';
        topicEl.focus();
    }

    // Event listeners
    generateBtn.addEventListener('click', generateThreadFn);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    // Enter key support
    [topicEl, contentDetailsEl].forEach((el) => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                generateThreadFn();
            }
        });
    });
});
