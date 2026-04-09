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
 * FAQ Generator
 * Generate frequently asked questions
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'FAQ Generator', icon: '❓' });

    // Get elements
    const topicEl = $('#topic');
    const countEl = $('#count');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    // Main generation function
    function generate() {
        const topic = topicEl.value.trim();

        if (!topic) {
            outputEl.textContent = 'Please enter a topic.';
            return;
        }

        try {
            const faqs = generateFAQs(topic, parseInt(countEl.value, 10));
            outputEl.textContent = faqs;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function generateFAQs(topic, count) {
        const keywords = extractKeywords(topic);
        const capitalizedTopic = capitalizeFirst(topic);
        const faqPool = buildFAQPool(topic, capitalizedTopic, keywords);

        // Select FAQs up to the requested count
        const selected = faqPool.slice(0, Math.min(count, faqPool.length));

        let output = `FREQUENTLY ASKED QUESTIONS\n`;
        output += `Topic: ${capitalizedTopic}\n`;
        output += '═'.repeat(50) + '\n\n';

        selected.forEach((faq, i) => {
            output += `Q${i + 1}: ${faq.question}\n`;
            output += `A: ${faq.answer}\n\n`;
        });

        output += '═'.repeat(50) + '\n';
        output += `Generated ${selected.length} Q&A pairs about "${capitalizedTopic}"\n`;
        output += `Tip: Customize answers with your specific product or service details.`;

        return output;
    }

    function buildFAQPool(topic, capitalizedTopic, keywords) {
        const kw = keywords[0] || topic.toLowerCase();
        const faqs = [
            {
                question: `What is ${capitalizedTopic}?`,
                answer: `${capitalizedTopic} refers to the concepts, practices, and applications surrounding ${topic}. It encompasses a broad range of subjects including fundamentals, advanced techniques, and real-world applications. Understanding ${kw} is increasingly important in today's landscape.`
            },
            {
                question: `Why is ${capitalizedTopic} important?`,
                answer: `${capitalizedTopic} matters because it impacts how we work, live, and make decisions. It drives innovation, improves efficiency, and creates new opportunities. Organizations and individuals who understand ${kw} gain a competitive advantage and are better positioned for future success.`
            },
            {
                question: `How does ${capitalizedTopic} work?`,
                answer: `${capitalizedTopic} operates through a combination of principles, tools, and methodologies. At its core, it involves understanding key concepts, applying best practices, and continuously iterating based on feedback and results. The specific mechanisms vary depending on the use case.`
            },
            {
                question: `What are the benefits of ${capitalizedTopic}?`,
                answer: `Key benefits include: (1) Increased efficiency and productivity, (2) Cost savings over time, (3) Better decision-making through data and insights, (4) Enhanced competitiveness, and (5) Future-proofing your skills and operations. The exact benefits depend on how ${kw} is implemented.`
            },
            {
                question: `What are the common challenges with ${capitalizedTopic}?`,
                answer: `Common challenges include a steep learning curve, initial setup costs, integration with existing systems, and keeping up with rapid changes. However, these can be mitigated with proper planning, training, and the right tools and resources.`
            },
            {
                question: `How do I get started with ${capitalizedTopic}?`,
                answer: `To get started: (1) Research the fundamentals through online courses or books, (2) Identify your specific goals and use cases, (3) Choose the right tools or platforms, (4) Start with a small pilot project, and (5) Join communities or forums to learn from others experienced in ${kw}.`
            },
            {
                question: `What skills do I need for ${capitalizedTopic}?`,
                answer: `Essential skills include analytical thinking, problem-solving, and a willingness to continuously learn. Depending on the specific area of ${kw}, technical skills such as data analysis, programming, or domain-specific knowledge may also be valuable. Many skills can be developed through practice and online resources.`
            },
            {
                question: `What are the best tools for ${capitalizedTopic}?`,
                answer: `The best tools depend on your specific needs and budget. Popular categories include: (1) All-in-one platforms for comprehensive solutions, (2) Specialized tools for niche tasks, (3) Open-source alternatives for cost-conscious teams, and (4) Enterprise-grade solutions for large organizations. Research and compare options before committing.`
            },
            {
                question: `How much does ${capitalizedTopic} cost?`,
                answer: `Costs vary widely. Free and open-source options exist for beginners. Mid-range solutions typically range from $10-$100/month for small teams. Enterprise solutions can cost significantly more but offer advanced features, dedicated support, and scalability. Many tools offer free trials to test before purchasing.`
            },
            {
                question: `What is the future of ${capitalizedTopic}?`,
                answer: `The future looks promising. Trends point toward greater accessibility, automation, and integration with emerging technologies. Experts predict that ${kw} will become even more central to how organizations operate, making now an ideal time to build knowledge and experience in this area.`
            },
            {
                question: `Can beginners learn ${capitalizedTopic}?`,
                answer: `Absolutely. Many resources are designed specifically for beginners, including step-by-step tutorials, video courses, and guided practice exercises. Start with the fundamentals, practice consistently, and gradually tackle more advanced topics. The key is persistence and hands-on experience.`
            },
            {
                question: `What are common misconceptions about ${capitalizedTopic}?`,
                answer: `Common misconceptions include: (1) It's too complex for most people, (2) It requires expensive tools, (3) It's only relevant for large organizations, and (4) Results are immediate. In reality, ${kw} is accessible to anyone willing to learn, has options at every price point, and rewards patience and consistent effort.`
            }
        ];

        return faqs;
    }

    function extractKeywords(topic) {
        const stopWords = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'to', 'for', 'is', 'on', 'at', 'by', 'with', 'from', 'or', 'its', 'about', 'what', 'how', 'why']);
        return topic.split(/\s+/)
            .map(w => w.toLowerCase().replace(/[^a-z]/g, ''))
            .filter(w => w.length > 2 && !stopWords.has(w))
            .slice(0, 5);
    }

    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // Clear function
    function clear() {
        topicEl.value = '';
        countEl.value = '8';
        outputEl.textContent = '-';
        topicEl.focus();
    }

    // Event listeners
    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    // Enter key support
    topicEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generate();
        }
    });
});
