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
 * Text Adventure Generator - 619
 * Generate text adventure scenarios
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Text Adventure Generator', icon: '🗺️' });

    const inputEl = $('#input');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const adventureTemplates = [
        {
            title: "The Abandoned Mansion",
            generate: (topic) => {
                return {
                    intro: `You stand before an old mansion at the edge of ${topic}. The iron gates hang open, rusted and crooked. A cold wind carries the scent of rain and something else — something you can't quite identify. The front door looms ahead, slightly ajar.`,
                    choices: [
                        "Push open the front door and enter the foyer",
                        "Walk around to check the side windows",
                        "Search the overgrown garden first",
                        "Call out to see if anyone is home"
                    ],
                    outcomes: [
                        "The door creaks open to reveal a grand foyer covered in dust. A chandelier hangs precariously from the ceiling. Two staircases lead upward, and a dim light flickers from a room to your left.",
                        "You circle the mansion carefully. Most windows are boarded, but one on the eastern side is cracked just enough to see through. Inside, you spot a figure moving — or was it a trick of the light?",
                        "The garden is a tangle of thorns and wild growth. Half-hidden beneath the foliage, you discover a stone pathway leading to a small shed. Inside the shed is a journal, its pages yellowed but legible.",
                        "\"Hello?\" Your voice echoes back unnaturally, as if the house itself is repeating it. Then, from somewhere deep inside, you hear a response — not words, but a single, clear note like a bell."
                    ]
                };
            }
        },
        {
            title: "The Mysterious Cave",
            generate: (topic) => {
                return {
                    intro: `Deep in the wilderness near ${topic}, you discover a cave entrance hidden behind a curtain of vines. Strange symbols are carved into the rock face. Your flashlight flickers as you approach. Something inside the cave is glowing faintly blue.`,
                    choices: [
                        "Enter the cave with your flashlight",
                        "Study the carved symbols first",
                        "Follow the blue glow deeper",
                        "Mark the location and return with supplies"
                    ],
                    outcomes: [
                        "The cave is wider than it appeared. The walls are covered in bioluminescent moss that pulses gently. Ahead, the path splits in two directions. The left tunnel carries a warm draft, while the right echoes with the sound of dripping water.",
                        "The symbols are ancient — older than any language you recognize. But you notice a pattern: they form a map of sorts, with markers leading deeper into the cave system. One symbol, larger than the rest, seems to mark a destination.",
                        "The blue glow leads you to an underground chamber filled with crystals that hum with energy. In the center sits a stone pedestal with an empty indentation — something is meant to go here, but what?",
                        "Smart move. When you return with proper gear, you find the cave entrance has changed — the symbols have shifted overnight, and the vines that hid the entrance are now deliberately arranged to point inside, as if inviting you in."
                    ]
                };
            }
        },
        {
            title: "The Lost Temple",
            generate: (topic) => {
                return {
                    intro: `After weeks of searching near ${topic}, you've finally found it — a lost temple half-buried in the jungle. Vines drape over stone pillars carved with scenes from an unknown mythology. The entrance is a dark archway, and you can hear water flowing somewhere within.`,
                    choices: [
                        "Enter through the main archway",
                        "Examine the carved pillars first",
                        "Follow the sound of the water",
                        "Set up camp and document the exterior"
                    ],
                    outcomes: [
                        "The archway leads to a long corridor lit by shafts of light from holes in the ceiling. The floor is a mosaic depicting a great flood. At the end of the corridor, three doors stand side by side — each marked with a different symbol: a sun, a moon, and a star.",
                        "The carvings tell a story: a civilization that worshipped beings of light, who came from the sky and taught them secrets before departing. The last carving shows the beings returning — but the final panel has been deliberately destroyed.",
                        "The water leads to an underground river. A stone bridge crosses it, barely wide enough to walk on. On the other side, you see a massive door sealed with a mechanism that requires three keys — and you notice three keyholes shaped like a sun, moon, and star.",
                        "As you document the exterior, you notice something remarkable: the temple's shadow, cast by the setting sun, forms an arrow pointing to a specific spot on the ground. Digging there reveals a hidden staircase descending beneath the temple."
                    ]
                };
            }
        },
        {
            title: "The Space Station",
            generate: (topic) => {
                return {
                    intro: `Your ship's sensors pick up a distress signal from a space station orbiting a dead star near ${topic}. The station appears operational, but no response comes to your hails. As you dock, the airlock opens automatically — as if expecting you.`,
                    choices: [
                        "Board the station cautiously",
                        "Scan the station thoroughly from your ship",
                        "Try hailing one more time with a different frequency",
                        "Send a drone in first"
                    ],
                    outcomes: [
                        "Inside, the station is eerily pristine — no signs of damage or struggle. The lights work, life support is active, and there's even fresh coffee in the mess hall. But there's not a single person anywhere. A logbook sits open on the commander's desk.",
                        "Your scans reveal the station is fully functional, but there's a strange energy signature in the lower decks — something that shouldn't exist in known physics. The crew quarters show signs of recent occupancy. Where did they go?",
                        "A voice finally responds — but it's your own voice, speaking words you haven't said yet: \"Don't trust the commander's log. Find the observatory. Look through the telescope. Now.\" The transmission cuts out.",
                        "The drone enters and transmits footage of empty corridors. Then, in one room, the camera catches something: every mirror in the station is covered. The drone moves toward a covered mirror — and the feed goes dead."
                    ]
                };
            }
        },
        {
            title: "The Enchanted Forest",
            generate: (topic) => {
                return {
                    intro: `The locals warned you never to enter the forest near ${topic} after dark. But you didn't listen, and now that you're here, you understand why. The trees seem to shift when you're not looking. The path behind you has vanished. A fox with silver eyes watches you from a mossy rock.`,
                    choices: [
                        "Follow the silver-eyed fox",
                        "Stay put and wait for dawn",
                        "Try to find the path back",
                        "Call out into the darkness"
                    ],
                    outcomes: [
                        "The fox leads you deeper into the forest, always staying just ahead. It stops at a clearing where an ancient oak stands, its trunk hollowed into a doorway. Warm light and the sound of music drift from within. The fox looks back at you expectantly.",
                        "You sit against a tree and wait. Hours pass. Then you notice the trees are slowly rearranging themselves. By dawn, an entirely new forest surrounds you — and in the center, a cottage with smoke rising from its chimney.",
                        "Every direction looks the same, but you press on. After what feels like hours, you find a stone marker with an inscription: \"Turn back while you still can.\" Below it, someone has scratched in fresher letters: \"Or follow the mushrooms in a circle. They know the way.\"",
                        "Your voice carries further than it should, and something answers — not in words, but in a melody that seems to come from everywhere at once. The forest parts slightly, revealing a path of glowing mushrooms that stretches into the distance."
                    ]
                };
            }
        }
    ];

    function generateAdventure(topic) {
        const adventureId = `TA-${Date.now().toString(36).toUpperCase()}`;
        const template = randomChoice(adventureTemplates);
        const adventure = template.generate(topic || 'the distant mountains');

        let output = `TEXT ADVENTURE\n`;
        output += `${'='.repeat(50)}\n`;
        output += `Title: ${template.title}\n`;
        output += `Setting: ${topic || 'Generic'}\n`;
        output += `ID: ${adventureId}\n`;
        output += `${'='.repeat(50)}\n\n`;

        output += `📖 INTRODUCTION\n`;
        output += `${'-'.repeat(40)}\n`;
        output += `${adventure.intro}\n\n`;

        output += `🎯 WHAT DO YOU DO?\n`;
        output += `${'-'.repeat(40)}\n`;
        adventure.choices.forEach((choice, i) => {
            output += `  ${i + 1}. ${choice}\n`;
        });

        output += `\n${'-'.repeat(40)}\n`;
        output += `OUTCOMES (for Game Master):\n`;
        output += `${'-'.repeat(40)}\n`;
        adventure.outcomes.forEach((outcome, i) => {
            output += `\nIf player chooses ${i + 1}:\n`;
            output += `${outcome}\n`;
        });

        output += `\n${'='.repeat(50)}\n`;
        output += `Adventure ID: ${adventureId}\n`;
        output += `End of Text Adventure - ${adventureId}\n`;

        return output;
    }

    function calculate() {
        const input = inputEl.value.trim();
        try {
            outputEl.textContent = generateAdventure(input);
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
