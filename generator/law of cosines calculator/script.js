/* ============================================================
   TOOL 3: Law of Cosines Calculator
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
    try { const v = localStorage.getItem("law_cosines_" + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("law_cosines_" + key, JSON.stringify(value)); } catch {}
  },
  remove(key) { try { localStorage.removeItem("law_cosines_" + key); } catch {} }
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
//  TOOL-SPECIFIC LOGIC: Law of Cosines Calculator
// ═══════════════════════════════════════════════════════════════

const LawOfCosines = (() => {
  // Find side c: c^2 = a^2 + b^2 - 2ab*cos(C)
  const findSide = (a, b, angleC_Deg) => {
    const numA = Num.parseInput(a);
    const numB = Num.parseInput(b);
    const numC = Num.parseInput(angleC_Deg);

    if (!MathUtil.isNumeric(numA) || numA <= 0) return { error: "Side 'a' must be a positive number." };
    if (!MathUtil.isNumeric(numB) || numB <= 0) return { error: "Side 'b' must be a positive number." };
    if (!MathUtil.isNumeric(numC) || numC <= 0 || numC >= 180) return { error: "Angle C must be between 0 and 180 degrees (exclusive)." };

    const angleCRad = MathUtil.degToRad(numC);
    const c2 = numA * numA + numB * numB - 2 * numA * numB * Math.cos(angleCRad);

    if (c2 < 0) return { error: "Invalid triangle: computed c\u00B2 is negative. Check your inputs." };

    const c = Math.sqrt(c2);
    const area = 0.5 * numA * numB * Math.sin(angleCRad);

    return {
      sideA: numA,
      sideB: numB,
      angleC: numC,
      sideC: c,
      displayC: Num.format(c),
      area: area,
      displayArea: Num.format(area),
      mode: "findSide"
    };
  };

  // Find angle C: C = arccos((a^2 + b^2 - c^2) / (2ab))
  const findAngle = (a, b, c) => {
    const numA = Num.parseInput(a);
    const numB = Num.parseInput(b);
    const numC = Num.parseInput(c);

    if (!MathUtil.isNumeric(numA) || numA <= 0) return { error: "Side 'a' must be a positive number." };
    if (!MathUtil.isNumeric(numB) || numB <= 0) return { error: "Side 'b' must be a positive number." };
    if (!MathUtil.isNumeric(numC) || numC <= 0) return { error: "Side 'c' must be a positive number." };

    // Triangle inequality check
    if (numA + numB <= numC || numA + numC <= numB || numB + numC <= numA) {
      return { error: "Triangle inequality violated. These sides cannot form a valid triangle." };
    }

    const denom = 2 * numA * numB;
    const numerator = numA * numA + numB * numB - numC * numC;
    const cosVal = numerator / denom;

    if (cosVal < -1 || cosVal > 1) return { error: "Invalid triangle: computed cosine is out of range [-1, 1]." };

    const angleC_Rad = Math.acos(cosVal);
    const angleC_Deg = MathUtil.radToDeg(angleC_Rad);
    const area = 0.5 * numA * numB * Math.sin(angleC_Rad);

    return {
      sideA: numA,
      sideB: numB,
      sideC: numC,
      angleC: angleC_Deg,
      displayAngleC: Num.format(angleC_Deg) + "\u00B0",
      displayAngleCRad: Num.format(angleC_Rad) + " rad",
      area: area,
      displayArea: Num.format(area),
      mode: "findAngle"
    };
  };

  const compute = (mode, inputs) => {
    if (mode === "findSide") {
      return findSide(inputs.a, inputs.b, inputs.angleC);
    } else {
      return findAngle(inputs.a, inputs.b, inputs.c);
    }
  };

  const buildUI = () => {
    const container = createEl("div", { className: "law-cosines-calc" });

    // Mode selector
    const modeGroup = createEl("div", { className: "input-group" });
    const modeLabel = createEl("label", { textContent: "Mode:" });
    const modeSelect = createEl("select", { id: "lc-mode-select" });
    modeSelect.appendChild(createEl("option", { value: "findSide", textContent: "Find side (a, b, angle C)" }));
    modeSelect.appendChild(createEl("option", { value: "findAngle", textContent: "Find angle (a, b, c)" }));
    modeGroup.appendChild(modeLabel);
    modeGroup.appendChild(modeSelect);
    container.appendChild(modeGroup);

    // Input fields container
    const fieldsDiv = createEl("div", { id: "lc-fields", className: "fields-container" });

    // Find side fields
    const findSideFields = createEl("div", { id: "lc-find-side", className: "field-group" });
    const a1Label = createEl("label", { textContent: "Side a:" });
    const a1Input = createEl("input", { type: "number", id: "lc-a1", placeholder: "Enter side a", step: "any", min: "0" });
    const b1Label = createEl("label", { textContent: "Side b:" });
    const b1Input = createEl("input", { type: "number", id: "lc-b1", placeholder: "Enter side b", step: "any", min: "0" });
    const cAngleLabel = createEl("label", { textContent: "Angle C (degrees):" });
    const cAngleInput = createEl("input", { type: "number", id: "lc-angle-c", placeholder: "Enter angle C", step: "any", min: "0", max: "180" });
    [a1Label, a1Input, b1Label, b1Input, cAngleLabel, cAngleInput].forEach(el => findSideFields.appendChild(el));
    fieldsDiv.appendChild(findSideFields);

    // Find angle fields
    const findAngleFields = createEl("div", { id: "lc-find-angle", className: "field-group", style: "display:none;" });
    const a2Label = createEl("label", { textContent: "Side a:" });
    const a2Input = createEl("input", { type: "number", id: "lc-a2", placeholder: "Enter side a", step: "any", min: "0" });
    const b2Label = createEl("label", { textContent: "Side b:" });
    const b2Input = createEl("input", { type: "number", id: "lc-b2", placeholder: "Enter side b", step: "any", min: "0" });
    const c2Label = createEl("label", { textContent: "Side c:" });
    const c2Input = createEl("input", { type: "number", id: "lc-c2", placeholder: "Enter side c", step: "any", min: "0" });
    [a2Label, a2Input, b2Label, b2Input, c2Label, c2Input].forEach(el => findAngleFields.appendChild(el));
    fieldsDiv.appendChild(findAngleFields);

    container.appendChild(fieldsDiv);

    // Buttons
    const btnGroup = createEl("div", { className: "btn-group" });
    const calcBtn = createEl("button", { id: "lc-calc-btn", className: "btn-primary", textContent: "Calculate" });
    const clearBtn = createEl("button", { id: "lc-clear-btn", className: "btn-secondary", textContent: "Clear" });
    btnGroup.appendChild(calcBtn);
    btnGroup.appendChild(clearBtn);
    container.appendChild(btnGroup);

    // Result
    const resultDiv = createEl("div", { id: "lc-result", className: "result-box", style: "display:none;" });
    container.appendChild(resultDiv);

    // History
    const historyDiv = createEl("div", { id: "lc-history", className: "history-box" });
    const historyTitle = createEl("h3", { textContent: "History" });
    const historyList = createEl("ul", { id: "lc-history-list" });
    historyDiv.appendChild(historyTitle);
    historyDiv.appendChild(historyList);
    container.appendChild(historyDiv);

    return {
      container, modeSelect,
      findSideFields, findAngleFields,
      a1Input, b1Input, cAngleInput,
      a2Input, b2Input, c2Input,
      calcBtn, clearBtn, resultDiv, historyList
    };
  };

  const attachEvents = (ui) => {
    const updateFields = () => {
      const mode = ui.modeSelect.value;
      ui.findSideFields.style.display = mode === "findSide" ? "" : "none";
      ui.findAngleFields.style.display = mode === "findAngle" ? "" : "none";
    };

    ui.modeSelect.addEventListener("change", updateFields);

    const doCalc = () => {
      const mode = ui.modeSelect.value;
      let result;

      if (mode === "findSide") {
        result = compute("findSide", {
          a: ui.a1Input.value,
          b: ui.b1Input.value,
          angleC: ui.cAngleInput.value
        });
      } else {
        result = compute("findAngle", {
          a: ui.a2Input.value,
          b: ui.b2Input.value,
          c: ui.c2Input.value
        });
      }

      if (result.error) {
        ui.resultDiv.style.display = "";
        ui.resultDiv.innerHTML = `<div class="error">${Str.escapeHtml(result.error)}</div>`;
        return;
      }

      ui.resultDiv.style.display = "";
      let html = `<h3>Result</h3>`;

      if (result.mode === "findSide") {
        html += `<p><strong>Given:</strong> a = ${Num.format(result.sideA)}, b = ${Num.format(result.sideB)}, C = ${Num.format(result.angleC)}\u00B0</p>`;
        html += `<p><strong>c\u00B2 = a\u00B2 + b\u00B2 - 2ab\u00B7cos(C)</strong></p>`;
        html += `<p><strong>Side c = ${result.displayC}</strong></p>`;
        html += `<p><strong>Triangle Area = ${result.displayArea}</strong></p>`;
      } else {
        html += `<p><strong>Given:</strong> a = ${Num.format(result.sideA)}, b = ${Num.format(result.sideB)}, c = ${Num.format(result.sideC)}</p>`;
        html += `<p><strong>C = arccos((a\u00B2 + b\u00B2 - c\u00B2) / 2ab)</strong></p>`;
        html += `<p><strong>Angle C = ${result.displayAngleC} (${result.displayAngleCRad})</strong></p>`;
        html += `<p><strong>Triangle Area = ${result.displayArea}</strong></p>`;
      }

      html += `<button class="btn-copy" id="lc-copy-btn">Copy Result</button>`;
      ui.resultDiv.innerHTML = html;

      $("#lc-copy-btn")?.addEventListener("click", () => {
        if (result.mode === "findSide") {
          Clipboard.copy(`Law of Cosines: a=${result.sideA}, b=${result.sideB}, C=${result.angleC}° → c=${result.displayC}, Area=${result.displayArea}`);
        } else {
          Clipboard.copy(`Law of Cosines: a=${result.sideA}, b=${result.sideB}, c=${result.sideC} → C=${result.displayAngleC}, Area=${result.displayArea}`);
        }
        Toast.show("Result copied!", "success");
      });

      // Save to history
      const history = Storage.get("history", []);
      history.unshift({
        mode: result.mode,
        summary: result.mode === "findSide" ? `c = ${result.displayC}` : `C = ${result.displayAngleC}`,
        time: DateUtil.format()
      });
      if (history.length > 20) history.pop();
      Storage.set("history", history);
      renderHistory(ui.historyList);
    };

    ui.calcBtn.addEventListener("click", doCalc);
    ui.findSideFields.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") doCalc(); });
    });
    ui.findAngleFields.querySelectorAll("input").forEach(inp => {
      inp.addEventListener("keydown", (e) => { if (e.key === "Enter") doCalc(); });
    });

    ui.clearBtn.addEventListener("click", () => {
      [ui.a1Input, ui.b1Input, ui.cAngleInput, ui.a2Input, ui.b2Input, ui.c2Input].forEach(i => i.value = "");
      ui.resultDiv.style.display = "none";
    });

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
      li.innerHTML = `<span class="hist-entry">${Str.capitalize(h.mode)}: ${Str.escapeHtml(h.summary)}</span><span class="hist-time">${Str.escapeHtml(h.time)}</span>`;
      listEl.appendChild(li);
    });
  };

  const init = () => {
    const ui = buildUI();
    const mount = document.getElementById("app") || document.body;
    mount.appendChild(ui.container);
    attachEvents(ui);
  };

  return { init, compute, findSide, findAngle };
})();

// Bootstrap
initTool(() => { LawOfCosines.init(); });

// Expose for testing / external use
if (typeof window !== "undefined") window.LawOfCosines = LawOfCosines;
