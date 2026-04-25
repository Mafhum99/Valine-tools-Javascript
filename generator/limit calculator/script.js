// ========================================
// DOM Helpers
// ========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
        if (key === 'className') el.className = value;
        else if (key === 'textContent') el.textContent = value;
        else if (key === 'innerHTML') el.innerHTML = value;
        else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
        else el.setAttribute(key, value);
    });
    children.forEach(child => {
        if (typeof child === 'string') el.appendChild(document.createTextNode(child));
        else if (child instanceof Node) el.appendChild(child);
    });
    return el;
}

// ========================================
// Copy to Clipboard
// ========================================
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard!');
        return true;
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!');
        return true;
    }
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, duration = 2000) {
    let toast = $('#toast-notification');
    if (!toast) {
        toast = createElement('div', {
            id: 'toast-notification',
            style: 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(100px);background:#1f2937;color:#fff;padding:0.75rem 1.5rem;border-radius:0.5rem;font-size:0.875rem;z-index:9999;transition:transform 0.3s ease;box-shadow:0 4px 6px rgba(0,0,0,0.1);'
        });
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.transform = 'translateX(-50%) translateY(0)';
    setTimeout(() => {
        toast.style.transform = 'translateX(-50%) translateY(100px)';
    }, duration);
}

// ========================================
// Number Formatting
// ========================================
function formatNumber(num, decimals = 6) {
    if (isNaN(num) || num === null) return 'NaN';
    if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
    if (Math.abs(num) < 1e-10) return '0';
    return Number(num).toFixed(decimals).replace(/\.?0+$/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// ========================================
// Tool Init Helper
// ========================================
function initTool(toolInfo) {
    if (toolInfo?.name) document.title = `${toolInfo.icon || '🛠️'} ${toolInfo.name} - Mini Tools`;
}

// ========================================
// TOOL LOGIC BELOW
// ========================================

/**
 * Limit Calculator
 * Calculate lim(x->a) f(x) numerically
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Limit Calculator', icon: '∫' });

    const funcEl = $('#function');
    const xEl = $('#x-value');
    const directionEl = $('#direction');
    const outputEl = $('#output');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');

    function parseFunction(expr) {
        const sanitized = expr
            .replace(/\^/g, '**')
            .replace(/sin\(/g, 'Math.sin(')
            .replace(/cos\(/g, 'Math.cos(')
            .replace(/tan\(/g, 'Math.tan(')
            .replace(/asin\(/g, 'Math.asin(')
            .replace(/acos\(/g, 'Math.acos(')
            .replace(/atan\(/g, 'Math.atan(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/abs\(/g, 'Math.abs(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/exp\(/g, 'Math.exp(')
            .replace(/pi/gi, `(${Math.PI})`)
            .replace(/(?<![a-zA-Z])e(?![a-zA-Z(])/gi, `(${Math.E})`);

        if (/[;{}[\]`$&|]/.test(sanitized)) throw new Error('Invalid characters');
        if (/window|document|eval|fetch|alert/.test(sanitized)) throw new Error('Forbidden keywords');

        return new Function('x', `try { return (${sanitized}); } catch { return NaN; }`);
    }

    function calculate() {
        const expr = funcEl.value.trim();
        const xTargetStr = xEl.value.trim().toLowerCase();
        const direction = directionEl.value;

        if (!expr) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Please enter a function f(x)</p>';
            return;
        }

        let a;
        if (xTargetStr === 'inf' || xTargetStr === 'infinity' || xTargetStr === 'oo') {
            a = Infinity;
        } else if (xTargetStr === '-inf' || xTargetStr === '-infinity' || xTargetStr === '-oo') {
            a = -Infinity;
        } else {
            a = parseFloat(xTargetStr);
            if (isNaN(a)) {
                outputEl.innerHTML = '<p style="color:#ef4444;">Invalid target value for x</p>';
                return;
            }
        }

        try {
            const f = parseFunction(expr);
            let resultText = '';

            if (a === Infinity) {
                const val = f(1e12);
                resultText = `lim f(x) as x → ∞ = ${formatNumber(val)}`;
            } else if (a === -Infinity) {
                const val = f(-1e12);
                resultText = `lim f(x) as x → -∞ = ${formatNumber(val)}`;
            } else {
                const h = 1e-10;
                let left = NaN, right = NaN;

                if (direction === 'left' || direction === 'both') {
                    left = f(a - h);
                }
                if (direction === 'right' || direction === 'both') {
                    right = f(a + h);
                }

                if (direction === 'both') {
                    if (!isFinite(left) && !isFinite(right) && ((left > 0 && right > 0) || (left < 0 && right < 0))) {
                        resultText = `lim f(x) as x → ${a} = ${left > 0 ? '∞' : '-∞'}`;
                    } else if (Math.abs(left - right) < 1e-5) {
                        resultText = `lim f(x) as x → ${a} ≈ ${formatNumber((left + right) / 2)}`;
                    } else if (isNaN(left) && !isNaN(right)) {
                        resultText = `One-sided limit (right): ${formatNumber(right)}`;
                    } else if (!isNaN(left) && isNaN(right)) {
                        resultText = `One-sided limit (left): ${formatNumber(left)}`;
                    } else {
                        resultText = `Limit may not exist (Left: ${formatNumber(left)}, Right: ${formatNumber(right)})`;
                    }
                } else if (direction === 'left') {
                    resultText = `lim f(x) as x → ${a}⁻ = ${formatNumber(left)}`;
                } else {
                    resultText = `lim f(x) as x → ${a}⁺ = ${formatNumber(right)}`;
                }
            }

            outputEl.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size:0.875rem;color:#6b7280;margin-bottom:0.5rem;">Calculation Result</div>
                    <div style="font-size:1.25rem;font-weight:700;color:#2563eb;">${resultText}</div>
                </div>
            `;

        } catch (error) {
            outputEl.innerHTML = `<p style="color:#ef4444;">Error: ${error.message}</p>`;
        }
    }

    function clear() {
        funcEl.value = '';
        xEl.value = '';
        directionEl.value = 'both';
        outputEl.innerHTML = '-';
        funcEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = outputEl.innerText.trim();
            if (text === '-') return;
            copyToClipboard(`Limit: ${text.split('\n').pop()}`);
        });
    }

    [funcEl, xEl].forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') calculate();
        });
    });
});
