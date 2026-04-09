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
 * 671 - API Documentation Generator
 * Generate API documentation templates
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'API Documentation Generator', icon: '📡' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generateAPIDoc(input) {
        const apiId = `API-${Date.now().toString(36).toUpperCase()}`;
        const parts = input.split(',').map(p => p.trim()).filter(p => p);
        const apiName = parts[0] || 'My API';
        const version = parts[1] || 'v1';
        const baseUrl = parts[2] || 'https://api.example.com';

        let output = `API DOCUMENTATION\n`;
        output += `${'═'.repeat(60)}\n`;
        output += `API: ${titleCase(apiName)}\n`;
        output += `Version: ${version}\n`;
        output += `Base URL: ${baseUrl}\n`;
        output += `ID: ${apiId}\n`;
        output += `${'═'.repeat(60)}\n\n`;

        output += `# ${titleCase(apiName)} API Documentation\n\n`;
        output += `Version: ${version}\n`;
        output += `Base URL: \`${baseUrl}\`\n`;
        output += `Format: JSON\n`;
        output += `Authentication: [Bearer Token / API Key / OAuth 2.0]\n\n`;

        output += `${'─'.repeat(60)}\n`;
        output += `## Getting Started\n\n`;
        output += `### Authentication\n`;
        output += 'All API requests require authentication. Include your API key in the header:\n\n';
        output += '```\n';
        output += `Authorization: Bearer YOUR_API_TOKEN\n`;
        output += '```\n\n';

        output += `### Rate Limiting\n`;
        output += `- Standard: 100 requests per minute\n`;
        output += `- Burst: 200 requests per minute\n`;
        output += `- Response headers: \`X-RateLimit-Limit\`, \`X-RateLimit-Remaining\`, \`X-RateLimit-Reset\`\n\n`;

        output += `### Response Format\n`;
        output += 'All responses are returned in JSON format:\n\n';
        output += '```json\n';
        output += `{\n`;
        output += `  "status": "success",\n`;
        output += `  "data": { ... },\n`;
        output += `  "meta": {\n`;
        output += `    "page": 1,\n`;
        output += `    "per_page": 20,\n`;
        output += `    "total": 100\n`;
        output += `  }\n`;
        output += `}\n`;
        output += '```\n\n';

        output += `${'─'.repeat(60)}\n`;
        output += `## Endpoints\n\n`;

        // Generate sample endpoints
        const endpoints = [
            { method: 'GET', path: '/api/${version}/resource', desc: 'List all resources', params: '?page=1&per_page=20&sort=created_at&order=desc' },
            { method: 'GET', path: '/api/${version}/resource/:id', desc: 'Get a specific resource', params: '' },
            { method: 'POST', path: '/api/${version}/resource', desc: 'Create a new resource', params: '' },
            { method: 'PUT', path: '/api/${version}/resource/:id', desc: 'Update a resource', params: '' },
            { method: 'DELETE', path: '/api/${version}/resource/:id', desc: 'Delete a resource', params: '' }
        ];

        endpoints.forEach(ep => {
            output += `### ${ep.method} \`${ep.path}\`\n\n`;
            output += `${ep.desc}\n\n`;

            if (ep.params) {
                output += `**Query Parameters:**\n\n`;
                output += `| Parameter | Type    | Required | Description           |\n`;
                output += `|-----------|---------|----------|-----------------------|\n`;
                output += `| page      | integer | No       | Page number (default: 1) |\n`;
                output += `| per_page  | integer | No       | Items per page (default: 20) |\n`;
                output += `| sort      | string  | No       | Sort field            |\n`;
                output += `| order     | string  | No       | asc or desc           |\n\n`;
            }

            if (ep.method === 'POST' || ep.method === 'PUT') {
                output += `**Request Body:**\n\n`;
                output += '```json\n';
                output += `{\n`;
                output += `  "name": "string (required)",\n`;
                output += `  "description": "string (optional)",\n`;
                output += `  "status": "active | inactive"\n`;
                output += `}\n`;
                output += '```\n\n';
            }

            output += `**Response (200 OK):**\n\n`;
            output += '```json\n';
            output += `{\n`;
            output += `  "status": "success",\n`;
            if (ep.method === 'GET' && !ep.path.includes(':id')) {
                output += `  "data": [\n`;
                output += `    { "id": 1, "name": "Example", "created_at": "2026-01-01T00:00:00Z" }\n`;
                output += `  ],\n`;
                output += `  "meta": { "page": 1, "per_page": 20, "total": 100 }\n`;
            } else {
                output += `  "data": { "id": 1, "name": "Example", "created_at": "2026-01-01T00:00:00Z" }\n`;
            }
            output += `}\n`;
            output += '```\n\n';

            output += `**Error Responses:**\n\n`;
            output += `| Status | Code              | Description              |\n`;
            output += `|--------|--------------------|--------------------------|\n`;
            output += `| 400    | INVALID_REQUEST    | Missing or invalid input |\n`;
            output += `| 401    | UNAUTHORIZED       | Invalid or missing token |\n`;
            output += `| 403    | FORBIDDEN          | Insufficient permissions |\n`;
            output += `| 404    | NOT_FOUND          | Resource does not exist  |\n`;
            output += `| 429    | RATE_LIMITED       | Too many requests        |\n`;
            output += `| 500    | INTERNAL_ERROR     | Server error             |\n\n`;

            output += `${'─'.repeat(60)}\n\n`;
        });

        output += `${'─'.repeat(60)}\n`;
        output += `## Error Handling\n\n`;
        output += 'All errors follow this format:\n\n';
        output += '```json\n';
        output += `{\n`;
        output += `  "status": "error",\n`;
        output += `  "error": {\n`;
        output += `    "code": "ERROR_CODE",\n`;
        output += `    "message": "Human-readable description",\n`;
        output += `    "details": {}\n`;
        output += `  }\n`;
        output += `}\n`;
        output += '```\n\n';

        output += `${'─'.repeat(60)}\n`;
        output += `## SDKs & Libraries\n\n`;
        output += `- JavaScript/Node.js: \`npm install ${apiName.toLowerCase().replace(/\s+/g, '-')}-sdk\`\n`;
        output += `- Python: \`pip install ${apiName.toLowerCase().replace(/\s+/g, '-')}-sdk\`\n`;
        output += `- Ruby: \`gem install ${apiName.toLowerCase().replace(/\s+/g, '_')}\`\n\n`;

        output += `${'─'.repeat(60)}\n`;
        output += `## Support\n\n`;
        output += `- Documentation: [docs.${apiName.toLowerCase().replace(/\s+/g, '')}.com]\n`;
        output += `- API Status: [status.${apiName.toLowerCase().replace(/\s+/g, '')}.com]\n`;
        output += `- Support: [support@${apiName.toLowerCase().replace(/\s+/g, '')}.com]\n\n`;

        output += `${'═'.repeat(60)}\n`;
        output += `API Documentation ID: ${apiId}\n`;
        output += `End of API Documentation - ${apiId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        if (!input) { outputEl.textContent = 'Enter API details (e.g., "User Management API, v2, https://api.myapp.com" or just "Payment API")'; return; }
        try {
            outputEl.textContent = generateAPIDoc(input);
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
