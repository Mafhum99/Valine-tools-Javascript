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
 * QR Code Generator
 * Generate QR codes from text or URLs
 * Implements QR Code generation with canvas rendering
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'QR Code Generator', icon: '\uD83D\uDCF1' });

    const inputEl = $('#input');
    const sizeEl = $('#size');
    const outputEl = $('#output');
    const canvas = $('#qr-canvas');
    const ctx = canvas.getContext('2d');
    const generateBtn = $('#generate');
    const clearBtn = $('#clear');
    const downloadBtn = $('#download');

    // QR Code implementation
    const QRCode = (function() {
        // Error correction code words per block for version 1-10, EC level M
        const EC_CODEWORDS_PER_BLOCK = {
            M: [0, 16, 26, 36, 44, 56, 68, 80, 96, 104, 120]
        };

        // Data codewords per block for version 1-10, EC level M
        const DATA_CODEWORDS_PER_BLOCK = {
            M: [0, 20, 32, 44, 60, 76, 92, 112, 132, 152, 176]
        };

        // Alignment pattern locations for version 2-10
        const ALIGNMENT_PATTERN_LOCATIONS = {
            2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34],
            7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50]
        };

        // Galois field log/exp tables for GF(256) with primitive polynomial 285
        const GF256 = {
            exp: new Array(256),
            log: new Array(256)
        };

        (function initGF256() {
            let x = 1;
            for (let i = 0; i < 255; i++) {
                GF256.exp[i] = x;
                GF256.log[x] = i;
                x = (x << 1) ^ (x >= 128 ? 285 : 0);
            }
            GF256.exp[255] = GF256.exp[0];
            GF256.log[0] = 0;
        })();

        function gfMul(a, b) {
            if (a === 0 || b === 0) return 0;
            return GF256.exp[(GF256.log[a] + GF256.log[b]) % 255];
        }

        function rsGenPoly(nsym) {
            let g = [1];
            for (let i = 0; i < nsym; i++) {
                let ng = new Array(g.length + 1).fill(0);
                for (let j = 0; j < g.length; j++) {
                    ng[j] ^= g[j];
                    ng[j + 1] ^= gfMul(g[j], GF256.exp[i]);
                }
                g = ng;
            }
            return g;
        }

        function rsEncode(data, nsym) {
            const gen = rsGenPoly(nsym);
            const res = [...data, ...new Array(nsym).fill(0)];

            for (let i = 0; i < data.length; i++) {
                const coef = res[i];
                if (coef !== 0) {
                    for (let j = 0; j < gen.length; j++) {
                        res[i + j] ^= gfMul(gen[j], coef);
                    }
                }
            }

            return res.slice(data.length);
        }

        // Determine QR version based on data length
        function getVersion(dataLen) {
            for (let v = 1; v <= 10; v++) {
                const capacity = DATA_CODEWORDS_PER_BLOCK.M[v];
                // Byte mode: 4 bit mode indicator + char count bits + data
                const charCountBits = v <= 9 ? 8 : 16;
                const maxDataBytes = capacity - 1 - Math.ceil(charCountBits / 8) - 1;
                if (dataLen <= maxDataBytes) return v;
            }
            return -1; // Too much data
        }

        // Encode data into QR matrix
        function generate(text) {
            const data = new TextEncoder().encode(text);
            const version = getVersion(data.length);

            if (version < 1) {
                throw new Error('Data too long for QR code');
            }

            const size = version * 4 + 17;
            const matrix = Array.from({ length: size }, () => Array(size).fill(null));
            const reserved = Array.from({ length: size }, () => Array(size).fill(false));

            // Place finder patterns
            function placeFinderPattern(row, col) {
                for (let r = -1; r <= 7; r++) {
                    for (let c = -1; c <= 7; c++) {
                        const mr = row + r, mc = col + c;
                        if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
                        if ((r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
                            (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                            matrix[mr][mc] = 1;
                        } else {
                            matrix[mr][mc] = 0;
                        }
                        reserved[mr][mc] = true;
                    }
                }
            }

            placeFinderPattern(0, 0);
            placeFinderPattern(0, size - 7);
            placeFinderPattern(size - 7, 0);

            // Place alignment patterns
            if (version >= 2) {
                const positions = ALIGNMENT_PATTERN_LOCATIONS[version];
                for (const r of positions) {
                    for (const c of positions) {
                        if (reserved[r] && reserved[r][c]) continue;
                        if (r < 9 && c < 9) continue;
                        if (r < 9 && c > size - 9) continue;
                        if (r > size - 9 && c < 9) continue;
                        for (let dr = -2; dr <= 2; dr++) {
                            for (let dc = -2; dc <= 2; dc++) {
                                matrix[r + dr][c + dc] = (Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0)) ? 1 : 0;
                                reserved[r + dr][c + dc] = true;
                            }
                        }
                    }
                }
            }

            // Place timing patterns
            for (let i = 8; i < size - 8; i++) {
                if (!reserved[6][i]) {
                    matrix[6][i] = i % 2 === 0 ? 1 : 0;
                    reserved[6][i] = true;
                }
                if (!reserved[i][6]) {
                    matrix[i][6] = i % 2 === 0 ? 1 : 0;
                    reserved[i][6] = true;
                }
            }

            // Reserve format info areas
            for (let i = 0; i < 8; i++) {
                reserved[8][i] = true;
                reserved[8][size - 1 - i] = true;
                reserved[i][8] = true;
                reserved[size - 1 - i][8] = true;
            }
            reserved[8][8] = true;

            // Dark module
            matrix[size - 8][8] = 1;
            reserved[size - 8][8] = true;

            // Reserve version info areas (for version >= 7)
            if (version >= 7) {
                for (let i = 0; i < 6; i++) {
                    for (let j = 0; j < 3; j++) {
                        reserved[i][size - 11 + j] = true;
                        reserved[size - 11 + j][i] = true;
                    }
                }
            }

            // Encode data
            const capacity = DATA_CODEWORDS_PER_BLOCK.M[version];
            const ecCodewords = EC_CODEWORDS_PER_BLOCK.M[version];
            const charCountBits = version <= 9 ? 8 : 16;

            // Build data bit string
            let bits = '0100'; // Byte mode indicator
            bits += data.length.toString(2).padStart(charCountBits, '0');
            for (const byte of data) {
                bits += byte.toString(2).padStart(8, '0');
            }

            // Terminator
            const maxBits = capacity * 8;
            bits += '0'.repeat(Math.min(4, maxBits - bits.length));
            // Pad to byte boundary
            bits += '0'.repeat((8 - (bits.length % 8)) % 8);

            // Pad codewords
            const padPatterns = ['11101100', '00010001'];
            let padIdx = 0;
            while (bits.length < maxBits) {
                bits += padPatterns[padIdx % 2];
                padIdx++;
            }

            // Convert bits to data codewords
            const dataCodewords = [];
            for (let i = 0; i < bits.length; i += 8) {
                dataCodewords.push(parseInt(bits.slice(i, i + 8), 2));
            }

            // Calculate EC codewords
            const ecCodewordsArr = rsEncode(dataCodewords, ecCodewords);

            // Combine all codewords
            const allCodewords = [...dataCodewords, ...ecCodewordsArr];

            // Convert to bit stream
            let dataBits = '';
            for (const cw of allCodewords) {
                dataBits += cw.toString(2).padStart(8, '0');
            }

            // Place data bits in matrix using zigzag pattern
            let bitIdx = 0;
            let upward = true;

            for (let right = size - 1; right >= 1; right -= 2) {
                if (right === 6) right = 5; // Skip timing pattern column

                for (let vert = 0; vert < size; vert++) {
                    const row = upward ? size - 1 - vert : vert;

                    for (let j = 0; j < 2; j++) {
                        const col = right - j;
                        if (col < 0 || col >= size) continue;
                        if (reserved[row][col]) continue;

                        if (bitIdx < dataBits.length) {
                            matrix[row][col] = dataBits[bitIdx] === '1' ? 1 : 0;
                            bitIdx++;
                        } else {
                            matrix[row][col] = 0;
                        }
                    }
                }
                upward = !upward;
            }

            // Apply mask pattern (pattern 0: (row + col) % 2 === 0)
            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    if (!reserved[r][c]) {
                        if ((r + c) % 2 === 0) {
                            matrix[r][c] = matrix[r][c] === 1 ? 0 : 1;
                        }
                    }
                }
            }

            // Place format info (EC level M = 01, mask 0 = 000)
            const formatData = 0b01 << 3 | 0; // EC level M (01) + mask 0 (000)
            const formatBits = [];
            let fb = formatData;
            for (let i = 0; i < 5; i++) {
                formatBits.unshift(fb & 1);
                fb >>= 1;
            }

            // BCH encoding for format info
            const formatBch = [
                0b010101000010010, 0b010101000010010,
                0b101010011110001, 0b101010011110001,
                0b001100110011100, 0b001100110011100,
                0b110011001101011, 0b110011001101011
            ];

            const formatBchCode = (function() {
                let data = formatData;
                let bch = data << 10;
                for (let i = 4; i >= 0; i--) {
                    if (bch & (1 << (i + 10))) {
                        bch ^= 0b10100110111 << i;
                    }
                }
                return ((data << 10) | bch) ^ 0b101010000010010;
            })();

            // Place format info bits
            const formatBitStr = formatBchCode.toString(2).padStart(15, '0');

            // Around top-left finder
            const formatPositions1 = [
                [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
                [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8]
            ];

            // Around other finders
            const formatPositions2 = [
                [size - 1, 8], [size - 2, 8], [size - 3, 8], [size - 4, 8],
                [size - 5, 8], [size - 6, 8], [size - 7, 8],
                [8, size - 8], [8, size - 7], [8, size - 6], [8, size - 5],
                [8, size - 4], [8, size - 3], [8, size - 2], [8, size - 1]
            ];

            for (let i = 0; i < 15; i++) {
                const bit = formatBitStr[i] === '1' ? 1 : 0;
                const [r1, c1] = formatPositions1[i];
                const [r2, c2] = formatPositions2[i];
                matrix[r1][c1] = bit;
                matrix[r2][c2] = bit;
            }

            return matrix;
        }

        return { generate };
    })();

    function generate() {
        const input = inputEl.value;
        if (!input.trim()) {
            showToast('Please enter text or a URL');
            return;
        }

        try {
            const matrix = QRCode.generate(input);
            const size = parseInt(sizeEl.value, 10) || 200;
            const modules = matrix.length;
            const scale = Math.floor(size / (modules + 8)); // 4 module padding on each side
            const canvasSize = scale * (modules + 8);

            canvas.width = canvasSize;
            canvas.height = canvasSize;

            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvasSize, canvasSize);

            ctx.fillStyle = '#000000';
            for (let r = 0; r < modules; r++) {
                for (let c = 0; c < modules; c++) {
                    if (matrix[r][c] === 1) {
                        ctx.fillRect(
                            (c + 4) * scale,
                            (r + 4) * scale,
                            scale,
                            scale
                        );
                    }
                }
            }

            outputEl.innerHTML = '<canvas id="qr-canvas"></canvas>';
        } catch (error) {
            outputEl.textContent = 'Error: ' + error.message;
        }
    }

    function clearFn() {
        inputEl.value = '';
        sizeEl.value = '200';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        outputEl.innerHTML = '<canvas id="qr-canvas"></canvas>';
        inputEl.focus();
    }

    generateBtn.addEventListener('click', generate);
    clearBtn.addEventListener('click', clearFn);

    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            if (canvas.width === 0) {
                showToast('Generate a QR code first');
                return;
            }
            const link = document.createElement('a');
            link.download = 'qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    }
});
