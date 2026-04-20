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
// Math Utilities (Normal Distribution)
// ========================================
function normalCDF(x) {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp(-x * x / 2);
    const prob = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    if (x > 0) return 1 - prob;
    return prob;
}

function inverseNormalCDF(p) {
    // Rational approximation for inverse normal CDF
    const a = [-3.969683028665376e+01,  2.209460984245205e+02, -2.759285104469687e+02,  1.383577518672690e+02, -3.066479806614716e+01,  2.506628277459239e+00];
    const b = [-5.447609879822406e+01,  1.615858368580409e+02, -1.556989798598866e+02,  6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00,  4.374664141464968e+00,  2.938163982698783e+00];
    const d = [ 7.784695709041462e-03,  3.224671290700398e-01,  2.445134137142996e+00,  3.754408661907416e+00];
    const p_low = 0.02425;
    const p_high = 1 - p_low;
    let q, r;

    if (p < p_low) {
        q = Math.sqrt(-2 * Math.log(p));
        return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    } else if (p <= p_high) {
        q = p - 0.5;
        r = q * q;
        return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    } else {
        q = Math.sqrt(-2 * Math.log(1 - p));
        return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
}

// ========================================
// Tool Logic
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const effectInput = $('#effect-size');
    const sampleInput = $('#sample-size');
    const alphaInput = $('#alpha');
    const testTypeSelect = $('#test-type');
    const calculateBtn = $('#calculate-btn');
    const clearBtn = $('#clear-btn');
    const copyBtn = $('#copy-btn');

    const resPower = $('#res-power');
    const resBeta = $('#res-beta');
    const resInterpretation = $('#res-interpretation');

    function calculate() {
        const d = parseFloat(effectInput.value);
        const n = parseInt(sampleInput.value);
        const alpha = parseFloat(alphaInput.value);
        const isTwoTailed = testTypeSelect.value === 'two-tailed';

        if (isNaN(d) || isNaN(n) || isNaN(alpha) || n <= 0 || alpha <= 0 || alpha >= 1) {
            showToast('Please enter valid inputs');
            return;
        }

        // Power calculation for a one-sample z-test (or large sample t-test approximation)
        // Power = P(Z > z_crit - d*sqrt(n))
        const zAlpha = inverseNormalCDF(isTwoTailed ? 1 - alpha / 2 : 1 - alpha);
        const delta = d * Math.sqrt(n);
        
        let power;
        if (isTwoTailed) {
            power = (1 - normalCDF(zAlpha - delta)) + normalCDF(-zAlpha - delta);
        } else {
            power = 1 - normalCDF(zAlpha - delta);
        }

        const beta = 1 - power;

        resPower.textContent = (power * 100).toFixed(2) + '%';
        resBeta.textContent = (beta * 100).toFixed(2) + '%';

        let interpretation = '';
        if (power >= 0.8) interpretation = 'High Power (Strong)';
        else if (power >= 0.5) interpretation = 'Medium Power (Moderate)';
        else interpretation = 'Low Power (Weak)';
        
        resInterpretation.textContent = interpretation;
        resInterpretation.style.color = power >= 0.8 ? 'var(--success)' : (power >= 0.5 ? 'var(--warning)' : 'var(--danger)');
    }

    function clear() {
        effectInput.value = '';
        sampleInput.value = '';
        alphaInput.value = '0.05';
        testTypeSelect.value = 'two-tailed';
        resPower.textContent = '-';
        resBeta.textContent = '-';
        resInterpretation.textContent = '-';
        resInterpretation.style.color = 'inherit';
        effectInput.focus();
    }

    function copyResults() {
        if (resPower.textContent === '-') return;
        
        const text = `Statistical Power Results:
Effect Size (d): ${effectInput.value}
Sample Size (n): ${sampleInput.value}
Alpha: ${alphaInput.value}
Test Type: ${testTypeSelect.value}
---
Power: ${resPower.textContent}
Beta (Type II Error): ${resBeta.textContent}
Interpretation: ${resInterpretation.textContent}`;
        
        copyToClipboard(text);
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);
    copyBtn.addEventListener('click', copyResults);
});
