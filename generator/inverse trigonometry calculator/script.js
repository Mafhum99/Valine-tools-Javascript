/* ============================================================
   TOOL 1: Inverse Trigonometry Calculator
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
    try { const v = localStorage.getItem("inverse_trig_" + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("inverse_trig_" + key, JSON.stringify(value)); } catch {}
  },
  remove(key) { try { localStorage.removeItem("inverse_trig_" + key); } catch {} }
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
  isNumeric(val) { return typeof val === "number" && !isNaN(val) && isFinite(val); }
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
//  TOOL-SPECIFIC LOGIC: Inverse Trigonometry Calculator
// ═══════════════════════════════════════════════════════════════

const InverseTrigCalc = (() => {
  const FUNCTIONS = [
    { value: "arcsin", label: "arcsin (sin\u207B\u00B9)", range: "[-\u03C0/2, \u03C0/2]", domain: [-1, 1] },
    { value: "arccos", label: "arccos (cos\u207B\u00B9)", range: "[0, \u03C0]", domain: [-1, 1] },
    { value: "arctan", label: "arctan (tan\u207B\u00B9)", range: "(-\u03C0/2, \u03C0/2)", domain: [-Infinity, Infinity] }
  ];

  const compute = (funcName, x, unit) => {
    const func = FUNCTIONS.find(f => f.value === funcName);
    if (!func) return { error: "Invalid function selected." };

    const numX = Num.parseInput(x);
    if (!MathUtil.isNumeric(numX)) return { error: "Please enter a valid number." };

    if (funcName !== "arctan") {
      if (numX < -1 || numX > 1) {
        return { error: `${funcName} requires input in range [-1, 1].` };
      }
    }

    let resultRad;
    switch (funcName) {
      case "arcsin": resultRad = Math.asin(numX); break;
      case "arccos": resultRad = Math.acos(numX); break;
      case "arctan": resultRad = Math.atan(numX); break;
    }

    const resultDeg = MathUtil.radToDeg(resultRad);

    return {
      resultRad,
      resultDeg,
      displayRad: Num.format(resultRad),
      displayDeg: Num.format(resultDeg),
      range: func.range,
      functionName: func.label,
      input: numX
    };
  };

  const buildUI = () => {
    const container = createEl("div", { className: "inverse-trig-calc" });

    // Input section
    const inputGroup = createEl("div", { className: "input-group" });

    const xLabel = createEl("label", { textContent: "Value (x):" });
    const xInput = createEl("input", { type: "number", id: "it-x-input", placeholder: "Enter a number", step: "any" });

    const funcLabel = createEl("label", { textContent: "Function:" });
    const funcSelect = createEl("select", { id: "it-func-select" });
    FUNCTIONS.forEach(f => {
      const opt = createEl("option", { value: f.value, textContent: f.label });
      funcSelect.appendChild(opt);
    });

    const unitLabel = createEl("label", { textContent: "Output Unit:" });
    const unitSelect = createEl("select", { id: "it-unit-select" });
    unitSelect.appendChild(createEl("option", { value: "both", textContent: "Both (Degrees & Radians)" }));
    unitSelect.appendChild(createEl("option", { value: "degrees", textContent: "Degrees" }));
    unitSelect.appendChild(createEl("option", { value: "radians", textContent: "Radians" }));

    [xLabel, xInput, funcLabel, funcSelect, unitLabel, unitSelect].forEach(el => inputGroup.appendChild(el));
    container.appendChild(inputGroup);

    // Buttons
    const btnGroup = createEl("div", { className: "btn-group" });
    const calcBtn = createEl("button", { id: "it-calc-btn", className: "btn-primary", textContent: "Calculate" });
    const clearBtn = createEl("button", { id: "it-clear-btn", className: "btn-secondary", textContent: "Clear" });
    btnGroup.appendChild(calcBtn);
    btnGroup.appendChild(clearBtn);
    container.appendChild(btnGroup);

    // Result
    const resultDiv = createEl("div", { id: "it-result", className: "result-box", style: "display:none;" });
    container.appendChild(resultDiv);

    // History
    const historyDiv = createEl("div", { id: "it-history", className: "history-box" });
    const historyTitle = createEl("h3", { textContent: "History" });
    const historyList = createEl("ul", { id: "it-history-list" });
    historyDiv.appendChild(historyTitle);
    historyDiv.appendChild(historyList);
    container.appendChild(historyDiv);

    return { container, xInput, funcSelect, unitSelect, calcBtn, clearBtn, resultDiv, historyList };
  };

  const attachEvents = (ui) => {
    const doCalc = () => {
      const x = ui.xInput.value;
      const func = ui.funcSelect.value;
      const unit = ui.unitSelect.value;

      const result = compute(func, x, unit);

      if (result.error) {
        ui.resultDiv.style.display = "";
        ui.resultDiv.innerHTML = `<div class="error">${Str.escapeHtml(result.error)}</div>`;
        return;
      }

      ui.resultDiv.style.display = "";
      let html = `<h3>Result</h3>`;
      html += `<p><strong>${Str.escapeHtml(result.functionName)}(${Num.format(result.input)})</strong></p>`;

      if (unit === "both" || unit === "radians") {
        html += `<p><strong>Radians:</strong> ${result.displayRad} rad</p>`;
      }
      if (unit === "both" || unit === "degrees") {
        html += `<p><strong>Degrees:</strong> ${result.displayDeg}\u00B0</p>`;
      }
      html += `<p class="info"><strong>Range:</strong> ${result.range}</p>`;

      // Copy button
      html += `<button class="btn-copy" id="it-copy-btn">Copy Result</button>`;

      ui.resultDiv.innerHTML = html;

      $("#it-copy-btn")?.addEventListener("click", () => {
        Clipboard.copy(`${result.functionName}(${result.input}) = ${result.displayRad} rad = ${result.displayDeg}°`);
        Toast.show("Result copied!", "success");
      });

      // Save to history
      const history = Storage.get("history", []);
      history.unshift({ func: result.functionName, input: result.input, rad: result.displayRad, deg: result.displayDeg, time: DateUtil.format() });
      if (history.length > 20) history.pop();
      Storage.set("history", history);
      renderHistory(ui.historyList);
    };

    ui.calcBtn.addEventListener("click", doCalc);
    ui.xInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doCalc(); });
    ui.clearBtn.addEventListener("click", () => {
      ui.xInput.value = "";
      ui.resultDiv.style.display = "none";
      ui.funcSelect.value = "arcsin";
      ui.unitSelect.value = "both";
    });

    // Load saved unit preference
    const savedUnit = Storage.get("unit", "both");
    ui.unitSelect.value = savedUnit;
    ui.unitSelect.addEventListener("change", () => Storage.set("unit", ui.unitSelect.value));

    renderHistory(ui.historyList);
  };

  const renderHistory = (listEl) => {
    const history = Storage.get("history", []);
    listEl.innerHTML = "";
    if (history.length === 0) {
      listEl.appendChild(createEl("li", { className: "empty", textContent: "No calculations yet." }));
      return;
    }
    history.forEach(h => {
      const li = createEl("li");
      li.innerHTML = `<span class="hist-entry">${Str.escapeHtml(h.func)}(${Num.format(h.input)}) = ${h.displayRad || h.rad} rad</span><span class="hist-time">${Str.escapeHtml(h.time)}</span>`;
      listEl.appendChild(li);
    });
  };

  const init = () => {
    const ui = buildUI();
    const mount = document.getElementById("app") || document.body;
    mount.appendChild(ui.container);
    attachEvents(ui);
  };

  return { init, compute };
})();

// Bootstrap
initTool(() => { InverseTrigCalc.init(); });

// Expose for testing / external use
if (typeof window !== "undefined") window.InverseTrigCalc = InverseTrigCalc;
