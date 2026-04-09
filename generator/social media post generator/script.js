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
 * Social Media Post Generator
 * Generate social media post content
 */

// Initialize tool
document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Social Media Post Generator', icon: '\uD83D\uDCF1' });

    // Get elements
    const topicEl = $('#topic');
    const platformEl = $('#platform');
    const postToneEl = $('#post-tone');
    const outputEl = $('#output');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function generatePosts(topic, platform, tone) {
        const posts = [];

        switch (platform) {
            case 'facebook':
                switch (tone) {
                    case 'professional':
                        posts.push(
                            "We're excited to share an update about " + topic + ". Our team has been working hard to bring you something special. Stay tuned for more details in the coming days. Thank you for your continued support!"
                        );
                        posts.push(
                            "Important announcement regarding " + topic + ". We believe this will bring significant value to our community. We'd love to hear your thoughts - leave a comment below and let us know what you think."
                        );
                        posts.push(
                            "Big things happening! We're focusing on " + topic + " and could not be more thrilled. This journey has been incredible, and we're just getting started. Follow along as we share more updates soon."
                        );
                        break;
                    case 'casual':
                        posts.push(
                            "Hey friends! Just wanted to share something awesome - " + topic + " is happening and it's going to be amazing! Who else is excited? Drop a reaction below! \uD83D\uDE4C"
                        );
                        posts.push(
                            "So we've been keeping a little secret about " + topic + "... and we can finally share it! This is one of those moments that makes everything worth it. Tell us what you think! \uD83D\uDE0A"
                        );
                        posts.push(
                            "Real talk - " + topic + " has been on our minds lately and for good reason. We think you're going to love what's coming. Tag someone who needs to see this! \u2764\uFE0F"
                        );
                        break;
                    case 'promotional':
                        posts.push(
                            "\uD83D\uDEA8 Don't miss out on " + topic + "! This is your chance to be part of something incredible. Act now - opportunities like this don't come around often. Click the link in our bio to learn more!"
                        );
                        posts.push(
                            "\u2B50 LIMITED OPPORTUNITY: " + topic + " is here and demand is high! Secure your spot today before it's too late. We're offering exclusive benefits for early adopters. DM us for details!"
                        );
                        posts.push(
                            "\uD83C\uDF89 ANNOUNCEMENT: " + topic + " is officially live! Be among the first to experience this game-changer. Share this post with someone who needs to know! \uD83D\uDE80"
                        );
                        break;
                    case 'humorous':
                        posts.push(
                            "Me before " + topic + ": 'This won't be that big of a deal.' Me after " + topic + ": 'HOW DID I LIVE WITHOUT THIS?!' \uD83D\uDE02 Who else can relate? Tag a friend who needs to hear this!"
                        );
                        posts.push(
                            "Breaking: Local [person/group] discovers " + topic + ". More at 11. \uD83D\uDCF0 But seriously, this is actually pretty incredible and you should definitely check it out. No jokes (okay, maybe a little)."
                        );
                        posts.push(
                            "My boss said I can't post about " + topic + " anymore. So naturally, here I am posting about " + topic + ". \uD83E\uDD2B What's the best thing you've learned about this topic lately?"
                        );
                        break;
                    default:
                        posts.push("Learn more about " + topic + ". Share your thoughts below!");
                }
                break;

            case 'instagram':
                switch (tone) {
                    case 'professional':
                        posts.push(
                            "Excellence in action: " + topic + ". Every detail matters, every moment counts. Here's to pushing boundaries and setting new standards. \u2728\n.\n.\n.\n#excellence #innovation #growth #professional #motivation"
                        );
                        posts.push(
                            "Behind every great achievement is dedication. " + topic + " represents months of hard work and passion. Swipe to see the journey. \uD83D\uDCCA\n.\n.\n.\n#dedication #journey #success #goals #inspiration"
                        );
                        posts.push(
                            "Setting new benchmarks with " + topic + ". When vision meets execution, extraordinary things happen. Double tap if you agree. \uD83D\uDCAF\n.\n.\n.\n#benchmarks #vision #extraordinary #leadership"
                        );
                        break;
                    case 'casual':
                        posts.push(
                            "Living for moments like this \u2728 " + topic + " has me feeling all the good vibes right now \uD83D\uDC95 Who else is here for it?\n.\n.\n.\n#goodvibes #lifestyle #happy #blessed #vibes"
                        );
                        posts.push(
                            "Storytime: I never expected " + topic + " to be such a game changer, but here we are \uD83D\uDE4C Save this post for later!\n.\n.\n.\n#storytime #gamechanger #lifestyle #mustsee #trending"
                        );
                        posts.push(
                            "Current mood: obsessed with " + topic + " \uD83D\uDE0D Drop a \u2764\uFE0F if you feel the same!\n.\n.\n.\n#obsessed #currentmood #loveit #trending #mustsee"
                        );
                        break;
                    case 'promotional':
                        posts.push(
                            "\uD83D\uDD25 This is your sign to check out " + topic + " right now! Link in bio - don't wait! \u23F0\n.\n.\n.\n#linkinbio #musthave #trending #popular #dontmissout"
                        );
                        posts.push(
                            "\u2B50 You've been asking about it, and we're finally delivering! " + topic + " is available NOW. Tap the link in our profile! \uD83D\uDE80\n.\n.\n.\n#available #newrelease #getyours #exclusive"
                        );
                        posts.push(
                            "This is NOT a drill! \uD83D\uDEA8 " + topic + " is officially here and it's everything you've been waiting for. Share this with your squad! \uD83D\uDC47\n.\n.\n.\n#launch #bignews #exciting #share"
                        );
                        break;
                    case 'humorous':
                        posts.push(
                            "Nobody:\nAbsolutely nobody:\nMe talking about " + topic + " for the 100th time today: \uD83C\uDFA4\uD83C\uDFA4\uD83C\uDFA4\n.\n.\n.\n#relatable #funny #humor #cantstop #obsessed"
                        );
                        posts.push(
                            "POV: You just discovered " + topic + " and now you can't stop talking about it \uD83D\uDE02 Tag your most obsessed friend!\n.\n.\n.\n#pov #relatable #funny #truth #cantrelate"
                        );
                        posts.push(
                            "My screen time report after researching " + topic + ": \uD83D\uDCC8 'You spent 4 hours on this today.' Worth it. \uD83D\uDE05\n.\n.\n.\n#screentime #worth #funny #relatable #nores"
                        );
                        break;
                    default:
                        posts.push("Check out " + topic + "! #trending #viral");
                }
                break;

            case 'twitter':
                switch (tone) {
                    case 'professional':
                        posts.push(
                            "Key insight on " + topic + ": The future belongs to those who prepare for it today. Organizations that invest in innovation and adaptability will lead the next decade. What's your strategy?"
                        );
                        posts.push(
                            "Regarding " + topic + ": Data shows that companies embracing this approach see 3x better outcomes. The evidence is clear - adaptation is not optional. Time to act."
                        );
                        posts.push(
                            "Unpopular opinion: " + topic + " isn't just a trend, it's a fundamental shift in how we think about the industry. Those who recognize this early will have a massive advantage."
                        );
                        break;
                    case 'casual':
                        posts.push(
                            "Okay but can we talk about " + topic + " for a second? This is genuinely one of the most interesting things I've come across this week. Change my mind."
                        );
                        posts.push(
                            "Just discovered something amazing about " + topic + " and I need to share it with everyone immediately. You're welcome, internet."
                        );
                        posts.push(
                            "Not me getting way too excited about " + topic + " at 2am \uD83D\uDE02 But seriously, have you looked into this? It's actually incredible."
                        );
                        break;
                    case 'promotional':
                        posts.push(
                            "\uD83D\uDEA8 " + topic + " is live RIGHT NOW. This is not a drill. Get in early before everyone else catches on. Link below \uD83D\uDC47"
                        );
                        posts.push(
                            "If you're not paying attention to " + topic + ", you're already behind. Here's your chance to get ahead: [link] Don't say I didn't warn you."
                        );
                        posts.push(
                            "We just launched something huge. " + topic + " is here and it's going to change everything. RT to spread the word! \uD83D\uDD25"
                        );
                        break;
                    case 'humorous':
                        posts.push(
                            "My personality now: 10% me, 90% thinking about " + topic + ". Send help. Or don't. I'm kind of enjoying it honestly."
                        );
                        posts.push(
                            "Me: I should probably sleep\nAlso me at 2am: researching " + topic + " like my life depends on it\n\nEvery. Single. Time."
                        );
                        posts.push(
                            "I've mentioned " + topic + " in 3 conversations today and we're only at noon. This is going great. \uD83D\uDE02"
                        );
                        break;
                    default:
                        posts.push("Thoughts on " + topic + "? Share below.");
                }
                break;

            case 'linkedin':
                switch (tone) {
                    case 'professional':
                        posts.push(
                            "I want to share some thoughts on " + topic + " that I believe deserve more attention in our industry.\n\nAfter extensive research and analysis, several key points have emerged that could shape the future of how we work:\n\n1. The impact is more significant than most realize\n2. Early adopters are already seeing measurable results\n3. The window for competitive advantage is narrowing\n\nI'd love to hear perspectives from my network. How are you approaching this?\n\n#" + topic.replace(/\s+/g, '') + " #Industry #Leadership #Innovation"
                        );
                        posts.push(
                            "The conversation around " + topic + " is evolving rapidly. Here's what I've learned from industry leaders and recent studies:\n\nThe organizations winning in this space share three common traits: strategic vision, agile execution, and a commitment to continuous learning.\n\nWhat trends are you seeing in your organizations? Let's discuss in the comments.\n\n#" + topic.replace(/\s+/g, '') + " #Strategy #Growth #Professional"
                        );
                        posts.push(
                            "A lesson I've learned throughout my career that applies directly to " + topic + ":\n\nSuccess rarely comes from following the crowd. The most impactful professionals are those who identify emerging trends early and take calculated risks.\n\n" + topic + " is one of those areas where being early matters. Here's my take on why...\n\n#" + topic.replace(/\s+/g, '') + " #CareerAdvice #ThoughtLeadership"
                        );
                        break;
                    case 'casual':
                        posts.push(
                            "Hot take: " + topic + " is going to be much bigger than most people expect.\n\nI know that sounds bold, but hear me out. The signals are all there if you know where to look.\n\nWould love to get a discussion going - am I onto something here or completely off base?\n\n#" + topic.replace(/\s+/g, '') + " #Discussion #Industry"
                        );
                        posts.push(
                            "I'll be honest - I underestimated " + topic + " at first. Then I actually took the time to understand it.\n\nNow I think it's one of the most important developments in our space. Sometimes the best insights come from admitting you were wrong initially.\n\nWhat's something you changed your mind about recently?\n\n#" + topic.replace(/\s+/g, '') + " #Learning #Growth"
                        );
                        posts.push(
                            "Real talk about " + topic + ":\n\nThere's a lot of noise out there. Here's what actually matters:\n\n\u2705 Focus on fundamentals\n\u2705 Stay curious and keep learning\n\u2705 Build genuine relationships in this space\n\nEverything else is just distraction.\n\n#" + topic.replace(/\s+/g, '') + " #Authentic #RealTalk"
                        );
                        break;
                    case 'promotional':
                        posts.push(
                            "I'm thrilled to announce something we've been working on: " + topic + ".\n\nThis project represents months of dedicated effort from our team, and I'm incredibly proud of what we've built.\n\nHere's what makes it different:\n\n\u2022 Designed with real user needs in mind\n\u2022 Built on proven methodologies\n\u2022 Focused on delivering measurable value\n\nIf this aligns with your interests, I'd love for you to check it out. Link in the comments.\n\n#" + topic.replace(/\s+/g, '') + " #Launch #Announcement"
                        );
                        posts.push(
                            "Big news: " + topic + " is now available, and the early feedback has been overwhelming.\n\nThank you to everyone who has supported us on this journey. We built this because we saw a genuine need in the market, and the response confirms we're on the right track.\n\nFor those interested in learning more, I've shared additional details in the comments.\n\n#" + topic.replace(/\s+/g, '') + " #Milestone #Business"
                        );
                        posts.push(
                            "After countless conversations with industry professionals, we identified a clear gap in the market.\n\nThat's why we created " + topic + " - to solve a real problem that affects professionals daily.\n\nThe response has been phenomenal, and we're just getting started.\n\nInterested parties can find more information below. I'm happy to answer any questions in the comments.\n\n#" + topic.replace(/\s+/g, '') + " #Solution #Professional"
                        );
                        break;
                    case 'humorous':
                        posts.push(
                            "Confession: I've spent more time researching " + topic + " this week than I'd like to admit.\n\nBut here's the thing - when you're genuinely excited about something in our industry, the line between 'work' and 'interest' blurs. And I think that's a good problem to have.\n\nWhat industry topic has you hooked right now?\n\n#" + topic.replace(/\s+/g, '') + " #Confession #Industry"
                        );
                        posts.push(
                            "My LinkedIn feed right now:\n\n\u2022 5 posts about AI\n\u2022 3 posts about remote work\n\u2022 12 posts about " + topic + "\n\nAnd you know what? I'm here for it. This is the kind of content that makes my feed worth scrolling through.\n\nWhat's flooding your timeline lately?\n\n#" + topic.replace(/\s+/g, '') + " #LinkedIn #Trends"
                        );
                        posts.push(
                            "Plot twist: The most productive thing I've done this week is deep-dive into " + topic + ".\n\nSometimes the best professional development comes from following genuine curiosity rather than checking boxes.\n\nAgree or disagree?\n\n#" + topic.replace(/\s+/g, '') + " #Productivity #Curiosity"
                        );
                        break;
                    default:
                        posts.push("Professional insight on " + topic + ". Share your perspective.");
                }
                break;

            default:
                posts.push("Check out " + topic + "!");
        }

        return posts;
    }

    function generatePostsFn() {
        const topic = topicEl.value.trim();
        const platform = platformEl.value;
        const tone = postToneEl.value;

        if (!topic) {
            outputEl.textContent = 'Please enter a topic.';
            return;
        }

        try {
            const posts = generatePosts(topic, platform, tone);

            let result = 'SOCIAL MEDIA POSTS\n';
            result += 'Platform: ' + platform.charAt(0).toUpperCase() + platform.slice(1) + '\n';
            result += 'Tone: ' + tone.charAt(0).toUpperCase() + tone.slice(1) + '\n';
            result += '='.repeat(50) + '\n\n';

            posts.forEach((post, idx) => {
                result += 'Option ' + (idx + 1) + ':\n';
                result += '-'.repeat(30) + '\n';
                result += post + '\n\n';
                result += '='.repeat(50) + '\n\n';
            });

            result += 'Tip: Customize these posts with your specific details, links, and call-to-action.';

            outputEl.textContent = result;
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    // Clear function
    function clear() {
        topicEl.value = '';
        outputEl.textContent = '-';
        topicEl.focus();
    }

    // Event listeners
    generateBtn.addEventListener('click', generatePostsFn);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(outputEl.textContent);
        });
    }

    // Enter key support
    topicEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') generatePostsFn();
    });
});
