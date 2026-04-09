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
 * Random Word Generator
 * Generate random words
 */

// Common English word list
const WORD_LIST = [
    "ability","able","about","above","accept","according","account","across","act","action",
    "activity","actually","add","address","administration","admit","adult","affect","after",
    "again","against","age","agency","agent","ago","agree","agreement","ahead","air",
    "all","allow","almost","alone","along","already","also","although","always","american",
    "among","amount","analysis","and","animal","another","answer","any","anyone","anything",
    "appear","apply","approach","area","argue","arm","army","around","arrive","art",
    "article","artist","as","ask","assume","at","attack","attention","attorney","audience",
    "author","authority","available","avoid","away","baby","back","bad","bag","ball",
    "bank","bar","base","beat","beautiful","because","become","bed","before","begin",
    "behavior","behind","believe","benefit","best","better","between","beyond","big","bill",
    "billion","bird","bit","black","blood","blue","board","body","bone","book",
    "born","both","box","boy","break","bring","brother","brown","budget","build",
    "building","business","but","buy","call","camera","campaign","can","cancer","candidate",
    "capital","car","card","care","career","carry","case","catch","cause","cell",
    "center","central","century","certain","certainly","chair","chairman","challenge","chance","change",
    "character","charge","check","child","children","choice","choose","church","citizen","city",
    "civil","claim","class","clear","clearly","close","coach","cold","collection","college",
    "color","come","commercial","common","community","company","compare","computer","concern","condition",
    "conference","congress","consider","consumer","contain","continue","control","cost","could","country",
    "couple","course","court","cover","create","crime","cultural","culture","cup","current",
    "customer","cut","dark","data","daughter","day","dead","deal","death","debate",
    "decade","decide","decision","deep","defense","degree","democrat","democratic","describe","design",
    "despite","detail","determine","develop","development","die","difference","different","difficult","dinner",
    "direction","director","discover","discuss","discussion","disease","do","doctor","dog","door",
    "down","draw","dream","drive","drop","drug","during","each","early","east",
    "easy","eat","economic","economy","edge","education","effect","effort","eight","either",
    "election","else","employee","end","energy","enjoy","enough","enter","entire","environment",
    "environmental","especially","establish","even","evening","event","ever","every","everybody","everyone",
    "everything","evidence","exactly","example","executive","exist","expect","experience","expert","explain",
    "eye","face","fact","factor","fail","fall","family","far","fast","father",
    "fear","federal","feel","feeling","few","field","fight","figure","fill","film",
    "final","finally","financial","find","fine","finger","finish","fire","firm","first",
    "fish","five","floor","fly","focus","follow","food","foot","for","force",
    "foreign","forget","form","former","forward","four","free","friend","from","front",
    "full","fund","future","game","garden","gas","general","generation","girl","give",
    "glass","go","goal","god","good","government","great","green","ground","group",
    "grow","growth","guess","gun","guy","hair","half","hand","hang","happen",
    "happy","hard","have","he","head","health","hear","heart","heat","heavy",
    "help","her","here","herself","high","him","himself","his","history","hit",
    "hold","home","hope","hospital","hot","hotel","hour","house","how","however",
    "huge","human","hundred","husband","idea","identify","image","imagine","impact","important",
    "improve","include","including","increase","indeed","indicate","individual","industry","information","inside",
    "instead","institution","interest","interesting","international","into","invest","investment","involve","issue",
    "it","item","its","itself","job","join","just","keep","key","kid",
    "kill","kind","kitchen","know","knowledge","land","language","large","last","late",
    "later","laugh","law","lawyer","lay","lead","leader","learn","least","leave",
    "left","leg","legal","less","let","letter","level","lie","life","light",
    "like","likely","line","list","listen","little","live","local","long","look",
    "lose","loss","lot","love","low","machine","magazine","main","maintain","major",
    "majority","make","man","manage","management","manager","many","market","marriage","material",
    "matter","may","maybe","me","mean","measure","media","medical","meet","meeting",
    "member","memory","mention","message","method","middle","might","military","million","mind",
    "minute","miss","mission","model","modern","moment","money","month","more","morning",
    "most","mother","mouth","move","movement","movie","much","music","must","my",
    "myself","name","nation","national","natural","nature","near","nearly","necessary","need",
    "network","never","new","news","newspaper","next","nice","night","no","none",
    "nor","north","not","note","nothing","notice","now","number","occur","of",
    "off","offer","office","officer","official","often","oh","oil","ok","old",
    "on","once","one","only","onto","open","operation","opportunity","option","or",
    "order","organization","other","others","our","out","outside","over","own","owner",
    "page","pain","painting","paper","parent","part","particular","particularly","partner","party",
    "pass","past","patient","pattern","pay","peace","people","per","perform","performance",
    "perhaps","period","person","personal","phone","physical","pick","picture","piece","place",
    "plan","plant","play","player","please","point","police","policy","political","politics",
    "poor","popular","population","position","positive","possible","power","practice","prepare","present",
    "president","pressure","pretty","prevent","price","private","probably","problem","process","produce",
    "product","production","professional","professor","program","project","property","protect","prove","provide",
    "public","pull","purpose","push","put","quality","question","quickly","quite","race",
    "radio","raise","range","rate","rather","reach","read","ready","real","reality",
    "realize","really","reason","receive","recent","recently","recognize","record","red","reduce",
    "reflect","region","relate","relationship","religious","remain","remember","remove","report","represent",
    "require","research","resource","respond","response","responsibility","rest","result","return","reveal",
    "rich","right","rise","risk","road","rock","role","room","rule","run",
    "safe","same","save","say","scene","school","science","scientist","score","sea",
    "season","seat","second","section","security","see","seek","seem","sell","send",
    "senior","sense","series","serious","serve","service","set","seven","several","sexual",
    "shake","share","she","shoot","short","shot","should","shoulder","show","side",
    "sign","significant","similar","simple","simply","since","sing","single","sister","sit",
    "site","situation","six","size","skill","skin","small","smile","so","social",
    "society","soldier","some","somebody","someone","something","sometimes","son","song","soon",
    "sort","sound","source","south","southern","space","speak","special","specific","speech",
    "spend","sport","spring","staff","stage","stand","standard","star","start","state",
    "statement","station","stay","step","still","stock","stop","store","story","strategy",
    "street","strong","structure","student","study","stuff","style","subject","success","successful",
    "such","suddenly","suffer","suggest","summer","support","sure","surface","system","table",
    "take","talk","task","tax","teach","teacher","team","technology","television","tell",
    "ten","tend","term","test","than","thank","that","the","their","them",
    "themselves","then","theory","there","these","they","thing","think","third","this",
    "those","though","thought","thousand","threat","three","through","throughout","throw","thus",
    "time","to","today","together","tonight","too","top","total","tough","toward",
    "town","trade","traditional","training","travel","treat","treatment","tree","trial","trip",
    "trouble","true","truth","try","turn","tv","two","type","under","understand",
    "unit","until","up","upon","us","use","usually","value","various","very",
    "victim","view","violence","visit","voice","vote","wait","walk","wall","want",
    "war","watch","water","way","we","weapon","wear","week","weight","well",
    "west","western","what","whatever","when","where","whether","which","while","white",
    "who","whole","whom","whose","why","wide","wife","will","win","wind",
    "window","wish","with","within","without","woman","wonder","word","work","worker",
    "world","worry","would","write","writer","wrong","yard","yeah","year","yes",
    "yet","you","young","your","yourself"
];

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Random Word Generator', icon: '\u{1F3B2}' });

    const countEl = $('#count');
    const separatorEl = $('#separator');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generate() {
        const count = parseInt(countEl.value, 10);

        if (isNaN(count) || count < 1) {
            outputEl.textContent = 'Please enter a valid number (1-100)';
            return;
        }

        if (count > 100) {
            outputEl.textContent = 'Maximum 100 words at a time';
            return;
        }

        try {
            const words = [];
            for (let i = 0; i < count; i++) {
                words.push(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
            }

            const separator = separatorEl.value.replace(/\\n/g, '\n');
            outputEl.textContent = words.join(separator);
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clear() {
        countEl.value = '10';
        outputEl.textContent = '-';
        countEl.focus();
    }

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    countEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generate();
    });
});
