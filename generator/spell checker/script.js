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
 * Spell Checker
 * Compare words against a common dictionary and flag unknown words with suggestions
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Spell Checker', icon: '🔤' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const checkBtn = $('#check');
    const clearBtn = $('#clear');

    // Common English dictionary (most frequent ~2000 words)
    const commonWords = new Set([
        'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he',
        'as','you','do','at','this','but','his','by','from','they','we','say','her','she','or',
        'an','will','my','one','all','would','there','their','what','so','up','out','if','about',
        'who','get','which','go','me','when','make','can','like','time','no','just','him','know',
        'take','people','into','year','your','good','some','could','them','see','other','than',
        'then','now','look','only','come','its','over','think','also','back','after','use','two',
        'how','our','work','first','well','way','even','new','want','because','any','these','give',
        'day','most','us','is','are','was','were','been','has','had','did','does','doing','am',
        'being','having','done','said','each','tell','where','before','through','during','between',
        'same','should','very','here','much','might','still','such','more','down','must','need',
        'found','part','every','place','right','again','thing','think','three','down','last',
        'while','those','both','little','long','around','never','under','next','without','great',
        'high','own','however','own','since','state','made','went','came','home','school','house',
        'room','world','life','hand','head','point','face','book','door','water','room','food',
        'family','night','morning','business','country','city','place','number','group','problem',
        'fact','school','student','child','children','man','men','woman','women','person','day',
        'week','month','hour','minute','second','name','eye','word','story','problem','question',
        'case','point','change','reason','example','idea','answer','question','system','program',
        'company','government','market','world','power','war','party','team','group','end','member',
        'law','car','city','community','area','country','family','student','language','history',
        'science','music','art','game','movie','television','paper','research','report','study',
        'project','plan','design','development','process','service','product','information',
        'data','computer','internet','website','software','hardware','network','phone','email',
        'message','text','letter','word','sentence','paragraph','page','chapter','page','title',
        'author','writer','teacher','doctor','engineer','manager','president','leader','member',
        'friend','parent','mother','father','brother','sister','husband','wife','son','daughter',
        'boy','girl','baby','love','heart','mind','body','health','money','time','day','year',
        'today','tomorrow','yesterday','week','month','season','spring','summer','winter','fall',
        'weather','rain','snow','sun','moon','star','sky','cloud','wind','storm','temperature',
        'hot','cold','warm','cool','dry','wet','fast','slow','quick','early','late','old','young',
        'new','big','small','large','little','long','short','tall','wide','narrow','thick','thin',
        'heavy','light','dark','bright','clear','clean','dirty','hard','soft','smooth','rough',
        'strong','weak','rich','poor','busy','free','open','closed','full','empty','easy',
        'difficult','simple','complex','important','necessary','possible','available','likely',
        'certain','sure','real','true','false','different','same','similar','special','common',
        'normal','natural','basic','main','major','minor','public','private','local','national',
        'international','general','specific','particular','personal','social','political','economic',
        'financial','medical','legal','official','formal','professional','technical','digital',
        'physical','mental','emotional','spiritual','cultural','historical','environmental',
        'beautiful','wonderful','amazing','excellent','perfect','terrible','awful','horrible',
        'good','bad','nice','kind','friendly','happy','sad','angry','afraid','surprised','excited',
        'tired','bored','interested','confused','worried','nervous','calm','peaceful','comfortable',
        'successful','famous','popular','familiar','strange','unique','creative','intelligent',
        'smart','clever','wise','stupid','silly','crazy','serious','funny','humorous','honest',
        'brave','careful','dangerous','safe','secure','guilty','innocent','responsible','independent',
        'run','walk','move','stand','sit','lie','fall','jump','fly','swim','drive','ride','travel',
        'send','receive','bring','carry','hold','keep','save','spend','pay','buy','sell','cost',
        'pay','earn','win','lose','fail','succeed','grow','develop','create','build','make','produce',
        'write','read','speak','talk','listen','hear','see','watch','show','appear','disappear',
        'seem','happen','occur','exist','remain','stay','continue','start','begin','finish','stop',
        'try','help','allow','let','cause','force','enable','prevent','avoid','protect','support',
        'provide','offer','supply','deliver','share','communicate','express','explain','describe',
        'suggest','recommend','advise','warn','promise','agree','disagree','argue','fight','compete',
        'compare','consider','include','contain','consist','represent','indicate','demonstrate',
        'prove','discover','find','search','seek','explore','investigate','examine','check','test',
        'measure','count','calculate','estimate','predict','expect','hope','wish','dream','imagine',
        'believe','understand','realize','recognize','remember','forget','learn','teach','study',
        'practice','train','prepare','organize','arrange','manage','control','handle','operate',
        'function','perform','act','behave','react','respond','answer','reply','question','ask',
        'request','demand','order','command','direct','lead','guide','follow','obey','serve',
        'help','assist','support','encourage','motivate','inspire','influence','persuade','convince',
        'attract','impress','satisfy','please','disappoint','frustrate','annoy','bother','disturb',
        'interrupt','concentrate','focus','pay','attention','notice','observe','discover','realize',
        'above','below','beside','behind','inside','outside','against','toward','towards','across',
        'along','among','through','throughout','upon','within','without','beyond','except','besides',
        'although','though','while','whereas','because','since','therefore','however','nevertheless',
        'moreover','furthermore','otherwise','instead','rather','perhaps','maybe','possibly',
        'probably','certainly','definitely','obviously','clearly','simply','actually','really',
        'exactly','especially','particularly','generally','usually','normally','often','sometimes',
        'rarely','seldom','hardly','never','always','already','yet','still','just','only','even',
        'also','too','either','neither','enough','quite','rather','pretty','fairly','very','extremely',
        'absolutely','completely','totally','entirely','partly','partially','mostly','mainly',
        'nearly','almost','approximately','roughly','about','around','precisely',
        'here','there','everywhere','nowhere','somewhere','anywhere'
    ]);

    // Levenshtein distance for suggestions
    function levenshteinDistance(a, b) {
        const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
        for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b[i - 1] === a[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    function getSuggestions(word, maxSuggestions = 5) {
        const wordLower = word.toLowerCase();
        const suggestions = [];

        for (const dictWord of commonWords) {
            if (Math.abs(dictWord.length - wordLower.length) > 3) continue;
            const distance = levenshteinDistance(wordLower, dictWord);
            if (distance <= 2 && distance > 0) {
                suggestions.push({ word: dictWord, distance });
            }
            if (suggestions.length >= 20) break;
        }

        suggestions.sort((a, b) => a.distance - b.distance);
        return suggestions.slice(0, maxSuggestions).map(s => s.word);
    }

    function checkSpelling(text) {
        // Split into words, keeping track of original positions
        const words = text.match(/[a-zA-Z']+/g) || [];
        const misspelled = [];

        const seen = new Set();
        words.forEach(word => {
            const lower = word.toLowerCase();
            if (seen.has(lower)) return;
            seen.add(lower);

            // Skip short words, numbers, and common words
            if (lower.length <= 1) return;
            if (/^\d+$/.test(lower)) return;
            if (commonWords.has(lower)) return;

            misspelled.push({
                word: word,
                suggestions: getSuggestions(word)
            });
        });

        return misspelled;
    }

    function check() {
        const input = inputEl.value.trim();

        if (!input) {
            outputEl.textContent = 'Please enter text to check';
            return;
        }

        try {
            const misspelled = checkSpelling(input);

            if (misspelled.length === 0) {
                outputEl.innerHTML = '<div class="grammar-success">No spelling errors detected!</div>';
                return;
            }

            let html = `<div class="grammar-summary">Found ${misspelled.length} potentially misspelled word(s):</div>`;
            html += '<div class="grammar-issues">';
            misspelled.forEach(({ word, suggestions }) => {
                html += `<div class="grammar-issue">
                    <span class="issue-type">🔴 Unknown word</span>
                    <p class="issue-message">"<strong>${escapeHtml(word)}</strong>" is not recognized</p>
                    ${suggestions.length > 0
                        ? `<p class="issue-suggestion">💡 Did you mean: ${suggestions.map(s => `<strong>${s}</strong>`).join(', ')}?</p>`
                        : '<p class="issue-suggestion">💡 No suggestions available</p>'
                    }
                </div>`;
            });
            html += '</div>';

            // Highlight text with misspelled words
            let highlightedText = escapeHtml(input);
            misspelled.forEach(({ word }) => {
                const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(escaped, 'gi');
                highlightedText = highlightedText.replace(regex, `<mark class="misspelled">$&</mark>`);
            });

            html += '<div class="corrected-text">';
            html += '<h4>Highlighted Text:</h4>';
            html += `<p>${highlightedText}</p>`;
            html += '</div>';

            outputEl.innerHTML = html;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        inputEl.value = '';
        outputEl.textContent = '-';
        inputEl.focus();
    }

    checkBtn.addEventListener('click', check);
    clearBtn.addEventListener('click', clear);
});
