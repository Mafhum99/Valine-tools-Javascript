// ============================================================
// Normal Distribution Calculator – Full Script
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
function fmtPct(n, decimals = 2) { return fmt(n * 100, decimals) + '%'; }
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
// NORMAL DISTRIBUTION – Tool-Specific Logic
// ============================================================

/**
 * Error function approximation (Abramowitz & Stegun).
 * Accuracy: |error| < 1.5e-7
 */
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

/**
 * Standard normal CDF: Φ(z) = 0.5 * (1 + erf(z / √2))
 */
function stdNormalCDF(z) {
  return 0.5 * (1 + erf(z / Math.sqrt(2)));
}

/**
 * Normal PDF: f(x) = (1/(σ√(2π))) × exp(-(x-μ)²/(2σ²))
 */
function normalPDF(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);
}

/**
 * Normal CDF: F(x) = Φ((x-μ)/σ)
 */
function normalCDF(x, mu, sigma) {
  const z = (x - mu) / sigma;
  return stdNormalCDF(z);
}

/**
 * Inverse CDF (quantile function) for standard normal using Newton-Raphson.
 * Initial guess from rational approximation, refined via Newton's method.
 */
function inverseCDF(p) {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;
  // Rational approximation (Peter Acklam's algorithm)
  if (p < 0.5) {
    const t = Math.sqrt(-2 * Math.log(p));
    const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328;
    const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;
    let z = -(t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t));
    // Newton-Raphson refinement
    for (let i = 0; i < 5; i++) {
      const phi = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
      const err = stdNormalCDF(z) - p;
      z = z - err / phi;
    }
    return z;
  } else {
    const t = Math.sqrt(-2 * Math.log(1 - p));
    const c0 = 2.515517, c1 = 0.802853, c2 = 0.010328;
    const d1 = 1.432788, d2 = 0.189269, d3 = 0.001308;
    let z = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
    for (let i = 0; i < 5; i++) {
      const phi = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
      const err = stdNormalCDF(z) - p;
      z = z - err / phi;
    }
    return z;
  }
}

function zScore(x, mu, sigma) { return (x - mu) / sigma; }

function calculate() {
  const muInput = $('#norm-mu');
  const sigmaInput = $('#norm-sigma');
  const mode = $('#norm-mode')?.value;
  const resultContainer = $('#norm-result');

  if (!muInput || !sigmaInput || !resultContainer) return;

  const mu = parseNum(muInput.value);
  const sigma = parseNum(sigmaInput.value);

  if (mu === null) { Toast.show('Enter mean (μ)', 'error'); return; }
  if (sigma === null) { Toast.show('Enter standard deviation (σ)', 'error'); return; }
  if (sigma <= 0) { Toast.show('Standard deviation must be positive (σ > 0)', 'error'); return; }

  let resultHTML = '';
  let copyText = '';

  if (mode === 'pdf') {
    const xVal = parseNum($('#norm-x-pdf')?.value);
    if (xVal === null) { Toast.show('Enter value x', 'error'); return; }
    const pdf = normalPDF(xVal, mu, sigma);
    const z = zScore(xVal, mu, sigma);
    copyText = `Normal PDF: μ=${mu}, σ=${sigma}, x=${xVal}\nf(x) = ${fmtSci(pdf, 6)}, z = ${fmt(z, 4)}`;
    resultHTML = `
      <div class="result-card">
        <div class="label">PDF f(${xVal})</div>
        <div class="value">${fmtSci(pdf, 6)}</div>
      </div>
      <div class="result-card">
        <div class="label">Z-Score</div>
        <div class="value">z = ${fmt(z, 4)}</div>
      </div>
      <div class="formula-display">
        f(x) = 1/(σ√(2π)) × e^(-(x-μ)²/(2σ²))<br>
        = 1/(${sigma}√(2π)) × e^(-(${xVal}−${mu})²/(2×${sigma}²))<br>
        = <strong>${fmtSci(pdf, 6)}</strong>
      </div>
    `;
  } else if (mode === 'cdf') {
    const xVal = parseNum($('#norm-x-cdf')?.value);
    if (xVal === null) { Toast.show('Enter value x', 'error'); return; }
    const prob = normalCDF(xVal, mu, sigma);
    const z = zScore(xVal, mu, sigma);
    copyText = `Normal CDF: μ=${mu}, σ=${sigma}, x=${xVal}\nP(X ≤ ${xVal}) = ${fmtPct(prob, 4)}, z = ${fmt(z, 4)}`;
    resultHTML = `
      <div class="result-card">
        <div class="label">P(X ≤ ${xVal})</div>
        <div class="value">${fmtPct(prob, 4)}</div>
      </div>
      <div class="result-card">
        <div class="label">Z-Score</div>
        <div class="value">z = ${fmt(z, 4)}</div>
      </div>
      <div class="formula-display">
        P(X ≤ ${xVal}) = Φ(${fmt(z, 4)}) = ${fmtPct(prob, 4)}
      </div>
    `;
  } else if (mode === 'range') {
    const aVal = parseNum($('#norm-range-a')?.value);
    const bVal = parseNum($('#norm-range-b')?.value);
    if (aVal === null || bVal === null) { Toast.show('Enter both a and b', 'error'); return; }
    if (aVal >= bVal) { Toast.show('a must be less than b', 'error'); return; }
    const probA = normalCDF(aVal, mu, sigma);
    const probB = normalCDF(bVal, mu, sigma);
    const prob = probB - probA;
    const zA = zScore(aVal, mu, sigma);
    const zB = zScore(bVal, mu, sigma);
    copyText = `Normal Range: μ=${mu}, σ=${sigma}\nP(${aVal} < X < ${bVal}) = ${fmtPct(prob, 4)}, z₁=${fmt(zA, 4)}, z₂=${fmt(zB, 4)}`;
    resultHTML = `
      <div class="result-card">
        <div class="label">P(${aVal} < X < ${bVal})</div>
        <div class="value">${fmtPct(prob, 4)}</div>
      </div>
      <div class="result-card">
        <div class="label">Z-Scores</div>
        <div class="value">z₁ = ${fmt(zA, 4)}, z₂ = ${fmt(zB, 4)}</div>
      </div>
      <div class="formula-display">
        P(${aVal} < X < ${bVal}) = Φ(${fmt(zB, 4)}) − Φ(${fmt(zA, 4)}) = ${fmtPct(probB, 4)} − ${fmtPct(probA, 4)} = ${fmtPct(prob, 4)}
      </div>
    `;
  } else if (mode === 'inverse') {
    const pVal = parseNum($('#norm-p-inv')?.value);
    if (pVal === null) { Toast.show('Enter probability p', 'error'); return; }
    if (pVal <= 0 || pVal >= 1) { Toast.show('Probability p must be in (0, 1)', 'error'); return; }
    const z = inverseCDF(pVal);
    const xVal = mu + z * sigma;
    copyText = `Inverse CDF: μ=${mu}, σ=${sigma}, p=${pVal}\nx = ${fmt(xVal, 6)}, z = ${fmt(z, 4)}`;
    resultHTML = `
      <div class="result-card">
        <div class="label">x for P(X ≤ x) = ${pVal}</div>
        <div class="value">${fmt(xVal, 6)}</div>
      </div>
      <div class="result-card">
        <div class="label">Z-Score</div>
        <div class="value">z = ${fmt(z, 4)}</div>
      </div>
      <div class="formula-display">
        x = μ + zσ = ${mu} + ${fmt(z, 4)} × ${sigma} = <strong>${fmt(xVal, 6)}</strong>
      </div>
    `;
  }

  resultContainer.innerHTML = `
    <div class="norm-result">
      ${resultHTML}
      <div class="copy-actions">
        <button class="btn-copy" data-action="copy-result">Copy Result</button>
      </div>
    </div>
  `;

  resultContainer.querySelector('[data-action="copy-result"]')?.addEventListener('click', () => {
    Clipboard.copy(copyText);
  });

  Storage.set('norm-last', { mu, sigma, mode });
}

function updateModeFields() {
  const mode = $('#norm-mode')?.value;
  if (!mode) return;

  // Hide all mode-specific groups
  $$('.norm-mode-group').forEach(g => g.style.display = 'none');

  const target = $(`.norm-mode-group[data-mode="${mode}"]`);
  if (target) target.style.display = '';
}

function clearAll() {
  const muInput = $('#norm-mu');
  const sigmaInput = $('#norm-sigma');
  const resultContainer = $('#norm-result');
  if (muInput) muInput.value = '';
  if (sigmaInput) sigmaInput.value = '';
  if (resultContainer) resultContainer.innerHTML = '';
  $$('input[type="number"]', $('#norm-inputs')).forEach(i => i.value = '');
  Storage.remove('norm-last');
}

function loadSaved() {
  const saved = Storage.get('norm-last');
  if (!saved) return;
  if (saved.mu !== undefined && $('#norm-mu')) $('#norm-mu').value = saved.mu;
  if (saved.sigma !== undefined && $('#norm-sigma')) $('#norm-sigma').value = saved.sigma;
  if (saved.mode && $('#norm-mode')) {
    $('#norm-mode').value = saved.mode;
    updateModeFields();
  }
}

// ===================== BOOTSTRAP =====================
document.addEventListener('DOMContentLoaded', () => {
  initTool('normal-distribution');
  Toast.init();
  loadSaved();

  $('#norm-calculate')?.addEventListener('click', calculate);
  $('#norm-clear')?.addEventListener('click', clearAll);
  $('#norm-mode')?.addEventListener('change', () => { updateModeFields(); });

  // Initial mode field display
  updateModeFields();

  // Auto-calc on input
  for (const id of ['#norm-mu', '#norm-sigma', '#norm-x-pdf', '#norm-x-cdf', '#norm-range-a', '#norm-range-b', '#norm-p-inv']) {
    $(id)?.addEventListener('input', debounce(calculate, 300));
  }
});
