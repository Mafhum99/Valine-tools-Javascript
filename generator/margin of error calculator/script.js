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
    const nInput = $('#sample-size');
    const modeSelect = $('#mode');
    const stdDevGroup = $('#std-dev-group');
    const stdDevInput = $('#std-dev');
    const proportionGroup = $('#proportion-group');
    const proportionInput = $('#proportion');
    const confidenceSelect = $('#confidence-level');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const outputEl = $('#output');
    const copyBtn = $('#copy');

    const zScores = {
        '90': 1.645,
        '95': 1.96,
        '99': 2.576,
        '99.9': 3.291
    };

    function calculate() {
        const n = parseFloat(nInput.value);
        const mode = modeSelect.value;
        const conf = confidenceSelect.value;
        const Z = zScores[conf];

        if (isNaN(n) || n <= 0) {
            outputEl.textContent = 'Please enter a valid sample size (n > 0)';
            return;
        }

        try {
            let moe;
            if (mode === 'mean') {
                const sigma = parseFloat(stdDevInput.value);
                if (isNaN(sigma)) throw new Error('Please enter a valid standard deviation');
                moe = Z * (sigma / Math.sqrt(n));
            } else {
                const p = parseFloat(proportionInput.value);
                if (isNaN(p) || p < 0 || p > 1) throw new Error('Please enter a valid proportion (0 to 1)');
                moe = Z * Math.sqrt((p * (1 - p)) / n);
            }

            let result = `Margin of Error (MOE): ${moe.toFixed(6)}\n`;
            if (mode === 'proportion') {
                result += `As percentage: ${(moe * 100).toFixed(2)}%\n`;
            }
            result += `Confidence Level: ${conf}%\n`;
            result += `Z-Score: ${Z}\n`;
            result += `Sample Size (n): ${n}`;
            
            outputEl.textContent = result;
        } catch (error) {
            outputEl.innerHTML = `<span style="color:var(--danger)">${error.message}</span>`;
        }
    }

    function clear() {
        nInput.value = '';
        stdDevInput.value = '';
        proportionInput.value = '0.5';
        outputEl.textContent = '-';
        nInput.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.textContent));

    // Handle mode change visibility is already handled in HTML script but let's ensure consistency
    modeSelect.addEventListener('change', () => {
        const mode = modeSelect.value;
        if (mode === 'mean') {
            stdDevGroup.classList.remove('hidden');
            proportionGroup.classList.add('hidden');
        } else {
            stdDevGroup.classList.add('hidden');
            proportionGroup.classList.remove('hidden');
        }
    });
});
