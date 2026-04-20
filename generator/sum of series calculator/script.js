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
// Tool Logic
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const seriesType = $('#series-type');
    const standardInputs = $('#standard-inputs');
    const customInput = $('#custom-input');
    const inputA = $('#input-a');
    const inputDiff = $('#input-diff');
    const groupDiff = $('#group-diff');
    const functionExpr = $('#function-expr');
    const startN = $('#start-n');
    const endN = $('#end-n');
    const calculateBtn = $('#calculate-btn');
    const clearBtn = $('#clear-btn');
    const copyBtn = $('#copy-btn');

    const resSum = $('#res-sum');
    const resCount = $('#res-count');
    const resAvg = $('#res-avg');

    seriesType.addEventListener('change', () => {
        const val = seriesType.value;
        if (val === 'custom') {
            standardInputs.style.display = 'none';
            customInput.style.display = 'block';
        } else {
            standardInputs.style.display = 'block';
            customInput.style.display = 'none';
            
            // Adjust standard inputs
            if (val === 'harmonic' || val === 'squares' || val === 'cubes') {
                $('#group-a').style.display = 'none';
                groupDiff.style.display = 'none';
            } else if (val === 'arithmetic') {
                $('#group-a').style.display = 'block';
                groupDiff.style.display = 'block';
                groupDiff.querySelector('label').textContent = 'Common Difference (d)';
            } else if (val === 'geometric') {
                $('#group-a').style.display = 'block';
                groupDiff.style.display = 'block';
                groupDiff.querySelector('label').textContent = 'Common Ratio (r)';
            }
        }
    });

    function calculate() {
        const type = seriesType.value;
        const start = parseInt(startN.value);
        const end = parseInt(endN.value);
        const a = parseFloat(inputA.value);
        const diff = parseFloat(inputDiff.value);

        if (isNaN(start) || isNaN(end) || start > end) {
            showToast('Invalid range (start must be <= end)');
            return;
        }

        if (end - start > 1000000) {
            showToast('Range too large (max 1 million terms)');
            return;
        }

        let totalSum = 0;
        let count = 0;

        try {
            let f;
            switch (type) {
                case 'arithmetic': f = (n) => a + (n - 1) * diff; break;
                case 'geometric': f = (n) => a * Math.pow(diff, n - 1); break;
                case 'harmonic': f = (n) => (n === 0 ? 0 : 1 / n); break;
                case 'squares': f = (n) => n * n; break;
                case 'cubes': f = (n) => n * n * n; break;
                case 'custom':
                    // Safe evaluation using new Function
                    const expr = functionExpr.value.replace(/Math\./g, '').replace(/(abs|acos|asin|atan|atan2|ceil|cos|exp|floor|log|max|min|pow|random|round|sin|sqrt|tan|PI|E)/g, 'Math.$1');
                    f = new Function('n', `try { return ${expr}; } catch(e) { return 0; }`);
                    break;
            }

            for (let n = start; n <= end; n++) {
                const val = f(n);
                if (!isNaN(val) && isFinite(val)) {
                    totalSum += val;
                }
                count++;
            }

            resSum.textContent = totalSum.toLocaleString('en-US');
            resCount.textContent = count.toLocaleString('en-US');
            resAvg.textContent = (totalSum / count).toLocaleString('en-US', { maximumFractionDigits: 4 });

        } catch (error) {
            showToast('Error in calculation or function expression');
            console.error(error);
        }
    }

    function clear() {
        startN.value = '1';
        endN.value = '10';
        inputA.value = '1';
        inputDiff.value = '1';
        functionExpr.value = 'n';
        resSum.textContent = '-';
        resCount.textContent = '-';
        resAvg.textContent = '-';
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    copyBtn.addEventListener('click', () => {
        if (resSum.textContent === '-') return;
        copyToClipboard(`Series Sum: ${resSum.textContent}\nTerms: ${resCount.textContent}\nAverage: ${resAvg.textContent}`);
    });
});
