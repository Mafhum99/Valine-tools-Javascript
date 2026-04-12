// ========================================
// DOM Helpers
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value; else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value); else el.setAttribute(key, value);
    });
    children.forEach(child => { if (typeof child === 'string') el.appendChild(document.createTextNode(child)); else if (child instanceof Node) el.appendChild(child); });
    return el;
}
const Storage = {
    get(key, defaultValue = null) { try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : defaultValue; } catch { return defaultValue; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } },
    remove(key) { localStorage.removeItem(key); }, clear() { localStorage.clear(); }
};
async function copyToClipboard(text) {
    try { await navigator.clipboard.writeText(text); showToast('Copied to clipboard!'); return true; }
    catch { const textarea = document.createElement('textarea'); textarea.value = text; textarea.style.position = 'fixed'; textarea.style.opacity = '0'; document.body.appendChild(textarea); textarea.select(); document.execCommand('copy'); document.body.removeChild(textarea); showToast('Copied to clipboard!'); return true; }
}
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) { toast = createElement('div', { id: 'toast-notification', style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);' }); document.body.appendChild(toast); }
    toast.textContent = message; toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(100px)'; }, duration);
}
function formatNumber(num, decimals = 2) { if (isNaN(num) || num === null) return '0'; return Number(num).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function initTool(toolInfo) { if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`; }

// ========================================
// TOOL LOGIC BELOW
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Letter Grade Converter', icon: '📝' });

    const percentEl = $('#percentage');
    const usePlusMinusEl = $('#use-plus-minus');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    const gradeScale = [
        { min: 97, max: 100, grade: 'A+', gpa: 4.0 },
        { min: 93, max: 96, grade: 'A', gpa: 4.0 },
        { min: 90, max: 92, grade: 'A-', gpa: 3.7 },
        { min: 87, max: 89, grade: 'B+', gpa: 3.3 },
        { min: 83, max: 86, grade: 'B', gpa: 3.0 },
        { min: 80, max: 82, grade: 'B-', gpa: 2.7 },
        { min: 77, max: 79, grade: 'C+', gpa: 2.3 },
        { min: 73, max: 76, grade: 'C', gpa: 2.0 },
        { min: 70, max: 72, grade: 'C-', gpa: 1.7 },
        { min: 67, max: 69, grade: 'D+', gpa: 1.3 },
        { min: 63, max: 66, grade: 'D', gpa: 1.0 },
        { min: 60, max: 62, grade: 'D-', gpa: 0.7 },
        { min: 0, max: 59, grade: 'F', gpa: 0.0 }
    ];

    const basicGradeScale = [
        { min: 93, max: 100, grade: 'A', gpa: 4.0 },
        { min: 83, max: 92, grade: 'B', gpa: 3.0 },
        { min: 73, max: 82, grade: 'C', gpa: 2.0 },
        { min: 63, max: 72, grade: 'D', gpa: 1.0 },
        { min: 0, max: 62, grade: 'F', gpa: 0.0 }
    ];

    function getGrade(percent, usePlusMinus) {
        const scale = usePlusMinus ? gradeScale : basicGradeScale;
        for (const entry of scale) {
            if (percent >= entry.min && percent <= entry.max) return entry;
        }
        return scale[scale.length - 1];
    }

    function calculate() {
        const percent = parseFloat(percentEl.value);
        const usePlusMinus = usePlusMinusEl.checked;

        if (isNaN(percent)) { outputEl.textContent = 'Error: Please enter a valid number'; return; }
        if (percent < 0 || percent > 100) { outputEl.textContent = 'Error: Percentage must be between 0 and 100'; return; }

        const gradeInfo = getGrade(percent, usePlusMinus);
        const isPassing = gradeInfo.grade !== 'F';

        let html = `<div class="result-main">Grade: <strong>${gradeInfo.grade}</strong></div>`;
        html += `<div class="result-detail">GPA: <strong>${gradeInfo.gpa.toFixed(1)}</strong></div>`;
        html += `<div class="result-detail">Percentage: ${percent}%</div>`;
        html += `<div class="result-detail">Status: ${isPassing ? '<span class="result-passing">Passing</span>' : '<span class="result-failing">Failing</span>'}</div>`;

        outputEl.innerHTML = html;
    }

    function clear() { percentEl.value = ''; outputEl.textContent = '-'; percentEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    percentEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
