/* ============================================================
   TOOL 4: Law of Sines Calculator
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
    try { const v = localStorage.getItem("law_sines_" + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("law_sines_" + key, JSON.stringify(value)); } catch {}
  },
  remove(key) { try { localStorage.removeItem("law_sines_" + key); } catch {} }
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
//  TOOL-SPECIFIC LOGIC: Law of Sines Calculator
// ═══════════════════════════════════════════════════════════════

const LawOfSines = (() => {
  // Find side a: a = b * sin(A) / sin(B)
  const findSide = (angleA_Deg, angleB_Deg, sideB) => {
    const numA = Num.parseInput(angleA_Deg);
    const numB = Num.parseInput(angleB_Deg);
    const numSideB = Num.parseInput(sideB);

    if (!MathUtil.isNumeric(numA) || numA <= 0 || numA >= 180) return { error: "Angle A must be between 0 and 180 degrees (exclusive)." };
    if (!MathUtil.isNumeric(numB) || numB <= 0 || numB >= 180) return { error: "Angle B must be between 0 and 180 degrees (exclusive)." };
    if (!MathUtil.isNumeric(numSideB) || numSideB <= 0) return { error: "Side b must be a positive number." };
    if (numA + numB >= 180) return { error: "Angles A + B must be less than 180 degrees." };

    const sinA = Math.sin(MathUtil.degToRad(numA));
    const sinB = Math.sin(MathUtil.degToRad(numB));

    const sideA = numSideB * sinA / sinB;

    // Find remaining angle C and side c
    const angleC_Deg = 180 - numA - numB;
    const sinC = Math.sin(MathUtil.degToRad(angleC_Deg));
    const sideC = numSideB * sinC / sinB;

    const ratio = numSideB / sinB;

    return {
      angleA: numA,
      angleB: numB,
      sideB: numSideB,
      sideA: sideA,
      displaySideA: Num.format(sideA),
      angleC: angleC_Deg,
      displayAngleC: Num.format(angleC_Deg) + "\u00B0",
      sideC: sideC,
      displaySideC: Num.format(sideC),
      ratio: ratio,
      displayRatio: Num.format(ratio),
      mode: "findSide",
      solutions: 1
    };
  };

  // Find angle A using SSA (ambiguous case): sin(A) = a * sin(B) / b
  const findAngle = (sideA, sideB, angleB_Deg) => {
    const numSideA = Num.parseInput(sideA);
    const numSideB = Num.parseInput(sideB);
    const numB = Num.parseInput(angleB_Deg);

    if (!MathUtil.isNumeric(numSideA) || numSideA <= 0) return { error: "Side a must be a positive number." };
    if (!MathUtil.isNumeric(numSideB) || numSideB <= 0) return { error: "Side b must be a positive number." };
    if (!MathUtil.isNumeric(numB) || numB <= 0 || numB >= 180) return { error: "Angle B must be between 0 and 180 degrees (exclusive)." };

    const sinB = Math.sin(MathUtil.degToRad(numB));
    const sinA_val = numSideA * sinB / numSideB;

    // Check for ambiguous case
    if (sinA_val > 1) {
      return { error: "No solution: sin(A) = " + Num.format(sinA_val) + " > 1. No triangle exists with these values.", solutions: 0 };
    }

    if (sinA_val === 1) {
      // Exactly one solution: A = 90 degrees
      const angleA_Deg = 90;
      const angleC_Deg = 180 - angleA_Deg - numB;
      const sinC = Math.sin(MathUtil.degToRad(angleC_Deg));
      const sideC = numSideB * sinC / sinB;

      return {
        sideA: numSideA, sideB: numSideB, angleB: numB,
        angleA: 90, displayAngleA: "90\u00B0",
        angleC: angleC_Deg, displayAngleC: Num.format(angleC_Deg) + "\u00B0",
        sideC: sideC, displaySideC: Num.format(sideC),
        mode: "findAngle",
        solutions: 1,
        warning: null
      };
    }

    const A1_Deg = MathUtil.radToDeg(Math.asin(sinA_val));
    const A2_Deg = 180 - A1_Deg;

    const solutions = [];

    // Solution 1: A1
    const C1_Deg = 180 - A1_Deg - numB;
    if (C1_Deg > 0) {
      const sinC1 = Math.sin(MathUtil.degToRad(C1_Deg));
      const sideC1 = numSideB * sinC1 / sinB;
      solutions.push({
        angleA: A1_Deg, displayAngleA: Num.format(A1_Deg) + "\u00B0",
        angleC: C1_Deg, displayAngleC: Num.format(C1_Deg) + "\u00B0",
        sideC: sideC1, displaySideC: Num.format(sideC1)
      });
    }

    // Solution 2: A2 (supplementary angle)
    const C2_Deg = 180 - A2_Deg - numB;
    if (C2_Deg > 0 && A2_Deg !== A1_Deg) {
      const sinC2 = Math.sin(MathUtil.degToRad(C2_Deg));
      const sideC2 = numSideB * sinC2 / sinB;
      solutions.push({
        angleA: A2_Deg, displayAngleA: Num.format(A2_Deg) + "\u00B0",
        angleC: C2_Deg, displayAngleC: Num.format(C2_Deg) + "\u00B0",
        sideC: sideC2, displaySideC: Num.format(sideC2)
      });
    }

    if (solutions.length === 0) {
      return { error: "No valid triangle exists with these values.", solutions: 0 };
    }

    const result = {
      sideA: numSideA, sideB: numSideB, angleB: numB,
      solutions: solutions.length,
      mode: "findAngle",
      warning: solutions.length === 2 ? "AMBIGUOUS CASE (SSA): Two valid triangles exist." : null
    };

    if (solutions.length === 1) {
      result.angleA = solutions[0].angleA;
      result.displayAngleA = solutions[0].displayAngleA;
      result.angleC = solutions[0].angleC;
      result.displayAngleC = solutions[0].displayAngleC;
      result.sideC = solutions[0].sideC;
      result.displaySideC = solutions[0].displaySideC;
    } else {
      result.triangle1 = solutions[0];
      result.triangle2 = solutions[1];
    }

    return result;
  };

  const compute = (mode, inputs) => {
    if (mode === "findSide") {
      return findSide(inputs.angleA, inputs.angleB, inputs.sideB);
    } else {
      return findAngle(inputs.sideA, inputs.sideB, inputs.angleB);
    }
  };

  const buildUI = () => {
    const container = createEl("div", { className: "law-sines-calc" });

    // Mode selector
    const modeGroup = createEl("div", { className: "input-group" });
    const modeLabel = createEl("label", { textContent: "Mode:" });
    const modeSelect = createEl("select", { id: "ls-mode-select" });
    modeSelect.appendChild(createEl("option", { value: "findSide", textContent: "Find side (angle A, angle B, side b)" }));
    modeSelect.appendChild(createEl("option", { value: "findAngle", textContent: "Find angle (side a, side b, angle B)" }));
    modeGroup.appendChild(modeLabel);
    modeGroup.appendChild(modeSelect);
    container.appendChild(modeGroup);

    // Input fields container
    const fieldsDiv = createEl("div", { id: "ls-fields", className: "fields-container" });

    // Find side fields
    const findSideFields = createEl("div", { id: "ls-find-side", className: "field-group" });
    const aDegLabel = createEl("label", { textContent: "Angle A (degrees):" });
    const aDegInput = createEl("input", { type: "number", id: "ls-angle-a", placeholder: "Enter angle A", step: "any", min: "0", max: "180" });
    const bDegLabel = createEl("label", { textContent: "Angle B (degrees):" });
    const bDegInput = createEl("input", { type: "number", id: "ls-angle-b", placeholder: "Enter angle B", step: "any", min: "0", max: "180" });
    const sideBLabel = createEl("label", { textContent: "Side b:" });
    const sideBInput = createEl("input", { type: "number", id: "ls-side-b", placeholder: "Enter side b", step: "any", min: "0" });
    [aDegLabel, aDegInput, bDegLabel, bDegInput, sideBLabel, sideBInput].forEach(el => findSideFields.appendChild(el));
    fieldsDiv.appendChild(findSideFields);

    // Find angle fields
    const findAngleFields = createEl("div", { id: "ls-find-angle", className: "field-group", style: "display:none;" });
    const sideALabel = createEl("label", { textContent: "Side a:" });
    const sideAInput = createEl("input", { type: "number", id: "ls-side-a", placeholder: "Enter side a", step: "any", min: "0" });
    const sideB2Label = createEl("label", { textContent: "Side b:" });
    const sideB2Input = createEl("input", { type: "number", id: "ls-side-b2", placeholder: "Enter side b", step: "any", min: "0" });
    const bDeg2Label = createEl("label", { textContent: "Angle B (degrees):" });
    const bDeg2Input = createEl("input", { type: "number", id: "ls-angle-b2", placeholder: "Enter angle B", step: "any", min: "0", max: "180" });
    [sideALabel, sideAInput, sideB2Label, sideB2Input, bDeg2Label, bDeg2Input].forEach(el => findAngleFields.appendChild(el));
    fieldsDiv.appendChild(findAngleFields);

    container.appendChild(fieldsDiv);

    // Buttons
    const btnGroup = createEl("div", { className: "btn-group" });
    const calcBtn = createEl("button", { id: "ls-calc-btn", className: "btn-primary", textContent: "Calculate" });
    const clearBtn = createEl("button", { id: "ls-clear-btn", className: "btn-secondary", textContent: "Clear" });
    btnGroup.appendChild(calcBtn);
    btnGroup.appendChild(clearBtn);
    container.appendChild(btnGroup);

    // Result
    const resultDiv = createEl("div", { id: "ls-result", className: "result-box", style: "display:none;" });
    container.appendChild(resultDiv);

    // History
    const historyDiv = createEl("div", { id: "ls-history", className: "history-box" });
    const historyTitle = createEl("h3", { textContent: "History" });
    const historyList = createEl("ul", { id: "ls-history-list" });
    historyDiv.appendChild(historyTitle);
    historyDiv.appendChild(historyList);
    container.appendChild(historyDiv);

    return {
      container, modeSelect,
      findSideFields, findAngleFields,
      aDegInput, bDegInput, sideBInput,
      sideAInput, sideB2Input, bDeg2Input,
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
          angleA: ui.aDegInput.value,
          angleB: ui.bDegInput.value,
          sideB: ui.sideBInput.value
        });
      } else {
        result = compute("findAngle", {
          sideA: ui.sideAInput.value,
          sideB: ui.sideB2Input.value,
          angleB: ui.bDeg2Input.value
        });
      }

      if (result.error) {
        ui.resultDiv.style.display = "";
        let html = `<div class="error">${Str.escapeHtml(result.error)}</div>`;
        if (result.solutions === 0 && result.mode === "findAngle") {
          html += `<p class="info">No triangle can be formed with these values.</p>`;
        }
        ui.resultDiv.innerHTML = html;
        return;
      }

      ui.resultDiv.style.display = "";
      let html = `<h3>Result</h3>`;

      if (result.warning) {
        html += `<div class="warning">\u26A0\uFE0F ${Str.escapeHtml(result.warning)}</div>`;
      }

      if (result.mode === "findSide") {
        html += `<p><strong>Given:</strong> A = ${Num.format(result.angleA)}\u00B0, B = ${Num.format(result.angleB)}\u00B0, b = ${Num.format(result.sideB)}</p>`;
        html += `<p><strong>a/sin(A) = b/sin(B) = c/sin(C) = ${result.displayRatio}</strong></p>`;
        html += `<p><strong>Side a = ${result.displaySideA}</strong></p>`;
        html += `<p><strong>Angle C = ${result.displayAngleC}</strong></p>`;
        html += `<p><strong>Side c = ${result.displaySideC}</strong></p>`;
      } else {
        html += `<p><strong>Given:</strong> a = ${Num.format(result.sideA)}, b = ${Num.format(result.sideB)}, B = ${Num.format(result.angleB)}\u00B0</p>`;

        if (result.solutions === 1) {
          html += `<p><strong>Number of solutions: 1</strong></p>`;
          html += `<p><strong>Angle A = ${result.displayAngleA}</strong></p>`;
          html += `<p><strong>Angle C = ${result.displayAngleC}</strong></p>`;
          html += `<p><strong>Side c = ${result.displaySideC}</strong></p>`;
        } else if (result.solutions === 2) {
          html += `<p><strong>Number of solutions: 2</strong></p>`;
          html += `<h4>Triangle 1:</h4>`;
          html += `<p>A\u2081 = ${result.triangle1.displayAngleA}, C\u2081 = ${result.triangle1.displayAngleC}, c\u2081 = ${result.triangle1.displaySideC}</p>`;
          html += `<h4>Triangle 2:</h4>`;
          html += `<p>A\u2082 = ${result.triangle2.displayAngleA}, C\u2082 = ${result.triangle2.displayAngleC}, c\u2082 = ${result.triangle2.displaySideC}</p>`;
        }
      }

      html += `<button class="btn-copy" id="ls-copy-btn">Copy Result</button>`;
      ui.resultDiv.innerHTML = html;

      $("#ls-copy-btn")?.addEventListener("click", () => {
        if (result.mode === "findSide") {
          Clipboard.copy(`Law of Sines: A=${result.angleA}°, B=${result.angleB}°, b=${result.sideB} → a=${result.displaySideA}, C=${result.displayAngleC}, c=${result.displaySideC}`);
        } else {
          Clipboard.copy(`Law of Sines: a=${result.sideA}, b=${result.sideB}, B=${result.angleB}° → ${result.solutions} solution(s)`);
        }
        Toast.show("Result copied!", "success");
      });

      // Save to history
      const history = Storage.get("history", []);
      history.unshift({
        mode: result.mode,
        summary: result.mode === "findSide" ? `a = ${result.displaySideA}` : `${result.solutions} solution(s)`,
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
      [ui.aDegInput, ui.bDegInput, ui.sideBInput, ui.sideAInput, ui.sideB2Input, ui.bDeg2Input].forEach(i => i.value = "");
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
initTool(() => { LawOfSines.init(); });

// Expose for testing / external use
if (typeof window !== "undefined") window.LawOfSines = LawOfSines;
