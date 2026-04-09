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
 * Resume Summary Generator
 * Generate professional resume summaries
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Resume Summary Generator', icon: '\uD83D\uDCDD' });

    // Get elements
    const yearsExpEl = $('#years-exp');
    const currentRoleEl = $('#current-role');
    const targetRoleEl = $('#target-role');
    const topSkillsEl = $('#top-skills');
    const summaryToneEl = $('#summary-tone');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function getExperienceDescription(years) {
        if (years <= 1) return 'entry-level';
        if (years <= 3) return 'early-career';
        if (years <= 7) return 'experienced';
        if (years <= 12) return 'senior-level';
        return 'highly experienced';
    }

    function generateSummary(years, currentRole, targetRole, skills, tone) {
        const expLevel = getExperienceDescription(years);
        const yearsStr = years + (years === 1 ? ' year' : ' years');
        const skillsList = skills.length > 0 ? skills : ['problem-solving', 'communication', 'technical skills'];
        const skillsStr = skillsList.length > 1
            ? skillsList.slice(0, -1).join(', ') + ', and ' + skillsList[skillsList.length - 1]
            : skillsList[0];

        const role = targetRole || currentRole;

        let opening, middle, closing;

        switch (tone) {
            case 'professional':
                opening = `Results-driven ${expLevel} ${currentRole || 'professional'} with ${yearsStr} of experience seeking to transition into a ${role} position. Proven track record of delivering high-quality results and driving process improvements.`;
                middle = `Core competencies include ${skillsStr}. Adept at managing complex projects, collaborating with cross-functional teams, and implementing solutions that align with organizational objectives.`;
                closing = `Committed to leveraging extensive background and expertise to contribute to team success while continuing professional growth in a dynamic environment.`;
                break;
            case 'enthusiastic':
                opening = `Passionate and motivated ${currentRole || 'professional'} with ${yearsStr} of hands-on experience, excited to bring my skills to a ${role} role! I thrive in fast-paced environments and love turning complex challenges into elegant solutions.`;
                middle = `My toolkit includes ${skillsStr}, and I am always eager to learn new technologies and methodologies. I have a proven history of going above and beyond to deliver exceptional results.`;
                closing = `I am looking for an opportunity where I can make a meaningful impact, collaborate with talented teams, and continue growing as a ${role}. Let us build something amazing together!`;
                break;
            case 'executive':
                opening = `Accomplished ${expLevel} leader with ${yearsStr} of progressive experience in ${currentRole || 'the industry'}, positioning for a strategic ${role} role. Demonstrated ability to drive organizational transformation and deliver measurable business outcomes.`;
                middle = `Strategic expertise spans ${skillsStr}, with a consistent record of building high-performing teams, optimizing operations, and spearheading initiatives that directly impact revenue and market positioning.`;
                closing = `Seeking to leverage executive-level insight and a results-oriented approach to drive sustained competitive advantage and long-term growth as ${role}.`;
                break;
            default:
                opening = `${expLevel} ${currentRole || 'Professional'} with ${yearsStr} of experience pursuing a ${role} position. Demonstrated ability to deliver quality results and drive improvements.`;
                middle = `Skilled in ${skillsStr}. Experienced in project management, teamwork, and solution implementation.`;
                closing = `Committed to contributing expertise to team success in a dynamic environment.`;
        }

        return opening + '\n\n' + middle + '\n\n' + closing;
    }

    function generateResumeSummary() {
        const years = parseInt(yearsExpEl.value, 10);
        const currentRole = currentRoleEl.value.trim();
        const targetRole = targetRoleEl.value.trim();
        const skills = topSkillsEl.value.trim();
        const tone = summaryToneEl.value;

        if (isNaN(years) || years < 0) {
            outputEl.textContent = 'Please enter a valid number of years of experience.';
            return;
        }

        if (!currentRole && !targetRole) {
            outputEl.textContent = 'Please enter either your current role or target role.';
            return;
        }

        try {
            const skillList = skills ? skills.split('\n').map((s) => s.trim()).filter((s) => s.length > 0) : [];
            const summaries = [];

            // Generate 2 variations
            for (let i = 0; i < 2; i++) {
                summaries.push(generateSummary(years, currentRole, targetRole, skillList, tone));
            }

            let result = 'RESUME SUMMARY OPTIONS\n';
            result += '='.repeat(50) + '\n\n';

            summaries.forEach((summary, idx) => {
                result += `Option ${idx + 1}:\n`;
                result += '-'.repeat(30) + '\n';
                result += summary + '\n\n';
                if (idx < summaries.length - 1) {
                    result += '='.repeat(50) + '\n\n';
                }
            });

            result += '='.repeat(50) + '\n';
            result += 'Tip: Choose the option that best matches your personality and the role you are targeting.';

            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    // Clear function
    function clear() {
        yearsExpEl.value = '';
        currentRoleEl.value = '';
        targetRoleEl.value = '';
        topSkillsEl.value = '';
        outputEl.textContent = '-';
        yearsExpEl.focus();
    }

    // Event listeners
    generateBtn.addEventListener('click', generateResumeSummary);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }
});
