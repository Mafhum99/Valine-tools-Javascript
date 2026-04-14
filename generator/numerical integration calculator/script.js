// ============================================================
// Numerical Integration Calculator – Full Script
// ============================================================

// ===================== DOM HELPERS =====================
function $(selector, ctx = document) { return ctx.querySelector(selector); }
function $$(selector, ctx = document) { return [...ctx.querySelectorAll(selector)]; }
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v;
    else if (k === 'textContent') e.textContent = v;
    else if (k === 'innerHTML') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else e.setAttribute(k, v);
  }
  for (const c of (Array.isArray(children) ? children : [children])) {
    if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return e;
}

// ===================== STORAGE =====================
const Storage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} },
};

// ===================== CLIPBOARD =====================
const Clipboard = {
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      Toast.show('Copied to clipboard');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
      Toast.show('Copied to clipboard');
    }
  }
};

// ===================== TOAST =====================
const Toast = {
  container: null,
  init() {
    if (this.container) return;
    this.container = el('div', { id: 'toast-container', style: 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;' });
    document.body.appendChild(this.container);
  },
  show(msg, type = 'info') {
    this.init();
    const colors = { info: '#3b82f6', success: '#22c55e', error: '#ef4444', warning: '#f59e0b' };
    const t = el('div', { style: `padding:12px 20px;border-radius:8px;background:${colors[type]};color:#fff;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,.2);opacity:0;transform:translateX(40px);transition:all .3s;`, textContent: msg });
    this.container.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(0)'; });
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; setTimeout(() => t.remove(), 300); }, 3000);
  }
};

// ===================== NUMBER FORMATTING =====================
function fmt(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(n)) return 'N/A';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
function fmtSci(n, decimals = 4) {
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(decimals);
  return fmt(n, decimals);
}
function parseNum(s) { const n = parseFloat(String(s).replace(/,/g, '')); return isNaN(n) ? null : n; }

// ===================== MATH UTILITIES =====================
const MathUtils = {
  lerp(a, b, t) { return a + (b - a) * t; },
  clamp(v, min, max) { return Math.max(min, Math.min(max, v)); },
  map(v, inMin, inMax, outMin, outMax) { return outMin + (v - inMin) * (outMax - outMin) / (inMax - inMin); },
  mean(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0; },
  median(arr) { const s = [...arr].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; },
  stdDev(arr) { const m = this.mean(arr); return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length); },
  gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { [a, b] = [b, a % b]; } return a; },
  lcm(a, b) { return a && b ? Math.abs(a * b) / this.gcd(a, b) : 0; },
  factorial(n) { if (n < 0) return NaN; if (n <= 1) return 1; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; },
  combination(n, k) { if (k < 0 || k > n) return 0; return this.factorial(n) / (this.factorial(k) * this.factorial(n - k)); },
  permutation(n, k) { if (k < 0 || k > n) return 0; return this.factorial(n) / this.factorial(n - k); },
  isPrime(n) { if (n < 2) return false; for (let i = 2; i <= Math.sqrt(n); i++) { if (n % i === 0) return false; } return true; },
  roundTo(n, d = 0) { const f = 10 ** d; return Math.round(n * f) / f; },
};

// ===================== STRING UTILITIES =====================
const StringUtils = {
  camelCase(s) { return s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : ''); },
  kebabCase(s) { return s.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/[\s_]+/g, '-').replace(/-+/g, '-'); },
  capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
  truncate(s, len = 100, end = '...') { return s.length > len ? s.slice(0, len - end.length) + end : s; },
  slugify(s) { return s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-'); },
  escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); },
};

// ===================== DATE UTILITIES =====================
const DateUtils = {
  format(d, fmtStr = 'YYYY-MM-DD') {
    const dt = new Date(d);
    const map = { 'YYYY': dt.getFullYear(), 'YY': String(dt.getFullYear()).slice(-2), 'MM': String(dt.getMonth() + 1).padStart(2, '0'), 'DD': String(dt.getDate()).padStart(2, '0'), 'HH': String(dt.getHours()).padStart(2, '0'), 'mm': String(dt.getMinutes()).padStart(2, '0'), 'ss': String(dt.getSeconds()).padStart(2, '0') };
    return fmtStr.replace(/YYYY|YY|MM|DD|HH|mm|ss/g, m => map[m] ?? m);
  },
  diff(d1, d2, unit = 'days') {
    const ms = Math.abs(new Date(d2) - new Date(d1));
    const factors = { ms: 1, seconds: 1000, minutes: 60000, hours: 3600000, days: 86400000, weeks: 604800000, months: 2592000000, years: 31536000000 };
    return ms / (factors[unit] || 1);
  },
  addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; },
  isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; },
};

// ===================== COLOR UTILITIES =====================
const ColorUtils = {
  hexToRgb(hex) { hex = hex.replace('#', ''); return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) }; },
  rgbToHex(r, g, b) { return '#' + [r, g, b].map(c => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, '0')).join(''); },
  hexToHsl(hex) { let { r, g, b } = this.hexToRgb(hex); r /= 255; g /= 255; b /= 255; const max = Math.max(r, g, b), min = Math.min(r, g, b); let h, s, l = (max + min) / 2; if (max === min) { h = s = 0; } else { const d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min); switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; } } return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }; },
  hslToHex(h, s, l) { h /= 360; s /= 100; l /= 100; let r, g, b; if (s === 0) { r = g = b = l; } else { const hue2rgb = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; }; const q = l < .5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q; r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3); } return this.rgbToHex(r * 255, g * 255, b * 255); },
};

// ===================== RANDOM UTILITIES =====================
const RandomUtils = {
  int(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  float(min, max) { return Math.random() * (max - min) + min; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },
  shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16); }); },
  seed(seed) { let s = seed; return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }; },
};

// ===================== DEBOUNCE / THROTTLE =====================
function debounce(fn, delay = 300) {
  let timer;
  return function (...args) { clearTimeout(timer); timer = setTimeout(() => fn.apply(this, args), delay); };
}
function throttle(fn, limit = 300) {
  let inThrottle;
  return function (...args) { if (!inThrottle) { fn.apply(this, args); inThrottle = true; setTimeout(() => inThrottle = false, limit); } };
}

// ===================== VALIDATION =====================
const Validation = {
  required(v) { return v !== null && v !== undefined && String(v).trim() !== ''; },
  isNumber(v) { return v !== '' && !isNaN(parseFloat(v)); },
  isPositive(v) { return this.isNumber(v) && parseFloat(v) > 0; },
  isNonNegative(v) { return this.isNumber(v) && parseFloat(v) >= 0; },
  isInteger(v) { return this.isNumber(v) && Number.isInteger(parseFloat(v)); },
  min(v, m) { return this.isNumber(v) && parseFloat(v) >= m; },
  max(v, m) { return this.isNumber(v) && parseFloat(v) <= m; },
  range(v, min, max) { return this.isNumber(v) && parseFloat(v) >= min && parseFloat(v) <= max; },
};

// ===================== INIT TOOL =====================
function initTool(toolId) {
  document.documentElement.setAttribute('data-tool', toolId);
  console.log(`[Tool] Initialized: ${toolId}`);
}

// ============================================================
// NUMERICAL INTEGRATION – Tool-Specific Logic
// ============================================================

/**
 * Safely evaluate a mathematical expression string for a given x.
 * Supports: +, -, *, /, ^, sin, cos, tan, asin, acos, atan, sqrt, abs, log, ln, exp, pi, e
 */
function evaluateFx(expr, xVal) {
  let s = expr;
  // Replace common math constants
  s = s.replace(/\bpi\b/gi, String(Math.PI));
  s = s.replace(/\be\b/g, String(Math.E));
  // Replace common math functions
  const replacements = {
    'sin': 'Math.sin', 'cos': 'Math.cos', 'tan': 'Math.tan',
    'asin': 'Math.asin', 'acos': 'Math.acos', 'atan': 'Math.atan',
    'sqrt': 'Math.sqrt', 'abs': 'Math.abs', 'log': 'Math.log10',
    'ln': 'Math.log', 'exp': 'Math.exp', 'floor': 'Math.floor',
    'ceil': 'Math.ceil', 'round': 'Math.round', 'pow': 'Math.pow',
    'sign': 'Math.sign', 'max': 'Math.max', 'min': 'Math.min'
  };
  for (const [fn, repl] of Object.entries(replacements)) {
    // Word-boundary replacement to avoid replacing partial matches
    const re = new RegExp(`\\b${fn}\\b`, 'g');
    s = s.replace(re, repl);
  }
  // Replace ^ with **
  s = s.replace(/\^/g, '**');
  // Replace implicit multiplication: 2x -> 2*x, x3 -> x*3
  s = s.replace(/(\d)([a-zA-Z])/g, '$1*$2');
  s = s.replace(/([a-zA-Z])(\d)/g, '$1*$2');
  // Replace x with the value
  s = s.replace(/\bx\b/g, `(${xVal})`);

  try {
    // Use Function constructor for evaluation (safer than eval, but still limited)
    const result = new Function('return ' + s)();
    if (typeof result !== 'number' || !isFinite(result)) {
      return NaN;
    }
    return result;
  } catch {
    return NaN;
  }
}

function validateInputs() {
  const fxExpr = $('#int-fx')?.value?.trim();
  const aVal = parseNum($('#int-a')?.value);
  const bVal = parseNum($('#int-b')?.value);
  const nVal = parseNum($('#int-n')?.value);
  const method = $('#int-method')?.value;

  if (!fxExpr) { Toast.show('Enter a function f(x)', 'error'); return null; }
  if (aVal === null) { Toast.show('Enter lower bound a', 'error'); return null; }
  if (bVal === null) { Toast.show('Enter upper bound b', 'error'); return null; }
  if (aVal >= bVal) { Toast.show('Lower bound a must be less than upper bound b', 'error'); return null; }
  if (nVal === null || !Number.isInteger(nVal)) { Toast.show('Enter a valid integer for n', 'error'); return null; }
  if (nVal < 2) { Toast.show('Number of segments n must be at least 2', 'error'); return null; }
  if (method === 'simpson' && nVal % 2 !== 0) { Toast.show('Simpson\'s Rule requires an even number of segments', 'error'); return null; }

  return { fxExpr, a: aVal, b: bVal, n: nVal, method };
}

function trapezoidalRule(fxExpr, a, b, n) {
  const h = (b - a) / n;
  let sum = evaluateFx(fxExpr, a) + evaluateFx(fxExpr, b);
  for (let i = 1; i < n; i++) {
    const xi = a + i * h;
    const fxVal = evaluateFx(fxExpr, xi);
    if (isNaN(fxVal)) { Toast.show('Invalid function evaluation at x=' + fmt(xi, 4), 'error'); return NaN; }
    sum += 2 * fxVal;
  }
  return (h / 2) * sum;
}

function simpsonsRule(fxExpr, a, b, n) {
  const h = (b - a) / n;
  let sum = evaluateFx(fxExpr, a) + evaluateFx(fxExpr, b);
  for (let i = 1; i < n; i++) {
    const xi = a + i * h;
    const fxVal = evaluateFx(fxExpr, xi);
    if (isNaN(fxVal)) { Toast.show('Invalid function evaluation at x=' + fmt(xi, 4), 'error'); return NaN; }
    sum += (i % 2 === 0 ? 2 : 4) * fxVal;
  }
  return (h / 3) * sum;
}

function calculate() {
  const inputs = validateInputs();
  if (!inputs) return;

  const { fxExpr, a, b, n, method } = inputs;
  let result;

  if (method === 'trapezoidal') {
    result = trapezoidalRule(fxExpr, a, b, n);
  } else {
    result = simpsonsRule(fxExpr, a, b, n);
  }

  if (isNaN(result)) {
    Toast.show('Calculation resulted in NaN. Check your function expression.', 'error');
    return;
  }

  const resultContainer = $('#int-result');
  if (!resultContainer) return;

  const methodName = method === 'simpson' ? "Simpson's Rule" : 'Trapezoidal Rule';

  // Build step table
  const h = (b - a) / n;
  let tableRows = `<tr><th>i</th><th>xᵢ</th><th>f(xᵢ)</th><th>Weight</th><th>Weighted</th></tr>`;
  for (let i = 0; i <= n; i++) {
    const xi = a + i * h;
    const fxi = evaluateFx(fxExpr, xi);
    let weight;
    if (method === 'trapezoidal') {
      weight = (i === 0 || i === n) ? 1 : 2;
    } else {
      weight = (i === 0 || i === n) ? 1 : (i % 2 === 0 ? 2 : 4);
    }
    const cls = (i === 0 || i === n) ? 'class="endpoint"' : '';
    tableRows += `<tr ${cls}><td>${i}</td><td>${fmt(xi, 6)}</td><td>${fmt(fxi, 6)}</td><td>${weight}</td><td>${fmt(weight * fxi, 6)}</td></tr>`;
  }

  resultContainer.innerHTML = `
    <div class="int-result">
      <div class="result-card">
        <div class="label">Method</div>
        <div class="value">${methodName}</div>
      </div>
      <div class="result-card integral-value">
        <div class="label">Result: ∫ f(x) dx</div>
        <div class="value">${fmt(result, 8)}</div>
        <div class="value-sci">${fmtSci(result, 6)}</div>
      </div>
      <div class="params">
        <span>a = ${fmt(a, 6)}</span>
        <span>b = ${fmt(b, 6)}</span>
        <span>n = ${n}</span>
        <span>h = ${fmt(h, 8)}</span>
      </div>
      <div class="detail-table-wrapper">
        <h3>Step Table</h3>
        <div class="table-scroll"><table class="int-table">${tableRows}</table></div>
      </div>
      <div class="copy-actions">
        <button class="btn-copy" data-action="copy-result">Copy Result</button>
      </div>
    </div>
  `;

  resultContainer.querySelector('[data-action="copy-result"]')?.addEventListener('click', () => {
    Clipboard.copy(`Integral of ${fxExpr} from ${a} to ${b} using ${methodName} (n=${n}): ${result}`);
  });

  Storage.set('int-last', { fxExpr, a, b, n, method, result });
}

function clearAll() {
  const fx = $('#int-fx');
  const a = $('#int-a');
  const b = $('#int-b');
  const n = $('#int-n');
  const resultContainer = $('#int-result');
  if (fx) fx.value = '';
  if (a) a.value = '';
  if (b) b.value = '';
  if (n) n.value = '';
  if (resultContainer) resultContainer.innerHTML = '';
  Storage.remove('int-last');
}

function loadSaved() {
  const saved = Storage.get('int-last');
  if (!saved) return;
  if (saved.fxExpr && $('#int-fx')) $('#int-fx').value = saved.fxExpr;
  if (saved.a !== undefined && $('#int-a')) $('#int-a').value = saved.a;
  if (saved.b !== undefined && $('#int-b')) $('#int-b').value = saved.b;
  if (saved.n !== undefined && $('#int-n')) $('#int-n').value = saved.n;
  if (saved.method && $('#int-method')) $('#int-method').value = saved.method;
}

// ===================== BOOTSTRAP =====================
document.addEventListener('DOMContentLoaded', () => {
  initTool('numerical-integration');
  Toast.init();
  loadSaved();

  $('#int-calculate')?.addEventListener('click', calculate);
  $('#int-clear')?.addEventListener('click', clearAll);

  // Auto-calc on input
  for (const id of ['#int-fx', '#int-a', '#int-b', '#int-n']) {
    $(id)?.addEventListener('input', debounce(calculate, 300));
  }
  $('#int-method')?.addEventListener('change', debounce(calculate, 300));
});
