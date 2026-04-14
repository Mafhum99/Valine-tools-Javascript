/* ============================================================
   TOOL 2: Laplace Transform Calculator
   ============================================================ */

// ── DOM Helpers ──────────────────────────────────────────────
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const createEl = (tag, attrs = {}, children = []) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "className") el.className = v;
    else if (k === "textContent") el.textContent = v;
    else if (k === "innerHTML") el.innerHTML = v;
    else el.setAttribute(k, v);
  });
  children.forEach(c => { if (c) el.appendChild(c); });
  return el;
};
const setText = (sel, text, ctx = document) => { const el = $(sel, ctx); if (el) el.textContent = text; };
const show = (sel, ctx = document) => { const el = $(sel, ctx); if (el) el.style.display = ""; };
const hide = (sel, ctx = document) => { const el = $(sel, ctx); if (el) el.style.display = "none"; };
const val = (sel) => { const el = $(sel); return el ? el.value : ""; };

// ── Storage ──────────────────────────────────────────────────
const Storage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem("laplace_" + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("laplace_" + key, JSON.stringify(value)); } catch {}
  },
  remove(key) { try { localStorage.removeItem("laplace_" + key); } catch {} }
};

// ── Clipboard ────────────────────────────────────────────────
const Clipboard = {
  async copy(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch { const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); return true; }
  }
};

// ── Toast ────────────────────────────────────────────────────
const Toast = {
  container: null,
  init() {
    if (this.container) return;
    this.container = createEl("div", { id: "toast-container", className: "toast-container" });
    document.body.appendChild(this.container);
  },
  show(message, type = "info", duration = 3000) {
    this.init();
    const toast = createEl("div", { className: `toast toast-${type}` });
    toast.textContent = message;
    this.container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 300); }, duration);
  }
};

// ── Number Formatting ────────────────────────────────────────
const Num = {
  format(n, decimals = 6) {
    if (typeof n !== "number" || isNaN(n)) return "NaN";
    if (!isFinite(n)) return n > 0 ? "Infinity" : "-Infinity";
    const fixed = parseFloat(n.toFixed(decimals));
    return fixed.toLocaleString("en-US", { maximumFractionDigits: decimals });
  },
  toScientific(n, decimals = 4) {
    if (typeof n !== "number" || isNaN(n)) return "NaN";
    if (n === 0) return "0";
    if (!isFinite(n)) return n > 0 ? "Infinity" : "-Infinity";
    return n.toExponential(decimals);
  },
  parseInput(str) {
    const cleaned = str.replace(/,/g, "").trim();
    if (cleaned === "") return NaN;
    return Number(cleaned);
  }
};

// ── Math Utilities ───────────────────────────────────────────
const MathUtil = {
  degToRad(deg) { return deg * Math.PI / 180; },
  radToDeg(rad) { return rad * 180 / Math.PI; },
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
  isNumeric(val) { return typeof val === "number" && !isNaN(val) && isFinite(val); },
  factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }
};

// ── String Utilities ─────────────────────────────────────────
const Str = {
  capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
  truncate(s, len) { return s.length > len ? s.slice(0, len) + "..." : s; },
  escapeHtml(s) { const d = document.createElement("div"); d.textContent = s; return d.innerHTML; }
};

// ── Date Utilities ───────────────────────────────────────────
const DateUtil = {
  now() { return new Date(); },
  format(d = new Date()) { return d.toLocaleString(); }
};

// ── Color Utilities ──────────────────────────────────────────
const Color = {
  hexToRgb(hex) {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
  },
  rgbToHex(r, g, b) { return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join(""); },
  randomHex() { return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0"); }
};

// ── Random Utilities ─────────────────────────────────────────
const Rand = {
  int(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  float(min, max) { return Math.random() * (max - min) + min; },
  pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
};

// ── Debounce / Throttle ──────────────────────────────────────
const debounce = (fn, delay = 300) => { let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; };
const throttle = (fn, limit = 300) => { let last = 0; return (...args) => { const now = Date.now(); if (now - last >= limit) { last = now; fn(...args); } }; };

// ── Validation ───────────────────────────────────────────────
const Validation = {
  isRequired(val) { return val !== null && val !== undefined && String(val).trim() !== ""; },
  isNumber(val) { return !isNaN(Number(val)) && isFinite(Number(val)); },
  inRange(val, min, max) { const n = Number(val); return n >= min && n <= max; }
};

// ── initTool Bootstrap ───────────────────────────────────────
const initTool = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

// ═══════════════════════════════════════════════════════════════
//  TOOL-SPECIFIC LOGIC: Laplace Transform Calculator
// ═══════════════════════════════════════════════════════════════

const LaplaceCalc = (() => {
  // Transform table: each entry has id, label, f(t), F(s), params (which inputs are needed)
  const TRANSFORMS = [
    { id: "const1", label: "f(t) = 1", ft: "1", Fs: "1/s", needsA: false, needsN: false },
    { id: "t", label: "f(t) = t", ft: "t", Fs: "1/s\u00B2", needsA: false, needsN: false },
    { id: "tn", label: "f(t) = t\u207F", ft: "t^n", Fs: "n! / s^(n+1)", needsA: false, needsN: true },
    { id: "exp", label: "f(t) = e^(at)", ft: "e^(at)", Fs: "1 / (s - a)", needsA: true, needsN: false },
    { id: "sin", label: "f(t) = sin(at)", ft: "sin(at)", Fs: "a / (s\u00B2 + a\u00B2)", needsA: true, needsN: false },
    { id: "cos", label: "f(t) = cos(at)", ft: "cos(at)", Fs: "s / (s\u00B2 + a\u00B2)", needsA: true, needsN: false },
    { id: "sinh", label: "f(t) = sinh(at)", ft: "sinh(at)", Fs: "a / (s\u00B2 - a\u00B2)", needsA: true, needsN: false },
    { id: "cosh", label: "f(t) = cosh(at)", ft: "cosh(at)", Fs: "s / (s\u00B2 - a\u00B2)", needsA: true, needsN: false }
  ];

  const computeFs = (id, a, n) => {
    const t = TRANSFORMS.find(x => x.id === id);
    if (!t) return { error: "Invalid transform selected." };

    const numA = Num.parseInput(a);
    const numN = Num.parseInput(n);

    if (t.needsA && !MathUtil.isNumeric(numA)) return { error: "Please enter a valid value for 'a'." };
    if (t.needsN && (!MathUtil.isNumeric(numN) || numN < 0 || !Number.isInteger(numN))) return { error: "Please enter a valid non-negative integer for 'n'." };

    let FsExpr = t.Fs;
    let FsValue = "";

    switch (t.id) {
      case "const1":
        FsExpr = "1/s";
        break;
      case "t":
        FsExpr = "1/s\u00B2";
        break;
      case "tn": {
        const fact = MathUtil.factorial(numN);
        FsExpr = `${numN}! / s^${numN + 1}`;
        FsValue = `${Num.format(fact)} / s^${numN + 1}`;
        break;
      }
      case "exp":
        FsExpr = `1 / (s ${numA >= 0 ? "- " + Num.format(numA) : "+ " + Num.format(Math.abs(numA))})`;
        break;
      case "sin":
        FsExpr = `${Num.format(numA)} / (s\u00B2 + ${Num.format(numA * numA)})`;
        break;
      case "cos":
        FsExpr = `s / (s\u00B2 + ${Num.format(numA * numA)})`;
        break;
      case "sinh": {
        const a2 = numA * numA;
        FsExpr = `${Num.format(numA)} / (s\u00B2 ${a2 > 0 ? "- " + Num.format(a2) : "+ " + Num.format(Math.abs(a2))})`;
        break;
      }
      case "cosh": {
        const a2 = numA * numA;
        FsExpr = `s / (s\u00B2 ${a2 > 0 ? "- " + Num.format(a2) : "+ " + Num.format(Math.abs(a2))})`;
        break;
      }
    }

    return {
      ft: t.ft,
      FsExpr,
      FsValue,
      id: t.id
    };
  };

  const buildUI = () => {
    const container = createEl("div", { className: "laplace-calc" });

    // Function selector
    const funcGroup = createEl("div", { className: "input-group" });
    const funcLabel = createEl("label", { textContent: "Select f(t):" });
    const funcSelect = createEl("select", { id: "lt-func-select" });
    TRANSFORMS.forEach(t => {
      const opt = createEl("option", { value: t.id, textContent: t.label });
      funcSelect.appendChild(opt);
    });
    funcGroup.appendChild(funcLabel);
    funcGroup.appendChild(funcSelect);
    container.appendChild(funcGroup);

    // Parameter inputs
    const paramGroup = createEl("div", { id: "lt-params", className: "param-group" });

    const aGroup = createEl("div", { id: "lt-a-group", className: "input-group" });
    const aLabel = createEl("label", { textContent: "Parameter a:" });
    const aInput = createEl("input", { type: "number", id: "lt-a-input", placeholder: "Enter a", step: "any" });
    aGroup.appendChild(aLabel);
    aGroup.appendChild(aInput);
    paramGroup.appendChild(aGroup);

    const nGroup = createEl("div", { id: "lt-n-group", className: "input-group" });
    const nLabel = createEl("label", { textContent: "Parameter n (non-negative integer):" });
    const nInput = createEl("input", { type: "number", id: "lt-n-input", placeholder: "Enter n", step: "1", min: "0" });
    nGroup.appendChild(nLabel);
    nGroup.appendChild(nInput);
    paramGroup.appendChild(nGroup);

    container.appendChild(paramGroup);

    // Buttons
    const btnGroup = createEl("div", { className: "btn-group" });
    const calcBtn = createEl("button", { id: "lt-calc-btn", className: "btn-primary", textContent: "Calculate" });
    const clearBtn = createEl("button", { id: "lt-clear-btn", className: "btn-secondary", textContent: "Clear" });
    btnGroup.appendChild(calcBtn);
    btnGroup.appendChild(clearBtn);
    container.appendChild(btnGroup);

    // Result
    const resultDiv = createEl("div", { id: "lt-result", className: "result-box", style: "display:none;" });
    container.appendChild(resultDiv);

    // Full transform table
    const tableDiv = createEl("div", { id: "lt-table", className: "table-box" });
    const tableTitle = createEl("h3", { textContent: "Laplace Transform Table" });
    const table = createEl("table", { className: "laplace-table" });
    const thead = createEl("thead");
    const headerRow = createEl("tr");
    headerRow.appendChild(createEl("th", { textContent: "#" }));
    headerRow.appendChild(createEl("th", { textContent: "f(t)" }));
    headerRow.appendChild(createEl("th", { textContent: "F(s) = L{f(t)}" }));
    thead.appendChild(headerRow);
    const tbody = createEl("tbody");
    TRANSFORMS.forEach((t, i) => {
      const row = createEl("tr");
      row.appendChild(createEl("td", { textContent: String(i + 1) }));
      row.appendChild(createEl("td", { textContent: t.ft }));
      row.appendChild(createEl("td", { textContent: t.Fs }));
      tbody.appendChild(row);
    });
    table.appendChild(thead);
    table.appendChild(tbody);
    tableDiv.appendChild(tableTitle);
    tableDiv.appendChild(table);
    container.appendChild(tableDiv);

    return { container, funcSelect, aInput, nInput, aGroup, nGroup, calcBtn, clearBtn, resultDiv };
  };

  const attachEvents = (ui) => {
    const updateParams = () => {
      const selected = TRANSFORMS.find(t => t.id === ui.funcSelect.value);
      if (selected) {
        ui.aGroup.style.display = selected.needsA ? "" : "none";
        ui.nGroup.style.display = selected.needsN ? "" : "none";
      }
    };

    ui.funcSelect.addEventListener("change", updateParams);
    updateParams();

    const doCalc = () => {
      const id = ui.funcSelect.value;
      const a = ui.aInput.value;
      const n = ui.nInput.value;

      const result = computeFs(id, a, n);

      if (result.error) {
        ui.resultDiv.style.display = "";
        ui.resultDiv.innerHTML = `<div class="error">${Str.escapeHtml(result.error)}</div>`;
        return;
      }

      const t = TRANSFORMS.find(x => x.id === id);
      ui.resultDiv.style.display = "";
      let html = `<h3>Result</h3>`;
      html += `<p><strong>f(t) =</strong> ${t.ft}</p>`;
      html += `<p><strong>F(s) =</strong> ${result.FsExpr}</p>`;
      if (result.FsValue) {
        html += `<p><strong>Numerical:</strong> ${result.FsValue}</p>`;
      }

      html += `<button class="btn-copy" id="lt-copy-btn">Copy Result</button>`;
      ui.resultDiv.innerHTML = html;

      $("#lt-copy-btn")?.addEventListener("click", () => {
        Clipboard.copy(`L{${t.ft}} = ${result.FsExpr}`);
        Toast.show("Result copied!", "success");
      });
    };

    ui.calcBtn.addEventListener("click", doCalc);
    ui.aInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doCalc(); });
    ui.nInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doCalc(); });

    ui.clearBtn.addEventListener("click", () => {
      ui.aInput.value = "";
      ui.nInput.value = "";
      ui.resultDiv.style.display = "none";
      ui.funcSelect.value = "const1";
      updateParams();
    });
  };

  const init = () => {
    const ui = buildUI();
    const mount = document.getElementById("app") || document.body;
    mount.appendChild(ui.container);
    attachEvents(ui);
  };

  return { init, computeFs, TRANSFORMS };
})();

// Bootstrap
initTool(() => { LaplaceCalc.init(); });

// Expose for testing / external use
if (typeof window !== "undefined") window.LaplaceCalc = LaplaceCalc;
