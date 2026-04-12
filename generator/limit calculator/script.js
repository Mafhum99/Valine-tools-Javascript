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
    initTool({ name: 'Limit Calculator', icon: '∫' });

    const funcEl = $('#function');
    const xEl = $('#x-value');
    const directionEl = $('#direction');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function safeEval(expr, x) {
        expr = expr.replace(/\^/g, '**');
        expr = expr.replace(/sin\(/g, 'Math.sin(');
        expr = expr.replace(/cos\(/g, 'Math.cos(');
        expr = expr.replace(/tan\(/g, 'Math.tan(');
        expr = expr.replace(/asin\(/g, 'Math.asin(');
        expr = expr.replace(/acos\(/g, 'Math.acos(');
        expr = expr.replace(/atan\(/g, 'Math.atan(');
        expr = expr.replace(/sqrt\(/g, 'Math.sqrt(');
        expr = expr.replace(/abs\(/g, 'Math.abs(');
        expr = expr.replace(/log\(/g, 'Math.log(');
        expr = expr.replace(/ln\(/g, 'Math.log(');
        expr = expr.replace(/log10\(/g, 'Math.log10(');
        expr = expr.replace(/exp\(/g, 'Math.exp(');
        expr = expr.replace(/pi/gi, 'Math.PI');
        expr = expr.replace(/(?<![.])e(?![a-zA-Z])/g, 'Math.E');
        try { return new Function('x', 'return ' + expr)(x); } catch { return NaN; }
    }

    function calculate() {
        const funcStr = funcEl.value.trim();
        const xVal = parseFloat(xEl.value);
        const direction = directionEl.value;

        if (!funcStr) { outputEl.textContent = 'Error: Please enter a function'; return; }
        if (isNaN(xVal) && xEl.value !== 'inf' && xEl.value !== '-inf') { outputEl.textContent = 'Error: Invalid x value'; return; }

        let html = `<div class="result-detail">f(x) = ${funcStr}</div>`;

        try {
            if (xEl.value === 'inf' || xEl.value === '-inf') {
                const xTarget = xEl.value === 'inf' ? 1e10 : -1e10;
                const result = safeEval(funcStr, xTarget);
                if (isNaN(result) || !isFinite(result)) {
                    html += `<div class="result-main">lim f(x) as x→${xEl.value} = <strong>${isFinite(result) ? formatNumber(result, 6) : (result > 0 ? '∞' : '-∞')}</strong></div>`;
                } else {
                    html += `<div class="result-main">lim f(x) as x→${xEl.value} = <strong>${formatNumber(result, 6)}</strong></div>`;
                }
            } else {
                const h = 1e-8;
                let leftVal, rightVal;

                if (direction === 'left' || direction === 'both') {
                    leftVal = safeEval(funcStr, xVal - h);
                }
                if (direction === 'right' || direction === 'both') {
                    rightVal = safeEval(funcStr, xVal + h);
                }
                if (direction === 'both') {
                    const centerVal = safeEval(funcStr, xVal);
                    const limitApprox = (leftVal + rightVal) / 2;

                    html += `<div class="result-main">lim f(x) as x→${xVal} ≈ <strong>${formatNumber(limitApprox, 6)}</strong></div>`;
                    html += `<div class="result-detail">Left limit (x→${xVal}⁻): ${isFinite(leftVal) ? formatNumber(leftVal, 8) : 'undefined'}</div>`;
                    html += `<div class="result-detail">Right limit (x→${xVal}⁺): ${isFinite(rightVal) ? formatNumber(rightVal, 8) : 'undefined'}</div>`;
                    if (!isFinite(leftVal) || !isFinite(rightVal)) {
                        html += `<div class="result-detail">Limit may not exist (infinite value)</div>`;
                    } else if (Math.abs(leftVal - rightVal) > 0.001) {
                        html += `<div class="result-detail">⚠️ Left ≠ Right, limit may not exist</div>`;
                    }
                    if (isFinite(centerVal)) {
                        html += `<div class="result-detail">f(${xVal}) = ${formatNumber(centerVal, 6)}</div>`;
                    } else {
                        html += `<div class="result-detail">f(${xVal}) is undefined (hole/asymptote)</div>`;
                    }
                } else if (direction === 'left') {
                    html += `<div class="result-main">lim f(x) as x→${xVal}⁻ = <strong>${isFinite(leftVal) ? formatNumber(leftVal, 6) : '∞ or -∞'}</strong></div>`;
                } else {
                    html += `<div class="result-main">lim f(x) as x→${xVal}⁺ = <strong>${isFinite(rightVal) ? formatNumber(rightVal, 6) : '∞ or -∞'}</strong></div>`;
                }
            }
        } catch (error) {
            html += `<div class="result-main">Error evaluating function: ${error.message}</div>`;
        }

        outputEl.innerHTML = html;
    }

    function clear() { funcEl.value = ''; xEl.value = ''; directionEl.value = 'both'; outputEl.textContent = '-'; funcEl.focus(); }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));
    funcEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
    xEl.addEventListener('keypress', (e) => { if (e.key === 'Enter') calculate(); });
});
