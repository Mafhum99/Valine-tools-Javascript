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
    const caloriesInput = $('#total-calories');
    const proteinInput = $('#protein-pct');
    const carbsInput = $('#carbs-pct');
    const fatInput = $('#fat-pct');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const outputEl = $('#output');
    const copyBtn = $('#copy');

    function calculate() {
        const kcal = parseFloat(caloriesInput.value);
        const pPct = parseFloat(proteinInput.value);
        const cPct = parseFloat(carbsInput.value);
        const fPct = parseFloat(fatInput.value);

        if (isNaN(kcal) || isNaN(pPct) || isNaN(cPct) || isNaN(fPct)) {
            outputEl.textContent = 'Please enter valid numbers for all fields';
            return;
        }

        if (Math.abs(pPct + cPct + fPct - 100) > 0.01) {
            outputEl.innerHTML = '<span style="color:var(--danger)">Total percentage must equal 100% (currently ' + (pPct + cPct + fPct) + '%)</span>';
            return;
        }

        const proteinGrams = (kcal * (pPct / 100)) / 4;
        const carbsGrams = (kcal * (cPct / 100)) / 4;
        const fatGrams = (kcal * (fPct / 100)) / 9;

        const proteinKcal = kcal * (pPct / 100);
        const carbsKcal = kcal * (cPct / 100);
        const fatKcal = kcal * (fPct / 100);

        outputEl.innerHTML = `
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem; text-align: left;">
                <div style="padding: 0.75rem; background: #f0fdf4; border-radius: 0.5rem; border-left: 4px solid #16a34a;">
                    <div style="font-weight: bold; color: #16a34a;">Protein</div>
                    <div style="font-size: 1.25rem; font-weight: bold;">${proteinGrams.toFixed(1)}g</div>
                    <div style="font-size: 0.875rem; color: #666;">${proteinKcal.toFixed(0)} kcal</div>
                </div>
                <div style="padding: 0.75rem; background: #eff6ff; border-radius: 0.5rem; border-left: 4px solid #2563eb;">
                    <div style="font-weight: bold; color: #2563eb;">Carbohydrates</div>
                    <div style="font-size: 1.25rem; font-weight: bold;">${carbsGrams.toFixed(1)}g</div>
                    <div style="font-size: 0.875rem; color: #666;">${carbsKcal.toFixed(0)} kcal</div>
                </div>
                <div style="padding: 0.75rem; background: #fff7ed; border-radius: 0.5rem; border-left: 4px solid #ea580c;">
                    <div style="font-weight: bold; color: #ea580c;">Fat</div>
                    <div style="font-size: 1.25rem; font-weight: bold;">${fatGrams.toFixed(1)}g</div>
                    <div style="font-size: 0.875rem; color: #666;">${fatKcal.toFixed(0)} kcal</div>
                </div>
                <div style="padding: 0.75rem; background: #f3f4f6; border-radius: 0.5rem; border-left: 4px solid #374151;">
                    <div style="font-weight: bold; color: #374151;">Total</div>
                    <div style="font-size: 1.25rem; font-weight: bold;">${kcal.toFixed(0)} kcal</div>
                    <div style="font-size: 0.875rem; color: #666;">100%</div>
                </div>
            </div>
        `;
    }

    function clear() {
        caloriesInput.value = '';
        proteinInput.value = '';
        carbsInput.value = '';
        fatInput.value = '';
        outputEl.textContent = '-';
        caloriesInput.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    if (copyBtn) copyBtn.addEventListener('click', () => copyToClipboard(outputEl.innerText));
});
