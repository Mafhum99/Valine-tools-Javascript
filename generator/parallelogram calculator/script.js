// ============================================================
// Parallelogram Calculator – Full Script
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
  degToRad(deg) { return deg * Math.PI / 180; },
  radToDeg(rad) { return rad * 180 / Math.PI; },
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
// PARALLELOGRAM CALCULATOR – Tool-Specific Logic
// ============================================================

function updateModeFields() {
  const mode = $('#para-mode')?.value;
  if (!mode) return;

  // Hide all mode groups
  $$('.para-mode-group').forEach(g => g.style.display = 'none');

  const target = $(`.para-mode-group[data-mode="${mode}"]`);
  if (target) target.style.display = '';
}

function validateInputs(mode) {
  const aVal = parseNum($('#para-a')?.value);
  if (aVal === null || !Validation.isPositive(aVal)) {
    Toast.show('Side a must be a positive number', 'error');
    return null;
  }

  if (mode === 'area-h') {
    const hVal = parseNum($('#para-h')?.value);
    if (hVal === null || !Validation.isPositive(hVal)) {
      Toast.show('Height h must be a positive number', 'error');
      return null;
    }
    return { a: aVal, h: hVal };
  } else if (mode === 'perimeter') {
    const bVal = parseNum($('#para-b-perim')?.value);
    if (bVal === null || !Validation.isPositive(bVal)) {
      Toast.show('Side b must be a positive number', 'error');
      return null;
    }
    return { a: aVal, b: bVal };
  } else if (mode === 'diagonals') {
    const bVal = parseNum($('#para-b-diag')?.value);
    const thetaVal = parseNum($('#para-theta')?.value);
    if (bVal === null || !Validation.isPositive(bVal)) {
      Toast.show('Side b must be a positive number', 'error');
      return null;
    }
    if (thetaVal === null || !Validation.range(thetaVal, 0, 180)) {
      Toast.show('Angle θ must be between 0 and 180 degrees (exclusive)', 'error');
      return null;
    }
    if (thetaVal <= 0 || thetaVal >= 180) {
      Toast.show('Angle θ must be in the range (0, 180)', 'error');
      return null;
    }
    return { a: aVal, b: bVal, theta: thetaVal };
  }

  return { a: aVal };
}

function calculate() {
  const mode = $('#para-mode')?.value;
  const resultContainer = $('#para-result');
  if (!mode || !resultContainer) return;

  const inputs = validateInputs(mode);
  if (!inputs) return;

  let resultHTML = '';
  let copyText = '';

  if (mode === 'area-h') {
    const { a, h } = inputs;
    const area = a * h;
    copyText = `Parallelogram: a=${a}, h=${h}\nArea = a × h = ${fmt(area)} sq units`;
    resultHTML = `
      <div class="result-card primary">
        <div class="label">Area</div>
        <div class="value">${fmt(area)} sq units</div>
      </div>
      <div class="formula-display">
        Area = a × h = ${a} × ${h} = <strong>${fmt(area)}</strong>
      </div>
    `;
  } else if (mode === 'perimeter') {
    const { a, b } = inputs;
    const perimeter = 2 * (a + b);
    copyText = `Parallelogram: a=${a}, b=${b}\nPerimeter = 2(a + b) = ${fmt(perimeter)} units`;
    resultHTML = `
      <div class="result-card primary">
        <div class="label">Perimeter</div>
        <div class="value">${fmt(perimeter)} units</div>
      </div>
      <div class="formula-display">
        Perimeter = 2(a + b) = 2(${a} + ${b}) = <strong>${fmt(perimeter)}</strong>
      </div>
    `;
  } else if (mode === 'diagonals') {
    const { a, b, theta } = inputs;
    const thetaRad = MathUtils.degToRad(theta);
    const cosTheta = Math.cos(thetaRad);
    const sinTheta = Math.sin(thetaRad);

    // Area via sin
    const area = a * b * sinTheta;

    // Diagonals
    const d1sq = a * a + b * b + 2 * a * b * cosTheta;
    const d2sq = a * a + b * b - 2 * a * b * cosTheta;
    const d1 = Math.sqrt(Math.max(0, d1sq));
    const d2 = Math.sqrt(Math.max(0, d2sq));

    // Perimeter
    const perimeter = 2 * (a + b);

    copyText = `Parallelogram: a=${a}, b=${b}, θ=${theta}°\nArea = ${fmt(area)}, Perimeter = ${fmt(perimeter)}, d₁ = ${fmt(d1)}, d₂ = ${fmt(d2)}`;

    resultHTML = `
      <div class="result-card">
        <div class="label">Area</div>
        <div class="value">${fmt(area)} sq units</div>
      </div>
      <div class="result-card">
        <div class="label">Perimeter</div>
        <div class="value">${fmt(perimeter)} units</div>
      </div>
      <div class="result-card">
        <div class="label">Diagonal d₁</div>
        <div class="value">${fmt(d1)} units</div>
        <div class="detail">d₁² = a² + b² + 2ab·cos(θ) = ${fmt(a*a)} + ${fmt(b*b)} + ${fmt(2*a*b*cosTheta, 4)}</div>
      </div>
      <div class="result-card">
        <div class="label">Diagonal d₂</div>
        <div class="value">${fmt(d2)} units</div>
        <div class="detail">d₂² = a² + b² − 2ab·cos(θ) = ${fmt(a*a)} + ${fmt(b*b)} − ${fmt(2*a*b*cosTheta, 4)}</div>
      </div>
      <div class="formula-display">
        θ = ${theta}° = ${fmt(thetaRad, 4)} rad<br>
        sin(θ) = ${fmt(sinTheta, 6)}, cos(θ) = ${fmt(cosTheta, 6)}<br>
        Area = a × b × sin(θ) = ${a} × ${b} × ${fmt(sinTheta, 6)} = <strong>${fmt(area)}</strong><br>
        d₁ = √(${fmt(a*a)} + ${fmt(b*b)} + ${fmt(2*a*b*cosTheta, 4)}) = <strong>${fmt(d1)}</strong><br>
        d₂ = √(${fmt(a*a)} + ${fmt(b*b)} − ${fmt(2*a*b*cosTheta, 4)}) = <strong>${fmt(d2)}</strong>
      </div>
    `;
  }

  resultContainer.innerHTML = `
    <div class="para-result">
      ${resultHTML}
      <div class="copy-actions">
        <button class="btn-copy" data-action="copy-result">Copy Result</button>
      </div>
    </div>
  `;

  resultContainer.querySelector('[data-action="copy-result"]')?.addEventListener('click', () => {
    Clipboard.copy(copyText);
  });

  Storage.set('para-last', { mode, ...inputs });
}

function clearAll() {
  const resultContainer = $('#para-result');
  if (resultContainer) resultContainer.innerHTML = '';
  $('#para-a') && ($('#para-a').value = '');
  $('#para-h') && ($('#para-h').value = '');
  $('#para-b-perim') && ($('#para-b-perim').value = '');
  $('#para-b-diag') && ($('#para-b-diag').value = '');
  $('#para-theta') && ($('#para-theta').value = '');
  Storage.remove('para-last');
}

function loadSaved() {
  const saved = Storage.get('para-last');
  if (!saved) return;
  if (saved.mode && $('#para-mode')) {
    $('#para-mode').value = saved.mode;
    updateModeFields();
  }
  if (saved.a !== undefined && $('#para-a')) $('#para-a').value = saved.a;
  if (saved.h !== undefined && $('#para-h')) $('#para-h').value = saved.h;
  if (saved.b !== undefined) {
    const bp = $('#para-b-perim');
    const bd = $('#para-b-diag');
    if (bp) bp.value = saved.b;
    if (bd) bd.value = saved.b;
  }
  if (saved.theta !== undefined && $('#para-theta')) $('#para-theta').value = saved.theta;
}

// ===================== BOOTSTRAP =====================
document.addEventListener('DOMContentLoaded', () => {
  initTool('parallelogram-calculator');
  Toast.init();
  loadSaved();

  $('#para-calculate')?.addEventListener('click', calculate);
  $('#para-clear')?.addEventListener('click', clearAll);
  $('#para-mode')?.addEventListener('change', () => { updateModeFields(); });

  // Initial mode field display
  updateModeFields();

  // Auto-calc on input
  for (const id of ['#para-a', '#para-h', '#para-b-perim', '#para-b-diag', '#para-theta']) {
    $(id)?.addEventListener('input', debounce(calculate, 300));
  }
});
