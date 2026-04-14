/* ============================================================
   TOOL 5: Letter Grade Converter
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
    try { const v = localStorage.getItem("letter_grade_" + key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem("letter_grade_" + key, JSON.stringify(value)); } catch {}
  },
  remove(key) { try { localStorage.removeItem("letter_grade_" + key); } catch {} }
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
//  TOOL-SPECIFIC LOGIC: Letter Grade Converter
// ═══════════════════════════════════════════════════════════════

const LetterGrade = (() => {
  // GPA points mapping (standard 4.0 scale)
  const GPA = {
    "A+": 4.0, "A": 4.0, "A-": 3.7,
    "B+": 3.3, "B": 3.0, "B-": 2.7,
    "C+": 2.3, "C": 2.0, "C-": 1.7,
    "D+": 1.3, "D": 1.0, "D-": 0.7,
    "F": 0.0
  };

  // Detailed scale with +/- grades
  const DETAILED_SCALE = [
    { grade: "A+", min: 97, max: 100 },
    { grade: "A",  min: 93, max: 96 },
    { grade: "A-", min: 90, max: 92 },
    { grade: "B+", min: 87, max: 89 },
    { grade: "B",  min: 83, max: 86 },
    { grade: "B-", min: 80, max: 82 },
    { grade: "C+", min: 77, max: 79 },
    { grade: "C",  min: 73, max: 76 },
    { grade: "C-", min: 70, max: 72 },
    { grade: "D+", min: 67, max: 69 },
    { grade: "D",  min: 63, max: 66 },
    { grade: "D-", min: 60, max: 62 },
    { grade: "F",  min: 0,  max: 59 }
  ];

  // Basic scale (no +/-)
  const BASIC_SCALE = [
    { grade: "A", min: 90, max: 100 },
    { grade: "B", min: 80, max: 89 },
    { grade: "C", min: 70, max: 79 },
    { grade: "D", min: 60, max: 69 },
    { grade: "F", min: 0,  max: 59 }
  ];

  const getGrade = (percentage, useDetailed = true) => {
    const num = Num.parseInput(percentage);
    if (!MathUtil.isNumeric(num)) return { error: "Please enter a valid number." };
    if (num < 0 || num > 100) return { error: "Percentage must be between 0 and 100." };

    const scale = useDetailed ? DETAILED_SCALE : BASIC_SCALE;

    for (const entry of scale) {
      if (num >= entry.min && num <= entry.max) {
        return {
          percentage: num,
          grade: entry.grade,
          range: `${entry.min} - ${entry.max}`,
          gpa: GPA[entry.grade] ?? 0,
          useDetailed,
          scale,
          error: null
        };
      }
    }

    // Fallback (should not reach here)
    return { error: "Could not determine grade." };
  };

  const convert = (percentage, useDetailed = true) => {
    return getGrade(percentage, useDetailed);
  };

  const buildUI = () => {
    const container = createEl("div", { className: "letter-grade-calc" });

    // Input group
    const inputGroup = createEl("div", { className: "input-group" });
    const pctLabel = createEl("label", { textContent: "Percentage (0-100):" });
    const pctInput = createEl("input", { type: "number", id: "lg-percentage", placeholder: "Enter percentage", step: "any", min: "0", max: "100" });
    inputGroup.appendChild(pctLabel);
    inputGroup.appendChild(pctInput);
    container.appendChild(inputGroup);

    // Toggle for +/- mode
    const toggleGroup = createEl("div", { className: "toggle-group" });
    const toggleLabel = createEl("label", { textContent: "Grading Mode:" });
    const toggleContainer = createEl("div", { className: "toggle-container" });
    const detailedBtn = createEl("button", { id: "lg-detailed-btn", className: "toggle-btn toggle-active", textContent: "+/- Grades" });
    const basicBtn = createEl("button", { id: "lg-basic-btn", className: "toggle-btn", textContent: "Basic" });
    toggleContainer.appendChild(detailedBtn);
    toggleContainer.appendChild(basicBtn);
    toggleGroup.appendChild(toggleLabel);
    toggleGroup.appendChild(toggleContainer);
    container.appendChild(toggleGroup);

    // Buttons
    const btnGroup = createEl("div", { className: "btn-group" });
    const convertBtn = createEl("button", { id: "lg-convert-btn", className: "btn-primary", textContent: "Convert" });
    const clearBtn = createEl("button", { id: "lg-clear-btn", className: "btn-secondary", textContent: "Clear" });
    btnGroup.appendChild(convertBtn);
    btnGroup.appendChild(clearBtn);
    container.appendChild(btnGroup);

    // Result
    const resultDiv = createEl("div", { id: "lg-result", className: "result-box", style: "display:none;" });
    container.appendChild(resultDiv);

    // Scale reference table
    const tableDiv = createEl("div", { id: "lg-table", className: "table-box" });
    const tableTitle = createEl("h3", { id: "lg-table-title", textContent: "Grading Scale Reference" });
    const table = createEl("table", { className: "grade-table", id: "lg-scale-table" });
    tableDiv.appendChild(tableTitle);
    tableDiv.appendChild(table);
    container.appendChild(tableDiv);

    // History
    const historyDiv = createEl("div", { id: "lg-history", className: "history-box" });
    const historyTitle = createEl("h3", { textContent: "History" });
    const historyList = createEl("ul", { id: "lg-history-list" });
    historyDiv.appendChild(historyTitle);
    historyDiv.appendChild(historyList);
    container.appendChild(historyDiv);

    return {
      container, pctInput,
      detailedBtn, basicBtn,
      convertBtn, clearBtn, resultDiv,
      tableDiv, tableTitle, table, historyList
    };
  };

  const renderScaleTable = (ui, useDetailed) => {
    const scale = useDetailed ? DETAILED_SCALE : BASIC_SCALE;
    ui.table.innerHTML = "";
    const thead = createEl("thead");
    const headerRow = createEl("tr");
    headerRow.appendChild(createEl("th", { textContent: "Grade" }));
    headerRow.appendChild(createEl("th", { textContent: "Percentage Range" }));
    headerRow.appendChild(createEl("th", { textContent: "GPA" }));
    thead.appendChild(headerRow);

    const tbody = createEl("tbody");
    scale.forEach(entry => {
      const row = createEl("tr");
      row.appendChild(createEl("td", { textContent: entry.grade }));
      row.appendChild(createEl("td", { textContent: `${entry.min} - ${entry.max}` }));
      row.appendChild(createEl("td", { textContent: GPA[entry.grade]?.toFixed(1) ?? "0.0" }));
      tbody.appendChild(row);
    });

    ui.table.appendChild(thead);
    ui.table.appendChild(tbody);
    ui.tableTitle.textContent = useDetailed ? "+/- Grading Scale Reference" : "Basic Grading Scale Reference";
  };

  const attachEvents = (ui) => {
    let useDetailed = true;

    const setMode = (detailed) => {
      useDetailed = detailed;
      ui.detailedBtn.classList.toggle("toggle-active", detailed);
      ui.basicBtn.classList.toggle("toggle-active", !detailed);
      renderScaleTable(ui, detailed);
    };

    ui.detailedBtn.addEventListener("click", () => setMode(true));
    ui.basicBtn.addEventListener("click", () => setMode(false));

    // Load saved mode
    const savedMode = Storage.get("mode", "detailed");
    setMode(savedMode === "detailed");

    const doConvert = () => {
      const result = convert(ui.pctInput.value, useDetailed);

      if (result.error) {
        ui.resultDiv.style.display = "";
        ui.resultDiv.innerHTML = `<div class="error">${Str.escapeHtml(result.error)}</div>`;
        return;
      }

      ui.resultDiv.style.display = "";

      // Grade color based on performance
      const gradeColor = result.gpa >= 3.7 ? "#2ecc71" : result.gpa >= 2.7 ? "#f39c12" : result.gpa >= 1.0 ? "#e67e22" : "#e74c3c";

      let html = `<h3>Result</h3>`;
      html += `<div class="grade-display" style="border-color:${gradeColor}">`;
      html += `<span class="grade-letter" style="color:${gradeColor}">${result.grade}</span>`;
      html += `</div>`;
      html += `<p><strong>Percentage:</strong> ${Num.format(result.percentage)}%</p>`;
      html += `<p><strong>Range:</strong> ${result.range}</p>`;
      html += `<p><strong>GPA Points:</strong> ${result.gpa.toFixed(1)} / 4.0</p>`;

      // Progress bar
      const pct = result.percentage;
      html += `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${gradeColor}"></div><span class="progress-label">${pct}%</span></div>`;

      html += `<button class="btn-copy" id="lg-copy-btn">Copy Result</button>`;
      ui.resultDiv.innerHTML = html;

      $("#lg-copy-btn")?.addEventListener("click", () => {
        Clipboard.copy(`${result.percentage}% = ${result.grade} (GPA: ${result.gpa.toFixed(1)})`);
        Toast.show("Result copied!", "success");
      });

      // Save to history
      const history = Storage.get("history", []);
      history.unshift({
        percentage: result.percentage,
        grade: result.grade,
        gpa: result.gpa,
        mode: useDetailed ? "detailed" : "basic",
        time: DateUtil.format()
      });
      if (history.length > 20) history.pop();
      Storage.set("history", history);
      renderHistory(ui.historyList);
    };

    ui.convertBtn.addEventListener("click", doConvert);
    ui.pctInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doConvert(); });

    // Live conversion on input (debounced)
    ui.pctInput.addEventListener("input", debounce(() => {
      if (ui.pctInput.value.trim() !== "") doConvert();
    }, 500));

    ui.clearBtn.addEventListener("click", () => {
      ui.pctInput.value = "";
      ui.resultDiv.style.display = "none";
    });

    renderScaleTable(ui, useDetailed);
    renderHistory(ui.historyList);
  };

  const renderHistory = (listEl) => {
    const history = Storage.get("history", []);
    listEl.innerHTML = "";
    if (history.length === 0) {
      listEl.appendChild(createEl("li", { className: "empty", textContent: "No conversions yet." }));
      return;
    }
    history.forEach(h => {
      const li = createEl("li");
      li.innerHTML = `<span class="hist-entry">${Num.format(h.percentage)}% → ${Str.escapeHtml(h.grade)} (GPA: ${h.gpa.toFixed(1)})</span><span class="hist-time">${Str.escapeHtml(h.time)}</span>`;
      listEl.appendChild(li);
    });
  };

  const init = () => {
    const ui = buildUI();
    const mount = document.getElementById("app") || document.body;
    mount.appendChild(ui.container);
    attachEvents(ui);
  };

  return { init, convert, getGrade, DETAILED_SCALE, BASIC_SCALE, GPA };
})();

// Bootstrap
initTool(() => { LetterGrade.init(); });

// Expose for testing / external use
if (typeof window !== "undefined") window.LetterGrade = LetterGrade;
