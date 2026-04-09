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
// Abbreviation Expander
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Abbreviation Expander', icon: '📖' });

    const input = $('#input');
    const output = $('#output');
    const actionBtn = $('#action-btn');
    const clearBtn = $('#clear-btn');
    const copyBtn = $('#copy-btn');

    const ABBREVIATIONS = {
        'API': 'Application Programming Interface',
        'URL': 'Uniform Resource Locator',
        'HTML': 'HyperText Markup Language',
        'CSS': 'Cascading Style Sheets',
        'JS': 'JavaScript',
        'HTTP': 'HyperText Transfer Protocol',
        'HTTPS': 'HyperText Transfer Protocol Secure',
        'FTP': 'File Transfer Protocol',
        'SSH': 'Secure Shell',
        'SQL': 'Structured Query Language',
        'DB': 'Database',
        'UI': 'User Interface',
        'UX': 'User Experience',
        'GUI': 'Graphical User Interface',
        'CLI': 'Command Line Interface',
        'OS': 'Operating System',
        'CPU': 'Central Processing Unit',
        'GPU': 'Graphics Processing Unit',
        'RAM': 'Random Access Memory',
        'ROM': 'Read-Only Memory',
        'SSD': 'Solid State Drive',
        'HDD': 'Hard Disk Drive',
        'USB': 'Universal Serial Bus',
        'WiFi': 'Wireless Fidelity',
        'LAN': 'Local Area Network',
        'WAN': 'Wide Area Network',
        'VPN': 'Virtual Private Network',
        'DNS': 'Domain Name System',
        'IP': 'Internet Protocol',
        'TCP': 'Transmission Control Protocol',
        'UDP': 'User Datagram Protocol',
        'JSON': 'JavaScript Object Notation',
        'XML': 'eXtensible Markup Language',
        'YAML': "YAML Ain't Markup Language",
        'CSV': 'Comma-Separated Values',
        'TSV': 'Tab-Separated Values',
        'README': 'Read Me',
        'TODO': 'To Do',
        'FAQ': 'Frequently Asked Questions',
        'DIY': 'Do It Yourself',
        'FYI': 'For Your Information',
        'BTW': 'By The Way',
        'IMO': 'In My Opinion',
        'IMHO': 'In My Humble Opinion',
        'ASAP': 'As Soon As Possible',
        'ETA': 'Estimated Time of Arrival',
        'TBA': 'To Be Announced',
        'TBD': 'To Be Determined',
        'TBC': 'To Be Confirmed',
        'RSVP': 'Repondez S\'il Vous Plait (Please Respond)',
        'CEO': 'Chief Executive Officer',
        'CFO': 'Chief Financial Officer',
        'CTO': 'Chief Technology Officer',
        'COO': 'Chief Operating Officer',
        'HR': 'Human Resources',
        'PR': 'Public Relations',
        'IT': 'Information Technology',
        'R&D': 'Research and Development',
        'B2B': 'Business to Business',
        'B2C': 'Business to Consumer',
        'C2C': 'Consumer to Consumer',
        'ROI': 'Return on Investment',
        'KPI': 'Key Performance Indicator',
        'OKR': 'Objectives and Key Results',
        'SaaS': 'Software as a Service',
        'PaaS': 'Platform as a Service',
        'IaaS': 'Infrastructure as a Service',
        'REST': 'Representational State Transfer',
        'GraphQL': 'Graph Query Language',
        'DOM': 'Document Object Model',
        'SDK': 'Software Development Kit',
        'IDE': 'Integrated Development Environment',
        'VCS': 'Version Control System',
        'CI/CD': 'Continuous Integration/Continuous Deployment',
        'CDN': 'Content Delivery Network',
        'SSL': 'Secure Sockets Layer',
        'TLS': 'Transport Layer Security',
        'OTP': 'One-Time Password',
        '2FA': 'Two-Factor Authentication',
        'MFA': 'Multi-Factor Authentication',
        'IoT': 'Internet of Things',
        'AI': 'Artificial Intelligence',
        'ML': 'Machine Learning',
        'DL': 'Deep Learning',
        'NLP': 'Natural Language Processing',
        'CV': 'Computer Vision',
        'GAN': 'Generative Adversarial Network',
        'RNN': 'Recurrent Neural Network',
        'CNN': 'Convolutional Neural Network',
        'LLM': 'Large Language Model',
        'N/A': 'Not Available',
        'EOD': 'End of Day',
        'EOB': 'End of Business',
        'COB': 'Close of Business',
        'EOM': 'End of Message',
        'FWIW': 'For What It\'s Worth',
        'IRL': 'In Real Life',
        'TL;DR': 'Too Long; Didn\'t Read',
        'AMA': 'Ask Me Anything',
        'ELI5': 'Explain Like I\'m 5',
        'OG': 'Original',
        'POC': 'Proof of Concept',
        'MVP': 'Minimum Viable Product',
        'A/B': 'A/B Testing',
        'WCAG': 'Web Content Accessibility Guidelines',
        'SEO': 'Search Engine Optimization',
        'SEM': 'Search Engine Marketing',
        'PPC': 'Pay Per Click',
        'CTR': 'Click-Through Rate',
        'CPC': 'Cost Per Click',
        'CPM': 'Cost Per Mille (Thousand Impressions)',
        'CMS': 'Content Management System',
        'CRM': 'Customer Relationship Management',
        'ERP': 'Enterprise Resource Planning',
        'SCM': 'Supply Chain Management',
        'SLA': 'Service Level Agreement',
        'SOP': 'Standard Operating Procedure',
        'NDA': 'Non-Disclosure Agreement',
        'IP': 'Intellectual Property',
        'EULA': 'End User License Agreement',
        'TOS': 'Terms of Service',
        'T&C': 'Terms and Conditions',
        'GDPR': 'General Data Protection Regulation',
        'CCPA': 'California Consumer Privacy Act',
        'ISO': 'International Organization for Standardization',
        'IEEE': 'Institute of Electrical and Electronics Engineers',
        'W3C': 'World Wide Web Consortium',
        'IETF': 'Internet Engineering Task Force',
        'ECMAScript': 'European Computer Manufacturers Association Script',
        'PNG': 'Portable Network Graphics',
        'JPEG': 'Joint Photographic Experts Group',
        'GIF': 'Graphics Interchange Format',
        'SVG': 'Scalable Vector Graphics',
        'PDF': 'Portable Document Format',
        'DOC': 'Document',
        'XLS': 'Excel Spreadsheet',
        'PPT': 'PowerPoint Presentation',
        'MP3': 'MPEG-1 Audio Layer 3',
        'MP4': 'MPEG-4 Part 14',
        'AVI': 'Audio Video Interleave',
        'MOV': 'Apple Movie',
        'WAV': 'Waveform Audio File Format',
        'FLAC': 'Free Lossless Audio Codec',
        'AAC': 'Advanced Audio Coding',
        'MIDI': 'Musical Instrument Digital Interface',
        'GPS': 'Global Positioning System',
        'GIS': 'Geographic Information System',
        'UTC': 'Coordinated Universal Time',
        'EST': 'Eastern Standard Time',
        'PST': 'Pacific Standard Time',
        'GMT': 'Greenwich Mean Time',
        'DST': 'Daylight Saving Time',
        'NASA': 'National Aeronautics and Space Administration',
        'FBI': 'Federal Bureau of Investigation',
        'CIA': 'Central Intelligence Agency',
        'NSA': 'National Security Agency',
        'IRS': 'Internal Revenue Service',
        'FCC': 'Federal Communications Commission',
        'FDA': 'Food and Drug Administration',
        'CDC': 'Centers for Disease Control and Prevention',
        'WHO': 'World Health Organization',
        'UN': 'United Nations',
        'EU': 'European Union',
        'NATO': 'North Atlantic Treaty Organization',
        'OPEC': 'Organization of the Petroleum Exporting Countries',
        'FIFO': 'First In, First Out',
        'LIFO': 'Last In, First Out',
        'PIN': 'Personal Identification Number',
        'ATM': 'Automated Teller Machine',
        'ACH': 'Automated Clearing House',
        'SWIFT': 'Society for Worldwide Interbank Financial Telecommunication',
        'IBAN': 'International Bank Account Number',
        'KYC': 'Know Your Customer',
        'AML': 'Anti-Money Laundering',
        'PCI': 'Payment Card Industry',
        'DSS': 'Data Security Standard',
        'SOC': 'Service Organization Control',
        'HIPAA': 'Health Insurance Portability and Accountability Act',
        'PII': 'Personally Identifiable Information',
        'PHI': 'Protected Health Information'
    };

    actionBtn?.addEventListener('click', () => {
        const value = input.value.trim();
        if (!value) {
            output.textContent = 'Please enter an abbreviation or acronym';
            return;
        }
        try {
            const parts = value.split(/[\s,]+/).filter(p => p.length > 0);
            const results = parts.map(part => {
                const key = part.toUpperCase();
                const expanded = ABBREVIATIONS[key];
                if (expanded) {
                    return `${part} -> ${expanded}`;
                }
                if (/^[A-Z]{2,6}$/.test(part)) {
                    return `${part} -> (not in database - try entering individual abbreviations)`;
                }
                return `${part} -> (not found)`;
            });
            output.textContent = results.join('\n');
        } catch (error) {
            output.textContent = 'Error: ' + error.message;
        }
    });

    clearBtn?.addEventListener('click', () => {
        input.value = '';
        output.textContent = '-';
        input.focus();
    });

    copyBtn?.addEventListener('click', () => {
        if (output.textContent && output.textContent !== '-') {
            copyToClipboard(output.textContent);
        }
    });

    input?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') actionBtn?.click();
    });
});
