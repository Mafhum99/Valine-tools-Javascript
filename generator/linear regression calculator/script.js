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
function formatNumber(num, decimals = 4) {
    if (isNaN(num) || num === null) return '0';
    if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
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
 * Linear Regression Calculator
 * Calculate best fit line y = mx + b
 */

document.addEventListener('DOMContentLoaded', () => {
    initTool({ name: 'Linear Regression Calculator', icon: '📈' });

    const dataPointsEl = $('#data-points');
    const predictionXEl = $('#prediction-x');
    const calculateBtn = $('#calculate');
    const clearBtn = $('#clear');
    const copyBtn = $('#copy');
    const outputEl = $('#output');

    function calculate() {
        const input = dataPointsEl.value.trim();
        if (!input) {
            outputEl.innerHTML = '<p style="color:#ef4444;">Please enter data points (x, y per line)</p>';
            return;
        }

        const lines = input.split('\n');
        const xValues = [];
        const yValues = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(/[,\s\t]+/).map(p => parseFloat(p.trim()));
            if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
                outputEl.innerHTML = `<p style="color:#ef4444;">Invalid data on line ${i + 1}: "${line}"</p>`;
                return;
            }
            xValues.push(parts[0]);
            yValues.push(parts[1]);
        }

        const n = xValues.length;
        if (n < 2) {
            outputEl.innerHTML = '<p style="color:#ef4444;">At least 2 data points are required</p>';
            return;
        }

        try {
            let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0, sumYY = 0;
            for (let i = 0; i < n; i++) {
                sumX += xValues[i];
                sumY += yValues[i];
                sumXY += xValues[i] * yValues[i];
                sumXX += xValues[i] * xValues[i];
                sumYY += yValues[i] * yValues[i];
            }

            const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
            const intercept = (sumY - slope * sumX) / n;

            // Correlation coefficient r
            const rNumerator = (n * sumXY - sumX * sumY);
            const rDenominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
            const r = rDenominator !== 0 ? rNumerator / rDenominator : 0;
            const rSquared = r * r;

            let predictionHtml = '';
            const predX = parseFloat(predictionXEl.value);
            if (!isNaN(predX)) {
                const predY = slope * predX + intercept;
                predictionHtml = `
                    <div style="margin-top:1rem;padding:0.75rem;background:#eff6ff;border-radius:0.5rem;border-left:4px solid #3b82f6;">
                        <div style="font-size:0.75rem;color:#6b7280;text-transform:uppercase;font-weight:600;">Prediction</div>
                        <div style="font-size:1.125rem;font-weight:700;color:#1e40af;">For x = ${formatNumber(predX)}, predicted y = ${formatNumber(predY)}</div>
                    </div>
                `;
            }

            outputEl.innerHTML = `
                <div style="text-align:center;margin-bottom:1rem;">
                    <div style="font-size:0.875rem;color:#6b7280;">Regression Equation</div>
                    <div style="font-size:1.75rem;font-weight:800;color:#2563eb;margin:0.25rem 0;">y = ${formatNumber(slope)}x + ${formatNumber(intercept)}</div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
                    <div style="padding:0.75rem;background:#f9fafb;border-radius:0.5rem;text-align:center;">
                        <div style="font-size:0.625rem;color:#9ca3af;text-transform:uppercase;">Correlation (r)</div>
                        <div style="font-size:1.125rem;font-weight:700;color:#111827;">${formatNumber(r)}</div>
                    </div>
                    <div style="padding:0.75rem;background:#f9fafb;border-radius:0.5rem;text-align:center;">
                        <div style="font-size:0.625rem;color:#9ca3af;text-transform:uppercase;">R-Squared (r²)</div>
                        <div style="font-size:1.125rem;font-weight:700;color:#111827;">${formatNumber(rSquared)}</div>
                    </div>
                    <div style="padding:0.75rem;background:#f9fafb;border-radius:0.5rem;text-align:center;">
                        <div style="font-size:0.625rem;color:#9ca3af;text-transform:uppercase;">Slope (m)</div>
                        <div style="font-size:1.125rem;font-weight:700;color:#111827;">${formatNumber(slope)}</div>
                    </div>
                    <div style="padding:0.75rem;background:#f9fafb;border-radius:0.5rem;text-align:center;">
                        <div style="font-size:0.625rem;color:#9ca3af;text-transform:uppercase;">Intercept (b)</div>
                        <div style="font-size:1.125rem;font-weight:700;color:#111827;">${formatNumber(intercept)}</div>
                    </div>
                </div>
                ${predictionHtml}
                <div style="font-size:0.625rem;color:#9ca3af;margin-top:1rem;text-align:center;">
                    Based on ${n} data points
                </div>
            `;
        } catch (error) {
            outputEl.innerHTML = `<p style="color:#ef4444;">Error: ${error.message}</p>`;
        }
    }

    function clear() {
        dataPointsEl.value = '';
        predictionXEl.value = '';
        outputEl.innerHTML = '-';
        dataPointsEl.focus();
    }

    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clear);

    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = outputEl.innerText.trim();
            if (text === '-') return;
            const eq = text.split('\n').find(l => l.includes('y =')) || '';
            copyToClipboard(`Linear Regression: ${eq}`);
        });
    }

    predictionXEl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
});
